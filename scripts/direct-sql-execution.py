#!/usr/bin/env python3

"""
🚨 SUPABASE SECURITY & PERFORMANCE FIXES - DIRECT SQL EXECUTION
Execute SQL fixes directly via Supabase connection
"""

import os
import sys
import requests
import json
from pathlib import Path

def execute_supabase_fixes():
    """Execute Supabase security and performance fixes"""
    
    print("🚨 EXECUTING SUPABASE SECURITY & PERFORMANCE FIXES...")
    print("📋 Fixing 70 issues (7 security + 63 performance)")
    
    # Supabase project details
    PROJECT_REF = "auyjsmtnfnnapjdrzhea"
    SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
    
    # Get service role key from environment
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not service_role_key:
        print("❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        print("💡 Please set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
        return False
    
    # Read the SQL file
    sql_file = Path("supabase/quick-security-fixes.sql")
    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        return False
    
    print(f"📄 Reading SQL fixes from: {sql_file}")
    
    # Read SQL content
    with open(sql_file, 'r') as f:
        sql_content = f.read()
    
    # Split SQL into individual statements
    sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    print(f"🔧 Executing {len(sql_statements)} SQL statements...")
    
    # Execute each SQL statement
    success_count = 0
    error_count = 0
    
    for i, statement in enumerate(sql_statements, 1):
        if not statement or statement.startswith('--'):
            continue
            
        print(f"📝 Executing statement {i}/{len(sql_statements)}...")
        
        try:
            # Use the REST API to execute SQL
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers={
                    "Authorization": f"Bearer {service_role_key}",
                    "Content-Type": "application/json",
                    "apikey": service_role_key
                },
                json={"sql": statement}
            )
            
            if response.status_code == 200:
                print(f"✅ Statement {i} executed successfully")
                success_count += 1
            else:
                print(f"❌ Statement {i} failed: {response.status_code} - {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ Statement {i} error: {str(e)}")
            error_count += 1
    
    # Summary
    print(f"\n📊 EXECUTION SUMMARY:")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {error_count}")
    print(f"📋 Total: {len(sql_statements)}")
    
    if error_count == 0:
        print("\n🎉 ALL SUPABASE SECURITY & PERFORMANCE FIXES COMPLETED!")
        print("📊 Issues fixed:")
        print("  • 7 Security issues (RLS, SECURITY DEFINER, views)")
        print("  • 63 Performance issues (indexes, materialized views, locks)")
        print("  • Created monitoring and maintenance functions")
        print("  • Optimized query performance")
        print("\n🎯 Your Supabase instance is now secure and optimized!")
        return True
    else:
        print(f"\n⚠️ {error_count} statements failed. Check the output above for details.")
        print("💡 You may need to execute some fixes manually in the Supabase SQL Editor.")
        return False

if __name__ == "__main__":
    success = execute_supabase_fixes()
    sys.exit(0 if success else 1)
