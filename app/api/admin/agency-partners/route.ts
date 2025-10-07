import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: agencies, error } = await supabase
      .from('agency_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      agencies: agencies || [],
      count: agencies?.length || 0
    });

  } catch (error) {
    console.error('Error fetching agency partners:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      agencies: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agency_name,
      contact_email,
      expected_monthly_sales,
      target_niches,
      company_size = 'small',
      website
    } = body;

    // Call the agency onboarding Edge Function
    const { data, error } = await supabase.functions.invoke('agency-onboarding', {
      body: {
        agency_name,
        contact_email,
        expected_monthly_sales,
        target_niches,
        company_size,
        website
      }
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error('Error creating agency partner:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
