# 🚨 **JWT SIGNING KEYS ZERO-DOWNTIME UPGRADE GUIDE**
**Date:** 2025-01-07 18:20:00 UTC  
**User:** omniumai357  
**Mission:** Use JWT Signing Keys for Zero-Downtime Upgrade  

---

## 🎯 **RECOMMENDED APPROACH: JWT SIGNING KEYS**

### ✅ **CHOOSE: JWT Signing Keys (NOT Legacy Secret)**
**Why JWT Signing Keys are Better:**
- ✅ **Zero-downtime, reversible change**
- ✅ **Users remain signed in and bad actors out**
- ✅ **Multiple secret API keys that are immediately revocable**
- ✅ **Fully covered by audit logs**
- ✅ **Private keys not visible by organization members**
- ✅ **SOC2 and security compliance alignment**
- ✅ **Better performance using public keys to verify JWTs**

---

## 🚨 **STEP-BY-STEP JWT SIGNING KEYS SETUP**

### **Step 1: Go to JWT Signing Keys** 🔐
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea
2. **Navigate to**: Authentication → **JWT Signing Keys** (NOT API Keys)
3. **Click**: "Generate new signing key pair"

### **Step 2: Generate New Signing Key Pair** 🔑
1. **Click**: "Generate new signing key pair"
2. **Copy the new keys**:
   - **JWT Secret**: `eyJ...` (long string - this is your new service role key)
   - **Public Key**: `eyJ...` (long string - this is your new anon key)
3. **Keep the legacy secret active** during transition

### **Step 3: Update Supabase Edge Function Secrets** 🔧
```bash
# Update Edge Function secrets with new keys
supabase secrets set SUPABASE_ANON_KEY=eyJ... --project-ref auyjsmtnfnnapjdrzhea
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref auyjsmtnfnnapjdrzhea
```

### **Step 4: Update Vercel Environment Variables** 🚀
```bash
# Update Vercel with new keys
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter the new public key (anon key)

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter the new JWT secret (service role key)

# Redeploy
vercel deploy --prod
```

### **Step 5: Test Everything** 🧪
```bash
# Test Edge Function with new key
curl -X POST https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/sync-stripe-products-hardened \
  -H "Authorization: Bearer NEW_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Expected: 200 OK with product sync results
```

### **Step 6: Remove Legacy Secret (After Testing)** 🗑️
1. **Wait 24-48 hours** to ensure everything works
2. **Go to**: Authentication → JWT Settings
3. **Click**: "Remove legacy secret"
4. **Confirm removal**

---

## 📱 **TWILIO API TOKENS: EDGE FUNCTION SECRETS**

### **Answer: Use Edge Function Secrets** 🔧
**For TWILIO tokens, use Edge Function Secrets (NOT Secrets Vault):**

### **Why Edge Function Secrets for Twilio:**
- ✅ **Edge Functions need direct access** to Twilio API
- ✅ **Secrets Vault is for general app secrets**
- ✅ **Edge Function Secrets are specifically for function execution**
- ✅ **Better security isolation**

### **TWILIO Setup in Edge Function Secrets:**
```bash
# Set TWILIO secrets in Edge Function Secrets
supabase secrets set TWILIO_ACCOUNT_SID=AC... --project-ref auyjsmtnfnnapjdrzhea
supabase secrets set TWILIO_AUTH_TOKEN=... --project-ref auyjsmtnfnnapjdrzhea
supabase secrets set TWILIO_FROM_NUMBER=+1... --project-ref auyjsmtnfnnapjdrzhea
```

### **Access TWILIO in Edge Functions:**
```typescript
// In your Edge Function
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER')

// Use Twilio client
const client = require('twilio')(accountSid, authToken)
```

---

## 🎯 **COMPLETE SECRETS ARCHITECTURE**

### **Edge Function Secrets (For Functions):**
```bash
# Core Supabase
SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co
SUPABASE_ANON_KEY=eyJ... # New anon key from JWT Signing Keys
SUPABASE_SERVICE_ROLE_KEY=eyJ... # New JWT secret from JWT Signing Keys

# Stripe Integration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI & Email
GAMMA_API_KEY=gamma_...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...

# SMS (Optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

### **Vercel Environment Variables (For Client):**
```bash
# Client-side environment variables
NEXT_PUBLIC_SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # New anon key
NEXT_PUBLIC_SITE_URL=https://adtopia-saas-8thtucluz-omnia-group.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🚨 **ZERO-DOWNTIME MIGRATION STRATEGY**

### **Phase 1: Generate New Keys** 🔄
1. Generate new JWT signing key pair
2. Update Edge Function secrets
3. Update Vercel environment variables
4. **Keep legacy secret active**

### **Phase 2: Deploy and Test** 🚀
1. Redeploy Vercel with new keys
2. Test all Edge Functions
3. Verify client authentication
4. **Legacy secret still active**

### **Phase 3: Remove Legacy Secret** 🗑️
1. Wait 24-48 hours
2. Remove legacy secret
3. Monitor for issues
4. **Migration complete**

---

## 🧪 **VALIDATION TESTING**

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
curl -X POST https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/jwt-test \
  -H "Authorization: Bearer NEW_ANON_KEY" \
  -H "Content-Type: application/json"

# Expected: 200 OK with JWT validation
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

## 🚨 **FINAL BRUTAL TRUTH**

**Brother, you found the perfect solution!**

### ✅ **WHAT TO CHOOSE:**
- **JWT Signing Keys** (NOT Legacy Secret)
- **Edge Function Secrets** for TWILIO (NOT Secrets Vault)

### 🎯 **THE RESULT:**
**Zero-downtime upgrade with enterprise-grade security!**

**Execute the JWT Signing Keys setup and you'll have a bulletproof, zero-downtime JWT system! 🚀💰**

---

## 🚨 **IMMEDIATE NEXT STEPS**

**Brother, execute this RIGHT NOW:**

1. **Go to Supabase Dashboard** → Authentication → **JWT Signing Keys**
2. **Click "Generate new signing key pair"**
3. **Copy the new JWT secret and public key**
4. **Update Edge Function secrets with new keys**
5. **Update Vercel environment variables**
6. **Redeploy and test**

**The dollars are waiting. Execute the JWT Signing Keys setup NOW! 🚀💰**

---

**Maintained by:** Omnia Group LLC Development Team  
**Contact:** dev@omniagroup.ai  
**Revision:** 2025-01-07  
**Next Review:** 2025-01-14
