import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface SourcingRequest {
  icp_id: string;
  target_count?: number;
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
    const { icp_id, target_count = 50 } = await req.json() as SourcingRequest;
    
    // Get ICP validation data
    const { data: icpData, error: icpError } = await supabase
      .from("icp_validation")
      .select(`
        *,
        market_research (
          niche,
          geo,
          target_revenue,
          tam_data
        )
      `)
      .eq("id", icp_id)
      .single();

    if (icpError || !icpData) {
      throw new Error(`ICP validation not found: ${icp_id}`);
    }

    const marketData = icpData.market_research;

    // Enhanced Account Sourcing Prompt
    const sourcingPrompt = `
    MISSION: Source ${target_count} high-quality target accounts for AdTopia based on validated ICP

    ICP CONTEXT:
    - Niche: ${marketData.niche}
    - Geography: ${marketData.geo}
    - Target Revenue: $${marketData.target_revenue.toLocaleString()}
    - ICP Data: ${JSON.stringify(icpData.personas || {})}
    - Conversion Scores: ${JSON.stringify(icpData.conversion_scores || {})}

    ACCOUNT SOURCING REQUIREMENTS:
    1. Company Identification: Real businesses matching ICP criteria
    2. Contact Information: Decision maker names, titles, emails
    3. Company Details: Size, revenue, industry, location
    4. Digital Presence: Website, social media, marketing activity
    5. Lead Scoring: Probability of conversion (1-10)
    6. Qualification Status: Ready to buy, needs nurturing, not qualified
    7. Contact Method: Best approach (email, LinkedIn, phone, etc.)
    8. Timing: When to reach out based on business cycle

    SOURCING CRITERIA:
    - Company Size: ${icpData.personas?.company_size || '10-500 employees'}
    - Revenue Range: ${icpData.personas?.revenue_range || '$1M-$50M annual'}
    - Industry: ${marketData.niche} and related sub-niches
    - Geography: ${marketData.geo} with focus on major metro areas
    - Digital Maturity: Active online presence, marketing tools usage
    - Growth Stage: Expanding, scaling, or seeking efficiency gains

    LEAD SCORING MATRIX:
    - High Priority (8-10): Perfect ICP fit, urgent need, budget available
    - Medium Priority (5-7): Good fit, some barriers, needs education
    - Low Priority (1-4): Partial fit, long sales cycle, budget constraints

    OUTPUT FORMAT:
    {
      "accounts": [
        {
          "company_name": string,
          "website": string,
          "industry": string,
          "company_size": string,
          "revenue_range": string,
          "location": string,
          "decision_makers": [
            {
              "name": string,
              "title": string,
              "email": string,
              "linkedin": string,
              "phone": string
            }
          ],
          "lead_score": number,
          "qualification_status": string,
          "contact_method": string,
          "timing": string,
          "pain_points": string[],
          "adtopia_fit": string
        }
      ],
      "sourcing_summary": {
        "total_found": number,
        "high_priority": number,
        "medium_priority": number,
        "low_priority": number,
        "avg_lead_score": number
      }
    }
    `;

    // Store account sourcing request
    const { data, error } = await supabase
      .from("account_sourcing")
      .insert({
        icp_id,
        target_count,
        sourcing_prompt: sourcingPrompt,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trails
    await supabase.from("admin_audit_log").insert({
      action: "gtmm_account_sourcing_initiated",
      details: { icp_id, target_count, sourcing_id: data.id },
      user_id: null,
      created_at: new Date().toISOString()
    });

    await supabase.from("gtmm_audit_log").insert({
      operation_type: "account_sourcing_initiated",
      table_name: "account_sourcing",
      record_id: data.id,
      operation_data: { icp_id, target_count },
      user_id: null,
      created_at: new Date().toISOString()
    });

    console.log(`🎯 Account Sourcing initiated for ICP ${icp_id} - Target: ${target_count} accounts`);

    return new Response(JSON.stringify({
      success: true,
      sourcing_id: data.id,
      icp_id,
      target_count,
      status: "Account sourcing initiated",
      next_action: "Execute with AI API for account discovery",
      estimated_completion: "20-30 minutes",
      prompt: sourcingPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Account Sourcer Error:", error);
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
