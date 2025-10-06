// Security Monitoring Edge Function
// Based on BizBox migration security analysis
// Monitors and logs security events

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityEvent {
  event_type: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { event_type, user_email, ip_address, user_agent, metadata }: SecurityEvent = await req.json();

    // Validate required fields
    if (!event_type) {
      return new Response(
        JSON.stringify({ error: "event_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log security event to database
    const { error } = await supabase.rpc("log_security_event", {
      event_type,
      user_email,
      ip_address,
      user_agent,
      metadata: metadata || {}
    });

    if (error) {
      console.error("Failed to log security event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log security event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send alert to Slack if critical event
    if (isCriticalEvent(event_type)) {
      await sendSlackAlert(event_type, user_email, metadata);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Security event logged" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Security monitor error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function isCriticalEvent(eventType: string): boolean {
  const criticalEvents = [
    "failed_login_attempt",
    "suspicious_activity",
    "admin_access_denied",
    "data_breach_attempt",
    "rate_limit_exceeded"
  ];
  return criticalEvents.includes(eventType);
}

async function sendSlackAlert(eventType: string, userEmail?: string, metadata?: Record<string, any>): Promise<void> {
  const webhookUrl = Deno.env.get("SECURITY_WEBHOOK_URL");
  if (!webhookUrl) {
    console.log("No Slack webhook URL configured");
    return;
  }

  const message = {
    text: `🚨 Security Alert: ${eventType}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Security Event Detected*\n*Type:* ${eventType}\n*User:* ${userEmail || 'Unknown'}\n*Time:* ${new Date().toISOString()}`
        }
      }
    ]
  };

  if (metadata && Object.keys(metadata).length > 0) {
    message.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Additional Details:*\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``
      }
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error("Failed to send Slack alert:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending Slack alert:", error);
  }
}
