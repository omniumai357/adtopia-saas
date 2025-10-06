#!/bin/bash
echo "🚀 AdTopia Deployment Script"

# Run preflight checks
echo "Step 1: Running preflight verification..."
bash scripts/preflight.sh

# Check if preflight passed
if [ $? -ne 0 ]; then
    echo "❌ Preflight checks failed. Please fix issues before deploying."
    exit 1
fi

# Build the project
echo "Step 2: Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors."
    exit 1
fi

# Deploy to Vercel
echo "Step 3: Deploying to Vercel..."
vercel deploy --prebuilt

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo "✅ Deployment complete!"
echo "🔍 Monitor Supabase logs & Stripe webhooks post-deploy."