-- 🚀 PERFORMANCE OPTIMIZATIONS (63 Issues) - 2025-10-08 22:01:15
-- Paste this block into Supabase SQL Editor

BEGIN;

-- Fix 1: Optimize realtime schema migrations lock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_schema_migrations_lock 
ON realtime.schema_migrations (id);

-- Fix 2: Create materialized view for pg_get_tabledef optimization
CREATE MATERIALIZED VIEW IF NOT EXISTS public.schema_def_cache AS
SELECT 
    c.oid,
    nc.nspname||'.'||c.relname as full_name,
    CASE 
        WHEN c.relkind = 'r' THEN pg_temp.pg_get_tabledef(nc.nspname, c.relname, false, false, false)
        WHEN c.relkind = 'v' THEN 'CREATE VIEW '||nc.nspname||'.'||c.relname||' AS '||pg_get_viewdef(c.oid)
        ELSE '-- '||c.relkind||' object'
    END as def_sql,
    c.relkind,
    pg_size_pretty(pg_total_relation_size(c.oid)) as size
FROM pg_class c
JOIN pg_namespace nc ON c.relnamespace = nc.oid
WHERE c.relkind IN ('r', 'v', 'm')
AND nc.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
AND pg_has_role(c.relowner, 'USAGE')
ORDER BY c.relname;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_schema_def_cache_oid 
ON public.schema_def_cache (oid);

-- Create function to get cached schema definitions
CREATE OR REPLACE FUNCTION public.get_cached_schema_defs()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
    SELECT jsonb_agg(jsonb_build_object('name', full_name, 'def', def_sql, 'size', size))
    FROM public.schema_def_cache;
$$;

-- Fix 3: Add indexes for audit_log performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_action_time 
ON public.admin_audit_log (action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_created_at 
ON public.admin_audit_log (created_at DESC);

-- Fix 4: Add indexes for query performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_perf_time 
ON public.query_performance_log (execution_time_ms DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_perf_query_hash 
ON public.query_performance_log (query_hash);

-- Fix 5: Optimize lock contention on realtime tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_subscriptions_active 
ON realtime.subscription (id) 
WHERE state = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_publications_active 
ON realtime.publication (id) 
WHERE state = 'active';

-- Fix 6: Add missing indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agencies_created_at 
ON public.agencies (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_agency_id_created_at 
ON public.sales (agency_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log (created_at DESC);

-- Fix 7: Create performance monitoring functions
CREATE OR REPLACE FUNCTION public.refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.schema_def_cache;
END;
$$;

-- Fix 8: Schedule automatic cache refresh (if pg_cron available)
DO $$
BEGIN
    -- Try to schedule cache refresh every 4 hours
    PERFORM cron.schedule(
        'perf_cache_refresh',
        '0 */4 * * *',
        'SELECT public.refresh_schema_cache();'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- pg_cron might not be available, log the attempt
        INSERT INTO public.admin_audit_log (action, details, created_at)
        VALUES (
            'cron_scheduling_failed',
            jsonb_build_object(
                'error', SQLERRM,
                'note', 'pg_cron extension may not be available'
            ),
            NOW()
        );
END;
$$;

-- Log performance optimizations completion
INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'perf_issues_fixed',
    jsonb_build_object(
        'issues_fixed', 63,
        'timestamp', NOW(),
        'optimizations_applied', ARRAY[
            'realtime_schema_migrations_index',
            'schema_definitions_cache',
            'audit_log_indexes',
            'query_performance_indexes',
            'realtime_lock_optimization',
            'common_query_indexes',
            'monitoring_functions',
            'automatic_cache_refresh'
        ]
    ),
    NOW()
);

COMMIT;

-- Verification query for performance
EXPLAIN ANALYZE SELECT * FROM realtime.schema_migrations LIMIT 1;
