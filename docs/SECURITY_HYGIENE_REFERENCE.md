# 🔐 SECURITY HYGIENE REFERENCE  
**Version:** 1.0 | **Maintainer:** Omnia Group LLC  
**Scope:** AdTopia / BizBox / Omnia Shared Systems  
**Last Updated:** 2025-10-07

---

## 🧠 PURPOSE
To ensure all developers, AI agents, and system operators follow consistent, verifiable security practices when working with Supabase, Stripe, Vercel, GitHub, and Cursor environments.

This reference defines what is **safe, unsafe, and mandatory** when executing commands or handling credentials across our ecosystem.

---

## 🧩 CORE SECURITY PRINCIPLES

| Principle | Description |
|------------|--------------|
| **Never Assume** | All AI-generated commands must be human-reviewed before execution. |
| **Verify Authority** | Know which key or token is being used and its access scope before you run any command. |
| **Encrypt Everything** | Keys, tokens, and secrets must live only in secure secret managers (Supabase, Vercel, or GitHub Actions). |
| **Audit Trail Always** | Every database or function change must be logged or version-controlled. |
| **Least Privilege** | Use anon/public keys for client work, service_role only for server or edge functions. |
| **Immutable Records** | Never modify logs or audit trails. Errors should be annotated, not deleted. |

---

## 🧱 SAFE COMMANDS

✅ **Permitted Operations**
- Running `curl` or `supabase functions invoke` for tested Edge Functions.
- Reading tables via RLS-protected queries.
- Setting environment secrets via `supabase secrets set` or Vercel dashboard.
- Executing migrations through `supabase db push` with reviewed SQL.
- Using `SELECT` queries to verify logic before running any `UPDATE` or `DELETE`.
- Deploying to production via verified GitHub Actions pipelines.

✅ **Example: Safe Function Invocation**
```bash
curl -X POST 'https://<PROJECT>.supabase.co/functions/v1/sync-stripe-products-hardened' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json'
```
✅ **Reason:** This uses a verified, controlled Edge Function — no raw SQL or schema risk.

---

## ⚠️ HIGH-RISK OPERATIONS

🚫 **Unsafe or Restricted Actions**
- Running AI-generated SQL directly in Supabase SQL Editor.
- Storing API keys in .env.local or any front-end bundle.
- Committing secrets into GitHub repositories.
- Copying Service Role Keys or Stripe API keys into chat prompts.
- Deleting tables, altering schemas, or disabling RLS without review.
- Using external AI models with access to private database schemas.

🚫 **Example: Unsafe SQL**
```sql
DELETE FROM public.users;
```
⚠️ **Even if it looks simple — in the SQL Editor this bypasses RLS and can delete all rows.**

---

## 🧩 ROLE-BASED KEY MANAGEMENT

| Key Type | Usage | Access Scope | Safe Storage |
|----------|-------|--------------|--------------|
| anon | Public client | Read-only through RLS | Client .env |
| service_role | Server/Edge | Full DB access, bypasses RLS | Supabase Secrets / Vercel Env |
| stripe_secret_key | Payments | Billing and subscription ops | Supabase / Vercel Secrets |
| resend_api_key | Emails | Transactional mail only | Secrets Manager |
| vercel_token | Deployment automation | Build & deploy pipeline | GitHub Actions Secrets |

---

## 🧾 SQL EDITOR SAFETY CHECKLIST

| Step | Action | Purpose |
|------|--------|---------|
| 1️⃣ | Back up database (`supabase db dump`) | Create snapshot before changes |
| 2️⃣ | Test in local CLI (`supabase start`) | Isolate environment for testing |
| 3️⃣ | Start with SELECT queries | Verify logic & scope |
| 4️⃣ | Add LIMIT before DELETE/UPDATE | Prevent accidental full-table modifications |
| 5️⃣ | Remove AI-generated text before execution | Eliminate prompt injection risk |
| 6️⃣ | Use versioned migrations | Ensures reversible, auditable schema changes |

---

## 🛡️ ENVIRONMENT ISOLATION MATRIX

| Environment | Database | Supabase Project | Key Type | Deployment Target |
|-------------|----------|------------------|----------|-------------------|
| Local Dev | Local Docker | `supabase start` | service_role (local only) | localhost |
| Staging | Shared QA DB | `auyjsmtnfnnapjdrzhea-test` | service_role | Vercel Staging |
| Production | Primary DB | `auyjsmtnfnnapjdrzhea` | service_role (secure) | Vercel Live |

---

## 🧩 CREDENTIAL HANDLING POLICY

✅ **DO**
- Store secrets using:
  - `supabase secrets set`
  - `vercel env add`
  - `gh secret set`
- Rotate keys every 90 days.
- Use `.env.example` with placeholder values only.
- Restrict access via IAM roles or per-project tokens.

🚫 **DON'T**
- Paste live keys in chat or documentation.
- Expose keys in frontend JavaScript or static builds.
- Use shared keys across multiple projects.
- Keep old keys active after rotation.

---

## 🧱 EDGE FUNCTION DEPLOYMENT SAFETY

Always deploy Edge Functions with explicit review and isolation:

```bash
# Verify function logic first
supabase functions serve <function-name>

# Deploy to production only after verification
supabase functions deploy <function-name> --project-ref auyjsmtnfnnapjdrzhea
```

**Never deploy automatically without a pre-commit review.**

Every function must include:
- Signature verification (for Stripe or webhooks)
- Error handling and idempotency
- Audit logging to Supabase tables

---

## 🧭 INCIDENT RESPONSE PROTOCOL

**Key exposure detected?**
1. Revoke immediately via Supabase or Stripe dashboard.
2. Rotate key and update environment variables.
3. Trigger security-alerts Edge Function to notify Slack.

**Suspicious SQL activity?**
1. Review Supabase logs.
2. Lock admin accounts temporarily.
3. Run forensic SELECT queries to verify affected rows.

**Unauthorized data modification?**
1. Restore from latest snapshot.
2. Investigate logs.
3. Document incident in `/logs/SECURITY_INCIDENTS.md`.

---

## 🧩 AI AGENT SAFETY POLICY

| Agent | Role | Access | Restrictions |
|-------|------|--------|--------------|
| Cursor Agent | Developer Assistant | Read/write to local codebase | No access to live keys |
| Lovable Agent | Deployer / PR reviewer | Access to Vercel + Supabase secrets only | No database query execution |
| Spec-Kit Agent | Documentation + Planning | Read/write docs only | No command execution |
| Copilot / Gemini | Code generator | Local context only | Cannot modify infrastructure |

**All AI tools must operate under limited scope.**
**Human validation is mandatory before execution of any AI-generated code or SQL.**

---

## 🧠 GOLDEN RULE

🔥 **"If you can't explain what a command does — don't run it until you can."** 🔥

Every execution must be explainable, reversible, and logged.

---

## 🧩 REFERENCES

- [Supabase Security Overview](https://supabase.com/docs/guides/platform/security)
- [Stripe API Key Management](https://stripe.com/docs/keys)
- [Vercel Environment Secrets](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Secrets & Policies](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Omnia Group Internal Standards](./PRD.md)

---

**Maintained by:** Omnia Group LLC Security Team  
**Contact:** security@omniagroup.ai  
**Revision:** 2025-10-07
