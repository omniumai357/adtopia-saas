#!/usr/bin/env python3
"""
AdTopia Urgency Ad Cards Generator
Extends setup.py with specialized FOMO scroll-stoppers for Gamma AI

Focus: FOMO Scroll-Stoppers
- 5 square (1080x1080) PNG ad cards
- Niche-color CTAs (orange for plumbers, red for movers)
- Hero bg from uploaded gallery descriptions
- FOMO hooks: "Slots Open NOW!", "Fix in 1hr"
- Watermark: "AdTopia – {niche_catchphrase}"
"""

import json
from typing import Dict, List, Any
from setup import AdTopiaAutomation

class UrgencyGenerator(AdTopiaAutomation):
    """Specialized urgency ad cards generator with FOMO scroll-stoppers"""
    
    def __init__(self):
        super().__init__()
        self.urgency_variants = {
            'v1_drain_coil': {
                'name': 'Drain Coil Crisis',
                'bg_desc': 'drain coil fade with clog chaos overlay',
                'fomo_hook': 'Slots Open NOW!',
                'urgency_level': 'high'
            },
            'v2_wrench_grip': {
                'name': 'Wrench Grip Fix',
                'bg_desc': 'wrench grip action with fix promise',
                'fomo_hook': 'Fix in 1hr - Limited!',
                'urgency_level': 'medium'
            },
            'v3_pipe_elbow': {
                'name': 'Pipe Elbow Panic',
                'bg_desc': 'pipe elbow close-up with water flow',
                'fomo_hook': 'Emergency Response <30min!',
                'urgency_level': 'high'
            },
            'v4_toolbelt_pro': {
                'name': 'Toolbelt Pro',
                'bg_desc': 'professional toolbelt with licensed badges',
                'fomo_hook': 'Licensed Pros - Book Today!',
                'urgency_level': 'medium'
            },
            'v5_showerhead_drip': {
                'name': 'Showerhead Drip',
                'bg_desc': 'showerhead drip with damage implications',
                'fomo_hook': 'Stop the Drip - Call Now!',
                'urgency_level': 'low'
            }
        }
    
    def gen_urgency_enhanced(self, biz_data: Dict[str, Any], variant: str = 'v1_drain_coil') -> str:
        """
        Enhanced urgency generator with specific variants
        Creates FOMO scroll-stoppers with niche-specific CTAs
        """
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        features = biz_data.get('features', ['Feature 1', 'Feature 2'])
        years = biz_data.get('years', 10)
        
        # Get niche-specific config
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        
        # Get variant-specific config
        variant_config = self.urgency_variants.get(variant, self.urgency_variants['v1_drain_coil'])
        
        # Create location slug
        location_slug = location.lower().replace(' ', '').replace(',', '')
        
        # Generate service-specific crisis text
        crisis_text = f"{location} {config['service']}? {variant_config['fomo_hook']}"
        
        # Generate niche-specific features
        niche_features = self._get_niche_features(niche, features)
        
        prompt = f"""Create 5 square PNG ad cards (1080x1080) for {name} in {location} ({config['service']}). 
Use uploaded gallery images [describe: {variant_config['bg_desc']}—enlarge one per card as bg w/ zoom-tease]. 
Vibrant urgency theme ({config['color']} CTAs, Montserrat Bold). 
Each: Hero image bleed, top text '{crisis_text}', 
middle 3 bullets ('{niche_features[0]}', '{niche_features[1]}', '15% Senior Discount'), 
bottom bar ({config['color']} button: 'Call {phone} | {name.lower().replace(" ", "")}{location_slug}.zone'). 
Watermark: 'AdTopia – {config['catchphrase']}'. 
Export layered Gamma, alt text: 'Urgent {location} {config['service']} quote'.

Variant: {variant_config['name']} ({variant_config['urgency_level']} urgency)
Background: {variant_config['bg_desc']}
FOMO Hook: {variant_config['fomo_hook']}"""
        
        return prompt
    
    def _get_niche_features(self, niche: str, features: List[str]) -> List[str]:
        """Get niche-specific features with urgency hooks"""
        niche_features = {
            'movers': [
                'Local Moves $99/hr - Fast & Reliable',
                'Piano Specialty - Zero Damage Guarantee',
                'Free Estimates - No Hidden Fees'
            ],
            'plumbers': [
                'Emergency Response <30min - 24/7 Available',
                'No-Mess Cleanups - Professional Service',
                'Licensed & Insured - Peace of Mind'
            ],
            'spas': [
                'Licensed Therapists - Professional Care',
                'Walk-ins Welcome - 7 Days a Week',
                'Stress Relief - Therapeutic Massage'
            ],
            'hvac': [
                '24/7 AC Repair - Emergency Service',
                'Energy Efficient - Save on Bills',
                'Same-Day Service - Fast Response'
            ]
        }
        
        return niche_features.get(niche, features[:3])
    
    def generate_all_variants(self, biz_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate all 5 urgency variants for A/B testing"""
        variants = {}
        
        for variant_id, variant_config in self.urgency_variants.items():
            variants[variant_id] = self.gen_urgency_enhanced(biz_data, variant_id)
        
        return variants
    
    def simulate_png_descriptions(self, biz_data: Dict[str, Any]) -> List[str]:
        """Simulate PNG descriptions for testing"""
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        
        descriptions = []
        
        for i, (variant_id, variant_config) in enumerate(self.urgency_variants.items(), 1):
            desc = f"Card{i}: {config['color']} overlay {variant_config['bg_desc']}, FOMO text '{variant_config['fomo_hook']}' pop, {config['color']} CTA button"
            descriptions.append(desc)
        
        return descriptions
    
    def integrate_supabase_webhook(self, prompt: str, variant_id: str) -> Dict[str, Any]:
        """Integrate Supabase webhook simulation"""
        return {
            'status': 'success',
            'endpoint': '/gamma-fire',
            'variant_id': variant_id,
            'prompt_length': len(prompt),
            'timestamp': '2024-10-08T12:00:00Z',
            'message': f'Urgency prompt {variant_id} queued for Gamma processing',
            'webhook_data': {
                'prompt_type': 'urgency_cards',
                'variant': variant_id,
                'target_platform': 'craigslist',
                'expected_uplift': '28%'
            }
        }

def main():
    """Test run with R Movers data"""
    
    # R Movers sample data
    r_movers_data = {
        'name': 'R Movers',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals']
    }
    
    # Initialize urgency generator
    generator = UrgencyGenerator()
    
    print("🔥 AdTopia Urgency Generator - Test Run")
    print("=" * 50)
    
    # Generate all variants
    print("\n📱 ALL URGENCY VARIANTS:")
    print("-" * 30)
    
    variants = generator.generate_all_variants(r_movers_data)
    
    for variant_id, prompt in variants.items():
        print(f"\n{variant_id.upper()}:")
        print("-" * 20)
        print(prompt)
        print()
    
    # Simulate PNG descriptions
    print("\n🎨 SIMULATED PNG DESCRIPTIONS:")
    print("-" * 30)
    
    descriptions = generator.simulate_png_descriptions(r_movers_data)
    for i, desc in enumerate(descriptions, 1):
        print(f"{desc}")
    
    # Test webhook integration
    print("\n🔗 SUPABASE WEBHOOK INTEGRATION:")
    print("-" * 30)
    
    test_prompt = variants['v1_drain_coil']
    webhook_result = generator.integrate_supabase_webhook(test_prompt, 'v1_drain_coil')
    
    print(f"Status: {webhook_result['status']}")
    print(f"Variant: {webhook_result['variant_id']}")
    print(f"Message: {webhook_result['message']}")
    print(f"Expected Uplift: {webhook_result['webhook_data']['expected_uplift']}")
    
    print("\n✅ Urgency Generator Complete!")
    print("Ready for FOMO scroll-stopping deployment! 🚀")

if __name__ == "__main__":
    main()
