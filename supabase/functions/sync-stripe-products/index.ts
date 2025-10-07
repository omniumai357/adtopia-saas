import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Official product catalog from your CSV data
const OFFICIAL_PRODUCTS = [
  {
    internal_id: "001",
    name: "Starter Package",
    price: 2900, // $29.00 in cents
    description: "7-day live preview • QR code ready • Mobile responsive",
    metadata: { package_type: "starter", category: "ad_package", internal_id: "001" },
    features: ["7-day live preview", "QR code ready", "Mobile responsive"]
  },
  {
    internal_id: "002",
    name: "Growth Package", 
    price: 7900, // $79.00 in cents
    description: "30-day extended preview • Domain hold service • SSL certificate setup • Email support",
    metadata: { package_type: "growth", category: "ad_package", internal_id: "002" },
    features: ["30-day extended preview", "Domain hold service", "SSL certificate setup", "Email support"]
  },
  {
    internal_id: "003",
    name: "Pro Package",
    price: 14900, // $149.00 in cents
    description: "Dual-language ads • Priority setup • Advanced analytics • Phone support", 
    metadata: { package_type: "pro", category: "ad_package", internal_id: "003" },
    features: ["Dual-language ads", "Priority setup", "Advanced analytics", "Phone support"]
  },
  {
    internal_id: "004",
    name: "Full Beta Package",
    price: 29700, // $297.00 in cents
    description: "5 custom SEO ad cards • 12 months hosting • Free domain + SSL • Dual-language support • Premium analytics/support",
    metadata: { package_type: "full_beta", category: "ad_package", internal_id: "004" },
    features: ["5 custom SEO ad cards", "12 months hosting", "Free domain + SSL", "Dual-language support", "Premium analytics/support"]
  },
  {
    internal_id: "005", 
    name: "Extra Translation",
    price: 2900, // $29.00 in cents
    description: "Add a translated ad card • Reach bilingual markets • Expand audience instantly",
    metadata: { package_type: "translation", category: "add_on", internal_id: "005" },
    features: ["Add a translated ad card", "Reach bilingual markets", "Expand audience instantly"]
  },
  {
    internal_id: "006",
    name: "Domain + SSL",
    price: 4900, // $49.00 in cents  
    description: "Professional domain • SSL encryption • 1-year included",
    metadata: { package_type: "domain_ssl", category: "add_on", internal_id: "006" },
    features: ["Professional domain", "SSL encryption", "1-year included"]
  },
  {
    internal_id: "007",
    name: "Extra Cards",
    price: 3900, // $39.00 in cents
    description: "Add more custom ad cards • Tailored to your business • Expand campaigns",
    metadata: { package_type: "extra_cards", category: "add_on", internal_id: "007" },
    features: ["Add more custom ad cards", "Tailored to your business", "Expand campaigns"]
  },
  {
    internal_id: "008",
    name: "Premium Analytics", 
    price: 1900, // $19.00 in cents
    description: "Advanced tracking • Campaign insights • Conversion metrics",
    metadata: { package_type: "analytics", category: "add_on", internal_id: "008" },
    features: ["Advanced tracking", "Campaign insights", "Conversion metrics"]
  },
  {
    internal_id: "009",
    name: "Social Media Pack",
    price: 3500, // $35.00 in cents
    description: "Facebook + Instagram ready • Craigslist optimized • One-click sharing", 
    metadata: { package_type: "social_pack", category: "add_on", internal_id: "009" },
    features: ["Facebook + Instagram ready", "Craigslist optimized", "One-click sharing"]
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`🚀 Starting Stripe product sync at ${new Date().toISOString()}`);
    
    const syncResults = [];
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const productData of OFFICIAL_PRODUCTS) {
      try {
        // Check if product exists by searching metadata
        const existingProducts = await stripe.products.search({
          query: `metadata['internal_id']:'${productData.internal_id}'`
        });
        
        let product;
        let action = "created";
        
        if (existingProducts.data.length > 0) {
          // Update existing product
          product = await stripe.products.update(existingProducts.data[0].id, {
            name: productData.name,
            description: productData.description,
            metadata: productData.metadata
          });
          action = "updated";
          updatedCount++;
          console.log(`✅ Updated: ${product.name} (${product.id})`);
        } else {
          // Create new product with default price
          product = await stripe.products.create({
            name: productData.name,
            description: productData.description,
            metadata: productData.metadata,
            default_price_data: {
              currency: "usd",
              unit_amount: productData.price
            }
          });
          createdCount++;
          console.log(`✅ Created: ${product.name} (${product.id})`);
        }
        
        // Log to Supabase stripe_products_log table
        const { error: logError } = await supabase
          .from("stripe_products_log")
          .upsert({
            stripe_product_id: product.id,
            name: product.name,
            price_usd: productData.price / 100,
            currency: "usd",
            internal_id: productData.internal_id,
            category: productData.metadata.category,
            features: productData.features,
            last_synced: new Date().toISOString(),
            sync_action: action,
            project: "adtopia"
          }, {
            onConflict: 'stripe_product_id'
          });
          
        if (logError) {
          console.error(`❌ Error logging ${product.name}:`, logError);
          errorCount++;
        }
        
        syncResults.push({
          internal_id: productData.internal_id,
          name: product.name,
          stripe_id: product.id,
          price_usd: productData.price / 100,
          action,
          success: true
        });
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (productError) {
        console.error(`❌ Failed to sync ${productData.name}:`, productError);
        errorCount++;
        
        syncResults.push({
          internal_id: productData.internal_id,
          name: productData.name,
          action: "failed",
          error: productError.message,
          success: false
        });
      }
    }
    
    const summary = {
      total: OFFICIAL_PRODUCTS.length,
      created: createdCount,
      updated: updatedCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 Sync Summary: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors`);
    
    return new Response(
      JSON.stringify({
        success: errorCount === 0,
        summary,
        results: syncResults,
        message: `Sync completed: ${createdCount} products created, ${updatedCount} updated, ${errorCount} errors`
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("💥 Fatal sync error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Fatal sync error",
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
