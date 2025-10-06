// Create Stripe Products via Supabase Edge Function
// This script uses the Stripe key already stored in Supabase secrets

const products = [
  {
    name: "Starter Package",
    description: "7-day live preview • QR code ready • Mobile responsive",
    price: 2900, // $29.00 in cents
    metadata: {
      package_type: "starter",
      category: "ad_package", 
      internal_id: "001"
    }
  },
  {
    name: "Growth Package", 
    description: "30-day extended preview • Domain hold service • SSL certificate setup • Email support",
    price: 7900, // $79.00 in cents
    metadata: {
      package_type: "growth",
      category: "ad_package",
      internal_id: "002" 
    }
  },
  {
    name: "Pro Package",
    description: "Dual-language ads • Priority setup • Advanced analytics • Phone support", 
    price: 14900, // $149.00 in cents
    metadata: {
      package_type: "pro",
      category: "ad_package",
      internal_id: "003"
    }
  },
  {
    name: "Full Beta Package",
    description: "5 custom SEO ad cards • 12 months hosting • Free domain + SSL • Dual-language support • Premium analytics/support",
    price: 29700, // $297.00 in cents
    metadata: {
      package_type: "full_beta", 
      category: "ad_package",
      internal_id: "004"
    }
  },
  {
    name: "Extra Translation",
    description: "Add a translated ad card • Reach bilingual markets",
    price: 2900, // $29.00 in cents
    metadata: {
      package_type: "translation",
      category: "add_on", 
      internal_id: "005"
    }
  },
  {
    name: "Domain + SSL",
    description: "Professional domain • SSL encryption • 1-year included",
    price: 4900, // $49.00 in cents
    metadata: {
      package_type: "domain_ssl",
      category: "add_on",
      internal_id: "006"
    }
  },
  {
    name: "Extra Cards", 
    description: "Add more ad cards • Expand campaigns",
    price: 3900, // $39.00 in cents
    metadata: {
      package_type: "extra_cards",
      category: "add_on",
      internal_id: "007"
    }
  },
  {
    name: "Premium Analytics",
    description: "Advanced tracking • Conversion metrics", 
    price: 1900, // $19.00 in cents
    metadata: {
      package_type: "analytics",
      category: "add_on",
      internal_id: "008"
    }
  },
  {
    name: "Social Media Pack",
    description: "Facebook + Instagram ready • Craigslist optimized • One-click sharing",
    price: 3500, // $35.00 in cents
    metadata: {
      package_type: "social_pack", 
      category: "add_on",
      internal_id: "009"
    }
  }
];

console.log("🚀 AdTopia Product Creation Script");
console.log("📋 Products to create:", products.length);
console.log("💰 Total revenue potential:", products.reduce((sum, p) => sum + p.price, 0) / 100, "USD");
console.log("\n📝 Next steps:");
console.log("1. Go to Stripe Dashboard → Products → Add Product");
console.log("2. Create each product with the data above");
console.log("3. Create payment links for each product");
console.log("4. Copy payment link URLs to stripeConfig.ts");

// Export for use in other scripts
module.exports = products;
