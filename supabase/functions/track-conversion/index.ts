import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface ConversionTrackingRequest {
  test_id: string;
  variant: 'a' | 'b';
  event_type: 'view' | 'conversion';
  visitor_id?: string;
  revenue?: number;
  metadata?: Record<string, any>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { test_id, variant, event_type, visitor_id, revenue = 0, metadata = {} } = await req.json() as ConversionTrackingRequest;
    
    console.log(`📊 Tracking ${event_type} for test ${test_id}, variant ${variant}`);
    
    // Validate test exists
    const { data: testData, error: testError } = await supabase
      .from('ab_tests')
      .select('id, test_name, status')
      .eq('id', test_id)
      .single();

    if (testError || !testData) {
      throw new Error(`Test not found: ${test_id}`);
    }

    if (testData.status !== 'active') {
      throw new Error(`Test is not active: ${testData.status}`);
    }

    // Get current results for this variant
    const { data: currentResults, error: resultsError } = await supabase
      .from('ab_test_results')
      .select('*')
      .eq('test_id', test_id)
      .eq('variant', variant)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    let visitorCount = 0;
    let conversionCount = 0;
    let totalRevenue = 0;

    if (currentResults) {
      visitorCount = currentResults.visitor_count;
      conversionCount = currentResults.conversion_count;
      totalRevenue = parseFloat(currentResults.revenue_generated.toString());
    }

    // Update counts based on event type
    if (event_type === 'view') {
      visitorCount += 1;
    } else if (event_type === 'conversion') {
      conversionCount += 1;
      totalRevenue += revenue;
    }

    // Calculate new conversion rate
    const conversionRate = visitorCount > 0 ? conversionCount / visitorCount : 0;
    const averageOrderValue = conversionCount > 0 ? totalRevenue / conversionCount : 0;

    // Upsert the results
    const { data: upsertData, error: upsertError } = await supabase
      .from('ab_test_results')
      .upsert({
        test_id,
        variant,
        visitor_count: visitorCount,
        conversion_count: conversionCount,
        conversion_rate: conversionRate,
        revenue_generated: totalRevenue,
        average_order_value: averageOrderValue,
        recorded_at: new Date().toISOString()
      }, {
        onConflict: 'test_id,variant'
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    // Log the tracking event
    await supabase.from('conversion_optimization_audit').insert({
      action_type: 'conversion_tracking_event',
      test_id,
      details: {
        variant,
        event_type,
        visitor_id,
        revenue,
        metadata,
        new_visitor_count: visitorCount,
        new_conversion_count: conversionCount,
        new_conversion_rate: conversionRate
      }
    });

    // Check if we should determine a winner (minimum 100 visitors per variant)
    const { data: allResults, error: allResultsError } = await supabase
      .from('ab_test_results')
      .select('variant, visitor_count, conversion_count, conversion_rate')
      .eq('test_id', test_id);

    if (!allResultsError && allResults) {
      const variantA = allResults.find(r => r.variant === 'a');
      const variantB = allResults.find(r => r.variant === 'b');

      if (variantA && variantB && 
          variantA.visitor_count >= 100 && 
          variantB.visitor_count >= 100) {
        
        // Calculate statistical significance (simplified)
        const improvement = Math.abs(variantB.conversion_rate - variantA.conversion_rate);
        const isSignificant = improvement > 0.02; // 2% minimum improvement

        if (isSignificant) {
          const winner = variantB.conversion_rate > variantA.conversion_rate ? 'b' : 'a';
          
          // Update test status
          await supabase
            .from('ab_tests')
            .update({ 
              status: 'completed',
              current_conversion_rate: Math.max(variantA.conversion_rate, variantB.conversion_rate)
            })
            .eq('id', test_id);

          // Log winner determination
          await supabase.from('conversion_optimization_audit').insert({
            action_type: 'ab_test_winner_determined',
            test_id,
            details: {
              winner,
              variant_a_rate: variantA.conversion_rate,
              variant_b_rate: variantB.conversion_rate,
              improvement,
              statistical_significance: isSignificant,
              total_visitors: variantA.visitor_count + variantB.visitor_count
            }
          });

          console.log(`🏆 Winner determined: Variant ${winner.toUpperCase()} with ${(Math.max(variantA.conversion_rate, variantB.conversion_rate) * 100).toFixed(2)}% conversion rate`);
        }
      }
    }

    const response = {
      success: true,
      test_id,
      variant,
      event_type,
      current_stats: {
        visitor_count: visitorCount,
        conversion_count: conversionCount,
        conversion_rate: `${(conversionRate * 100).toFixed(2)}%`,
        revenue_generated: totalRevenue,
        average_order_value: averageOrderValue
      },
      test_status: testData.status,
      next_action: event_type === 'view' ? 'Track conversion when user completes purchase' : 'Continue monitoring for statistical significance'
    };

    console.log(`✅ Tracked ${event_type}: ${(conversionRate * 100).toFixed(2)}% conversion rate`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('💥 Conversion tracking error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Conversion tracking failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
