#!/bin/bash

# 🚀 SETUP REAL ENVIRONMENT VARIABLES FOR ADTOPIA SAAS
# This script helps you set up the real environment variables

echo "🔧 Setting up real environment variables for AdTopia SaaS..."
echo ""

# Step 1: Get Supabase keys
echo "📊 STEP 1: Get Supabase Keys"
echo "Go to: https://supabase.com/dashboard/project/xwszqfmduotxjutlnyls/settings/api"
echo "Copy the 'anon public' and 'service_role' keys"
echo ""

# Step 2: Get Stripe keys
echo "💳 STEP 2: Get Stripe Keys"
echo "Go to: https://dashboard.stripe.com/apikeys"
echo "Copy your 'Secret key' and create a webhook secret"
echo ""

# Step 3: Get Resend key
echo "📧 STEP 3: Get Resend Key"
echo "Go to: https://resend.com/api-keys"
echo "Copy your API key"
echo ""

echo "🔧 STEP 4: Set Environment Variables in Vercel"
echo "Run these commands with your real keys:"
echo ""

echo "# Supabase Configuration"
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "# Value: https://xwszqfmduotxjutlnyls.supabase.co"
echo ""

echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo "# Value: [Get from Supabase dashboard]"
echo ""

echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "# Value: [Get from Supabase dashboard]"
echo ""

echo "# Stripe Configuration"
echo "vercel env add STRIPE_SECRET_KEY production"
echo "# Value: [Get from Stripe dashboard]"
echo ""

echo "vercel env add STRIPE_WEBHOOK_SECRET production"
echo "# Value: [Create webhook in Stripe dashboard]"
echo ""

echo "# Email Configuration"
echo "vercel env add RESEND_API_KEY production"
echo "# Value: [Get from Resend dashboard]"
echo ""

echo "🚀 STEP 5: After setting all variables, redeploy:"
echo "vercel --prod"
echo ""

echo "✅ This will make your AdTopia SaaS fully functional!"
echo "🔗 Live at: https://adtopia-saas.vercel.app/"
