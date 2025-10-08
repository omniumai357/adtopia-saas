// AI content generation endpoint

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, niche, urgency_level } = req.body;

    const generationPrompt = `
    Generate ad card content for ${niche} with urgency level ${urgency_level}/10:
    ${prompt}
    
    Create JSON format:
    {
      "headline": "Compelling headline",
      "value_prop": "Main benefit", 
      "cta": "Call to action",
      "urgency": "Urgency trigger"
    }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: generationPrompt }],
        temperature: 0.8,
        max_tokens: 400
      })
    });

    const aiResult = await response.json();
    const content = JSON.parse(aiResult.choices[0].message.content);

    res.status(200).json({
      success: true,
      content,
      generated_at: new Date().toISOString(),
      model: 'gpt-4o'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
