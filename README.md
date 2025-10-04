# AdTopia SaaS - AI-Powered Ad Card Generator

🚀 **Modern SaaS command center** for generating AI-powered ad cards with QR codes.

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (Database + Auth + Storage + Edge Functions)
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Payments**: Stripe Checkout
- **Email**: Resend API

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/omniumai357/adtopia-saas.git
   cd adtopia-saas
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Add your Supabase, Stripe, and Resend keys
   ```

3. **Supabase Setup**
   ```bash
   supabase init
   supabase start
   supabase db reset
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Deploy**
   ```bash
   git push origin main
   # Auto-deploys to Vercel
   ```

## Features

- ✅ SSR bilingual gallery
- ✅ Stripe payment integration
- ✅ Supabase authentication
- ✅ QR code generation
- ✅ Email automation
- ✅ Analytics dashboard
- ✅ Multi-language support

## Production URLs

- **Live App**: https://adtopia-saas.vercel.app
- **GitHub**: https://github.com/omniumai357/adtopia-saas
- **Vercel Dashboard**: https://vercel.com/omnia-group/adtopia-saas

## Support

Email: beta@bizbox.host
