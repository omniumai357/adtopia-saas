# 🔄 ENVIRONMENT VARIABLES SYNC GUIDE

## 🎯 **GOAL**
Copy all environment variables from `bizbox-host` to `adtopia-saas` so both projects share the same:
- Supabase database and keys
- Stripe payment processing
- Email service configuration
- AI service keys

## 📊 **CURRENT STATUS**
- ✅ `adtopia-saas` has: `NEXT_PUBLIC_SUPABASE_URL`
- ⚠️ Need to copy from `bizbox-host`: All other variables

## 🚀 **METHOD 1: Vercel Web Dashboard (Recommended)**

### **Step 1: Get Variables from bizbox-host**
1. Go to: https://vercel.com/omnia-group/bizbox-host/settings/environment-variables
2. Copy each variable value (click the eye icon to reveal)

### **Step 2: Add to adtopia-saas**
1. Go to: https://vercel.com/omnia-group/adtopia-saas/settings/environment-variables
2. Click "Add New" for each variable
3. Set Environment to "Production"
4. Paste the value from bizbox-host

## 🔧 **METHOD 2: CLI Commands**

If you have the values, run these commands:

```bash
# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
vercel env add STRIPE_SECRET_KEY production
# Paste: sk_live_... or sk_test_...

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste: whsec_...

# Email Configuration
vercel env add RESEND_API_KEY production
# Paste: re_...

# AI Configuration (if needed)
vercel env add OPENAI_API_KEY production
# Paste: sk-...

vercel env add OPENROUTER_API_KEY production
# Paste: sk-or-...
```

## 📋 **VARIABLES TO COPY**

| Variable | Purpose | Safe to Share? |
|----------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Already set | ✅ Safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend Supabase access | ✅ Safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend Supabase access | ⚠️ Sensitive |
| `STRIPE_SECRET_KEY` | Stripe payment processing | ⚠️ Sensitive |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | ⚠️ Sensitive |
| `RESEND_API_KEY` | Email notifications | ⚠️ Sensitive |
| `OPENAI_API_KEY` | AI functionality | ⚠️ Sensitive |
| `OPENROUTER_API_KEY` | AI functionality | ⚠️ Sensitive |

## 🚀 **AFTER COPYING VARIABLES**

1. **Redeploy adtopia-saas:**
   ```bash
   vercel --prod
   ```

2. **Test functionality:**
   - Main page: https://adtopia-saas.vercel.app/
   - Admin dashboard: https://adtopia-saas.vercel.app/admin
   - Payment tester: https://adtopia-saas.vercel.app/sandbox/payment-link-tester

3. **Verify integration:**
   - Supabase connection works
   - Stripe payments work
   - Email notifications work

## 🎯 **BENEFITS OF SHARING VARIABLES**

- ✅ **Single source of truth** for all credentials
- ✅ **Consistent configuration** across projects
- ✅ **Easier maintenance** - update once, affects all
- ✅ **Cost efficiency** - shared resources
- ✅ **Unified analytics** - same Stripe account, same Supabase

## 🛡️ **SECURITY NOTES**

- ⚠️ **Never commit** environment variables to Git
- ✅ **Use Vercel's encrypted storage** for all sensitive keys
- ✅ **Rotate keys regularly** for security
- ✅ **Monitor access logs** for any unauthorized usage

---

**Once you copy these variables, your AdTopia SaaS will be fully functional and ready for revenue generation!** 🚀💰
