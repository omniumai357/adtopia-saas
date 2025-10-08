#!/bin/bash

# ========================================
# FINAL REVENUE ACTIVATION SCRIPT
# Date: 2025-01-07 22:41:14 UTC
# Mission: Activate Revenue Multiplication System
# ========================================

# --- Configuration ---
SUPABASE_URL="https://auyjsmtnfnnapjdrzhea.supabase.co"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# --- User Input ---
read -p "Enter your Supabase Service Role Key: " SERVICE_ROLE_KEY
read -p "Enter your phone number (e.g., +1234567890): " PHONE_NUMBER

echo "🚨 EXECUTING FINAL REVENUE ACTIVATION..."

# --- Step 1: Test SMS Revenue Alert ---
echo -e "\n--- Step 1: Testing SMS Revenue Alert ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-sms-notification" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"phone\": \"${PHONE_NUMBER}\",
    \"message\": \"AdTopia Revenue Alert: First agency sale \$79.00 - Commission \$19.75 earned!\",
    \"type\": \"revenue_alert\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 2: Send Agency Onboarding Email ---
echo -e "\n--- Step 2: Sending Agency Onboarding Email ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-agency-onboarding" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "agency_email": "contact@buildmaxmarketing.com",
    "agency_name": "BuildMax Marketing Solutions",
    "tier": "SILVER",
    "commission_rate": 0.2500,
    "api_key": "generated_api_key_here",
    "next_steps": [
      "Complete agency agreement",
      "Access white-label dashboard", 
      "Begin lead generation for construction niche",
      "Target: 25 sales in Month 1"
    ]
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 3: Test Email Confirmation System ---
echo -e "\n--- Step 3: Testing Email Confirmation System ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "omniumai357@gmail.com",
    "tier": "GROWTH",
    "amount": 79.00,
    "brand": "adtopia"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 4: Test Agency Commission Calculation ---
echo -e "\n--- Step 4: Testing Agency Commission Calculation ---"
# Get Alpha Marketing Solutions agency ID
ALPHA_AGENCY_ID=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/agency_partners?select=id&agency_name=eq.Alpha Marketing Solutions" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' | jq -r '.[0].id')

if [ "$ALPHA_AGENCY_ID" != "null" ] && [ "$ALPHA_AGENCY_ID" != "" ]; then
  curl -X POST "${SUPABASE_URL}/functions/v1/calculate-agency-commission" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H 'Content-Type: application/json' \
    -d "{\"agency_id\":\"${ALPHA_AGENCY_ID}\",\"sale_amount\":100.00}" \
    -w "\nHTTP Status: %{http_code}\n"
else
  echo "❌ Could not find Alpha Marketing Solutions agency ID"
fi

# --- Step 5: Test GTMM TAM Mapper ---
echo -e "\n--- Step 5: Testing GTMM TAM Mapper ---"
curl -X POST "${SUPABASE_URL}/functions/v1/gtmm-tam-mapper" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"construction","target_revenue":10000,"geo":"US"}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 6: Test Conversion Optimization ---
echo -e "\n--- Step 6: Testing Conversion Optimization ---"
curl -X POST "${SUPABASE_URL}/functions/v1/optimize-messaging" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"construction","current_conversion_rate":3.5}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 7: Test Multilingual Translation ---
echo -e "\n--- Step 7: Testing Multilingual Translation ---"
curl -X POST "${SUPABASE_URL}/functions/v1/translate-content" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"content":"AdTopia helps construction companies generate more leads","niche":"construction","target_languages":["es","fr","de"]}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Step 8: Test Agency Onboarding ---
echo -e "\n--- Step 8: Testing Agency Onboarding ---"
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

echo -e "\n🚨 FINAL REVENUE ACTIVATION COMPLETE!"
echo "Check the results above for any errors or issues."
echo "All functions should return HTTP 200 status codes."
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Configure DNS records for both domains"
echo "2. Onboard 3 real agencies with pending status"
echo "3. Activate revenue tracking dashboard"
echo "4. Begin revenue multiplication"
echo "5. Scale to $30K+ monthly revenue"
echo ""
echo "🚀 REVENUE EMPIRE ACTIVATED! 🚀💰"
