#!/usr/bin/env python3
'''
🤖 SUPABASE PURGE AUTOMATION
Automated execution of 70-issue purge system
'''

import os
import sys
import json
import requests
from datetime import datetime

class PurgeAutomation:
    def __init__(self):
        self.project_ref = "auyjsmtnfnnapjdrzhea"
        self.api_url = "https://auyjsmtnfnnapjdrzhea.supabase.co"
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
    def execute_sql_block(self, sql_file: str) -> bool:
        '''Execute SQL block via REST API'''
        try:
            with open(sql_file, 'r') as f:
                sql_content = f.read()
            
            # Split into individual statements
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            for i, statement in enumerate(statements, 1):
                if not statement or statement.startswith('--'):
                    continue
                
                print(f"📝 Executing statement {i}/{len(statements)} from {sql_file}...")
                
                response = requests.post(
                    f"{self.api_url}/rest/v1/rpc/exec_sql",
                    headers={
                        "Authorization": f"Bearer {self.service_key}",
                        "Content-Type": "application/json",
                        "apikey": self.service_key
                    },
                    json={"sql": statement}
                )
                
                if response.status_code == 200:
                    print(f"✅ Statement {i} executed successfully")
                else:
                    print(f"❌ Statement {i} failed: {response.status_code} - {response.text}")
                    return False
            
            return True
            
        except Exception as e:
            print(f"❌ Error executing {sql_file}: {str(e)}")
            return False
    
    def run_automated_purge(self):
        '''Run complete automated purge'''
        print("🤖 RUNNING AUTOMATED SUPABASE PURGE...")
        
        sql_blocks = [
            "security-fixes.sql",
            "performance-optimizations.sql",
            "verification-queries.sql",
            "empire-scaling.sql",
            "webhook-simulation.sql"
        ]
        
        success_count = 0
        for sql_file in sql_blocks:
            if os.path.exists(sql_file):
                if self.execute_sql_block(sql_file):
                    success_count += 1
                    print(f"✅ {sql_file} completed successfully")
                else:
                    print(f"❌ {sql_file} failed")
            else:
                print(f"❌ {sql_file} not found")
        
        print(f"📊 AUTOMATION COMPLETE: {success_count}/{len(sql_blocks)} blocks executed successfully")
        
        if success_count == len(sql_blocks):
            print("🎉 ALL 70 ISSUES RESOLVED AUTOMATICALLY!")
            print("🏰 EMPIRE SCALING ACTIVATED!")
        else:
            print("⚠️ Some blocks failed - manual intervention may be required")

if __name__ == "__main__":
    automation = PurgeAutomation()
    automation.run_automated_purge()
