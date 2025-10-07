import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface MessagingRequest {
  keyword_id: string;
  variant_name?: string;
  target_persona?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { keyword_id, variant_name = "Primary", target_persona } = await req.json() as MessagingRequest;
    
    // Get keyword optimization data
    const { data: keywordData, error: keywordError } = await supabase
      .from("keyword_optimization")
      .select(`
        *,
        account_sourcing (
          accounts,
          icp_validation (
            personas,
            conversion_scores,
            market_research (
              niche,
              geo,
              target_revenue
            )
          )
        )
      `)
      .eq("id", keyword_id)
      .single();

    if (keywordError || !keywordData) {
      throw new Error(`Keyword optimization not found: ${keyword_id}`);
    }

    const sourcingData = keywordData.account_sourcing;
    const icpData = sourcingData.icp_validation;
    const marketData = icpData.market_research;

    // Enhanced Messaging Optimization Prompt
    const messagingPrompt = `
    MISSION: Create high-converting messaging variants for AdTopia targeting ${marketData.niche} SMB providers

    CONTEXT:
    - Niche: ${marketData.niche}
    - Geography: ${marketData.geo}
    - Target Revenue: $${marketData.target_revenue.toLocaleString()}
    - Keywords: ${JSON.stringify(keywordData.keywords || {})}
    - ICP Personas: ${JSON.stringify(icpData.personas || {})}
    - Target Accounts: ${JSON.stringify(sourcingData.accounts || {})}

    MESSAGING OPTIMIZATION REQUIREMENTS:
    1. Value Proposition: Clear, compelling AdTopia benefits for ${marketData.niche}
    2. Pain Point Focus: Address specific marketing challenges
    3. ROI Emphasis: Quantifiable results and cost savings
    4. Social Proof: Credibility indicators and success metrics
    5. Urgency Creation: Scarcity and time-sensitive offers
    6. Call-to-Action: Clear next steps and conversion paths
    7. Personalization: Tailored messaging for different personas
    8. A/B Testing: Multiple variants for optimization

    MESSAGING FRAMEWORKS:
    - Problem-Agitate-Solution: Highlight pain, amplify consequences, present AdTopia
    - Before-After-Bridge: Current state, desired state, AdTopia as bridge
    - Feature-Benefit-Value: AdTopia features, business benefits, monetary value
    - Story-Driven: Customer success stories and case studies

    CONVERSION PSYCHOLOGY:
    - Authority: Industry expertise and proven results
    - Scarcity: Limited-time offers and exclusive access
    - Social Proof: Customer testimonials and usage statistics
    - Reciprocity: Free value before asking for commitment
    - Commitment: Small yeses leading to larger commitments

    OUTPUT FORMAT:
    {
      "messaging_variants": [
        {
          "variant_name": string,
          "headline": string,
          "subheadline": string,
          "value_proposition": string,
          "pain_points": string[],
          "benefits": string[],
          "social_proof": string[],
          "call_to_action": string,
          "urgency_elements": string[],
          "target_persona": string,
          "conversion_potential": number,
          "testing_priority": string
        }
      ],
      "email_templates": [
        {
          "subject_line": string,
          "preheader": string,
          "body": string,
          "cta_button": string,
          "personalization_tokens": string[]
        }
      ],
      "ad_copy": [
        {
          "platform": string,
          "headline": string,
          "description": string,
          "cta": string,
          "targeting_criteria": string[]
        }
      ],
      "landing_page_copy": {
        "hero_headline": string,
        "hero_subheadline": string,
        "benefits_section": string[],
        "testimonials": string[],
        "pricing_justification": string,
        "final_cta": string
      },
      "conversion_optimization": {
        "primary_funnel": string[],
        "ab_test_variants": string[],
        "success_metrics": string[],
        "optimization_priorities": string[]
      }
    }
    `;

    // Store messaging optimization request
    const { data, error } = await supabase
      .from("messaging_variants")
      .insert({
        keyword_id,
        variant_name,
        message_content: messagingPrompt,
        target_persona: target_persona || "Primary Decision Maker",
        test_status: "draft"
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trails
    await supabase.from("admin_audit_log").insert({
      action: "gtmm_messaging_optimization_initiated",
      details: { keyword_id, variant_name, target_persona, messaging_id: data.id },
      user_id: null,
      created_at: new Date().toISOString()
    });

    await supabase.from("gtmm_audit_log").insert({
      operation_type: "messaging_optimization_initiated",
      table_name: "messaging_variants",
      record_id: data.id,
      operation_data: { keyword_id, variant_name, target_persona },
      user_id: null,
      created_at: new Date().toISOString()
    });

    console.log(`🎯 Messaging Optimization initiated for ${variant_name} variant - Keyword ID: ${keyword_id}`);

    return new Response(JSON.stringify({
      success: true,
      messaging_id: data.id,
      keyword_id,
      variant_name,
      target_persona,
      status: "Messaging optimization initiated",
      next_action: "Execute with AI API for copy generation",
      estimated_completion: "10-15 minutes",
      prompt: messagingPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Messaging Optimizer Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
