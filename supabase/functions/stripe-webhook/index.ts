import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.1";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !endpointSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
        
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;
        
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;
        
      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("Processing checkout completion for session:", session.id);
  
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.customer_email)
    .single();

  if (userError || !user) {
    console.error("User not found:", userError);
    return;
  }

  // Get package details from metadata
  const packageId = session.metadata?.package_id;
  const amountCents = session.amount_total || 0;

  const { error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      package_id: packageId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_cents: amountCents,
      status: "completed",
      completed_at: new Date().toISOString()
    });

  if (purchaseError) {
    console.error("Error creating purchase record:", purchaseError);
  } else {
    console.log("Purchase record created successfully");
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Payment succeeded:", paymentIntent.id);
  
  const { error } = await supabase
    .from("purchases")
    .update({ 
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Error updating purchase status:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Payment failed:", paymentIntent.id);
  
  const { error } = await supabase
    .from("purchases")
    .update({ status: "failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Error updating purchase status:", error);
  }
}
