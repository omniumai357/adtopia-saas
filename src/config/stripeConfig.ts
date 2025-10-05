// AdTopia Stripe Payment Links Configuration
// Replace these with your actual Stripe payment links

export const STRIPE_LINKS = {
  // Core Packages
  PREVIEW: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $29 Preview
  FULL_PACKAGE: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $297 Full Package
  
  // Add-ons
  TRANSLATION: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $29 Translation
  DOMAIN_SSL: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $49 Domain+SSL
  EXTRA_CARDS: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $39 Extra Cards
  ANALYTICS: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $19 Analytics
  SOCIAL_PACK: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // $35 Social Pack
  
  // Enterprise
  ENTERPRISE: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // Custom pricing
  WHITE_LABEL: "https://buy.stripe.com/test_14k8wA0qH0qH0qH0qH", // Reseller program
};

export const PACKAGES = {
  PREVIEW: {
    name: "Preview",
    price: 29,
    description: "See your QR code in action",
    features: ["QR Code Generation", "24h Delivery", "Email Support"],
    stripeLink: STRIPE_LINKS.PREVIEW
  },
  FULL_PACKAGE: {
    name: "Full Package", 
    price: 297,
    description: "Complete setup + 3 months support",
    features: ["QR Code Generation", "Custom Design", "3 Months Support", "Analytics Dashboard", "Priority Support"],
    stripeLink: STRIPE_LINKS.FULL_PACKAGE
  }
};

// Redirect URLs for Stripe
export const REDIRECT_URLS = {
  SUCCESS: "https://adtopia-saas-mgolqcide-omnia-group.vercel.app/payment-success",
  CANCEL: "https://adtopia-saas-mgolqcide-omnia-group.vercel.app/payment-cancel"
};
