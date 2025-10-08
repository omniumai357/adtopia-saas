-- Create feature_flags table for A/B test management
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  flag_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_active ON feature_flags(is_active);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can view and modify feature flags
CREATE POLICY "Admins can view feature flags" ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert feature flags" ON feature_flags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update feature flags" ON feature_flags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete feature flags" ON feature_flags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access" ON feature_flags
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- Insert default A/B test feature flag
INSERT INTO feature_flags (flag_name, flag_value, description, is_active, created_by)
VALUES (
  'ab_test_active',
  'true',
  'Controls whether A/B testing is active for onboarding CTA',
  true,
  (SELECT id FROM auth.users WHERE email = 'omniumai357@example.com' LIMIT 1)
) ON CONFLICT (flag_name) DO NOTHING;

-- Grant permissions
GRANT SELECT ON feature_flags TO authenticated;

-- Add comments
COMMENT ON TABLE feature_flags IS 'Feature flags for controlling application behavior';
COMMENT ON COLUMN feature_flags.flag_name IS 'Unique name of the feature flag';
COMMENT ON COLUMN feature_flags.flag_value IS 'Current value of the feature flag';
COMMENT ON COLUMN feature_flags.is_active IS 'Whether the feature flag is active';
