import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UrgencyPerformanceEvent {
  variant_id: string;
  event_type: 'impression' | 'click' | 'call' | 'text' | 'conversion';
  business_name: string;
  location: string;
  service_type: string;
  utm_params?: Record<string, string>;
  metadata?: Record<string, any>;
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
    const { 
      variant_id, 
      event_type, 
      business_name, 
      location, 
      service_type, 
      utm_params, 
      metadata 
    }: UrgencyPerformanceEvent = await req.json()

    // Validate required fields
    if (!variant_id || !event_type || !business_name || !location || !service_type) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'variant_id, event_type, business_name, location, and service_type are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert into urgency_performance table
    const { data, error } = await supabaseClient
      .from('urgency_performance')
      .insert({
        variant_id,
        event_type,
        business_name,
        location,
        service_type,
        utm_params: utm_params || {},
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to track urgency performance',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful tracking
    console.log(`Urgency performance tracked: ${event_type} for variant ${variant_id}`, {
      business_name,
      location,
      service_type,
      utm_params
    })

    // Check for performance thresholds and trigger alerts
    if (event_type === 'conversion') {
      await checkPerformanceThresholds(supabaseClient, variant_id, business_name, location)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: 'Urgency performance tracked successfully' 
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

/**
 * Check performance thresholds and trigger alerts
 */
async function checkPerformanceThresholds(
  supabaseClient: any, 
  variantId: string, 
  businessName: string, 
  location: string
) {
  try {
    // Get performance stats for the last 24 hours
    const { data: stats, error } = await supabaseClient
      .from('urgency_performance')
      .select('*')
      .eq('variant_id', variantId)
      .eq('business_name', businessName)
      .eq('location', location)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error || !stats) return

    const impressions = stats.filter(s => s.event_type === 'impression').length
    const conversions = stats.filter(s => s.event_type === 'conversion').length
    const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0

    // Trigger alert if conversion rate exceeds 25% (high performance)
    if (conversionRate > 25 && conversions >= 5) {
      await supabaseClient.functions.invoke('send-admin-notification', {
        body: {
          type: 'urgency_high_performance',
          variant_id: variantId,
          business_name: businessName,
          location: location,
          conversion_rate: conversionRate,
          conversions: conversions,
          impressions: impressions,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Trigger alert if conversion rate is below 5% (low performance)
    if (conversionRate < 5 && impressions >= 20) {
      await supabaseClient.functions.invoke('send-admin-notification', {
        body: {
          type: 'urgency_low_performance',
          variant_id: variantId,
          business_name: businessName,
          location: location,
          conversion_rate: conversionRate,
          conversions: conversions,
          impressions: impressions,
          timestamp: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('Error checking performance thresholds:', error)
  }
}
