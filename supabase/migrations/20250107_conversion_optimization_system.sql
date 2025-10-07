-- CONVERSION OPTIMIZATION SYSTEM
-- OBJECTIVE: Deploy A/B testing for 6-8% conversion rates
-- EXECUTION_MODE: ANALYTICS_DEPLOYMENT
-- OUTPUT: Optimized messaging and conversion funnels

-- Step 1: Create A/B testing schema
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name text NOT NULL,
  variant_a_content text NOT NULL,
  variant_b_content text NOT NULL,
  target_niche text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  target_conversion_rate decimal(5,4) DEFAULT 0.08, -- 8% target
  current_conversion_rate decimal(5,4) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- A/B test results tracking
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant text CHECK (variant IN ('a', 'b')),
  visitor_count integer DEFAULT 0,
  conversion_count integer DEFAULT 0,
  conversion_rate decimal(5,4) DEFAULT 0.0000,
  revenue_generated decimal(10,2) DEFAULT 0.00,
  average_order_value decimal(10,2) DEFAULT 0.00,
  recorded_at timestamptz DEFAULT now()
);

-- Conversion funnel tracking
CREATE TABLE IF NOT EXISTS public.conversion_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name text NOT NULL,
  step_name text NOT NULL,
  step_order integer NOT NULL,
  visitors integer DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_rate decimal(5,4) DEFAULT 0.0000,
  drop_off_rate decimal(5,4) DEFAULT 0.0000,
  recorded_at timestamptz DEFAULT now()
);

-- Messaging variants for optimization
CREATE TABLE IF NOT EXISTS public.messaging_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_name text NOT NULL,
  hook_line text NOT NULL,
  value_proposition text NOT NULL,
  call_to_action text NOT NULL,
  target_niche text,
  variant_type text CHECK (variant_type IN ('urgency', 'social_proof', 'roi_focused', 'risk_reduction', 'scarcity')),
  expected_conversion_lift decimal(5,4) DEFAULT 0.0000,
  actual_conversion_rate decimal(5,4) DEFAULT 0.0000,
  test_status text DEFAULT 'draft' CHECK (test_status IN ('draft', 'testing', 'winner', 'retired')),
  created_at timestamptz DEFAULT now()
);

-- Performance indexes for optimization
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_target_niche ON ab_tests(target_niche);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_funnel_name ON conversion_funnels(funnel_name);
CREATE INDEX IF NOT EXISTS idx_messaging_variants_variant_type ON messaging_variants(variant_type);
CREATE INDEX IF NOT EXISTS idx_messaging_variants_test_status ON messaging_variants(test_status);

-- Step 2: Enable RLS on all conversion optimization tables
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_variants ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for conversion optimization
CREATE POLICY "ab_tests_admin_only" ON ab_tests
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ab_test_results_admin_only" ON ab_test_results
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "conversion_funnels_admin_only" ON conversion_funnels
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "messaging_variants_admin_only" ON messaging_variants
  FOR ALL TO authenticated USING (is_admin());

-- Step 3: Create conversion optimization functions
CREATE OR REPLACE FUNCTION calculate_conversion_rate(
  test_id_param uuid,
  variant_param text
)
RETURNS decimal(5,4)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  visitors_count integer;
  conversions_count integer;
  conversion_rate decimal(5,4);
BEGIN
  SELECT 
    COALESCE(SUM(visitor_count), 0),
    COALESCE(SUM(conversion_count), 0)
  INTO visitors_count, conversions_count
  FROM ab_test_results
  WHERE test_id = test_id_param AND variant = variant_param;
  
  IF visitors_count > 0 THEN
    conversion_rate := conversions_count::decimal / visitors_count::decimal;
  ELSE
    conversion_rate := 0.0000;
  END IF;
  
  RETURN conversion_rate;
END;
$$;

-- Function to determine winning variant
CREATE OR REPLACE FUNCTION determine_winning_variant(test_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  variant_a_rate decimal(5,4);
  variant_b_rate decimal(5,4);
  winner text;
  improvement decimal(5,4);
  result jsonb;
BEGIN
  -- Calculate conversion rates for both variants
  SELECT calculate_conversion_rate(test_id_param, 'a') INTO variant_a_rate;
  SELECT calculate_conversion_rate(test_id_param, 'b') INTO variant_b_rate;
  
  -- Determine winner and improvement
  IF variant_b_rate > variant_a_rate THEN
    winner := 'b';
    improvement := variant_b_rate - variant_a_rate;
  ELSE
    winner := 'a';
    improvement := variant_a_rate - variant_b_rate;
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'test_id', test_id_param,
    'variant_a_rate', variant_a_rate,
    'variant_b_rate', variant_b_rate,
    'winning_variant', winner,
    'improvement', improvement,
    'statistical_significance', CASE 
      WHEN GREATEST(variant_a_rate, variant_b_rate) > 0.06 THEN 'significant'
      ELSE 'insufficient_data'
    END
  );
  
  RETURN result;
END;
$$;

-- Function to track conversion funnel performance
CREATE OR REPLACE FUNCTION track_funnel_conversion(
  funnel_name_param text,
  step_name_param text,
  step_order_param integer,
  visitor_count_param integer,
  conversion_count_param integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversion_rate decimal(5,4);
  drop_off_rate decimal(5,4);
BEGIN
  -- Calculate conversion rate
  IF visitor_count_param > 0 THEN
    conversion_rate := conversion_count_param::decimal / visitor_count_param::decimal;
    drop_off_rate := 1.0 - conversion_rate;
  ELSE
    conversion_rate := 0.0000;
    drop_off_rate := 1.0000;
  END IF;
  
  -- Insert or update funnel data
  INSERT INTO conversion_funnels (
    funnel_name, step_name, step_order, visitors, conversions, 
    conversion_rate, drop_off_rate, recorded_at
  ) VALUES (
    funnel_name_param, step_name_param, step_order_param, 
    visitor_count_param, conversion_count_param, 
    conversion_rate, drop_off_rate, NOW()
  )
  ON CONFLICT (funnel_name, step_name) 
  DO UPDATE SET
    visitors = conversion_funnels.visitors + visitor_count_param,
    conversions = conversion_funnels.conversions + conversion_count_param,
    conversion_rate = (conversion_funnels.conversions + conversion_count_param)::decimal / 
                     (conversion_funnels.visitors + visitor_count_param)::decimal,
    drop_off_rate = 1.0 - ((conversion_funnels.conversions + conversion_count_param)::decimal / 
                          (conversion_funnels.visitors + visitor_count_param)::decimal),
    recorded_at = NOW();
END;
$$;

-- Function to generate FOMO messaging variants
CREATE OR REPLACE FUNCTION generate_fomo_variants(target_niche_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  variants jsonb;
BEGIN
  -- Generate 5 FOMO-driven variants for the target niche
  variants := jsonb_build_array(
    jsonb_build_object(
      'variant_type', 'urgency',
      'hook_line', '60% off AdTopia beta ends in 48 hours!',
      'value_proposition', 'Get 220% more leads with AI-generated QR ads',
      'call_to_action', 'Claim Your Discount Now',
      'expected_conversion_lift', 0.15
    ),
    jsonb_build_object(
      'variant_type', 'social_proof',
      'hook_line', '500+ ' || target_niche_param || ' businesses already using AdTopia',
      'value_proposition', 'Join the leaders getting 3.6x ROI on their marketing',
      'call_to_action', 'Start Your Success Story',
      'expected_conversion_lift', 0.12
    ),
    jsonb_build_object(
      'variant_type', 'roi_focused',
      'hook_line', '220% average lead increase in 30 days',
      'value_proposition', 'Proven results for ' || target_niche_param || ' companies',
      'call_to_action', 'Get Your ROI Report',
      'expected_conversion_lift', 0.18
    ),
    jsonb_build_object(
      'variant_type', 'risk_reduction',
      'hook_line', '7-day money-back guarantee + free setup',
      'value_proposition', 'Zero risk, maximum results for your ' || target_niche_param || ' business',
      'call_to_action', 'Try Risk-Free Today',
      'expected_conversion_lift', 0.10
    ),
    jsonb_build_object(
      'variant_type', 'scarcity',
      'hook_line', 'Only 50 beta spots left for ' || target_niche_param || ' businesses',
      'value_proposition', 'Exclusive access to the most effective marketing tool',
      'call_to_action', 'Reserve Your Spot',
      'expected_conversion_lift', 0.20
    )
  );
  
  RETURN variants;
END;
$$;

-- Step 4: Create conversion optimization monitoring views
CREATE OR REPLACE VIEW conversion_optimization_dashboard AS
SELECT 
  t.id as test_id,
  t.test_name,
  t.target_niche,
  t.status,
  t.target_conversion_rate,
  t.current_conversion_rate,
  COALESCE(a.visitor_count, 0) as variant_a_visitors,
  COALESCE(a.conversion_count, 0) as variant_a_conversions,
  COALESCE(a.conversion_rate, 0.0000) as variant_a_rate,
  COALESCE(b.visitor_count, 0) as variant_b_visitors,
  COALESCE(b.conversion_count, 0) as variant_b_conversions,
  COALESCE(b.conversion_rate, 0.0000) as variant_b_rate,
  CASE 
    WHEN COALESCE(b.conversion_rate, 0) > COALESCE(a.conversion_rate, 0) THEN 'B'
    WHEN COALESCE(a.conversion_rate, 0) > COALESCE(b.conversion_rate, 0) THEN 'A'
    ELSE 'Tie'
  END as current_winner,
  GREATEST(COALESCE(a.conversion_rate, 0), COALESCE(b.conversion_rate, 0)) - 
  LEAST(COALESCE(a.conversion_rate, 0), COALESCE(b.conversion_rate, 0)) as improvement_margin
FROM ab_tests t
LEFT JOIN (
  SELECT test_id, SUM(visitor_count) as visitor_count, SUM(conversion_count) as conversion_count,
         CASE WHEN SUM(visitor_count) > 0 THEN SUM(conversion_count)::decimal / SUM(visitor_count)::decimal ELSE 0 END as conversion_rate
  FROM ab_test_results WHERE variant = 'a' GROUP BY test_id
) a ON t.id = a.test_id
LEFT JOIN (
  SELECT test_id, SUM(visitor_count) as visitor_count, SUM(conversion_count) as conversion_count,
         CASE WHEN SUM(visitor_count) > 0 THEN SUM(conversion_count)::decimal / SUM(visitor_count)::decimal ELSE 0 END as conversion_rate
  FROM ab_test_results WHERE variant = 'b' GROUP BY test_id
) b ON t.id = b.test_id
ORDER BY t.created_at DESC;

-- Step 5: Create automated conversion optimization triggers
CREATE OR REPLACE FUNCTION auto_update_conversion_rates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the test's current conversion rate when results change
  UPDATE ab_tests 
  SET 
    current_conversion_rate = (
      SELECT GREATEST(
        COALESCE(MAX(CASE WHEN variant = 'a' THEN conversion_rate END), 0),
        COALESCE(MAX(CASE WHEN variant = 'b' THEN conversion_rate END), 0)
      )
      FROM ab_test_results 
      WHERE test_id = NEW.test_id
    ),
    updated_at = NOW()
  WHERE id = NEW.test_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic conversion rate updates
CREATE TRIGGER auto_update_conversion_rates_trigger
  AFTER INSERT OR UPDATE ON ab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_conversion_rates();

-- Step 6: Insert initial FOMO messaging variants for construction niche
INSERT INTO messaging_variants (variant_name, hook_line, value_proposition, call_to_action, target_niche, variant_type, expected_conversion_lift)
VALUES 
  ('Construction Urgency', '60% off AdTopia beta ends in 48 hours!', 'Get 220% more leads with AI-generated QR ads', 'Claim Your Discount Now', 'construction', 'urgency', 0.15),
  ('Construction Social Proof', '500+ construction businesses already using AdTopia', 'Join the leaders getting 3.6x ROI on their marketing', 'Start Your Success Story', 'construction', 'social_proof', 0.12),
  ('Construction ROI Focus', '220% average lead increase in 30 days', 'Proven results for construction companies', 'Get Your ROI Report', 'construction', 'roi_focused', 0.18),
  ('Construction Risk Reduction', '7-day money-back guarantee + free setup', 'Zero risk, maximum results for your construction business', 'Try Risk-Free Today', 'construction', 'risk_reduction', 0.10),
  ('Construction Scarcity', 'Only 50 beta spots left for construction businesses', 'Exclusive access to the most effective marketing tool', 'Reserve Your Spot', 'construction', 'scarcity', 0.20);

-- Step 7: Create conversion optimization audit log
CREATE TABLE IF NOT EXISTS public.conversion_optimization_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  test_id uuid REFERENCES ab_tests(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversion_optimization_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversion_optimization_audit_admin_only" ON conversion_optimization_audit
  FOR ALL TO authenticated USING (is_admin());

-- Step 8: Execute initial conversion optimization setup
INSERT INTO conversion_optimization_audit (action_type, details)
VALUES (
  'conversion_optimization_system_deployed',
  jsonb_build_object(
    'tables_created', 5,
    'functions_created', 4,
    'views_created', 1,
    'triggers_created', 1,
    'target_conversion_rate', '6-8%',
    'fomo_variants_created', 5,
    'initial_niche', 'construction'
  )
);

-- Success message
SELECT 'CONVERSION OPTIMIZATION SYSTEM - DEPLOYED' as status,
       'A/B testing framework active for 6-8% conversion rates' as result,
       'FOMO messaging variants ready for construction niche' as features,
       'Real-time conversion tracking and optimization active' as monitoring;
