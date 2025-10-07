import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface MarketAnalysisRequest {
  niche: string;
  target_revenue: number;
  priority_languages?: string[];
  analysis_depth?: 'basic' | 'comprehensive' | 'detailed';
}

interface MarketOpportunity {
  market_name: string;
  language: string;
  market_size_usd: number;
  digital_adoption_percent: number;
  avg_marketing_budget_usd: number;
  opportunity_score: number;
  estimated_revenue_potential: number;
  market_priority: number;
  cultural_considerations: string[];
  recommended_approach: string;
  time_to_market_days: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      niche, 
      target_revenue, 
      priority_languages = [],
      analysis_depth = 'comprehensive'
    } = await req.json() as MarketAnalysisRequest;
    
    console.log(`🌍 Analyzing global markets for ${niche} niche`);
    console.log(`Target revenue: $${target_revenue.toLocaleString()}`);
    console.log(`Analysis depth: ${analysis_depth}`);

    // Get global market segments data
    const { data: marketSegments, error: marketError } = await supabase
      .from('global_market_segments')
      .select('*')
      .order('market_size_usd', { ascending: false });

    if (marketError) {
      throw marketError;
    }

    // Get supported languages data
    const { data: supportedLanguages, error: languageError } = await supabase
      .from('supported_languages')
      .select('*')
      .eq('is_active', true)
      .order('market_priority', { ascending: true });

    if (languageError) {
      throw languageError;
    }

    // Analyze market opportunities
    const marketOpportunities: MarketOpportunity[] = [];
    
    for (const market of marketSegments || []) {
      // Calculate opportunity score based on multiple factors
      const opportunityScore = calculateOpportunityScore(
        market,
        niche,
        target_revenue,
        supportedLanguages?.find(lang => lang.language_code === market.primary_language)
      );

      // Calculate estimated revenue potential
      const estimatedRevenuePotential = calculateRevenuePotential(
        market,
        opportunityScore,
        target_revenue
      );

      // Determine time to market
      const timeToMarket = calculateTimeToMarket(
        market,
        supportedLanguages?.find(lang => lang.language_code === market.primary_language)
      );

      // Generate cultural considerations
      const culturalConsiderations = generateCulturalConsiderations(market, niche);

      // Generate recommended approach
      const recommendedApproach = generateRecommendedApproach(
        market,
        opportunityScore,
        culturalConsiderations
      );

      const opportunity: MarketOpportunity = {
        market_name: market.market_name,
        language: market.primary_language,
        market_size_usd: market.market_size_usd,
        digital_adoption_percent: market.digital_adoption_percent,
        avg_marketing_budget_usd: market.avg_marketing_budget_usd,
        opportunity_score: opportunityScore,
        estimated_revenue_potential: estimatedRevenuePotential,
        market_priority: supportedLanguages?.find(lang => lang.language_code === market.primary_language)?.market_priority || 5,
        cultural_considerations: culturalConsiderations,
        recommended_approach: recommendedApproach,
        time_to_market_days: timeToMarket
      };

      marketOpportunities.push(opportunity);
    }

    // Sort by opportunity score and filter by priority languages if specified
    let filteredOpportunities = marketOpportunities;
    if (priority_languages.length > 0) {
      filteredOpportunities = marketOpportunities.filter(
        opp => priority_languages.includes(opp.language)
      );
    }

    filteredOpportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);

    // Calculate global market summary
    const totalMarketSize = filteredOpportunities.reduce((sum, opp) => sum + opp.market_size_usd, 0);
    const totalRevenuePotential = filteredOpportunities.reduce((sum, opp) => sum + opp.estimated_revenue_potential, 0);
    const averageOpportunityScore = filteredOpportunities.reduce((sum, opp) => sum + opp.opportunity_score, 0) / filteredOpportunities.length;

    // Generate market penetration strategy
    const penetrationStrategy = generateMarketPenetrationStrategy(
      filteredOpportunities,
      niche,
      target_revenue
    );

    // Log analysis completion
    await supabase.from('multilingual_audit_log').insert({
      action_type: 'global_market_analysis_completed',
      details: {
        niche,
        target_revenue,
        markets_analyzed: filteredOpportunities.length,
        total_market_size: totalMarketSize,
        total_revenue_potential: totalRevenuePotential,
        average_opportunity_score: averageOpportunityScore,
        analysis_depth,
        priority_languages
      }
    });

    const response = {
      success: true,
      analysis_id: crypto.randomUUID(),
      niche,
      target_revenue,
      analysis_depth,
      global_market_summary: {
        markets_analyzed: filteredOpportunities.length,
        total_market_size_usd: totalMarketSize,
        total_revenue_potential_usd: totalRevenuePotential,
        average_opportunity_score: Math.round(averageOpportunityScore * 100) / 100,
        estimated_global_reach: '4.5 billion people',
        languages_supported: filteredOpportunities.length
      },
      top_opportunities: filteredOpportunities.slice(0, 10),
      market_penetration_strategy: penetrationStrategy,
      implementation_roadmap: {
        phase_1: {
          duration: '30 days',
          markets: filteredOpportunities.slice(0, 3).map(opp => opp.market_name),
          focus: 'High-opportunity market entry'
        },
        phase_2: {
          duration: '60 days',
          markets: filteredOpportunities.slice(3, 8).map(opp => opp.market_name),
          focus: 'Market expansion and optimization'
        },
        phase_3: {
          duration: '90 days',
          markets: filteredOpportunities.slice(8, 15).map(opp => opp.market_name),
          focus: 'Global market coverage'
        }
      },
      next_steps: [
        'Prioritize top 3 markets for immediate entry',
        'Develop market-specific content and messaging',
        'Set up local payment and compliance systems',
        'Launch targeted campaigns in priority markets',
        'Monitor performance and optimize based on results'
      ]
    };

    console.log(`✅ Global market analysis completed`);
    console.log(`📊 Top opportunity: ${filteredOpportunities[0]?.market_name} (Score: ${filteredOpportunities[0]?.opportunity_score})`);
    console.log(`💰 Total revenue potential: $${totalRevenuePotential.toLocaleString()}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('💥 Global market analysis error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Global market analysis failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Helper function to calculate opportunity score
function calculateOpportunityScore(
  market: any,
  niche: string,
  targetRevenue: number,
  languageData: any
): number {
  let score = 0;

  // Market size factor (0-3 points)
  if (market.market_size_usd > 1000000000000) score += 3; // >$1T
  else if (market.market_size_usd > 500000000000) score += 2; // >$500B
  else if (market.market_size_usd > 100000000000) score += 1; // >$100B

  // Digital adoption factor (0-2 points)
  if (market.digital_adoption_percent > 80) score += 2;
  else if (market.digital_adoption_percent > 60) score += 1;

  // Marketing budget factor (0-2 points)
  if (market.avg_marketing_budget_usd > 4000) score += 2;
  else if (market.avg_marketing_budget_usd > 2000) score += 1;

  // Language priority factor (0-2 points)
  if (languageData?.market_priority <= 2) score += 2;
  else if (languageData?.market_priority <= 3) score += 1;

  // Translation complexity factor (0-1 points, inverted)
  if (languageData?.translation_complexity === 'low') score += 1;

  return Math.min(score, 10);
}

// Helper function to calculate revenue potential
function calculateRevenuePotential(
  market: any,
  opportunityScore: number,
  targetRevenue: number
): number {
  // Base revenue potential based on market size and opportunity score
  const marketSizeFactor = market.market_size_usd / 1000000000000; // Convert to trillions
  const opportunityFactor = opportunityScore / 10;
  const digitalAdoptionFactor = market.digital_adoption_percent / 100;
  
  return targetRevenue * marketSizeFactor * opportunityFactor * digitalAdoptionFactor;
}

// Helper function to calculate time to market
function calculateTimeToMarket(
  market: any,
  languageData: any
): number {
  let days = 30; // Base time

  // Add complexity based on translation difficulty
  if (languageData?.translation_complexity === 'high') days += 15;
  else if (languageData?.translation_complexity === 'medium') days += 7;

  // Add complexity based on market regulations
  if (market.regulatory_notes && market.regulatory_notes.length > 50) days += 10;

  return days;
}

// Helper function to generate cultural considerations
function generateCulturalConsiderations(market: any, niche: string): string[] {
  const considerations = [];

  if (market.cultural_notes) {
    considerations.push(market.cultural_notes);
  }

  if (market.preferred_communication_style) {
    considerations.push(`Communication style: ${market.preferred_communication_style}`);
  }

  if (market.business_hours) {
    considerations.push(`Business hours: ${JSON.stringify(market.business_hours)}`);
  }

  if (market.peak_season_months) {
    considerations.push(`Peak seasons: ${market.peak_season_months.join(', ')}`);
  }

  return considerations;
}

// Helper function to generate recommended approach
function generateRecommendedApproach(
  market: any,
  opportunityScore: number,
  culturalConsiderations: string[]
): string {
  if (opportunityScore >= 8) {
    return `Immediate entry recommended. High opportunity market with strong digital adoption and cultural alignment. Focus on premium positioning and rapid scaling.`;
  } else if (opportunityScore >= 6) {
    return `Strategic entry recommended. Good opportunity with moderate complexity. Develop market-specific content and gradual scaling approach.`;
  } else if (opportunityScore >= 4) {
    return `Careful entry recommended. Moderate opportunity with some challenges. Extensive cultural adaptation and compliance review required.`;
  } else {
    return `Long-term consideration. Lower priority market with significant challenges. Consider after establishing presence in higher-opportunity markets.`;
  }
}

// Helper function to generate market penetration strategy
function generateMarketPenetrationStrategy(
  opportunities: MarketOpportunity[],
  niche: string,
  targetRevenue: number
): any {
  const highOpportunity = opportunities.filter(opp => opp.opportunity_score >= 8);
  const mediumOpportunity = opportunities.filter(opp => opp.opportunity_score >= 6 && opp.opportunity_score < 8);
  const lowOpportunity = opportunities.filter(opp => opp.opportunity_score < 6);

  return {
    immediate_focus: {
      markets: highOpportunity.slice(0, 3).map(opp => opp.market_name),
      strategy: 'Rapid market entry with premium positioning',
      timeline: '30-60 days',
      expected_revenue: highOpportunity.slice(0, 3).reduce((sum, opp) => sum + opp.estimated_revenue_potential, 0)
    },
    strategic_expansion: {
      markets: mediumOpportunity.slice(0, 5).map(opp => opp.market_name),
      strategy: 'Gradual expansion with cultural adaptation',
      timeline: '60-120 days',
      expected_revenue: mediumOpportunity.slice(0, 5).reduce((sum, opp) => sum + opp.estimated_revenue_potential, 0)
    },
    long_term_consideration: {
      markets: lowOpportunity.slice(0, 5).map(opp => opp.market_name),
      strategy: 'Long-term market development',
      timeline: '6-12 months',
      expected_revenue: lowOpportunity.slice(0, 5).reduce((sum, opp) => sum + opp.estimated_revenue_potential, 0)
    },
    total_global_potential: {
      markets: opportunities.length,
      estimated_revenue: opportunities.reduce((sum, opp) => sum + opp.estimated_revenue_potential, 0),
      global_reach: '4.5 billion people',
      market_coverage: 'Global'
    }
  };
}
