// Test script for stripe-sync-products Edge Function
// Tests the sync function to backfill missing products

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwszqfmduotxjutlnyls.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/omnia-shared/stripe-sync-products`;

async function testStripeSync() {
  console.log('🧪 Testing stripe-sync-products Edge Function...\n');

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Sync test PASSED');
      console.log(`📈 Synced ${data.synced} new products`);
      
      if (data.synced > 0) {
        console.log('\n🎉 New products were found and synced!');
        console.log('Check the stripe_products_log table to see the new entries.');
      } else {
        console.log('\n✅ All products are already synced - no new products found.');
      }
    } else {
      console.log('\n❌ Sync test FAILED');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL environment variable');
    console.log('2. Verify function is deployed: supabase functions deploy omnia-shared/stripe-sync-products');
    console.log('3. Check function logs: supabase functions logs omnia-shared/stripe-sync-products');
    console.log('4. Verify environment variables in Supabase Dashboard');
  }
}

// Run the test
testStripeSync();
