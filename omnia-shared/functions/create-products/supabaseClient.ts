// omnia-shared/functions/create-products/supabaseClient.ts
// Minimal Deno Supabase client for database operations

import { createClient } from "npm:@supabase/supabase-js@2.56.1";

export interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

export class SupabaseClient {
  private client: any;
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
    this.client = createClient(config.url, config.serviceKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  /**
   * Log product creation to stripe_products_log table
   */
  async logProductCreation(params: {
    project: string;
    stripeProductId: string;
    name: string;
    priceUsd: number;
    metadata?: any;
  }): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      const { data, error } = await this.client.rpc('log_stripe_product_creation', {
        p_project: params.project,
        p_stripe_product_id: params.stripeProductId,
        p_name: params.name,
        p_price_usd: params.priceUsd,
        p_metadata: params.metadata || null
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, logId: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent products for a project
   */
  async getRecentProducts(limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await this.client.rpc('get_recent_stripe_products', {
        p_limit: limit
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get products summary by project
   */
  async getProductsSummary(project?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await this.client.rpc('get_stripe_products_summary', {
        p_project: project
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client.from('stripe_products_log').select('count').limit(1);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Create Supabase client from environment variables
 */
export function createSupabaseClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  return new SupabaseClient({ url, serviceKey });
}

/**
 * Utility function to safely execute database operations
 */
export async function withDatabaseLogging<T>(
  operation: () => Promise<T>,
  fallback: T,
  logMessage: string
): Promise<T> {
  try {
    const result = await operation();
    console.log(`✅ ${logMessage}`);
    return result;
  } catch (error) {
    console.error(`❌ ${logMessage}:`, error.message);
    return fallback;
  }
}
