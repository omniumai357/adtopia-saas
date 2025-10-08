-- Create harvested_ads table for Craigslist ad harvesting
CREATE TABLE IF NOT EXISTS harvested_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location TEXT NOT NULL,
  service_type TEXT NOT NULL,
  post_date TIMESTAMPTZ NOT NULL,
  images TEXT[] DEFAULT '{}',
  url TEXT,
  is_optimized BOOLEAN DEFAULT false,
  optimization_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_harvested_ads_service_type ON harvested_ads(service_type);
CREATE INDEX IF NOT EXISTS idx_harvested_ads_location ON harvested_ads(location);
CREATE INDEX IF NOT EXISTS idx_harvested_ads_optimization_score ON harvested_ads(optimization_score);
CREATE INDEX IF NOT EXISTS idx_harvested_ads_post_date ON harvested_ads(post_date);
CREATE INDEX IF NOT EXISTS idx_harvested_ads_created_at ON harvested_ads(created_at);

-- Enable Row Level Security
ALTER TABLE harvested_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can manage harvested ads
CREATE POLICY "Service role manages harvested ads" ON harvested_ads
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON harvested_ads TO authenticated;

-- Add comments
COMMENT ON TABLE harvested_ads IS 'Craigslist ads harvested for optimization analysis';
COMMENT ON COLUMN harvested_ads.optimization_score IS 'Optimization score 0-100 (lower = more harvestable)';
COMMENT ON COLUMN harvested_ads.is_optimized IS 'Whether the ad has been optimized by AdTopia';
COMMENT ON COLUMN harvested_ads.service_type IS 'Type of service (junk_removal, movers, massage, etc.)';
