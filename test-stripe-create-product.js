// Test script for stripe-create-product Edge Function
// Tests the auto-logger function with AdTopia products

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwszqfmduotxjutlnyls.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/omnia-shared/stripe-create-product`;

async function testStripeCreateProduct() {
  console.log('🧪 Testing stripe-create-product Edge Function...\n');

  // Test data - AdTopia products
  const testProducts = [
    {
      name: "Starter Package",
      price_usd: 29,
      type: "ad_package",
      project: "adtopia",
      metadata: { internal_id: "001", package_type: "starter" },
      features: ["7-day live preview", "QR code ready", "Mobile responsive"]
    },
    {
      name: "Growth Package",
      price_usd: 79,
      type: "ad_package",
      project: "adtopia",
      metadata: { internal_id: "002", package_type: "growth" },
      features: ["30-day extended preview", "Domain hold", "SSL setup", "Email support"]
    },
    {
      name: "Pro Package",
      price_usd: 149,
      type: "ad_package",
      project: "adtopia",
      metadata: { internal_id: "003", package_type: "pro" },
      features: ["Dual-language ads", "Priority setup", "Advanced analytics", "Phone support"]
    }
  ];

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify(testProducts)
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Function test PASSED');
      console.log(`📈 Created ${data.results.length} products successfully`);
      
      // Show created products
      data.results.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   Stripe Product ID: ${product.stripe_product_id}`);
        console.log(`   Price ID: ${product.price_id}`);
        console.log(`   Price: $${product.price_usd}`);
        console.log(`   Project: ${product.project}`);
      });
    } else {
      console.log('\n❌ Function test FAILED');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL environment variable');
    console.log('2. Verify function is deployed: supabase functions deploy omnia-shared/stripe-create-product');
    console.log('3. Check function logs: supabase functions logs omnia-shared/stripe-create-product');
    console.log('4. Verify environment variables in Supabase Dashboard');
  }
}

// Run the test
testStripeCreateProduct();
