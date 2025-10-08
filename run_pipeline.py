#!/usr/bin/env python3
"""
AdTopia Full Pipeline Runner + Zapier/Webhook Integration
Final end-to-end automation with auto-harvest capabilities

Focus: End-to-End Auto-Harvest
- Load JSON, call all generators, print prompts for Gamma copy-paste
- Simulate webhook integration with Zapier
- Heart-fav trigger for upsell generation
- Error handling with mock galleries
- Export prompts to files with PDF simulation
- Track Phase 1 batch progress
- Scale tease for 60-card empire
"""

import json
import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
import time

# Import all generators
from setup import AdTopiaAutomation
from gen_urgency import UrgencyGenerator
from gen_value import ValueGenerator
from gen_outreach import OutreachGenerator
from niche_adapter import NicheAdapter

class FullPipelineRunner:
    """Complete end-to-end automation pipeline runner"""
    
    def __init__(self):
        self.automation = AdTopiaAutomation()
        self.urgency_gen = UrgencyGenerator()
        self.value_gen = ValueGenerator()
        self.outreach_gen = OutreachGenerator()
        self.niche_adapter = NicheAdapter()
        
        # Pipeline tracking
        self.pipeline_stats = {
            'total_leads_processed': 0,
            'total_prompts_generated': 0,
            'total_roi_generated': 0,
            'phase_1_batch': 0,
            'heart_fav_triggers': 0,
            'upsells_generated': 0
        }
        
        # Zapier webhook configuration
        self.zapier_webhook_url = "https://hooks.zapier.com/hooks/catch/123456/abcdef/"
        
        # Output directory
        self.output_dir = "./outputs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def run_full_pipeline(self, lead_json_path: str, target_niche: Optional[str] = None) -> Dict[str, Any]:
        """
        Run complete pipeline from JSON input to Gamma-ready outputs
        """
        print("🔥 AdTopia Full Pipeline Runner - Starting")
        print("=" * 60)
        
        # Step 1: Load JSON data
        print("\n📁 STEP 1: Loading Lead Data")
        print("-" * 30)
        
        try:
            with open(lead_json_path, 'r') as f:
                biz_data = json.load(f)
            print(f"✅ Loaded: {biz_data.get('name', 'Unknown Business')}")
        except FileNotFoundError:
            print(f"❌ File not found: {lead_json_path}")
            return {'error': 'File not found'}
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON: {lead_json_path}")
            return {'error': 'Invalid JSON'}
        
        # Step 2: Adapt niche if specified
        if target_niche and target_niche != biz_data.get('niche', 'movers'):
            print(f"\n🔄 STEP 2: Adapting to {target_niche}")
            print("-" * 30)
            biz_data = self.niche_adapter.adapt_niche(biz_data, target_niche)
            print(f"✅ Adapted: {biz_data['name']} ({biz_data['niche']})")
        else:
            print(f"\n🔄 STEP 2: Using original niche ({biz_data.get('niche', 'movers')})")
            print("-" * 30)
        
        # Step 3: Generate all prompts
        print(f"\n🎯 STEP 3: Generating All Prompts")
        print("-" * 30)
        
        prompts = self._generate_all_prompts(biz_data)
        print(f"✅ Generated {len(prompts)} prompt types")
        
        # Step 4: Calculate ROI
        print(f"\n💰 STEP 4: Calculating ROI")
        print("-" * 30)
        
        roi_data = self.automation.calculate_roi(biz_data)
        print(f"✅ ROI: {roi_data['roi_percentage']:.1f}% (${roi_data['monthly_roi']} monthly)")
        
        # Step 5: Simulate webhook
        print(f"\n🔗 STEP 5: Simulating Webhook")
        print("-" * 30)
        
        webhook_result = self._simulate_webhook(biz_data, prompts)
        print(f"✅ Webhook: {webhook_result['status']}")
        
        # Step 6: Check heart-fav trigger
        print(f"\n❤️ STEP 6: Checking Heart-Fav Trigger")
        print("-" * 30)
        
        heart_fav_result = self._check_heart_fav_trigger(biz_data)
        if heart_fav_result['triggered']:
            print(f"✅ Heart-fav triggered: {heart_fav_result['upsell_slide']}")
            self.pipeline_stats['heart_fav_triggers'] += 1
            self.pipeline_stats['upsells_generated'] += 1
        
        # Step 7: Export outputs
        print(f"\n💾 STEP 7: Exporting Outputs")
        print("-" * 30)
        
        export_result = self._export_outputs(biz_data, prompts, roi_data)
        print(f"✅ Exported: {export_result['files_created']}")
        
        # Step 8: Update pipeline stats
        self._update_pipeline_stats(biz_data, prompts, roi_data)
        
        # Step 9: Print final results
        self._print_final_results(biz_data, prompts, roi_data, webhook_result)
        
        return {
            'success': True,
            'business_data': biz_data,
            'prompts': prompts,
            'roi_data': roi_data,
            'webhook_result': webhook_result,
            'heart_fav_result': heart_fav_result,
            'export_result': export_result,
            'pipeline_stats': self.pipeline_stats
        }
    
    def _generate_all_prompts(self, biz_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate all prompt types"""
        prompts = {}
        
        # Urgency prompts (all variants)
        print("  📱 Generating urgency variants...")
        urgency_variants = self.urgency_gen.generate_all_variants(biz_data)
        prompts['urgency_variants'] = urgency_variants
        
        # Value landing prompt
        print("  🎨 Generating value landing...")
        prompts['value'] = self.value_gen.gen_value_enhanced(biz_data)
        
        # Outreach prompts (both variants)
        print("  📧 Generating outreach emails...")
        prompts['outreach_a'] = self.outreach_gen.gen_outreach_enhanced(biz_data, 'A')
        prompts['outreach_b'] = self.outreach_gen.gen_outreach_enhanced(biz_data, 'B')
        
        return prompts
    
    def _simulate_webhook(self, biz_data: Dict[str, Any], prompts: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate Zapier webhook integration"""
        webhook_payload = {
            'event': 'new_transform',
            'client_id': biz_data.get('id', f"client_{biz_data.get('name', 'unknown').lower().replace(' ', '_')}"),
            'business_name': biz_data.get('name', 'Unknown'),
            'niche': biz_data.get('niche', 'general'),
            'location': biz_data.get('location', 'Unknown'),
            'variants': 'A/B',
            'prompts_generated': len(prompts),
            'timestamp': datetime.now().isoformat(),
            'pipeline_version': '1.0'
        }
        
        # Simulate webhook call (in production, this would be actual HTTP request)
        print(f"  🔗 POST to {self.zapier_webhook_url}")
        print(f"  📦 Payload: {json.dumps(webhook_payload, indent=2)}")
        
        # Simulate response
        return {
            'status': 'success',
            'webhook_url': self.zapier_webhook_url,
            'payload': webhook_payload,
            'response_code': 200,
            'message': 'Webhook triggered successfully'
        }
    
    def _check_heart_fav_trigger(self, biz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for heart-fav trigger (3+ from 60-pool)"""
        # Simulate heart-fav count (in production, this would check actual data)
        heart_fav_count = 3  # Simulated trigger
        
        if heart_fav_count >= 3:
            upsell_slide = f"""Your Favs Gallery – +$29 Pro Polish?
            
Transform your heart-fav selections into professional marketing materials:

• High-res downloads (300 DPI)
• Custom branding overlay
• Social media ready formats
• Print-ready versions
• Commercial usage rights

Upgrade now for just $29!"""
            
            return {
                'triggered': True,
                'heart_fav_count': heart_fav_count,
                'upsell_slide': upsell_slide,
                'upsell_price': 29
            }
        
        return {
            'triggered': False,
            'heart_fav_count': heart_fav_count,
            'upsell_slide': None
        }
    
    def _export_outputs(self, biz_data: Dict[str, Any], prompts: Dict[str, Any], roi_data: Dict[str, Any]) -> Dict[str, Any]:
        """Export all outputs to files"""
        biz_name = biz_data.get('name', 'business').lower().replace(' ', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        files_created = []
        
        # Create main pack file
        pack_filename = f"{biz_name}_pack_{timestamp}.txt"
        pack_path = os.path.join(self.output_dir, pack_filename)
        
        with open(pack_path, 'w') as f:
            f.write(f"AdTopia Automation Pack - {biz_data.get('name', 'Business')}\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 60 + "\n\n")
            
            # ROI Summary
            f.write("💰 ROI SUMMARY:\n")
            f.write(f"Monthly ROI: ${roi_data['monthly_roi']}\n")
            f.write(f"ROI Percentage: {roi_data['roi_percentage']:.1f}%\n")
            f.write(f"Uplift Multiplier: {roi_data['uplift_multiplier']:.1f}x\n\n")
            
            # Urgency Variants
            f.write("📱 URGENCY VARIANTS:\n")
            f.write("-" * 30 + "\n")
            for variant_id, prompt in prompts['urgency_variants'].items():
                f.write(f"\n{variant_id.upper()}:\n")
                f.write(prompt + "\n\n")
            
            # Value Landing
            f.write("🎨 VALUE LANDING:\n")
            f.write("-" * 30 + "\n")
            f.write(prompts['value'] + "\n\n")
            
            # Outreach Emails
            f.write("📧 OUTREACH EMAILS:\n")
            f.write("-" * 30 + "\n")
            f.write("VARIANT A (URGENCY):\n")
            f.write(prompts['outreach_a'] + "\n\n")
            f.write("VARIANT B (VALUE):\n")
            f.write(prompts['outreach_b'] + "\n\n")
        
        files_created.append(pack_path)
        
        # Create individual prompt files
        for prompt_type, prompt_content in prompts.items():
            if prompt_type == 'urgency_variants':
                for variant_id, variant_prompt in prompt_content.items():
                    variant_filename = f"{biz_name}_{variant_id}_{timestamp}.txt"
                    variant_path = os.path.join(self.output_dir, variant_filename)
                    with open(variant_path, 'w') as f:
                        f.write(variant_prompt)
                    files_created.append(variant_path)
            else:
                prompt_filename = f"{biz_name}_{prompt_type}_{timestamp}.txt"
                prompt_path = os.path.join(self.output_dir, prompt_filename)
                with open(prompt_path, 'w') as f:
                    f.write(prompt_content)
                files_created.append(prompt_path)
        
        # Create PDF simulation (text file with PDF-like formatting)
        pdf_filename = f"{biz_name}_summary_{timestamp}.pdf.txt"
        pdf_path = os.path.join(self.output_dir, pdf_filename)
        
        with open(pdf_path, 'w') as f:
            f.write("ADTOPIA AUTOMATION SUMMARY\n")
            f.write("=" * 40 + "\n\n")
            f.write(f"Business: {biz_data.get('name', 'Unknown')}\n")
            f.write(f"Niche: {biz_data.get('niche', 'Unknown')}\n")
            f.write(f"Location: {biz_data.get('location', 'Unknown')}\n")
            f.write(f"Years: {biz_data.get('years', 'Unknown')}\n\n")
            f.write("ROI PROJECTION:\n")
            f.write(f"Monthly ROI: ${roi_data['monthly_roi']}\n")
            f.write(f"ROI %: {roi_data['roi_percentage']:.1f}%\n")
            f.write(f"Uplift: {roi_data['uplift_multiplier']:.1f}x\n\n")
            f.write("PROMPTS GENERATED:\n")
            f.write(f"Urgency Variants: {len(prompts['urgency_variants'])}\n")
            f.write("Value Landing: 1\n")
            f.write("Outreach Emails: 2\n")
            f.write(f"Total: {len(prompts) + len(prompts['urgency_variants']) - 1}\n")
        
        files_created.append(pdf_path)
        
        return {
            'files_created': files_created,
            'main_pack_file': pack_path,
            'total_files': len(files_created)
        }
    
    def _update_pipeline_stats(self, biz_data: Dict[str, Any], prompts: Dict[str, Any], roi_data: Dict[str, Any]):
        """Update pipeline statistics"""
        self.pipeline_stats['total_leads_processed'] += 1
        self.pipeline_stats['total_prompts_generated'] += len(prompts) + len(prompts['urgency_variants']) - 1
        self.pipeline_stats['total_roi_generated'] += roi_data['monthly_roi']
        self.pipeline_stats['phase_1_batch'] += 1
    
    def _print_final_results(self, biz_data: Dict[str, Any], prompts: Dict[str, Any], roi_data: Dict[str, Any], webhook_result: Dict[str, Any]):
        """Print final pipeline results"""
        print(f"\n🎯 FINAL RESULTS:")
        print("=" * 60)
        
        print(f"Business: {biz_data.get('name', 'Unknown')}")
        print(f"Niche: {biz_data.get('niche', 'Unknown')}")
        print(f"Location: {biz_data.get('location', 'Unknown')}")
        print(f"Monthly ROI: ${roi_data['monthly_roi']}")
        print(f"ROI %: {roi_data['roi_percentage']:.1f}%")
        print(f"Webhook Status: {webhook_result['status']}")
        
        print(f"\n📊 PIPELINE STATS:")
        print(f"Total Leads Processed: {self.pipeline_stats['total_leads_processed']}")
        print(f"Total Prompts Generated: {self.pipeline_stats['total_prompts_generated']}")
        print(f"Total ROI Generated: ${self.pipeline_stats['total_roi_generated']}")
        print(f"Phase 1 Batch: {self.pipeline_stats['phase_1_batch']}")
        
        # Empire rolling message
        contact_name = biz_data.get('contact_name', 'Brother')
        print(f"\n🚀 EMPIRE ROLLING: {contact_name} reply = first $99 today?")
        
        # Console prompt
        print(f"\n💬 CONSOLE: Post live? Drop confirmation or niche pivot (plumbers next)")
    
    def generate_60_card_empire(self, base_biz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate 60-card empire with seasonal variants"""
        print("\n🏰 GENERATING 60-CARD EMPIRE")
        print("=" * 60)
        
        empire_cards = []
        seasonal_variants = {
            'Black Friday': 'Black Friday movers special - 50% off!',
            'Summer AC': 'Summer AC surges - emergency service!',
            'Holiday': 'Holiday moving rush - book now!',
            'Spring': 'Spring cleaning - fresh start moves!',
            'Back to School': 'Back to school moves - student special!'
        }
        
        for i in range(60):
            card_data = base_biz_data.copy()
            card_data['card_id'] = f"card_{i+1:02d}"
            
            # Add seasonal variant
            if i < len(seasonal_variants):
                season = list(seasonal_variants.keys())[i]
                card_data['seasonal_hook'] = seasonal_variants[season]
                card_data['season'] = season
            
            # Generate card
            card_prompt = self.urgency_gen.gen_urgency_enhanced(card_data, 'v1_drain_coil')
            empire_cards.append({
                'card_id': card_data['card_id'],
                'season': card_data.get('season', 'Standard'),
                'prompt': card_prompt
            })
        
        print(f"✅ Generated {len(empire_cards)} empire cards")
        
        return {
            'empire_cards': empire_cards,
            'total_cards': len(empire_cards),
            'seasonal_variants': len(seasonal_variants)
        }
    
    def print_quick_qualify_table(self, biz_data: Dict[str, Any]) -> None:
        """Print quick qualify table based on PDF extract criteria"""
        print("\n📋 QUICK QUALIFY TABLE")
        print("=" * 60)
        
        qualify_criteria = [
            {
                'criterion': 'SEO/Keywords',
                'status': 'None (no "Modesto movers", "piano relocation CA")',
                'transform_opportunity': 'Inject geo + service terms for 10x visibility'
            },
            {
                'criterion': 'Online Presence',
                'status': 'Partial (Yahoo, dead domain Rmoversca.com 404, FB hint)',
                'transform_opportunity': 'Host live site + pro email forward (Pro@RMoversModesto.com)'
            },
            {
                'criterion': 'Visuals',
                'status': 'Thumbs OK but blurry/no captions',
                'transform_opportunity': 'Curate pro gallery (before/after moves, Gamma AI gen)'
            },
            {
                'criterion': 'Structure',
                'status': 'Ramble (no hooks, benefits first)',
                'transform_opportunity': 'Punchy bullets + CTA stack (urgency "Book Now – Slots Filling!")'
            },
            {
                'criterion': 'Trust Signals',
                'status': '14 yrs exp, free estimates',
                'transform_opportunity': 'Amp w/ "5-star Google rated" badge (pull from FB reviews)'
            }
        ]
        
        print(f"{'Criterion':<15} {'Status':<50} {'Transform Opportunity':<50}")
        print("-" * 115)
        
        for criteria in qualify_criteria:
            print(f"{criteria['criterion']:<15} {criteria['status']:<50} {criteria['transform_opportunity']:<50}")
        
        print(f"\n💰 ROI TEASE: Buried $5/day reposts → Optimized stack: 10x bookings")
        print(f"($600K ARR path—70% entry tier bite, 40% mid-up, 20% 60-card renewals @ $1.2K/mo)")

def main():
    """Test run with R Movers data"""
    
    # Create sample R Movers JSON file
    r_movers_data = {
        'id': 'rmovers_001',
        'name': 'R Movers',
        'contact_name': 'Rodrigo',
        'niche': 'movers',
        'location': 'Modesto CA',
        'years': 14,
        'phone': '(209) 809-8541',
        'email': 'racoone1212@yahoo.com',
        'features': ['Local Moves $99/hr', 'Piano Specialty', 'Free Estimates'],
        'pain_points': ['Dead domain', 'No keywords', 'Poor visuals'],
        'gallery': ['truck loads', 'piano wraps', 'family unloads']
    }
    
    # Save sample data to file
    sample_file = 'sample_rmovers.json'
    with open(sample_file, 'w') as f:
        json.dump(r_movers_data, f, indent=2)
    
    # Initialize pipeline runner
    runner = FullPipelineRunner()
    
    print("🔥 AdTopia Full Pipeline Runner - Test Run")
    print("=" * 60)
    
    # Print quick qualify table
    runner.print_quick_qualify_table(r_movers_data)
    
    # Run full pipeline
    result = runner.run_full_pipeline(sample_file)
    
    if result.get('success'):
        print(f"\n✅ Pipeline completed successfully!")
        
        # Test 60-card empire generation
        empire_result = runner.generate_60_card_empire(r_movers_data)
        print(f"🏰 Empire generated: {empire_result['total_cards']} cards")
        
        # Test niche pivot
        print(f"\n🔄 Testing niche pivot to plumbers...")
        plumber_result = runner.run_full_pipeline(sample_file, 'plumbers')
        if plumber_result.get('success'):
            print(f"✅ Plumber adaptation successful: {plumber_result['business_data']['name']}")
    
    # Clean up sample file
    if os.path.exists(sample_file):
        os.remove(sample_file)
    
    print(f"\n🎯 Full Pipeline Runner Complete!")
    print("Ready for end-to-end auto-harvest deployment! 🚀")

if __name__ == "__main__":
    main()
