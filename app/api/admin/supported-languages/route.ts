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

    // Query supported languages
    const { data: languages, error } = await supabase
      .from('supported_languages')
      .select('*')
      .eq('is_active', true)
      .order('market_priority', { ascending: true });

    if (error) {
      // If the table doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          { language_code: 'es', language_name: 'Spanish', native_name: 'Español', market_priority: 1, estimated_market_size_usd: 500000000000, translation_complexity: 'low', is_active: true },
          { language_code: 'fr', language_name: 'French', native_name: 'Français', market_priority: 1, estimated_market_size_usd: 300000000000, translation_complexity: 'medium', is_active: true },
          { language_code: 'de', language_name: 'German', native_name: 'Deutsch', market_priority: 1, estimated_market_size_usd: 400000000000, translation_complexity: 'medium', is_active: true },
          { language_code: 'it', language_name: 'Italian', native_name: 'Italiano', market_priority: 2, estimated_market_size_usd: 200000000000, translation_complexity: 'medium', is_active: true },
          { language_code: 'pt', language_name: 'Portuguese', native_name: 'Português', market_priority: 2, estimated_market_size_usd: 250000000000, translation_complexity: 'low', is_active: true },
          { language_code: 'ru', language_name: 'Russian', native_name: 'Русский', market_priority: 2, estimated_market_size_usd: 150000000000, translation_complexity: 'high', is_active: true },
          { language_code: 'zh', language_name: 'Chinese', native_name: '中文', market_priority: 2, estimated_market_size_usd: 800000000000, translation_complexity: 'high', is_active: true },
          { language_code: 'ja', language_name: 'Japanese', native_name: '日本語', market_priority: 2, estimated_market_size_usd: 400000000000, translation_complexity: 'high', is_active: true },
          { language_code: 'ko', language_name: 'Korean', native_name: '한국어', market_priority: 3, estimated_market_size_usd: 180000000000, translation_complexity: 'high', is_active: true },
          { language_code: 'ar', language_name: 'Arabic', native_name: 'العربية', market_priority: 3, estimated_market_size_usd: 200000000000, translation_complexity: 'high', is_active: true },
          { language_code: 'hi', language_name: 'Hindi', native_name: 'हिन्दी', market_priority: 3, estimated_market_size_usd: 300000000000, translation_complexity: 'medium', is_active: true },
          { language_code: 'tr', language_name: 'Turkish', native_name: 'Türkçe', market_priority: 3, estimated_market_size_usd: 100000000000, translation_complexity: 'medium', is_active: true }
        ]);
      }
      throw error;
    }

    return NextResponse.json(languages || []);

  } catch (error) {
    console.error('Supported Languages API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
}
