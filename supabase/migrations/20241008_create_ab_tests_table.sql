-- Create ab_tests table for tracking A/B test conversions and events
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  event_type TEXT NOT NULL CHECK (event_type IN ('signup_complete', 'cta_dropoff', 'cta_view', 'cta_click')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_variant ON ab_tests(variant);
CREATE INDEX IF NOT EXISTS idx_ab_tests_event_type ON ab_tests(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_tests_timestamp ON ab_tests(timestamp);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_at ON ab_tests(created_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ab_tests_variant_event ON ab_tests(variant, event_type);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_variant ON ab_tests(user_id, variant);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_event ON ab_tests(user_id, event_type);

-- Create GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_ab_tests_metadata ON ab_tests USING GIN (metadata);

-- Enable RLS (Row Level Security)
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anonymous users to insert their own events
CREATE POLICY "Anonymous users can insert ab test events" ON ab_tests
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to insert their own events
CREATE POLICY "Authenticated users can insert own ab test events" ON ab_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to view their own events
CREATE POLICY "Users can view own ab test events" ON ab_tests
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert events (for Edge Functions)
CREATE POLICY "Service role can insert ab test events" ON ab_tests
  FOR INSERT WITH CHECK (true);

-- Allow service role to select all events (for admin analytics)
CREATE POLICY "Service role can select all ab test events" ON ab_tests
  FOR SELECT USING (true);

-- Allow service role to update events
CREATE POLICY "Service role can update ab test events" ON ab_tests
  FOR UPDATE USING (true);

-- Allow service role to delete events
CREATE POLICY "Service role can delete ab test events" ON ab_tests
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_ab_tests_updated_at();

-- Create view for A/B test conversion analytics
CREATE OR REPLACE VIEW ab_test_conversion_analytics AS
WITH conversion_events AS (
  SELECT 
    variant,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    DATE_TRUNC('day', timestamp) as event_date
  FROM ab_tests
  GROUP BY variant, event_type, DATE_TRUNC('day', timestamp)
),
signup_conversions AS (
  SELECT 
    variant,
    COUNT(*) as signup_count,
    COUNT(DISTINCT user_id) as unique_signups
  FROM ab_tests
  WHERE event_type = 'signup_complete'
  GROUP BY variant
),
dropoff_events AS (
  SELECT 
    variant,
    COUNT(*) as dropoff_count,
    COUNT(DISTINCT user_id) as unique_dropoffs
  FROM ab_tests
  WHERE event_type = 'cta_dropoff'
  GROUP BY variant
)
SELECT 
  s.variant,
  s.signup_count,
  s.unique_signups,
  COALESCE(d.dropoff_count, 0) as dropoff_count,
  COALESCE(d.unique_dropoffs, 0) as unique_dropoffs,
  CASE 
    WHEN (s.signup_count + COALESCE(d.dropoff_count, 0)) > 0 
    THEN ROUND((s.signup_count::DECIMAL / (s.signup_count + COALESCE(d.dropoff_count, 0))) * 100, 2)
    ELSE 0 
  END as conversion_rate_percent
FROM signup_conversions s
LEFT JOIN dropoff_events d ON s.variant = d.variant
ORDER BY s.variant;

-- Create view for daily A/B test performance
CREATE OR REPLACE VIEW ab_test_daily_performance AS
SELECT 
  variant,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', timestamp) as event_date,
  AVG(EXTRACT(EPOCH FROM (NOW() - timestamp))/3600) as hours_since_event
FROM ab_tests
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY variant, event_type, DATE_TRUNC('day', timestamp)
ORDER BY event_date DESC, variant, event_type;

-- Grant permissions
GRANT SELECT ON ab_test_conversion_analytics TO authenticated;
GRANT SELECT ON ab_test_daily_performance TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE ab_tests IS 'Tracks A/B test events including conversions and drop-offs';
COMMENT ON COLUMN ab_tests.variant IS 'A/B test variant (A or B)';
COMMENT ON COLUMN ab_tests.event_type IS 'Type of event (signup_complete, cta_dropoff, cta_view, cta_click)';
COMMENT ON COLUMN ab_tests.metadata IS 'Additional event metadata as JSON';
COMMENT ON VIEW ab_test_conversion_analytics IS 'Conversion analytics for A/B test variants';
COMMENT ON VIEW ab_test_daily_performance IS 'Daily performance metrics for A/B test variants';
