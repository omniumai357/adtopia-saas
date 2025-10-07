import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface KeywordRequest {
  sourcing_id: string;
  niche: string;
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
    const { sourcing_id, niche } = await req.json() as KeywordRequest;
    
    // Get account sourcing data
    const { data: sourcingData, error: sourcingError } = await supabase
      .from("account_sourcing")
      .select(`
        *,
        icp_validation (
          personas,
          conversion_scores,
          market_research (
            niche,
            geo,
            target_revenue
          )
        )
      `)
      .eq("id", sourcing_id)
      .single();

    if (sourcingError || !sourcingData) {
      throw new Error(`Account sourcing not found: ${sourcing_id}`);
    }

    const icpData = sourcingData.icp_validation;
    const marketData = icpData.market_research;

    // Enhanced Keyword Optimization Prompt
    const keywordPrompt = `
    MISSION: Optimize keywords for AdTopia targeting ${niche} SMB providers for maximum conversion

    CONTEXT:
    - Niche: ${niche}
    - Geography: ${marketData.geo}
    - Target Revenue: $${marketData.target_revenue.toLocaleString()}
    - ICP Personas: ${JSON.stringify(icpData.personas || {})}
    - Account Data: ${JSON.stringify(sourcingData.accounts || {})}

    KEYWORD OPTIMIZATION REQUIREMENTS:
    1. Primary Keywords: High-intent terms for ${niche} marketing solutions
    2. Long-tail Keywords: Specific phrases for AdTopia's unique value props
    3. Competitor Keywords: Terms used by competing solutions
    4. Pain Point Keywords: Search terms for marketing challenges
    5. Solution Keywords: Terms for QR code, digital ads, lead generation
    6. Local Keywords: Geo-targeted terms for ${marketData.geo}
    7. Industry Keywords: ${niche}-specific terminology and jargon
    8. Buyer Intent Keywords: Terms indicating purchase readiness

    KEYWORD CATEGORIES:
    - Problem Awareness: "marketing problems", "lead generation issues"
    - Solution Research: "QR code marketing", "digital advertising tools"
    - Vendor Comparison: "marketing software", "advertising platforms"
    - Purchase Intent: "marketing tool pricing", "advertising ROI calculator"

    CONVERSION POTENTIAL SCORING (1-10):
    - High Intent (8-10): "buy", "pricing", "ROI", "comparison"
    - Medium Intent (5-7): "best", "review", "how to", "guide"
    - Low Intent (1-4): "what is", "definition", "examples"

    COMPETITION ANALYSIS:
    - Low Competition (8-10): Underserved, specific niches
    - Medium Competition (5-7): Competitive but manageable
    - High Competition (1-4): Saturated, dominated by big players

    OUTPUT FORMAT:
    {
      "primary_keywords": [
        {
          "keyword": string,
          "search_volume": number,
          "competition_score": number,
          "conversion_potential": number,
          "category": string,
          "intent_level": string,
          "adtopia_relevance": number
        }
      ],
      "long_tail_keywords": [
        {
          "keyword": string,
          "search_volume": number,
          "competition_score": number,
          "conversion_potential": number,
          "specificity": string
        }
      ],
      "local_keywords": [
        {
          "keyword": string,
          "search_volume": number,
          "geo_relevance": number,
          "local_competition": number
        }
      ],
      "content_opportunities": [
        {
          "topic": string,
          "keyword_focus": string,
          "content_type": string,
          "conversion_potential": number
        }
      ],
      "seo_strategy": {
        "primary_focus": string[],
        "content_pillars": string[],
        "conversion_funnel": string[],
        "estimated_traffic": number
      }
    }
    `;

    // Store keyword optimization request
    const { data, error } = await supabase
      .from("keyword_optimization")
      .insert({
        sourcing_id,
        niche,
        keywords: {}, // Will be populated by AI execution
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trails
    await supabase.from("admin_audit_log").insert({
      action: "gtmm_keyword_optimization_initiated",
      details: { sourcing_id, niche, keyword_id: data.id },
      user_id: null,
      created_at: new Date().toISOString()
    });

    await supabase.from("gtmm_audit_log").insert({
      operation_type: "keyword_optimization_initiated",
      table_name: "keyword_optimization",
      record_id: data.id,
      operation_data: { sourcing_id, niche },
      user_id: null,
      created_at: new Date().toISOString()
    });

    console.log(`🎯 Keyword Optimization initiated for ${niche} - Sourcing ID: ${sourcing_id}`);

    return new Response(JSON.stringify({
      success: true,
      keyword_id: data.id,
      sourcing_id,
      niche,
      status: "Keyword optimization initiated",
      next_action: "Execute with AI API for keyword research",
      estimated_completion: "15-20 minutes",
      prompt: keywordPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Keyword Optimizer Error:", error);
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
