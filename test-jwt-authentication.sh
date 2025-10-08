#!/bin/bash

# ========================================
# JWT AUTHENTICATION TEST SCRIPT
# Date: 2025-01-07 22:41:14 UTC
# Mission: Test JWT Authentication with Real Keys
# ========================================

echo "🚨 TESTING JWT AUTHENTICATION WITH REAL KEYS..."

# --- Configuration ---
SUPABASE_URL="https://auyjsmtnfnnapjdrzhea.supabase.co"

# --- User Input for Real Keys ---
read -p "Enter your ACTUAL Supabase Service Role Key (eyJ...): " SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "❌ No Service Role Key provided. Exiting."
  exit 1
fi

echo -e "\n--- Testing JWT Authentication ---"

# --- Test 1: Email Confirmation Function ---
echo "Test 1: Email Confirmation Function"
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","tier":"GROWTH","amount":79.00}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 2: SMS Notification Function ---
echo "Test 2: SMS Notification Function"
curl -X POST "${SUPABASE_URL}/functions/v1/send-sms-notification" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"phone_number":"+1234567890","message":"Test message","brand":"adtopia","message_type":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 3: Agency Onboarding Function ---
echo "Test 3: Agency Onboarding Function"
curl -X POST "${SUPABASE_URL}/functions/v1/agency-onboarding" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"agency_name":"Test Agency","contact_email":"test@agency.com","expected_monthly_sales":20,"target_niches":["test"]}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 4: GTMM TAM Mapper Function ---
echo "Test 4: GTMM TAM Mapper Function"
curl -X POST "${SUPABASE_URL}/functions/v1/gtmm-tam-mapper" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"test","target_revenue":5000,"geo":"US"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 5: Conversion Optimization Function ---
echo "Test 5: Conversion Optimization Function"
curl -X POST "${SUPABASE_URL}/functions/v1/optimize-messaging" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"test","current_conversion_rate":2.5}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 6: Multilingual Translation Function ---
echo "Test 6: Multilingual Translation Function"
curl -X POST "${SUPABASE_URL}/functions/v1/translate-content" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test content","niche":"test","target_languages":["es"]}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 7: Stripe Product Sync Function ---
echo "Test 7: Stripe Product Sync Function"
curl -X POST "${SUPABASE_URL}/functions/v1/sync-stripe-products-hardened" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Test 8: Secrets Health Function ---
echo "Test 8: Secrets Health Function"
curl -X POST "${SUPABASE_URL}/functions/v1/secrets-health" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo -e "\n"

# --- Results Summary ---
echo "🚨 JWT AUTHENTICATION TEST COMPLETE!"
echo ""
echo "Expected Results:"
echo "✅ SUCCESS: HTTP 200 with JSON responses"
echo "❌ FAILURE: HTTP 401 with 'Invalid JWT' message"
echo ""
echo "If all tests return 200, your JWT authentication is working!"
echo "If any tests return 401, the JWT issue persists."
echo ""
echo "Next Steps:"
echo "1. If 200 responses: Proceed with beta moat activation"
echo "2. If 401 responses: Check Supabase secrets configuration"
echo "3. Verify Edge Functions can access the updated keys"
echo ""
echo "🚀 Ready to activate your revenue empire! 🚀💰"
