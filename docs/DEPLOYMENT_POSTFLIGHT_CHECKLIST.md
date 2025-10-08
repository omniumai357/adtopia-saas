# 🚀 DEPLOYMENT POSTFLIGHT CHECKLIST  
**AdTopia / BizBox / Omnia Production Launch Guide**  
Version: 1.0 — Generated 2025-10-08  
Maintainer: omniumai357  

---

## ✅ 1. GO / NO-GO DECISION POINTS
| Check | Expected | Status |
|-------|-----------|--------|
| 🔄 Repository Clean | `git status` → no uncommitted changes | ☐ |
| 🌍 Environment Synced | `.env.production` verified across Vercel & Supabase | ☐ |
| 🧩 Schema Migrations | All migrations applied (e.g., `SELECT count(*) FROM supabase_migrations.schema_migrations;`) | ☐ |
| 🧠 RLS + Security | `admin_audit_log`, `ad_card_previews`, and `agency_performance_dashboard` RLS verified | ☐ |
| 💳 Stripe Webhooks | Test event POST returns 200 OK | ☐ |
| ⚡ Cron / Edge Functions | `daily_revenue_alerts` + `sync_stripe_products_hardened` active | ☐ |
| 🪶 Logs + Telemetry | `admin_audit_log` capturing inserts | ☐ |
| 🔐 Secrets | `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` present and valid | ☐ |

---

## 📈 2. LIVE SYSTEM VERIFICATION COMMANDS

### Supabase (SQL)
```sql
SELECT COUNT(*) FROM admin_audit_log WHERE created_at::date = CURRENT_DATE;
SELECT jobname, active FROM cron.job WHERE jobname LIKE '%daily%';
```

### Vercel (CLI)
```bash
vercel logs --project adtopia-saas --limit 20
vercel open --project adtopia-saas
```

### Stripe
```bash
stripe listen --forward-to https://your-vercel-domain/api/webhooks/stripe
```

---

## 🔭 3. OBSERVABILITY TRIGGERS
| Trigger | Action | Owner |
|---------|--------|-------|
| 🚨 DB Error (pgbouncer full) | Restart Supabase connection pool | Backend Lead |
| ⏱️ Edge Function >1s latency | Auto-restart CI/CD deployment | Infra Agent |
| 🧾 Missing Daily Audit | Manual trigger: `SELECT cron.run('daily_revenue_alerts');` | Admin |
| 💬 Discord/Telegram Alerts | Verify `SECURITY_WEBHOOK_URL` receiving 200s | Ops Bot |
| 📉 Stripe Revenue Drop >15% | Check sync cron logs in `stripe_products_log` | Finance Ops |

---

## 🔄 4. ROLLBACK PLAN
| Step | Command | Description |
|------|---------|-------------|
| 1 | `vercel rollback` | Revert to previous deployment |
| 2 | `supabase db reset --seed` | Roll back schema if migration failure detected |
| 3 | `git reset --hard HEAD~1 && git push -f` | Code rollback |
| 4 | `vercel redeploy --env .env.previous` | Restore verified environment |

---

## 🧠 5. POST-DEPLOYMENT OBSERVATION WINDOW

**Window:** 24 hours  
**Monitor:**

- `cron.job_run_details` (ensure all scheduled jobs execute)
- `agency_sales` growth rate & `admin_audit_log` inserts
- API response latency (target: <300ms)
- Stripe webhook success rate (target: 100%)

---

## ✍️ 6. SIGN-OFF
| Role | Name | Approval | Timestamp |
|------|------|----------|-----------|
| CTO / Architect | omniumai357 | ☐ | |
| DevOps / Infra | — | ☐ | |
| QA / Frontend Lead | — | ☐ | |
| Finance / Stakeholder | — | ☐ | |

**Launch Authorization:** ✅ GO FOR DEPLOYMENT  
**Commit Hash:** $(git rev-parse --short HEAD)  
**Audit Reference:** DEPLOYMENT_READINESS_AUDIT.md  
**System Status:** LIVE AND OBSERVABLE  

---

💡 **Tip:** Attach this checklist to each GitHub release.  
It doubles as a versioned deployment manifest and compliance proof for investors.
