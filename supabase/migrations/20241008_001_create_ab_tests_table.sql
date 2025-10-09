-- Create ab_tests table for A/B test tracking
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_tests_variant ON ab_tests(variant);
CREATE INDEX IF NOT EXISTS idx_ab_tests_event_type ON ab_tests(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_tests_timestamp ON ab_tests(timestamp);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_id ON ab_tests(user_id);

-- Enable Row Level Security
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous inserts (for tracking) but only admin selects
CREATE POLICY "Allow anonymous inserts for A/B testing" ON ab_tests
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policy: Only authenticated users can view their own data
CREATE POLICY "Users can view own A/B test data" ON ab_tests
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- RLS Policy: Only service role can view all data (for analytics)
CREATE POLICY "Service role can view all A/B test data" ON ab_tests
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Create feature_flags table for A/B test control
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default A/B test flag
INSERT INTO feature_flags (flag_name, is_active, config) 
VALUES ('ab_test_active', true, '{"description": "Controls A/B test for onboarding CTAs"}')
ON CONFLICT (flag_name) DO NOTHING;

-- Enable RLS on feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can manage feature flags
CREATE POLICY "Service role manages feature flags" ON feature_flags
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON ab_tests TO authenticated;
GRANT INSERT ON ab_tests TO anon;
GRANT SELECT ON feature_flags TO authenticated;

-- Add comments
COMMENT ON TABLE ab_tests IS 'A/B test event tracking for conversion analysis';
COMMENT ON TABLE feature_flags IS 'Feature flags for controlling A/B tests and other features';
COMMENT ON COLUMN ab_tests.variant IS 'A/B test variant (A or B)';
COMMENT ON COLUMN ab_tests.event_type IS 'Type of event (cta_view, cta_click, signup_complete, cta_dropoff)';
COMMENT ON COLUMN ab_tests.metadata IS 'Additional event data (email, timestamps, etc.)';