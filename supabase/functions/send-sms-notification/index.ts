import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface SMSRequest {
  phone_number: string;
  message: string;
  brand: 'adtopia' | 'bizbox';
  template_type?: 'purchase_confirmation' | 'password_reset' | 'beta_invitation' | 'custom';
  customer_name?: string;
  purchase_id?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      phone_number,
      message,
      brand,
      template_type = 'custom',
      customer_name,
      purchase_id
    } = await req.json() as SMSRequest;

    // Get the appropriate Twilio key based on brand
    const twilioKey = brand === 'adtopia' 
      ? Deno.env.get("TWILIO_ADTOPIA_IO_KEY")
      : Deno.env.get("TWILIO_BIZBOX_HOST_KEY");

    if (!twilioKey) {
      throw new Error(`Twilio key not found for brand: ${brand}`);
    }

    // Parse the Twilio key (assuming it contains Account SID, Auth Token, and From Number)
    const twilioConfig = JSON.parse(twilioKey);
    const { account_sid, auth_token, from_number } = twilioConfig;

    // Format phone number (ensure it starts with +1 for US numbers)
    const formattedPhone = phone_number.startsWith('+') 
      ? phone_number 
      : `+1${phone_number.replace(/\D/g, '')}`;

    // Create Twilio client
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;
    
    // Prepare message based on template type
    let finalMessage = message;
    if (template_type === 'purchase_confirmation' && customer_name) {
      finalMessage = `Hi ${customer_name}! Your AdTopia purchase is confirmed. Preview: ${purchase_id || 'Ready'}. Reply STOP to opt out.`;
    } else if (template_type === 'password_reset') {
      finalMessage = `AdTopia password reset requested. If you didn't request this, ignore this message. Reply STOP to opt out.`;
    } else if (template_type === 'beta_invitation') {
      finalMessage = `Welcome to BizBox Beta! Your QR preview is ready. Check your email for details. Reply STOP to opt out.`;
    }

    // Send SMS via Twilio
    const formData = new FormData();
    formData.append('To', formattedPhone);
    formData.append('From', from_number);
    formData.append('Body', finalMessage);

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
      action: "sms_notification_sent",
      details: {
        phone_number: formattedPhone,
        brand,
        template_type,
        message: finalMessage,
        twilio_sid: twilioResult.sid,
        status: twilioResult.status
      },
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message_sid: twilioResult.sid,
      status: twilioResult.status,
      to: formattedPhone,
      from: from_number,
      body: finalMessage,
      brand,
      template_type,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("SMS sending error:", error);
    
    // Log error
    await supabase.from("admin_audit_log").insert({
      action: "sms_notification_error",
      details: {
        error: error.message,
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
