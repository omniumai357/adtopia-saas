// /omnia-shared/functions/create-products/index.ts
// 🧩 Universal Product Creation Function for all Omnia SaaS projects

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";
import { log, validatePayload } from "./utils.ts";

serve(async (req) => {
  // Add CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const project = url.searchParams.get("project")?.toLowerCase();

    if (!project) {
      return new Response(JSON.stringify({ 
        error: "Missing ?project param",
        available: ["adtopia", "bizbox", "gammaflow", "shieldstaff"]
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY in environment");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Load product configuration from JSON file
    const configFile = `${project}.json`;
    const configPath = new URL(`./${configFile}`, import.meta.url);
    
    let json;
    try {
      const configText = await Deno.readTextFile(configPath);
      json = JSON.parse(configText);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to load config for ${project}`,
          available: ["adtopia", "bizbox", "gammaflow", "shieldstaff"]
        }),
        { status: 400, headers: corsHeaders }
      );
    }

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
      created.push({
        id: product.id,
        name: product.name,
        price: `$${(p.price_cents / 100).toFixed(2)}`,
        metadata: p.metadata,
      });
    }

    await log("✅ Products created", { project, count: created.length });

    return new Response(JSON.stringify({ 
      success: true, 
      project,
      message: `Created ${created.length} products for ${project}`,
      created 
    }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    await log("❌ Error creating products", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
