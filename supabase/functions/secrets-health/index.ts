import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check all required secrets
    const secrets = {
      SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_ANON_KEY: !!Deno.env.get('SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      STRIPE_SECRET_KEY: !!Deno.env.get('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      RESEND_API_KEY: !!Deno.env.get('RESEND_API_KEY'),
      GAMMA_API_KEY: !!Deno.env.get('GAMMA_API_KEY'),
      OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
      TWILIO_ADTOPIA_IO_KEY: !!Deno.env.get('TWILIO_ADTOPIA_IO_KEY'),
      TWILIO_BIZBOX_HOST_KEY: !!Deno.env.get('TWILIO_BIZBOX_HOST_KEY'),
    }

    // Count secrets present
    const totalSecrets = Object.keys(secrets).length
    const presentSecrets = Object.values(secrets).filter(Boolean).length
    const healthScore = Math.round((presentSecrets / totalSecrets) * 100)

    // Test Stripe connection if key is present
    let stripeTest = { status: 'not_tested', error: null }
    if (secrets.STRIPE_SECRET_KEY) {
      try {
        const stripeResponse = await fetch('https://api.stripe.com/v1/products?limit=1', {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        stripeTest = {
          status: stripeResponse.ok ? 'success' : 'failed',
          error: stripeResponse.ok ? null : `HTTP ${stripeResponse.status}`
        }
      } catch (error) {
        stripeTest = { status: 'error', error: error.message }
      }
    }

    // Test Resend connection if key is present
    let resendTest = { status: 'not_tested', error: null }
    if (secrets.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/domains', {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
        })
        resendTest = {
          status: resendResponse.ok ? 'success' : 'failed',
          error: resendResponse.ok ? null : `HTTP ${resendResponse.status}`
        }
      } catch (error) {
        resendTest = { status: 'error', error: error.message }
      }
    }

    const healthReport = {
      timestamp: new Date().toISOString(),
      health_score: healthScore,
      secrets_present: presentSecrets,
      secrets_total: totalSecrets,
      secrets: secrets,
      connection_tests: {
        stripe: stripeTest,
        resend: resendTest,
      },
      status: healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : healthScore >= 50 ? 'warning' : 'critical'
    }

    return new Response(
      JSON.stringify(healthReport, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: healthScore >= 70 ? 200 : 500,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
