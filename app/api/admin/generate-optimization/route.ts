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

    const { niche, current_conversion_rate } = await request.json();

    // Call the optimize-messaging function
    const { data, error } = await supabase.functions.invoke('optimize-messaging', {
      body: {
        niche,
        current_conversion_rate,
        target_conversion_rate: 0.08
      }
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Generate Optimization API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate optimization' },
      { status: 500 }
    );
  }
}
