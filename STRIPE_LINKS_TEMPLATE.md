# AdTopia Stripe Payment Links

## 🔗 **REPLACE THESE WITH YOUR ACTUAL STRIPE LINKS**

Once you create the payment links in Stripe Dashboard, replace the URLs below:

```typescript
// Update src/config/stripeConfig.ts with your real URLs
export const STRIPE_LINKS = {
  // Core Packages
  PREVIEW: "https://buy.stripe.com/REPLACE_WITH_YOUR_PREVIEW_LINK", // $29
  BASIC: "https://buy.stripe.com/REPLACE_WITH_YOUR_BASIC_LINK", // $79
  PRO: "https://buy.stripe.com/REPLACE_WITH_YOUR_PRO_LINK", // $149
  FULL_PACKAGE: "https://buy.stripe.com/REPLACE_WITH_YOUR_FULL_LINK", // $297
  
  // Add-ons
  TRANSLATION: "https://buy.stripe.com/REPLACE_WITH_YOUR_TRANSLATION_LINK", // $29
  DOMAIN_SSL: "https://buy.stripe.com/REPLACE_WITH_YOUR_DOMAIN_LINK", // $49
  EXTRA_CARDS: "https://buy.stripe.com/REPLACE_WITH_YOUR_EXTRA_LINK", // $39
  ANALYTICS: "https://buy.stripe.com/REPLACE_WITH_YOUR_ANALYTICS_LINK", // $19
  SOCIAL_PACK: "https://buy.stripe.com/REPLACE_WITH_YOUR_SOCIAL_LINK", // $35
};
```

## 📋 **STRIPE DASHBOARD CHECKLIST**

- [ ] Create 9 payment links in Stripe Dashboard
- [ ] Set success URL: `https://adtopia-saas-mgolqcide-omnia-group.vercel.app/payment-success`
- [ ] Set cancel URL: `https://adtopia-saas-mgolqcide-omnia-group.vercel.app/payment-cancel`
- [ ] Copy each payment link URL
- [ ] Update `src/config/stripeConfig.ts` with real URLs
- [ ] Test one payment link end-to-end

## 🎯 **NEXT STEPS**

1. **Create payment links** in Stripe Dashboard (5 minutes)
2. **Update config file** with real URLs (2 minutes)
3. **Deploy changes** to Vercel (1 minute)
4. **Test payment flow** end-to-end (2 minutes)

**Total time: 10 minutes to go live!** 🚀
