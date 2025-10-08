#!/usr/bin/env python3
"""
AdTopia Automation Pipeline
Transforms unoptimized Craigslist/FB ads into SEO/FOMO beasts via Gamma AI prompts

Core Flow:
1. Ingest biz lead JSON
2. Generate 3 prompt types: Urgency cards, Value landing, Outreach emails
3. Output prompt strings for Gamma copy-paste + Python exporter
4. ROI calculator: $5/day buried ads → 10x bookings uplift

Author: AdTopia AI
Version: 1.0
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime

class AdTopiaAutomation:
    """Main automation pipeline for AdTopia hustle-hero tool"""
    
    def __init__(self):
        self.niche_configs = {
            'movers': {
                'color': '#EF4444',  # Red
                'catchphrase': 'Moves Made',
                'service': 'Moves Needed',
                'crisis': 'Moving Crisis',
                'gallery_desc': 'truck loads, piano wraps, family unloads'
            },
            'plumbers': {
                'color': '#F97316',  # Orange
                'catchphrase': 'Flow Fixed',
                'service': 'Drains Clogged',
                'crisis': 'Plumbing Crisis',
                'gallery_desc': 'drain snakes, pipe fixes, wrench work'
            },
            'spas': {
                'color': '#8B5CF6',  # Purple
                'catchphrase': 'Stress Melted',
                'service': 'Massage Needed',
                'crisis': 'Stress Crisis',
                'gallery_desc': 'relaxing rooms, massage tables, happy clients'
            },
            'hvac': {
                'color': '#06B6D4',  # Cyan
                'catchphrase': 'Cool Delivered',
                'service': 'AC Broken',
                'crisis': 'Heat Crisis',
                'gallery_desc': 'AC units, duct work, thermostat fixes'
            }
        }
    
    def gen_urgency(self, biz_data: Dict[str, Any]) -> str:
        """
        Generate urgency ad cards prompt for Gamma AI
        Creates 5 square (1080x1080) PNG ad cards with FOMO scroll-stoppers
        """
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        features = biz_data.get('features', ['Feature 1', 'Feature 2'])
        years = biz_data.get('years', 10)
        
        # Get niche-specific config
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        
        # Create location slug
        location_slug = location.lower().replace(' ', '').replace(',', '')
        
        # Generate 5 variants
        variants = [
            f"V1: {config['gallery_desc'].split(',')[0]} bg with {config['crisis']} overlay",
            f"V2: {config['gallery_desc'].split(',')[1]} bg with emergency response",
            f"V3: {config['gallery_desc'].split(',')[2]} bg with urgency hooks",
            f"V4: Professional tools bg with trust signals",
            f"V5: Before/after bg with results promise"
        ]
        
        prompt = f"""Create 5 square PNG ad cards (1080x1080) for {name} in {location} ({config['service']}). 
Use uploaded gallery images [describe: {config['gallery_desc']}—enlarge one per card as bg w/ zoom-tease]. 
Vibrant urgency theme ({config['color']} CTAs, Montserrat Bold). 
Each: Hero image bleed, top text '{location} {config['service']}? Fix in 1hr – Slots Open NOW!', 
middle 3 bullets ('{features[0]}', '{features[1]}', '15% Senior Discount'), 
bottom bar ({config['color']} button: 'Call {phone} | {name.lower().replace(" ", "")}{location_slug}.zone'). 
Watermark: 'AdTopia – {config['catchphrase']}'. 
Export layered Gamma, alt text: 'Urgent {location} {config['service']} quote'.

Variants: {', '.join(variants)}"""
        
        return prompt
    
    def gen_value(self, biz_data: Dict[str, Any]) -> str:
        """
        Generate value landing deck prompt for Gamma AI
        Creates 5-slide Gamma deck with trust depth + gallery upsell
        """
        name = biz_data.get('name', 'Business')
        niche = biz_data.get('niche', 'general')
        location = biz_data.get('location', 'City')
        years = biz_data.get('years', 10)
        features = biz_data.get('features', ['Feature 1', 'Feature 2'])
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        
        # Get niche-specific config
        config = self.niche_configs.get(niche, self.niche_configs['movers'])
        
        # Generate niche-specific FAQs
        faqs = self._generate_faqs(niche)
        
        # Generate gallery descriptions
        gallery_desc = config['gallery_desc']
        
        prompt = f"""Build 5-slide Gamma deck for {name} {location} ({niche} services, transparent pricing, {years} yrs trusted). 
Light bg, green #10B981 accents. Upload/integrate 12 real-job images [{gallery_desc}—Slide 3: Clickable gallery enlarger w/ captions '{location} {config['service']} in 1hr']. 
Slide 1: Hero 'Stress-Free {niche.title()} in {location} – Free Quote 60s!' w/ form (name/phone/issue desc → Stripe 'Book Now'). 
Slide 2: Why Us grid—bullets from features + '{years} Yrs Trusted, Competitive Pricing Starts'. 
Slide 3: Gallery carousel (zooms, SEO captions '{location} {config['service']} in 1hr'). 
Slide 4: FAQs stack ({faqs}). 
Slide 5: CTA footer 'Book Now' tel {phone}/link + badges ({years} yrs exp, licensed, 5-star pull). 
Meta: 'Pro {niche} {location} | {config['service']} Experts | Free Estimates'. 
Mobile-first <2s load via Vercel tease. 
Embed Google Map ({location} coords). 
Add upsell path: Post-quote 'Upgrade to Gold ($299: 20 custom ads + SEO audit)'."""
        
        return prompt
    
    def gen_outreach(self, biz_data: Dict[str, Any], variant: str = 'A') -> str:
        """
        Generate outreach email prompt
        A: Urgency subject, B: Value subject
        """
        name = biz_data.get('name', 'Hustler')
        biz = biz_data.get('name', 'Your Biz')
        email = biz_data.get('email', 'your@email.com')
        niche = biz_data.get('niche', 'service')
        
        if variant == 'A':  # Urgency
            subject = f"{name} – Upgrade Your {biz} Ad to Crush Competition (Free Pro Attached)"
            body = f"""Hey {name}, 

Spotted your {biz} {niche} post—love the grind, but slots fill fast. 

Attached: Optimized ad (SEO'd for top spots) + site preview. Post AM—replies flood. 

Reply 'YES' for full pack. Text questions.

Brother to Brother,
[Your Name] | AdTopia

P.S. 20% open track."""
        else:  # B Value
            subject = f"{name} – Pro Polish for {biz}: 10x Bookings from Buried Posts (Free Upgrade)"
            body = f"""Hey {name}, 

Your {biz} {niche} hustle's gold—let's stack value: 

Attached pro ad + hosted site w/ reviews/gallery. From $5 posts to flooded quotes. 

Reply 'YES' for deeper funnel. No risk.

Brother,
[Your Name] | AdTopia

P.S. Trust badges amp closes 15%."""
        
        return f"Subject: {subject}\nTo: {email}\nBody: {body}"
    
    def _generate_faqs(self, niche: str) -> str:
        """Generate niche-specific FAQs"""
        faq_templates = {
            'movers': [
                'Long Distance? Door-to-Door CA coverage',
                'Piano Moves? Specialized equipment & padding',
                'Weekend Rates? Same competitive pricing',
                'Insurance? Fully licensed & insured',
                'Packing? Full-service or DIY options'
            ],
            'plumbers': [
                'Weekend Rates? Same day <2hrs response',
                'Emergency? 24/7 availability guaranteed',
                'Pricing? Transparent $89 diagnostic starts',
                'Warranty? 1-year on all work',
                'Licensed? Fully certified & bonded'
            ],
            'spas': [
                'Walk-ins? Welcome 7 days a week',
                'Therapeutic? Licensed massage therapists',
                'Pricing? Competitive rates with packages',
                'Gift Cards? Available for all services',
                'Parking? Free client parking available'
            ],
            'hvac': [
                'Emergency? 24/7 AC repair available',
                'Installation? Same-day service possible',
                'Warranty? 1-year on parts & labor',
                'Energy Efficient? Latest eco-friendly units',
                'Maintenance? Annual tune-up packages'
            ]
        }
        
        faqs = faq_templates.get(niche, faq_templates['movers'])
        return '\n'.join([f"- **{faq.split('?')[0]}?** {faq.split('?')[1]}" for faq in faqs])
    
    def calculate_roi(self, biz_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ROI Calculator: Input buried ad spend ($5/day) → Output bookings uplift (10x via optimized stack)
        """
        daily_spend = 5  # $5/day buried ads
        monthly_spend = daily_spend * 30  # $150/month
        
        # Optimized stack improvements
        visibility_boost = 10  # 10x visibility
        conversion_boost = 3   # 3x conversion rate
        price_premium = 1.5    # 1.5x price premium
        
        # Calculate uplift
        monthly_bookings_buried = 2  # Typical buried ad bookings
        monthly_bookings_optimized = monthly_bookings_buried * visibility_boost * conversion_boost
        
        # Revenue calculation
        avg_booking_value = 200  # Average booking value
        monthly_revenue_buried = monthly_bookings_buried * avg_booking_value
        monthly_revenue_optimized = monthly_bookings_optimized * avg_booking_value * price_premium
        
        # ROI calculation
        monthly_roi = monthly_revenue_optimized - monthly_revenue_buried
        roi_percentage = (monthly_roi / monthly_spend) * 100
        
        return {
            'monthly_spend': monthly_spend,
            'bookings_buried': monthly_bookings_buried,
            'bookings_optimized': monthly_bookings_optimized,
            'revenue_buried': monthly_revenue_buried,
            'revenue_optimized': monthly_revenue_optimized,
            'monthly_roi': monthly_roi,
            'roi_percentage': roi_percentage,
            'uplift_multiplier': monthly_bookings_optimized / monthly_bookings_buried
        }
    
    def simulate_webhook(self, prompt: str, endpoint: str = '/gamma-fire') -> Dict[str, Any]:
        """Simulate webhook POST to Supabase endpoint"""
        # In production, this would make actual HTTP request
        return {
            'status': 'success',
            'endpoint': endpoint,
            'timestamp': datetime.now().isoformat(),
            'prompt_length': len(prompt),
            'message': 'Prompt queued for Gamma processing'
        }
    
    def export_prompts(self, biz_data: Dict[str, Any], output_dir: str = './output') -> Dict[str, str]:
        """Export all prompts to files for easy copy-paste"""
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate all prompts
        urgency_prompt = self.gen_urgency(biz_data)
        value_prompt = self.gen_value(biz_data)
        outreach_a = self.gen_outreach(biz_data, 'A')
        outreach_b = self.gen_outreach(biz_data, 'B')
        
        # Save to files
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        files = {
            'urgency': f'{output_dir}/urgency_prompt_{timestamp}.txt',
            'value': f'{output_dir}/value_prompt_{timestamp}.txt',
            'outreach_a': f'{output_dir}/outreach_urgency_{timestamp}.txt',
            'outreach_b': f'{output_dir}/outreach_value_{timestamp}.txt'
        }
        
        with open(files['urgency'], 'w') as f:
            f.write(urgency_prompt)
        with open(files['value'], 'w') as f:
            f.write(value_prompt)
        with open(files['outreach_a'], 'w') as f:
            f.write(outreach_a)
        with open(files['outreach_b'], 'w') as f:
            f.write(outreach_b)
        
        return files

def main():
    """Test run with R Movers sample data"""
    
    # Sample R Movers data from PDF extract
    r_movers_data = {
        'name': 'R Movers',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'email': 'Racoone1212@yahoo.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals'],
        'gallery': ['truck loads', 'piano wraps', 'family unloads', 'packing supplies']
    }
    
    # Initialize automation
    automation = AdTopiaAutomation()
    
    print("🔥 AdTopia Automation Pipeline - Test Run")
    print("=" * 50)
    
    # Generate all prompts
    print("\n📱 URGENCY AD CARDS PROMPT:")
    print("-" * 30)
    urgency_prompt = automation.gen_urgency(r_movers_data)
    print(urgency_prompt)
    
    print("\n🎨 VALUE LANDING DECK PROMPT:")
    print("-" * 30)
    value_prompt = automation.gen_value(r_movers_data)
    print(value_prompt)
    
    print("\n📧 OUTREACH EMAIL A (URGENCY):")
    print("-" * 30)
    outreach_a = automation.gen_outreach(r_movers_data, 'A')
    print(outreach_a)
    
    print("\n📧 OUTREACH EMAIL B (VALUE):")
    print("-" * 30)
    outreach_b = automation.gen_outreach(r_movers_data, 'B')
    print(outreach_b)
    
    # Calculate ROI
    print("\n💰 ROI CALCULATION:")
    print("-" * 30)
    roi = automation.calculate_roi(r_movers_data)
    print(f"Monthly Spend: ${roi['monthly_spend']}")
    print(f"Bookings (Buried): {roi['bookings_buried']}")
    print(f"Bookings (Optimized): {roi['bookings_optimized']}")
    print(f"Revenue (Buried): ${roi['revenue_buried']}")
    print(f"Revenue (Optimized): ${roi['revenue_optimized']}")
    print(f"Monthly ROI: ${roi['monthly_roi']}")
    print(f"ROI Percentage: {roi['roi_percentage']:.1f}%")
    print(f"Uplift Multiplier: {roi['uplift_multiplier']:.1f}x")
    
    # Export prompts
    print("\n💾 EXPORTING PROMPTS:")
    print("-" * 30)
    files = automation.export_prompts(r_movers_data)
    for prompt_type, filepath in files.items():
        print(f"{prompt_type.upper()}: {filepath}")
    
    # Simulate webhook
    print("\n🔗 WEBHOOK SIMULATION:")
    print("-" * 30)
    webhook_result = automation.simulate_webhook(urgency_prompt)
    print(f"Status: {webhook_result['status']}")
    print(f"Endpoint: {webhook_result['endpoint']}")
    print(f"Message: {webhook_result['message']}")
    
    print("\n✅ AdTopia Automation Pipeline Complete!")
    print("Ready for Gamma AI copy-paste deployment! 🚀")

if __name__ == "__main__":
    main()
