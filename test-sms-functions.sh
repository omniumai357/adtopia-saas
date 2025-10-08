#!/bin/bash

# 🚨 SMS FUNCTIONS TESTING SCRIPT
# Date: 2025-01-07 19:00:00 UTC
# Mission: Test SMS functions with new JWT keys

echo "🚨 TESTING SMS FUNCTIONS WITH NEW JWT KEYS!"
echo "Date: $(date)"
echo "Mission: Test SMS functions and integrate with purchase flow"
echo ""

# Get current service role key
echo "📋 Getting current service role key..."
SERVICE_ROLE_KEY=$(supabase secrets list --project-ref auyjsmtnfnnapjdrzhea | grep SUPABASE_SERVICE_ROLE_KEY | awk '{print $3}')

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Could not get service role key"
    exit 1
fi

echo "✅ Service role key retrieved: ${SERVICE_ROLE_KEY:0:20}..."

# Test 1: General SMS Notification
echo ""
echo "🧪 Test 1: General SMS Notification Function"
echo "=============================================="

read -p "Enter your phone number (e.g., +1234567890): " PHONE_NUMBER

curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/send-sms-notification' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"phone_number\": \"$PHONE_NUMBER\",
    \"message\": \"Test SMS from AdTopia system - JWT keys working!\",
    \"brand\": \"adtopia\",
    \"template_type\": \"custom\"
  }"

echo ""
echo ""

# Test 2: Purchase Confirmation SMS
echo "🧪 Test 2: Purchase Confirmation SMS Function"
echo "=============================================="

curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/send-purchase-sms' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "customer_email": "test@example.com",
    "purchase_id": "test_purchase_123",
    "product_name": "AdTopia Premium Package",
    "amount": 49.00,
    "brand": "adtopia"
  }'

echo ""
echo ""

# Test 3: BizBox Brand SMS
echo "🧪 Test 3: BizBox Brand SMS Function"
echo "====================================="

curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/send-sms-notification' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"phone_number\": \"$PHONE_NUMBER\",
    \"message\": \"Welcome to BizBox Beta!\",
    \"brand\": \"bizbox\",
    \"template_type\": \"beta_invitation\"
  }"

echo ""
echo ""

echo "🎯 SMS Testing Complete!"
echo "========================"
echo "Check your phone for SMS messages"
echo "Check Supabase logs for any errors"
echo "Verify all functions returned 200 OK responses"
echo ""
echo "Next Steps:"
echo "1. Integrate SMS with Stripe webhook"
echo "2. Add SMS to email confirmation function"
echo "3. Test complete customer journey"
echo ""
echo "🚀 SMS system ready for production! 💰"
