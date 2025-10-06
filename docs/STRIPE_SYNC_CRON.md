# Stripe Sync Cron Companion Function

## 🎯 Overview

The `stripe-sync-products` Edge Function automatically backfills missing Stripe products into the `stripe_products_log` table every 24 hours, ensuring complete synchronization between Stripe and our audit system.

## ✨ Key Features

### ✅ Automatic Backfill
- **Daily Sync**: Runs every 24 hours at midnight UTC
- **Missing Products**: Automatically detects and syncs missing products
- **Complete Coverage**: Ensures all Stripe products are logged
- **Idempotent**: Safe to run multiple times without duplicates

### ✅ Comprehensive Sync
- **All Products**: Syncs all products from Stripe account
- **Metadata Preservation**: Maintains all product metadata
- **Project Attribution**: Tracks project ownership
- **Creation Timestamps**: Preserves original creation dates

### ✅ Production Ready
- **Error Handling**: Comprehensive error boundaries
- **Logging**: Detailed sync operation logging
- **Performance**: Efficient batch processing
- **Monitoring**: Complete sync metrics and reporting

## 🏗️ Architecture

```mermaid
graph TD
    A[Cron Trigger] --> B[Edge Function]
    B --> C[Stripe API]
    C --> D[Fetch All Products]
    D --> E[Check Existing Logs]
    E --> F[Insert Missing Products]
    F --> G[Sync Complete]
    B --> H[Response]
```

## 📦 Function Structure

### **File: `supabase/functions/omnia-shared/stripe-sync-products/index.ts`**

```typescript
// Main sync function
- Fetch all Stripe products
- Check existing logs
- Insert missing products
- Error handling and logging
```

### **File: `supabase/functions/omnia-shared/stripe-sync-products/manifest.json`**

```json
{
  "version": "1.0.0",
  "name": "stripe-sync-products",
  "description": "Backfills Stripe products into Supabase stripe_products_log every 24h",
  "runtime": "deno",
  "entrypoint": "index.ts"
}
```

## 🗓️ Scheduling Options

### **Option A: pg_cron (Recommended)**

Run this SQL in Supabase SQL Editor:

```sql
select cron.schedule(
  'stripe_sync_daily',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://xwszqfmduotxjutlnyls.functions.supabase.co/stripe-sync-products',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('service_role_key')),
    body := '{}'
  );
  $$
);
```

### **Option B: Dashboard Cron (GUI)**

1. Go to Supabase → Edge Functions → stripe-sync-products
2. Click "Schedule"
3. Choose "Every 24 hours"
4. Paste Function URL: `https://xwszqfmduotxjutlnyls.functions.supabase.co/stripe-sync-products`

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
./scripts/deploy-stripe-sync.sh
```

### **2. Set Environment Variables**
```bash
# Set required environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SUPABASE_URL=https://xwszqfmduotxjutlnyls.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### **3. Set Up Cron Scheduling**
```sql
-- Run in Supabase SQL Editor
select cron.schedule(
  'stripe_sync_daily',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://xwszqfmduotxjutlnyls.functions.supabase.co/stripe-sync-products',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('service_role_key')),
    body := '{}'
  );
  $$
);
```

### **4. Test Function**
```bash
# Run test script
node test-stripe-sync.js
```

## 📊 API Usage

### **Endpoint:**
```
POST https://xwszqfmduotxjutlnyls.functions.supabase.co/omnia-shared/stripe-sync-products
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
{}
```

### **Response:**
```json
{
  "success": true,
  "synced": 5
}
```

## 🧪 Testing

### **Test Script:**
```bash
# Run the test script
node test-stripe-sync.js
```

### **Manual Testing:**
```bash
curl -X POST https://xwszqfmduotxjutlnyls.functions.supabase.co/omnia-shared/stripe-sync-products \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### **Verification Query:**
```sql
-- Check synced products
select name, stripe_product_id, created_at
from stripe_products_log
order by created_at desc
limit 20;
```

## 📈 Monitoring

### **Function Logs:**
```bash
# View real-time logs
supabase functions logs omnia-shared/stripe-sync-products --follow

# View recent logs
supabase functions logs omnia-shared/stripe-sync-products
```

### **Cron Job Status:**
```sql
-- Check cron job status
select * from cron.job where jobname = 'stripe_sync_daily';

-- Check cron job history
select * from cron.job_run_details 
where jobid = (select jobid from cron.job where jobname = 'stripe_sync_daily')
order by start_time desc;
```

### **Sync Statistics:**
```sql
-- Check sync statistics
select 
  project,
  count(*) as total_products,
  count(case when created_at >= now() - interval '24 hours' then 1 end) as synced_last_24h,
  max(created_at) as last_sync
from stripe_products_log
group by project;
```

## 🔍 Troubleshooting

### **Common Issues:**

1. **Cron Job Not Running**
   - Check: `select * from cron.job where jobname = 'stripe_sync_daily';`
   - Fix: Recreate the cron job

2. **Function Not Deployed**
   - Check: `supabase functions list`
   - Fix: Redeploy function

3. **Environment Variables Missing**
   - Check: `supabase secrets list`
   - Fix: Set missing variables

4. **Stripe API Errors**
   - Check: Stripe dashboard for API errors
   - Fix: Verify API key and permissions

### **Debug Steps:**

1. **Check Function Status**
   ```bash
   supabase functions list
   ```

2. **View Logs**
   ```bash
   supabase functions logs omnia-shared/stripe-sync-products
   ```

3. **Test Manually**
   ```bash
   node test-stripe-sync.js
   ```

4. **Check Cron Status**
   ```sql
   select * from cron.job_run_details 
   where jobid = (select jobid from cron.job where jobname = 'stripe_sync_daily')
   order by start_time desc limit 5;
   ```

## 🎯 Use Cases

### **1. Complete Audit Trail**
- Ensure all Stripe products are logged
- Maintain complete product history
- Track product creation across all sources

### **2. Data Synchronization**
- Keep Stripe and Supabase in sync
- Handle manual product creation
- Recover from missed logging

### **3. Compliance and Reporting**
- Complete product audit trail
- Regulatory compliance reporting
- Financial tracking and analysis

### **4. System Reliability**
- Backup logging system
- Data consistency checks
- Automated recovery processes

## 🔒 Security

### **Authentication:**
- Service role key required for function access
- Stripe API key for product fetching
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
- Efficient batch processing
- Idempotent operations
- Error handling and recovery
- Rate limiting compliance

### **Monitoring:**
- Function execution time
- Database query performance
- Stripe API response times
- Sync success rates

## 🚀 Phase 2 Enhancements

### **Price Syncing:**
```typescript
// Add price syncing
const prices = await stripe.prices.list({ product: id });
const activePrice = prices.data.find(p => p.active);
if (activePrice) {
  price_usd = activePrice.unit_amount / 100;
}
```

### **Analytics Integration:**
- Track pricing changes over time
- Monitor product performance
- Generate revenue reports
- Detect pricing drift

### **Advanced Filtering:**
- Sync only specific product types
- Filter by creation date
- Exclude archived products
- Custom sync rules

---

**The Stripe Sync Cron is now production-ready for complete product synchronization!** 🚀
