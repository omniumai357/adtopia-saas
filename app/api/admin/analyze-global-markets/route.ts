import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { niche, target_revenue, analysis_depth } = await request.json();

    // Call the analyze-global-markets function
    const { data, error } = await supabase.functions.invoke('analyze-global-markets', {
      body: {
        niche,
        target_revenue,
        analysis_depth
      }
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Analyze Global Markets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze global markets' },
      { status: 500 }
    );
  }
}
