import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface ICPRequest {
  tam_research_id: string;
  target_accounts?: number;
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
    const { tam_research_id, target_accounts = 50 } = await req.json() as ICPRequest;
    
    // Get TAM research data
    const { data: tamData, error: tamError } = await supabase
      .from("market_research")
      .select("*")
      .eq("id", tam_research_id)
      .single();

    if (tamError || !tamData) {
      throw new Error(`TAM research not found: ${tam_research_id}`);
    }

    // Enhanced ICP Validation Prompt
    const icpPrompt = `
    MISSION: Validate Ideal Customer Profile for AdTopia targeting ${tamData.niche} SMB providers

    TAM CONTEXT:
    - Niche: ${tamData.niche}
    - Geography: ${tamData.geo}
    - Target Revenue: $${tamData.target_revenue.toLocaleString()}
    - TAM Data: ${JSON.stringify(tamData.tam_data || {})}

    ICP VALIDATION REQUIREMENTS:
    1. Company Size: Employee count ranges for optimal AdTopia fit
    2. Revenue Range: Annual revenue brackets for decision-making authority
    3. Digital Maturity: Current marketing tool usage and sophistication
    4. Pain Points: Specific challenges AdTopia solves for ${tamData.niche}
    5. Decision Makers: Job titles and roles involved in marketing tool purchases
    6. Budget Authority: Who controls marketing spend and typical ranges
    7. Buying Process: How marketing tools are evaluated and purchased
    8. Success Metrics: What ROI/KPI improvements they seek

    PERSONA SCORING (1-10):
    - Budget Fit: Can afford $29-$297/month (8-10), Limited budget (5-7), No budget (1-4)
    - Digital Readiness: Advanced tools (8-10), Basic tools (5-7), Traditional only (1-4)
    - Decision Speed: Fast adopters (8-10), Moderate (5-7), Slow/committee (1-4)
    - Growth Stage: Scaling rapidly (8-10), Steady growth (5-7), Stable/declining (1-4)

    CONVERSION PREDICTION:
    - High Probability (8-10): Perfect fit, urgent need, budget available
    - Medium Probability (5-7): Good fit, some barriers, needs nurturing
    - Low Probability (1-4): Poor fit, no budget, wrong stage

    OUTPUT FORMAT:
    {
      "primary_personas": [
        {
          "title": string,
          "company_size": string,
          "revenue_range": string,
          "pain_points": string[],
          "budget_authority": string,
          "conversion_score": number,
          "estimated_ltv": number
        }
      ],
      "target_accounts": number,
      "conversion_rates": {
        "high_probability": number,
        "medium_probability": number,
        "low_probability": number
      },
      "recommended_messaging": {
        "value_prop": string,
        "pain_point_focus": string,
        "roi_emphasis": string
      }
    }
    `;

    // Store ICP validation request
    const { data, error } = await supabase
      .from("icp_validation")
      .insert({
        tam_research_id,
        target_accounts,
        validation_prompt: icpPrompt,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trails
    await supabase.from("admin_audit_log").insert({
      action: "gtmm_icp_validation_initiated",
      details: { tam_research_id, target_accounts, icp_id: data.id },
      user_id: null,
      created_at: new Date().toISOString()
    });

    await supabase.from("gtmm_audit_log").insert({
      operation_type: "icp_validation_initiated",
      table_name: "icp_validation",
      record_id: data.id,
      operation_data: { tam_research_id, target_accounts },
      user_id: null,
      created_at: new Date().toISOString()
    });

    console.log(`🎯 ICP Validation initiated for TAM research ${tam_research_id} - Target: ${target_accounts} accounts`);

    return new Response(JSON.stringify({
      success: true,
      icp_id: data.id,
      tam_research_id,
      target_accounts,
      status: "ICP validation initiated",
      next_action: "Execute with AI API for persona analysis",
      estimated_completion: "15-20 minutes",
      prompt: icpPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("ICP Validator Error:", error);
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
