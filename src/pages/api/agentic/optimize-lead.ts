// Cloud-native API route for AI lead optimization

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OptimizationRequest {
  leadData: {
    id: string;
    name: string;
    niche: string;
    location: string;
    context?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadData }: OptimizationRequest = req.body;

    // Call OpenAI for lead analysis
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Analyze this lead for optimal ad strategy (like R Movers $99 success):
          
          Lead: ${JSON.stringify(leadData)}
          
          Respond with JSON: {
            "confidence": 0.85,
            "action": "deploy_urgency_sequence", 
            "urgency": 8,
            "value_prop": "cost_savings",
            "roi_expected": 2.3
          }`
        }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const aiResult = await openaiResponse.json();
    const optimization = JSON.parse(aiResult.choices[0].message.content);

    // Store optimization in Supabase
    const { data, error } = await supabase
      .from('ai_optimizations')
      .insert({
        lead_id: leadData.id,
        ai_confidence: optimization.confidence,
        recommended_action: optimization.action,
        urgency_level: optimization.urgency,
        value_proposition: optimization.value_prop,
        expected_roi: optimization.roi_expected,
        generated_content: optimization
      });

    if (error) throw error;

    res.status(200).json({
      success: true,
      optimization,
      tracking_id: data?.[0]?.id,
      message: optimization.confidence > 0.8 
        ? '🚀 High-confidence optimization ready for deployment'
        : '⚠️ Medium confidence - consider A/B testing'
    });

  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ 
      error: 'Optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
