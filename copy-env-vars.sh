#!/bin/bash

# 🔄 COPY ENVIRONMENT VARIABLES ACROSS VERCEL PROJECTS
# Copies environment variables from bizbox-host to adtopia-saas

echo "🔄 Copying environment variables from bizbox-host to adtopia-saas..."

# First, let's check what's in bizbox-host
echo "📊 Checking bizbox-host environment variables..."
vercel env ls --scope omnia-group --project bizbox-host

echo ""
echo "📋 To copy variables, you'll need to:"
echo "1. Get the values from bizbox-host"
echo "2. Set them in adtopia-saas"
echo ""
echo "🔧 Manual copy commands:"

# Common environment variables that should be shared
echo "# Supabase Configuration"
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL production --scope omnia-group --project adtopia-saas"
echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --scope omnia-group --project adtopia-saas"
echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production --scope omnia-group --project adtopia-saas"
echo ""

echo "# Stripe Configuration"
echo "vercel env add STRIPE_SECRET_KEY production --scope omnia-group --project adtopia-saas"
echo "vercel env add STRIPE_WEBHOOK_SECRET production --scope omnia-group --project adtopia-saas"
echo ""

echo "# Email Configuration"
echo "vercel env add RESEND_API_KEY production --scope omnia-group --project adtopia-saas"
echo ""

echo "# Other common variables"
echo "vercel env add OPENAI_API_KEY production --scope omnia-group --project adtopia-saas"
echo "vercel env add OPENROUTER_API_KEY production --scope omnia-group --project adtopia-saas"
echo ""

echo "💡 Pro tip: You can also use Vercel's web dashboard to:"
echo "1. Go to https://vercel.com/omnia-group/bizbox-host/settings/environment-variables"
echo "2. Copy the values"
echo "3. Go to https://vercel.com/omnia-group/adtopia-saas/settings/environment-variables"
echo "4. Add them there"
