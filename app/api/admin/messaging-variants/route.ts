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

    // Query messaging variants
    const { data: variants, error } = await supabase
      .from('messaging_variants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If the table doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          {
            id: 'mock-variant-1',
            variant_name: 'construction_urgency',
            hook_line: '60% off AdTopia beta ends in 48 hours for construction businesses!',
            value_proposition: 'Get 220% more leads with AI-generated QR ads designed for construction companies',
            call_to_action: 'Claim Your Discount Now',
            target_niche: 'construction',
            variant_type: 'urgency',
            expected_conversion_lift: 0.15,
            actual_conversion_rate: 0.0552,
            test_status: 'testing'
          },
          {
            id: 'mock-variant-2',
            variant_name: 'construction_social_proof',
            hook_line: '500+ construction businesses already using AdTopia to grow',
            value_proposition: 'Join the construction leaders getting 3.6x ROI on their marketing spend',
            call_to_action: 'Start Your Success Story',
            target_niche: 'construction',
            variant_type: 'social_proof',
            expected_conversion_lift: 0.12,
            actual_conversion_rate: 0.0333,
            test_status: 'testing'
          },
          {
            id: 'mock-variant-3',
            variant_name: 'construction_roi_focused',
            hook_line: '220% average lead increase in 30 days for construction companies',
            value_proposition: 'Proven results: construction businesses see 3.6x ROI with AdTopia\'s AI ads',
            call_to_action: 'Get Your ROI Report',
            target_niche: 'construction',
            variant_type: 'roi_focused',
            expected_conversion_lift: 0.18,
            actual_conversion_rate: 0.0000,
            test_status: 'draft'
          },
          {
            id: 'mock-variant-4',
            variant_name: 'construction_risk_reduction',
            hook_line: '7-day money-back guarantee + free setup for construction businesses',
            value_proposition: 'Zero risk, maximum results for your construction business with guaranteed ROI',
            call_to_action: 'Try Risk-Free Today',
            target_niche: 'construction',
            variant_type: 'risk_reduction',
            expected_conversion_lift: 0.10,
            actual_conversion_rate: 0.0000,
            test_status: 'draft'
          },
          {
            id: 'mock-variant-5',
            variant_name: 'construction_scarcity',
            hook_line: 'Only 50 beta spots left for construction businesses',
            value_proposition: 'Exclusive access to the most effective marketing tool for construction companies',
            call_to_action: 'Reserve Your Spot',
            target_niche: 'construction',
            variant_type: 'scarcity',
            expected_conversion_lift: 0.20,
            actual_conversion_rate: 0.0000,
            test_status: 'draft'
          }
        ]);
      }
      throw error;
    }

    return NextResponse.json(variants || []);

  } catch (error) {
    console.error('Messaging Variants API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messaging variants' },
      { status: 500 }
    );
  }
}
