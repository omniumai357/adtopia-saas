import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface TAMRequest {
  niche: string;
  target_revenue: number;
  geo: string;
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
    const { niche, target_revenue, geo } = await req.json() as TAMRequest;
    
    // Enhanced TAM Research Prompt for 2025 SMB Focus
    const tamPrompt = `
    MISSION: Conduct comprehensive market research for AdTopia targeting ${niche} SMB providers

    CONTEXT:
    - Target Revenue: $${target_revenue.toLocaleString()}
    - Geography: ${geo}
    - Platform: AdTopia (AI-generated QR ads with 3.6x ROI tracking)
    - Customer Profile: Cash-strapped service providers seeking 220% lead boost

    ANALYSIS REQUIREMENTS:
    1. TAM Size: Total addressable market for ${niche} in ${geo}
    2. Market Value: Annual spend on digital marketing/advertising
    3. Growth Rate: Year-over-year market expansion
    4. Digital Adoption: % of ${niche} businesses using online marketing
    5. Competition Landscape: Key players and market gaps
    6. Pain Points: Top 3 marketing challenges for ${niche} SMBs
    7. Budget Allocation: Typical monthly marketing spend ranges
    8. Decision Makers: Who authorizes marketing tool purchases

    OPPORTUNITY SCORING (1-10):
    - Market Size: Large TAM (8-10), Medium TAM (5-7), Small TAM (1-4)
    - Digital Readiness: High adoption (8-10), Growing (5-7), Traditional (1-4)
    - Competition Gap: Underserved (8-10), Competitive (5-7), Saturated (1-4)
    - Revenue Potential: High LTV (8-10), Medium LTV (5-7), Low LTV (1-4)

    2025 TRENDS TO CONSIDER:
    - Multilingual marketing (32 language capability)
    - Mobile-first customer behavior
    - QR code adoption post-COVID
    - AI automation acceptance
    - ROI measurement demands

    OUTPUT FORMAT:
    {
      "tam_size_usd": number,
      "annual_growth_rate": number,
      "digital_adoption_percent": number,
      "avg_monthly_budget": number,
      "opportunity_score": number,
      "key_pain_points": string[],
      "sub_niches": string[],
      "recommended_pricing": {
        "starter": number,
        "growth": number,
        "pro": number
      }
    }
    `;

    // Store research request
    const { data, error } = await supabase
      .from("market_research")
      .insert({
        niche,
        target_revenue,
        geo,
        research_prompt: tamPrompt,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trail
    await supabase.from("admin_audit_log").insert({
      action: "gtmm_tam_research_initiated",
      details: { niche, target_revenue, geo, research_id: data.id },
      user_id: null, // System action
      created_at: new Date().toISOString()
    });

    // Log to GTMM audit trail
    await supabase.from("gtmm_audit_log").insert({
      operation_type: "tam_research_initiated",
      table_name: "market_research",
      record_id: data.id,
      operation_data: { niche, target_revenue, geo },
      user_id: null,
      created_at: new Date().toISOString()
    });

    console.log(`🎯 TAM Research initiated for ${niche} in ${geo} - Target: $${target_revenue.toLocaleString()}`);

    return new Response(JSON.stringify({
      success: true,
      research_id: data.id,
      niche,
      status: "TAM research initiated",
      next_action: "Execute with AI API for market analysis",
      estimated_completion: "10-15 minutes",
      prompt: tamPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("TAM Mapper Error:", error);
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
