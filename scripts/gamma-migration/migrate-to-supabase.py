#!/usr/bin/env python3
"""
Gamma Gallery Migration Script
Description: Migrate 100+ Gamma URLs to Supabase Storage with API integration
Author: omniumai357
Date: 2025-10-09
"""

import os
import json
import time
import requests
import zipfile
import io
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image

# Enhanced logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class GammaMigrator:
    def __init__(self):
        """Initialize the Gamma migrator with API keys and clients."""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.gamma_api_key = os.getenv('GAMMA_API_KEY')
        
        if not all([self.supabase_url, self.supabase_key, self.gamma_api_key]):
            raise ValueError("Missing required environment variables. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GAMMA_API_KEY")
        
        # Initialize Supabase client with error handling
        try:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            self.supabase = None
        
        # Migration progress tracking with enhanced error details
        self.migration_log = {
            'started_at': datetime.now().isoformat(),
            'total_urls': 0,
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'errors': [],
            'warnings': [],
            'cost_estimate': 0.0,
            'trace_ids': []
        }
        
        # Enhanced rate limiting and retry configuration
        self.api_delay = 1  # seconds between API calls (reduced for efficiency)
        self.batch_size = 10
        self.max_retries = 3
        self.retry_delays = [2, 4, 8]  # Exponential backoff
        
    def extract_metadata_from_url(self, url: str) -> Dict[str, str]:
        """Extract business metadata from Gamma URL."""
        url_lower = url.lower()
        
        # Determine niche based on URL patterns
        if 'plumb' in url_lower or 'drain' in url_lower or 'clog' in url_lower:
            niche = 'plumber'
        elif 'hvac' in url_lower or 'cool' in url_lower or 'heat' in url_lower or 'ac' in url_lower:
            niche = 'hvac'
        elif 'mover' in url_lower or 'moving' in url_lower or 'piano' in url_lower:
            niche = 'movers'
        elif 'paint' in url_lower or 'contractor' in url_lower:
            niche = 'contractor'
        elif 'clean' in url_lower or 'maid' in url_lower:
            niche = 'cleaning'
        elif 'tamale' in url_lower or 'sale' in url_lower or 'weekend' in url_lower:
            niche = 'seasonal'
        else:
            niche = 'white-label'
        
        # Determine language (default to English, detect Spanish)
        language = 'es' if 'mudanza' in url_lower or 'servicio' in url_lower else 'en'
        
        # Extract business name from URL
        business_name = url.split('//')[1].split('.')[0].replace('-', ' ').title()
        
        # Determine CTA type and FOMO score based on URL patterns
        if 'stress' in url_lower or 'emergency' in url_lower or 'urgent' in url_lower:
            cta_type = 'urgency'
            fomo_score = 9
        elif 'cool' in url_lower or 'heat' in url_lower or 'sale' in url_lower:
            cta_type = 'urgency'
            fomo_score = 8
        elif 'reliable' in url_lower or 'trust' in url_lower or 'family' in url_lower:
            cta_type = 'trust'
            fomo_score = 7
        else:
            cta_type = 'value'
            fomo_score = 6
        
        return {
            'niche': niche,
            'language': language,
            'business_name': business_name,
            'cta_type': cta_type,
            'fomo_score': fomo_score,
            'utm_campaign': f"{niche}_{cta_type}_test"
        }
    
    def create_gamma_prompt(self, url: str, metadata: Dict[str, str]) -> str:
        """Create optimized prompt for Gamma API generation."""
        niche = metadata['niche']
        business_name = metadata['business_name']
        cta_type = metadata['cta_type']
        
        if cta_type == 'urgency':
            prompt = f"""Recreate from {url}: 5 square PNG ad cards (1080x1080) with urgency theme.
            
            Business: {business_name} ({niche} services)
            Style: Urgency-focused with red/orange CTAs
            Elements: "Slots filling fast!", "Call NOW!", "Limited time", emergency contact
            Colors: Red (#EF4444) and orange (#F97316) accents
            Format: 5 individual PNG files, high quality, mobile-optimized"""
        
        elif cta_type == 'trust':
            prompt = f"""Recreate from {url}: 5 square PNG ad cards (1080x1080) with trust theme.
            
            Business: {business_name} ({niche} services)
            Style: Trust-focused with blue/green CTAs
            Elements: "Licensed & Insured", "5+ years experience", "3,500+ families served"
            Colors: Blue (#3B82F6) and green (#10B981) accents
            Format: 5 individual PNG files, high quality, mobile-optimized"""
        
        else:  # value
            prompt = f"""Recreate from {url}: 5 square PNG ad cards (1080x1080) with value theme.
            
            Business: {business_name} ({niche} services)
            Style: Value-focused with savings and benefits
            Elements: "$99 special", "Save $180/year", "Free estimate", service benefits
            Colors: Blue (#3B82F6) and purple (#8B5CF6) accents
            Format: 5 individual PNG files, high quality, mobile-optimized"""
        
        return prompt
    
    def call_gamma_api(self, prompt: str, trace_id: str) -> Tuple[Optional[str], List[str]]:
        """Call Gamma API to generate cards and return ZIP download URL with warnings."""
        warnings = []
        
        for attempt in range(self.max_retries):
            try:
                headers = {
                    'Authorization': f'Bearer {self.gamma_api_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'AdTopia-Migration/1.0'
                }
                
                payload = {
                    'prompt': prompt,
                    'format': 'png',
                    'quality': 'high',
                    'count': 5
                }
                
                logger.info(f"🔄 Calling Gamma API (attempt {attempt + 1}/{self.max_retries}) - Trace: {trace_id}")
                
                response = requests.post(
                    'https://api.gamma.app/v1/generations',
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                
                # Handle different HTTP status codes
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for warnings in response
                    if 'warnings' in data and data['warnings']:
                        warnings.extend(data['warnings'])
                        logger.warning(f"⚠️ Gamma API warnings for {trace_id}: {data['warnings']}")
                    
                    zip_url = data.get('zip_download_url')
                    if zip_url:
                        logger.info(f"✅ Gamma API success - Trace: {trace_id}")
                        return zip_url, warnings
                    else:
                        raise ValueError("No zip_download_url in response")
                
                elif response.status_code == 400:
                    error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                    error_msg = error_data.get('error', {}).get('message', response.text)
                    logger.error(f"❌ Bad request (400) for {trace_id}: {error_msg}")
                    return None, warnings
                
                elif response.status_code == 401:
                    logger.error(f"❌ Authentication failed (401) for {trace_id}: Check GAMMA_API_KEY")
                    return None, warnings
                
                elif response.status_code == 429:
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"⏳ Rate limit (429) for {trace_id}: Retry after {retry_after}s")
                    if attempt < self.max_retries - 1:
                        time.sleep(retry_after)
                        continue
                    else:
                        return None, warnings
                
                elif response.status_code >= 500:
                    logger.error(f"❌ Server error ({response.status_code}) for {trace_id}: {response.text}")
                    if attempt < self.max_retries - 1:
                        delay = self.retry_delays[attempt]
                        logger.info(f"⏳ Retrying in {delay}s...")
                        time.sleep(delay)
                        continue
                    else:
                        return None, warnings
                
                else:
                    logger.error(f"❌ Unexpected status ({response.status_code}) for {trace_id}: {response.text}")
                    return None, warnings
                    
            except requests.exceptions.Timeout:
                logger.error(f"⏰ Timeout for {trace_id} (attempt {attempt + 1})")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delays[attempt])
                    continue
                else:
                    return None, warnings
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"🌐 Network error for {trace_id}: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delays[attempt])
                    continue
                else:
                    return None, warnings
                    
            except Exception as e:
                logger.error(f"💥 Unexpected error for {trace_id}: {str(e)}")
                return None, warnings
        
        return None, warnings
    
    def download_and_extract_zip(self, zip_url: str) -> List[bytes]:
        """Download ZIP file and extract PNG images."""
        try:
            # Download ZIP file
            response = requests.get(zip_url, timeout=60)
            response.raise_for_status()
            
            # Extract PNG files from ZIP
            png_files = []
            with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
                for file_info in zip_file.filelist:
                    if file_info.filename.lower().endswith('.png'):
                        png_data = zip_file.read(file_info.filename)
                        
                        # Resize to 1080x1080 if needed
                        img = Image.open(io.BytesIO(png_data))
                        if img.size != (1080, 1080):
                            img = img.resize((1080, 1080), Image.Resampling.LANCZOS)
                            
                            # Convert back to bytes
                            output = io.BytesIO()
                            img.save(output, format='PNG', optimize=True)
                            png_data = output.getvalue()
                        
                        png_files.append(png_data)
            
            return png_files
            
        except Exception as e:
            print(f"❌ ZIP download/extraction failed: {str(e)}")
            return []
    
    def upload_to_supabase(self, png_files: List[bytes], metadata: Dict[str, str], url: str, trace_id: str) -> List[str]:
        """Upload PNG files to Supabase Storage and return storage paths with fallback."""
        storage_paths = []
        niche = metadata['niche']
        language = metadata['language']
        
        try:
            for i, png_data in enumerate(png_files):
                # Create storage path with trace ID for uniqueness
                filename = f"{metadata['business_name'].lower().replace(' ', '-')}-{i+1}-{trace_id}.png"
                storage_path = f"{niche}/{language}/{filename}"
                
                # Try Supabase upload first
                if self.supabase:
                    try:
                        result = self.supabase.storage.from_('gamma-cards').upload(
                            storage_path,
                            png_data,
                            file_options={'content-type': 'image/png', 'upsert': True}
                        )
                        
                        if result.get('error'):
                            logger.error(f"❌ Supabase upload failed for {storage_path}: {result['error']} - Trace: {trace_id}")
                            # Fallback to local file save
                            self._save_file_locally(png_data, storage_path, trace_id)
                        else:
                            storage_paths.append(storage_path)
                            logger.info(f"✅ Uploaded to Supabase: {storage_path} - Trace: {trace_id}")
                    except Exception as e:
                        logger.error(f"❌ Supabase upload exception for {storage_path}: {str(e)} - Trace: {trace_id}")
                        # Fallback to local file save
                        self._save_file_locally(png_data, storage_path, trace_id)
                else:
                    # Supabase client not available, save locally
                    logger.warning(f"⚠️ Supabase client not available, saving locally - Trace: {trace_id}")
                    self._save_file_locally(png_data, storage_path, trace_id)
                
                # Add to storage paths regardless of upload method
                storage_paths.append(storage_path)
            
            return storage_paths
            
        except Exception as e:
            logger.error(f"❌ Upload process failed: {str(e)} - Trace: {trace_id}")
            return []
    
    def _save_file_locally(self, png_data: bytes, storage_path: str, trace_id: str):
        """Fallback method to save files locally when Supabase is unavailable."""
        try:
            # Create local directory structure
            local_path = f"migrated_files/{storage_path}"
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Save file
            with open(local_path, 'wb') as f:
                f.write(png_data)
            
            logger.info(f"💾 Saved locally: {local_path} - Trace: {trace_id}")
        except Exception as e:
            logger.error(f"❌ Local save failed for {storage_path}: {str(e)} - Trace: {trace_id}")
    
    def insert_gallery_metadata(self, url: str, storage_paths: List[str], metadata: Dict[str, str], trace_id: str) -> bool:
        """Insert gallery metadata into gamma_gallery table with enhanced error handling."""
        try:
            for i, storage_path in enumerate(storage_paths):
                gallery_data = {
                    'original_gamma_url': url,
                    'storage_path': storage_path,
                    'niche': metadata['niche'],
                    'language': metadata['language'],
                    'title': f"{metadata['business_name']} - Card {i+1}",
                    'description': f"Professional {metadata['niche']} ad card with {metadata['cta_type']} theme",
                    'fomo_score': metadata['fomo_score'],
                    'cta_type': metadata['cta_type'],
                    'is_featured': metadata['fomo_score'] >= 8,
                    'is_placeholder': False,
                    'utm_campaign': metadata['utm_campaign']
                }
                
                # Try Supabase insert if available
                if self.supabase:
                    try:
                        result = self.supabase.table('gamma_gallery').insert(gallery_data).execute()
                        
                        if result.data:
                            logger.info(f"✅ Metadata inserted for: {storage_path} - Trace: {trace_id}")
                        else:
                            logger.error(f"❌ Metadata insert failed for: {storage_path} - Trace: {trace_id}")
                            return False
                    except Exception as e:
                        logger.error(f"❌ Supabase metadata insert failed for {storage_path}: {str(e)} - Trace: {trace_id}")
                        # Fallback to local JSON log
                        self._log_metadata_locally(gallery_data, trace_id)
                else:
                    # Supabase not available, log locally
                    logger.warning(f"⚠️ Supabase not available, logging metadata locally - Trace: {trace_id}")
                    self._log_metadata_locally(gallery_data, trace_id)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Metadata insert process failed: {str(e)} - Trace: {trace_id}")
            return False
    
    def _log_metadata_locally(self, gallery_data: Dict, trace_id: str):
        """Fallback method to log metadata locally when Supabase is unavailable."""
        try:
            # Create local metadata log
            metadata_log_path = f"migrated_files/metadata_log_{trace_id}.json"
            os.makedirs(os.path.dirname(metadata_log_path), exist_ok=True)
            
            # Append to log file
            with open(metadata_log_path, 'a') as f:
                f.write(json.dumps(gallery_data) + '\n')
            
            logger.info(f"💾 Metadata logged locally: {metadata_log_path} - Trace: {trace_id}")
        except Exception as e:
            logger.error(f"❌ Local metadata log failed: {str(e)} - Trace: {trace_id}")
    
    def migrate_gamma_url(self, url: str) -> bool:
        """Migrate a single Gamma URL to Supabase with enhanced error handling."""
        trace_id = str(uuid.uuid4())[:8]
        self.migration_log['trace_ids'].append(trace_id)
        
        logger.info(f"🔄 Processing: {url} - Trace: {trace_id}")
        
        try:
            # Extract metadata
            metadata = self.extract_metadata_from_url(url)
            logger.info(f"📊 Metadata: {metadata['niche']} | {metadata['language']} | FOMO: {metadata['fomo_score']} - Trace: {trace_id}")
            
            # Create prompt
            prompt = self.create_gamma_prompt(url, metadata)
            
            # Call Gamma API with enhanced error handling
            zip_url, warnings = self.call_gamma_api(prompt, trace_id)
            if warnings:
                self.migration_log['warnings'].append({
                    'url': url,
                    'trace_id': trace_id,
                    'warnings': warnings
                })
            
            if not zip_url:
                error_msg = f"API call failed: {url} - Trace: {trace_id}"
                logger.error(f"❌ {error_msg}")
                self.migration_log['errors'].append(error_msg)
                return False
            
            # Download and extract PNGs
            png_files = self.download_and_extract_zip(zip_url)
            if not png_files:
                error_msg = f"ZIP extraction failed: {url} - Trace: {trace_id}"
                logger.error(f"❌ {error_msg}")
                self.migration_log['errors'].append(error_msg)
                return False
            
            logger.info(f"📦 Extracted {len(png_files)} PNG files - Trace: {trace_id}")
            
            # Upload to Supabase (with fallback to file save if Supabase fails)
            storage_paths = self.upload_to_supabase(png_files, metadata, url, trace_id)
            if not storage_paths:
                error_msg = f"Upload failed: {url} - Trace: {trace_id}"
                logger.error(f"❌ {error_msg}")
                self.migration_log['errors'].append(error_msg)
                return False
            
            # Insert metadata
            if self.insert_gallery_metadata(url, storage_paths, metadata, trace_id):
                logger.info(f"✅ Successfully migrated: {url} - Trace: {trace_id}")
                self.migration_log['successful'] += 1
                self.migration_log['cost_estimate'] += 0.50  # $0.50 per generation
                return True
            else:
                error_msg = f"Metadata insert failed: {url} - Trace: {trace_id}"
                logger.error(f"❌ {error_msg}")
                self.migration_log['errors'].append(error_msg)
                return False
                
        except Exception as e:
            error_msg = f"Migration failed for {url}: {str(e)} - Trace: {trace_id}"
            logger.error(f"❌ {error_msg}")
            self.migration_log['errors'].append(error_msg)
            return False
    
    def save_migration_log(self):
        """Save migration progress to JSON file."""
        self.migration_log['completed_at'] = datetime.now().isoformat()
        self.migration_log['duration_minutes'] = (
            datetime.fromisoformat(self.migration_log['completed_at']) - 
            datetime.fromisoformat(self.migration_log['started_at'])
        ).total_seconds() / 60
        
        with open('migration-log.json', 'w') as f:
            json.dump(self.migration_log, f, indent=2)
        
        print(f"\n📊 Migration Summary:")
        print(f"   Total URLs: {self.migration_log['total_urls']}")
        print(f"   Successful: {self.migration_log['successful']}")
        print(f"   Failed: {self.migration_log['failed']}")
        print(f"   Cost Estimate: ${self.migration_log['cost_estimate']:.2f}")
        print(f"   Duration: {self.migration_log['duration_minutes']:.1f} minutes")
    
    def run_migration(self, urls: List[str]):
        """Run the complete migration process."""
        print("🚀 Starting Gamma Gallery Migration")
        print(f"📋 Processing {len(urls)} URLs")
        
        self.migration_log['total_urls'] = len(urls)
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing URL...")
            
            success = self.migrate_gamma_url(url)
            self.migration_log['processed'] += 1
            
            if not success:
                self.migration_log['failed'] += 1
            
            # Rate limiting
            if i < len(urls):
                print(f"⏳ Waiting {self.api_delay}s before next request...")
                time.sleep(self.api_delay)
        
        self.save_migration_log()
        print("\n🎉 Migration completed!")

def main():
    """Main function to run the migration."""
    # Your 17 Gamma URLs (including the working Lupes Tamales)
    gamma_urls = [
        "https://lupes-gourmet-tamales-ki0bb9s.gamma.site/",  # ✅ WORKING - Seasonal Food Blitz
        "https://stress-free-plumbing-fre-o80krz7.gamma.site/",  # Plumber Urgency
        "https://coolfix-fresno-xhcbhqq.gamma.site/",  # HVAC Heatwave
        "https://coolfix-fresno-lvcnlk0.gamma.site/",  # HVAC Trust
        "https://coolfix-fresno-w6yxeky.gamma.site/",  # HVAC Value
        "https://coolfixfresno-vjvpban.gamma.site/",  # HVAC Emergency
        "https://fresno-plumber-marketing-mpxds4u.gamma.site/",  # Plumber Marketing
        "https://modesto-piano-movers-vkcjkyg.gamma.site/",  # Movers Trust
        "https://r-movers-smb9gbi.gamma.site/",  # Movers Urgency
        "https://r-movers-nszrisn.gamma.site/",  # Movers Value
        "https://modesto-movers-zpfo6w4.gamma.site/",  # Movers Local
        "https://rmovers-ienbs1i.gamma.site/",  # Movers Professional
        "https://rmoversmodesto-odlov19.gamma.site/",  # Movers Bilingual
        "https://rmoversmodesto-hkzjsdi.gamma.site/",  # Movers Family
        "https://mudanzas-r-movers-sb78tsz.gamma.site/",  # Movers Spanish
        "https://labor-day-weekend-sale-2i56zet.gamma.site/"  # Seasonal Sale
    ]
    
    logger.info(f"🚀 Starting Gamma Gallery Migration with {len(gamma_urls)} URLs")
    logger.info(f"📊 Expected cost: ${len(gamma_urls) * 0.50:.2f}")
    logger.info(f"⏱️ Estimated duration: {len(gamma_urls) * 3} minutes")
    
    try:
        migrator = GammaMigrator()
        migrator.run_migration(gamma_urls)
        
        # Print final summary
        logger.info("🎉 Migration completed!")
        logger.info(f"📊 Final Results:")
        logger.info(f"   • Total URLs: {migrator.migration_log['total_urls']}")
        logger.info(f"   • Successful: {migrator.migration_log['successful']}")
        logger.info(f"   • Failed: {migrator.migration_log['failed']}")
        logger.info(f"   • Warnings: {len(migrator.migration_log['warnings'])}")
        logger.info(f"   • Cost: ${migrator.migration_log['cost_estimate']:.2f}")
        logger.info(f"   • Duration: {migrator.migration_log.get('duration_minutes', 0):.1f} minutes")
        
        if migrator.migration_log['warnings']:
            logger.info("⚠️ Warnings encountered:")
            for warning in migrator.migration_log['warnings']:
                logger.info(f"   • {warning['url']}: {warning['warnings']}")
        
        if migrator.migration_log['errors']:
            logger.info("❌ Errors encountered:")
            for error in migrator.migration_log['errors'][:5]:  # Show first 5 errors
                logger.info(f"   • {error}")
            if len(migrator.migration_log['errors']) > 5:
                logger.info(f"   • ... and {len(migrator.migration_log['errors']) - 5} more errors")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
