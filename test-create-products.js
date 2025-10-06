// Test script for create-products Edge Function
// Tests the fixed function with proper error handling

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-products`;

async function testCreateProducts() {
  console.log('🧪 Testing create-products Edge Function...\n');

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'your-anon-key'}`
      },
      body: JSON.stringify({
        test_mode: true // Enable test mode for safe testing
      })
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Function test PASSED');
      console.log(`📈 Summary: ${data.summary.created} created, ${data.summary.existing} existing, ${data.summary.failed} failed`);
    } else {
      console.log('\n❌ Function test FAILED');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL environment variable');
    console.log('2. Verify function is deployed: supabase functions deploy create-products');
    console.log('3. Check function logs: supabase functions logs create-products');
  }
}

// Run the test
testCreateProducts();
