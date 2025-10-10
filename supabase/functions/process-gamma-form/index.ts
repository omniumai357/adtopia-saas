// Supabase Edge Function: process-gamma-form
// Description: Automated form handling for Phase 2 Semi-Automatic Workflow
// Triggers: Form submission → Process data → Create gamma_prompts entry

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GammaFormData {
  niche: string;
  customer_name: string;
  service: string;
  location: string;
  logo_url?: string;
  description: string;
  contact_email: string;
  phone?: string;
  website?: string;
  target_audience?: string;
  pain_points?: string[];
  budget_range?: string;
  timeline?: string;
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

    // Parse form data
    const formData: GammaFormData = await req.json()
    
    // Validate required fields
    const requiredFields = ['niche', 'customer_name', 'service', 'location', 'description', 'contact_email']
    const missingFields = requiredFields.filter(field => !formData[field as keyof GammaFormData])
    
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

    // Insert into gamma_prompts table
    const { data: gammaPrompt, error: insertError } = await supabaseClient
      .from('gamma_prompts')
      .insert({
        niche: formData.niche,
        customer_name: formData.customer_name,
        service: formData.service,
        location: formData.location,
        logo_url: formData.logo_url,
        description: formData.description,
        contact_email: formData.contact_email,
        phone: formData.phone,
        website: formData.website,
        target_audience: formData.target_audience,
        pain_points: formData.pain_points,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        status: 'PENDING'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting gamma prompt:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process form data', 
          details: insertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the form processing
    await supabaseClient
      .from('admin_audit_log')
      .insert({
        action: 'gamma_form_processed',
        details: {
          gamma_prompt_id: gammaPrompt.id,
          customer_name: formData.customer_name,
          service: formData.service,
          location: formData.location,
          niche: formData.niche,
          status: 'PENDING'
        }
      })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form processed successfully',
        gamma_prompt_id: gammaPrompt.id,
        status: 'PENDING',
        next_step: 'gamma_generation'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing gamma form:', error)
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
