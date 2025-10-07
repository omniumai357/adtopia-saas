#!/bin/bash

# 🔄 SYNC ENVIRONMENT VARIABLES ACROSS VERCEL PROJECTS
# This script helps you copy environment variables from bizbox-host to adtopia-saas

echo "🔄 Syncing environment variables from bizbox-host to adtopia-saas..."
echo ""

# Step 1: Check current adtopia-saas environment
echo "📊 Current adtopia-saas environment variables:"
vercel env ls --scope omnia-group --project adtopia-saas

echo ""
echo "🔧 To copy from bizbox-host, you have two options:"
echo ""

echo "OPTION 1: Use Vercel Web Dashboard (Recommended)"
echo "1. Go to: https://vercel.com/omnia-group/bizbox-host/settings/environment-variables"
echo "2. Copy each variable value"
echo "3. Go to: https://vercel.com/omnia-group/adtopia-saas/settings/environment-variables"
echo "4. Add each variable with the same values"
echo ""

echo "OPTION 2: Use CLI (if you have the values)"
echo "Run these commands with the actual values from bizbox-host:"
echo ""

# Common environment variables that should be shared
echo "# Supabase Configuration"
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL production --scope omnia-group --project adtopia-saas"
echo "# Value: https://xwszqfmduotxjutlnyls.supabase.co"
echo ""

echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --scope omnia-group --project adtopia-saas"
echo "# Value: [Get from bizbox-host dashboard]"
echo ""

echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production --scope omnia-group --project adtopia-saas"
echo "# Value: [Get from bizbox-host dashboard]"
echo ""

echo "# Stripe Configuration"
echo "vercel env add STRIPE_SECRET_KEY production --scope omnia-group --project adtopia-saas"
echo "# Value: [Get from bizbox-host dashboard]"
echo ""

echo "vercel env add STRIPE_WEBHOOK_SECRET production --scope omnia-group --project adtopia-saas"
echo "# Value: [Get from bizbox-host dashboard]"
echo ""

echo "# Email Configuration"
echo "vercel env add RESEND_API_KEY production --scope omnia-group --project adtopia-saas"
echo "# Value: [Get from bizbox-host dashboard]"
echo ""

echo "# AI Configuration (if needed)"
echo "vercel env add OPENAI_API_KEY production --scope omnia-group --project adtopia-saas"
echo "vercel env add OPENROUTER_API_KEY production --scope omnia-group --project adtopia-saas"
echo ""

echo "🚀 After setting all variables, redeploy:"
echo "vercel --prod --scope omnia-group --project adtopia-saas"
echo ""

echo "✅ This will ensure both projects use the same:"
echo "   - Supabase database and keys"
echo "   - Stripe payment processing"
echo "   - Email service configuration"
echo "   - AI service keys"
