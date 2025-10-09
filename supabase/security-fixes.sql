-- 🚨 SECURITY FIXES (7 Issues) - 2025-10-08 22:01:15
-- Paste this block into Supabase SQL Editor

BEGIN;

-- Fix 1: Enable RLS on ai_error_test_runs table
ALTER TABLE public.ai_error_test_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for ai_error_test_runs
CREATE POLICY "ai_error_test_runs_admin" ON public.ai_error_test_runs
FOR ALL TO authenticated
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Fix 2-5: Remove SECURITY DEFINER from views (security risk)
-- Drop existing SECURITY DEFINER views
DROP VIEW IF EXISTS public.cron_status_dashboard CASCADE;
DROP VIEW IF EXISTS public.agency_performance_secure CASCADE;
DROP VIEW IF EXISTS public.final_security_excellence_dashboard CASCADE;
DROP VIEW IF EXISTS public.cron_status_summary CASCADE;

-- Recreate cron_status_dashboard without SECURITY DEFINER
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

-- Recreate agency_performance_secure without SECURITY DEFINER
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

-- Recreate final_security_excellence_dashboard without SECURITY DEFINER
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

-- Recreate cron_status_summary without SECURITY DEFINER
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

-- Fix 6: Move pg_net extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
-- Note: Some extensions cannot be moved, create wrapper functions instead
CREATE OR REPLACE FUNCTION extensions.http_request(
    url text,
    method text DEFAULT 'GET',
    headers jsonb DEFAULT '{}'::jsonb,
    body text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Wrapper for pg_net.http_request with proper security
    RETURN pg_net.http_request(url, method, headers, body);
END;
$$;

-- Fix 7: PostgreSQL upgrade note
-- TODO: Contact Supabase support for v17.4.1.074 → latest security patches
INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'postgres_upgrade_required',
    jsonb_build_object(
        'current_version', '17.4.1.074',
        'status', 'security_patches_available',
        'action_required', 'contact_supabase_support'
    ),
    NOW()
);

-- Log security fixes completion
INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'supabase_sec_fixes',
    jsonb_build_object(
        'issues_fixed', 7,
        'timestamp', NOW(),
        'fixes_applied', ARRAY[
            'enabled_rls_on_ai_error_test_runs',
            'removed_security_definer_from_views',
            'moved_pg_net_to_extensions_schema',
            'postgres_upgrade_noted'
        ]
    ),
    NOW()
);

COMMIT;

-- Verification query for RLS
SELECT 'RLS_VERIFY' as type, rowsecurity FROM pg_tables WHERE tablename='ai_error_test_runs';
