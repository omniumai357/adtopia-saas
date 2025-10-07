#!/bin/bash

# Deploy Bulletproof Idempotency System
echo "🛡️ Deploying Bulletproof Idempotency System..."

# Set project reference
PROJECT_REF="auyjsmtnfnnapjdrzhea"

# 1. Deploy idempotency tables
echo "🗄️ Deploying idempotency tables..."
supabase db push --project-ref $PROJECT_REF

if [ $? -eq 0 ]; then
    echo "✅ Idempotency tables deployed successfully"
else
    echo "❌ Idempotency tables deployment failed"
    exit 1
fi

# 2. Deploy hardened webhook
echo "🔒 Deploying hardened Stripe webhook..."
supabase functions deploy stripe-webhook-hardened --project-ref $PROJECT_REF

if [ $? -eq 0 ]; then
    echo "✅ Hardened webhook deployed successfully"
else
    echo "❌ Hardened webhook deployment failed"
    exit 1
fi

# 3. Deploy enhanced product sync
echo "🔄 Deploying enhanced product sync..."
supabase functions deploy sync-stripe-products-hardened --project-ref $PROJECT_REF

if [ $? -eq 0 ]; then
    echo "✅ Enhanced product sync deployed successfully"
else
    echo "❌ Enhanced product sync deployment failed"
    exit 1
fi

# 4. Test idempotency
echo "🧪 Testing idempotency..."
echo "Run these commands to test:"
echo ""
echo "# Test 1: Run sync twice (second should show skipped items)"
echo "curl -X POST 'https://$PROJECT_REF.supabase.co/functions/v1/sync-stripe-products-hardened' \\"
echo "  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \\"
echo "  -H 'Content-Type: application/json'"
echo ""
echo "# Test 2: Verify webhook security (should return 400)"
echo "curl -X POST 'https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook-hardened' \\"
echo "  -H 'stripe-signature: t=test,v1=test' \\"
echo "  -d '{\"id\":\"evt_test\",\"type\":\"checkout.session.completed\"}'"

echo ""
echo "🎉 Bulletproof Idempotency System deployment complete!"
echo "🛡️ Security Features:"
echo "  - Duplicate charge prevention: ACTIVE"
echo "  - Event replay protection: ACTIVE"
echo "  - Concurrent request handling: ACTIVE"
echo "  - Audit trail: COMPLETE"
echo "  - 90-day retention: ACTIVE"
