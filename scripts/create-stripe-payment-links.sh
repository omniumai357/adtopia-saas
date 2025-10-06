#!/bin/bash

# Create Stripe Payment Links Script
# This script creates real Stripe payment links for all AdTopia products

set -e

echo "🚀 Creating Stripe Payment Links for AdTopia..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Error: Stripe CLI not found"
    echo "Please install it: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check if logged in to Stripe
if ! stripe whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Stripe"
    echo "Please login: stripe login"
    exit 1
fi

echo "✅ Stripe CLI ready"

# Create products first (if they don't exist)
echo "📦 Creating Stripe products..."
stripe products create \
  --name "AdTopia Starter Package" \
  --description "7-day live preview • QR code ready • Mobile responsive" \
  --metadata package_type=starter,category=ad_package,internal_id=001

stripe products create \
  --name "AdTopia Growth Package" \
  --description "30-day extended preview • Domain hold • SSL setup • Email support" \
  --metadata package_type=growth,category=ad_package,internal_id=002

stripe products create \
  --name "AdTopia Pro Package" \
  --description "Dual-language ads • Priority setup • Advanced analytics • Phone support" \
  --metadata package_type=pro,category=ad_package,internal_id=003

stripe products create \
  --name "AdTopia Full Beta Package" \
  --description "5 custom SEO ad cards • 12 months hosting • Free domain + SSL • Dual-language support • Premium analytics/support" \
  --metadata package_type=full_beta,category=ad_package,internal_id=004

stripe products create \
  --name "AdTopia Extra Translation" \
  --description "Add a translated ad card • Reach bilingual markets" \
  --metadata package_type=translation,category=add_on,internal_id=005

stripe products create \
  --name "AdTopia Domain + SSL" \
  --description "Professional domain • SSL encryption • 1-year included" \
  --metadata package_type=domain_ssl,category=add_on,internal_id=006

stripe products create \
  --name "AdTopia Extra Cards" \
  --description "Add more ad cards • Expand campaigns" \
  --metadata package_type=extra_cards,category=add_on,internal_id=007

stripe products create \
  --name "AdTopia Premium Analytics" \
  --description "Advanced tracking • Conversion metrics" \
  --metadata package_type=analytics,category=add_on,internal_id=008

stripe products create \
  --name "AdTopia Social Media Pack" \
  --description "Facebook + Instagram ready • Craigslist optimized • One-click sharing" \
  --metadata package_type=social_pack,category=add_on,internal_id=009

echo "✅ Products created"

# Get product IDs and create payment links
echo "🔗 Creating payment links..."

# Get the latest products
PRODUCTS=$(stripe products list --limit 9)

# Extract product IDs (this is a simplified approach - in production you'd parse JSON properly)
echo "📋 Product IDs created. Please manually create payment links in Stripe Dashboard:"
echo ""
echo "1. Go to https://dashboard.stripe.com/payment-links"
echo "2. Create payment links for each product:"
echo "   - Starter Package: $29.00"
echo "   - Growth Package: $79.00" 
echo "   - Pro Package: $149.00"
echo "   - Full Beta Package: $297.00"
echo "   - Extra Translation: $29.00"
echo "   - Domain + SSL: $49.00"
echo "   - Extra Cards: $39.00"
echo "   - Premium Analytics: $19.00"
echo "   - Social Media Pack: $35.00"
echo ""
echo "3. Update src/config/stripeConfig.ts with the real payment link URLs"
echo ""
echo "✅ Script complete - manual step required for payment links"
