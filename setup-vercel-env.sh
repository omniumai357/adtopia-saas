#!/bin/bash

# 🚀 VERCEL ENVIRONMENT SETUP SCRIPT
# Sets up all required environment variables for AdTopia SaaS

echo "🔧 Setting up Vercel environment variables..."

# Supabase Configuration
echo "📊 Setting Supabase variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://xwszqfmduotxjutlnyls.supabase.co"

# Note: You'll need to get the real anon key from your Supabase dashboard
echo "⚠️  You need to set NEXT_PUBLIC_SUPABASE_ANON_KEY manually:"
echo "   Go to: https://supabase.com/dashboard/project/xwszqfmduotxjutlnyls/settings/api"
echo "   Copy the 'anon public' key and run:"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"

# Stripe Configuration (you'll need real keys)
echo "💳 Setting Stripe variables..."
echo "⚠️  You need to set these manually with your real Stripe keys:"
echo "   vercel env add STRIPE_SECRET_KEY production"
echo "   vercel env add STRIPE_WEBHOOK_SECRET production"

# Email Configuration
echo "📧 Setting email variables..."
echo "⚠️  You need to set RESEND_API_KEY manually:"
echo "   vercel env add RESEND_API_KEY production"

# Service Role Key (sensitive - set manually)
echo "🔐 You need to set SUPABASE_SERVICE_ROLE_KEY manually:"
echo "   Go to: https://supabase.com/dashboard/project/xwszqfmduotxjutlnyls/settings/api"
echo "   Copy the 'service_role' key and run:"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"

echo ""
echo "✅ Environment setup complete!"
echo "🔗 Your app is live at: https://adtopia-saas.vercel.app/"
echo ""
echo "📋 Next steps:"
echo "1. Set the remaining environment variables manually"
echo "2. Redeploy: vercel --prod"
echo "3. Test all functionality"
