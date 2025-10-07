-- GTMM Database Schema Deployment Script
-- Execute this in Supabase SQL Editor to activate the revenue machine
-- Created: 2025-01-07

-- Market research and TAM mapping
CREATE TABLE IF NOT EXISTS public.market_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  niche text NOT NULL,
  target_revenue integer NOT NULL,
  geo text NOT NULL,
  research_prompt text NOT NULL,
  tam_data jsonb,
  opportunity_score integer CHECK (opportunity_score BETWEEN 1 AND 10),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ICP validation and persona scoring
CREATE TABLE IF NOT EXISTS public.icp_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tam_research_id uuid REFERENCES market_research(id),
  target_accounts integer DEFAULT 50,
  validation_prompt text NOT NULL,
  personas jsonb,
  conversion_scores jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Account sourcing and lead generation
CREATE TABLE IF NOT EXISTS public.account_sourcing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id uuid REFERENCES icp_validation(id),
  target_count integer DEFAULT 50,
  sourcing_prompt text NOT NULL,
  accounts jsonb,
  lead_scores jsonb,
  status text DEFAULT 'pending',
  sourced_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Keyword optimization for SEO/conversion
CREATE TABLE IF NOT EXISTS public.keyword_optimization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sourcing_id uuid REFERENCES account_sourcing(id),
  niche text NOT NULL,
  keywords jsonb NOT NULL,
  search_volume jsonb,
  competition_scores jsonb,
  conversion_potential jsonb,
  created_at timestamptz DEFAULT now()
);

-- Messaging variants and A/B testing
CREATE TABLE IF NOT EXISTS public.messaging_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid REFERENCES keyword_optimization(id),
  variant_name text NOT NULL,
  message_content text NOT NULL,
  target_persona text,
  conversion_rate decimal(5,4),
  test_status text DEFAULT 'draft' CHECK (test_status IN ('draft', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_market_research_niche ON market_research(niche);
CREATE INDEX IF NOT EXISTS idx_account_sourcing_status ON account_sourcing(status);
CREATE INDEX IF NOT EXISTS idx_messaging_variants_conversion ON messaging_variants(conversion_rate DESC);

-- RLS policies (admin-only access)
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_sourcing ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_variants ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT policies
CREATE POLICY "market_research_admin_only" ON market_research
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "icp_validation_admin_only" ON icp_validation  
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "account_sourcing_admin_only" ON account_sourcing
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "keyword_optimization_admin_only" ON keyword_optimization
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "messaging_variants_admin_only" ON messaging_variants
  FOR SELECT TO authenticated USING (is_admin());

-- Admin-only INSERT/UPDATE policies
CREATE POLICY "market_research_admin_write" ON market_research
  FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "icp_validation_admin_write" ON icp_validation
  FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "account_sourcing_admin_write" ON account_sourcing
  FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "keyword_optimization_admin_write" ON keyword_optimization
  FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "messaging_variants_admin_write" ON messaging_variants
  FOR ALL TO authenticated USING (is_admin());

-- Audit trail for GTMM operations
CREATE TABLE IF NOT EXISTS public.gtmm_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  operation_data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for audit log
ALTER TABLE gtmm_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gtmm_audit_admin_only" ON gtmm_audit_log
  FOR ALL TO authenticated USING (is_admin());

-- Performance index for audit log
CREATE INDEX IF NOT EXISTS idx_gtmm_audit_created_at ON gtmm_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gtmm_audit_operation_type ON gtmm_audit_log(operation_type);

-- Comments for documentation
COMMENT ON TABLE market_research IS 'TAM mapping and market opportunity analysis for systematic revenue scaling';
COMMENT ON TABLE icp_validation IS 'Ideal Customer Profile validation and persona scoring';
COMMENT ON TABLE account_sourcing IS 'Automated lead generation and account sourcing';
COMMENT ON TABLE keyword_optimization IS 'SEO and conversion keyword optimization';
COMMENT ON TABLE messaging_variants IS 'A/B testing framework for messaging optimization';
COMMENT ON TABLE gtmm_audit_log IS 'Audit trail for all GTMM operations and data changes';

-- Success message
SELECT 'GTMM Database Schema deployed successfully! Revenue machine is ready for activation.' as status;
