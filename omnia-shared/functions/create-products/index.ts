// omnia-shared/functions/create-products/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";
import { supabase } from "./supabaseClient.ts";
import { log, validatePayload } from "./utils.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const project = url.searchParams.get("project")?.toLowerCase();

    if (!project) {
      return new Response(JSON.stringify({ error: "Missing ?project param" }), { status: 400 });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY in environment");

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

    const configUrl = `./${project}.json`;
    const json = await fetch(configUrl).then((r) => r.json());
    validatePayload(json);

    const created: any[] = [];

    for (const p of json.products) {
      const product = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: p.metadata,
        default_price_data: {
          currency: "usd",
          unit_amount: p.price_cents,
        },
      });

      const logEntry = {
        project,
        stripe_product_id: product.id,
        name: product.name,
        price_usd: p.price_cents / 100,
        metadata: product.metadata,
      };

      const { error } = await supabase.from("stripe_products_log").insert([logEntry]);
      if (error) {
        console.error("⚠️ Supabase logging error:", error.message);
      }

      created.push({
        id: product.id,
        name: product.name,
        price_usd: (p.price_cents / 100).toFixed(2),
        log_id: product.id,
      });
    }

    await log("✅ Products created & logged", { project, count: created.length });

    return new Response(JSON.stringify({ success: true, created }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    await log("❌ Error creating products", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
