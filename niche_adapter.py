#!/usr/bin/env python3
"""
AdTopia Niche Adapter + ROI Calculator
Chains to niche_adapter.py with movers → plumbers → spas pivot

Focus: Movers → Plumbers → Spas Pivot
- Dynamic template swapping between niches
- Auto-generate features/bullets from pain_points
- ROI calculator with buried spend calculations
- JSON output for Zapier integration
"""

import json
from typing import Dict, List, Any
from setup import AdTopiaAutomation

class NicheAdapter(AdTopiaAutomation):
    """Specialized niche adapter with dynamic template swapping and ROI calculator"""
    
    def __init__(self):
        super().__init__()
        self.niche_transformations = {
            'movers': {
                'base_service': 'Moves Needed',
                'base_features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
                'base_catchphrase': 'Moves Made',
                'base_color': '#EF4444'
            },
            'plumbers': {
                'service': 'Drains/Leaks',
                'features': ['<30min Emer', 'No-Mess Free', 'Licensed & Insured'],
                'catchphrase': 'Flow Fixed',
                'color': '#F97316',
                'gallery_desc': 'drain snakes, pipe fixes, wrench work',
                'crisis': 'Plumbing Crisis'
            },
            'spas': {
                'service': 'Relax Sessions',
                'features': ['$59 Slots', 'Hot Stone Special', 'Licensed Therapists'],
                'catchphrase': 'Zen Unlocked',
                'color': '#A855F7',
                'gallery_desc': 'relaxing rooms, massage tables, happy clients',
                'crisis': 'Stress Crisis'
            },
            'hvac': {
                'service': 'AC Broken',
                'features': ['24/7 Emergency', 'Energy Efficient', 'Same-Day Service'],
                'catchphrase': 'Cool Delivered',
                'color': '#06B6D4',
                'gallery_desc': 'AC units, duct work, thermostat fixes',
                'crisis': 'Heat Crisis'
            }
        }
        
        self.pain_point_solutions = {
            'dead domain': 'Host live site',
            'no keywords': 'SEO optimization',
            'poor visuals': 'Professional gallery',
            'no reviews': 'Review management',
            'high competition': 'Unique positioning',
            'low conversion': 'Trust signals',
            'no mobile': 'Mobile optimization',
            'slow response': '24/7 availability'
        }
    
    def adapt_niche(self, biz_data: Dict[str, Any], target_niche: str) -> Dict[str, Any]:
        """
        Adapt business data to target niche with dynamic template swapping
        """
        # Get base data
        name = biz_data.get('name', 'Business')
        location = biz_data.get('location', 'City')
        years = biz_data.get('years', 10)
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        email = biz_data.get('email', 'contact@email.com')
        pain_points = biz_data.get('pain_points', [])
        
        # Get target niche config
        target_config = self.niche_transformations.get(target_niche, self.niche_transformations['movers'])
        
        # Transform business name for new niche
        adapted_name = self._adapt_business_name(name, target_niche)
        
        # Generate features from pain points
        adapted_features = self._generate_features_from_pain_points(pain_points, target_niche)
        
        # Create adapted business data
        adapted_data = {
            'name': adapted_name,
            'niche': target_niche,
            'location': location,
            'years': years,
            'phone': phone,
            'email': email,
            'service': target_config['service'],
            'features': adapted_features,
            'catchphrase': target_config['catchphrase'],
            'color': target_config['color'],
            'gallery_desc': target_config.get('gallery_desc', 'professional work'),
            'crisis': target_config.get('crisis', 'Service Crisis'),
            'pain_points': pain_points,
            'original_name': name,
            'adaptation_notes': f"Adapted from {biz_data.get('niche', 'movers')} to {target_niche}"
        }
        
        return adapted_data
    
    def _adapt_business_name(self, original_name: str, target_niche: str) -> str:
        """Adapt business name to new niche"""
        name_adaptations = {
            'plumbers': {
                'R Movers': 'CoolFix Plumbing',
                'Movers': 'Flow Masters',
                'Moving': 'Pipe Pros'
            },
            'spas': {
                'R Movers': 'Lucky Spa',
                'Movers': 'Zen Retreat',
                'Moving': 'Serenity Spa'
            },
            'hvac': {
                'R Movers': 'CoolBreeze HVAC',
                'Movers': 'Air Masters',
                'Moving': 'Climate Control'
            }
        }
        
        adaptations = name_adaptations.get(target_niche, {})
        
        for original, adapted in adaptations.items():
            if original in original_name:
                return adapted
        
        # Default adaptation
        return f"{original_name} {target_niche.title()}"
    
    def _generate_features_from_pain_points(self, pain_points: List[str], target_niche: str) -> List[str]:
        """Generate features from pain points with niche-specific solutions"""
        target_config = self.niche_transformations.get(target_niche, self.niche_transformations['movers'])
        base_features = target_config['features']
        
        adapted_features = []
        
        # Add base features
        adapted_features.extend(base_features)
        
        # Add pain point solutions
        for pain_point in pain_points:
            pain_lower = pain_point.lower()
            for pain_key, solution in self.pain_point_solutions.items():
                if pain_key in pain_lower:
                    adapted_features.append(solution)
                    break
        
        # Ensure we have at least 3 features
        while len(adapted_features) < 3:
            adapted_features.append(f"Professional {target_niche} Service")
        
        return adapted_features[:5]  # Limit to 5 features
    
    def calc_roi(self, buried_spend: int = 150, uplift: int = 10) -> Dict[str, Any]:
        """
        Calculate ROI with buried spend and uplift multiplier
        """
        # Calculate monthly bookings
        avg_booking_value = 99  # $99 average booking
        monthly_bookings = buried_spend * uplift // avg_booking_value
        
        # Calculate revenue
        monthly_revenue = monthly_bookings * avg_booking_value
        monthly_roi = monthly_revenue - buried_spend
        
        # Calculate ARR tease
        arr_tease = "$600K path: 70% entry bite → 20% recurring"
        
        return {
            'buried_spend': buried_spend,
            'uplift_multiplier': uplift,
            'monthly_bookings': monthly_bookings,
            'monthly_revenue': monthly_revenue,
            'monthly_roi': monthly_roi,
            'roi_percentage': (monthly_roi / buried_spend) * 100,
            'arr_tease': arr_tease,
            'first_client_covers': f"First ${avg_booking_value} win covers pack"
        }
    
    def generate_all_prompts(self, adapted_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate all 3 prompt types for adapted niche"""
        from gen_urgency import UrgencyGenerator
        from gen_value import ValueGenerator
        from gen_outreach import OutreachGenerator
        
        # Initialize generators
        urgency_gen = UrgencyGenerator()
        value_gen = ValueGenerator()
        outreach_gen = OutreachGenerator()
        
        # Generate prompts
        urgency_prompt = urgency_gen.gen_urgency_enhanced(adapted_data, 'v1_drain_coil')
        value_prompt = value_gen.gen_value_enhanced(adapted_data)
        outreach_prompt = outreach_gen.gen_outreach_enhanced(adapted_data, 'A')
        
        return {
            'urgency': urgency_prompt,
            'value': value_prompt,
            'outreach': outreach_prompt
        }
    
    def generate_zapier_output(self, adapted_data: Dict[str, Any], prompts: Dict[str, str]) -> Dict[str, Any]:
        """Generate JSON output for Zapier integration"""
        name = adapted_data['name']
        location = adapted_data['location']
        niche = adapted_data['niche']
        
        # Generate host URL
        host_url = f"{name.lower().replace(' ', '')}{location.lower().replace(' ', '').replace(',', '')}.gamma.site"
        
        return {
            'prompts': [
                prompts['urgency'],
                prompts['value'],
                prompts['outreach']
            ],
            'host_url': host_url,
            'business_data': adapted_data,
            'roi_data': self.calc_roi(),
            'generation_timestamp': '2024-10-08T12:00:00Z',
            'zapier_ready': True
        }
    
    def test_adaptation_chain(self, original_data: Dict[str, Any], target_niche: str) -> Dict[str, Any]:
        """Test complete adaptation chain from input to Zapier output"""
        # Step 1: Adapt niche
        adapted_data = self.adapt_niche(original_data, target_niche)
        
        # Step 2: Generate all prompts
        prompts = self.generate_all_prompts(adapted_data)
        
        # Step 3: Calculate ROI
        roi_data = self.calc_roi()
        
        # Step 4: Generate Zapier output
        zapier_output = self.generate_zapier_output(adapted_data, prompts)
        
        return {
            'original_data': original_data,
            'adapted_data': adapted_data,
            'prompts': prompts,
            'roi_data': roi_data,
            'zapier_output': zapier_output,
            'adaptation_success': True
        }

def main():
    """Test run with R Movers → CoolFix Plumbers adaptation"""
    
    # R Movers sample data (from PDF extract)
    r_movers_data = {
        'name': 'R Movers',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'email': 'racoone1212@yahoo.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals']
    }
    
    # Initialize niche adapter
    adapter = NicheAdapter()
    
    print("🔄 AdTopia Niche Adapter - Test Run")
    print("=" * 50)
    
    # Test adaptation chain: R Movers → CoolFix Plumbers
    print("\n🔄 ADAPTATION CHAIN: R Movers → CoolFix Plumbers")
    print("-" * 30)
    
    adaptation_result = adapter.test_adaptation_chain(r_movers_data, 'plumbers')
    
    print("Original Data:")
    print(json.dumps(adaptation_result['original_data'], indent=2))
    
    print("\nAdapted Data:")
    print(json.dumps(adaptation_result['adapted_data'], indent=2))
    
    print("\nROI Data:")
    print(json.dumps(adaptation_result['roi_data'], indent=2))
    
    print("\nZapier Output:")
    print(json.dumps(adaptation_result['zapier_output'], indent=2))
    
    # Test multiple niche adaptations
    print("\n🔄 MULTIPLE NICHE ADAPTATIONS:")
    print("-" * 30)
    
    niches_to_test = ['plumbers', 'spas', 'hvac']
    
    for niche in niches_to_test:
        print(f"\n{niche.upper()} ADAPTATION:")
        adapted = adapter.adapt_niche(r_movers_data, niche)
        print(f"Name: {adapted['name']}")
        print(f"Service: {adapted['service']}")
        print(f"Features: {adapted['features']}")
        print(f"Catchphrase: {adapted['catchphrase']}")
        print(f"Color: {adapted['color']}")
    
    # Test ROI calculator
    print("\n💰 ROI CALCULATOR TEST:")
    print("-" * 30)
    
    roi_data = adapter.calc_roi(buried_spend=150, uplift=10)
    print(f"Monthly Bookings: {roi_data['monthly_bookings']}")
    print(f"Monthly Revenue: ${roi_data['monthly_revenue']}")
    print(f"Monthly ROI: ${roi_data['monthly_roi']}")
    print(f"ROI Percentage: {roi_data['roi_percentage']:.1f}%")
    print(f"ARR Tease: {roi_data['arr_tease']}")
    print(f"First Client Covers: {roi_data['first_client_covers']}")
    
    print("\n✅ Niche Adapter Complete!")
    print("Ready for movers → plumbers → spas pivot deployment! 🚀")

if __name__ == "__main__":
    main()
