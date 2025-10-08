import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const variantId = searchParams.get('variantId');
  const businessName = searchParams.get('businessName');
  const location = searchParams.get('location');
  const days = parseInt(searchParams.get('days') || '30');

  try {
    switch (action) {
      case 'summary':
        const { data: summaryData, error: summaryError } = await supabase
          .from('urgency_performance_summary')
          .select('*')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

        if (summaryError) {
          console.error('Error fetching urgency performance summary:', summaryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch performance summary'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: summaryData
        });

      case 'daily':
        const { data: dailyData, error: dailyError } = await supabase
          .from('urgency_performance_daily')
          .select('*')
          .gte('performance_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('performance_date', { ascending: false });

        if (dailyError) {
          console.error('Error fetching daily performance:', dailyError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch daily performance'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: dailyData
        });

      case 'variant':
        if (!variantId) {
          return NextResponse.json({
            success: false,
            error: 'variantId is required for variant-specific data'
          }, { status: 400 });
        }

        const { data: variantData, error: variantError } = await supabase
          .from('urgency_performance')
          .select('*')
          .eq('variant_id', variantId)
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false });

        if (variantError) {
          console.error('Error fetching variant performance:', variantError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch variant performance'
          }, { status: 500 });
        }

        // Calculate metrics for the variant
        const impressions = variantData?.filter(d => d.event_type === 'impression').length || 0;
        const clicks = variantData?.filter(d => d.event_type === 'click').length || 0;
        const calls = variantData?.filter(d => d.event_type === 'call').length || 0;
        const texts = variantData?.filter(d => d.event_type === 'text').length || 0;
        const conversions = variantData?.filter(d => d.event_type === 'conversion').length || 0;

        const metrics = {
          variant_id: variantId,
          impressions,
          clicks,
          calls,
          texts,
          conversions,
          click_rate_percent: impressions > 0 ? Math.round((clicks / impressions) * 100 * 100) / 100 : 0,
          conversion_rate_percent: impressions > 0 ? Math.round((conversions / impressions) * 100 * 100) / 100 : 0,
          click_to_conversion_rate_percent: clicks > 0 ? Math.round((conversions / clicks) * 100 * 100) / 100 : 0,
          projected_revenue_usd: conversions * 100
        };

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            events: variantData
          }
        });

      case 'business':
        if (!businessName || !location) {
          return NextResponse.json({
            success: false,
            error: 'businessName and location are required for business-specific data'
          }, { status: 400 });
        }

        const { data: businessData, error: businessError } = await supabase
          .from('urgency_performance')
          .select('*')
          .eq('business_name', businessName)
          .eq('location', location)
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false });

        if (businessError) {
          console.error('Error fetching business performance:', businessError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch business performance'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: businessData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "summary", "daily", "variant", or "business"'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in urgency performance API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      variant_id, 
      event_type, 
      business_name, 
      location, 
      service_type, 
      utm_params, 
      metadata 
    } = body;

    // Validate required fields
    if (!variant_id || !event_type || !business_name || !location || !service_type) {
      return NextResponse.json({
        success: false,
        error: 'variant_id, event_type, business_name, location, and service_type are required'
      }, { status: 400 });
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('track_urgency_performance', {
      body: {
        variant_id,
        event_type,
        business_name,
        location,
        service_type,
        utm_params: utm_params || {},
        metadata: metadata || {}
      }
    });

    if (error) {
      console.error('Error tracking urgency performance:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to track urgency performance'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Urgency performance tracked successfully'
    });
  } catch (error: any) {
    console.error('Error in urgency performance POST API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
