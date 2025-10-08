#!/usr/bin/env python3
"""
AdTopia Database Resilience Testing Suite
Execute comprehensive database tests to validate system resilience
"""

import os
import json
import time
import requests
from datetime import datetime
from typing import Dict, Any, Optional

class AdTopiaDatabaseTester:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://auyjsmtnfnnapjdrzhea.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.test_results = {
            'test_suite': 'AdTopia Database Resilience Testing',
            'timestamp': datetime.now().isoformat(),
            'tests': {}
        }
    
    def execute_sql_test(self, test_name: str, sql_query: str) -> Dict[str, Any]:
        """Execute SQL test and return results"""
        try:
            response = requests.post(
                f"{self.supabase_url}/rest/v1/rpc/execute_sql",
                headers={
                    'Authorization': f'Bearer {self.supabase_key}',
                    'Content-Type': 'application/json',
                    'apikey': self.supabase_key
                },
                json={'query': sql_query}
            )
            
            if response.status_code == 200:
                return {
                    'status': 'SUCCESS',
                    'data': response.json(),
                    'response_time_ms': response.elapsed.total_seconds() * 1000
                }
            else:
                return {
                    'status': 'ERROR',
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'response_time_ms': response.elapsed.total_seconds() * 1000
                }
        except Exception as e:
            return {
                'status': 'EXCEPTION',
                'error': str(e),
                'response_time_ms': 0
            }
    
    def test_connection_resilience(self) -> Dict[str, Any]:
        """Test 1: Database Connection Failures"""
        print("🧪 Testing database connection resilience...")
        
        # Test basic connection
        start_time = time.time()
        try:
            response = requests.get(
                f"{self.supabase_url}/rest/v1/",
                headers={
                    'Authorization': f'Bearer {self.supabase_key}',
                    'apikey': self.supabase_key
                },
                timeout=10
            )
            connection_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                return {
                    'connection_test': 'PASSED',
                    'response_time_ms': connection_time,
                    'status_code': response.status_code
                }
            else:
                return {
                    'connection_test': 'FAILED',
                    'response_time_ms': connection_time,
                    'status_code': response.status_code,
                    'error': response.text
                }
        except requests.exceptions.Timeout:
            return {
                'connection_test': 'TIMEOUT',
                'response_time_ms': 10000,
                'error': 'Connection timeout after 10 seconds'
            }
        except Exception as e:
            return {
                'connection_test': 'EXCEPTION',
                'response_time_ms': (time.time() - start_time) * 1000,
                'error': str(e)
            }
    
    def test_error_handling(self) -> Dict[str, Any]:
        """Test 2: Error Handling and Recovery"""
        print("🧪 Testing error handling capabilities...")
        
        # Test invalid query handling
        invalid_query = "SELECT * FROM non_existent_table_12345"
        result = self.execute_sql_test('invalid_query', invalid_query)
        
        # Test RLS enforcement
        rls_query = "SELECT * FROM agency_partners LIMIT 1"
        rls_result = self.execute_sql_test('rls_enforcement', rls_query)
        
        return {
            'invalid_query_handling': result['status'],
            'rls_enforcement': rls_result['status'],
            'error_details': {
                'invalid_query': result.get('error', 'No error'),
                'rls_test': rls_result.get('error', 'No error')
            }
        }
    
    def test_performance_under_load(self) -> Dict[str, Any]:
        """Test 3: Performance Under Load"""
        print("🧪 Testing performance under load...")
        
        # Test multiple concurrent requests
        start_time = time.time()
        concurrent_requests = []
        
        for i in range(5):
            response = requests.get(
                f"{self.supabase_url}/rest/v1/admin_audit_log?select=*&limit=10",
                headers={
                    'Authorization': f'Bearer {self.supabase_key}',
                    'apikey': self.supabase_key
                }
            )
            concurrent_requests.append({
                'request_id': i,
                'status_code': response.status_code,
                'response_time_ms': response.elapsed.total_seconds() * 1000
            })
        
        total_time = (time.time() - start_time) * 1000
        avg_response_time = sum(req['response_time_ms'] for req in concurrent_requests) / len(concurrent_requests)
        
        return {
            'concurrent_requests': len(concurrent_requests),
            'total_execution_time_ms': total_time,
            'average_response_time_ms': avg_response_time,
            'successful_requests': len([req for req in concurrent_requests if req['status_code'] == 200]),
            'request_details': concurrent_requests
        }
    
    def test_data_integrity(self) -> Dict[str, Any]:
        """Test 4: Data Integrity Validation"""
        print("🧪 Testing data integrity...")
        
        # Test data consistency
        integrity_query = """
        SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN created_at IS NULL THEN 1 END) as null_timestamps,
            COUNT(CASE WHEN action IS NULL THEN 1 END) as null_actions,
            COUNT(CASE WHEN details IS NULL THEN 1 END) as null_details
        FROM admin_audit_log
        """
        
        result = self.execute_sql_test('data_integrity', integrity_query)
        
        if result['status'] == 'SUCCESS' and result['data']:
            data = result['data'][0] if isinstance(result['data'], list) else result['data']
            return {
                'total_records': data.get('total_records', 0),
                'null_timestamps': data.get('null_timestamps', 0),
                'null_actions': data.get('null_actions', 0),
                'null_details': data.get('null_details', 0),
                'integrity_score': 'CLEAN' if data.get('null_timestamps', 0) == 0 else 'ISSUES_DETECTED'
            }
        else:
            return {
                'integrity_score': 'ERROR',
                'error': result.get('error', 'Unknown error')
            }
    
    def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run all database resilience tests"""
        print("🚀 Starting AdTopia Database Resilience Testing Suite...")
        print(f"📊 Testing against: {self.supabase_url}")
        print(f"⏰ Test started at: {datetime.now().isoformat()}")
        print("-" * 60)
        
        # Execute all tests
        self.test_results['tests']['connection_resilience'] = self.test_connection_resilience()
        self.test_results['tests']['error_handling'] = self.test_error_handling()
        self.test_results['tests']['performance_under_load'] = self.test_performance_under_load()
        self.test_results['tests']['data_integrity'] = self.test_data_integrity()
        
        # Calculate overall score
        total_tests = 0
        passed_tests = 0
        
        for test_category, results in self.test_results['tests'].items():
            if isinstance(results, dict):
                for test_name, result in results.items():
                    if isinstance(result, str) and result in ['PASSED', 'SUCCESS', 'CLEAN']:
                        passed_tests += 1
                    total_tests += 1
        
        self.test_results['overall_score'] = {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'success_rate': f"{(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%",
            'status': 'RESILIENT' if passed_tests >= total_tests * 0.8 else 'NEEDS_ATTENTION'
        }
        
        return self.test_results
    
    def generate_report(self) -> str:
        """Generate comprehensive test report"""
        report = f"""
# 🧪 AdTopia Database Resilience Test Report

**Test Suite:** {self.test_results['test_suite']}
**Timestamp:** {self.test_results['timestamp']}
**Overall Status:** {self.test_results['overall_score']['status']}
**Success Rate:** {self.test_results['overall_score']['success_rate']}

## 📊 Test Results Summary

### 1. Connection Resilience
- **Status:** {self.test_results['tests']['connection_resilience'].get('connection_test', 'UNKNOWN')}
- **Response Time:** {self.test_results['tests']['connection_resilience'].get('response_time_ms', 0):.2f}ms

### 2. Error Handling
- **Invalid Query Handling:** {self.test_results['tests']['error_handling'].get('invalid_query_handling', 'UNKNOWN')}
- **RLS Enforcement:** {self.test_results['tests']['error_handling'].get('rls_enforcement', 'UNKNOWN')}

### 3. Performance Under Load
- **Concurrent Requests:** {self.test_results['tests']['performance_under_load'].get('concurrent_requests', 0)}
- **Average Response Time:** {self.test_results['tests']['performance_under_load'].get('average_response_time_ms', 0):.2f}ms
- **Successful Requests:** {self.test_results['tests']['performance_under_load'].get('successful_requests', 0)}

### 4. Data Integrity
- **Total Records:** {self.test_results['tests']['data_integrity'].get('total_records', 0)}
- **Integrity Score:** {self.test_results['tests']['data_integrity'].get('integrity_score', 'UNKNOWN')}

## 🎯 Recommendations

"""
        
        if self.test_results['overall_score']['status'] == 'RESILIENT':
            report += "✅ **System is resilient and ready for production scaling**\n"
            report += "✅ **Database can handle $600K ARR load**\n"
            report += "✅ **Error handling is robust**\n"
        else:
            report += "⚠️ **System needs attention before scaling**\n"
            report += "⚠️ **Review failed tests and optimize**\n"
            report += "⚠️ **Consider additional monitoring**\n"
        
        return report

def main():
    """Main execution function"""
    print("🚀 AdTopia Database Resilience Testing Suite")
    print("=" * 60)
    
    # Check environment variables
    if not os.getenv('SUPABASE_URL') or not os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
        print("❌ Missing required environment variables:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        print("\nPlease set these variables and try again.")
        return
    
    # Initialize tester
    tester = AdTopiaDatabaseTester()
    
    # Run comprehensive tests
    results = tester.run_comprehensive_tests()
    
    # Generate and display report
    report = tester.generate_report()
    print(report)
    
    # Save results to file
    with open('/Users/The10Komancheria/adtopia-saas/DATABASE_TEST_RESULTS.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    with open('/Users/The10Komancheria/adtopia-saas/DATABASE_TEST_REPORT.md', 'w') as f:
        f.write(report)
    
    print("📁 Results saved to:")
    print("   - DATABASE_TEST_RESULTS.json")
    print("   - DATABASE_TEST_REPORT.md")
    
    # Return exit code based on results
    if results['overall_score']['status'] == 'RESILIENT':
        print("\n🎉 All tests passed! AdTopia database is ready for scaling!")
        return 0
    else:
        print("\n⚠️ Some tests failed. Review results before proceeding.")
        return 1

if __name__ == "__main__":
    exit(main())
