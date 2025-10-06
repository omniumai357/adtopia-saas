# 🧰 WORKSPACE_SETUP.md

## Objective:
Unify AdTopia, BizBox, and future Omnia Shared modules under one monorepo workspace using pnpm for modular development.

## 🧩 1. Folder Structure

```
omnia-platform/
├── apps/
│   ├── adtopia-saas/
│   ├── bizbox-ai/
│   └── docs/
│
└── packages/
    └── omnia-shared/
```

## ⚙️ 2. Initialize Workspace

```bash
mkdir omnia-platform && cd omnia-platform
pnpm init -y
```

Then edit the root package.json:

```json
{
  "name": "omnia-platform",
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:adtopia": "pnpm --filter adtopia-saas dev",
    "dev:bizbox": "pnpm --filter bizbox-ai dev",
    "build:all": "pnpm -r build"
  }
}
```

## 📦 3. Add Projects

```bash
mkdir -p apps packages
mv ~/Projects/adtopia-saas apps/
mv ~/Projects/bizbox-ai apps/
mkdir packages/omnia-shared
cd packages/omnia-shared
pnpm init -y
```

## 🧱 4. Link Shared Package

In each app (adtopia-saas and bizbox-ai):

```bash
pnpm add @omnium/shared --workspace
```

Then import anywhere:

```typescript
import { formatPrice } from "@omnium/shared/lib/utils";
```

## 🧩 5. Setup Build Dependencies

In `packages/omnia-shared/package.json`:

```json
{
  "name": "@omnium/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

## 🧪 6. Test Workspace Links

```bash
pnpm install
pnpm dev:adtopia
```

**Expected:**
```
> Loaded shared utils from @omnium/shared
> AdTopia SaaS running at http://localhost:3000
```

## 🔐 7. Environment & Secrets Management

| Env Source | Command | Notes |
|------------|---------|-------|
| Vercel | `vercel env ls` | AdTopia & BizBox deploys |
| Supabase | `supabase secrets list` | Shared DB secrets |
| Stripe | `stripe config --list` | Account = Omnia Group LLC |

To avoid secret leakage:

```bash
echo ".env.local" >> .gitignore
```

## 🧭 8. Optional CI/CD Setup

In `.github/workflows/deploy.yml`:

```yaml
name: Deploy Omnia Platform
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm build:all
      - run: vercel --prod --yes
```

## ✅ Outcome

You'll have:

- ✅ Unified development workflow
- ✅ Shared libraries under `@omnium/shared`
- ✅ Centralized env + deployment control
- ✅ Clear separation between AdTopia (public) and BizBox (admin)
