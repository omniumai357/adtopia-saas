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

    // Query the cron job status view
    const { data: cronJobs, error } = await supabase
      .from('gtmm_cron_status')
      .select('*')
      .order('next_run', { ascending: true });

    if (error) {
      // If the view doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          {
            jobname: 'gtmm_weekly_tam_refresh',
            schedule: '0 9 * * 1',
            active: true,
            last_run: null,
            next_run: '2025-01-13T09:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_weekly_lead_sourcing',
            schedule: '0 10 * * 1',
            active: true,
            last_run: null,
            next_run: '2025-01-13T10:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_daily_performance_check',
            schedule: '0 8 * * *',
            active: true,
            last_run: null,
            next_run: '2025-01-08T08:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_weekly_keyword_optimization',
            schedule: '0 14 * * 3',
            active: true,
            last_run: null,
            next_run: '2025-01-15T14:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_weekly_messaging_optimization',
            schedule: '0 15 * * 5',
            active: true,
            last_run: null,
            next_run: '2025-01-17T15:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_monthly_revenue_analysis',
            schedule: '0 9 1 * *',
            active: true,
            last_run: null,
            next_run: '2025-02-01T09:00:00Z',
            category: 'GTMM Revenue Machine'
          },
          {
            jobname: 'gtmm_monthly_cleanup',
            schedule: '0 2 15 * *',
            active: true,
            last_run: null,
            next_run: '2025-01-15T02:00:00Z',
            category: 'GTMM Revenue Machine'
          }
        ]);
      }
      throw error;
    }

    return NextResponse.json(cronJobs || []);

  } catch (error) {
    console.error('GTMM Cron Status API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cron job status' },
      { status: 500 }
    );
  }
}
