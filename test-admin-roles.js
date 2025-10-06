// Test script for admin role system
// Tests UUID-based admin role management

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwszqfmduotxjutlnyls.supabase.co';

async function testAdminRoles() {
  console.log('🧪 Testing Admin Role System...\n');

  try {
    // Test 1: Check if we can query existing users
    console.log('📤 Test 1: Querying existing users...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?select=id,email,created_at&order=created_at.desc&limit=10`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
      }
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Found users:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.id})`);
      });
    } else {
      console.log('❌ Failed to query users:', usersResponse.status);
    }

    // Test 2: Check existing admin roles
    console.log('\n📤 Test 2: Checking existing admin roles...');
    const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=user_id,role&role=eq.admin`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
      }
    });

    if (adminResponse.ok) {
      const admins = await adminResponse.json();
      console.log('✅ Found admin roles:');
      if (admins.length === 0) {
        console.log('  No admin roles found - need to create them');
      } else {
        admins.forEach((admin, index) => {
          console.log(`  ${index + 1}. User ID: ${admin.user_id}, Role: ${admin.role}`);
        });
      }
    } else {
      console.log('❌ Failed to query admin roles:', adminResponse.status);
    }

    // Test 3: Test admin users view
    console.log('\n📤 Test 3: Testing admin users view...');
    const adminUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=*`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
      }
    });

    if (adminUsersResponse.ok) {
      const adminUsers = await adminUsersResponse.json();
      console.log('✅ Admin users view:');
      if (adminUsers.length === 0) {
        console.log('  No admin users found');
      } else {
        adminUsers.forEach((admin, index) => {
          console.log(`  ${index + 1}. ${admin.email} (${admin.user_id}) - ${admin.role}`);
        });
      }
    } else {
      console.log('❌ Failed to query admin users view:', adminUsersResponse.status);
    }

    // Test 4: Test is_admin function
    console.log('\n📤 Test 4: Testing is_admin function...');
    const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (isAdminResponse.ok) {
      const isAdmin = await isAdminResponse.json();
      console.log('✅ is_admin function result:', isAdmin);
    } else {
      console.log('❌ Failed to test is_admin function:', isAdminResponse.status);
    }

    console.log('\n🎉 Admin Role System Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run the SQL migration to fix admin roles');
    console.log('2. Check if omniumai357@example.com exists in auth.users');
    console.log('3. If not, create a test user first');
    console.log('4. Grant admin role using the SQL functions');

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL environment variable');
    console.log('2. Verify service role key is correct');
    console.log('3. Run the SQL migration first');
    console.log('4. Check Supabase logs for errors');
  }
}

// Run the test
testAdminRoles();
