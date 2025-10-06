// /omnia-shared/functions/create-products/utils.ts

export async function log(message: string, data: Record<string, any> = {}) {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
}

export function validatePayload(json: any) {
  if (!json.products || !Array.isArray(json.products)) {
    throw new Error("Invalid JSON: missing products array");
  }
  for (const p of json.products) {
    if (!p.name || !p.price_cents) {
      throw new Error(`Invalid product entry: ${JSON.stringify(p)}`);
    }
  }
}
