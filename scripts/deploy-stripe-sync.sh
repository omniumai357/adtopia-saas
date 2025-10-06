#!/bin/bash

# Deploy stripe-sync-products Edge Function
# This script deploys the sync function to Supabase

set -e

echo "🚀 Deploying stripe-sync-products Edge Function..."

# Check if we're in the right directory
if [ ! -f "supabase/functions/omnia-shared/stripe-sync-products/index.ts" ]; then
    echo "❌ Error: stripe-sync-products function not found"
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
supabase functions deploy omnia-shared/stripe-sync-products

echo "🔧 Setting up cron scheduling..."
echo "Setting up daily sync at midnight UTC..."

echo "💡 To set up cron scheduling, run this SQL in Supabase SQL Editor:"
echo ""
echo "select cron.schedule("
echo "  'stripe_sync_daily',"
echo "  '0 0 * * *',"
echo "  \$\$"
echo "  select net.http_post("
echo "    url := 'https://xwszqfmduotxjutlnyls.functions.supabase.co/stripe-sync-products',"
echo "    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('service_role_key')),"
echo "    body := '{}'"
echo "  );"
echo "  \$\$"
echo ");"
echo ""

echo "🧪 Testing function..."
echo "Run: node test-stripe-sync.js"

echo "✅ Deployment complete!"
echo "📊 Function URL: $(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/omnia-shared/stripe-sync-products"
