#!/usr/bin/env python3
"""
AdTopia Value Landing Deck Generator
Builds on setup.py with specialized trust depth + gallery upsell

Focus: Trust Depth + Gallery Upsell
- 5-slide Gamma deck (hosted .gamma.site output)
- Light bg, niche-accent green #10B981
- 12 real-job images with clickable enlargers
- Trust signals: years exp, licensed, 5-star reviews
- Upsell path: Post-quote Gold upgrade ($299)
"""

import json
from typing import Dict, List, Any
from setup import AdTopiaAutomation

class ValueGenerator(AdTopiaAutomation):
    """Specialized value landing deck generator with trust depth + gallery upsell"""
    
    def __init__(self):
        super().__init__()
        self.trust_signals = {
            'movers': {
                'badges': ['14 Yrs Trusted', 'Licensed & Insured', '5-Star Reviews', 'Piano Specialists'],
                'guarantees': ['Zero Damage Guarantee', 'On-Time Delivery', 'Free Estimates'],
                'social_proof': ['500+ Happy Families', 'Modesto Local', 'BBB A+ Rating']
            },
            'plumbers': {
                'badges': ['20 Yrs Trusted', 'Licensed & Bonded', '24/7 Emergency', 'Eco-Friendly'],
                'guarantees': ['1-Year Warranty', 'No Mess Guarantee', 'Transparent Pricing'],
                'social_proof': ['1000+ Repairs', 'Fresno Local', '5-Star Google Reviews']
            },
            'spas': {
                'badges': ['Licensed Therapists', '5-Star Reviews', 'Walk-ins Welcome', 'Gift Cards'],
                'guarantees': ['Satisfaction Guaranteed', 'Professional Care', 'Clean & Safe'],
                'social_proof': ['500+ Happy Clients', 'Local Favorite', 'Therapeutic Focus']
            },
            'hvac': {
                'badges': ['Licensed Technicians', '24/7 Service', 'Energy Efficient', 'Same-Day'],
                'guarantees': ['1-Year Warranty', 'Free Estimates', 'No Overtime Charges'],
                'social_proof': ['1000+ Installations', 'Local Experts', '5-Star Reviews']
            }
        }
    
    def gen_value_enhanced(self, biz_data: Dict[str, Any]) -> str:
        """
        Enhanced value generator with trust depth + gallery upsell
        Creates 5-slide Gamma deck with hosted .gamma.site output
        """
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        years = biz_data.get('years', 10)
        features = biz_data.get('features', ['Feature 1', 'Feature 2'])
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        website = biz_data.get('website', f"{name.lower().replace(' ', '')}.com")
        
        # Get niche-specific config
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        trust_config = self.trust_signals.get(niche, self.trust_signals['movers'])
        
        # Generate niche-specific FAQs
        faqs = self._generate_enhanced_faqs(niche)
        
        # Generate gallery descriptions
        gallery_desc = config['gallery_desc']
        
        # Generate trust badges
        badges = ', '.join(trust_config['badges'])
        
        # Generate Google Map coordinates
        coords = self._get_location_coords(location)
        
        prompt = f"""Build 5-slide Gamma deck for {name} {location} ({niche} services, transparent pricing, {years} yrs trusted). 
Light bg, green #10B981 accents. Upload/integrate 12 real-job images [{gallery_desc}—Slide 3: Clickable gallery enlarger w/ captions '{location} {config['service']} in 1hr']. 
Slide 1: Hero 'Stress-Free {niche.title()} in {location} – Free Quote 60s!' w/ form (name/phone/issue desc → Stripe 'Book Now'). 
Slide 2: Why Us grid—bullets from features + '{years} Yrs Trusted, Competitive Pricing Starts'. 
Slide 3: Gallery carousel (zooms, SEO captions '{location} {config['service']} in 1hr'). 
Slide 4: FAQs stack ({faqs}). 
Slide 5: CTA footer 'Book Now' tel {phone}/link {website} + badges ({badges}). 
Meta: 'Pro {niche} {location} | {config['service']} Experts | Free Estimates'. 
Mobile-first <2s load via Vercel tease. 
Embed Google Map ({location} coords: {coords}). 
Add upsell path: Post-quote 'Upgrade to Gold ($299: 20 custom ads + SEO audit)'."""
        
        return prompt
    
    def _generate_enhanced_faqs(self, niche: str) -> str:
        """Generate enhanced niche-specific FAQs with trust signals"""
        enhanced_faqs = {
            'movers': [
                'Long Distance? Door-to-Door CA coverage with tracking',
                'Piano Moves? Specialized equipment & padding included',
                'Weekend Rates? Same competitive pricing, no surcharges',
                'Insurance? Fully licensed & insured, zero damage guarantee',
                'Packing? Full-service or DIY options available'
            ],
            'plumbers': [
                'Weekend Rates? Same day <2hrs response, no overtime',
                'Emergency? 24/7 availability guaranteed, licensed pros',
                'Pricing? Transparent $89 diagnostic starts, no surprises',
                'Warranty? 1-year on all work, parts & labor included',
                'Licensed? Fully certified & bonded, local experts'
            ],
            'spas': [
                'Walk-ins? Welcome 7 days a week, no appointment needed',
                'Therapeutic? Licensed massage therapists, professional care',
                'Pricing? Competitive rates with packages, gift cards available',
                'Gift Cards? Available for all services, perfect gifts',
                'Parking? Free client parking available, convenient location'
            ],
            'hvac': [
                'Emergency? 24/7 AC repair available, same-day service',
                'Installation? Same-day service possible, energy efficient units',
                'Warranty? 1-year on parts & labor, satisfaction guaranteed',
                'Energy Efficient? Latest eco-friendly units, save on bills',
                'Maintenance? Annual tune-up packages, preventive care'
            ]
        }
        
        faqs = enhanced_faqs.get(niche, enhanced_faqs['movers'])
        return '\n'.join([f"- **{faq.split('?')[0]}?** {faq.split('?')[1]}" for faq in faqs])
    
    def _get_location_coords(self, location: str) -> str:
        """Get Google Map coordinates for location"""
        coords_map = {
            'Modesto CA': '37.6391,-121.0177',
            'Fresno CA': '36.7378,-119.7871',
            'Stockton CA': '37.9577,-121.2908',
            'Sacramento CA': '38.5816,-121.4944',
            'San Francisco CA': '37.7749,-122.4194',
            'Los Angeles CA': '34.0522,-118.2437'
        }
        
        return coords_map.get(location, '37.7749,-122.4194')  # Default to SF
    
    def generate_upsell_paths(self, biz_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate upsell paths for post-quote conversion"""
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        
        upsells = {
            'gold_package': f"""Post-quote upsell: "Upgrade to Gold Package ($299):
- 20 custom ad cards for all platforms
- SEO audit & keyword optimization
- Social media content pack
- Monthly performance tracking
- Priority support & consultation"
""",
            'platinum_package': f"""Premium upsell: "Go Platinum ($599):
- Everything in Gold PLUS
- Custom website design
- Google My Business optimization
- Review management system
- 6-month performance guarantee"
""",
            'enterprise_package': f"""Enterprise upsell: "Enterprise Solution ($999):
- Everything in Platinum PLUS
- Multi-location management
- Advanced analytics dashboard
- White-label options
- Dedicated account manager"
"""
        }
        
        return upsells
    
    def generate_trust_elements(self, biz_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate trust elements for the landing page"""
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        years = biz_data.get('years', 10)
        
        trust_config = self.trust_signals.get(niche, self.trust_signals['movers'])
        
        return {
            'badges': trust_config['badges'],
            'guarantees': trust_config['guarantees'],
            'social_proof': trust_config['social_proof'],
            'testimonials': [
                f"'{name} saved our move! Professional, fast, and affordable.' - Sarah M.",
                f"'{years} years of trust - they never disappoint.' - Mike R.",
                f"'Best {niche} service in town. Highly recommend!' - Jennifer L."
            ]
        }
    
    def simulate_gallery_images(self, biz_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Simulate gallery images with descriptions"""
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        
        gallery_images = []
        gallery_items = config['gallery_desc'].split(', ')
        
        for i in range(12):
            item_index = (i // 2) % len(gallery_items)
            if i % 2 == 0:  # Before images
                desc = f"Before: {gallery_items[item_index]} - {location} client"
            else:  # After images
                desc = f"After: {gallery_items[item_index]} - Completed successfully"
            
            gallery_images.append({
                'id': f'gallery_{i+1}',
                'description': desc,
                'caption': f'{location} {config["service"]} in 1hr',
                'type': 'before' if i % 2 == 0 else 'after'
            })
        
        return gallery_images

def main():
    """Test run with R Movers data"""
    
    # R Movers sample data
    r_movers_data = {
        'name': 'R Movers',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'website': 'rmoversmodesto.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals']
    }
    
    # Initialize value generator
    generator = ValueGenerator()
    
    print("🎨 AdTopia Value Generator - Test Run")
    print("=" * 50)
    
    # Generate enhanced value prompt
    print("\n📱 ENHANCED VALUE LANDING PROMPT:")
    print("-" * 30)
    
    value_prompt = generator.gen_value_enhanced(r_movers_data)
    print(value_prompt)
    
    # Generate upsell paths
    print("\n💰 UPSELL PATHS:")
    print("-" * 30)
    
    upsells = generator.generate_upsell_paths(r_movers_data)
    for package, description in upsells.items():
        print(f"\n{package.upper()}:")
        print(description)
    
    # Generate trust elements
    print("\n🛡️ TRUST ELEMENTS:")
    print("-" * 30)
    
    trust_elements = generator.generate_trust_elements(r_movers_data)
    for element_type, elements in trust_elements.items():
        print(f"\n{element_type.upper()}:")
        for element in elements:
            print(f"- {element}")
    
    # Simulate gallery images
    print("\n🖼️ SIMULATED GALLERY IMAGES:")
    print("-" * 30)
    
    gallery_images = generator.simulate_gallery_images(r_movers_data)
    for img in gallery_images:
        print(f"{img['id']}: {img['description']} - {img['caption']}")
    
    print("\n✅ Value Generator Complete!")
    print("Ready for trust depth + gallery upsell deployment! 🚀")

if __name__ == "__main__":
    main()
