#!/bin/bash

# ========================================
# 1-MINUTE BETA MOAT ACTIONS SCRIPT
# Date: 2025-01-07 22:41:14 UTC
# Mission: Execute Strategic Brand Split Actions
# ========================================

# --- Configuration ---
SUPABASE_URL="https://auyjsmtnfnnapjdrzhea.supabase.co"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# --- User Input ---
read -p "Enter your Supabase Service Role Key: " SERVICE_ROLE_KEY

echo "🚨 EXECUTING 1-MINUTE BETA MOAT ACTIONS..."

# --- Action 1: Test AdTopia.io Email (Flagship) ---
echo -e "\n--- Action 1: Testing AdTopia.io Email (Flagship) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "omniumai357@gmail.com",
    "tier": "ULTIMATE",
    "amount": 1997.00,
    "brand": "adtopia"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 2: Test BizBox.systems Email (Beta) ---
echo -e "\n--- Action 2: Testing BizBox.systems Email (Beta) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-purchase-confirmation" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "omniumai357@gmail.com",
    "tier": "STARTER",
    "amount": 49.00,
    "brand": "bizbox"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 3: Test SMS Revenue Alert ---
echo -e "\n--- Action 3: Testing SMS Revenue Alert ---"
curl -X POST "${SUPABASE_URL}/functions/v1/send-sms-notification" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "phone_number": "+1234567890",
    "message": "AdTopia Revenue Alert: Beta moat activated! Flagship protected, $3,500 Month 1 target locked.",
    "brand": "adtopia",
    "message_type": "revenue_alert"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 4: Test Agency Onboarding (Beta) ---
echo -e "\n--- Action 4: Testing Agency Onboarding (Beta) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/agency-onboarding" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "agency_name": "Beta Test Agency",
    "contact_email": "beta@testagency.com",
    "expected_monthly_sales": 20,
    "target_niches": ["beta", "testing"],
    "company_size": "small",
    "website": "https://testagency.com"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 5: Test GTMM TAM Mapper (Beta) ---
echo -e "\n--- Action 5: Testing GTMM TAM Mapper (Beta) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/gtmm-tam-mapper" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"beta_testing","target_revenue":5000,"geo":"US"}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 6: Test Conversion Optimization (Beta) ---
echo -e "\n--- Action 6: Testing Conversion Optimization (Beta) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/optimize-messaging" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"niche":"beta_testing","current_conversion_rate":2.5}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 7: Test Multilingual Translation (Beta) ---
echo -e "\n--- Action 7: Testing Multilingual Translation (Beta) ---"
curl -X POST "${SUPABASE_URL}/functions/v1/translate-content" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"content":"BizBox Beta: Your QR preview ready!","niche":"beta_testing","target_languages":["es","fr"]}' \
  -w "\nHTTP Status: %{http_code}\n"

# --- Action 8: Test Agency Commission (Beta) ---
echo -e "\n--- Action 8: Testing Agency Commission (Beta) ---"
# Get Beta Test Agency ID
BETA_AGENCY_ID=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/agency_partners?select=id&agency_name=eq.Beta Test Agency" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H 'Content-Type: application/json' | jq -r '.[0].id')

if [ "$BETA_AGENCY_ID" != "null" ] && [ "$BETA_AGENCY_ID" != "" ]; then
  curl -X POST "${SUPABASE_URL}/functions/v1/calculate-agency-commission" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H 'Content-Type: application/json' \
    -d "{\"agency_id\":\"${BETA_AGENCY_ID}\",\"sale_amount\":49.00}" \
    -w "\nHTTP Status: %{http_code}\n"
else
  echo "❌ Could not find Beta Test Agency ID"
fi

echo -e "\n🚨 1-MINUTE BETA MOAT ACTIONS COMPLETE!"
echo "Check the results above for any errors or issues."
echo "All functions should return HTTP 200 status codes."
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Configure DNS records for both domains"
echo "2. Test email delivery in your inbox"
echo "3. Verify beta messaging and branding"
echo "4. Complete full loop test"
echo "5. Log all transaction IDs"
echo ""
echo "🚀 BETA MOAT ACTIVATED! 🚀💰"
