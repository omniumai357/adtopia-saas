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

    // Query the conversion optimization dashboard view
    const { data: abTests, error } = await supabase
      .from('conversion_optimization_dashboard')
      .select('*')
      .order('test_id', { ascending: false });

    if (error) {
      // If the view doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          {
            test_id: 'mock-test-1',
            test_name: 'construction_conversion_optimization_2025-01-07',
            target_niche: 'construction',
            status: 'active',
            target_conversion_rate: 0.08,
            current_conversion_rate: 0.035,
            variant_a_visitors: 150,
            variant_a_conversions: 5,
            variant_a_rate: 0.0333,
            variant_b_visitors: 145,
            variant_b_conversions: 8,
            variant_b_rate: 0.0552,
            current_winner: 'B',
            improvement_margin: 0.0219
          }
        ]);
      }
      throw error;
    }

    return NextResponse.json(abTests || []);

  } catch (error) {
    console.error('A/B Tests API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests data' },
      { status: 500 }
    );
  }
}
