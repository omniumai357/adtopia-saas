import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ABTestEvent {
  user_id?: string | null;
  variant: 'A' | 'B';
  event: 'cta_view' | 'cta_click';
  email?: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { user_id, variant, event, email, timestamp }: ABTestEvent = await req.json()

    // Validate required fields
    if (!variant || !event || !timestamp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: variant, event, timestamp' 
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
    if (!['cta_view', 'cta_click'].includes(event)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid event. Must be cta_view or cta_click' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert A/B test event into database
    const { data, error } = await supabaseClient
      .from('ab_test_events')
      .insert({
        user_id: user_id || null,
        variant: variant,
        event_type: event,
        email: email || null,
        created_at: timestamp,
        session_id: crypto.randomUUID(), // Generate session ID for anonymous users
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to track A/B test event',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful tracking
    console.log(`A/B Test Event Tracked: ${event} for variant ${variant}`, {
      user_id,
      email: email ? '***@***.***' : null, // Mask email in logs
      timestamp
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: `A/B test event ${event} tracked successfully for variant ${variant}`
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
