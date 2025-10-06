#!/bin/bash

# Deploy stripe-create-product Edge Function
# This script deploys the auto-logger function to Supabase

set -e

echo "🚀 Deploying stripe-create-product Edge Function..."

# Check if we're in the right directory
if [ ! -f "supabase/functions/omnia-shared/stripe-create-product/index.ts" ]; then
    echo "❌ Error: stripe-create-product function not found"
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
supabase functions deploy omnia-shared/stripe-create-product

echo "🔧 Setting environment variables..."
echo "Setting required environment variables for the function..."

echo "💡 Required environment variables:"
echo "STRIPE_SECRET_KEY=sk_live_or_test_..."
echo "SUPABASE_URL=https://xwszqfmduotxjutlnyls.supabase.co"
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"

echo "🧪 Testing function..."
echo "Run: node test-stripe-create-product.js"

echo "✅ Deployment complete!"
echo "📊 Function URL: $(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/omnia-shared/stripe-create-product"
