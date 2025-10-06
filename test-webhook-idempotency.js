// Test script for webhook idempotency fix
// Tests that duplicate webhook events are properly handled

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwszqfmduotxjutlnyls.supabase.co';
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook-uuid`;

// Mock Stripe webhook event
const mockStripeEvent = {
  id: 'evt_test_idempotency_' + Date.now(),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Date.now(),
      customer_details: {
        email: 'test@adtopia.io'
      },
      metadata: {
        product_name: 'Starter Package'
      },
      amount_total: 2900, // $29
      currency: 'usd'
    }
  }
};

// Mock Stripe signature (in production, this would be real)
const mockSignature = 't=1234567890,v1=mock_signature';

async function testWebhookIdempotency() {
  console.log('🧪 Testing Webhook Idempotency Fix...\n');

  try {
    // Test 1: First webhook call should succeed
    console.log('📤 Test 1: First webhook call...');
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify(mockStripeEvent)
    });

    const result1 = await response1.json();
    console.log('✅ First call result:', result1);

    // Test 2: Duplicate webhook call should be idempotent
    console.log('\n📤 Test 2: Duplicate webhook call...');
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify(mockStripeEvent)
    });

    const result2 = await response2.json();
    console.log('✅ Duplicate call result:', result2);

    // Test 3: Third duplicate call should also be idempotent
    console.log('\n📤 Test 3: Third duplicate call...');
    const response3 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify(mockStripeEvent)
    });

    const result3 = await response3.json();
    console.log('✅ Third call result:', result3);

    // Validate results
    console.log('\n📊 Validation Results:');
    
    if (result1.received && !result1.idempotent) {
      console.log('✅ First call: Processed successfully');
    } else {
      console.log('❌ First call: Failed or incorrectly marked as idempotent');
    }

    if (result2.received && result2.idempotent) {
      console.log('✅ Duplicate call: Correctly handled as idempotent');
    } else {
      console.log('❌ Duplicate call: Not handled as idempotent - CRITICAL BUG!');
    }

    if (result3.received && result3.idempotent) {
      console.log('✅ Third call: Correctly handled as idempotent');
    } else {
      console.log('❌ Third call: Not handled as idempotent - CRITICAL BUG!');
    }

    // Test 4: Different event ID should process normally
    console.log('\n📤 Test 4: Different event ID...');
    const differentEvent = {
      ...mockStripeEvent,
      id: 'evt_test_different_' + Date.now()
    };

    const response4 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`
      },
      body: JSON.stringify(differentEvent)
    });

    const result4 = await response4.json();
    console.log('✅ Different event result:', result4);

    if (result4.received && !result4.idempotent) {
      console.log('✅ Different event: Processed successfully');
    } else {
      console.log('❌ Different event: Failed or incorrectly marked as idempotent');
    }

    console.log('\n🎉 Webhook Idempotency Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- First call: Should process normally');
    console.log('- Duplicate calls: Should be idempotent (no duplicate processing)');
    console.log('- Different events: Should process normally');
    console.log('- This prevents duplicate charges and access grants');

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL environment variable');
    console.log('2. Verify webhook function is deployed: supabase functions deploy stripe-webhook-uuid');
    console.log('3. Check function logs: supabase functions logs stripe-webhook-uuid');
    console.log('4. Verify webhook_events table exists in database');
    console.log('5. Check environment variables in Supabase Dashboard');
  }
}

// Run the test
testWebhookIdempotency();
