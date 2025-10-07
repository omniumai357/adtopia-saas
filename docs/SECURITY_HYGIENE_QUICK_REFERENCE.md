# 🛡️ SECURITY HYGIENE QUICK REFERENCE  
**Project:** AdTopia / BizBox / Omnia Shared Systems  
**Maintainer:** Omnia Group LLC  
**Last Updated:** 2025-10-06  

---

## 🧠 PURPOSE
This document defines what data and credentials are **safe to share**, **restricted**, or **must never be exposed** — ensuring consistent security practices across all repos, terminals, and integrations (Supabase, Vercel, Cursor, Lovable, Stripe).

---

## 🧩 1. IDENTIFIERS VS SECRETS

| Type | Example | Safe to Share? | Notes |
|------|----------|----------------|-------|
| **UUID** | `9123a30c-0f40-4205-abe4-2e183e6fdddf` | ✅ Safe | Row identifier only. Cannot authenticate or access data. |
| **Supabase Project Ref** | `auyjsmtnfnnapjdrzhea` | ✅ Safe | Used to reference project in CLI commands. |
| **Database ID / Internal ID** | `001`, `adtopia_main` | ✅ Safe | Public metadata reference; not a credential. |
| **Email (public company)** | `support@adtopia.io` | ✅ Safe | Okay if used for contact, not login tokens. |
| **Stripe Product IDs** | `prod_ABC123` | ✅ Safe | Exposed in frontend for checkout. |
| **Stripe Price IDs** | `price_123XYZ` | ✅ Safe | Exposed in public API responses; no risk. |
| **Stripe Publishable Key** | `pk_live_...` | ✅ Safe | Designed for frontend use. Never use `sk_` in code. |

---

## 🔒 2. CREDENTIALS (NEVER SHARE)

| Credential | Example | Never Paste Into | Rotation Policy |
|-------------|----------|------------------|-----------------|
| **Stripe Secret Key** | `sk_live_abc123` | Cursor, Slack, Lovable, GitHub issues | Rotate quarterly or after any accidental paste |
| **Stripe Webhook Secret** | `whsec_abc123` | Anywhere public | Rotate immediately if exposed |
| **Supabase Service Role Key** | `eyJhbGciOiJIUzI1NiIs...` | Frontend, screenshots | Rotate immediately if exposed |
| **Resend / Email API Key** | `re_abc123` | Public logs, GitHub commits | Rotate if exposed |
| **Database Connection URLs** | `postgres://...` | Commits, screenshots | Keep only in Supabase config or local .env |
| **JWT Signing Secrets** | `supabase_jwt_secret` | Any chat or terminal prompt | Rotate if leaked |

---

## 🧰 3. TERMINAL SAFETY
**Safe to run in Supabase / Cursor terminal:**
```bash
supabase functions deploy <function-name>
supabase secrets list --project-ref <ref>
supabase db push
supabase link --project-ref <ref>
```

**Unsafe / never do:**
```bash
echo "sk_live_xxx"   # ❌ prints secret to logs
git add .env         # ❌ commits secrets to repo
paste sk_live_...    # ❌ directly into chat or CLI prompt
```

**Instead:**
- Use `supabase secrets set` to store securely
- Verify with `supabase secrets list` (only shows key names, not values)
- Never commit `.env` or `/supabase/.env.local` to Git

---

## 🧱 4. RLS (ROW-LEVEL SECURITY) CHECKLIST

Before any production push:

```sql
-- Verify all tables with user data have RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';

-- Enable if missing
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
```

✅ Ensure `auth.uid() = user_id` in all RLS policies  
✅ No table should expose sensitive data with `FOR ALL USING (true)`

---

## 🧩 5. SAFE SHARING MATRIX

| Context | What's OK to Share | What's Not |
|---------|-------------------|------------|
| **GitHub Repo** | UUIDs, project refs, pk_live keys | sk_live, whsec, service_role |
| **Cursor / Lovable AI Agents** | Non-secret project IDs, schema, pricing | Any API keys |
| **Screenshots** | Logs with IDs | Logs with secrets or emails |
| **Slack / Discord Dev Channels** | Debug outputs, error codes | Full environment variables |
| **Public Docs / Blog Posts** | Safe sample data | Any real key, even in demo form |

---

## ⚙️ 6. ROTATION & INCIDENT RESPONSE

If a secret was ever exposed:

1. **Rotate immediately** — generate a new key in the dashboard (Stripe, Supabase, etc.)
2. **Revoke old** — remove or disable the compromised key
3. **Re-deploy functions** — update environment variables on Vercel and Supabase
4. **Audit logs** — check for unauthorized access during exposure window

**Example:**
```bash
# Rotate Stripe key in Supabase
supabase secrets set STRIPE_SECRET_KEY=new_sk_live_key
supabase functions deploy stripe-webhook
```

---

## 🧠 7. GENERAL BEST PRACTICES

- Never log user PII (mask or hash emails)
- Always verify JWT before DB write
- Keep local `.env` excluded via `.gitignore`
- Use Vercel + Supabase secrets as single sources of truth
- Use 2FA on all connected accounts (GitHub, Supabase, Stripe, Vercel)
- Enforce admin MFA and IP allowlists

---

## 📘 8. QUICK TEST COMMANDS

To verify you're safe:

```bash
# Check current Stripe context (safe)
stripe whoami

# Confirm Supabase secret presence (safe)
supabase secrets list | grep STRIPE_SECRET_KEY

# Validate no plaintext secrets in repo
grep -R "sk_live_" . --exclude-dir=node_modules || echo "✅ Clean"
```

---

## ✅ FINAL CHECKLIST

- ☑ UUIDs and project refs are safe
- ☑ Keys beginning with `sk_`, `whsec_`, or `eyJhbGciOi` are private
- ☑ Secrets only live in Supabase + Vercel environment configs
- ☑ RLS policies enabled for all user data tables
- ☑ 2FA + MFA required for all admin accounts

**Summary:** *"Treat secrets like cash — never show them, never copy them, always lock them away."*

---

© 2025 Omnia Group LLC – AdTopia / BizBox Security Protocols
