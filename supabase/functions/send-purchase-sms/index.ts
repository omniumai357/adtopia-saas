import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface PurchaseSMSRequest {
  customer_email: string;
  purchase_id: string;
  product_name: string;
  amount: number;
  brand: 'adtopia' | 'bizbox';
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      customer_email,
      purchase_id,
      product_name,
      amount,
      brand
    } = await req.json() as PurchaseSMSRequest;

    // Get customer phone number from database
    const { data: customer, error: customerError } = await supabase
      .from("user_access")
      .select("phone_number, full_name")
      .eq("email", customer_email)
      .single();

    if (customerError || !customer?.phone_number) {
      return new Response(JSON.stringify({
        success: false,
        error: "Customer phone number not found",
        message: "SMS not sent - no phone number on file"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the appropriate Twilio key based on brand
    const twilioKey = brand === 'adtopia' 
      ? Deno.env.get("TWILIO_ADTOPIA_IO_KEY")
      : Deno.env.get("TWILIO_BIZBOX_HOST_KEY");

    if (!twilioKey) {
      throw new Error(`Twilio key not found for brand: ${brand}`);
    }

    // Parse the Twilio key
    const twilioConfig = JSON.parse(twilioKey);
    const { account_sid, auth_token, from_number } = twilioConfig;

    // Format phone number
    const formattedPhone = customer.phone_number.startsWith('+') 
      ? customer.phone_number 
      : `+1${customer.phone_number.replace(/\D/g, '')}`;

    // Create personalized message
    const customerName = customer.full_name || 'Valued Customer';
    const brandName = brand === 'adtopia' ? 'AdTopia' : 'BizBox Beta';
    const message = `Hi ${customerName}! Your ${brandName} purchase ($${amount}) is confirmed. ${product_name} preview ready! Check your email. Reply STOP to opt out.`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;
    const formData = new FormData();
    formData.append('To', formattedPhone);
    formData.append('From', from_number);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${account_sid}:${auth_token}`)}`,
      },
      body: formData,
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${twilioResult.message || 'Unknown error'}`);
    }

    // Log SMS sending
    await supabase.from("admin_audit_log").insert({
      action: "purchase_sms_sent",
      details: {
        customer_email,
        purchase_id,
        phone_number: formattedPhone,
        brand,
        product_name,
        amount,
        twilio_sid: twilioResult.sid,
        status: twilioResult.status
      },
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message_sid: twilioResult.sid,
      status: twilioResult.status,
      customer_name: customerName,
      phone_number: formattedPhone,
      message,
      brand,
      purchase_id,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Purchase SMS error:", error);
    
    // Log error
    await supabase.from("admin_audit_log").insert({
      action: "purchase_sms_error",
      details: {
        error: error.message,
        customer_email: req.body?.customer_email,
        purchase_id: req.body?.purchase_id,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });

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
