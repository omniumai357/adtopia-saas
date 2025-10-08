# Cloud-native AI agent for AdTopia revenue optimization

import requests
import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class LeadOptimization:
    lead_id: str
    confidence: float
    recommended_action: str
    urgency_level: int
    value_proposition: str
    gamma_prompt: str
    expected_roi: float

class AdTopiaAgent:
    """Cloud-native AI agent - no Docker, pure API calls"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not all([self.openai_api_key, self.supabase_url, self.supabase_key]):
            raise ValueError("Missing required environment variables")
    
    def analyze_lead_for_optimization(self, lead_data: Dict) -> LeadOptimization:
        """AI analyzes lead and determines optimal strategy (like R Movers $99 success)"""
        
        optimization_prompt = f"""
        Analyze this lead for optimal ad generation strategy:
        
        Lead: {json.dumps(lead_data, indent=2)}
        
        Context: We had success with R Movers ($99 conversion in Modesto) and 28% text spike for Fresno plumbers.
        
        Determine:
        1. Confidence score (0-1) for conversion potential
        2. Recommended immediate action
        3. Urgency level (1-10)
        4. Best value proposition angle
        5. Gamma prompt for ad generation
        6. Expected ROI multiplier
        
        Respond in JSON format with these exact keys:
        {{
            "confidence": 0.85,
            "recommended_action": "deploy_urgency_sequence",
            "urgency_level": 8,
            "value_proposition": "cost_savings_with_urgency",
            "gamma_prompt": "Generate urgent moving service ad for Modesto...",
            "expected_roi": 2.3
        }}
        """
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o',
                'messages': [{'role': 'user', 'content': optimization_prompt}],
                'temperature': 0.7,
                'max_tokens': 500
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.status_code}")
        
        ai_analysis = json.loads(response.json()['choices'][0]['message']['content'])
        
        return LeadOptimization(
            lead_id=lead_data.get('id', 'unknown'),
            confidence=ai_analysis['confidence'],
            recommended_action=ai_analysis['recommended_action'],
            urgency_level=ai_analysis['urgency_level'],
            value_proposition=ai_analysis['value_proposition'],
            gamma_prompt=ai_analysis['gamma_prompt'],
            expected_roi=ai_analysis['expected_roi']
        )
    
    def execute_gamma_generation(self, gamma_prompt: str) -> Dict:
        """Generate ad content via Gamma API or OpenAI"""
        
        generation_prompt = f"""
        Generate professional ad card content for this prompt:
        {gamma_prompt}
        
        Create compelling ad copy with:
        - Attention-grabbing headline
        - Value proposition
        - Call to action
        - Urgency trigger
        
        Format as JSON:
        {{
            "headline": "Your Headline Here",
            "value_prop": "Main benefit statement",
            "cta": "Call to action text",
            "urgency": "Urgency trigger text"
        }}
        """
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o',
                'messages': [{'role': 'user', 'content': generation_prompt}],
                'temperature': 0.8,
                'max_tokens': 300
            }
        )
        
        return json.loads(response.json()['choices'][0]['message']['content'])
    
    def track_performance_in_supabase(self, optimization: LeadOptimization, generated_content: Dict):
        """Track AI decisions and results in Supabase"""
        
        tracking_data = {
            'lead_id': optimization.lead_id,
            'ai_confidence': optimization.confidence,
            'recommended_action': optimization.recommended_action,
            'urgency_level': optimization.urgency_level,
            'value_proposition': optimization.value_proposition,
            'generated_content': generated_content,
            'expected_roi': optimization.expected_roi,
            'created_at': 'now()',
            'agent_version': '1.0.0'
        }
        
        response = requests.post(
            f'{self.supabase_url}/rest/v1/ai_optimizations',
            headers={
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json',
                'apikey': self.supabase_key
            },
            json=tracking_data
        )
        
        return response.status_code == 201

# Example usage: R Movers success replication
def replicate_r_movers_success():
    """Replicate the R Movers $99 success with AI optimization"""
    
    agent = AdTopiaAgent()
    
    # Simulate R Movers type lead
    rodrigo_lead = {
        'id': 'lead_rodrigo_001',
        'name': 'Rodrigo Martinez',
        'niche': 'moving_services',
        'location': 'Modesto, CA',
        'budget_mentioned': '$99',
        'urgency_indicators': ['moving next week', 'need quote asap'],
        'source': 'craigslist_reply'
    }
    
    # AI analyzes and optimizes
    optimization = agent.analyze_lead_for_optimization(rodrigo_lead)
    
    if optimization.confidence > 0.8:
        print(f"🚀 High-confidence optimization (${optimization.confidence:.2f})")
        print(f"Action: {optimization.recommended_action}")
        
        # Generate ad content
        ad_content = agent.execute_gamma_generation(optimization.gamma_prompt)
        print(f"Generated: {ad_content}")
        
        # Track in Supabase
        agent.track_performance_in_supabase(optimization, ad_content)
        
        return True
    
    return False

if __name__ == "__main__":
    success = replicate_r_movers_success()
    print(f"✅ R Movers replication: {'SUCCESS' if success else 'NEEDS_REVIEW'}")
