-- A/B Test Analytics Queries for Frontend Charting
-- These queries are optimized for JSON output and Recharts integration

-- 1. Main A/B Test Summary Query (JSON output for frontend)
SELECT jsonb_build_object(
  'summary', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'variant', variant,
        'total_views', total_views,
        'total_conversions', total_conversions,
        'unique_viewers', unique_viewers,
        'unique_converters', unique_converters,
        'conversion_rate_percent', conversion_rate_percent,
        'unique_conversion_rate_percent', unique_conversion_rate_percent,
        'avg_time_to_conversion_seconds', avg_time_to_conversion_seconds,
        'uplift_percent', uplift_percent,
        'is_statistically_significant', is_statistically_significant,
        'p_value', p_value,
        'chi_squared_value', chi_squared_value
      )
    )
    FROM ab_test_summary
  ),
  'metadata', jsonb_build_object(
    'date_range', '30 days',
    'generated_at', NOW(),
    'total_variants', (SELECT COUNT(*) FROM ab_test_summary)
  )
) as analytics_data;

-- 2. Daily Breakdown for Line Charts (Recharts format)
SELECT 
  date::text as date,
  variant,
  event_type,
  event_count,
  unique_users
FROM (
  SELECT 
    DATE_TRUNC('day', timestamp) as date,
    variant,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM ab_tests
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', timestamp), variant, event_type
) daily_data
ORDER BY date DESC, variant, event_type;

-- 3. Conversion Rate Comparison (Bar Chart Data)
SELECT 
  variant,
  conversion_rate_percent as rate,
  total_views as views,
  total_conversions as conversions
FROM ab_test_summary
ORDER BY variant;

-- 4. Drop-off Analysis (Pie Chart Data)
SELECT 
  variant,
  metadata->>'dropoff_reason' as dropoff_reason,
  COUNT(*) as dropoff_count,
  ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER (PARTITION BY variant)) * 100, 2) as dropoff_percentage
FROM ab_tests
WHERE event_type = 'cta_dropoff'
  AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY variant, metadata->>'dropoff_reason'
ORDER BY variant, dropoff_count DESC;

-- 5. Statistical Significance Test Results
SELECT 
  'A' as variant,
  total_views,
  total_conversions,
  conversion_rate_percent,
  0 as uplift_percent,
  false as is_statistically_significant,
  null as p_value,
  null as chi_squared_value
FROM ab_test_summary WHERE variant = 'A'
UNION ALL
SELECT 
  'B' as variant,
  total_views,
  total_conversions,
  conversion_rate_percent,
  uplift_percent,
  COALESCE(is_statistically_significant, false) as is_statistically_significant,
  p_value,
  chi_squared_value
FROM ab_test_summary WHERE variant = 'B'
ORDER BY variant;

-- 6. Winner Recommendation Query
WITH winner_analysis AS (
  SELECT 
    variant,
    total_views,
    total_conversions,
    conversion_rate_percent,
    uplift_percent,
    is_statistically_significant,
    p_value
  FROM ab_test_summary
  WHERE variant = 'B'
)
SELECT 
  CASE 
    WHEN total_views >= 500 AND uplift_percent > 1.0 AND is_statistically_significant = true 
    THEN jsonb_build_object(
      'recommendation', 'winner',
      'winner_variant', 'B',
      'confidence', 'high',
      'reason', 'Statistically significant uplift with sufficient sample size'
    )
    WHEN total_views >= 500 AND uplift_percent > 1.0 
    THEN jsonb_build_object(
      'recommendation', 'potential_winner',
      'winner_variant', 'B',
      'confidence', 'medium',
      'reason', 'Positive uplift but not statistically significant'
    )
    WHEN total_views < 500 
    THEN jsonb_build_object(
      'recommendation', 'continue_test',
      'winner_variant', null,
      'confidence', 'low',
      'reason', 'Insufficient sample size'
    )
    ELSE jsonb_build_object(
      'recommendation', 'no_winner',
      'winner_variant', null,
      'confidence', 'low',
      'reason', 'No significant difference detected'
    )
  END as recommendation
FROM winner_analysis;

-- 7. Feature Flag Check Query
SELECT 
  flag_name,
  flag_value,
  is_active,
  updated_at
FROM feature_flags 
WHERE flag_name = 'ab_test_active';

-- 8. Update Feature Flag Query (for ending test)
UPDATE feature_flags 
SET 
  flag_value = 'false',
  is_active = false,
  updated_at = NOW()
WHERE flag_name = 'ab_test_active'
RETURNING flag_name, flag_value, is_active, updated_at;
