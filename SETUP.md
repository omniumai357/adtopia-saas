# AdTopia Multi-Product Setup Guide

## 🎯 **QUICK START (5 Minutes)**

### **1. Environment Variables Setup**

#### **Vercel Environment Variables**
Go to: https://vercel.com/omnia-group/adtopia-saas/settings/environment-variables

Add these variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=re_your_resend_key
```

#### **Supabase Environment Variables**
```bash
# Set in Supabase Dashboard → Settings → Edge Functions
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### **2. Stripe Payment Links Setup**

Update `src/config/stripeConfig.ts` with your real Stripe payment links:

```typescript
export const STRIPE_LINKS = {
  PREVIEW: "https://buy.stripe.com/your_preview_link", // $29
  FULL_PACKAGE: "https://buy.stripe.com/your_full_link", // $297
  TRANSLATION: "https://buy.stripe.com/your_translation_link", // $29
  DOMAIN_SSL: "https://buy.stripe.com/your_domain_link", // $49
  EXTRA_CARDS: "https://buy.stripe.com/your_extra_link", // $39
  ANALYTICS: "https://buy.stripe.com/your_analytics_link", // $19
  SOCIAL_PACK: "https://buy.stripe.com/your_social_link", // $35
};
```

### **3. Gallery Images Upload**

Upload 10 images to these exact paths:
```
/public/gallery/en/card1.jpg
/public/gallery/en/card2.jpg
/public/gallery/en/card3.jpg
/public/gallery/en/card4.jpg
/public/gallery/en/card5.jpg
/public/gallery/es/card1.jpg
/public/gallery/es/card2.jpg
/public/gallery/es/card3.jpg
/public/gallery/es/card4.jpg
/public/gallery/es/card5.jpg
```

### **4. Supabase Database Setup**

#### **Create New Supabase Project**
```bash
# Create project
supabase projects create adtopia-db

# Link to project
supabase link --project-ref your_project_ref

# Deploy schema
supabase db push
```

#### **Deploy Edge Functions**
```bash
# Deploy Stripe webhook
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### **5. Stripe Webhook Configuration**

In Stripe Dashboard → Developers → Webhooks:
- **URL**: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
- **Events**: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🚀 **DEPLOYMENT COMMANDS**

### **Deploy Everything**
```bash
cd ~/adtopia-saas
./scripts/deploy.sh
```

### **Manual Deployment**
```bash
# Deploy to Vercel
vercel --prod --yes

# Deploy Supabase functions
supabase functions deploy stripe-webhook
```

### **Git Workflow**
```bash
# Make changes
git add .
git commit -m "Feature: description"
git push origin main

# Auto-deploys to Vercel in 19 seconds
```

## 🔧 **TROUBLESHOOTING**

### **Build Issues**
```bash
# Check Vercel logs
vercel logs --follow

# Force redeploy
vercel --prod --force
```

### **Supabase Issues**
```bash
# Check function logs
supabase functions logs stripe-webhook

# Redeploy functions
supabase functions deploy stripe-webhook --no-verify-jwt
```

### **Git Sync Issues**
```bash
# Check remote
git remote -v

# Force push if needed
git push origin main --force
```

## 📊 **VALIDATION CHECKLIST**

- [ ] AdTopia-SaaS deployed to Vercel
- [ ] Supabase project created and linked
- [ ] Stripe webhook deployed and configured
- [ ] Environment variables set in Vercel
- [ ] Gallery images uploaded
- [ ] Stripe payment links updated
- [ ] End-to-end payment flow tested

## 🎯 **REVENUE READY CHECKLIST**

- [ ] Landing page with bilingual support
- [ ] Stripe checkout integration
- [ ] Payment success/cancel pages
- [ ] Gallery with social proof
- [ ] Email automation ready
- [ ] Analytics tracking active

## 🔗 **LIVE URLS**

- **Production**: https://adtopia-saas-mgolqcide-omnia-group.vercel.app
- **GitHub**: https://github.com/omniumai357/adtopia-saas
- **Vercel**: https://vercel.com/omnia-group/adtopia-saas

## 📞 **SUPPORT**

- **Email**: beta@bizbox.host
- **Documentation**: See ARCHITECTURE.md for full system overview
- **Issues**: Create GitHub issues for bugs or feature requests

---

**Ready to launch and start generating revenue!** 🚀
