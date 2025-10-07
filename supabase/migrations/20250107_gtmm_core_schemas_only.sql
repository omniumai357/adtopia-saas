-- ========================================
-- CRITICAL MIGRATION: GTMM Core Schemas Only
-- Execute at: 2025-01-07 17:55:00 UTC
-- Mission: Activate $600K ARR Infrastructure (Core Tables Only)
-- ========================================

-- 1. Market Research & TAM Mapping (GTMM Foundation)
CREATE TABLE IF NOT EXISTS public.market_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  niche text NOT NULL,
  target_revenue integer NOT NULL,
  geo text NOT NULL DEFAULT 'US',
  tam_data jsonb,
  opportunity_score integer CHECK (opportunity_score BETWEEN 1 AND 10),
  pain_points text[],
  recommended_pricing jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. ICP Validation & Persona Scoring
CREATE TABLE IF NOT EXISTS public.icp_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tam_research_id uuid REFERENCES market_research(id) ON DELETE CASCADE,
  target_accounts integer DEFAULT 50,
  personas jsonb NOT NULL DEFAULT '[]',
  conversion_scores jsonb DEFAULT '{}',
  messaging_hooks text[],
  status text DEFAULT 'pending',
  validation_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. Account Sourcing (50 Leads/Week Capability)
CREATE TABLE IF NOT EXISTS public.account_sourcing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id uuid REFERENCES icp_validation(id) ON DELETE CASCADE,
  target_count integer DEFAULT 50,
  sourcing_channels text[] DEFAULT ARRAY['craigslist', 'facebook_groups', 'linkedin', 'google_my_business'],
  accounts jsonb DEFAULT '[]',
  lead_scores jsonb DEFAULT '{}',
  sourced_count integer DEFAULT 0,
  qualified_count integer DEFAULT 0,
  conversion_rate decimal(5,4) DEFAULT 0.0000,
  status text DEFAULT 'pending',
  last_sourced timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. Conversion Optimization & A/B Testing
CREATE TABLE IF NOT EXISTS public.conversion_optimization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  niche text NOT NULL,
  variant_a_content text NOT NULL,
  variant_b_content text NOT NULL,
  target_conversion_rate decimal(5,4) DEFAULT 0.0600, -- 6% target
  current_conversion_rate decimal(5,4) DEFAULT 0.0000,
  test_status text DEFAULT 'draft' CHECK (test_status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  winner_variant text CHECK (winner_variant IN ('a', 'b', 'tie')),
  created_at timestamptz DEFAULT now()
);

-- 5. Multilingual Content (32 Languages)
CREATE TABLE IF NOT EXISTS public.multilingual_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content text NOT NULL,
  source_language text DEFAULT 'en',
  target_language text NOT NULL,
  translated_content text,
  niche text,
  content_type text CHECK (content_type IN ('ad_copy', 'email', 'landing_page', 'cta')),
  quality_score integer CHECK (quality_score BETWEEN 1 AND 10),
  cultural_adaptation_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'translating', 'reviewing', 'approved', 'rejected')),
  translated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. Agency Partner System (White-Label Revenue)
CREATE TABLE IF NOT EXISTS public.agency_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name text NOT NULL,
  contact_email text NOT NULL UNIQUE,
  tier text DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
  commission_rate decimal(5,4) DEFAULT 0.1500, -- 15% default
  monthly_quota integer DEFAULT 10,
  current_month_sales integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_commission_earned decimal(10,2) DEFAULT 0.00,
  white_label_settings jsonb DEFAULT '{}',
  api_key text UNIQUE DEFAULT gen_random_uuid()::text,
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  onboarded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 7. Agency Sales Tracking
CREATE TABLE IF NOT EXISTS public.agency_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agency_partners(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id),
  sale_amount decimal(10,2) NOT NULL,
  commission_earned decimal(10,2) NOT NULL,
  product_tier text NOT NULL,
  sale_source text DEFAULT 'direct',
  stripe_payment_intent_id text,
  sale_date timestamptz DEFAULT now(),
  commission_paid_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- PERFORMANCE INDEXES (CRITICAL)
-- ========================================

-- Market research indexes
CREATE INDEX IF NOT EXISTS idx_market_research_niche ON market_research(niche);
CREATE INDEX IF NOT EXISTS idx_market_research_status ON market_research(status);
CREATE INDEX IF NOT EXISTS idx_market_research_created ON market_research(created_at DESC);

-- Account sourcing indexes  
CREATE INDEX IF NOT EXISTS idx_account_sourcing_status ON account_sourcing(status);
CREATE INDEX IF NOT EXISTS idx_account_sourcing_conversion ON account_sourcing(conversion_rate DESC);

-- Multilingual content indexes
CREATE INDEX IF NOT EXISTS idx_multilingual_target_lang ON multilingual_content(target_language);
CREATE INDEX IF NOT EXISTS idx_multilingual_niche ON multilingual_content(niche);

-- Agency partner indexes
CREATE INDEX IF NOT EXISTS idx_agency_partners_tier ON agency_partners(tier);
CREATE INDEX IF NOT EXISTS idx_agency_partners_status ON agency_partners(status);
CREATE INDEX IF NOT EXISTS idx_agency_sales_date ON agency_sales(sale_date DESC);

-- ========================================
-- RLS POLICIES (SECURITY CRITICAL)
-- ========================================

-- Enable RLS on all new tables
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_sourcing ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE multilingual_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_sales ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "market_research_admin_only" ON market_research
  FOR ALL TO authenticated USING (is_admin());
  
CREATE POLICY "icp_validation_admin_only" ON icp_validation
  FOR ALL TO authenticated USING (is_admin());
  
CREATE POLICY "account_sourcing_admin_only" ON account_sourcing
  FOR ALL TO authenticated USING (is_admin());
  
CREATE POLICY "conversion_optimization_admin_only" ON conversion_optimization
  FOR ALL TO authenticated USING (is_admin());
  
CREATE POLICY "multilingual_content_admin_only" ON multilingual_content
  FOR ALL TO authenticated USING (is_admin());

-- Agency partner policies (partners can view own data)
CREATE POLICY "agency_partners_own_data" ON agency_partners
  FOR SELECT TO authenticated USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ) OR contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "agency_sales_own_data" ON agency_sales
  FOR SELECT TO authenticated USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ) OR agency_id IN (
    SELECT id FROM agency_partners WHERE contact_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  ));

-- ========================================
-- REVENUE AUTOMATION TRIGGERS
-- ========================================

-- Auto-update agency sales totals
CREATE OR REPLACE FUNCTION update_agency_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE agency_partners 
  SET 
    current_month_sales = current_month_sales + 1,
    total_sales = total_sales + 1,
    total_commission_earned = total_commission_earned + NEW.commission_earned
  WHERE id = NEW.agency_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER agency_sales_update_totals
  AFTER INSERT ON agency_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_totals();

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Verify all tables created
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'market_research', 'icp_validation', 'account_sourcing',
    'conversion_optimization', 'multilingual_content', 
    'agency_partners', 'agency_sales'
  )
ORDER BY table_name;

-- Verify indexes created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
