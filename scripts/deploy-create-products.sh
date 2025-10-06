#!/bin/bash

# Deploy create-products Edge Function
# This script deploys the fixed create-products function to Supabase

set -e

echo "🚀 Deploying create-products Edge Function..."

# Check if we're in the right directory
if [ ! -f "supabase/functions/create-products/index.ts" ]; then
    echo "❌ Error: create-products function not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Please install it: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if ! supabase status &> /dev/null; then
    echo "❌ Error: Supabase project not linked"
    echo "Please link your project: supabase link"
    exit 1
fi

echo "📦 Deploying function..."
supabase functions deploy create-products

echo "🔧 Setting environment variables..."
echo "Setting TEST_MODE=true for safe testing..."
supabase secrets set TEST_MODE=true

echo "💡 To set Stripe keys (when ready for production):"
echo "supabase secrets set STRIPE_SECRET_KEY=sk_live_or_test_..."
echo "supabase secrets set SUPABASE_SERVICE_KEY=your-service-key"

echo "🧪 Testing function..."
echo "Run: node test-create-products.js"

echo "✅ Deployment complete!"
echo "📊 Function URL: $(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/create-products"
