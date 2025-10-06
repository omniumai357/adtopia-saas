// omnia-shared/functions/create-products/utils.ts
// Universal helpers for product creation and logging

export interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, any>;
  price_cents: number;
}

export interface ProjectConfig {
  products: ProductConfig[];
}

/**
 * Validate product configuration payload
 */
export function validatePayload(json: any): asserts json is ProjectConfig {
  if (!json.products || !Array.isArray(json.products)) {
    throw new Error("Invalid JSON: missing products array");
  }
  
  for (const product of json.products) {
    if (!product.name || typeof product.name !== 'string') {
      throw new Error(`Invalid product: missing or invalid name - ${JSON.stringify(product)}`);
    }
    
    if (!product.price_cents || typeof product.price_cents !== 'number' || product.price_cents <= 0) {
      throw new Error(`Invalid product: missing or invalid price_cents - ${JSON.stringify(product)}`);
    }
    
    if (!product.description || typeof product.description !== 'string') {
      throw new Error(`Invalid product: missing or invalid description - ${JSON.stringify(product)}`);
    }
    
    if (!product.metadata || typeof product.metadata !== 'object') {
      throw new Error(`Invalid product: missing or invalid metadata - ${JSON.stringify(product)}`);
    }
  }
}

/**
 * Enhanced logging function with structured output
 */
export async function log(message: string, data: Record<string, any> = {}): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data,
    level: message.includes('❌') || message.includes('ERROR') ? 'ERROR' : 
           message.includes('⚠️') || message.includes('WARN') ? 'WARN' : 'INFO'
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * Generate mock product ID for dry runs
 */
export function generateMockProductId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `prod_dryrun_${timestamp}_${random}`;
}

/**
 * Format price for display
 */
export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

/**
 * Validate project name
 */
export function validateProjectName(project: string): string {
  const validProjects = ['adtopia', 'bizbox', 'gammaflow', 'shieldstaff'];
  const normalizedProject = project.toLowerCase().trim();
  
  if (!validProjects.includes(normalizedProject)) {
    throw new Error(`Invalid project: ${project}. Valid projects: ${validProjects.join(', ')}`);
  }
  
  return normalizedProject;
}

/**
 * Create error response with CORS headers
 */
export function createErrorResponse(
  message: string, 
  status: number = 400, 
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    }
  });
}

/**
 * Create success response with CORS headers
 */
export function createSuccessResponse(
  data: any, 
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    }
  });
}

/**
 * Default CORS headers
 */
export const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(corsHeaders: Record<string, string>): Response {
  return new Response("ok", { headers: corsHeaders });
}

/**
 * Extract and validate request parameters
 */
export function extractRequestParams(url: URL): {
  project: string;
  dryRun: boolean;
  limit?: number;
} {
  const project = url.searchParams.get("project");
  const dryRun = url.searchParams.get("dryRun") === "true";
  const limit = url.searchParams.get("limit");
  
  if (!project) {
    throw new Error("Missing required parameter: project");
  }
  
  const validatedProject = validateProjectName(project);
  const validatedLimit = limit ? parseInt(limit) : undefined;
  
  if (validatedLimit && (isNaN(validatedLimit) || validatedLimit <= 0)) {
    throw new Error("Invalid limit parameter: must be a positive number");
  }
  
  return {
    project: validatedProject,
    dryRun,
    limit: validatedLimit
  };
}

/**
 * Calculate product statistics
 */
export function calculateProductStats(products: ProductConfig[]): {
  totalProducts: number;
  totalValue: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
} {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price_cents, 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
  const prices = products.map(p => p.price_cents);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  return {
    totalProducts,
    totalValue,
    averagePrice,
    minPrice,
    maxPrice
  };
}
