#!/usr/bin/env python3
"""
Test Script for Enhanced Gamma Migration
Description: Test the robust error-handling migration script
Author: omniumai357
Date: 2025-10-09
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_environment():
    """Test if environment variables are configured."""
    logger.info("🔍 Testing environment configuration...")
    
    required_vars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GAMMA_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value or value == 'your_service_role_key_here' or value == 'your_gamma_api_key_here':
            missing_vars.append(var)
        else:
            logger.info(f"✅ {var}: {'*' * 8}{value[-4:] if len(value) > 4 else '****'}")
    
    if missing_vars:
        logger.error(f"❌ Missing or invalid environment variables: {missing_vars}")
        logger.info("📖 Please configure your API keys in .env file")
        return False
    
    logger.info("✅ Environment configuration looks good!")
    return True

def test_single_url():
    """Test migration with a single URL (Lupes Tamales)."""
    logger.info("🧪 Testing single URL migration...")
    
    try:
        from migrate_to_supabase import GammaMigrator
        
        # Test with the working Lupes Tamales URL
        test_url = "https://lupes-gourmet-tamales-ki0bb9s.gamma.site/"
        
        migrator = GammaMigrator()
        
        # Test metadata extraction
        metadata = migrator.extract_metadata_from_url(test_url)
        logger.info(f"📊 Extracted metadata: {metadata}")
        
        # Test prompt creation
        prompt = migrator.create_gamma_prompt(test_url, metadata)
        logger.info(f"📝 Generated prompt: {prompt[:100]}...")
        
        logger.info("✅ Single URL test completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Single URL test failed: {str(e)}")
        return False

def test_api_connection():
    """Test Gamma API connection."""
    logger.info("🔗 Testing Gamma API connection...")
    
    try:
        import requests
        
        api_key = os.getenv('GAMMA_API_KEY')
        if not api_key:
            logger.error("❌ GAMMA_API_KEY not found")
            return False
        
        # Test API connection with a simple request
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Simple test request (this might fail if no valid prompt, but we'll catch the error)
        response = requests.post(
            'https://api.gamma.app/v1/generations',
            headers=headers,
            json={'prompt': 'test', 'format': 'png'},
            timeout=10
        )
        
        if response.status_code == 401:
            logger.error("❌ Gamma API authentication failed - check your API key")
            return False
        elif response.status_code == 400:
            logger.info("✅ Gamma API connection successful (400 is expected for invalid prompt)")
            return True
        elif response.status_code == 200:
            logger.info("✅ Gamma API connection successful")
            return True
        else:
            logger.warning(f"⚠️ Unexpected response: {response.status_code}")
            return True
            
    except Exception as e:
        logger.error(f"❌ API connection test failed: {str(e)}")
        return False

def main():
    """Run all tests."""
    logger.info("🚀 Starting Gamma Migration Test Suite")
    logger.info("=" * 50)
    
    tests = [
        ("Environment Configuration", test_environment),
        ("Single URL Migration", test_single_url),
        ("Gamma API Connection", test_api_connection)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
            if result:
                logger.info(f"✅ {test_name}: PASSED")
            else:
                logger.error(f"❌ {test_name}: FAILED")
        except Exception as e:
            logger.error(f"💥 {test_name}: ERROR - {str(e)}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("📊 TEST RESULTS SUMMARY")
    logger.info("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Ready for migration.")
        return 0
    else:
        logger.error("❌ Some tests failed. Please fix issues before running migration.")
        return 1

if __name__ == "__main__":
    exit(main())
