import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface AgencyOnboardingRequest {
  agency_name: string;
  contact_email: string;
  expected_monthly_sales: number;
  target_niches: string[];
  company_size?: string;
  website?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      agency_name,
      contact_email,
      expected_monthly_sales,
      target_niches,
      company_size = "small",
      website
    } = await req.json() as AgencyOnboardingRequest;

    // Determine tier and commission based on expected sales
    let tier = 'BRONZE';
    let commission_rate = 0.1500;
    let monthly_quota = 10;

    if (expected_monthly_sales >= 100) {
      tier = 'PLATINUM';
      commission_rate = 0.3500;
      monthly_quota = 100;
    } else if (expected_monthly_sales >= 50) {
      tier = 'GOLD';
      commission_rate = 0.3000;
      monthly_quota = 50;
    } else if (expected_monthly_sales >= 20) {
      tier = 'SILVER';
      commission_rate = 0.2500;
      monthly_quota = 20;
    }

    // Configure white-label settings based on tier
    const white_label_settings = {
      custom_branding: true,
      custom_domain: tier !== 'BRONZE',
      priority_support: tier === 'PLATINUM',
      dedicated_account_manager: tier === 'PLATINUM',
      target_niches,
      company_size,
      website,
      api_access_level: tier === 'PLATINUM' ? 'full' : tier === 'GOLD' ? 'standard' : 'basic'
    };

    // Create agency partner
    const { data: agency, error: agencyError } = await supabase
      .from("agency_partners")
      .insert({
        agency_name,
        contact_email,
        tier,
        commission_rate,
        monthly_quota,
        white_label_settings,
        status: 'pending' // Requires admin approval
      })
      .select()
      .single();

    if (agencyError) throw agencyError;

    // Log onboarding request
    await supabase.from("admin_audit_log").insert({
      action: "agency_onboarding_request",
      details: {
        agency_id: agency.id,
        agency_name,
        tier,
        expected_monthly_sales,
        commission_rate
      },
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      agency_id: agency.id,
      tier,
      commission_rate,
      monthly_quota,
      white_label_settings,
      api_key: agency.api_key,
      status: "pending_approval",
      next_steps: [
        "Admin review and approval required",
        "Setup white-label branding",
        "Access partner dashboard",
        "Begin sales activities"
      ]
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Agency onboarding error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});