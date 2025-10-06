// create-products Edge Function (Fixed for Static Generation)
// 📦 Creates the 9 AdTopia product packages automatically in your Stripe account.
// ✨ Fixed Supabase client creation for static generation compatibility

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  price: number;
}

interface CreateProductResult {
  success: boolean;
  productId?: string;
  name: string;
  price: string;
  status: 'created' | 'exists' | 'failed';
  error?: string;
}

// Lazy Supabase client creation to avoid static generation issues
let supabaseClient: any = null;

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("Supabase credentials not available - logging disabled");
    return null;
  }
  
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.38.0");
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    return supabaseClient;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
}

serve(async (req) => {
  // Environment validation
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const TEST_MODE = Deno.env.get("TEST_MODE") === "true";
  const CURRENCY = Deno.env.get("CURRENCY") || "usd";

  if (!STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing STRIPE_SECRET_KEY in environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Initialize Stripe
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  // Get Supabase client (conditionally)
  const supabase = await getSupabaseClient();

  // Canonical AdTopia product data
  const products: ProductConfig[] = [
    {
      name: "Starter Package",
      description: "7-day live preview • QR code ready • Mobile responsive",
      metadata: { package_type: "starter", category: "ad_package", internal_id: "001" },
      price: 2900,
    },
    {
      name: "Growth Package",
      description: "30-day extended preview • Domain hold • SSL setup • Email support",
      metadata: { package_type: "growth", category: "ad_package", internal_id: "002" },
      price: 7900,
    },
    {
      name: "Pro Package",
      description: "Dual-language ads • Priority setup • Advanced analytics • Phone support",
      metadata: { package_type: "pro", category: "ad_package", internal_id: "003" },
      price: 14900,
    },
    {
      name: "Full Beta Package",
      description: "5 custom SEO ad cards • 12 months hosting • Free domain + SSL • Dual-language support • Premium analytics/support",
      metadata: { package_type: "full_beta", category: "ad_package", internal_id: "004" },
      price: 29700,
    },
    {
      name: "Extra Translation",
      description: "Add a translated ad card • Reach bilingual markets",
      metadata: { package_type: "translation", category: "add_on", internal_id: "005" },
      price: 2900,
    },
    {
      name: "Domain + SSL",
      description: "Professional domain • SSL encryption • 1-year included",
      metadata: { package_type: "domain_ssl", category: "add_on", internal_id: "006" },
      price: 4900,
    },
    {
      name: "Extra Cards",
      description: "Add more ad cards • Expand campaigns",
      metadata: { package_type: "extra_cards", category: "add_on", internal_id: "007" },
      price: 3900,
    },
    {
      name: "Premium Analytics",
      description: "Advanced tracking • Conversion metrics",
      metadata: { package_type: "analytics", category: "add_on", internal_id: "008" },
      price: 1900,
    },
    {
      name: "Social Media Pack",
      description: "Facebook + Instagram ready • Craigslist optimized • One-click sharing",
      metadata: { package_type: "social_pack", category: "add_on", internal_id: "009" },
      price: 3500,
    },
  ];

  // Helper: Check if product exists (idempotency)
  async function checkProductExists(internalId: string): Promise<string | null> {
    try {
      const existingProducts = await stripe.products.list({ limit: 100 });
      const found = existingProducts.data.find(p => p.metadata?.internal_id === internalId);
      return found?.id || null;
    } catch (error) {
      console.error(`Error checking product ${internalId}:`, error);
      return null;
    }
  }

  // Helper: Log to Supabase (with fallback)
  async function logToSupabase(productData: ProductConfig, result: CreateProductResult): Promise<void> {
    if (!supabase) {
      console.log(`[LOG] ${result.status.toUpperCase()}: ${productData.name} - ${result.productId || result.error}`);
      return;
    }

    try {
      const { error } = await supabase.from("stripe_products_log").insert({
        internal_id: productData.metadata.internal_id,
        product_name: productData.name,
        stripe_product_id: result.productId,
        status: result.status,
        error_message: result.error,
        price_cents: productData.price,
        currency: CURRENCY,
        test_mode: TEST_MODE,
        project: "adtopia",
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase logging error:", error);
      }
    } catch (error) {
      console.error("Failed to log to Supabase:", error);
    }
  }

  // Helper: Create single product
  async function createSingleProduct(productConfig: ProductConfig): Promise<CreateProductResult> {
    const { name, description, metadata, price } = productConfig;
    
    try {
      // Idempotency check
      const existingId = await checkProductExists(metadata.internal_id);
      
      if (existingId) {
        console.log(`✓ Product exists: ${name} (${existingId})`);
        return {
          success: true,
          productId: existingId,
          name,
          price: `$${(price / 100).toFixed(2)}`,
          status: 'exists'
        };
      }

      // Test mode simulation
      if (TEST_MODE) {
        const mockId = `prod_test_${metadata.internal_id}_${Date.now()}`;
        console.log(`[TEST] Created: ${name} (${mockId})`);
        return {
          success: true,
          productId: mockId,
          name,
          price: `$${(price / 100).toFixed(2)}`,
          status: 'created'
        };
      }

      // Create in Stripe
      const product = await stripe.products.create({
        name,
        description,
        metadata,
        default_price_data: {
          currency: CURRENCY,
          unit_amount: price,
        },
      });

      console.log(`✓ Created: ${name} (${product.id})`);
      
      return {
        success: true,
        productId: product.id,
        name,
        price: `$${(price / 100).toFixed(2)}`,
        status: 'created'
      };
      
    } catch (error) {
      console.error(`✗ Failed: ${name} -`, error.message);
      
      return {
        success: false,
        name,
        price: `$${(price / 100).toFixed(2)}`,
        status: 'failed',
        error: error.message || 'Unknown error'
      };
    }
  }

  try {
    console.log(`🚀 Starting product creation (Test: ${TEST_MODE}, Logging: ${!!supabase})`);
    
    const results: CreateProductResult[] = [];
    
    // Process each product sequentially
    for (const productConfig of products) {
      const result = await createSingleProduct(productConfig);
      results.push(result);
      
      // Log to Supabase
      await logToSupabase(productConfig, result);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate summary
    const summary = {
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      existing: results.filter(r => r.status === 'exists').length,
      failed: results.filter(r => r.status === 'failed').length,
      test_mode: TEST_MODE,
      logging_enabled: !!supabase
    };

    const response = {
      success: summary.failed === 0,
      summary,
      products: results,
      timestamp: new Date().toISOString(),
      environment: {
        test_mode: TEST_MODE,
        currency: CURRENCY,
        logging: !!supabase
      }
    };

    const statusCode = summary.failed > 0 ? 207 : 200; // Multi-status if some failed

    console.log(`✅ Complete: ${summary.created} created, ${summary.existing} existing, ${summary.failed} failed`);

    return new Response(JSON.stringify(response, null, 2), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("💥 Fatal error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Fatal error during product creation",
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});