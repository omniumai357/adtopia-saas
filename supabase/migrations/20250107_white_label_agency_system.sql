-- WHITE LABEL AGENCY DEPLOYMENT
-- OBJECTIVE: Deploy agency packages for exponential scaling
-- EXECUTION_MODE: MULTI_TENANT_SYSTEM
-- OUTPUT: Agency partner revenue multiplication

-- Step 1: Create agency partner schema
CREATE TABLE IF NOT EXISTS public.agency_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  agency_website text,
  tier text CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
  commission_rate decimal(5,4) NOT NULL,
  monthly_quota integer NOT NULL,
  current_sales integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  white_label_settings jsonb DEFAULT '{}',
  target_niches text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  onboarding_completed boolean DEFAULT false,
  contract_signed boolean DEFAULT false,
  payment_method text,
  billing_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency sales tracking
CREATE TABLE IF NOT EXISTS public.agency_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agency_partners(id) ON DELETE CASCADE,
  customer_id uuid,
  customer_email text,
  sale_amount decimal(10,2) NOT NULL,
  commission_earned decimal(10,2) NOT NULL,
  commission_rate decimal(5,4) NOT NULL,
  product_tier text,
  sale_date timestamptz DEFAULT now(),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  commission_paid_date timestamptz,
  notes text
);

-- Agency performance metrics
CREATE TABLE IF NOT EXISTS public.agency_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agency_partners(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: '2025-01'
  sales_count integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0.00,
  commission_earned decimal(10,2) DEFAULT 0.00,
  quota_achievement_percent decimal(5,2) DEFAULT 0.00,
  top_performing_niche text,
  customer_retention_rate decimal(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- White-label customization settings
CREATE TABLE IF NOT EXISTS public.agency_white_label_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agency_partners(id) ON DELETE CASCADE,
  custom_domain text,
  custom_logo_url text,
  brand_colors jsonb, -- {"primary": "#000000", "secondary": "#ffffff"}
  custom_messaging jsonb, -- Custom CTAs, value propositions, etc.
  email_templates jsonb, -- Custom email templates
  landing_page_settings jsonb, -- Custom landing page configurations
  pricing_display jsonb, -- Custom pricing presentation
  support_contact_info jsonb, -- Custom support details
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency tier configurations
CREATE TABLE IF NOT EXISTS public.agency_tier_configs (
  tier text PRIMARY KEY,
  tier_name text NOT NULL,
  commission_rate decimal(5,4) NOT NULL,
  minimum_monthly_quota integer NOT NULL,
  white_label_features jsonb NOT NULL,
  support_level text NOT NULL,
  onboarding_benefits jsonb,
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_agency_partners_tier ON agency_partners(tier);
CREATE INDEX IF NOT EXISTS idx_agency_partners_status ON agency_partners(status);
CREATE INDEX IF NOT EXISTS idx_agency_partners_created_at ON agency_partners(created_at);
CREATE INDEX IF NOT EXISTS idx_agency_sales_agency_id ON agency_sales(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_sales_sale_date ON agency_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_agency_sales_payment_status ON agency_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_agency_performance_agency_id ON agency_performance(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_performance_month_year ON agency_performance(month_year);
CREATE INDEX IF NOT EXISTS idx_agency_white_label_agency_id ON agency_white_label_settings(agency_id);

-- Step 2: Enable RLS on all agency tables
ALTER TABLE agency_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_white_label_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_tier_configs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for agency management
CREATE POLICY "agency_partners_admin_only" ON agency_partners
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "agency_sales_admin_only" ON agency_sales
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "agency_performance_admin_only" ON agency_performance
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "agency_white_label_admin_only" ON agency_white_label_settings
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "agency_tier_configs_admin_only" ON agency_tier_configs
  FOR ALL TO authenticated USING (is_admin());

-- Step 3: Create agency management functions
CREATE OR REPLACE FUNCTION calculate_agency_commission(
  sale_amount_param decimal(10,2),
  agency_id_param uuid
)
RETURNS decimal(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commission_rate decimal(5,4);
  commission_amount decimal(10,2);
BEGIN
  -- Get agency commission rate
  SELECT commission_rate INTO commission_rate
  FROM agency_partners
  WHERE id = agency_id_param;
  
  -- Calculate commission
  commission_amount := sale_amount_param * commission_rate;
  
  RETURN commission_amount;
END;
$$;

-- Function to update agency performance metrics
CREATE OR REPLACE FUNCTION update_agency_performance(
  agency_id_param uuid,
  month_year_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sales_count integer;
  total_revenue decimal(10,2);
  commission_earned decimal(10,2);
  quota_achievement decimal(5,2);
  monthly_quota integer;
BEGIN
  -- Get sales data for the month
  SELECT 
    COUNT(*),
    COALESCE(SUM(sale_amount), 0),
    COALESCE(SUM(commission_earned), 0)
  INTO sales_count, total_revenue, commission_earned
  FROM agency_sales
  WHERE agency_id = agency_id_param
    AND to_char(sale_date, 'YYYY-MM') = month_year_param;
  
  -- Get monthly quota
  SELECT monthly_quota INTO monthly_quota
  FROM agency_partners
  WHERE id = agency_id_param;
  
  -- Calculate quota achievement
  IF monthly_quota > 0 THEN
    quota_achievement := (sales_count::decimal / monthly_quota::decimal) * 100;
  ELSE
    quota_achievement := 0;
  END IF;
  
  -- Upsert performance data
  INSERT INTO agency_performance (
    agency_id, month_year, sales_count, total_revenue, 
    commission_earned, quota_achievement_percent
  ) VALUES (
    agency_id_param, month_year_param, sales_count, total_revenue,
    commission_earned, quota_achievement
  )
  ON CONFLICT (agency_id, month_year) 
  DO UPDATE SET
    sales_count = EXCLUDED.sales_count,
    total_revenue = EXCLUDED.total_revenue,
    commission_earned = EXCLUDED.commission_earned,
    quota_achievement_percent = EXCLUDED.quota_achievement_percent;
END;
$$;

-- Function to determine agency tier based on performance
CREATE OR REPLACE FUNCTION determine_agency_tier(
  expected_monthly_sales_param integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier text;
  commission_rate decimal(5,4);
  features jsonb;
BEGIN
  -- Determine tier based on expected sales
  IF expected_monthly_sales_param >= 100 THEN
    tier := 'PLATINUM';
    commission_rate := 0.35;
    features := jsonb_build_object(
      'custom_domain', true,
      'priority_support', true,
      'dedicated_account_manager', true,
      'custom_branding', true,
      'advanced_analytics', true,
      'api_access', true
    );
  ELSIF expected_monthly_sales_param >= 50 THEN
    tier := 'GOLD';
    commission_rate := 0.30;
    features := jsonb_build_object(
      'custom_domain', true,
      'priority_support', true,
      'dedicated_account_manager', false,
      'custom_branding', true,
      'advanced_analytics', true,
      'api_access', false
    );
  ELSIF expected_monthly_sales_param >= 20 THEN
    tier := 'SILVER';
    commission_rate := 0.25;
    features := jsonb_build_object(
      'custom_domain', false,
      'priority_support', false,
      'dedicated_account_manager', false,
      'custom_branding', true,
      'advanced_analytics', false,
      'api_access', false
    );
  ELSE
    tier := 'BRONZE';
    commission_rate := 0.15;
    features := jsonb_build_object(
      'custom_domain', false,
      'priority_support', false,
      'dedicated_account_manager', false,
      'custom_branding', false,
      'advanced_analytics', false,
      'api_access', false
    );
  END IF;
  
  RETURN jsonb_build_object(
    'tier', tier,
    'commission_rate', commission_rate,
    'features', features
  );
END;
$$;

-- Step 4: Insert agency tier configurations
INSERT INTO agency_tier_configs (tier, tier_name, commission_rate, minimum_monthly_quota, white_label_features, support_level, onboarding_benefits) VALUES
('BRONZE', 'Bronze Partner', 0.15, 5, 
 '{"custom_branding": false, "custom_domain": false, "priority_support": false}', 
 'Standard Email Support',
 '{"setup_assistance": true, "basic_training": true, "marketing_materials": true}'),

('SILVER', 'Silver Partner', 0.25, 20,
 '{"custom_branding": true, "custom_domain": false, "priority_support": false}',
 'Priority Email Support',
 '{"setup_assistance": true, "advanced_training": true, "custom_marketing_materials": true, "monthly_strategy_call": true}'),

('GOLD', 'Gold Partner', 0.30, 50,
 '{"custom_branding": true, "custom_domain": true, "priority_support": true, "advanced_analytics": true}',
 'Priority Phone + Email Support',
 '{"dedicated_onboarding": true, "comprehensive_training": true, "custom_marketing_materials": true, "weekly_strategy_calls": true, "co_marketing_opportunities": true}'),

('PLATINUM', 'Platinum Partner', 0.35, 100,
 '{"custom_branding": true, "custom_domain": true, "priority_support": true, "dedicated_account_manager": true, "advanced_analytics": true, "api_access": true}',
 'Dedicated Account Manager + Priority Support',
 '{"white_glove_onboarding": true, "comprehensive_training": true, "custom_marketing_materials": true, "daily_strategy_calls": true, "co_marketing_opportunities": true, "exclusive_events": true, "custom_development": true}');

-- Step 5: Create agency dashboard views
CREATE OR REPLACE VIEW agency_dashboard_overview AS
SELECT 
  ap.id,
  ap.agency_name,
  ap.contact_email,
  ap.tier,
  ap.commission_rate,
  ap.monthly_quota,
  ap.current_sales,
  ap.total_sales,
  ap.status,
  ap.onboarding_completed,
  ap.contract_signed,
  COALESCE(perf.quota_achievement_percent, 0) as quota_achievement_percent,
  COALESCE(perf.total_revenue, 0) as monthly_revenue,
  COALESCE(perf.commission_earned, 0) as monthly_commission,
  ap.created_at,
  ap.updated_at
FROM agency_partners ap
LEFT JOIN (
  SELECT 
    agency_id,
    quota_achievement_percent,
    total_revenue,
    commission_earned
  FROM agency_performance
  WHERE month_year = to_char(CURRENT_DATE, 'YYYY-MM')
) perf ON ap.id = perf.agency_id
ORDER BY ap.created_at DESC;

-- Step 6: Create agency audit log
CREATE TABLE IF NOT EXISTS public.agency_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  agency_id uuid REFERENCES agency_partners(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agency_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agency_audit_admin_only" ON agency_audit_log
  FOR ALL TO authenticated USING (is_admin());

-- Step 7: Create triggers for automatic updates
CREATE OR REPLACE FUNCTION auto_update_agency_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update agency current sales count
  UPDATE agency_partners 
  SET 
    current_sales = (
      SELECT COUNT(*) 
      FROM agency_sales 
      WHERE agency_id = NEW.agency_id 
        AND to_char(sale_date, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')
    ),
    total_sales = (
      SELECT COUNT(*) 
      FROM agency_sales 
      WHERE agency_id = NEW.agency_id
    ),
    updated_at = NOW()
  WHERE id = NEW.agency_id;
  
  -- Update performance metrics
  PERFORM update_agency_performance(
    NEW.agency_id, 
    to_char(NEW.sale_date, 'YYYY-MM')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic sales updates
CREATE TRIGGER auto_update_agency_sales_trigger
  AFTER INSERT OR UPDATE ON agency_sales
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_agency_sales();

-- Step 8: Execute initial agency system setup
INSERT INTO agency_audit_log (action_type, details)
VALUES (
  'white_label_agency_system_deployed',
  jsonb_build_object(
    'tiers_created', 4,
    'tables_created', 5,
    'functions_created', 3,
    'views_created', 1,
    'triggers_created', 1,
    'commission_rates', '15% to 35%',
    'white_label_features', 'Full customization support',
    'expected_partners', '50+ agencies'
  )
);

-- Success message
SELECT 'WHITE LABEL AGENCY SYSTEM - DEPLOYED' as status,
       'Agency partner system operational for exponential scaling' as result,
       'Tiered commission structure and white-label customization active' as features,
       'Revenue multiplication through partnerships enabled' as capability;
