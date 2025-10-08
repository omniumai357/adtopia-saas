#!/usr/bin/env python3
"""
Gamma AI Automation Scripts
Generates optimized prompts for C1 urgency cards and D2 value landings
Based on breakthrough results: +28% reply spike, +22% dwell time
"""

import json
import sys
from typing import Dict, List, Any
from datetime import datetime

class GammaPromptGenerator:
    """Generates optimized Gamma AI prompts for ad cards and landing pages"""
    
    def __init__(self):
        self.urgency_variants = {
            'drain_coil_fade': {
                'name': 'Drain Coil Fade - Clog Chaos',
                'visual_theme': 'Drain coil fade background with clog chaos overlay',
                'fomo_hook': 'Slots Open NOW!',
                'expected_uplift': 28
            },
            'wrench_drop_fix': {
                'name': 'Wrench Drop - Fix Tease', 
                'visual_theme': 'Wrench drop action shot with fix promise overlay',
                'fomo_hook': 'Fix in 1hr - Limited Slots!',
                'expected_uplift': 25
            },
            'pipe_elbow_panic': {
                'name': 'Pipe Elbow - Mid-Plumb Panic',
                'visual_theme': 'Pipe elbow close-up with panic-inducing water flow',
                'fomo_hook': 'Emergency Response <30min!',
                'expected_uplift': 30
            },
            'toolbelt_stack_pro': {
                'name': 'Toolbelt Stack - Pro Vibes',
                'visual_theme': 'Professional toolbelt with licensed/insured badges',
                'fomo_hook': 'Licensed Pros - Book Today!',
                'expected_uplift': 22
            },
            'showerhead_drip_dread': {
                'name': 'Showerhead Drip - Everyday Dread',
                'visual_theme': 'Showerhead drip with water damage implications',
                'fomo_hook': 'Stop the Drip - Call Now!',
                'expected_uplift': 20
            }
        }
    
    def generate_urgency_prompt(self, business_data: Dict[str, Any], variant: str = 'drain_coil_fade') -> str:
        """
        Generates Gamma prompt for 5 urgency ad cards.
        Based on C1 breakthrough results: +28% reply spike
        """
        name = business_data.get('name', 'Business')
        location = business_data.get('location', 'City')
        service = business_data.get('service', 'Service')
        phone = business_data.get('phone', 'XXX-XXX-XXXX')
        features = business_data.get('features', ['Feature 1', 'Feature 2'])
        emergency_response = business_data.get('emergency_response', 'Emergency Response')
        senior_discount = business_data.get('senior_discount', 15)
        
        variant_config = self.urgency_variants.get(variant, self.urgency_variants['drain_coil_fade'])
        
        prompt = f"""Create 5 square PNG ad cards (1080x1080) for {name} in {location} ({service}). 
Use uploaded gallery images [describe: {variant_config['visual_theme']}—enlarge one per card as bg w/ zoom-tease]. 
Vibrant urgency theme (orange #F97316 CTAs, Montserrat Bold). 
Each: Hero image bleed, top text '{location} {service}? {variant_config['fomo_hook']}', 
middle 3 bullets ('{features[0]}', '{features[1]}', '{senior_discount}% Senior Discount'), 
bottom bar (orange button: 'Call {phone} | {name.lower().replace(" ", "")}{location.lower().replace(" ", "")}.zone'). 
Watermark: 'AdTopia – Flow Fixed'. Water motifs amp relevance 15% (from mover lifts).
Export layered Gamma, alt text: 'Urgent {location} {service} quote'."""
        
        return prompt
    
    def generate_value_prompt(self, business_data: Dict[str, Any]) -> str:
        """
        Generates Gamma prompt for 5-slide value landing page.
        Based on D2 breakthrough results: +22% dwell time with gallery enlargers
        """
        name = business_data.get('name', 'Business')
        location = business_data.get('location', 'City')
        years = business_data.get('years', 20)
        price = business_data.get('price', '$89')
        services = business_data.get('services', ['Service 1', 'Service 2'])
        faqs = business_data.get('faqs', [('Q1?', 'A1'), ('Q2?', 'A2')])
        contact_phone = business_data.get('contact_phone', 'XXX-XXX-XXXX')
        website = business_data.get('website', 'business.com')
        
        services_str = ', '.join(services)
        faqs_str = '\n'.join([f"- **{q}?** {a}" for q, a in faqs])
        
        prompt = f"""Build 5-slide Gamma deck for {name} {location} ({services_str}, transparent {price} starts, {years} yrs trusted). 
Light bg, green #10B981 accents. Upload/integrate 12 real-job images [faucet fixes, pipe snakes—Slide 3: Clickable gallery enlarger w/ captions '{location} Fix in 1hr']. 
Slide 1: Hero 'Stress-Free {services_str} – Free Quote 60s!' w/ form (name/phone/desc). 
Slide 2: Why Us? ('{services[0]}', '{services[1]}'). 
Slide 3: Gallery (before/after zooms). 
Slide 4: FAQs ({faqs_str}). 
Slide 5: CTA 'Book Now' to call {contact_phone}/site {website}. 
Hosted URL, PDF export. Mobile <2s load, meta "{location} Plumbing Experts | Drain Leak Fixes | Free Quotes"—top SERP bait."""
        
        return prompt
    
    def generate_outreach_email(self, business_data: Dict[str, Any], variant: str = 'A') -> str:
        """
        Generates email template for outreach, A: Urgency sub, B: Value.
        Based on A/B test results: 20% open rate tracking
        """
        name = business_data.get('name', 'Hustler')
        biz = business_data.get('biz', 'Your Biz')
        email = business_data.get('email', 'your@email.com')
        
        if variant == 'A':  # Urgency
            subject = f"{name} – Upgrade Your {biz} Ad to Crush Competition (Free Pro Attached)"
            body = f"""Hey {name}, 

Spotted your {biz} post—love the grind, but slots fill fast. 

Attached: Optimized ad (SEO'd for top spots) + site preview. Post AM—replies flood. 

Reply 'YES' for full pack. Text questions.

Brother to Brother,
[Your Name] | AdTopia

P.S. 20% open track."""
        else:  # B Value
            subject = f"{name} – Pro Polish for {biz}: 10x Bookings from Buried Posts (Free Upgrade)"
            body = f"""Hey {name}, 

Your {biz} hustle's gold—let's stack value: 

Attached pro ad + hosted site w/ reviews/gallery. From $5 posts to flooded quotes. 

Reply 'YES' for deeper funnel. No risk.

Brother,
[Your Name] | AdTopia

P.S. Trust badges amp closes 15%."""
        
        return f"Subject: {subject}\nTo: {email}\nBody: {body}"
    
    def generate_utm_parameters(self, variant_id: str, campaign: str = 'c1_urgency') -> str:
        """Generate UTM parameters for tracking"""
        return f"?utm_source=craigslist&utm_medium=ad_card&utm_campaign={campaign}&utm_content={variant_id}&utm_term=urgency_fomo"
    
    def save_prompt_to_file(self, prompt: str, filename: str) -> None:
        """Save generated prompt to file for easy copy-paste"""
        with open(filename, 'w') as f:
            f.write(prompt)
        print(f"Prompt saved to {filename}")

def main():
    """Main function to run the prompt generator"""
    generator = GammaPromptGenerator()
    
    # Sample business data for testing
    sample_business = {
        'name': 'CoolFix Plumbing',
        'location': 'Fresno CA',
        'service': 'Drains Clogged',
        'phone': '559-XXX-XXXX',
        'features': ['Emergency Response <30min', 'No-Mess Cleanups Free'],
        'emergency_response': '24/7 Emergency',
        'senior_discount': 15,
        'years': 20,
        'price': '$89',
        'services': ['24/7 Emergencies', 'Eco-Friendly Parts'],
        'faqs': [('Weekend Rates?', 'Same rates'), ('Same-day?', '<2hrs')],
        'contact_phone': '559-123-4567',
        'website': 'coolfixfresno.com'
    }
    
    # Generate prompts
    urgency_prompt = generator.generate_urgency_prompt(sample_business, 'drain_coil_fade')
    value_prompt = generator.generate_value_prompt(sample_business)
    outreach_a = generator.generate_outreach_email(sample_business, 'A')
    outreach_b = generator.generate_outreach_email(sample_business, 'B')
    
    # Save to files
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    generator.save_prompt_to_file(urgency_prompt, f'c1_urgency_prompt_{timestamp}.txt')
    generator.save_prompt_to_file(value_prompt, f'd2_value_prompt_{timestamp}.txt')
    generator.save_prompt_to_file(outreach_a, f'outreach_urgency_{timestamp}.txt')
    generator.save_prompt_to_file(outreach_b, f'outreach_value_{timestamp}.txt')
    
    print("All prompts generated successfully!")
    print(f"UTM parameters: {generator.generate_utm_parameters('c1_drain_coil_fade')}")

if __name__ == "__main__":
    main()
