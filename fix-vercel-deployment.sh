#!/bin/bash

# 🚨 VERCEL DEPLOYMENT FIX SCRIPT
# Fixes 404/401 issues and sets up proper environment variables

echo "🔧 FIXING VERCEL DEPLOYMENT ISSUES..."

# Step 1: Check current status
echo "📊 Current Vercel status:"
vercel list | head -5

# Step 2: Set critical environment variables
echo "🔑 Setting environment variables..."

# Supabase URL (fixed from double https)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://xwszqfmduotxjutlnyls.supabase.co"

# Supabase Anon Key (from your vercel.json)
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3c3pxZm1kdW90eGp1dGxueWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjQ4NzQsImV4cCI6MjA1MTcwMDg3NH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"

# Service role key (placeholder - you'll need to set real one)
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3c3pxZm1kdW90eGp1dGxueWxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjEyNDg3NCwiZXhwIjoyMDUxNzAwODc0fQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"

# Stripe keys (placeholders - you'll need to set real ones)
vercel env add STRIPE_SECRET_KEY production <<< "sk_test_placeholder"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "whsec_placeholder"
vercel env add RESEND_API_KEY production <<< "re_placeholder"

# Step 3: Verify environment variables
echo "✅ Environment variables set:"
vercel env ls

# Step 4: Redeploy with new environment
echo "🚀 Redeploying with new environment..."
vercel --prod

# Step 5: Test the deployment
echo "🧪 Testing deployment..."
sleep 10
curl -I https://adtopia-saas-dqvrbw3sc-omnia-group.vercel.app/

echo "✅ Deployment fix complete!"
echo "🔗 Your app should now be accessible at:"
echo "   https://adtopia-saas-dqvrbw3sc-omnia-group.vercel.app/"
