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

    const { content, niche, target_languages, content_type } = await request.json();

    // Call the translate-content function
    const { data, error } = await supabase.functions.invoke('translate-content', {
      body: {
        content,
        niche,
        target_languages,
        content_type,
        cultural_adaptations: true
      }
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Generate Translation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate translation' },
      { status: 500 }
    );
  }
}
