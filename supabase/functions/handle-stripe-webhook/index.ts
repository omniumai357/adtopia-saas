// Supabase Edge Function: handle-stripe-webhook
// Description: Stripe webhook handler for payment confirmation
// Triggers: Stripe webhook → Update payment status → Unlock Gamma page

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_status: string;
      metadata: {
        gamma_prompt_id?: string;
        gamma_generated_id?: string;
        business_name?: string;
        service?: string;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Stripe signature for webhook verification
    const stripeSignature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Verify webhook signature (implement actual Stripe webhook verification)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    // Parse webhook event
    const event: StripeWebhookEvent = JSON.parse(body)
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event, supabaseClient)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event, supabaseClient)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event, supabaseClient)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook handling failed', 
        details: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Handle successful checkout session
async function handleCheckoutSessionCompleted(event: StripeWebhookEvent, supabaseClient: any) {
  const session = event.data.object
  const metadata = session.metadata
  
  if (!metadata.gamma_prompt_id) {
    console.log('No gamma_prompt_id in metadata, skipping')
    return
  }

  // Update gamma_sales status
  const { error: updateError } = await supabaseClient
    .from('gamma_sales')
    .update({
      status: true,
      payment_status: 'COMPLETED'
    })
    .eq('stripe_payment_intent_id', session.id)

  if (updateError) {
    console.error('Error updating gamma_sales:', updateError)
    return
  }

  // Log successful payment
  await supabaseClient
    .from('admin_audit_log')
    .insert({
      action: 'stripe_payment_completed',
      details: {
        stripe_session_id: session.id,
        gamma_prompt_id: metadata.gamma_prompt_id,
        gamma_generated_id: metadata.gamma_generated_id,
        business_name: metadata.business_name,
        service: metadata.service,
        payment_status: 'COMPLETED'
      }
    })

  // Send confirmation email (implement email service integration)
  await sendPaymentConfirmationEmail({
    customer_email: session.customer_email,
    business_name: metadata.business_name,
    gamma_prompt_id: metadata.gamma_prompt_id,
    gamma_generated_id: metadata.gamma_generated_id
  })

  console.log(`Payment completed for gamma_prompt_id: ${metadata.gamma_prompt_id}`)
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(event: StripeWebhookEvent, supabaseClient: any) {
  const paymentIntent = event.data.object
  const metadata = paymentIntent.metadata
  
  if (!metadata.gamma_prompt_id) {
    console.log('No gamma_prompt_id in metadata, skipping')
    return
  }

  // Update gamma_sales status
  const { error: updateError } = await supabaseClient
    .from('gamma_sales')
    .update({
      status: true,
      payment_status: 'COMPLETED'
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (updateError) {
    console.error('Error updating gamma_sales:', updateError)
    return
  }

  // Log successful payment
  await supabaseClient
    .from('admin_audit_log')
    .insert({
      action: 'stripe_payment_intent_succeeded',
      details: {
        stripe_payment_intent_id: paymentIntent.id,
        gamma_prompt_id: metadata.gamma_prompt_id,
        gamma_generated_id: metadata.gamma_generated_id,
        business_name: metadata.business_name,
        service: metadata.service,
        payment_status: 'COMPLETED'
      }
    })

  console.log(`Payment intent succeeded for gamma_prompt_id: ${metadata.gamma_prompt_id}`)
}

// Handle failed payment intent
async function handlePaymentIntentFailed(event: StripeWebhookEvent, supabaseClient: any) {
  const paymentIntent = event.data.object
  const metadata = paymentIntent.metadata
  
  if (!metadata.gamma_prompt_id) {
    console.log('No gamma_prompt_id in metadata, skipping')
    return
  }

  // Update gamma_sales status
  const { error: updateError } = await supabaseClient
    .from('gamma_sales')
    .update({
      status: false,
      payment_status: 'FAILED'
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (updateError) {
    console.error('Error updating gamma_sales:', updateError)
    return
  }

  // Log failed payment
  await supabaseClient
    .from('admin_audit_log')
    .insert({
      action: 'stripe_payment_intent_failed',
      details: {
        stripe_payment_intent_id: paymentIntent.id,
        gamma_prompt_id: metadata.gamma_prompt_id,
        gamma_generated_id: metadata.gamma_generated_id,
        business_name: metadata.business_name,
        service: metadata.service,
        payment_status: 'FAILED',
        failure_reason: paymentIntent.last_payment_error?.message
      }
    })

  console.log(`Payment intent failed for gamma_prompt_id: ${metadata.gamma_prompt_id}`)
}

// Send payment confirmation email
async function sendPaymentConfirmationEmail(params: {
  customer_email: string;
  business_name: string;
  gamma_prompt_id: string;
  gamma_generated_id: string;
}) {
  try {
    // Implement email service integration (Resend, SendGrid, etc.)
    const emailService = Deno.env.get('EMAIL_SERVICE_URL')
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    
    if (!emailService || !emailApiKey) {
      console.log('Email service not configured, skipping email')
      return
    }

    // Fetch gamma generated data for email content
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: gammaGenerated } = await supabaseClient
      .from('gamma_generated')
      .select('gamma_url, preview_url')
      .eq('id', params.gamma_generated_id)
      .single()

    if (!gammaGenerated) {
      console.log('Gamma generated data not found for email')
      return
    }

    // Send email
    const emailResponse = await fetch(emailService, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: params.customer_email,
        subject: `Your Gamma Landing Page is Ready - ${params.business_name}`,
        html: `
          <h2>Congratulations! Your Gamma Landing Page is Ready</h2>
          <p>Hi there,</p>
          <p>Your professional landing page for <strong>${params.business_name}</strong> has been generated and is ready for use!</p>
          <p><strong>Your Gamma Page:</strong> <a href="${gammaGenerated.gamma_url}">${gammaGenerated.gamma_url}</a></p>
          <p><strong>Preview Link:</strong> <a href="${gammaGenerated.preview_url}">${gammaGenerated.preview_url}</a></p>
          <p>Thank you for choosing our service!</p>
          <p>Best regards,<br>The AdTopia Team</p>
        `
      })
    })

    if (emailResponse.ok) {
      console.log(`Confirmation email sent to ${params.customer_email}`)
    } else {
      console.error('Failed to send confirmation email:', await emailResponse.text())
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}
