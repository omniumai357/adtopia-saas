// supabase/functions/omnia-shared/stripe-create-product/index.ts
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Environment variables pulled from Supabase Edge runtime
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env vars");
  throw new Error("Missing required env vars");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type ProductSpec = {
  name: string;
  price_usd: number;
  type: string;
  metadata?: Record<string, string>;
  project?: "adtopia" | "bizbox";
  features?: string[];
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const products: ProductSpec[] = Array.isArray(body) ? body : [body];

    const results: any[] = [];
    for (const spec of products) {
      const { name, price_usd, type, metadata = {}, features = [], project = "adtopia" } = spec;

      // --- Stripe Product Creation ---
      const product = await stripe.products.create({
        name,
        type: "good",
        description: features.join(" • "),
        metadata: {
          ...metadata,
          project,
          created_via: "edge-function",
          created_by: "auto-logger",
        },
      });

      const price = await stripe.prices.create({
        unit_amount: Math.round(price_usd * 100),
        currency: "usd",
        product: product.id,
      });

      // --- Logging into Supabase ---
      const { error } = await supabase.from("stripe_products_log").insert({
        project,
        stripe_product_id: product.id,
        name: product.name,
        price_usd,
        metadata,
      });
      if (error) console.error("DB log insert failed:", error);

      results.push({
        project,
        stripe_product_id: product.id,
        price_id: price.id,
        name,
        price_usd,
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
