// Supabase Edge Function: create-payment-session
// Description: Stripe payment integration for Phase 2 Semi-Automatic Workflow
// Triggers: After Gamma page generation → Create Stripe checkout session

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  gamma_prompt_id: string;
  gamma_generated_id: string;
  customer_email: string;
  price: number;
  success_url?: string;
  cancel_url?: string;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request data
    const requestData: PaymentRequest = await req.json()
    
    // Validate required fields
    const requiredFields = ['gamma_prompt_id', 'gamma_generated_id', 'customer_email', 'price']
    const missingFields = requiredFields.filter(field => !requestData[field as keyof PaymentRequest])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing_fields: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify gamma prompt exists
    const { data: gammaPrompt, error: promptError } = await supabaseClient
      .from('gamma_prompts')
      .select('*')
      .eq('id', requestData.gamma_prompt_id)
      .single()

    if (promptError || !gammaPrompt) {
      return new Response(
        JSON.stringify({ 
          error: 'Gamma prompt not found', 
          details: promptError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify gamma generated exists
    const { data: gammaGenerated, error: generatedError } = await supabaseClient
      .from('gamma_generated')
      .select('*')
      .eq('id', requestData.gamma_generated_id)
      .single()

    if (generatedError || !gammaGenerated) {
      return new Response(
        JSON.stringify({ 
          error: 'Gamma generated page not found', 
          details: generatedError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Stripe checkout session
    const stripeSession = await createStripeCheckoutSession({
      gamma_prompt_id: requestData.gamma_prompt_id,
      gamma_generated_id: requestData.gamma_generated_id,
      customer_email: requestData.customer_email,
      price: requestData.price,
      success_url: requestData.success_url || `${Deno.env.get('SITE_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: requestData.cancel_url || `${Deno.env.get('SITE_URL')}/payment/cancel`,
      business_name: gammaPrompt.customer_name,
      service: gammaPrompt.service
    })

    // Insert into gamma_sales table
    const { data: gammaSale, error: saleError } = await supabaseClient
      .from('gamma_sales')
      .insert({
        gamma_id: requestData.gamma_prompt_id,
        stripe_payment_intent_id: stripeSession.payment_intent,
        price: requestData.price,
        customer_email: requestData.customer_email,
        status: false,
        payment_status: 'PENDING'
      })
      .select()
      .single()

    if (saleError) {
      console.error('Error creating gamma sale:', saleError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment record', 
          details: saleError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the payment session creation
    await supabaseClient
      .from('admin_audit_log')
      .insert({
        action: 'stripe_payment_session_created',
        details: {
          gamma_prompt_id: requestData.gamma_prompt_id,
          gamma_generated_id: requestData.gamma_generated_id,
          gamma_sale_id: gammaSale.id,
          stripe_session_id: stripeSession.id,
          customer_email: requestData.customer_email,
          price: requestData.price,
          business_name: gammaPrompt.customer_name
        }
      })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment session created successfully',
        stripe_session_id: stripeSession.id,
        checkout_url: stripeSession.url,
        gamma_sale_id: gammaSale.id,
        payment_status: 'PENDING'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating payment session:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to create Stripe checkout session
async function createStripeCheckoutSession(params: {
  gamma_prompt_id: string;
  gamma_generated_id: string;
  customer_email: string;
  price: number;
  success_url: string;
  cancel_url: string;
  business_name: string;
  service: string;
}): Promise<{
  id: string;
  url: string;
  payment_intent: string;
}> {
  try {
    // Initialize Stripe (replace with actual Stripe integration)
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Create Stripe checkout session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency': 'usd',
        'line_items[0][price_data][product_data][name': `Gamma Landing Page - ${params.business_name}`,
        'line_items[0][price_data][product_data][description': `Professional landing page for ${params.service} business`,
        'line_items[0][price_data][unit_amount': (params.price * 100).toString(), // Convert to cents
        'line_items[0][quantity': '1',
        'mode': 'payment',
        'success_url': params.success_url,
        'cancel_url': params.cancel_url,
        'customer_email': params.customer_email,
        'metadata[gamma_prompt_id]': params.gamma_prompt_id,
        'metadata[gamma_generated_id]': params.gamma_generated_id,
        'metadata[business_name]': params.business_name,
        'metadata[service]': params.service
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Stripe API error: ${errorData}`)
    }

    const session = await response.json()
    
    return {
      id: session.id,
      url: session.url,
      payment_intent: session.payment_intent
    }
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    throw error
  }
}
