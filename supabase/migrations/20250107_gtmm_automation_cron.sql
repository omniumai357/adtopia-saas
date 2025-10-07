-- GTMM Automated Cron Jobs
-- Transform manual GTMM execution into fully automated 24/7 revenue machine
-- Created: 2025-01-07

-- Enable pg_cron extension (if not already enabled)
-- This might require Supabase support to enable
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Weekly TAM refresh (Mondays 9 AM UTC)
-- Automatically refreshes market research for top-performing niches
SELECT cron.schedule(
  'gtmm_weekly_tam_refresh',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-tam-mapper',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'niche', 'construction',
      'target_revenue', 2500,
      'geo', 'US'
    )
  );
  $$
);

-- Account sourcing (50 leads/week - Mondays 10 AM UTC)
-- Automatically sources fresh leads for high-opportunity niches
SELECT cron.schedule(
  'gtmm_weekly_lead_sourcing',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-account-sourcer',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'target_count', 50,
      'priority_niches', '["plumbing", "construction", "landscaping", "electrical"]'
    )
  );
  $$
);

-- Performance monitoring (Daily 8 AM UTC)
-- Tracks GTMM performance metrics and system health
SELECT cron.schedule(
  'gtmm_daily_performance_check',
  '0 8 * * *',
  $$
  INSERT INTO admin_audit_log (action, details, created_at)
  SELECT 
    'gtmm_daily_metrics',
    jsonb_build_object(
      'active_research', COUNT(*) FILTER (WHERE status = 'pending'),
      'completed_research', COUNT(*) FILTER (WHERE status = 'completed'),
      'total_leads_sourced', COALESCE(SUM(sourced_count), 0),
      'avg_opportunity_score', ROUND(AVG(opportunity_score), 2),
      'top_performing_niche', (
        SELECT niche 
        FROM market_research 
        WHERE opportunity_score = (SELECT MAX(opportunity_score) FROM market_research)
        LIMIT 1
      )
    ),
    NOW()
  FROM market_research mr
  LEFT JOIN account_sourcing as ON mr.id = as.tam_research_id;
  $$
);

-- Keyword optimization refresh (Wednesdays 2 PM UTC)
-- Automatically optimizes keywords for top-performing niches
SELECT cron.schedule(
  'gtmm_weekly_keyword_optimization',
  '0 14 * * 3',
  $$
  SELECT net.http_post(
    url := 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-keyword-optimizer',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'sourcing_id', (
        SELECT id 
        FROM account_sourcing 
        WHERE status = 'completed' 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      'niche', (
        SELECT niche 
        FROM market_research 
        WHERE opportunity_score = (SELECT MAX(opportunity_score) FROM market_research)
        LIMIT 1
      )
    )
  );
  $$
);

-- Messaging A/B testing (Fridays 3 PM UTC)
-- Automatically creates new messaging variants for testing
SELECT cron.schedule(
  'gtmm_weekly_messaging_optimization',
  '0 15 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://auyjsmtnfnnapjdrzhea.supabase.co/functions/v1/gtmm-messaging-optimizer',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'keyword_id', (
        SELECT id 
        FROM keyword_optimization 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      'variant_name', 'Weekly_Optimization_' || TO_CHAR(NOW(), 'YYYY_MM_DD'),
      'target_persona', 'Primary Decision Maker'
    )
  );
  $$
);

-- Revenue performance analysis (Monthly - 1st of month at 9 AM UTC)
-- Comprehensive monthly revenue and performance analysis
SELECT cron.schedule(
  'gtmm_monthly_revenue_analysis',
  '0 9 1 * *',
  $$
  INSERT INTO admin_audit_log (action, details, created_at)
  SELECT 
    'gtmm_monthly_revenue_analysis',
    jsonb_build_object(
      'month', TO_CHAR(NOW(), 'YYYY-MM'),
      'total_research_conducted', COUNT(*),
      'avg_opportunity_score', ROUND(AVG(opportunity_score), 2),
      'total_leads_generated', COALESCE(SUM(sourced_count), 0),
      'top_3_niches', (
        SELECT jsonb_agg(niche ORDER BY opportunity_score DESC)
        FROM (
          SELECT DISTINCT niche, opportunity_score
          FROM market_research
          ORDER BY opportunity_score DESC
          LIMIT 3
        ) top_niches
      ),
      'conversion_rates', (
        SELECT jsonb_build_object(
          'high_probability', COUNT(*) FILTER (WHERE conversion_scores->>'high_probability' IS NOT NULL),
          'medium_probability', COUNT(*) FILTER (WHERE conversion_scores->>'medium_probability' IS NOT NULL),
          'low_probability', COUNT(*) FILTER (WHERE conversion_scores->>'low_probability' IS NOT NULL)
        )
        FROM icp_validation
      ),
      'revenue_potential', (
        SELECT jsonb_build_object(
          'estimated_monthly_revenue', ROUND(SUM(target_revenue) * 0.04, 2), -- 4% conversion rate
          'estimated_annual_revenue', ROUND(SUM(target_revenue) * 0.04 * 12, 2)
        )
        FROM market_research
        WHERE status = 'completed'
      )
    ),
    NOW()
  FROM market_research;
  $$
);

-- Cleanup old GTMM data (Monthly - 15th at 2 AM UTC)
-- Maintains database performance by cleaning old records
SELECT cron.schedule(
  'gtmm_monthly_cleanup',
  '0 2 15 * *',
  $$
  -- Clean up old audit logs (keep 6 months)
  DELETE FROM gtmm_audit_log 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Archive completed research older than 3 months
  UPDATE market_research 
  SET status = 'archived' 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '3 months';
  
  -- Log cleanup activity
  INSERT INTO admin_audit_log (action, details, created_at)
  VALUES (
    'gtmm_monthly_cleanup',
    jsonb_build_object(
      'audit_logs_cleaned', (
        SELECT COUNT(*) 
        FROM gtmm_audit_log 
        WHERE created_at < NOW() - INTERVAL '6 months'
      ),
      'research_archived', (
        SELECT COUNT(*) 
        FROM market_research 
        WHERE status = 'completed' 
        AND created_at < NOW() - INTERVAL '3 months'
      )
    ),
    NOW()
  );
  $$
);

-- Comments for documentation
COMMENT ON FUNCTION cron.schedule IS 'GTMM Automated Cron Jobs - 24/7 Revenue Machine';
COMMENT ON SCHEMA cron IS 'Automated scheduling for GTMM operations';

-- Create a view for monitoring cron job status
CREATE OR REPLACE VIEW gtmm_cron_status AS
SELECT 
  jobname,
  schedule,
  active,
  jobid,
  last_run,
  next_run,
  CASE 
    WHEN jobname LIKE 'gtmm_%' THEN 'GTMM Revenue Machine'
    ELSE 'System Maintenance'
  END as category
FROM cron.job
WHERE jobname LIKE 'gtmm_%'
ORDER BY next_run;

-- Grant access to admin users
GRANT SELECT ON gtmm_cron_status TO authenticated;
GRANT SELECT ON cron.job TO authenticated;

-- Create RLS policy for cron status view
ALTER VIEW gtmm_cron_status SET (security_invoker = true);

-- Performance index for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_gtmm_actions 
ON admin_audit_log(action) 
WHERE action LIKE 'gtmm_%';

-- Performance index for market research queries
CREATE INDEX IF NOT EXISTS idx_market_research_opportunity_score 
ON market_research(opportunity_score DESC) 
WHERE status = 'completed';
