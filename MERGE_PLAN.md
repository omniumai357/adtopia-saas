# 📁 MERGE_PLAN.md

## Objective:
Migrate all live, valuable assets and logic from ad-card-canvas → adtopia-saas while preserving deployability and SSR gallery performance.

## 🧱 1. Overview

| Source Repo | Target Repo | Goal |
|-------------|-------------|------|
| ad-card-canvas | adtopia-saas | Merge SSR bilingual gallery, index.html, and Stripe/Supabase configuration while retiring Lovable sandbox. |

## 🗂️ 2. File Movement Summary

### ✅ Public Assets (Marketing / Gallery)

**Move to:** `adtopia-saas/public/gallery/`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/public/gallery/en/` | `adtopia-saas/public/gallery/en/` | Keep English thumbnails & images |
| `ad-card-canvas/public/gallery/es/` | `adtopia-saas/public/gallery/es/` | Keep Spanish counterparts |
| `ad-card-canvas/public/favicon.ico` | `adtopia-saas/public/favicon.ico` | Replace or merge with existing icon |
| `ad-card-canvas/public/manifest.json` | `adtopia-saas/public/manifest.json` | Merge app metadata if different |

### ✅ HTML (SSR Landing Page)

**Move to root:**
- `adtopia-saas/app/pages/index.tsx` (for Next.js)
- and keep static fallback at: `adtopia-saas/public/index.html`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/index.html` | `adtopia-saas/public/index.html` | Use for no-JS SSR fallback |
| Inline `<style>` and `<script>` | Convert to Tailwind/Next.js-friendly components | |
| Countdown + urgency timer | Integrate into `/app/components/marketing/Countdown.tsx` | |

### ✅ Stripe Integration

**Move to:** `adtopia-saas/src/config/stripe.ts`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/src/lib/stripeConfig.ts` | `adtopia-saas/src/config/stripe.ts` | Merge existing keys & helper functions |
| `ad-card-canvas/.env.local.example` | `adtopia-saas/.env.example` | Verify and add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY & STRIPE_SECRET_KEY |

### ✅ Supabase Functions

**Move to:** `adtopia-saas/supabase/functions/`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/supabase/functions/*` | `adtopia-saas/supabase/functions/` | Merge analytics & preview functions |
| `supabase/config.toml` | `adtopia-saas/supabase/config.toml` | Ensure matching URL + service_role key |

### ✅ Components & Utilities

**Move to:** `adtopia-saas/src/components/gallery/`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/src/components/gallery/` | `adtopia-saas/src/components/gallery/` | Import SSR bilingual gallery logic |
| `ad-card-canvas/src/components/Countdown.tsx` | `adtopia-saas/src/components/marketing/Countdown.tsx` | Integrate countdown timer |
| `ad-card-canvas/src/lib/galleryUtils.ts` | `adtopia-saas/src/lib/galleryUtils.ts` | Merge helper utilities |

### ✅ Documentation

**Move to:** `adtopia-saas/docs/`

| Source | Destination | Notes |
|--------|-------------|-------|
| `ad-card-canvas/README.md` | `adtopia-saas/docs/LEGACY_CANVAS_README.md` | Keep for reference |
| `ad-card-canvas/DEPLOYMENT_GUIDE.md` | `adtopia-saas/docs/MERGE_DEPLOYMENT_NOTES.md` | Merge deployment instructions |

## 🧹 Cleanup & Archival

After successful merge:

```bash
cd ad-card-canvas
git tag archive-v1.0
git push origin archive-v1.0
gh repo edit --description "Legacy Lovable sandbox (archived post-merge)"
gh repo archive --yes
```

## 🧪 3. Verification Checklist

| Task | Command | Expected Output |
|------|---------|----------------|
| Confirm gallery paths | `ls adtopia-saas/public/gallery/en` | 5 EN cards |
| Check SSR | `vercel --prod` | index.html renders fallback version |
| Validate Stripe keys | `vercel env ls` | Both live keys set |
| Verify Supabase connection | `supabase secrets list` | STRIPE_SECRET_KEY present |
| Final test build | `npm run build` | ✅ No errors |

## ✅ Outcome

You'll have a single unified repo:
🧭 **adtopia-saas** = marketing front-end + checkout + bilingual gallery.

Then archive ad-card-canvas to prevent confusion.
