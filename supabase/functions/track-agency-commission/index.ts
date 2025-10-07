import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface CommissionTrackingRequest {
  agency_id: string;
  customer_id: string;
  sale_amount: number;
  product_tier: string;
  sale_source?: string;
  stripe_payment_intent_id?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      agency_id,
      customer_id,
      sale_amount,
      product_tier,
      sale_source = "direct",
      stripe_payment_intent_id
    } = await req.json() as CommissionTrackingRequest;

    // Get agency details
    const { data: agency, error: agencyError } = await supabase
      .from("agency_partners")
      .select("tier, commission_rate, agency_name")
      .eq("id", agency_id)
      .single();

    if (agencyError) throw agencyError;

    // Calculate commission
    const commission_earned = sale_amount * agency.commission_rate;

    // Create commission record
    const { data: commission, error: commissionError } = await supabase
      .from("agency_sales")
      .insert({
        agency_id,
        customer_id,
        sale_amount,
        commission_earned,
        product_tier,
        sale_source,
        stripe_payment_intent_id
      })
      .select()
      .single();

    if (commissionError) throw commissionError;

    // Log commission tracking
    await supabase.from("admin_audit_log").insert({
      action: "agency_commission_tracked",
      details: {
        agency_id,
        agency_name: agency.agency_name,
        customer_id,
        sale_amount,
        commission_earned,
        commission_rate: agency.commission_rate,
        tier: agency.tier
      },
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      commission_id: commission.id,
      agency_name: agency.agency_name,
      tier: agency.tier,
      sale_amount,
      commission_earned,
      commission_rate: agency.commission_rate,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Commission tracking error:", error);
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