import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface OptimizationRequest {
  niche: string;
  current_conversion_rate: number;
  target_conversion_rate?: number;
}

interface MessagingVariant {
  variant_type: string;
  hook_line: string;
  value_proposition: string;
  call_to_action: string;
  expected_conversion_lift: number;
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
    const { niche, current_conversion_rate, target_conversion_rate = 0.08 } = await req.json() as OptimizationRequest;
    
    console.log(`🎯 Optimizing messaging for ${niche} niche`);
    console.log(`Current conversion rate: ${current_conversion_rate}%`);
    console.log(`Target conversion rate: ${target_conversion_rate * 100}%`);

    // Enhanced optimization prompt for 6-8% conversion rates
    const optimizationPrompt = `
    MISSION: Optimize messaging for ${niche} to achieve 6-8% conversion rates

    CURRENT PERFORMANCE:
    - Niche: ${niche}
    - Current Conversion Rate: ${current_conversion_rate}%
    - Target Conversion Rate: ${target_conversion_rate * 100}%
    - Improvement Needed: ${((target_conversion_rate * 100) - current_conversion_rate).toFixed(1)}%

    OPTIMIZATION STRATEGY:
    Generate 5 FOMO-driven variants specifically for ${niche} businesses:

    1. URGENCY-BASED ("60% off beta ends soon")
       - Create time-sensitive offers
       - Limited-time discounts
       - Deadline-driven messaging

    2. SOCIAL PROOF ("500+ ${niche} businesses using AdTopia")
       - Industry-specific testimonials
       - Peer success stories
       - Community validation

    3. ROI-FOCUSED ("220% average lead increase")
       - Quantified results
       - Industry-specific metrics
       - Profit-focused messaging

    4. RISK-REDUCTION ("7-day money-back guarantee")
       - Risk-free trials
       - Guarantee messaging
       - Low-commitment offers

    5. SCARCITY ("Only 50 beta spots left")
       - Limited availability
       - Exclusive access
       - Premium positioning

    FOR EACH VARIANT PROVIDE:
    - Hook Line: Attention-grabbing opening
    - Value Proposition: Clear benefit statement
    - Call-to-Action: Specific action request
    - Expected Conversion Lift: Predicted improvement
    - Target Audience: Specific ${niche} persona

    CONVERSION OPTIMIZATION TARGETS:
    - Current: ${current_conversion_rate}%
    - Target: 6-8%
    - Improvement: ${((target_conversion_rate * 100) - current_conversion_rate).toFixed(1)}%
    - Success Metric: 10%+ improvement in conversion rate
    `;

    // Generate FOMO messaging variants
    const fomoVariants: MessagingVariant[] = [
      {
        variant_type: 'urgency',
        hook_line: `60% off AdTopia beta ends in 48 hours for ${niche} businesses!`,
        value_proposition: `Get 220% more leads with AI-generated QR ads designed for ${niche} companies`,
        call_to_action: 'Claim Your Discount Now',
        expected_conversion_lift: 0.15
      },
      {
        variant_type: 'social_proof',
        hook_line: `500+ ${niche} businesses already using AdTopia to grow`,
        value_proposition: `Join the ${niche} leaders getting 3.6x ROI on their marketing spend`,
        call_to_action: 'Start Your Success Story',
        expected_conversion_lift: 0.12
      },
      {
        variant_type: 'roi_focused',
        hook_line: `220% average lead increase in 30 days for ${niche} companies`,
        value_proposition: `Proven results: ${niche} businesses see 3.6x ROI with AdTopia's AI ads`,
        call_to_action: 'Get Your ROI Report',
        expected_conversion_lift: 0.18
      },
      {
        variant_type: 'risk_reduction',
        hook_line: `7-day money-back guarantee + free setup for ${niche} businesses`,
        value_proposition: `Zero risk, maximum results for your ${niche} business with guaranteed ROI`,
        call_to_action: 'Try Risk-Free Today',
        expected_conversion_lift: 0.10
      },
      {
        variant_type: 'scarcity',
        hook_line: `Only 50 beta spots left for ${niche} businesses`,
        value_proposition: `Exclusive access to the most effective marketing tool for ${niche} companies`,
        call_to_action: 'Reserve Your Spot',
        expected_conversion_lift: 0.20
      }
    ];

    // Store optimization request in database
    const { data: optimizationData, error: optimizationError } = await supabase
      .from('messaging_variants')
      .insert(
        fomoVariants.map(variant => ({
          variant_name: `${niche}_${variant.variant_type}`,
          hook_line: variant.hook_line,
          value_proposition: variant.value_proposition,
          call_to_action: variant.call_to_action,
          target_niche: niche,
          variant_type: variant.variant_type,
          expected_conversion_lift: variant.expected_conversion_lift,
          test_status: 'draft'
        }))
      )
      .select();

    if (optimizationError) {
      console.error('Error storing messaging variants:', optimizationError);
      throw optimizationError;
    }

    // Create A/B test for the variants
    const { data: abTestData, error: abTestError } = await supabase
      .from('ab_tests')
      .insert({
        test_name: `${niche}_conversion_optimization_${new Date().toISOString().split('T')[0]}`,
        variant_a_content: fomoVariants[0].hook_line + ' | ' + fomoVariants[0].value_proposition,
        variant_b_content: fomoVariants[1].hook_line + ' | ' + fomoVariants[1].value_proposition,
        target_niche: niche,
        status: 'draft',
        target_conversion_rate: target_conversion_rate,
        current_conversion_rate: current_conversion_rate / 100
      })
      .select()
      .single();

    if (abTestError) {
      console.error('Error creating A/B test:', abTestError);
      throw abTestError;
    }

    // Log optimization action
    await supabase.from('conversion_optimization_audit').insert({
      action_type: 'messaging_optimization_generated',
      test_id: abTestData.id,
      details: {
        niche,
        current_conversion_rate,
        target_conversion_rate,
        variants_generated: fomoVariants.length,
        optimization_prompt: optimizationPrompt.substring(0, 500) + '...'
      }
    });

    const response = {
      success: true,
      optimization_id: crypto.randomUUID(),
      test_id: abTestData.id,
      niche,
      current_conversion_rate: `${current_conversion_rate}%`,
      target_conversion_rate: `${target_conversion_rate * 100}%`,
      improvement_needed: `${((target_conversion_rate * 100) - current_conversion_rate).toFixed(1)}%`,
      variants_generated: fomoVariants.length,
      variants: fomoVariants,
      next_steps: [
        'Deploy A/B test with generated variants',
        'Track conversion rates for 7-14 days',
        'Identify winning variant',
        'Scale winning messaging across all touchpoints',
        'Generate additional variants for continuous optimization'
      ],
      expected_results: {
        conversion_improvement: '10-20%',
        target_rate: '6-8%',
        testing_duration: '7-14 days',
        statistical_significance: '95% confidence level'
      }
    };

    console.log(`✅ Generated ${fomoVariants.length} FOMO variants for ${niche}`);
    console.log(`📊 Target conversion rate: ${target_conversion_rate * 100}%`);
    console.log(`🎯 A/B test created: ${abTestData.id}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('💥 Messaging optimization error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Messaging optimization failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
