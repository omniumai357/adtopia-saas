# 🧪 GTMM SYSTEM TESTING GUIDE
**Version:** 1.0 | **Maintainer:** Omnia Group LLC  
**Scope:** Complete GTMM System Validation  
**Last Updated:** 2025-01-07

---

## 🎯 TESTING OVERVIEW
This guide provides comprehensive testing procedures for the GTMM (Go-To-Market Machine) system to ensure all components are working correctly before full automation deployment.

---

## 🔑 PREREQUISITES

### Required Credentials
1. **Supabase Service Role Key**: Get from Supabase Dashboard → Settings → API
2. **Project Reference**: `auyjsmtnfnnapjdrzhea` (Omnia Group Production Hub)
3. **Admin Access**: Ensure you have admin privileges in the system

### Environment Setup
```bash
# Set your service role key
export SERVICE_ROLE_KEY="your_actual_service_role_key_here"

# Verify project connection
supabase status --project-ref auyjsmtnfnnapjdrzhea
```

---

## 🧪 TESTING PROCEDURES

### Step 1: Test TAM Mapper Function
```bash
# Test TAM research for plumbing niche
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-tam-mapper' \
  -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "niche": "plumbing", 
    "target_revenue": 2500, 
    "geo": "US"
  }'

# Expected Response:
# {
#   "success": true,
#   "research_id": "uuid-here",
#   "niche": "plumbing",
#   "status": "TAM research initiated",
#   "next_action": "Execute with AI API for market analysis",
#   "estimated_completion": "10-15 minutes"
# }
```

### Step 2: Test ICP Validator Function
```bash
# Test ICP validation (use research_id from Step 1)
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-icp-validator' \
  -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "tam_research_id": "RESEARCH_ID_FROM_STEP_1",
    "target_accounts": 50
  }'

# Expected Response:
# {
#   "success": true,
#   "icp_id": "uuid-here",
#   "tam_research_id": "previous-research-id",
#   "target_accounts": 50,
#   "status": "ICP validation initiated"
# }
```

### Step 3: Test Account Sourcer Function
```bash
# Test account sourcing (use icp_id from Step 2)
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-account-sourcer' \
  -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "icp_id": "ICP_ID_FROM_STEP_2",
    "target_count": 50
  }'

# Expected Response:
# {
#   "success": true,
#   "sourcing_id": "uuid-here",
#   "icp_id": "previous-icp-id",
#   "target_count": 50,
#   "status": "Account sourcing initiated"
# }
```

### Step 4: Test Keyword Optimizer Function
```bash
# Test keyword optimization (use sourcing_id from Step 3)
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-keyword-optimizer' \
  -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "sourcing_id": "SOURCING_ID_FROM_STEP_3",
    "niche": "plumbing"
  }'

# Expected Response:
# {
#   "success": true,
#   "keyword_id": "uuid-here",
#   "sourcing_id": "previous-sourcing-id",
#   "niche": "plumbing",
#   "status": "Keyword optimization initiated"
# }
```

### Step 5: Test Messaging Optimizer Function
```bash
# Test messaging optimization (use keyword_id from Step 4)
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-messaging-optimizer' \
  -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "keyword_id": "KEYWORD_ID_FROM_STEP_4",
    "variant_name": "Primary",
    "target_persona": "Marketing Manager"
  }'

# Expected Response:
# {
#   "success": true,
#   "messaging_id": "uuid-here",
#   "keyword_id": "previous-keyword-id",
#   "variant_name": "Primary",
#   "status": "Messaging optimization initiated"
# }
```

---

## 🗄️ DATABASE VERIFICATION

### Check Market Research Table
```sql
-- Verify TAM research was created
SELECT * FROM market_research 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected: Rows with niche='plumbing', status='pending'
```

### Check ICP Validation Table
```sql
-- Verify ICP validation was created
SELECT * FROM icp_validation 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected: Rows with target_accounts=50, status='pending'
```

### Check Account Sourcing Table
```sql
-- Verify account sourcing was created
SELECT * FROM account_sourcing 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected: Rows with target_count=50, status='pending'
```

### Check Audit Logs
```sql
-- Verify all operations were logged
SELECT * FROM admin_audit_log 
WHERE action LIKE 'gtmm_%' 
ORDER BY created_at DESC 
LIMIT 10;

-- Expected: Logs for all 5 function calls
```

---

## 🖥️ DASHBOARD TESTING

### Access GTMM Dashboard
1. Navigate to: https://adtopia-saas.vercel.app/admin/gtmm-dashboard
2. Verify metrics are displayed
3. Check cron job status
4. Confirm revenue projections

### Test API Endpoints
```bash
# Test metrics API
curl -X GET 'https://adtopia-saas.vercel.app/api/admin/gtmm-metrics'

# Test cron status API
curl -X GET 'https://adtopia-saas.vercel.app/api/admin/gtmm-cron-status'
```

---

## ✅ SUCCESS CRITERIA

### Function Tests
- [ ] All 5 GTMM functions return `success: true`
- [ ] Each function generates a unique ID
- [ ] Proper error handling for invalid inputs
- [ ] CORS headers are correctly set

### Database Tests
- [ ] All tables receive data from function calls
- [ ] Audit logs capture all operations
- [ ] RLS policies are enforced
- [ ] Data integrity is maintained

### Dashboard Tests
- [ ] Metrics API returns valid data
- [ ] Cron status API shows job schedules
- [ ] Dashboard loads without errors
- [ ] Real-time updates work correctly

### Integration Tests
- [ ] End-to-end workflow completes successfully
- [ ] Data flows correctly between functions
- [ ] Error handling works at each step
- [ ] Performance meets requirements (<2s response time)

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### "Invalid JWT" Error
```bash
# Solution: Get fresh service role key from Supabase Dashboard
# Settings → API → service_role key
```

#### "Function Not Found" Error
```bash
# Solution: Redeploy functions to correct project
supabase functions deploy gtmm-tam-mapper --project-ref auyjsmtnfnnapjdrzhea
```

#### Database Connection Issues
```bash
# Solution: Verify project reference and credentials
supabase status --project-ref auyjsmtnfnnapjdrzhea
```

#### Dashboard Not Loading
```bash
# Solution: Check environment variables in Vercel
# Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
```

---

## 📊 PERFORMANCE BENCHMARKS

### Response Time Targets
- **TAM Mapper**: <2 seconds
- **ICP Validator**: <2 seconds
- **Account Sourcer**: <3 seconds
- **Keyword Optimizer**: <2 seconds
- **Messaging Optimizer**: <2 seconds

### Throughput Targets
- **Concurrent Requests**: 10+ simultaneous
- **Daily Operations**: 1000+ function calls
- **Database Queries**: <100ms average
- **API Response**: <500ms average

---

## 🎯 NEXT STEPS AFTER TESTING

1. **Deploy Database Schema**: Apply GTMM tables to production
2. **Enable Cron Jobs**: Activate automated scheduling
3. **Monitor Performance**: Track metrics and optimize
4. **Scale Operations**: Expand to additional niches
5. **Revenue Tracking**: Monitor progress toward $600K ARR

---

**Maintained by:** Omnia Group LLC Development Team  
**Contact:** dev@omniagroup.ai  
**Revision:** 2025-01-07  
**Next Review:** 2025-02-07
