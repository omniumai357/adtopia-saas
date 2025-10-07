// Enhanced stripe-webhook with bulletproof idempotency
import { createClient } from "npm:@supabase/supabase-js@2.56.1";
import crypto from "node:crypto";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "stripe-webhook-hardened" } },
});

// Stripe signature verification
function verifyStripeSignature(req: Request, rawBody: Uint8Array, secret: string): boolean {
  const sigHeader = req.headers.get("stripe-signature");
  if (!sigHeader) return false;
  
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=", 2) as [string, string]));
  const t = parts["t"]; 
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  
  const signedPayload = new TextEncoder().encode(`${t}.${new TextDecoder().decode(rawBody)}`);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signedPayload);
  const digest = hmac.digest("hex");
  
  // Constant-time comparison
  if (v1.length !== digest.length) return false;
  let mismatch = 0;
  for (let i = 0; i < v1.length; i++) mismatch |= v1.charCodeAt(i) ^ digest.charCodeAt(i);
  return mismatch === 0;
}

// Determine access level from amount (same logic as your pricing)
function determineAccessLevel(amount: number): string {
  if (amount >= 29700) return 'FULL';    // $297+
  if (amount >= 14900) return 'PRO';     // $149+
  if (amount >= 7900) return 'GROWTH';   // $79+
  if (amount >= 2900) return 'STARTER';  // $29+
  return 'STARTER';
}

// Idempotent user access upsert
async function upsertUserAccess(userId: string, accessLevel: string, eventId: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new Error("Invalid UUID format");
  }

  // Upsert user access
  const { error: accessError } = await supabase
    .from("user_access")
    .upsert({
      user_id: userId,
      access_level: accessLevel,
      updated_at: new Date().toISOString(),
      stripe_event_id: eventId
    }, {
      onConflict: "user_id"
    });

  if (accessError) throw accessError;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Read raw body for signature verification
    const rawBody = new Uint8Array(await req.arrayBuffer());

    // Verify Stripe signature
    if (!STRIPE_WEBHOOK_SECRET || !verifyStripeSignature(req, rawBody, STRIPE_WEBHOOK_SECRET)) {
      console.error("❌ Invalid Stripe signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(new TextDecoder().decode(rawBody));
    
    // IDEMPOTENCY CHECK: Ensure event is processed only once
    const { data: existingEvent, error: checkError } = await supabase
      .from("stripe_events_processed")
      .select("event_id")
      .eq("event_id", event.id)
      .single();

    if (existingEvent) {
      console.log(`✅ Event ${event.id} already processed - returning 200`);
      return new Response(JSON.stringify({ received: true, already_processed: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Process specific event types only
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object ?? {};
      const metadata = session.metadata ?? {};
      const userId = metadata.user_id as string | undefined;
      const amountTotal = session.amount_total || 0;
      
      if (!userId) {
        console.warn(`⚠️ Missing user_id in session metadata for event ${event.id}`);
        
        // Still record as processed to prevent retries
        await supabase.from("stripe_events_processed").insert({
          event_id: event.id,
          event_type: event.type,
          processed_at: new Date().toISOString(),
          amount_cents: amountTotal
        });
        
        return new Response(JSON.stringify({ received: true, warning: "Missing user_id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Determine access level from payment amount
      const accessLevel = metadata.access_level || determineAccessLevel(amountTotal);

      try {
        // Record event as processed FIRST (idempotency)
        const { error: processError } = await supabase
          .from("stripe_events_processed")
          .insert({
            event_id: event.id,
            event_type: event.type,
            processed_at: new Date().toISOString(),
            user_id: userId,
            access_level: accessLevel,
            amount_cents: amountTotal
          });

        if (processError) {
          // If this fails due to duplicate, that's fine - return success
          if (processError.code === '23505') {
            console.log(`✅ Event ${event.id} already being processed - concurrent request`);
            return new Response(JSON.stringify({ received: true, concurrent: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
          throw processError;
        }

        // Now safely upsert user access
        await upsertUserAccess(userId, accessLevel, event.id);

        console.log(`✅ Processed checkout: ${userId} → ${accessLevel} ($${amountTotal/100})`);

        return new Response(JSON.stringify({ 
          received: true, 
          processed: true,
          user_id: userId,
          access_level: accessLevel
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });

      } catch (processingError) {
        console.error(`❌ Error processing ${event.id}:`, processingError);
        
        // Clean up processed event record on failure
        await supabase
          .from("stripe_events_processed")
          .delete()
          .eq("event_id", event.id);
        
        return new Response("Processing Error", { status: 500 });
      }
    }

    // Unknown event types - acknowledge but don't process
    await supabase.from("stripe_events_processed").insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("💥 Fatal webhook error:", error);
    return new Response("Internal Error", { status: 500 });
  }
});
