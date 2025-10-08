# ⚙️ VERCEL_ENV_SYNC_GUIDE.md

**AdTopia & BizBox Unified Frontend Environment Synchronization Protocol**  
**Revision:** 2025-10-08-A  
**Maintainer:** `omniumai357`  
**Purpose:** Keep Vercel, Supabase, and Cursor environments perfectly aligned across all runtime tiers.

---

## 🌐 1. Purpose & Scope

This guide ensures that **frontend builds on Vercel** always mirror the validated secrets and runtime configuration from **Supabase Edge Functions Secrets**.

It eliminates key drift between:

- 🗄️ **Supabase Runtime (Edge Functions Secrets)**
- 🌩️ **Vercel Frontend (Environment Variables)**
- 💻 **Cursor / Local Development (.env.local)**

---

## 🔁 2. Synchronization Command Matrix

| Context | Command | Description |
|----------|----------|-------------|
| **Supabase → Vercel** | `supabase secrets list --project-ref auyjsmtnfnnapjdrzhea` | Lists validated runtime keys |
| **Vercel Import** | `vercel env add <KEY>` | Adds or updates env variable interactively |
| **Vercel Pull** | `vercel env pull .env.production` | Pulls all environment variables locally |
| **Mirror Sync** | `vercel env ls` | Confirms parity between local and deployed environments |

Example:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add RESEND_API_KEY production
vercel env add GAMMA_API_KEY production
vercel env add TWILIO_ADTOPIA_IO_KEY production
vercel env add TWILIO_BIZBOX_HOST_KEY production
```

---

## 🧩 3. Variable Mapping Table

| Supabase Secret | Vercel Env Variable | Visibility | Description |
|-----------------|---------------------|-------------|--------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | 🌍 Public (read-only) | Client-side connection string |
| `SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 🌍 Public (JWT auth) | Client-side anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | 🔒 Private | Server-side RLS bypass |
| `STRIPE_SECRET_KEY` | `STRIPE_SECRET_KEY` | 🔒 Private | Backend payment processing |
| `STRIPE_WEBHOOK_SECRET` | `STRIPE_WEBHOOK_SECRET` | 🔒 Private | Webhook validation |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | 🔒 Private | AI services integration |
| `RESEND_API_KEY` | `RESEND_API_KEY` | 🔒 Private | Transactional email delivery |
| `GAMMA_API_KEY` | `GAMMA_API_KEY` | 🔒 Private | Gamma API integration |
| `TWILIO_ADTOPIA_IO_KEY` | `TWILIO_ADTOPIA_IO_KEY` | 🔒 Private | SMS notifications |
| `TWILIO_BIZBOX_HOST_KEY` | `TWILIO_BIZBOX_HOST_KEY` | 🔒 Private | SMS for BizBox system |

---

## 🚀 4. Step-by-Step Synchronization Procedure

1. **Pull current Supabase keys**
   ```bash
   supabase secrets list --project-ref auyjsmtnfnnapjdrzhea > docs/.tmp_supabase_env.txt
   ```
2. **Open Vercel dashboard → Project Settings → Environment Variables.**
3. **Add or update** each variable listed in the mapping table above.
4. **Confirm timestamps** match those in `SECRETS_VALIDATION_REPORT.md`.  
   - All `SUPABASE_*` keys should show `2025-10-08 04:07:43 (+0000)`  
   - `STRIPE_SECRET_KEY` should match the `2025-09-01` validation timestamp
5. **Redeploy project:**
   ```bash
   vercel --prod --force
   ```
6. **Verify deployment health**
   - Visit `/app` → Console logs should show:  
     `✅ Loading cards from localStorage...`  
     `✅ Stripe integration active`

---

## 🧪 5. Post-Sync Health Check

Use the unified health check endpoint:

```bash
curl https://adtopia.io/api/health
```

Expected JSON:
```json
{
  "status": "ok",
  "vercel_env_sync": true,
  "supabase_connection": "active",
  "stripe_key": "valid",
  "jwt_auth": "active"
}
```

---

## 🧰 6. Drift Detection (Optional Automation)

To automatically detect drift between Supabase and Vercel:

```bash
npx @omnia/scripts/env-sync-check
```

This script compares SHA-256 hashes of both environments and logs any mismatch in:
`/logs/env_drift_report.json`

---

## 🧭 7. Governance & Safety Notes

- **Never store private keys in NEXT_PUBLIC variables.**
- **Do not copy reserved Supabase system keys** (`SUPABASE_JWT_SECRET`, `SUPABASE_ANON_KEY_ROTATION_KEY`) into Vercel.
- **Always redeploy** after updating Stripe or Supabase keys — Edge Functions only pick them up at cold start.
- **Audit every 30 days**: run `supabase secrets list` → verify against `.env.production`.

---

### 🪶 Authored By
**Omnium AI / AdTopia Systems**  
*Environment Synchronization Authority — 2025-10-08 04:18:00 UTC*

---

### ✅ Ready for Commit

```bash
git add docs/VERCEL_ENV_SYNC_GUIDE.md
git commit -m "docs: add VERCEL_ENV_SYNC_GUIDE.md (frontend env parity with Supabase secrets)"
git push
```
