# Stripe Product Auto-Logger Edge Function

## 🎯 Overview

The `stripe-create-product` Edge Function automatically creates Stripe products and logs every creation into the `stripe_products_log` table for complete audit trails and monitoring.

## ✨ Key Features

### ✅ Automatic Logging
- **Every Product Creation**: All Stripe products are automatically logged
- **Complete Audit Trail**: Full history of product creation activities
- **Metadata Tracking**: Rich metadata for each product creation
- **Project Attribution**: Track which project created each product

### ✅ Multi-Project Support
- **AdTopia**: Core QR code packages
- **BizBox**: White-label platform products
- **Extensible**: Easy to add new projects

### ✅ Production Ready
- **Error Handling**: Comprehensive error boundaries
- **Rate Limiting**: Built-in Stripe API rate limiting
- **Idempotency**: Safe to run multiple times
- **Monitoring**: Complete logging and metrics

## 🏗️ Architecture

```mermaid
graph TD
    A[Client Request] --> B[Edge Function]
    B --> C[Stripe API]
    C --> D[Product Created]
    D --> E[Supabase Log]
    E --> F[Audit Trail]
    B --> G[Response]
```

## 📦 Function Structure

### **File: `supabase/functions/omnia-shared/stripe-create-product/index.ts`**

```typescript
// Main Edge Function
- Stripe product creation
- Price creation
- Supabase logging
- Error handling
- Response formatting
```

### **File: `supabase/functions/omnia-shared/stripe-create-product/manifest.json`**

```json
{
  "version": "1.0.0",
  "name": "stripe-create-product",
  "description": "Creates Stripe products and logs them in Supabase",
  "runtime": "deno",
  "entrypoint": "index.ts"
}
```

## 🗄️ Database Schema

### **Table: `stripe_products_log`**

```sql
create table public.stripe_products_log (
  id uuid primary key default gen_random_uuid(),
  project text not null default 'adtopia',
  stripe_product_id text not null,
  name text not null,
  price_usd numeric not null,
  metadata jsonb,
  created_at timestamptz default now()
);
```

### **Fields:**
- `id`: Unique identifier (UUID)
- `project`: Project name (adtopia, bizbox, etc.)
- `stripe_product_id`: Stripe product ID
- `name`: Product name
- `price_usd`: Price in USD
- `metadata`: Additional product metadata
- `created_at`: Creation timestamp

## 🔧 Environment Variables

### **Required Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_or_test_...
SUPABASE_URL=https://xwszqfmduotxjutlnyls.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### **Setting Variables:**
```bash
# Via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SUPABASE_URL=https://xwszqfmduotxjutlnyls.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Or via Supabase Dashboard
# Go to Project Settings → Edge Functions → Environment Variables
```

## 🚀 Deployment

### **1. Deploy Function**
```bash
# From project root
./scripts/deploy-stripe-create-product.sh
```

### **2. Set Environment Variables**
```bash
# Set required environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SUPABASE_URL=https://xwszqfmduotxjutlnyls.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### **3. Test Function**
```bash
# Run test script
node test-stripe-create-product.js
```

## 📊 API Usage

### **Endpoint:**
```
POST https://xwszqfmduotxjutlnyls.functions.supabase.co/omnia-shared/stripe-create-product
```

### **Headers:**
```json
{
  "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY",
  "Content-Type": "application/json"
}
```

### **Request Body:**
```json
[
  {
    "name": "Full Beta Package",
    "price_usd": 297,
    "type": "ad_package",
    "project": "adtopia",
    "metadata": {
      "internal_id": "004",
      "package_type": "full_beta"
    },
    "features": [
      "5 custom SEO ad cards",
      "Free domain + SSL",
      "Dual-language support"
    ]
  }
]
```

### **Response:**
```json
{
  "success": true,
  "results": [
    {
      "project": "adtopia",
      "stripe_product_id": "prod_3S4xXYZ...",
      "price_id": "price_3S4yABC...",
      "name": "Full Beta Package",
      "price_usd": 297
    }
  ]
}
```

## 🧪 Testing

### **Test Script:**
```bash
# Run the test script
node test-stripe-create-product.js
```

### **Manual Testing:**
```bash
curl -X POST https://xwszqfmduotxjutlnyls.functions.supabase.co/omnia-shared/stripe-create-product \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '[{
        "name": "Test Product",
        "price_usd": 99,
        "type": "test",
        "project": "adtopia",
        "metadata": {"test": "true"},
        "features": ["Test feature"]
      }]'
```

### **Validation Query:**
```sql
-- Check created products
select * from stripe_products_log
order by created_at desc
limit 10;
```

## 📈 Monitoring

### **Function Logs:**
```bash
# View real-time logs
supabase functions logs omnia-shared/stripe-create-product --follow

# View recent logs
supabase functions logs omnia-shared/stripe-create-product
```

### **Database Monitoring:**
```sql
-- Check recent product creations
select 
  project,
  count(*) as products_created,
  sum(price_usd) as total_value
from stripe_products_log
where created_at >= now() - interval '24 hours'
group by project;
```

## 🔍 Troubleshooting

### **Common Issues:**

1. **Missing Environment Variables**
   - Check: `supabase secrets list`
   - Fix: Set missing variables

2. **Stripe API Errors**
   - Check: Stripe dashboard for API errors
   - Fix: Verify API key and permissions

3. **Database Insert Errors**
   - Check: Supabase logs for database errors
   - Fix: Verify table exists and permissions

4. **Function Not Deployed**
   - Check: `supabase functions list`
   - Fix: Redeploy function

### **Debug Steps:**

1. **Check Function Status**
   ```bash
   supabase functions list
   ```

2. **View Logs**
   ```bash
   supabase functions logs omnia-shared/stripe-create-product
   ```

3. **Test Locally**
   ```bash
   supabase functions serve omnia-shared/stripe-create-product
   ```

4. **Verify Environment**
   ```bash
   supabase secrets list
   ```

## 🎯 Use Cases

### **1. Product Creation Automation**
- Automatically create Stripe products from configuration
- Log all product creation activities
- Track product performance and metrics

### **2. Multi-Project Management**
- Manage products across multiple projects
- Track project-specific product creation
- Centralized product management

### **3. Audit and Compliance**
- Complete audit trail of all product creation
- Track who created what and when
- Compliance reporting and monitoring

### **4. Analytics and Reporting**
- Product creation metrics
- Revenue tracking by product
- Performance analysis and optimization

## 🔒 Security

### **Authentication:**
- Service role key required for function access
- Stripe API key for product creation
- Supabase service key for database access

### **Authorization:**
- Function-level access control
- Database RLS policies
- Audit logging for all activities

### **Data Protection:**
- No sensitive data in logs
- Encrypted data transmission
- Secure environment variable storage

## 📊 Performance

### **Optimizations:**
- Batch product creation support
- Efficient database inserts
- Error handling and recovery
- Rate limiting compliance

### **Monitoring:**
- Function execution time
- Database query performance
- Stripe API response times
- Error rates and success metrics

---

**The Stripe Product Auto-Logger is now production-ready for complete product creation audit trails!** 🚀
