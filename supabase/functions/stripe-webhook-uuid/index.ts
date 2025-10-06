import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.1";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      throw new Error("Missing Stripe signature or webhook secret");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type} (ID: ${event.id})`);

    // CRITICAL: Check idempotency to prevent duplicate processing
    const { data: existingEvent, error: idempotencyError } = await supabaseClient
      .from("webhook_events")
      .select("id, processed")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (idempotencyError) {
      console.error("Error checking idempotency:", idempotencyError);
      throw new Error("Failed to check event idempotency");
    }

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ 
        received: true, 
        idempotent: true,
        message: "Event already processed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark event as being processed
    const { error: markProcessingError } = await supabaseClient
      .from("webhook_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        processed: false,
        created_at: new Date().toISOString()
      });

    if (markProcessingError) {
      console.error("Error marking event as processing:", markProcessingError);
      throw new Error("Failed to mark event as processing");
    }

    // Process the event
    let processingSuccess = false;
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(event.data.object, supabaseClient);
          break;
        case "invoice.payment_succeeded":
          await handlePaymentSucceeded(event.data.object, supabaseClient);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      processingSuccess = true;
    } catch (processingError) {
      console.error("Error processing event:", processingError);
      throw processingError;
    } finally {
      // Mark event as processed (success or failure)
      const { error: markProcessedError } = await supabaseClient
        .from("webhook_events")
        .update({ 
          processed: true,
          processed_at: new Date().toISOString(),
          success: processingSuccess
        })
        .eq("stripe_event_id", event.id);

      if (markProcessedError) {
        console.error("Error marking event as processed:", markProcessedError);
      }
    }

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      event_id: event.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  const { customer_details, metadata, amount_total, currency, id: stripe_session_id } = session;
  
  if (!customer_details?.email) {
    console.log("No customer email found in session");
    return;
  }

  const customerEmail = customer_details.email;
  console.log(`Processing checkout for email: ${customerEmail}`);

  try {
    // 1. Fetch UUID by email
    const { data: userData, error: userError } = await supabaseClient
      .from("auth.users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (userError || !userData) {
      console.log(`No user found for email: ${customerEmail}`);
      return;
    }

    const userId = userData.id;
    console.log(`Found user ID: ${userId}`);

    // 2. Determine access level based on product
    const productName = metadata?.product_name || "STARTER";
    const accessLevel = getAccessLevelFromProduct(productName);

    // 3. Upsert user access
    const { error: accessError } = await supabaseClient
      .from("user_access")
      .upsert({
        user_id: userId,
        access_level: accessLevel,
        updated_at: new Date().toISOString(),
      });

    if (accessError) {
      console.error("Error upserting user access:", accessError);
      return;
    }

    // 4. Grant baseline user role if not exists
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "user",
      }, { onConflict: "user_id,role" });

    if (roleError) {
      console.error("Error granting user role:", roleError);
    }

    // 5. Log purchase
    const { error: purchaseError } = await supabaseClient
      .from("purchases")
      .insert({
        email: customerEmail,
        product: productName,
        price: (amount_total || 0) / 100,
        stripe_session_id: stripe_session_id,
      });

    if (purchaseError) {
      console.error("Error logging purchase:", purchaseError);
    }

    console.log(`Successfully processed checkout for ${customerEmail} with access level: ${accessLevel}`);

  } catch (error) {
    console.error("Error in handleCheckoutCompleted:", error);
  }
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  const { customer_email, amount_paid, currency } = invoice;
  
  if (!customer_email) {
    console.log("No customer email found in invoice");
    return;
  }

  console.log(`Processing payment succeeded for email: ${customer_email}`);

  try {
    // Fetch UUID by email
    const { data: userData, error: userError } = await supabaseClient
      .from("auth.users")
      .select("id")
      .eq("email", customer_email)
      .single();

    if (userError || !userData) {
      console.log(`No user found for email: ${customer_email}`);
      return;
    }

    const userId = userData.id;

    // Update access level based on payment amount
    const accessLevel = getAccessLevelFromAmount(amount_paid);

    const { error: accessError } = await supabaseClient
      .from("user_access")
      .upsert({
        user_id: userId,
        access_level: accessLevel,
        updated_at: new Date().toISOString(),
      });

    if (accessError) {
      console.error("Error updating user access:", accessError);
    } else {
      console.log(`Updated access level for ${customer_email} to: ${accessLevel}`);
    }

  } catch (error) {
    console.error("Error in handlePaymentSucceeded:", error);
  }
}

function getAccessLevelFromProduct(productName: string): string {
  const product = productName.toLowerCase();
  
  if (product.includes("starter") || product.includes("preview")) {
    return "STARTER";
  } else if (product.includes("growth") || product.includes("pro")) {
    return "GROWTH";
  } else if (product.includes("full") || product.includes("beta")) {
    return "FULL";
  } else if (product.includes("enterprise")) {
    return "ENTERPRISE";
  }
  
  return "STARTER";
}

function getAccessLevelFromAmount(amountCents: number): string {
  const amount = amountCents / 100;
  
  if (amount >= 297) {
    return "FULL";
  } else if (amount >= 149) {
    return "GROWTH";
  } else if (amount >= 29) {
    return "STARTER";
  }
  
  return "STARTER";
}
