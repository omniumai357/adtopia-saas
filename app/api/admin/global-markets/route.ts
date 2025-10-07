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

    // Query global market segments
    const { data: markets, error } = await supabase
      .from('global_market_segments')
      .select('*')
      .order('market_size_usd', { ascending: false });

    if (error) {
      // If the table doesn't exist yet, return mock data
      if (error.code === '42P01') {
        return NextResponse.json([
          { market_name: 'United States', primary_language: 'en', currency: 'USD', market_size_usd: 25000000000000, digital_adoption_percent: 85.0, avg_marketing_budget_usd: 5000.00, cultural_notes: 'Direct communication, results-oriented' },
          { market_name: 'China', primary_language: 'zh', currency: 'CNY', market_size_usd: 8000000000000, digital_adoption_percent: 70.0, avg_marketing_budget_usd: 3000.00, cultural_notes: 'Respectful, hierarchical communication' },
          { market_name: 'Germany', primary_language: 'de', currency: 'EUR', market_size_usd: 4000000000000, digital_adoption_percent: 88.0, avg_marketing_budget_usd: 4500.00, cultural_notes: 'Precise, technical communication' },
          { market_name: 'Japan', primary_language: 'ja', currency: 'JPY', market_size_usd: 4000000000000, digital_adoption_percent: 85.0, avg_marketing_budget_usd: 5000.00, cultural_notes: 'Highly formal, honorific language' },
          { market_name: 'United Kingdom', primary_language: 'en', currency: 'GBP', market_size_usd: 3000000000000, digital_adoption_percent: 90.0, avg_marketing_budget_usd: 4000.00, cultural_notes: 'Professional, understated communication' },
          { market_name: 'France', primary_language: 'fr', currency: 'EUR', market_size_usd: 3000000000000, digital_adoption_percent: 82.0, avg_marketing_budget_usd: 4200.00, cultural_notes: 'Formal, relationship-oriented' },
          { market_name: 'Brazil', primary_language: 'pt', currency: 'BRL', market_size_usd: 2500000000000, digital_adoption_percent: 65.0, avg_marketing_budget_usd: 2500.00, cultural_notes: 'Warm, relationship-oriented' },
          { market_name: 'Italy', primary_language: 'it', currency: 'EUR', market_size_usd: 2000000000000, digital_adoption_percent: 75.0, avg_marketing_budget_usd: 3800.00, cultural_notes: 'Emotional, relationship-oriented' },
          { market_name: 'India', primary_language: 'hi', currency: 'INR', market_size_usd: 3000000000000, digital_adoption_percent: 50.0, avg_marketing_budget_usd: 1500.00, cultural_notes: 'Respectful, relationship-oriented' },
          { market_name: 'Spain', primary_language: 'es', currency: 'EUR', market_size_usd: 1500000000000, digital_adoption_percent: 78.0, avg_marketing_budget_usd: 3500.00, cultural_notes: 'Warm, relationship-oriented' },
          { market_name: 'South Korea', primary_language: 'ko', currency: 'KRW', market_size_usd: 1800000000000, digital_adoption_percent: 95.0, avg_marketing_budget_usd: 4500.00, cultural_notes: 'Formal, age-hierarchy respect' },
          { market_name: 'Mexico', primary_language: 'es', currency: 'MXN', market_size_usd: 1500000000000, digital_adoption_percent: 60.0, avg_marketing_budget_usd: 2000.00, cultural_notes: 'Warm, family-oriented' }
        ]);
      }
      throw error;
    }

    return NextResponse.json(markets || []);

  } catch (error) {
    console.error('Global Markets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global markets' },
      { status: 500 }
    );
  }
}
