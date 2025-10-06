// omnia-shared/functions/create-products/index.ts
// 🧩 Universal Product Creation Function for all Omnia SaaS projects

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";
import { 
  createSupabaseClient, 
  withDatabaseLogging 
} from "./supabaseClient.ts";
import { 
  validatePayload, 
  log, 
  generateMockProductId,
  formatPrice,
  extractRequestParams,
  calculateProductStats,
  createErrorResponse,
  createSuccessResponse,
  handleCorsPreflight,
  DEFAULT_CORS_HEADERS,
  type ProjectConfig,
  type ProductConfig
} from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflight(DEFAULT_CORS_HEADERS);
  }

  try {
    const url = new URL(req.url);
    const { project, dryRun, limit } = extractRequestParams(url);

    // Validate environment variables
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY in environment");
    }

    // Initialize clients
    const supabase = createSupabaseClient();
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Test database connection
    const dbTest = await supabase.testConnection();
    if (!dbTest.success) {
      await log("⚠️ Database connection test failed", { error: dbTest.error });
    }

    // Load product configuration from JSON file
    const configFile = `${project}.json`;
    const configPath = new URL(`./${configFile}`, import.meta.url);
    
    let projectConfig: ProjectConfig;
    try {
      const configText = await Deno.readTextFile(configPath);
      projectConfig = JSON.parse(configText);
    } catch (error) {
      return createErrorResponse(
        `Failed to load config for ${project}. Available projects: adtopia, bizbox, gammaflow, shieldstaff`,
        400,
        DEFAULT_CORS_HEADERS
      );
    }

    // Validate configuration
    validatePayload(projectConfig);

    // Calculate statistics
    const stats = calculateProductStats(projectConfig.products);
    await log("📊 Product configuration loaded", { 
      project, 
      stats,
      dryRun 
    });

    // Apply limit if specified
    const productsToProcess = limit 
      ? projectConfig.products.slice(0, limit)
      : projectConfig.products;

    const created: any[] = [];
    const errors: any[] = [];

    // Process each product
    for (const productConfig of productsToProcess) {
      try {
        let product;
        
        if (dryRun) {
          // Mock product for dry run
          product = {
            id: generateMockProductId(),
            name: productConfig.name,
            description: productConfig.description,
            metadata: productConfig.metadata,
          };
          
          await log("🧪 Dry run product created", { 
            product_id: product.id, 
            name: product.name 
          });
        } else {
          // Create actual Stripe product
          product = await stripe.products.create({
            name: productConfig.name,
            description: productConfig.description,
            metadata: productConfig.metadata,
            default_price_data: {
              currency: "usd",
              unit_amount: productConfig.price_cents,
            },
          });
          
          await log("✅ Stripe product created", { 
            product_id: product.id, 
            name: product.name 
          });
        }

        const productData = {
          id: product.id,
          name: product.name,
          price: formatPrice(productConfig.price_cents),
          price_usd: productConfig.price_cents / 100,
          metadata: productConfig.metadata,
          created_at: new Date().toISOString(),
        };

        created.push(productData);

        // Log product creation to database
        const logResult = await withDatabaseLogging(
          () => supabase.logProductCreation({
            project,
            stripeProductId: product.id,
            name: product.name,
            priceUsd: productData.price_usd,
            metadata: productConfig.metadata
          }),
          { success: false, error: "Database logging failed" },
          `📝 Product logged to database: ${product.id}`
        );

        if (!logResult.success) {
          errors.push({
            product_id: product.id,
            error: logResult.error,
            type: "database_logging"
          });
        }

      } catch (productError) {
        const errorData = {
          product_name: productConfig.name,
          error: productError.message,
          type: "product_creation"
        };
        
        errors.push(errorData);
        await log("❌ Product creation failed", errorData);
      }
    }

    // Generate summary
    const summary = {
      project,
      total_requested: productsToProcess.length,
      total_created: created.length,
      total_errors: errors.length,
      dry_run: dryRun,
      statistics: {
        ...stats,
        success_rate: productsToProcess.length > 0 
          ? (created.length / productsToProcess.length * 100).toFixed(1) + '%'
          : '0%'
      }
    };

    await log("🎯 Product creation batch complete", summary);

    // Return comprehensive response
    const response = {
      success: true,
      summary,
      created,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response, DEFAULT_CORS_HEADERS);

  } catch (error) {
    await log("❌ Fatal error in product creation", { 
      error: error.message,
      stack: error.stack 
    });
    
    return createErrorResponse(
      error.message,
      500,
      DEFAULT_CORS_HEADERS
    );
  }
});
