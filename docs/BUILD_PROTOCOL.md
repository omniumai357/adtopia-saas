# Build Protocol – AdTopia / BizBox System

## Mission
Build once, reuse always. Never assume — always verify.  
Use live data only; no mocks in production.

---

## Verification Rules
1. All API keys must exist in Supabase or Vercel Secrets.
2. Cursor agents must check for existing sessions before re-requesting credentials.
3. Stripe CLI → authenticate using `$STRIPE_SECRET_KEY` from Supabase.
4. Supabase → authenticated via Service Role Key, never anon.
5. Webhooks → must pass signature verification before DB write.

---

## Build Discipline
- **Facts First**: Pull from Supabase or Stripe API before assuming missing data.
- **Test Once, Log Always**: Record evidence in `/logs/BRUTAL_TRUTH_LOG.md`.
- **Document**: Every config change → update `README.md` + `CHANGELOG.md`.
- **Reuse**: Shared logic in `/omnia-shared` for UI, SDKs, and Supabase utilities.
- **Secure**: No plaintext secrets; enforce ENV + Role-Based policies.

---

## Current Status
- ✅ Supabase: `adtopia.io` project linked (xwszqfmduotxjutlnyls)
- ✅ Vercel: `adtopia-saas` deployed and ready
- ✅ Stripe: Keys stored in Supabase secrets
- ✅ Universal Function: Deployed for all Omnia product lines
- ❌ Products: Need to be created in Stripe Dashboard
- ❌ Payment Links: Need to be generated and configured

---

## Preflight Verification
Run `bash scripts/preflight.sh` before any Stripe/Supabase/Vercel operations:

```bash
🔍 Running AdTopia preflight verification...
✅ Stripe Live Auth OK
✅ Supabase Key OK  
✅ Vercel Env OK
✅ Supabase Project Linked
✅ Vercel Project OK
Preflight complete.
```

---

## Build Strategy Meta-Prompts

### A. When building features
Goal: Implement the minimal viable version of the feature that gets us closer to customer acquisition or retention.
Check dependencies → Confirm secrets → Generate code → Test locally → Commit.
Never add new services unless the gain > complexity.

### B. When debugging
Goal: Identify root cause using logs & context, not guesses.
Step 1: Verify environment context (Stripe/Supabase/Vercel).
Step 2: Inspect logs (Supabase Edge logs, Vercel build logs, Stripe dashboard).
Step 3: Reproduce issue locally with safe data.
Step 4: Fix & retest. Log the resolution.

### C. When deploying
Goal: Ship tested, reversible changes to production safely.
Preflight check ✅
Commit message format: [scope]: [summary] (#issue-id)
Run: `bash scripts/deploy.sh`
Monitor Supabase logs & Stripe webhooks post-deploy.

---

## Cursor Context Shortcut Prompts
- 🔍 Verify all connections: "Run preflight verification and confirm Omnia Group LLC live session."
- 💳 Stripe sanity check: "List all products and prices from Omnia Group LLC without re-authenticating; confirm live mode."
- 🧠 Schema integrity: "Describe all Supabase tables with RLS policies; list public policies that allow read access."
- 🚀 Deployment: "Run preflight, build, and deploy main to Vercel using stored env vars."
- ⚖️ Security: "Check for any edge function using esm.sh; update to npm:@spec imports."
- 🛡️ Monitoring: "Ensure security-alerts edge function is enabled and sending to SECURITY_WEBHOOK_URL."

---

## North Star Reinforcement
Every change must pass the "North Star Test":
1. Does this reduce friction for a paying customer or partner?
2. Does this create, protect, or measure revenue?
3. Can it be deployed with <3 commands?

If not, park it in `/roadmap/postlaunch.md` and refocus on monetization or stability.

---

## Next Actions
1. Create 9 products in Stripe Dashboard using canonical data
2. Generate payment links for each product
3. Update `stripeConfig.ts` with real URLs
4. Test payment flow end-to-end
5. Set custom domain and Slack integration