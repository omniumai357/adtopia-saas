#!/usr/bin/env python3
"""
AdTopia Agentic Sequences - AI-driven lead processing that learns and optimizes
Deploy your AI automation stack with Activepieces + MCP integration
"""

import asyncio
import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import openai
from supabase import create_client
import httpx
from datetime import datetime, timedelta

@dataclass
class LeadOptimization:
    lead_id: str
    niche: str
    location: str
    urgency_score: float
    value_proposition: str
    confidence: float
    recommended_action: str
    expected_roi: float
    market_opportunity: str

class AdTopiaAgenticSequence:
    """AI-driven lead processing that learns and optimizes"""
    
    def __init__(self):
        self.supabase = create_client(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.openai_client = openai.AsyncClient(api_key=os.getenv("OPENAI_API_KEY"))
        self.gamma_api_key = os.getenv("GAMMA_API_KEY")
        self.mcp_server_url = os.getenv("MCP_SERVER_URL", "http://localhost:8080")
        
        # Learning database
        self.learning_cache = {}
        self.performance_history = []
    
    async def process_lead_agentically(self, lead_data: Dict) -> LeadOptimization:
        """AI analyzes lead and determines optimal strategy"""
        
        print(f"🧠 AI analyzing lead: {lead_data.get('name', 'Unknown')} ({lead_data.get('niche', 'general')})")
        
        # Step 1: Context Analysis (like R Movers success)
        context_prompt = f"""
        Analyze this lead for optimal ad generation strategy:
        
        Lead Data: {lead_data}
        Historical Performance: {await self.get_historical_performance(lead_data.get('niche'))}
        Market Context: {await self.get_market_context(lead_data.get('location'))}
        
        Determine:
        1. Urgency level (1-10)
        2. Best value proposition angle
        3. Recommended immediate action
        4. Confidence score (0-1)
        5. Expected ROI percentage
        6. Market opportunity assessment
        
        Consider the R Movers $99 success pattern and Fresno plumber 28% text spike data.
        Focus on replicating high-conversion patterns.
        """
        
        try:
            analysis = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": context_prompt}],
                functions=[
                    {
                        "name": "optimize_lead",
                        "description": "Provide lead optimization recommendation",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "urgency_score": {"type": "number", "minimum": 1, "maximum": 10},
                                "value_proposition": {"type": "string"},
                                "recommended_action": {"type": "string"},
                                "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                                "expected_roi": {"type": "number", "minimum": 0},
                                "market_opportunity": {"type": "string"}
                            },
                            "required": ["urgency_score", "value_proposition", "recommended_action", "confidence", "expected_roi", "market_opportunity"]
                        }
                    }
                ],
                function_call={"name": "optimize_lead"}
            )
            
            optimization_data = json.loads(analysis.choices[0].message.function_call.arguments)
            
            optimization = LeadOptimization(
                lead_id=lead_data['id'],
                niche=lead_data['niche'],
                location=lead_data['location'],
                urgency_score=optimization_data['urgency_score'],
                value_proposition=optimization_data['value_proposition'],
                confidence=optimization_data['confidence'],
                recommended_action=optimization_data['recommended_action'],
                expected_roi=optimization_data['expected_roi'],
                market_opportunity=optimization_data['market_opportunity']
            )
            
            print(f"✅ AI Analysis Complete:")
            print(f"   Urgency Score: {optimization.urgency_score}/10")
            print(f"   Value Proposition: {optimization.value_proposition}")
            print(f"   Confidence: {optimization.confidence:.2f}")
            print(f"   Expected ROI: {optimization.expected_roi:.1f}%")
            
            return optimization
            
        except Exception as error:
            print(f"❌ AI analysis failed: {error}")
            # Fallback to rule-based analysis
            return self._fallback_analysis(lead_data)
    
    def _fallback_analysis(self, lead_data: Dict) -> LeadOptimization:
        """Fallback rule-based analysis when AI fails"""
        urgency_score = 7 if "Dead domain" in lead_data.get("pain_points", []) else 5
        value_prop = "cost_savings" if any("$99" in f for f in lead_data.get("features", [])) else "trust_signals"
        
        return LeadOptimization(
            lead_id=lead_data['id'],
            niche=lead_data['niche'],
            location=lead_data['location'],
            urgency_score=urgency_score,
            value_proposition=value_prop,
            confidence=0.7,
            recommended_action="deploy_standard_sequence",
            expected_roi=5000.0,
            market_opportunity="Standard market opportunity"
        )
    
    async def execute_optimization_sequence(self, optimization: LeadOptimization):
        """Execute the AI-recommended optimization sequence"""
        
        print(f"🚀 Executing optimization sequence for {optimization.lead_id}")
        print(f"   Action: {optimization.recommended_action}")
        print(f"   Confidence: {optimization.confidence:.2f}")
        
        if optimization.confidence > 0.8:
            # High confidence: Deploy immediately (like R Movers)
            print("🔥 High confidence - deploying urgency sequence")
            await self.deploy_urgency_sequence(optimization)
        elif optimization.confidence > 0.6:
            # Medium confidence: A/B test variants
            print("📊 Medium confidence - deploying A/B test sequence")
            await self.deploy_ab_test_sequence(optimization)
        else:
            # Low confidence: Gather more data first
            print("🔍 Low confidence - gathering additional context")
            await self.gather_additional_context(optimization)
    
    async def deploy_urgency_sequence(self, optimization: LeadOptimization):
        """Deploy high-urgency sequence for immediate conversion"""
        
        print(f"⚡ Deploying urgency sequence for {optimization.lead_id}")
        
        # Generate urgency-focused ad content
        urgency_content = await self.generate_urgency_content(optimization)
        
        # Deploy to Gamma platform via MCP server
        gamma_deployment = await self.deploy_to_gamma(urgency_content)
        
        # Track in Supabase for learning
        await self.track_deployment(optimization, gamma_deployment, 'urgency_sequence')
        
        # Set up follow-up automation
        await self.schedule_follow_up(optimization, delay_hours=2)
        
        print(f"✅ Urgency sequence deployed - ID: {gamma_deployment.get('id', 'unknown')}")
    
    async def deploy_ab_test_sequence(self, optimization: LeadOptimization):
        """Deploy A/B test sequence for medium confidence leads"""
        
        print(f"🧪 Deploying A/B test sequence for {optimization.lead_id}")
        
        # Generate both urgency and value variants
        urgency_content = await self.generate_urgency_content(optimization)
        value_content = await self.generate_value_content(optimization)
        
        # Deploy both variants
        urgency_deployment = await self.deploy_to_gamma(urgency_content, variant="A")
        value_deployment = await self.deploy_to_gamma(value_content, variant="B")
        
        # Track both deployments
        await self.track_deployment(optimization, urgency_deployment, 'ab_test_urgency')
        await self.track_deployment(optimization, value_deployment, 'ab_test_value')
        
        # Schedule performance comparison
        await self.schedule_ab_analysis(optimization, [urgency_deployment, value_deployment])
        
        print(f"✅ A/B test deployed - Urgency: {urgency_deployment.get('id')}, Value: {value_deployment.get('id')}")
    
    async def gather_additional_context(self, optimization: LeadOptimization):
        """Gather additional context for low confidence leads"""
        
        print(f"🔍 Gathering additional context for {optimization.lead_id}")
        
        # Research competitor landscape
        competitor_data = await self.research_competitors(optimization.location, optimization.niche)
        
        # Analyze market trends
        market_trends = await self.analyze_market_trends(optimization.niche)
        
        # Update optimization with new data
        updated_optimization = await self.refine_optimization(optimization, competitor_data, market_trends)
        
        # Re-evaluate confidence
        if updated_optimization.confidence > 0.6:
            await self.execute_optimization_sequence(updated_optimization)
        else:
            # Store for manual review
            await self.flag_for_manual_review(updated_optimization)
    
    async def generate_urgency_content(self, optimization: LeadOptimization) -> Dict:
        """Generate urgency-focused ad content"""
        
        # Call MCP server for content generation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_server_url}/api/generate-content",
                json={
                    "niche": optimization.niche,
                    "urgencyLevel": "high" if optimization.urgency_score > 7 else "medium",
                    "valueProposition": optimization.value_proposition,
                    "location": optimization.location,
                    "optimization": asdict(optimization)
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Content generation failed: {response.status_code}")
    
    async def generate_value_content(self, optimization: LeadOptimization) -> Dict:
        """Generate value-focused ad content"""
        
        # Call MCP server for value content generation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_server_url}/api/generate-value-content",
                json={
                    "niche": optimization.niche,
                    "valueProposition": optimization.value_proposition,
                    "location": optimization.location,
                    "optimization": asdict(optimization)
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Value content generation failed: {response.status_code}")
    
    async def deploy_to_gamma(self, content: Dict, variant: str = "A") -> Dict:
        """Deploy content to Gamma platform"""
        
        print(f"🎨 Deploying to Gamma platform (variant {variant})")
        
        # Call MCP server for Gamma deployment
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_server_url}/api/deploy-gamma",
                json={
                    "content": content,
                    "variant": variant,
                    "apiKey": self.gamma_api_key
                }
            )
            
            if response.status_code == 200:
                deployment = response.json()
                print(f"✅ Gamma deployment successful - URL: {deployment.get('url', 'N/A')}")
                return deployment
            else:
                raise Exception(f"Gamma deployment failed: {response.status_code}")
    
    async def track_deployment(self, optimization: LeadOptimization, deployment: Dict, sequence_type: str):
        """Track deployment in Supabase for learning"""
        
        tracking_data = {
            "lead_id": optimization.lead_id,
            "deployment_id": deployment.get("id"),
            "sequence_type": sequence_type,
            "optimization_data": asdict(optimization),
            "deployment_data": deployment,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            result = self.supabase.table("mcp_agent_sessions").insert(tracking_data).execute()
            print(f"📊 Deployment tracked in Supabase")
        except Exception as error:
            print(f"❌ Failed to track deployment: {error}")
    
    async def schedule_follow_up(self, optimization: LeadOptimization, delay_hours: int):
        """Schedule follow-up automation"""
        
        follow_up_time = datetime.now() + timedelta(hours=delay_hours)
        
        print(f"⏰ Scheduling follow-up for {follow_up_time.isoformat()}")
        
        # Store follow-up task in database
        follow_up_data = {
            "lead_id": optimization.lead_id,
            "optimization_id": optimization.lead_id,
            "follow_up_type": "performance_check",
            "scheduled_time": follow_up_time.isoformat(),
            "status": "scheduled"
        }
        
        try:
            self.supabase.table("follow_up_tasks").insert(follow_up_data).execute()
            print(f"✅ Follow-up scheduled")
        except Exception as error:
            print(f"❌ Failed to schedule follow-up: {error}")
    
    async def schedule_ab_analysis(self, optimization: LeadOptimization, deployments: List[Dict]):
        """Schedule A/B test analysis"""
        
        analysis_time = datetime.now() + timedelta(hours=24)
        
        print(f"📊 Scheduling A/B analysis for {analysis_time.isoformat()}")
        
        analysis_data = {
            "lead_id": optimization.lead_id,
            "deployments": [d.get("id") for d in deployments],
            "analysis_type": "ab_test_comparison",
            "scheduled_time": analysis_time.isoformat(),
            "status": "scheduled"
        }
        
        try:
            self.supabase.table("ab_analysis_tasks").insert(analysis_data).execute()
            print(f"✅ A/B analysis scheduled")
        except Exception as error:
            print(f"❌ Failed to schedule A/B analysis: {error}")
    
    async def learn_from_results(self, deployment_id: str):
        """AI learns from deployment results to improve future decisions"""
        
        print(f"🧠 Learning from deployment results: {deployment_id}")
        
        # Get performance data
        performance = await self.get_deployment_performance(deployment_id)
        
        if not performance:
            print(f"❌ No performance data found for {deployment_id}")
            return
        
        # Update AI learning model
        learning_prompt = f"""
        Learn from this deployment result:
        
        Original Optimization: {performance['optimization_data']}
        Actual Results: {performance['results']}
        
        What patterns can we extract to improve future optimizations?
        Update the decision-making criteria for similar leads.
        Focus on:
        1. What worked well
        2. What didn't work
        3. How to improve confidence scoring
        4. Better urgency level detection
        """
        
        try:
            learning_update = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": learning_prompt}]
            )
            
            # Store learning in knowledge base
            await self.update_knowledge_base(learning_update.choices[0].message.content, deployment_id)
            
            print(f"✅ Learning update stored")
            
        except Exception as error:
            print(f"❌ Learning update failed: {error}")
    
    async def get_historical_performance(self, niche: str) -> List[Dict]:
        """Get historical performance data for niche"""
        
        try:
            result = self.supabase.table("performance_metrics").select("*").eq("niche", niche).limit(10).execute()
            return result.data or []
        except Exception:
            return []
    
    async def get_market_context(self, location: str) -> str:
        """Get market context for location"""
        
        # Simulate market context (in production, this would call market data APIs)
        market_contexts = {
            "Modesto CA": "High competition, 28% text spike opportunity, piano specialty demand",
            "Fresno CA": "Emergency service demand, 30% AC failure rate, competitive pricing",
            "default": "Standard market conditions, moderate competition"
        }
        
        return market_contexts.get(location, market_contexts["default"])
    
    async def get_deployment_performance(self, deployment_id: str) -> Optional[Dict]:
        """Get deployment performance data"""
        
        try:
            result = self.supabase.table("performance_metrics").select("*").eq("deployment_id", deployment_id).execute()
            return result.data[0] if result.data else None
        except Exception:
            return None
    
    async def update_knowledge_base(self, learning_content: str, deployment_id: str):
        """Update AI knowledge base with learning insights"""
        
        knowledge_data = {
            "deployment_id": deployment_id,
            "learning_content": learning_content,
            "timestamp": datetime.now().isoformat(),
            "type": "performance_learning"
        }
        
        try:
            self.supabase.table("ai_knowledge_base").insert(knowledge_data).execute()
        except Exception as error:
            print(f"❌ Failed to update knowledge base: {error}")
    
    async def research_competitors(self, location: str, niche: str) -> Dict:
        """Research competitor landscape"""
        
        # Simulate competitor research (in production, this would scrape competitor data)
        return {
            "top_competitors": [f"{location} {niche.title()} Co", f"Professional {niche.title()} Services"],
            "average_pricing": 120,
            "common_pain_points": ["Slow response", "High prices", "Poor communication"],
            "market_gaps": ["Transparent pricing", "Fast response", "Quality guarantee"]
        }
    
    async def analyze_market_trends(self, niche: str) -> Dict:
        """Analyze market trends for niche"""
        
        # Simulate market trend analysis
        return {
            "trend_direction": "growing",
            "seasonal_factors": ["Summer peak", "Holiday rush"],
            "demand_indicators": ["High search volume", "Increased competition"],
            "opportunity_score": 0.8
        }
    
    async def refine_optimization(self, optimization: LeadOptimization, competitor_data: Dict, market_trends: Dict) -> LeadOptimization:
        """Refine optimization with additional context"""
        
        # Update confidence based on new data
        new_confidence = min(optimization.confidence + 0.2, 0.95)
        
        # Update expected ROI based on market trends
        new_roi = optimization.expected_roi * market_trends.get("opportunity_score", 1.0)
        
        return LeadOptimization(
            lead_id=optimization.lead_id,
            niche=optimization.niche,
            location=optimization.location,
            urgency_score=optimization.urgency_score,
            value_proposition=optimization.value_proposition,
            confidence=new_confidence,
            recommended_action=optimization.recommended_action,
            expected_roi=new_roi,
            market_opportunity=f"Refined: {market_trends.get('trend_direction', 'stable')} market"
        )
    
    async def flag_for_manual_review(self, optimization: LeadOptimization):
        """Flag lead for manual review"""
        
        print(f"🚩 Flagging {optimization.lead_id} for manual review")
        
        review_data = {
            "lead_id": optimization.lead_id,
            "optimization_data": asdict(optimization),
            "reason": "Low confidence after context gathering",
            "status": "pending_review",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            self.supabase.table("manual_review_queue").insert(review_data).execute()
            print(f"✅ Lead flagged for manual review")
        except Exception as error:
            print(f"❌ Failed to flag for review: {error}")

# Integration with your existing Python scripts
async def rodrigo_success_replication():
    """Replicate R Movers success pattern with AI optimization"""
    
    agent = AdTopiaAgenticSequence()
    
    # Simulate Rodrigo-type lead
    rodrigo_lead = {
        'id': 'rodrigo_001',
        'name': 'R Movers',
        'contact_name': 'Rodrigo',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'email': 'racoone1212@yahoo.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals'],
        'context': '$99 budget mentioned, immediate need',
        'source': 'craigslist_reply'
    }
    
    print("🔥 Replicating R Movers success pattern with AI optimization")
    print("=" * 60)
    
    # AI analyzes and optimizes
    optimization = await agent.process_lead_agentically(rodrigo_lead)
    
    if optimization.confidence > 0.9:
        print(f"🚀 High-confidence optimization: {optimization.recommended_action}")
        await agent.execute_optimization_sequence(optimization)
    else:
        print(f"📊 Medium confidence - proceeding with caution")
        await agent.execute_optimization_sequence(optimization)
    
    return optimization

async def batch_agentic_processing(leads: List[Dict]):
    """Process multiple leads with agentic AI optimization"""
    
    agent = AdTopiaAgenticSequence()
    results = []
    
    print(f"🏰 Processing {len(leads)} leads with agentic AI")
    print("=" * 60)
    
    for i, lead in enumerate(leads, 1):
        print(f"\n📋 Processing Lead {i}/{len(leads)}: {lead.get('name', 'Unknown')}")
        
        try:
            optimization = await agent.process_lead_agentically(lead)
            await agent.execute_optimization_sequence(optimization)
            results.append({"lead": lead, "optimization": optimization, "success": True})
        except Exception as error:
            print(f"❌ Failed to process lead {lead.get('id', 'unknown')}: {error}")
            results.append({"lead": lead, "error": str(error), "success": False})
    
    # Summary
    successful = sum(1 for r in results if r["success"])
    total_roi = sum(r["optimization"].expected_roi for r in results if r["success"])
    
    print(f"\n🏆 BATCH PROCESSING COMPLETE")
    print("=" * 60)
    print(f"Total Leads: {len(leads)}")
    print(f"Successful: {successful}")
    print(f"Success Rate: {(successful/len(leads)*100):.1f}%")
    print(f"Total Expected ROI: {total_roi:.1f}%")
    print(f"Average ROI per Lead: {(total_roi/successful if successful > 0 else 0):.1f}%")
    
    return results

if __name__ == "__main__":
    # Test the agentic sequence
    asyncio.run(rodrigo_success_replication())
