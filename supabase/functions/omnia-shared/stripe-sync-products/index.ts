// supabase/functions/omnia-shared/stripe-sync-products/index.ts
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// --- Environment ---
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Main ---
Deno.serve(async (_req) => {
  try {
    console.log("🔄 Syncing Stripe products with Supabase log...");

    const allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const list = await stripe.products.list({ limit: 100, starting_after: startingAfter });
      allProducts.push(...list.data);
      hasMore = list.has_more;
      if (list.data.length > 0) startingAfter = list.data[list.data.length - 1].id;
    }

    const logsToInsert = [];

    for (const product of allProducts) {
      const { id, name, description, metadata, created } = product;

      // Check if product is already logged
      const { data: existing, error: fetchErr } = await supabase
        .from("stripe_products_log")
        .select("stripe_product_id")
        .eq("stripe_product_id", id)
        .maybeSingle();

      if (fetchErr) console.error("DB fetch error:", fetchErr);

      if (!existing) {
        logsToInsert.push({
          project: metadata?.project || "adtopia",
          stripe_product_id: id,
          name,
          price_usd: null, // may populate separately via Stripe prices endpoint
          metadata,
          created_at: new Date(created * 1000).toISOString(),
        });
      }
    }

    if (logsToInsert.length > 0) {
      const { error } = await supabase.from("stripe_products_log").insert(logsToInsert);
      if (error) throw error;
      console.log(`✅ Synced ${logsToInsert.length} new products.`);
    } else {
      console.log("✅ No new products to sync.");
    }

    return new Response(JSON.stringify({ success: true, synced: logsToInsert.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
