#!/bin/bash

# AdTopia Stripe Products Creation Script
# Run this to recreate all 9 products in your OMNIA GROUP LLC Stripe account

echo "🚀 Creating AdTopia Stripe Products..."

# Check if Stripe CLI is authenticated
if ! stripe config --list | grep -q "project-name"; then
    echo "❌ Stripe CLI not authenticated. Please run: stripe login"
    exit 1
fi

echo "✅ Stripe CLI authenticated"

# Create Products
echo "📦 Creating products..."

# 1. Preview Package - $29
stripe products create \
  --name "AdTopia Preview" \
  --description "See your QR code in action - 7-day preview with QR code generation and 24h delivery" \
  --metadata package_type=preview,category=ad_package,internal_id=001

# 2. Full Package - $297  
stripe products create \
  --name "AdTopia Full Package" \
  --description "Complete setup with 5 custom ad cards, 12 months hosting, domain + SSL included, analytics dashboard, and 3 months support" \
  --metadata package_type=full_beta,category=ad_package,internal_id=002

# 3. Pro Package - $149
stripe products create \
  --name "AdTopia Pro" \
  --description "Professional package with 3 custom ad cards, 6 months hosting, and priority support" \
  --metadata package_type=pro,category=ad_package,internal_id=003

# 4. Growth Package - $79
stripe products create \
  --name "AdTopia Growth" \
  --description "Growth-focused package with 2 custom ad cards, 3 months hosting, and email support" \
  --metadata package_type=growth,category=ad_package,internal_id=004

# 5. Starter Package - $29
stripe products create \
  --name "AdTopia Starter" \
  --description "Perfect for getting started with 1 custom ad card and basic hosting" \
  --metadata package_type=starter,category=ad_package,internal_id=005

# 6. Translation Add-on - $29
stripe products create \
  --name "Extra Translation" \
  --description "Add Spanish translation to your existing package" \
  --metadata package_type=translation,category=add_on,internal_id=006

# 7. Domain + SSL - $49
stripe products create \
  --name "Domain + SSL" \
  --description "Custom domain setup with SSL certificate included" \
  --metadata package_type=domain_ssl,category=add_on,internal_id=007

# 8. Extra Cards - $39
stripe products create \
  --name "Extra Cards" \
  --description "Additional custom ad cards for your package" \
  --metadata package_type=extra_cards,category=add_on,internal_id=008

# 9. Analytics - $19
stripe products create \
  --name "Premium Analytics" \
  --description "Advanced analytics dashboard with detailed insights" \
  --metadata package_type=analytics,category=add_on,internal_id=009

# 10. Social Media Pack - $35
stripe products create \
  --name "Social Media Pack" \
  --description "Social media templates and posting tools" \
  --metadata package_type=social_pack,category=add_on,internal_id=010

echo "✅ All products created successfully!"
echo "📋 Next steps:"
echo "1. Go to Stripe Dashboard → Products"
echo "2. Create payment links for each product"
echo "3. Copy the payment link URLs"
echo "4. Update src/config/stripeConfig.ts with real URLs"
