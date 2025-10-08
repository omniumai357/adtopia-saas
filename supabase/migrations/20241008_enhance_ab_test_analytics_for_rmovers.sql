-- Enhanced A/B test analytics for R Movers deep-dive analysis
-- Adding service-specific metrics and engagement tracking

-- Add service column to ab_tests table if not exists
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS service VARCHAR(50);
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS engagement_time_seconds INTEGER;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS dwell_time_seconds INTEGER;

-- Create index for service-based queries
CREATE INDEX IF NOT EXISTS idx_ab_tests_service ON ab_tests(service);
CREATE INDEX IF NOT EXISTS idx_ab_tests_engagement_time ON ab_tests(engagement_time_seconds);

-- Enhanced analytics view for R Movers metrics
CREATE OR REPLACE VIEW rmovers_ab_test_analytics AS
WITH service_metrics AS (
  SELECT 
    variant,
    service,
    COUNT(*) FILTER (WHERE event_type = 'cta_view') as views,
    COUNT(*) FILTER (WHERE event_type = 'cta_click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'quote_request') as conversions,
    COUNT(*) FILTER (WHERE event_type = 'signup_complete') as signups,
    AVG(engagement_time_seconds) FILTER (WHERE event_type = 'cta_view') as avg_engagement_time,
    AVG(dwell_time_seconds) FILTER (WHERE event_type = 'cta_view') as avg_dwell_time,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_view') as unique_viewers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cta_click') as unique_clickers,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'quote_request') as unique_converters
  FROM ab_tests
  WHERE service = 'movers' 
    AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY variant, service
),
conversion_rates AS (
  SELECT 
    variant,
    service,
    views,
    clicks,
    conversions,
    signups,
    avg_engagement_time,
    avg_dwell_time,
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
    END as click_to_conversion_rate_percent
  FROM service_metrics
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
  cr.service,
  cr.views,
  cr.clicks,
  cr.conversions,
  cr.signups,
  cr.avg_engagement_time,
  cr.avg_dwell_time,
  cr.unique_viewers,
  cr.unique_clickers,
  cr.unique_converters,
  cr.click_rate_percent,
  cr.conversion_rate_percent,
  cr.click_to_conversion_rate_percent,
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
  -- ROI Projection ($99 packs)
  CASE 
    WHEN cr.variant = 'A' THEN cr.conversions * 99
    WHEN cr.variant = 'B' THEN cr.conversions * 99
    ELSE 0
  END as roi_projection_usd
FROM conversion_rates cr
ORDER BY cr.variant;

-- Create view for hybrid test configuration
CREATE OR REPLACE VIEW ab_test_hybrid_recommendations AS
WITH current_performance AS (
  SELECT 
    variant,
    click_rate_percent,
    conversion_rate_percent,
    avg_dwell_time,
    roi_projection_usd
  FROM rmovers_ab_test_analytics
),
hybrid_analysis AS (
  SELECT 
    'A1_Urgency_Red' as variant_name,
    'Red FOMO CTAs with Blue Trust Elements' as hybrid_description,
    'Slots Vanishing overlay + 3,500+ Guarantee' as recommended_mix,
    'Summer blitz seasons, quick-hit campaigns' as best_use_case,
    '+18% projected uplift' as expected_improvement
  UNION ALL
  SELECT 
    'A2_Value_Blue' as variant_name,
    'Blue Trust Cards with Red Urgency CTAs' as hybrid_description,
    'Gallery enlargers + Vanishing slots CTA' as recommended_mix,
    'Off-peak trust-building, family quotes' as best_use_case,
    '+15% projected uplift' as expected_improvement
)
SELECT * FROM hybrid_analysis;

-- Enhanced winner recommendation with confidence levels
CREATE OR REPLACE VIEW rmovers_winner_analysis AS
WITH performance_data AS (
  SELECT 
    variant,
    views,
    conversions,
    conversion_rate_percent,
    click_rate_percent,
    avg_dwell_time,
    roi_projection_usd,
    is_statistically_significant,
    p_value
  FROM rmovers_ab_test_analytics
),
winner_logic AS (
  SELECT 
    variant,
    views,
    conversions,
    conversion_rate_percent,
    click_rate_percent,
    avg_dwell_time,
    roi_projection_usd,
    is_statistically_significant,
    p_value,
    CASE 
      WHEN views >= 200 AND conversion_rate_percent > 10 AND is_statistically_significant = true 
      THEN jsonb_build_object(
        'recommendation', 'winner',
        'confidence', 'high',
        'reason', 'Statistically significant with sufficient sample size',
        'action', 'Deploy immediately'
      )
      WHEN views >= 200 AND conversion_rate_percent > 10 
      THEN jsonb_build_object(
        'recommendation', 'potential_winner',
        'confidence', 'medium',
        'reason', 'Strong performance but not statistically significant',
        'action', 'Continue testing or deploy with monitoring'
      )
      WHEN views < 200 
      THEN jsonb_build_object(
        'recommendation', 'continue_test',
        'confidence', 'low',
        'reason', 'Insufficient sample size for confidence',
        'action', 'Scale to 500+ impressions'
      )
      ELSE jsonb_build_object(
        'recommendation', 'no_winner',
        'confidence', 'low',
        'reason', 'No significant difference detected',
        'action', 'Test hybrid variants'
      )
    END as recommendation
  FROM performance_data
)
SELECT * FROM winner_logic;

-- Grant permissions
GRANT SELECT ON rmovers_ab_test_analytics TO authenticated;
GRANT SELECT ON ab_test_hybrid_recommendations TO authenticated;
GRANT SELECT ON rmovers_winner_analysis TO authenticated;

-- Add comments
COMMENT ON VIEW rmovers_ab_test_analytics IS 'R Movers specific A/B test analytics with engagement metrics';
COMMENT ON VIEW ab_test_hybrid_recommendations IS 'Hybrid test recommendations for A1/A2 combinations';
COMMENT ON VIEW rmovers_winner_analysis IS 'Winner analysis with confidence levels for R Movers tests';
