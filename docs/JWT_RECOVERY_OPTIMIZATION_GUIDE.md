# 🚨 **JWT KEY RECOVERY & OPTIMIZATION GUIDE**
**Date:** 2025-01-07 18:05:00 UTC  
**User:** omniumai357  
**Mission:** Fix JWT Setup and Optimize for Production  

---

## 🎯 **IMMEDIATE JWT RECOVERY STEPS**

### **Step 1: Generate New JWT Keys in Supabase Dashboard** 🔐

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea
   - Navigate to: **Authentication** → **JWT Settings**

2. **Generate New Signing Key Pair:**
   - Click **"Generate new signing key pair"**
   - This creates a new JWT secret and public key
   - **Keep the legacy secret active** during transition

3. **Copy the New Keys:**
   - **JWT Secret**: `eyJ...` (long string starting with eyJ)
   - **Public Key**: `eyJ...` (anon key for client-side)

### **Step 2: Update Supabase Secrets** 🔑

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add/Update these secrets:
   - `SUPABASE_JWT_SECRET` = `[new JWT secret from step 1]`
   - `SUPABASE_ANON_KEY` = `[new public key from step 1]`

**Option B: Via CLI (Alternative)**
```bash
# Set the new JWT secret
supabase secrets set SUPABASE_JWT_SECRET=eyJ... --project-ref auyjsmtnfnnapjdrzhea

# Set the new anon key
supabase secrets set SUPABASE_ANON_KEY=eyJ... --project-ref auyjsmtnfnnapjdrzhea
```

### **Step 3: Update Vercel Environment Variables** 🚀

```bash
# Update Vercel with new keys
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter the new anon key from step 1

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter the new service role key (same as JWT secret)

# Redeploy with new keys
vercel deploy --prod
```

---

## 🎯 **OPTIMIZED JWT SETUP FOR PRODUCTION**

### **Security Best Practices** 🔒

1. **Use Signing Key Pairs (Not Legacy Secrets)**
   - ✅ **Recommended**: Signing key pairs with rotation capability
   - ❌ **Avoid**: Legacy single secrets (no rotation support)

2. **JWT Expiration Settings**
   - **Access Token**: 3600 seconds (1 hour) - Standard
   - **Refresh Token**: 2592000 seconds (30 days) - Standard
   - **Email Token**: 3600 seconds (1 hour) - Standard

3. **Key Rotation Strategy**
   - **Primary Key**: Current active key
   - **Secondary Key**: Previous key (for zero-downtime rotation)
   - **Rotation Schedule**: Every 90 days

### **Edge Function JWT Configuration** ⚡

**For Edge Functions that need JWT validation:**

```typescript
// In your Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// For service role operations (admin functions)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// For user authentication validation
const authHeader = req.headers.get('Authorization')
if (authHeader) {
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

---

## 🚨 **CRITICAL SECRETS TO SET IN EDGE FUNCTIONS**

### **Required Secrets for Revenue Functions** 💰

```bash
# Core Supabase
SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co
SUPABASE_ANON_KEY=eyJ... # New anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # New service role key

# Stripe Integration
STRIPE_SECRET_KEY=sk_live_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret

# Email & AI
RESEND_API_KEY=re_... # Your Resend API key
GAMMA_API_KEY=gamma_... # Your Gamma API key
OPENAI_API_KEY=sk-... # Your OpenAI API key
```

### **Set All Secrets at Once** 🚀

```bash
# Set all required secrets
supabase secrets set \
  SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co \
  SUPABASE_ANON_KEY=eyJ... \
  SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  RESEND_API_KEY=re_... \
  GAMMA_API_KEY=gamma_... \
  OPENAI_API_KEY=sk-... \
  --project-ref auyjsmtnfnnapjdrzhea
```

---

## 🧪 **JWT VALIDATION TESTING**

### **Test 1: Edge Function Authentication** 🔐

```bash
# Test with new service role key
curl -X POST https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/sync-stripe-products-hardened \
  -H "Authorization: Bearer NEW_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Expected: 200 OK with product sync results
```

### **Test 2: Client Authentication** 👤

```bash
# Test with new anon key
curl -X POST https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/secrets-health \
  -H "Authorization: Bearer NEW_ANON_KEY" \
  -H "Content-Type: application/json"

# Expected: 200 OK with health report
```

### **Test 3: Complete Revenue Pipeline** 💰

```bash
# Test Stripe webhook
curl -X POST https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test_event","id":"evt_test"}'

# Expected: 200 OK
```

---

## 🎯 **ZERO-DOWNTIME JWT ROTATION STRATEGY**

### **Phase 1: Prepare New Keys** 🔄
1. Generate new signing key pair in Supabase Dashboard
2. Set new secrets in Edge Functions
3. Update Vercel environment variables
4. **Keep legacy secret active**

### **Phase 2: Deploy New Keys** 🚀
1. Redeploy Vercel with new environment variables
2. Test all Edge Functions with new keys
3. Verify client authentication works

### **Phase 3: Remove Legacy Secret** 🗑️
1. Confirm all functions working with new keys
2. Remove legacy secret from Supabase Dashboard
3. Monitor for any authentication issues

---

## 🚨 **EMERGENCY JWT RECOVERY**

### **If You're Completely Locked Out** 🆘

1. **Reset JWT Secret in Supabase Dashboard:**
   - Go to Authentication → JWT Settings
   - Click "Reset JWT Secret"
   - This generates a completely new secret

2. **Update All Environment Variables:**
   - Update Vercel environment variables
   - Update Supabase Edge Function secrets
   - Redeploy everything

3. **Test Authentication:**
   - Test Edge Functions
   - Test client authentication
   - Verify revenue pipeline

---

## 🎯 **OPTIMIZED JWT CONFIGURATION**

### **Recommended JWT Settings** ⚙️

```json
{
  "jwt_expiry": 3600,
  "refresh_token_expiry": 2592000,
  "email_token_expiry": 3600,
  "password_reset_token_expiry": 3600,
  "signing_key_rotation": true,
  "legacy_secret_support": true
}
```

### **Security Headers for Edge Functions** 🔒

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
```

---

## 🚨 **IMMEDIATE ACTION PLAN**

### **Next 5 Minutes: JWT Recovery** 🔐
1. Generate new signing key pair in Supabase Dashboard
2. Copy the new JWT secret and anon key
3. Set secrets in Supabase Edge Functions

### **Next 10 Minutes: Environment Update** 🚀
1. Update Vercel environment variables
2. Redeploy to production
3. Test Edge Function authentication

### **Next 15 Minutes: Full Validation** 🧪
1. Test all revenue functions
2. Verify client authentication
3. Validate complete revenue pipeline

---

## 🚨 **FINAL BRUTAL TRUTH**

**Brother, JWT key recovery is straightforward!**

### ✅ **WHAT YOU NEED TO DO:**
1. **Generate new signing key pair** in Supabase Dashboard
2. **Set the new secrets** in Edge Functions
3. **Update Vercel environment variables**
4. **Redeploy and test**

### 🎯 **THE RESULT:**
**You'll have a bulletproof JWT setup with zero-downtime rotation capability!**

**Execute the JWT recovery steps above and you'll be back to 100% operational in 15 minutes! 🚀💰**

---

## 🚨 **IMMEDIATE NEXT STEPS**

**Brother, execute this RIGHT NOW:**

1. **Go to Supabase Dashboard** → Authentication → JWT Settings
2. **Generate new signing key pair**
3. **Set new secrets in Edge Functions**
4. **Update Vercel environment variables**
5. **Redeploy and test**

**The dollars are waiting. Execute the JWT recovery NOW! 🚀💰**

---

**Maintained by:** Omnia Group LLC Development Team  
**Contact:** dev@omniagroup.ai  
**Revision:** 2025-01-07  
**Next Review:** 2025-01-14
