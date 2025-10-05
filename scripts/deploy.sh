#!/bin/bash

# AdTopia Multi-Product Deployment Script
# Deploys AdTopia-SaaS (marketing funnel) and Supabase functions

echo "🚀 AdTopia Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in adtopia-saas directory"
    exit 1
fi

echo "📦 Deploying AdTopia-SaaS to Vercel..."

# Deploy to Vercel
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ AdTopia-SaaS deployed successfully"
else
    echo "❌ Vercel deployment failed"
    exit 1
fi

echo "🔧 Deploying Supabase functions..."

# Deploy Stripe webhook function
supabase functions deploy stripe-webhook

if [ $? -eq 0 ]; then
    echo "✅ Stripe webhook deployed successfully"
else
    echo "❌ Supabase function deployment failed"
    exit 1
fi

echo "🎉 Deployment complete!"
echo ""
echo "📊 Live URLs:"
echo "• AdTopia-SaaS: https://adtopia-saas-mgolqcide-omnia-group.vercel.app"
echo "• GitHub: https://github.com/omniumai357/adtopia-saas"
echo "• Vercel Dashboard: https://vercel.com/omnia-group/adtopia-saas"
echo ""
echo "🔗 Next Steps:"
echo "1. Upload gallery images to /public/gallery/"
echo "2. Update Stripe links in src/config/stripeConfig.ts"
echo "3. Set environment variables in Vercel"
echo "4. Test payment flow end-to-end"
