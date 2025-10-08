#!/bin/bash

# ========================================
# CRITICAL REVENUE FUNCTIONS TEST SCRIPT
# Date: 2025-01-07 21:47:49 UTC
# Mission: Test all critical revenue functions with new JWT keys
# ========================================

# --- Configuration ---
SUPABASE_URL="https://auyjsmtnfnnapjdrzhea.supabase.co"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
NEW_ANON_KEY="YOUR_NEW_ANON_KEY"

# --- User Input ---
read -p "Enter your Supabase Service Role Key: " SERVICE_ROLE_KEY
read -p "Enter your new Supabase Anon Key: " NEW_ANON_KEY

echo "🚨 TESTING CRITICAL REVENUE FUNCTIONS..."

# --- Test 1: Stripe Product Sync ---
echo -e "\n--- Testing Stripe Product Sync ---"
curl -X POST "${SUPABASE_URL}/functions/v1/sync-stripe-products-hardened" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 2: Agency Commission Calculation ---
echo -e "\n--- Testing Agency Commission Calculation ---"
# Get Alpha Marketing Solutions agency ID
ALPHA_AGENCY_ID=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/agency_partners?select=id&agency_name=eq.Alpha Marketing Solutions" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' | jq -r '.[0].id')

if [ "$ALPHA_AGENCY_ID" != "null" ] && [ "$ALPHA_AGENCY_ID" != "" ]; then
  curl -X POST "${SUPABASE_URL}/functions/v1/calculate-agency-commission" \
    -H "Authorization: Bearer ${NEW_ANON_KEY}" \
    -H 'Content-Type: application/json' \
    -d "{\"agency_id\":\"${ALPHA_AGENCY_ID}\",\"sale_amount\":100.00}" \
    -w "\nHTTP Status: %{http_code}\n"
else
  echo "❌ Could not find Alpha Marketing Solutions agency ID"
fi

# --- Test 3: Payment Processing Webhook ---
echo -e "\n--- Testing Payment Processing Webhook ---"
curl -X POST "${SUPABASE_URL}/functions/v1/stripe-webhook" \
  -H 'stripe-signature: t=test,v1=test' \
  -H 'Content-Type: application/json' \
  -d '{"type":"test_event","id":"evt_test"}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 4: Email Confirmation System ---
echo -e "\n--- Testing Email Confirmation System ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"email":"omniumai357@gmail.com","tier":"GROWTH","amount":79.00}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 5: SMS Notification System ---
echo -e "\n--- Testing SMS Notification System ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-sms-notification" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"phone_number":"+1234567890","message":"Test SMS from AdTopia","brand":"adtopia","message_type":"custom"}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 6: Agency Onboarding ---
echo -e "\n--- Testing Agency Onboarding ---"
curl -X POST "${SUPABASE_URL}/functions/v1/agency-onboarding" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "agency_name": "Test Revenue Agency",
    "contact_email": "test@revenueagency.com",
    "expected_monthly_sales": 30,
    "target_niches": ["test", "validation"],
    "company_size": "medium"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 7: GTMM TAM Mapper ---
echo -e "\n--- Testing GTMM TAM Mapper ---"
curl -X POST "${SUPABASE_URL}/functions/v1/gtmm-tam-mapper" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"construction","target_revenue":10000,"geo":"US"}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Test 8: Conversion Optimization ---
echo -e "\n--- Testing Conversion Optimization ---"
curl -X POST "${SUPABASE_URL}/functions/v1/optimize-messaging" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"construction","current_conversion_rate":3.5}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n🚨 CRITICAL REVENUE FUNCTIONS TESTING COMPLETE!"
echo "Check the results above for any errors or issues."
echo "All functions should return HTTP 200 status codes."
