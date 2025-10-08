-- Create error_logs table for AdTopia error monitoring
-- Execute in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  error_name text,
  error_info jsonb,
  user_agent text,
  url text,
  user_id text,
  created_at timestamptz DEFAULT NOW(),
  resolved boolean DEFAULT false,
  severity text DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'critical')),
  component text,
  session_id text
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for error logging
CREATE POLICY "error_logs_insert_policy" ON public.error_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "error_logs_select_policy" ON public.error_logs
  FOR SELECT TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);

-- Create error analytics view
CREATE OR REPLACE VIEW error_analytics AS
SELECT 
  DATE(created_at) as error_date,
  severity,
  component,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT url) as affected_pages
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), severity, component
ORDER BY error_date DESC, error_count DESC;

-- Create function to get error summary
CREATE OR REPLACE FUNCTION get_error_summary(days_back integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_errors', COUNT(*),
    'critical_errors', COUNT(*) FILTER (WHERE severity = 'critical'),
    'unresolved_errors', COUNT(*) FILTER (WHERE resolved = false),
    'affected_users', COUNT(DISTINCT user_id),
    'most_common_errors', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'message', error_message,
          'count', error_count
        )
      )
      FROM (
        SELECT error_message, COUNT(*) as error_count
        FROM error_logs
        WHERE created_at >= NOW() - (days_back || ' days')::interval
        GROUP BY error_message
        ORDER BY error_count DESC
        LIMIT 5
      ) top_errors
    ),
    'error_trend', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', error_date,
          'count', daily_count
        )
      )
      FROM (
        SELECT DATE(created_at) as error_date, COUNT(*) as daily_count
        FROM error_logs
        WHERE created_at >= NOW() - (days_back || ' days')::interval
        GROUP BY DATE(created_at)
        ORDER BY error_date
      ) daily_errors
    )
  ) INTO result
  FROM error_logs
  WHERE created_at >= NOW() - (days_back || ' days')::interval;
  
  RETURN result;
END;
$$;

-- Insert test error log entry
INSERT INTO error_logs (error_message, error_stack, error_name, url, user_id, severity, component)
VALUES (
  'Test error boundary functionality',
  'ErrorBoundary.test() at ErrorBoundary.tsx:45',
  'TestError',
  'https://adtopia-saas-6rlz5guye-omnia-group.vercel.app/test',
  'omniumai357',
  'error',
  'ErrorBoundary'
);

SELECT 'Error logging system created successfully' as status;
