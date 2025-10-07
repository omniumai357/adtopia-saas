import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get the latest GTMM metrics from audit log
    const { data: metricsData, error: metricsError } = await supabase
      .from('admin_audit_log')
      .select('details')
      .eq('action', 'gtmm_daily_metrics')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') {
      throw metricsError;
    }

    // If no metrics found, return default values
    if (!metricsData) {
      return NextResponse.json({
        active_research: 0,
        completed_research: 0,
        total_leads_sourced: 0,
        avg_opportunity_score: 0,
        top_performing_niche: 'No data available'
      });
    }

    // Extract metrics from the details JSON
    const metrics = metricsData.details as any;

    return NextResponse.json({
      active_research: metrics.active_research || 0,
      completed_research: metrics.completed_research || 0,
      total_leads_sourced: metrics.total_leads_sourced || 0,
      avg_opportunity_score: metrics.avg_opportunity_score || 0,
      top_performing_niche: metrics.top_performing_niche || 'No data available'
    });

  } catch (error) {
    console.error('GTMM Metrics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GTMM metrics' },
      { status: 500 }
    );
  }
}
