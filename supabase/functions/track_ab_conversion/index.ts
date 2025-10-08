import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ABConversionEvent {
  user_id?: string | null;
  variant: 'A' | 'B';
  event_type: 'signup_complete' | 'cta_dropoff' | 'cta_view' | 'cta_click';
  metadata?: Record<string, any>;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { user_id, variant, event_type, metadata = {}, timestamp }: ABConversionEvent = await req.json()

    // Validate required fields
    if (!variant || !event_type) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: variant, event_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate variant
    if (!['A', 'B'].includes(variant)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid variant. Must be A or B' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate event type
    if (!['signup_complete', 'cta_dropoff', 'cta_view', 'cta_click'].includes(event_type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid event_type. Must be signup_complete, cta_dropoff, cta_view, or cta_click' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare metadata with additional context
    const enrichedMetadata = {
      ...metadata,
      user_agent: req.headers.get('user-agent') || null,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      referrer: req.headers.get('referer') || null,
      timestamp: timestamp || new Date().toISOString()
    }

    // Insert A/B test conversion event into database
    const { data, error } = await supabaseClient
      .from('ab_tests')
      .insert({
        user_id: user_id || null,
        variant: variant,
        event_type: event_type,
        metadata: enrichedMetadata,
        timestamp: timestamp || new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to track A/B test conversion',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful tracking
    console.log(`A/B Test Conversion Tracked: ${event_type} for variant ${variant}`, {
      user_id,
      variant,
      event_type,
      metadata_keys: Object.keys(enrichedMetadata)
    })

    // For signup_complete events, also track in the existing ab_test_events table for consistency
    if (event_type === 'signup_complete') {
      try {
        await supabaseClient
          .from('ab_test_events')
          .insert({
            user_id: user_id || null,
            variant: variant,
            event_type: 'signup_complete',
            email: enrichedMetadata.email || null,
            session_id: enrichedMetadata.session_id || crypto.randomUUID(),
            user_agent: enrichedMetadata.user_agent,
            ip_address: enrichedMetadata.ip_address,
            created_at: enrichedMetadata.timestamp
          })
      } catch (legacyError) {
        // Log but don't fail the main operation
        console.warn('Failed to track in legacy ab_test_events table:', legacyError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: `A/B test ${event_type} tracked successfully for variant ${variant}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
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
