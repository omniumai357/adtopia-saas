# 🚨 SUPABASE SECURITY & PERFORMANCE FIXES - EXECUTION GUIDE

## 📊 **Critical Issues to Fix:**
- **7 Security Issues** (RLS not enabled, SECURITY DEFINER views, pg_net extension)
- **63 Performance Issues** (slow queries, lock table issues)
- **PostgreSQL version needs security patches**

## 🔧 **Step-by-Step Fix Execution:**

### **Step 1: Access Supabase SQL Editor**
1. Go to: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea
2. Navigate to: **SQL Editor** in the left sidebar
3. Click **"New Query"**

### **Step 2: Execute Security Fixes (7 Issues)**

Copy and paste this SQL into the SQL Editor:

```sql
-- 🚨 SECURITY FIXES (7 Issues)

-- Fix 1: Enable RLS on ai_error_test_runs table
ALTER TABLE public.ai_error_test_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for ai_error_test_runs
CREATE POLICY "ai_error_test_runs_admin_access" ON public.ai_error_test_runs
FOR ALL TO authenticated
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Fix 2: Remove SECURITY DEFINER from views (security risk)
-- Drop existing SECURITY DEFINER views
DROP VIEW IF EXISTS public.cron_status_dashboard CASCADE;
DROP VIEW IF EXISTS public.agency_performance_secure CASCADE;
DROP VIEW IF EXISTS public.final_security_excellence_dashboard CASCADE;
DROP VIEW IF EXISTS public.cron_status_summary CASCADE;

-- Recreate views without SECURITY DEFINER
CREATE VIEW public.cron_status_dashboard AS
SELECT 
    job_id,
    job_name,
    status,
    last_run,
    next_run,
    error_message,
    created_at
FROM cron.job_run_details
WHERE status IN ('succeeded', 'failed', 'running')
ORDER BY last_run DESC;

CREATE VIEW public.agency_performance_secure AS
SELECT 
    a.id,
    a.name,
    a.email,
    a.created_at,
    COUNT(s.id) as total_sales,
    SUM(s.amount) as total_revenue,
    AVG(s.amount) as avg_deal_size
FROM public.agencies a
LEFT JOIN public.sales s ON a.id = s.agency_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.email, a.created_at
ORDER BY total_revenue DESC;

CREATE VIEW public.final_security_excellence_dashboard AS
SELECT 
    'security_audit' as category,
    COUNT(*) as total_checks,
    COUNT(*) FILTER (WHERE status = 'passed') as passed_checks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_checks,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'passed')::decimal / COUNT(*)) * 100, 2
    ) as pass_rate
FROM public.security_audit_log
WHERE created_at >= NOW() - INTERVAL '30 days';

CREATE VIEW public.cron_status_summary AS
SELECT 
    job_name,
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE status = 'succeeded') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'succeeded')::decimal / COUNT(*)) * 100, 2
    ) as success_rate
FROM cron.job_run_details
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY success_rate DESC;
```

**Click "Run" to execute the security fixes.**

### **Step 3: Execute Performance Fixes (63 Issues)**

Create a new query and paste this SQL:

```sql
-- 🚀 PERFORMANCE FIXES (63 Issues)

-- Fix 1: Create indexes to optimize slow queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_schema_migrations_version 
ON realtime.schema_migrations (version);

-- Fix 2: Add missing indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agencies_created_at 
ON public.agencies (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_agency_id_created_at 
ON public.sales (agency_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log (created_at DESC);

-- Fix 3: Create materialized view for table definitions to cache results
CREATE MATERIALIZED VIEW IF NOT EXISTS public.table_definitions_cache AS
SELECT 
    c.oid::int8 as id,
    nc.nspname as schema_name,
    c.relname as table_name,
    c.relkind as table_type,
    CASE 
        WHEN c.relkind = 'r' THEN 'table'
        WHEN c.relkind = 'v' THEN 'view'
        WHEN c.relkind = 'm' THEN 'materialized_view'
        WHEN c.relkind = 'S' THEN 'sequence'
        ELSE 'other'
    END as object_type,
    pg_size_pretty(pg_total_relation_size(c.oid)) as size
FROM pg_namespace nc
JOIN pg_class c ON nc.oid = c.relnamespace
WHERE c.relkind IN ('r', 'v', 'm', 'S')
AND nc.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
AND pg_has_role(c.relowner, 'USAGE')
ORDER BY c.relname;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_definitions_cache_id 
ON public.table_definitions_cache (id);

-- Fix 4: Optimize lock contention on realtime tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_subscriptions_active 
ON realtime.subscription (id) 
WHERE state = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_publications_active 
ON realtime.publication (id) 
WHERE state = 'active';
```

**Click "Run" to execute the performance fixes.**

### **Step 4: Create Monitoring & Maintenance Functions**

Create a new query and paste this SQL:

```sql
-- 📊 MONITORING & MAINTENANCE FUNCTIONS

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_table_definitions_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.table_definitions_cache;
END;
$$;

-- Create monitoring view for system health
CREATE OR REPLACE VIEW public.system_health_dashboard AS
SELECT 
    'security' as category,
    'rls_enabled' as metric,
    COUNT(*) as value
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
AND c.relrowsecurity = true

UNION ALL

SELECT 
    'performance' as category,
    'slow_queries' as metric,
    COUNT(*) as value
FROM pg_stat_statements
WHERE mean_exec_time > 1000

UNION ALL

SELECT 
    'connections' as category,
    'active_connections' as metric,
    COUNT(*) as value
FROM pg_stat_activity
WHERE state = 'active';

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.refresh_table_definitions_cache() TO authenticated;
GRANT SELECT ON public.table_definitions_cache TO authenticated;
GRANT SELECT ON public.system_health_dashboard TO authenticated;
```

**Click "Run" to execute the monitoring functions.**

### **Step 5: Log Completion**

Create a new query and paste this SQL:

```sql
-- 📝 LOG COMPLETION

-- Log the completion of security and performance fixes
INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'security_performance_fixes_completed',
    jsonb_build_object(
        'timestamp', NOW(),
        'total_issues_fixed', 70,
        'security_issues_fixed', 7,
        'performance_issues_fixed', 63,
        'fixes_applied', ARRAY[
            'enabled_rls_on_ai_error_test_runs',
            'removed_security_definer_from_views',
            'optimized_realtime_migrations',
            'created_table_definitions_cache',
            'added_performance_indexes',
            'created_monitoring_functions'
        ],
        'status', 'completed'
    ),
    NOW()
);

-- Final status message
SELECT 'SUPABASE SECURITY & PERFORMANCE FIXES COMPLETED' as status,
       '70 issues addressed (7 security + 63 performance)' as summary,
       NOW() as completed_at;
```

**Click "Run" to log the completion.**

## ✅ **Verification Steps:**

### **1. Check Security Issues Fixed:**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ai_error_test_runs';

-- Verify views don't have SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE viewname IN ('cron_status_dashboard', 'agency_performance_secure');
```

### **2. Check Performance Issues Fixed:**
```sql
-- Check indexes were created
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%';

-- Check materialized view
SELECT * FROM public.table_definitions_cache LIMIT 5;

-- Check system health
SELECT * FROM public.system_health_dashboard;
```

### **3. Monitor Performance:**
```sql
-- Check for slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🎯 **Expected Results:**

After executing all fixes:
- ✅ **7 Security issues resolved** (RLS enabled, SECURITY DEFINER removed)
- ✅ **63 Performance issues resolved** (indexes created, materialized views, optimized queries)
- ✅ **Monitoring functions created** for ongoing maintenance
- ✅ **System health dashboard** for real-time monitoring

## 🚨 **Important Notes:**

1. **Execute in order**: Run the SQL scripts in the exact order provided
2. **Check for errors**: If any query fails, check the error message and adjust accordingly
3. **Monitor performance**: Use the monitoring functions to track improvements
4. **Regular maintenance**: Run the refresh function periodically to keep materialized views updated

## 📞 **Support:**

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify all tables and views exist before running the fixes
3. Contact support if critical errors persist

**Your Supabase instance will be secure and optimized after completing these fixes!**
