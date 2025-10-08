#!/bin/bash

# ========================================
# JWT BLOCKER RESOLUTION SCRIPT
# Date: 2025-01-07 22:41:14 UTC
# Mission: Resolve JWT Authentication Blocker
# ========================================

echo "🚨 RESOLVING JWT AUTHENTICATION BLOCKER..."

# --- Step 1: Instructions for JWT Key Retrieval ---
echo -e "\n--- Step 1: JWT Key Retrieval Instructions ---"
echo "1. Navigate to Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Go to your project: auyjsmtnfnnapjdrzhea"
echo "3. Click on 'API Keys' in the left sidebar"
echo "4. Copy the 'anon public' key (starts with eyJ...)"
echo "5. Copy the 'service_role secret' key (starts with eyJ...)"
echo "6. Make sure these are the CURRENT keys, not legacy keys"
echo ""

# --- Step 2: User Input for New Keys ---
read -p "Enter your NEW Supabase Anon Key (eyJ...): " NEW_ANON_KEY
read -p "Enter your NEW Supabase Service Role Key (eyJ...): " NEW_SERVICE_ROLE_KEY

# --- Step 3: Test Current Keys (Should Fail) ---
echo -e "\n--- Step 3: Testing Current Keys (Should Fail) ---"
SUPABASE_URL="https://auyjsmtnfnnapjdrzhea.supabase.co"

echo "Testing with current keys..."
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${NEW_SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","tier":"GROWTH","amount":79.00}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

# --- Step 4: Instructions for Updating Secrets ---
echo -e "\n--- Step 4: Update Supabase Secrets ---"
echo "Run these commands to update your Supabase secrets:"
echo ""
echo "supabase secrets set SUPABASE_ANON_KEY=\"${NEW_ANON_KEY}\""
echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"${NEW_SERVICE_ROLE_KEY}\""
echo ""
echo "Then verify with:"
echo "supabase secrets list"
echo ""

# --- Step 5: Test After Secret Update ---
echo -e "\n--- Step 5: Test After Secret Update ---"
echo "After updating secrets, run this test:"
echo ""
echo "curl -X POST '${SUPABASE_URL}/functions/v1/send-purchase-confirmation' \\"
echo "  -H 'Authorization: Bearer ${NEW_SERVICE_ROLE_KEY}' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"tier\":\"GROWTH\",\"amount\":79.00}'"
echo ""

# --- Step 6: Expected Results ---
echo -e "\n--- Step 6: Expected Results ---"
echo "✅ SUCCESS: HTTP 200 with JSON response"
echo "❌ FAILURE: HTTP 401 with 'Invalid JWT' message"
echo ""

# --- Step 7: Next Steps ---
echo -e "\n--- Step 7: Next Steps After JWT Fix ---"
echo "1. Update Supabase secrets with new keys"
echo "2. Test Edge Functions (should return 200)"
echo "3. Run beta moat activation script"
echo "4. Complete strategic brand split testing"
echo "5. Activate $3,500 Month 1 revenue target"
echo ""

echo "🚨 JWT RESOLUTION INSTRUCTIONS COMPLETE!"
echo "Follow the steps above to resolve the JWT blocker."
echo "Once resolved, your beta moat will be fully operational! 🚀💰"
