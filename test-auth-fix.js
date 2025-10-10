// Test script to verify JWT authentication fix
const { createClient } = require('@supabase/supabase-js');

// Test with the same configuration we fixed
const supabase = createClient(
  'https://auyjsmtnfnnapjdrzhea.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eWpzbXRuZm5uYXBqZHJ6aGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDQ0MDAsImV4cCI6MjA1MjAxMDQwMH0.placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

async function testAuth() {
  console.log('🔧 Testing Supabase authentication...');
  
  try {
    // Test 1: Check if we can get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', session ? '✅ Has session' : '❌ No session');
    if (sessionError) console.log('Session error:', sessionError.message);
    
    // Test 2: Try to make an authenticated request
    const { data, error } = await supabase.from('ab_tests').select('*').limit(1);
    if (error) {
      console.log('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database query successful');
    }
    
    // Test 3: Test Edge Function call
    const { data: funcData, error: funcError } = await supabase.functions.invoke('secrets-health');
    if (funcError) {
      console.log('❌ Edge Function call failed:', funcError.message);
    } else {
      console.log('✅ Edge Function call successful');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAuth();
