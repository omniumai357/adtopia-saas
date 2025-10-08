-- Execute in Supabase SQL Editor Dashboard
-- Seed R Movers success data + Fresno plumber performance

-- Create AI optimizations tracking table
CREATE TABLE IF NOT EXISTS public.ai_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  ai_confidence numeric(3,2) NOT NULL,
  recommended_action text NOT NULL,
  urgency_level integer CHECK (urgency_level BETWEEN 1 AND 10),
  value_proposition text NOT NULL,
  generated_content jsonb NOT NULL,
  expected_roi numeric(5,2) NOT NULL,
  actual_roi numeric(5,2),
  agent_version text DEFAULT '1.0.0',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS and admin access
ALTER TABLE public.ai_optimizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_optimizations_admin_access" ON public.ai_optimizations
  FOR ALL TO authenticated
  USING (public.is_system_admin())
  WITH CHECK (public.is_system_admin());

-- Seed successful lead patterns
INSERT INTO public.leads (name, niche, location, features, success_metrics) VALUES 
('R Movers - Rodrigo', 'moving_services', 'Modesto, CA', 
 ARRAY['Local $99/hr', 'Piano Specialty', 'Same-day availability'], 
 jsonb_build_object('conversion_rate', 1.0, 'deal_value', 99, 'response_time_hours', 2)),
 
('Fresno Plumbing Pro', 'plumbing', 'Fresno, CA',
 ARRAY['Emergency 24/7', 'Drain specialist', 'Free estimates'],
 jsonb_build_object('conversion_rate', 0.28, 'text_spike_percent', 28, 'avg_deal_value', 150)),
 
('Central Valley HVAC', 'hvac', 'Fresno, CA',
 ARRAY['Heat wave emergency', 'Same-day AC repair', 'Senior discounts'],
 jsonb_build_object('conversion_rate', 0.35, 'seasonal_boost', true, 'avg_deal_value', 275));

-- Create performance analytics view
CREATE OR REPLACE VIEW ai_performance_analytics AS
SELECT 
  niche,
  location,
  COUNT(*) as total_optimizations,
  AVG(ai_confidence) as avg_confidence,
  AVG(expected_roi) as avg_expected_roi,
  AVG(NULLIF(actual_roi, 0)) as avg_actual_roi,
  COUNT(*) FILTER (WHERE ai_confidence > 0.8) as high_confidence_count,
  ROUND((COUNT(*) FILTER (WHERE ai_confidence > 0.8)::decimal / COUNT(*)) * 100, 2) as high_confidence_percent
FROM ai_optimizations ao
JOIN leads l ON ao.lead_id = l.id::text
GROUP BY niche, location
ORDER BY avg_actual_roi DESC NULLS LAST;

-- Log migration completion
INSERT INTO admin_audit_log (action, details, created_at)
VALUES (
  'cloud_native_migration_completed',
  jsonb_build_object(
    'timestamp', '2025-10-08 20:12:40 UTC',
    'deployment_type', 'docker_free_cloud_native',
    'ai_tracking_enabled', true,
    'success_patterns_seeded', 3,
    'expected_deployment_time', '2_hours',
    'infrastructure', 'fully_managed',
    'scalability', 'auto_scaling',
    'user', 'omniumai357'
  ),
  NOW()
);

SELECT '✅ Database migration complete - AI stack ready' as status;
