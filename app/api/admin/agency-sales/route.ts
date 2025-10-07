import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: sales, error } = await supabase
      .from('agency_sales')
      .select(`
        *,
        agency_partners (
          agency_name,
          tier,
          commission_rate
        )
      `)
      .order('sale_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sales: sales || [],
      count: sales?.length || 0
    });

  } catch (error) {
    console.error('Error fetching agency sales:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      sales: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agency_id,
      customer_id,
      sale_amount,
      product_tier,
      sale_source = 'direct',
      stripe_payment_intent_id
    } = body;

    // Call the commission tracking Edge Function
    const { data, error } = await supabase.functions.invoke('track-agency-commission', {
      body: {
        agency_id,
        customer_id,
        sale_amount,
        product_tier,
        sale_source,
        stripe_payment_intent_id
      }
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error('Error tracking agency commission:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
