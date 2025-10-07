// AdTopia App Configuration - Single Source of Truth
// All pricing and product information centralized here

export const APP_CONFIG = {
  // App Information
  name: "AdTopia",
  tagline: "AI-Powered QR Code Marketing Platform",
  description: "Transform your business with intelligent QR code marketing solutions",
  
  // Contact Information
  supportEmail: "support@adtopia.io",
  salesEmail: "sales@adtopia.io",
  
  // Pricing Tiers - Single Source of Truth
  PRICING: {
    STARTER: {
      id: "starter",
      name: "Starter Package",
      price: 29,
      priceDisplay: "$29",
      description: "7-day live preview • QR code ready • Mobile responsive",
      features: [
        "QR Code Generation",
        "7-day Live Preview", 
        "Mobile Responsive Design",
        "Email Support",
        "Basic Analytics"
      ],
      stripeLink: "https://buy.stripe.com/4gM5kCfCfghHeAnaFNbfO07",
      popular: false
    },
    
    BASIC: {
      id: "basic",
      name: "Basic Package", 
      price: 79,
      priceDisplay: "$79",
      description: "30-day extended preview • Domain hold • SSL setup • Email support",
      features: [
        "QR Code Generation",
        "30-day Extended Preview",
        "Domain + SSL Setup",
        "Email Support",
        "Advanced Analytics",
        "Priority Setup"
      ],
      stripeLink: "https://buy.stripe.com/dRmbJ0cq37Lb0JxdRZbfO08",
      popular: true
    },
    
    PRO: {
      id: "pro",
      name: "Pro Package",
      price: 149,
      priceDisplay: "$149", 
      description: "Dual-language ads • Priority setup • Advanced analytics • Phone support",
      features: [
        "QR Code Generation",
        "Dual-language Support",
        "Priority Setup",
        "Advanced Analytics",
        "Phone Support",
        "Custom Branding",
        "A/B Testing"
      ],
      stripeLink: "https://buy.stripe.com/fZu8wO9dRfdDfErbJRbfO09",
      popular: false
    },
    
    ULTIMATE: {
      id: "ultimate",
      name: "Ultimate Package",
      price: 297,
      priceDisplay: "$297",
      description: "5 custom SEO ad cards • 12 months hosting • Free domain + SSL • Dual-language support • Premium analytics/support",
      features: [
        "5 Custom SEO Ad Cards",
        "12 Months Hosting",
        "Free Domain + SSL",
        "Dual-language Support", 
        "Premium Analytics",
        "Dedicated Support",
        "White-label Options",
        "API Access"
      ],
      stripeLink: "https://buy.stripe.com/14AfZg1LpaXn0JxcNVbfO0a",
      popular: false
    }
  },
  
  // Add-ons
  ADDONS: {
    TRANSLATION: {
      id: "translation",
      name: "Extra Translation",
      price: 29,
      priceDisplay: "$29",
      description: "Add a translated ad card • Reach bilingual markets",
      stripeLink: "https://buy.stripe.com/test_translation"
    },
    
    DOMAIN_SSL: {
      id: "domain_ssl", 
      name: "Domain + SSL",
      price: 49,
      priceDisplay: "$49",
      description: "Professional domain • SSL encryption • 1-year included",
      stripeLink: "https://buy.stripe.com/test_domain_ssl"
    },
    
    EXTRA_CARDS: {
      id: "extra_cards",
      name: "Extra Cards", 
      price: 39,
      priceDisplay: "$39",
      description: "Add more ad cards • Expand campaigns",
      stripeLink: "https://buy.stripe.com/test_extra_cards"
    },
    
    ANALYTICS: {
      id: "analytics",
      name: "Premium Analytics",
      price: 19,
      priceDisplay: "$19", 
      description: "Advanced tracking • Conversion metrics",
      stripeLink: "https://buy.stripe.com/test_analytics"
    },
    
    SOCIAL_PACK: {
      id: "social_pack",
      name: "Social Media Pack",
      price: 35,
      priceDisplay: "$35",
      description: "Facebook + Instagram ready • Craigslist optimized • One-click sharing",
      stripeLink: "https://buy.stripe.com/test_social_pack"
    }
  },
  
  // Analytics Tiers
  ANALYTICS: {
    BASIC: {
      id: "analytics_basic",
      name: "Basic Analytics",
      price: 0,
      priceDisplay: "Free",
      description: "Basic tracking and insights",
      features: ["Page Views", "Click Tracking", "Basic Reports"]
    },
    
    PRO: {
      id: "analytics_pro", 
      name: "Pro Analytics",
      price: 149,
      priceDisplay: "$149",
      description: "Advanced analytics and insights",
      features: [
        "Advanced Tracking",
        "Conversion Metrics", 
        "Custom Reports",
        "Real-time Data",
        "Export Options"
      ],
      stripeLink: "https://buy.stripe.com/test_analytics_pro"
    },
    
    ENTERPRISE: {
      id: "analytics_enterprise",
      name: "Enterprise Analytics", 
      price: 299,
      priceDisplay: "$299",
      description: "Enterprise-grade analytics and reporting",
      features: [
        "Advanced Tracking",
        "Conversion Metrics",
        "Custom Reports", 
        "Real-time Data",
        "Export Options",
        "API Access",
        "Custom Dashboards",
        "White-label Reports"
      ],
      stripeLink: "https://buy.stripe.com/test_analytics_enterprise"
    }
  },
  
  // Redirect URLs
  REDIRECT_URLS: {
    SUCCESS: "https://adtopia-saas-px0hs5t1z-omnia-group.vercel.app/payment-success",
    CANCEL: "https://adtopia-saas-px0hs5t1z-omnia-group.vercel.app/payment-cancel"
  },
  
  // Feature Flags
  FEATURES: {
    ANALYTICS_ENABLED: true,
    MULTI_LANGUAGE: true,
    WHITE_LABEL: true,
    API_ACCESS: true
  }
};

// Helper functions for easy access
export const getPricing = (tier: keyof typeof APP_CONFIG.PRICING) => APP_CONFIG.PRICING[tier];
export const getAddon = (addon: keyof typeof APP_CONFIG.ADDONS) => APP_CONFIG.ADDONS[addon];
export const getAnalyticsTier = (tier: keyof typeof APP_CONFIG.ANALYTICS) => APP_CONFIG.ANALYTICS[tier];

// Get all pricing tiers as array
export const getAllPricingTiers = () => Object.values(APP_CONFIG.PRICING);
export const getAllAddons = () => Object.values(APP_CONFIG.ADDONS);
export const getAllAnalyticsTiers = () => Object.values(APP_CONFIG.ANALYTICS);

// Get popular pricing tier
export const getPopularTier = () => Object.values(APP_CONFIG.PRICING).find(tier => tier.popular);

// Calculate total with addons
export const calculateTotal = (baseTier: keyof typeof APP_CONFIG.PRICING, addons: (keyof typeof APP_CONFIG.ADDONS)[] = []) => {
  const basePrice = APP_CONFIG.PRICING[baseTier].price;
  const addonPrices = addons.reduce((total, addon) => total + APP_CONFIG.ADDONS[addon].price, 0);
  return basePrice + addonPrices;
};
