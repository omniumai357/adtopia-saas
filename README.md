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

## UUID Fetch System

### SQL Implementation
```sql
-- Fetch UUID by email
SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1;

-- Insert admin role (idempotent)
INSERT INTO public.user_roles (user_id, role)
VALUES ('<uuid>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify roles
SELECT role FROM public.user_roles WHERE user_id = '<uuid>';
```

### JavaScript Implementation
```javascript
// Get user UUID by email
async function getUserUUID(email) {
  const { data, error } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();
  
  return data?.id;
}

// Grant admin role
async function grantAdminRole(uuid) {
  const { error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: uuid,
      role: 'admin'
    }, { onConflict: 'user_id,role' });
  
  return !error;
}
```

### Run Commands
```bash
# Test UUID fetch
supabase db query "SELECT id FROM auth.users WHERE email = 'test@example.com';"

# Test role verification
supabase db query "SELECT role FROM public.user_roles WHERE user_id = '9123a30c-0f40-4205-abe4-2e183e6fdddf';"

# Test business metrics access
supabase db query "SELECT 1 FROM public.user_roles ur WHERE ur.user_id = '9123a30c-0f40-4205-abe4-2e183e6fdddf' AND ur.role = 'admin';"
```

## Support

Email: beta@bizbox.host
