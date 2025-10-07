// Direct test of Stripe sync using environment variables
const PROJECT_REF = "xwszqfmduotxjutlnyls";

async function testSyncDirect() {
  console.log("🚀 Testing Stripe Product Sync Direct...");
  
  try {
    // Try to get the service role key from Supabase CLI
    const { execSync } = require('child_process');
    
    // Get the service role key from Supabase
    const keyResult = execSync('supabase secrets list --project-ref xwszqfmduotxjutlnyls', { encoding: 'utf8' });
    console.log("📋 Available secrets:", keyResult);
    
    // For now, let's try with a placeholder and see what happens
    const response = await fetch(`https://${PROJECT_REF}.supabase.co/functions/v1/sync-stripe-products-hardened`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer PLACEHOLDER_KEY',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.text();
    console.log("📊 Response:", result);
    
  } catch (error) {
    console.error("💥 Error:", error.message);
  }
}

testSyncDirect();
