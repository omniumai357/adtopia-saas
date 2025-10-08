-- Create urgency_performance table for C1 urgency card tracking
CREATE TABLE IF NOT EXISTS urgency_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'call', 'text', 'conversion')),
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  service_type TEXT NOT NULL,
  utm_params JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_urgency_performance_variant_id ON urgency_performance(variant_id);
CREATE INDEX IF NOT EXISTS idx_urgency_performance_event_type ON urgency_performance(event_type);
CREATE INDEX IF NOT EXISTS idx_urgency_performance_business_name ON urgency_performance(business_name);
CREATE INDEX IF NOT EXISTS idx_urgency_performance_location ON urgency_performance(location);
CREATE INDEX IF NOT EXISTS idx_urgency_performance_timestamp ON urgency_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_urgency_performance_service_type ON urgency_performance(service_type);

-- Enable Row Level Security
ALTER TABLE urgency_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous inserts (for tracking) but only admin selects
CREATE POLICY "Allow anonymous inserts for urgency tracking" ON urgency_performance
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policy: Only service role can view all data (for analytics)
CREATE POLICY "Service role can view all urgency performance data" ON urgency_performance
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Create urgency performance summary view
CREATE OR REPLACE VIEW urgency_performance_summary AS
WITH performance_metrics AS (
  SELECT 
    variant_id,
    business_name,
    location,
    service_type,
    COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'call') as calls,
    COUNT(*) FILTER (WHERE event_type = 'text') as texts,
    COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
    COUNT(DISTINCT DATE(timestamp)) as active_days
  FROM urgency_performance
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY variant_id, business_name, location, service_type
),
conversion_rates AS (
  SELECT 
    *,
    CASE 
      WHEN impressions > 0 THEN ROUND((clicks::NUMERIC / impressions::NUMERIC) * 100, 2)
      ELSE 0 
    END as click_rate_percent,
    CASE 
      WHEN impressions > 0 THEN ROUND((conversions::NUMERIC / impressions::NUMERIC) * 100, 2)
      ELSE 0 
    END as conversion_rate_percent,
    CASE 
      WHEN clicks > 0 THEN ROUND((conversions::NUMERIC / clicks::NUMERIC) * 100, 2)
      ELSE 0 
    END as click_to_conversion_rate_percent
  FROM performance_metrics
)
SELECT 
  *,
  -- Performance classification
  CASE 
    WHEN conversion_rate_percent >= 25 THEN 'High Performance'
    WHEN conversion_rate_percent >= 15 THEN 'Good Performance'
    WHEN conversion_rate_percent >= 8 THEN 'Average Performance'
    ELSE 'Low Performance'
  END as performance_class,
  -- Revenue projection (assuming $100 LTV per conversion)
  conversions * 100 as projected_revenue_usd
FROM conversion_rates
ORDER BY conversion_rate_percent DESC;

-- Create daily urgency performance view
CREATE OR REPLACE VIEW urgency_performance_daily AS
SELECT 
  DATE(timestamp) as performance_date,
  variant_id,
  business_name,
  location,
  service_type,
  COUNT(*) FILTER (WHERE event_type = 'impression') as daily_impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') as daily_clicks,
  COUNT(*) FILTER (WHERE event_type = 'call') as daily_calls,
  COUNT(*) FILTER (WHERE event_type = 'text') as daily_texts,
  COUNT(*) FILTER (WHERE event_type = 'conversion') as daily_conversions,
  ROUND(
    (COUNT(*) FILTER (WHERE event_type = 'conversion')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE event_type = 'impression'), 0)) * 100, 
    2
  ) as daily_conversion_rate
FROM urgency_performance
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), variant_id, business_name, location, service_type
ORDER BY performance_date DESC, daily_conversion_rate DESC;

-- Grant permissions
GRANT SELECT ON urgency_performance_summary TO authenticated;
GRANT SELECT ON urgency_performance_daily TO authenticated;

-- Add comments
COMMENT ON TABLE urgency_performance IS 'C1 urgency card performance tracking with UTM parameters';
COMMENT ON VIEW urgency_performance_summary IS 'Summary of urgency card performance metrics with classification';
COMMENT ON VIEW urgency_performance_daily IS 'Daily urgency card performance metrics';
COMMENT ON COLUMN urgency_performance.variant_id IS 'C1 urgency card variant identifier';
COMMENT ON COLUMN urgency_performance.utm_params IS 'UTM parameters for campaign tracking';
COMMENT ON COLUMN urgency_performance.metadata IS 'Additional event metadata (user agent, referrer, etc.)';
