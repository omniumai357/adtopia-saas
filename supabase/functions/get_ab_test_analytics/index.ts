import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  date_range_days?: number;
  variant?: 'A' | 'B' | 'both';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { date_range_days = 30, variant = 'both' }: AnalyticsRequest = await req.json()

    // Validate date range
    if (date_range_days < 1 || date_range_days > 365) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Date range must be between 1 and 365 days' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the comprehensive A/B test analysis query
    const analysisQuery = `
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
        WHERE timestamp >= CURRENT_DATE - INTERVAL '${date_range_days} days'
        ${variant !== 'both' ? `AND variant = '${variant}'` : ''}
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
        -- Statistical significance using chi-squared test
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
        CASE 
          WHEN cr.variant = 'B' AND 
               (SELECT variant_a_views FROM statistical_analysis) > 0 AND 
               (SELECT variant_b_views FROM statistical_analysis) > 0 THEN
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
    `;

    // Execute the analysis query
    const { data: analysisData, error: analysisError } = await supabaseClient
      .rpc('exec_sql', { sql: analysisQuery })

    if (analysisError) {
      console.error('Analysis query error:', analysisError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to execute analysis query',
          details: analysisError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get daily breakdown for charting
    const dailyQuery = `
      SELECT 
        variant,
        event_type,
        DATE_TRUNC('day', timestamp) as date,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM ab_tests
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${date_range_days} days'
      ${variant !== 'both' ? `AND variant = '${variant}'` : ''}
      GROUP BY variant, event_type, DATE_TRUNC('day', timestamp)
      ORDER BY date DESC, variant, event_type;
    `;

    const { data: dailyData, error: dailyError } = await supabaseClient
      .rpc('exec_sql', { sql: dailyQuery })

    if (dailyError) {
      console.error('Daily query error:', dailyError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to execute daily breakdown query',
          details: dailyError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get drop-off analysis
    const dropoffQuery = `
      SELECT 
        variant,
        metadata->>'dropoff_reason' as dropoff_reason,
        COUNT(*) as dropoff_count,
        COUNT(DISTINCT user_id) as unique_dropoffs
      FROM ab_tests
      WHERE event_type = 'cta_dropoff'
        AND timestamp >= CURRENT_DATE - INTERVAL '${date_range_days} days'
      ${variant !== 'both' ? `AND variant = '${variant}'` : ''}
      GROUP BY variant, metadata->>'dropoff_reason'
      ORDER BY dropoff_count DESC;
    `;

    const { data: dropoffData, error: dropoffError } = await supabaseClient
      .rpc('exec_sql', { sql: dropoffQuery })

    if (dropoffError) {
      console.error('Dropoff query error:', dropoffError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to execute dropoff analysis query',
          details: dropoffError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format response for frontend charting
    const response = {
      success: true,
      data: {
        summary: analysisData || [],
        daily_breakdown: dailyData || [],
        dropoff_analysis: dropoffData || [],
        metadata: {
          date_range_days,
          variant_filter: variant,
          generated_at: new Date().toISOString(),
          total_variants: analysisData?.length || 0
        }
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
