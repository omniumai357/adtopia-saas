-- Create A/B test events table for tracking variant exposure and interactions
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  variant VARCHAR(1) NOT NULL CHECK (variant IN ('A', 'B')),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('cta_view', 'cta_click')),
  email VARCHAR(255),
  session_id UUID NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_id ON ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant ON ab_test_events(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_event_type ON ab_test_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created_at ON ab_test_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_session_id ON ab_test_events(session_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant_event ON ab_test_events(variant, event_type);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_variant ON ab_test_events(user_id, variant);

-- Enable RLS (Row Level Security)
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view their own events
CREATE POLICY "Users can view own ab test events" ON ab_test_events
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert events (for the Edge Function)
CREATE POLICY "Service role can insert ab test events" ON ab_test_events
  FOR INSERT WITH CHECK (true);

-- Allow service role to update events
CREATE POLICY "Service role can update ab test events" ON ab_test_events
  FOR UPDATE USING (true);

-- Allow service role to delete events
CREATE POLICY "Service role can delete ab test events" ON ab_test_events
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_test_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ab_test_events_updated_at
  BEFORE UPDATE ON ab_test_events
  FOR EACH ROW
  EXECUTE FUNCTION update_ab_test_events_updated_at();

-- Create view for A/B test analytics
CREATE OR REPLACE VIEW ab_test_analytics AS
SELECT 
  variant,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  DATE_TRUNC('day', created_at) as event_date
FROM ab_test_events
GROUP BY variant, event_type, DATE_TRUNC('day', created_at)
ORDER BY event_date DESC, variant, event_type;

-- Create view for conversion rates
CREATE OR REPLACE VIEW ab_test_conversion_rates AS
WITH variant_stats AS (
  SELECT 
    variant,
    COUNT(*) FILTER (WHERE event_type = 'cta_view') as views,
    COUNT(*) FILTER (WHERE event_type = 'cta_click') as clicks,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_view') as unique_viewers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_click') as unique_clickers
  FROM ab_test_events
  GROUP BY variant
)
SELECT 
  variant,
  views,
  clicks,
  unique_viewers,
  unique_clickers,
  CASE 
    WHEN views > 0 THEN ROUND((clicks::DECIMAL / views) * 100, 2)
    ELSE 0 
  END as conversion_rate_percent,
  CASE 
    WHEN unique_viewers > 0 THEN ROUND((unique_clickers::DECIMAL / unique_viewers) * 100, 2)
    ELSE 0 
  END as unique_conversion_rate_percent
FROM variant_stats
ORDER BY variant;

-- Grant permissions
GRANT SELECT ON ab_test_analytics TO authenticated;
GRANT SELECT ON ab_test_conversion_rates TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE ab_test_events IS 'Tracks A/B test events for onboarding CTA variants';
COMMENT ON COLUMN ab_test_events.variant IS 'A/B test variant (A or B)';
COMMENT ON COLUMN ab_test_events.event_type IS 'Type of event (cta_view or cta_click)';
COMMENT ON COLUMN ab_test_events.session_id IS 'Unique session identifier for anonymous users';
COMMENT ON VIEW ab_test_analytics IS 'Aggregated A/B test analytics by variant and event type';
COMMENT ON VIEW ab_test_conversion_rates IS 'Conversion rates for A/B test variants';
