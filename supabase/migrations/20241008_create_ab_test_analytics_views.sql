-- A/B Test Analytics Views and Functions
-- Provides comprehensive analysis of A/B test results

-- Function to calculate chi-squared p-value for statistical significance
CREATE OR REPLACE FUNCTION chi_squared_test(
  variant_a_conversions INTEGER,
  variant_a_views INTEGER,
  variant_b_conversions INTEGER,
  variant_b_views INTEGER
) RETURNS TABLE(p_value NUMERIC, is_significant BOOLEAN) AS $$
DECLARE
  total_conversions INTEGER;
  total_views INTEGER;
  expected_a_conversions NUMERIC;
  expected_b_conversions NUMERIC;
  chi_squared NUMERIC;
  p_value NUMERIC;
BEGIN
  -- Calculate totals
  total_conversions := variant_a_conversions + variant_b_conversions;
  total_views := variant_a_views + variant_b_views;
  
  -- Skip calculation if insufficient data
  IF total_views < 30 OR variant_a_views = 0 OR variant_b_views = 0 THEN
    RETURN QUERY SELECT 1.0::NUMERIC, false;
    RETURN;
  END IF;
  
  -- Calculate expected values
  expected_a_conversions := (variant_a_views::NUMERIC / total_views::NUMERIC) * total_conversions::NUMERIC;
  expected_b_conversions := (variant_b_views::NUMERIC / total_views::NUMERIC) * total_conversions::NUMERIC;
  
  -- Calculate chi-squared statistic
  chi_squared := 
    POWER(variant_a_conversions - expected_a_conversions, 2) / expected_a_conversions +
    POWER(variant_b_conversions - expected_b_conversions, 2) / expected_b_conversions;
  
  -- Approximate p-value (simplified for 1 degree of freedom)
  -- For production, use proper chi-squared distribution lookup
  IF chi_squared > 3.84 THEN
    p_value := 0.05; -- Significant at 95% confidence
  ELSIF chi_squared > 6.63 THEN
    p_value := 0.01; -- Significant at 99% confidence
  ELSE
    p_value := 0.1; -- Not significant
  END IF;
  
  RETURN QUERY SELECT p_value, (p_value <= 0.05);
END;
$$ LANGUAGE plpgsql;

-- Main A/B test summary view
CREATE OR REPLACE VIEW ab_test_summary AS
WITH variant_metrics AS (
  SELECT 
    variant,
    COUNT(*) FILTER (WHERE event_type = 'cta_view') as views,
    COUNT(*) FILTER (WHERE event_type = 'cta_click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'signup_complete') as conversions,
    COUNT(*) FILTER (WHERE event_type = 'cta_dropoff') as dropoffs,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_view') as unique_viewers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_click') as unique_clickers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'signup_complete') as unique_converters
  FROM ab_tests
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY variant
),
conversion_rates AS (
  SELECT 
    variant,
    views,
    clicks,
    conversions,
    dropoffs,
    unique_viewers,
    unique_clickers,
    unique_converters,
    CASE 
      WHEN views > 0 THEN ROUND((clicks::NUMERIC / views::NUMERIC) * 100, 2)
      ELSE 0 
    END as click_rate_percent,
    CASE 
      WHEN views > 0 THEN ROUND((conversions::NUMERIC / views::NUMERIC) * 100, 2)
      ELSE 0 
    END as conversion_rate_percent,
    CASE 
      WHEN clicks > 0 THEN ROUND((conversions::NUMERIC / clicks::NUMERIC) * 100, 2)
      ELSE 0 
    END as click_to_conversion_rate_percent,
    CASE 
      WHEN views > 0 THEN ROUND((dropoffs::NUMERIC / views::NUMERIC) * 100, 2)
      ELSE 0 
    END as dropoff_rate_percent
  FROM variant_metrics
),
statistical_analysis AS (
  SELECT 
    (SELECT views FROM conversion_rates WHERE variant = 'A') as variant_a_views,
    (SELECT conversions FROM conversion_rates WHERE variant = 'A') as variant_a_conversions,
    (SELECT views FROM conversion_rates WHERE variant = 'B') as variant_b_views,
    (SELECT conversions FROM conversion_rates WHERE variant = 'B') as variant_b_conversions
)
SELECT 
  cr.variant,
  cr.views,
  cr.clicks,
  cr.conversions,
  cr.dropoffs,
  cr.unique_viewers,
  cr.unique_clickers,
  cr.unique_converters,
  cr.click_rate_percent,
  cr.conversion_rate_percent,
  cr.click_to_conversion_rate_percent,
  cr.dropoff_rate_percent,
  -- Calculate uplift (B - A)
  CASE 
    WHEN cr.variant = 'B' AND EXISTS (SELECT 1 FROM conversion_rates WHERE variant = 'A' AND conversion_rate_percent > 0)
    THEN ROUND(
      cr.conversion_rate_percent - (SELECT conversion_rate_percent FROM conversion_rates WHERE variant = 'A'),
      2
    )
    ELSE 0
  END as uplift_percent,
  -- Statistical significance
  CASE 
    WHEN cr.variant = 'B' AND 
         (SELECT variant_a_views FROM statistical_analysis) > 0 AND 
         (SELECT variant_b_views FROM statistical_analysis) > 0 THEN
      (SELECT is_significant FROM chi_squared_test(
        (SELECT variant_a_conversions FROM statistical_analysis),
        (SELECT variant_a_views FROM statistical_analysis),
        (SELECT variant_b_conversions FROM statistical_analysis),
        (SELECT variant_b_views FROM statistical_analysis)
      ))
    ELSE NULL
  END as is_statistically_significant,
  CASE 
    WHEN cr.variant = 'B' AND 
         (SELECT variant_a_views FROM statistical_analysis) > 0 AND 
         (SELECT variant_b_views FROM statistical_analysis) > 0 THEN
      (SELECT p_value FROM chi_squared_test(
        (SELECT variant_a_conversions FROM statistical_analysis),
        (SELECT variant_a_views FROM statistical_analysis),
        (SELECT variant_b_conversions FROM statistical_analysis),
        (SELECT variant_b_views FROM statistical_analysis)
      ))
    ELSE NULL
  END as p_value,
  -- Revenue projection (assuming $100 LTV per conversion)
  cr.conversions * 100 as projected_revenue_usd,
  -- Confidence level based on sample size
  CASE 
    WHEN cr.views >= 1000 THEN 'High'
    WHEN cr.views >= 500 THEN 'Medium'
    WHEN cr.views >= 100 THEN 'Low'
    ELSE 'Very Low'
  END as confidence_level
FROM conversion_rates cr
ORDER BY cr.variant;

-- Daily A/B test performance view
CREATE OR REPLACE VIEW ab_test_daily_performance AS
SELECT 
  DATE(timestamp) as test_date,
  variant,
  COUNT(*) FILTER (WHERE event_type = 'cta_view') as daily_views,
  COUNT(*) FILTER (WHERE event_type = 'cta_click') as daily_clicks,
  COUNT(*) FILTER (WHERE event_type = 'signup_complete') as daily_conversions,
  ROUND(
    (COUNT(*) FILTER (WHERE event_type = 'signup_complete')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE event_type = 'cta_view'), 0)) * 100, 
    2
  ) as daily_conversion_rate
FROM ab_tests
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), variant
ORDER BY test_date DESC, variant;

-- A/B test winner recommendation view
CREATE OR REPLACE VIEW ab_test_winner_recommendation AS
WITH performance_data AS (
  SELECT 
    variant,
    views,
    conversions,
    conversion_rate_percent,
    click_rate_percent,
    is_statistically_significant,
    p_value,
    confidence_level
  FROM ab_test_summary
),
winner_logic AS (
  SELECT 
    variant,
    views,
    conversions,
    conversion_rate_percent,
    click_rate_percent,
    is_statistically_significant,
    p_value,
    confidence_level,
    CASE 
      WHEN views >= 500 AND conversion_rate_percent > 5 AND is_statistically_significant = true 
      THEN jsonb_build_object(
        'recommendation', 'winner',
        'confidence', 'high',
        'reason', 'Statistically significant with sufficient sample size',
        'action', 'Deploy immediately'
      )
      WHEN views >= 500 AND conversion_rate_percent > 5 
      THEN jsonb_build_object(
        'recommendation', 'potential_winner',
        'confidence', 'medium',
        'reason', 'Strong performance but not statistically significant',
        'action', 'Continue testing or deploy with monitoring'
      )
      WHEN views < 500 
      THEN jsonb_build_object(
        'recommendation', 'continue_test',
        'confidence', 'low',
        'reason', 'Insufficient sample size for confidence',
        'action', 'Scale to 1000+ impressions'
      )
      ELSE jsonb_build_object(
        'recommendation', 'no_winner',
        'confidence', 'low',
        'reason', 'No significant difference detected',
        'action', 'Test new variants'
      )
    END as recommendation
  FROM performance_data
)
SELECT * FROM winner_logic;

-- Grant permissions
GRANT SELECT ON ab_test_summary TO authenticated;
GRANT SELECT ON ab_test_daily_performance TO authenticated;
GRANT SELECT ON ab_test_winner_recommendation TO authenticated;

-- Add comments
COMMENT ON VIEW ab_test_summary IS 'Comprehensive A/B test analytics with statistical significance';
COMMENT ON VIEW ab_test_daily_performance IS 'Daily performance metrics for A/B tests';
COMMENT ON VIEW ab_test_winner_recommendation IS 'Automated winner recommendations with confidence levels';
COMMENT ON FUNCTION chi_squared_test IS 'Calculates chi-squared p-value for A/B test statistical significance';
