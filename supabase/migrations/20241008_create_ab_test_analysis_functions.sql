-- Create custom function for chi-squared statistical significance test
-- This is a simplified implementation for A/B testing
CREATE OR REPLACE FUNCTION chi_squared_test(
  variant_a_conversions INTEGER,
  variant_a_views INTEGER,
  variant_b_conversions INTEGER,
  variant_b_views INTEGER
) RETURNS TABLE(
  chi_squared_value NUMERIC,
  p_value NUMERIC,
  is_significant BOOLEAN
) AS $$
DECLARE
  total_conversions INTEGER;
  total_views INTEGER;
  expected_a_conversions NUMERIC;
  expected_b_conversions NUMERIC;
  chi_squared NUMERIC;
  degrees_of_freedom INTEGER := 1;
  p_value NUMERIC;
BEGIN
  -- Calculate totals
  total_conversions := variant_a_conversions + variant_b_conversions;
  total_views := variant_a_views + variant_b_views;
  
  -- Calculate expected values
  expected_a_conversions := (variant_a_views::NUMERIC / total_views::NUMERIC) * total_conversions::NUMERIC;
  expected_b_conversions := (variant_b_views::NUMERIC / total_views::NUMERIC) * total_conversions::NUMERIC;
  
  -- Calculate chi-squared statistic
  chi_squared := 
    POWER(variant_a_conversions - expected_a_conversions, 2) / expected_a_conversions +
    POWER(variant_b_conversions - expected_b_conversions, 2) / expected_b_conversions;
  
  -- Calculate p-value using approximation (simplified)
  -- For degrees of freedom = 1, we use a simplified approximation
  -- In production, you might want to use a more sophisticated statistical library
  p_value := CASE 
    WHEN chi_squared > 6.63 THEN 0.01  -- 99% confidence
    WHEN chi_squared > 3.84 THEN 0.05  -- 95% confidence
    WHEN chi_squared > 2.71 THEN 0.10  -- 90% confidence
    ELSE 0.20  -- Not significant
  END;
  
  RETURN QUERY SELECT 
    ROUND(chi_squared, 4),
    p_value,
    (p_value <= 0.05) AS is_significant;
END;
$$ LANGUAGE plpgsql;

-- Create the ab_test_summary view for reusable analysis
CREATE OR REPLACE VIEW ab_test_summary AS
WITH variant_stats AS (
  SELECT 
    variant,
    COUNT(*) FILTER (WHERE event_type = 'cta_view') as total_views,
    COUNT(*) FILTER (WHERE event_type = 'signup_complete') as total_conversions,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_view') as unique_viewers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'signup_complete') as unique_converters,
    AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (PARTITION BY user_id ORDER BY timestamp)))) 
      FILTER (WHERE event_type = 'signup_complete') as avg_time_to_conversion_seconds
  FROM ab_tests
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY variant
),
conversion_rates AS (
  SELECT 
    variant,
    total_views,
    total_conversions,
    unique_viewers,
    unique_converters,
    avg_time_to_conversion_seconds,
    CASE 
      WHEN total_views > 0 THEN ROUND((total_conversions::NUMERIC / total_views::NUMERIC) * 100, 2)
      ELSE 0 
    END as conversion_rate_percent,
    CASE 
      WHEN unique_viewers > 0 THEN ROUND((unique_converters::NUMERIC / unique_viewers::NUMERIC) * 100, 2)
      ELSE 0 
    END as unique_conversion_rate_percent
  FROM variant_stats
),
statistical_analysis AS (
  SELECT 
    (SELECT total_views FROM conversion_rates WHERE variant = 'A') as variant_a_views,
    (SELECT total_conversions FROM conversion_rates WHERE variant = 'A') as variant_a_conversions,
    (SELECT total_views FROM conversion_rates WHERE variant = 'B') as variant_b_views,
    (SELECT total_conversions FROM conversion_rates WHERE variant = 'B') as variant_b_conversions
)
SELECT 
  cr.variant,
  cr.total_views,
  cr.total_conversions,
  cr.unique_viewers,
  cr.unique_converters,
  cr.conversion_rate_percent,
  cr.unique_conversion_rate_percent,
  ROUND(cr.avg_time_to_conversion_seconds, 2) as avg_time_to_conversion_seconds,
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
    WHEN cr.variant = 'B' THEN
      (SELECT is_significant FROM chi_squared_test(
        (SELECT variant_a_conversions FROM statistical_analysis),
        (SELECT variant_a_views FROM statistical_analysis),
        (SELECT variant_b_conversions FROM statistical_analysis),
        (SELECT variant_b_views FROM statistical_analysis)
      ))
    ELSE NULL
  END as is_statistically_significant,
  CASE 
    WHEN cr.variant = 'B' THEN
      (SELECT p_value FROM chi_squared_test(
        (SELECT variant_a_conversions FROM statistical_analysis),
        (SELECT variant_a_views FROM statistical_analysis),
        (SELECT variant_b_conversions FROM statistical_analysis),
        (SELECT variant_b_views FROM statistical_analysis)
      ))
    ELSE NULL
  END as p_value,
  CASE 
    WHEN cr.variant = 'B' THEN
      (SELECT chi_squared_value FROM chi_squared_test(
        (SELECT variant_a_conversions FROM statistical_analysis),
        (SELECT variant_a_views FROM statistical_analysis),
        (SELECT variant_b_conversions FROM statistical_analysis),
        (SELECT variant_b_views FROM statistical_analysis)
      ))
    ELSE NULL
  END as chi_squared_value
FROM conversion_rates cr
ORDER BY cr.variant;

-- Grant permissions
GRANT SELECT ON ab_test_summary TO authenticated;
GRANT EXECUTE ON FUNCTION chi_squared_test TO authenticated;

-- Add comments
COMMENT ON VIEW ab_test_summary IS 'Comprehensive A/B test analysis with statistical significance';
COMMENT ON FUNCTION chi_squared_test IS 'Calculates chi-squared test for A/B test statistical significance';
