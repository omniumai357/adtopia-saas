-- AdTopia MCP Agentic Intelligence System Database Schema
-- Tables for AI lieutenant revenue optimization and $600K ARR scaling

-- Lead analyses table for AI reasoning and optimization
CREATE TABLE IF NOT EXISTS lead_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  location TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  value_proposition TEXT NOT NULL CHECK (value_proposition IN ('cost_savings', 'time_efficiency', 'quality_assurance', 'trust_signals')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  expected_roi DECIMAL(10,2) NOT NULL,
  analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content table for AI-generated ad content
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT UNIQUE NOT NULL,
  lead_id TEXT NOT NULL,
  niche TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  urgency_cards JSONB NOT NULL DEFAULT '[]',
  value_landing TEXT NOT NULL,
  outreach_emails JSONB NOT NULL DEFAULT '{}',
  generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments table for tracking content deployment
CREATE TABLE IF NOT EXISTS deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id TEXT UNIQUE NOT NULL,
  content_id TEXT NOT NULL REFERENCES generated_content(content_id),
  platform TEXT NOT NULL,
  schedule TEXT NOT NULL DEFAULT 'immediate',
  target_audience TEXT,
  budget DECIMAL(10,2) DEFAULT 200,
  status TEXT NOT NULL DEFAULT 'deployed' CHECK (status IN ('deployed', 'active', 'paused', 'completed', 'high_performance', 'needs_optimization')),
  deployment_timestamp TIMESTAMPTZ DEFAULT NOW(),
  last_performance_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance metrics table for tracking ROI and conversions
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(deployment_id),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  roi DECIMAL(10,2) NOT NULL DEFAULT 0,
  timeframe TEXT NOT NULL DEFAULT '24h',
  tracking_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization recommendations table for AI-driven improvements
CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(deployment_id),
  current_roi DECIMAL(10,2) NOT NULL,
  current_conversion_rate DECIMAL(5,4) NOT NULL,
  optimization_action TEXT NOT NULL CHECK (optimization_action IN ('maintain', 'optimize', 'scale_up', 'pivot')),
  recommended_urgency_level TEXT NOT NULL,
  recommended_value_proposition TEXT NOT NULL,
  budget_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  platform_adjustment TEXT NOT NULL DEFAULT 'none',
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  optimization_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upsell offers table for revenue optimization
CREATE TABLE IF NOT EXISTS upsell_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upsell_id TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  engagement_level TEXT NOT NULL CHECK (engagement_level IN ('low', 'medium', 'high', 'premium')),
  current_offer TEXT,
  upsell_tier TEXT NOT NULL CHECK (upsell_tier IN ('basic', 'standard', 'premium', 'enterprise')),
  upsell_price DECIMAL(10,2) NOT NULL,
  upsell_features JSONB NOT NULL DEFAULT '[]',
  upsell_description TEXT NOT NULL,
  conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'accepted', 'declined', 'expired')),
  generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP agent sessions table for tracking AI interactions
CREATE TABLE IF NOT EXISTS mcp_agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  lead_id TEXT,
  deployment_id TEXT,
  agent_version TEXT NOT NULL DEFAULT '1.0.0',
  session_type TEXT NOT NULL CHECK (session_type IN ('analysis', 'generation', 'deployment', 'optimization', 'upsell')),
  input_data JSONB,
  output_data JSONB,
  processing_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  session_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_analyses_lead_id ON lead_analyses(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_analyses_niche ON lead_analyses(niche);
CREATE INDEX IF NOT EXISTS idx_lead_analyses_urgency_level ON lead_analyses(urgency_level);
CREATE INDEX IF NOT EXISTS idx_lead_analyses_expected_roi ON lead_analyses(expected_roi);

CREATE INDEX IF NOT EXISTS idx_generated_content_lead_id ON generated_content(lead_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_niche ON generated_content(niche);
CREATE INDEX IF NOT EXISTS idx_generated_content_urgency_level ON generated_content(urgency_level);

CREATE INDEX IF NOT EXISTS idx_deployments_content_id ON deployments(content_id);
CREATE INDEX IF NOT EXISTS idx_deployments_platform ON deployments(platform);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_deployment_timestamp ON deployments(deployment_timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_deployment_id ON performance_metrics(deployment_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_roi ON performance_metrics(roi);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tracking_timestamp ON performance_metrics(tracking_timestamp);

CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_deployment_id ON optimization_recommendations(deployment_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_optimization_action ON optimization_recommendations(optimization_action);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_confidence ON optimization_recommendations(confidence);

CREATE INDEX IF NOT EXISTS idx_upsell_offers_client_id ON upsell_offers(client_id);
CREATE INDEX IF NOT EXISTS idx_upsell_offers_engagement_level ON upsell_offers(engagement_level);
CREATE INDEX IF NOT EXISTS idx_upsell_offers_upsell_tier ON upsell_offers(upsell_tier);
CREATE INDEX IF NOT EXISTS idx_upsell_offers_conversion_status ON upsell_offers(conversion_status);

CREATE INDEX IF NOT EXISTS idx_mcp_agent_sessions_session_id ON mcp_agent_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_mcp_agent_sessions_lead_id ON mcp_agent_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_mcp_agent_sessions_session_type ON mcp_agent_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_mcp_agent_sessions_success ON mcp_agent_sessions(success);

-- Enable Row Level Security
ALTER TABLE lead_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_agent_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service role access
CREATE POLICY "Service role can manage lead analyses" ON lead_analyses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage generated content" ON generated_content
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage deployments" ON deployments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage performance metrics" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage optimization recommendations" ON optimization_recommendations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage upsell offers" ON upsell_offers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage MCP agent sessions" ON mcp_agent_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Create views for analytics
CREATE OR REPLACE VIEW mcp_agent_performance_summary AS
SELECT 
  DATE(session_timestamp) as performance_date,
  session_type,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE success = true) as successful_sessions,
  ROUND(
    (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as success_rate_percent,
  AVG(processing_time_ms) as avg_processing_time_ms,
  COUNT(DISTINCT lead_id) as unique_leads_processed
FROM mcp_agent_sessions
WHERE session_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(session_timestamp), session_type
ORDER BY performance_date DESC, session_type;

CREATE OR REPLACE VIEW deployment_roi_analytics AS
SELECT 
  d.deployment_id,
  d.platform,
  d.status,
  d.budget,
  pm.revenue,
  pm.roi,
  pm.conversions,
  pm.clicks,
  pm.impressions,
  ROUND(
    (pm.clicks::DECIMAL / NULLIF(pm.impressions, 0)) * 100, 
    2
  ) as click_rate_percent,
  ROUND(
    (pm.conversions::DECIMAL / NULLIF(pm.clicks, 0)) * 100, 
    2
  ) as conversion_rate_percent,
  d.deployment_timestamp,
  pm.tracking_timestamp
FROM deployments d
LEFT JOIN performance_metrics pm ON d.deployment_id = pm.deployment_id
WHERE d.deployment_timestamp >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY pm.roi DESC NULLS LAST;

CREATE OR REPLACE VIEW lead_optimization_insights AS
SELECT 
  la.niche,
  la.location,
  la.urgency_level,
  la.value_proposition,
  la.confidence,
  la.expected_roi,
  COUNT(*) as analysis_count,
  AVG(la.expected_roi) as avg_expected_roi,
  MAX(la.expected_roi) as max_expected_roi,
  MIN(la.expected_roi) as min_expected_roi
FROM lead_analyses la
WHERE la.analysis_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY la.niche, la.location, la.urgency_level, la.value_proposition, la.confidence, la.expected_roi
ORDER BY avg_expected_roi DESC;

-- Grant permissions
GRANT SELECT ON mcp_agent_performance_summary TO authenticated;
GRANT SELECT ON deployment_roi_analytics TO authenticated;
GRANT SELECT ON lead_optimization_insights TO authenticated;

-- Add comments
COMMENT ON TABLE lead_analyses IS 'AI reasoning and optimization analysis for leads';
COMMENT ON TABLE generated_content IS 'AI-generated ad content with urgency cards, value landing, and outreach emails';
COMMENT ON TABLE deployments IS 'Content deployment tracking with platform and budget information';
COMMENT ON TABLE performance_metrics IS 'ROI and conversion tracking for deployed content';
COMMENT ON TABLE optimization_recommendations IS 'AI-driven optimization recommendations based on performance';
COMMENT ON TABLE upsell_offers IS 'Revenue optimization through targeted upsell offers';
COMMENT ON TABLE mcp_agent_sessions IS 'MCP agent interaction tracking and performance monitoring';

COMMENT ON VIEW mcp_agent_performance_summary IS 'Summary of MCP agent performance by session type and date';
COMMENT ON VIEW deployment_roi_analytics IS 'ROI analytics for all deployments with performance metrics';
COMMENT ON VIEW lead_optimization_insights IS 'Insights into lead optimization patterns and expected ROI';
