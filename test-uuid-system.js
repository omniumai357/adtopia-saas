// Test script for UUID-based user role system
const https = require('https');

// Test the create-products function with dry run
function testCreateProducts() {
  const options = {
    hostname: 'auyjsmtnfnnapjdrzhea.supabase.co',
    port: 443,
    path: '/functions/v1/create-products?project=adtopia&dryRun=true',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eWpzbXRuZm5uYXBqZHJ6aGVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0NzQ5MCwiZXhwIjoyMDUyNjIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
    }
  };

  console.log('🧪 Testing create-products function with dry run...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Function test successful!');
        try {
          const response = JSON.parse(data);
          console.log('📊 Products that would be created:', response.created?.length || 0);
          if (response.created) {
            response.created.forEach((product, index) => {
              console.log(`  ${index + 1}. ${product.name} - ${product.price}`);
            });
          }
        } catch (e) {
          console.log('Response is not JSON:', data);
        }
      } else {
        console.log('❌ Function test failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
  });

  req.end();
}

// Test the stripe webhook function
function testStripeWebhook() {
  const options = {
    hostname: 'auyjsmtnfnnapjdrzhea.supabase.co',
    port: 443,
    path: '/functions/v1/stripe-webhook-uuid',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eWpzbXRuZm5uYXBqZHJ6aGVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0NzQ5MCwiZXhwIjoyMDUyNjIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
    }
  };

  console.log('\n🧪 Testing stripe-webhook-uuid function...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const testPayload = JSON.stringify({
    type: 'checkout.session.completed',
    data: {
      object: {
        customer_details: {
          email: 'test@example.com'
        },
        metadata: {
          product_name: 'Starter Package'
        },
        amount_total: 2900,
        currency: 'usd',
        id: 'cs_test_123'
      }
    }
  });

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Webhook test successful!');
      } else {
        console.log('❌ Webhook test failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
  });

  req.write(testPayload);
  req.end();
}

// Run tests
console.log('🚀 Starting UUID System Tests...\n');
testCreateProducts();

// Wait a bit then test webhook
setTimeout(() => {
  testStripeWebhook();
}, 2000);
