// Supabase Edge Function: generate-gamma-page
// Description: Automated Gamma generation for Phase 2 Semi-Automatic Workflow
// Triggers: Manual trigger or automated after form processing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GammaGenerationRequest {
  gamma_prompt_id: string;
  template_id?: string;
  manual_trigger?: boolean;
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
    const requestData: GammaGenerationRequest = await req.json()
    
    if (!requestData.gamma_prompt_id) {
      return new Response(
        JSON.stringify({ error: 'gamma_prompt_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch gamma prompt data
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

    // Select appropriate template
    let templateId = requestData.template_id
    if (!templateId) {
      const { data: template } = await supabaseClient
        .from('gamma_templates')
        .select('id, prompt_template, variables')
        .eq('niche', gammaPrompt.niche)
        .eq('is_active', true)
        .single()
      
      if (!template) {
        return new Response(
          JSON.stringify({ 
            error: 'No template found for niche', 
            niche: gammaPrompt.niche 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      templateId = template.id
    }

    // Fetch template details
    const { data: template, error: templateError } = await supabaseClient
      .from('gamma_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ 
          error: 'Template not found', 
          details: templateError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create gamma_generated entry
    const { data: gammaGenerated, error: generatedError } = await supabaseClient
      .from('gamma_generated')
      .insert({
        gamma_prompt_id: gammaPrompt.id,
        template_used: template.template_name,
        generation_status: 'PROCESSING'
      })
      .select()
      .single()

    if (generatedError) {
      console.error('Error creating gamma generated entry:', generatedError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create generation entry', 
          details: generatedError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate Gamma prompt with template variables
    const generatedPrompt = generatePromptFromTemplate(template.prompt_template, gammaPrompt)
    
    // Simulate Gamma API call (replace with actual Gamma API integration)
    const gammaResult = await simulateGammaGeneration(generatedPrompt, gammaPrompt)
    
    // Update gamma_generated with results
    const { error: updateError } = await supabaseClient
      .from('gamma_generated')
      .update({
        gamma_url: gammaResult.gamma_url,
        preview_url: gammaResult.preview_url,
        generation_status: gammaResult.success ? 'COMPLETED' : 'FAILED',
        error_message: gammaResult.error_message,
        completed_at: new Date().toISOString()
      })
      .eq('id', gammaGenerated.id)

    if (updateError) {
      console.error('Error updating gamma generated:', updateError)
    }

    // Update gamma_prompts status
    await supabaseClient
      .from('gamma_prompts')
      .update({ 
        status: gammaResult.success ? 'GENERATED' : 'FAILED',
        updated_at: new Date().toISOString()
      })
      .eq('id', gammaPrompt.id)

    // Log the generation
    await supabaseClient
      .from('admin_audit_log')
      .insert({
        action: 'gamma_page_generated',
        details: {
          gamma_prompt_id: gammaPrompt.id,
          gamma_generated_id: gammaGenerated.id,
          template_used: template.template_name,
          success: gammaResult.success,
          gamma_url: gammaResult.gamma_url,
          customer_name: gammaPrompt.customer_name
        }
      })

    // Return success response
    return new Response(
      JSON.stringify({
        success: gammaResult.success,
        message: gammaResult.success ? 'Gamma page generated successfully' : 'Gamma generation failed',
        gamma_generated_id: gammaGenerated.id,
        gamma_url: gammaResult.gamma_url,
        preview_url: gammaResult.preview_url,
        status: gammaResult.success ? 'COMPLETED' : 'FAILED',
        error_message: gammaResult.error_message
      }),
      { 
        status: gammaResult.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating gamma page:', error)
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

// Helper function to generate prompt from template
function generatePromptFromTemplate(template: string, data: any): string {
  let prompt = template
  
  // Replace template variables with actual data
  prompt = prompt.replace(/{customer_name}/g, data.customer_name || '')
  prompt = prompt.replace(/{service}/g, data.service || '')
  prompt = prompt.replace(/{location}/g, data.location || '')
  prompt = prompt.replace(/{description}/g, data.description || '')
  prompt = prompt.replace(/{target_audience}/g, data.target_audience || '')
  prompt = prompt.replace(/{pain_points}/g, Array.isArray(data.pain_points) ? data.pain_points.join(', ') : '')
  prompt = prompt.replace(/{niche}/g, data.niche || '')
  
  return prompt
}

// Simulate Gamma API call (replace with actual Gamma API integration)
async function simulateGammaGeneration(prompt: string, data: any): Promise<{
  success: boolean;
  gamma_url?: string;
  preview_url?: string;
  error_message?: string;
}> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate mock URLs
    const gammaId = `gamma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const gamma_url = `https://gamma.app/${gammaId}`
    const preview_url = `https://gamma.app/preview/${gammaId}`
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      return {
        success: true,
        gamma_url,
        preview_url
      }
    } else {
      return {
        success: false,
        error_message: 'Simulated Gamma API error'
      }
    }
  } catch (error) {
    return {
      success: false,
      error_message: error.message
    }
  }
}
