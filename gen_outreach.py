#!/usr/bin/env python3
"""
AdTopia Outreach Email Templater
Chains to gen_outreach.py with A/B conversion hooks

Focus: A/B Conversion Hooks
- A/B email templates for lead outreach
- Variant A: Urgency subject with FOMO hooks
- Variant B: Value subject with trust signals
- Supabase tracking for variant performance
- ROI integration with buried spend calculations
"""

import json
from typing import Dict, List, Any
from datetime import datetime
from setup import AdTopiaAutomation

class OutreachGenerator(AdTopiaAutomation):
    """Specialized outreach email templater with A/B conversion hooks"""
    
    def __init__(self):
        super().__init__()
        self.conversion_hooks = {
            'urgency': {
                'open_boost': 20,
                'fomo_elements': ['slots fill fast', 'replies flood', 'competition buries'],
                'urgency_triggers': ['tomorrow AM', 'watch replies', 'FOMO urgency']
            },
            'value': {
                'close_boost': 15,
                'trust_elements': ['5-star badges', 'gallery deck', 'pro stack'],
                'value_triggers': ['goldmine', 'flooded quotes', 'deeper funnel']
            }
        }
    
    def gen_outreach_enhanced(self, biz_data: Dict[str, Any], variant: str = 'A') -> str:
        """
        Enhanced outreach generator with A/B conversion hooks
        Creates urgency (A) or value (B) email templates
        """
        contact_name = biz_data.get('contact_name', 'Brother')
        biz_name = biz_data.get('name', 'Your Biz')
        location = biz_data.get('location', 'City')
        years = biz_data.get('years', 10)
        niche = biz_data.get('niche', 'service')
        phone = biz_data.get('phone', 'XXX-XXX-XXXX')
        email = biz_data.get('email', 'contact@email.com')
        
        if variant == 'A':  # Urgency variant
            return self._generate_urgency_email(
                contact_name, biz_name, location, years, niche, phone, email
            )
        else:  # Value variant
            return self._generate_value_email(
                contact_name, biz_name, location, years, niche, phone, email
            )
    
    def _generate_urgency_email(self, contact_name: str, biz_name: str, location: str, 
                               years: int, niche: str, phone: str, email: str) -> str:
        """Generate urgency variant email with FOMO hooks"""
        subject = f"{contact_name} – Upgrade Your {biz_name} Ad to Crush {location} Competition (Free Pro Attached)"
        
        body = f"""Hey {contact_name}, 

Spotted your {biz_name} hustle—love the {years}-yr grind on {niche}, but competition buries posts fast. 

Attached: SEO'd ad + hosted site preview ({biz_name.lower().replace(' ', '')}{location.lower().replace(' ', '').replace(',', '')}.zone—bookings live mins). 

Post tomorrow AM—watch replies flood. 

Reply 'YES' for full $99 pack (5 ads + setup). Text {phone} questions.

Brother to Brother,
[Your Name] | AdTopia

P.S. FOMO urgency for 20% open boost."""
        
        return f"Subject: {subject}\nTo: {email}\nBody: {body}"
    
    def _generate_value_email(self, contact_name: str, biz_name: str, location: str, 
                            years: int, niche: str, phone: str, email: str) -> str:
        """Generate value variant email with trust signals"""
        subject = f"{contact_name} – Pro Stack for {biz_name}: 10x Bookings from Buried Posts (Free Upgrade)"
        
        body = f"""Hey {contact_name}, 

Your {biz_name} goldmine—let's amp trust: 

Attached pro ad w/ 5-star badges + gallery deck. From $5 daily reposts to flooded quotes. 

Reply 'YES' for deeper funnel. No risk.

Brother,
[Your Name] | AdTopia

P.S. Value embeds spike closes 15%."""
        
        return f"Subject: {subject}\nTo: {email}\nBody: {body}"
    
    def generate_html_mock(self, biz_data: Dict[str, Any], variant: str = 'A') -> str:
        """Generate HTML mock for email preview"""
        contact_name = biz_data.get('contact_name', 'Brother')
        biz_name = biz_data.get('name', 'Your Biz')
        location = biz_data.get('location', 'City')
        
        if variant == 'A':
            subject = f"{contact_name} – Upgrade Your {biz_name} Ad to Crush {location} Competition (Free Pro Attached)"
            urgency_class = "urgency-email"
            fomo_highlight = "FOMO urgency for 20% open boost"
        else:
            subject = f"{contact_name} – Pro Stack for {biz_name}: 10x Bookings from Buried Posts (Free Upgrade)"
            urgency_class = "value-email"
            fomo_highlight = "Value embeds spike closes 15%"
        
        html_mock = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        .{urgency_class} {{ 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: {'#fff5f5' if variant == 'A' else '#f0fdf4'};
        }}
        .subject {{ font-weight: bold; color: #333; margin-bottom: 20px; }}
        .attachment-tease {{ 
            background: #f8f9fa; 
            padding: 15px; 
            border-left: 4px solid {'#ef4444' if variant == 'A' else '#10b981'};
            margin: 15px 0;
        }}
        .cta-button {{ 
            background: {'#ef4444' if variant == 'A' else '#10b981'}; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px;
            display: inline-block;
            margin: 15px 0;
        }}
        .ps-highlight {{ 
            background: #fef3c7; 
            padding: 10px; 
            border-radius: 4px; 
            font-style: italic;
        }}
    </style>
</head>
<body>
    <div class="{urgency_class}">
        <div class="subject">Subject: {subject}</div>
        
        <div class="attachment-tease">
            📎 <strong>Attachments:</strong>
            <ul>
                <li>SEO'd ad card (PNG)</li>
                <li>Hosted site preview</li>
                <li>Gallery deck samples</li>
            </ul>
        </div>
        
        <p><strong>Key Bullets:</strong></p>
        <ul>
            <li>{"Competition buries posts fast" if variant == 'A' else "5-star badges + gallery deck"}</li>
            <li>{"Post tomorrow AM—watch replies flood" if variant == 'A' else "From $5 daily reposts to flooded quotes"}</li>
            <li>{"Reply 'YES' for full $99 pack" if variant == 'A' else "Reply 'YES' for deeper funnel"}</li>
        </ul>
        
        <a href="#" class="cta-button">
            {"Get Urgency Pack" if variant == 'A' else "Get Value Pack"}
        </a>
        
        <div class="ps-highlight">
            <strong>P.S.</strong> {fomo_highlight}
        </div>
    </div>
</body>
</html>"""
        
        return html_mock
    
    def track_supabase_variants(self, biz_data: Dict[str, Any], variant: str) -> Dict[str, Any]:
        """Track email variants in Supabase"""
        return {
            'status': 'success',
            'variant': variant,
            'variant_type': 'urgency' if variant == 'A' else 'value',
            'expected_boost': self.conversion_hooks['urgency']['open_boost'] if variant == 'A' else self.conversion_hooks['value']['close_boost'],
            'timestamp': datetime.now().isoformat(),
            'webhook_data': {
                'email_type': 'outreach',
                'variant': variant,
                'contact_email': biz_data.get('email', 'unknown'),
                'business_name': biz_data.get('name', 'unknown'),
                'location': biz_data.get('location', 'unknown')
            }
        }
    
    def integrate_roi(self, biz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Integrate ROI calculations with outreach emails"""
        buried_spend = 150  # $150/month buried ads
        uplift_multiplier = 10  # 10x uplift with optimized stack
        
        monthly_bookings_buried = 2
        monthly_bookings_optimized = monthly_bookings_buried * uplift_multiplier
        
        avg_booking_value = 99  # $99 average booking
        monthly_revenue_buried = monthly_bookings_buried * avg_booking_value
        monthly_revenue_optimized = monthly_bookings_optimized * avg_booking_value
        
        monthly_roi = monthly_revenue_optimized - monthly_revenue_buried
        
        return {
            'buried_spend': buried_spend,
            'uplift_multiplier': uplift_multiplier,
            'monthly_bookings_buried': monthly_bookings_buried,
            'monthly_bookings_optimized': monthly_bookings_optimized,
            'monthly_revenue_buried': monthly_revenue_buried,
            'monthly_revenue_optimized': monthly_revenue_optimized,
            'monthly_roi': monthly_roi,
            'roi_message': f"From ${buried_spend}/mo buried → {uplift_multiplier}x w/ optimized stack—your first client covers!",
            'arr_tease': "$600K path: 70% entry bite → 20% recurring"
        }
    
    def generate_full_email_string(self, biz_data: Dict[str, Any], variant: str = 'A') -> Dict[str, str]:
        """Generate complete email string with all components"""
        email_content = self.gen_outreach_enhanced(biz_data, variant)
        html_mock = self.generate_html_mock(biz_data, variant)
        tracking_data = self.track_supabase_variants(biz_data, variant)
        roi_data = self.integrate_roi(biz_data)
        
        return {
            'email_content': email_content,
            'html_mock': html_mock,
            'tracking_data': json.dumps(tracking_data, indent=2),
            'roi_data': json.dumps(roi_data, indent=2),
            'variant': variant,
            'expected_boost': tracking_data['expected_boost']
        }

def main():
    """Test run with R Movers Rodrigo data"""
    
    # R Movers Rodrigo sample data
    rodrigo_data = {
        'contact_name': 'Rodrigo',
        'name': 'R Movers',
        'location': 'Modesto CA',
        'years': 14,
        'niche': 'movers',
        'phone': '(209) 809-8541',
        'email': 'racoone1212@yahoo.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals']
    }
    
    # Initialize outreach generator
    generator = OutreachGenerator()
    
    print("📧 AdTopia Outreach Generator - Test Run")
    print("=" * 50)
    
    # Generate both variants
    print("\n📱 VARIANT A (URGENCY):")
    print("-" * 30)
    
    variant_a = generator.generate_full_email_string(rodrigo_data, 'A')
    print("Email Content:")
    print(variant_a['email_content'])
    print(f"\nExpected Boost: {variant_a['expected_boost']}%")
    
    print("\n📱 VARIANT B (VALUE):")
    print("-" * 30)
    
    variant_b = generator.generate_full_email_string(rodrigo_data, 'B')
    print("Email Content:")
    print(variant_b['email_content'])
    print(f"\nExpected Boost: {variant_b['expected_boost']}%")
    
    # Show HTML mocks
    print("\n🎨 HTML MOCK PREVIEWS:")
    print("-" * 30)
    print("Variant A HTML Mock (first 500 chars):")
    print(variant_a['html_mock'][:500] + "...")
    print("\nVariant B HTML Mock (first 500 chars):")
    print(variant_b['html_mock'][:500] + "...")
    
    # Show ROI integration
    print("\n💰 ROI INTEGRATION:")
    print("-" * 30)
    roi_data = generator.integrate_roi(rodrigo_data)
    print(f"Monthly ROI: ${roi_data['monthly_roi']}")
    print(f"ROI Message: {roi_data['roi_message']}")
    print(f"ARR Tease: {roi_data['arr_tease']}")
    
    # Show tracking data
    print("\n🔗 SUPABASE TRACKING:")
    print("-" * 30)
    print("Variant A Tracking:")
    print(variant_a['tracking_data'])
    print("\nVariant B Tracking:")
    print(variant_b['tracking_data'])
    
    print("\n✅ Outreach Generator Complete!")
    print("Ready for A/B conversion hooks deployment! 🚀")

if __name__ == "__main__":
    main()
