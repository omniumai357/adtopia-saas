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

    // Query multilingual content
    const { data: content, error } = await supabase
      .from('multilingual_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If the table doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          {
            id: 'mock-content-1',
            source_content: 'Get 220% more leads with AI-generated QR ads',
            source_language: 'en',
            target_language: 'es',
            translated_content: '[ES] Obtén 220% más leads con anuncios QR generados por IA',
            niche: 'construction',
            content_type: 'ad_copy',
            quality_score: 8,
            status: 'completed',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-content-2',
            source_content: '60% off AdTopia beta ends in 48 hours!',
            source_language: 'en',
            target_language: 'fr',
            translated_content: '[FR] 60% de réduction sur la bêta AdTopia se termine dans 48 heures !',
            niche: 'construction',
            content_type: 'ad_copy',
            quality_score: 7,
            status: 'completed',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-content-3',
            source_content: 'Join 500+ construction businesses using AdTopia',
            source_language: 'en',
            target_language: 'de',
            translated_content: '[DE] Schließen Sie sich 500+ Bauunternehmen an, die AdTopia verwenden',
            niche: 'construction',
            content_type: 'ad_copy',
            quality_score: 9,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ]);
      }
      throw error;
    }

    return NextResponse.json(content || []);

  } catch (error) {
    console.error('Multilingual Content API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch multilingual content' },
      { status: 500 }
    );
  }
}
