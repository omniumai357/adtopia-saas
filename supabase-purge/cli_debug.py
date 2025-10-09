#!/usr/bin/env python3
"""
🔍 CLI SYNC DEBUGGER + ALTERNATIVES
Diagnose why Supabase CLI sync fails and provide alternatives
"""

import subprocess
import os
import json
from typing import Dict, List, Tuple

class SupabaseCLIDebugger:
    """Debug Supabase CLI sync issues and provide alternatives"""
    
    def __init__(self):
        self.project_ref = "auyjsmtnfnnapjdrzhea"
        self.dashboard_url = f"https://supabase.com/dashboard/project/{self.project_ref}/sql"
        
    def debug_cli_sync(self, issues: List[str]) -> Dict[str, str]:
        """Diagnose CLI sync issues"""
        print("🔍 DIAGNOSING SUPABASE CLI SYNC ISSUES...")
        print("=" * 50)
        
        diagnostics = {}
        
        # Check 1: Migration mismatch
        print("1. Checking migration history...")
        try:
            result = subprocess.run(
                ["supabase", "db", "pull", "--debug"],
                capture_output=True,
                text=True,
                timeout=30
            )
            if "migration history" in result.stderr.lower():
                diagnostics["migration_mismatch"] = "❌ Remote migrations not in local repo"
                diagnostics["migration_fix"] = "supabase db pull; supabase migration repair --status applied [date]"
            else:
                diagnostics["migration_mismatch"] = "✅ Migration history OK"
        except Exception as e:
            diagnostics["migration_mismatch"] = f"❌ Error: {str(e)}"
        
        # Check 2: Docker dependency
        print("2. Checking Docker dependency...")
        try:
            result = subprocess.run(
                ["docker", "ps"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                diagnostics["docker_issue"] = "❌ Docker not running or not installed"
                diagnostics["docker_fix"] = "Skip local—use --remote for cloud operations"
            else:
                diagnostics["docker_issue"] = "✅ Docker available"
        except Exception as e:
            diagnostics["docker_issue"] = f"❌ Docker error: {str(e)}"
        
        # Check 3: API key
        print("3. Checking API key...")
        api_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if api_key:
            key_length = len(api_key)
            if key_length > 50:
                diagnostics["api_key"] = f"✅ API key present ({key_length} chars)"
            else:
                diagnostics["api_key"] = "❌ API key too short"
        else:
            diagnostics["api_key"] = "❌ SUPABASE_SERVICE_ROLE_KEY not set"
            diagnostics["api_key_fix"] = "Verify in Supabase dashboard → Settings → API"
        
        # Check 4: CLI commands
        print("4. Checking CLI command availability...")
        try:
            result = subprocess.run(
                ["supabase", "db", "--help"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if "--file" in result.stdout:
                diagnostics["cli_file_flag"] = "✅ --file flag available"
            else:
                diagnostics["cli_file_flag"] = "❌ --file flag not available"
                diagnostics["cli_fix"] = "Use supabase db push for migrations instead"
        except Exception as e:
            diagnostics["cli_file_flag"] = f"❌ CLI error: {str(e)}"
        
        return diagnostics
    
    def generate_alternatives(self) -> Dict[str, str]:
        """Generate alternative execution methods"""
        print("\n🔄 GENERATING ALTERNATIVE EXECUTION METHODS...")
        print("=" * 50)
        
        alternatives = {}
        
        # Alternative 1: Manual SQL Editor
        alternatives["manual_editor"] = f"""
-- MANUAL SQL EDITOR EXECUTION (RECOMMENDED)
-- URL: {self.dashboard_url}
-- Steps:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy/paste SQL blocks from supabase-fixes-setup.py
-- 3. Execute in order: Security → Performance → Verification
-- 4. Verify with provided queries
-- Time: 5-10 minutes
-- Risk: Low (direct database access)
"""
        
        # Alternative 2: REST API
        alternatives["rest_api"] = f"""
-- REST API EXECUTION
-- Requires: Valid SUPABASE_SERVICE_ROLE_KEY
curl -X POST 'https://{self.project_ref}.supabase.co/rest/v1/rpc/execute_fixes' \\
  -H 'Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{{"sql": "[fixes_sql_here]"}}'

-- Note: Requires custom RPC function to be created first
"""
        
        # Alternative 3: Direct PostgreSQL
        alternatives["direct_postgres"] = f"""
-- DIRECT POSTGRESQL CONNECTION
-- Requires: Database connection string
psql "postgresql://postgres:[password]@db.{self.project_ref}.supabase.co:5432/postgres" \\
  -f security-fixes.sql \\
  -f performance-optimizations.sql \\
  -f verification-queries.sql

-- Note: Requires database password and network access
"""
        
        # Alternative 4: Migration Repair
        alternatives["migration_repair"] = """
-- MIGRATION REPAIR (RISKY)
# Pull latest migrations
supabase db pull

# Repair migration history
supabase migration repair --status applied 20250901054434
supabase migration repair --status applied 20250901062036
# ... (repeat for all missing migrations)

# Push new migration
supabase db push

-- Risk: May cause data loss or conflicts
"""
        
        return alternatives
    
    def generate_debug_script(self) -> str:
        """Generate debug script for troubleshooting"""
        debug_script = f"""#!/bin/bash
# 🔍 SUPABASE CLI DEBUG SCRIPT
# Run this to diagnose CLI sync issues

echo "🔍 SUPABASE CLI SYNC DEBUG SCRIPT"
echo "=================================="

# Check environment
echo "1. Environment Check:"
echo "   SUPABASE_SERVICE_ROLE_KEY: ${{SUPABASE_SERVICE_ROLE_KEY:+SET}}"
echo "   Project Ref: {self.project_ref}"

# Check CLI version
echo "2. CLI Version:"
supabase --version

# Check project link
echo "3. Project Link Status:"
supabase projects list | grep {self.project_ref}

# Check migration status
echo "4. Migration Status:"
supabase db pull --dry-run

# Check Docker
echo "5. Docker Status:"
docker ps > /dev/null 2>&1 && echo "   Docker: Running" || echo "   Docker: Not running"

# Test API connection
echo "6. API Connection Test:"
curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \\
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \\
     "https://{self.project_ref}.supabase.co/rest/v1/" | head -1

echo "7. Recommendations:"
echo "   - If migration issues: Use manual SQL editor"
echo "   - If Docker issues: Use --remote flag or manual editor"
echo "   - If API issues: Verify service role key in dashboard"
echo "   - If CLI issues: Use alternative execution methods"

echo "✅ Debug complete!"
"""
        return debug_script
    
    def run_full_debug(self) -> None:
        """Run complete CLI debug and generate solutions"""
        print("🚨 SUPABASE CLI SYNC DEBUGGER + ALTERNATIVES")
        print("=" * 60)
        
        # Run diagnostics
        issues = ["migration_mismatch", "docker_dependency", "api_key", "cli_commands"]
        diagnostics = self.debug_cli_sync(issues)
        
        # Print diagnostics
        print("\n📊 DIAGNOSTIC RESULTS:")
        for key, value in diagnostics.items():
            print(f"   {key}: {value}")
        
        # Generate alternatives
        alternatives = self.generate_alternatives()
        
        # Save debug script
        debug_script = self.generate_debug_script()
        with open("debug-cli-sync.sh", "w") as f:
            f.write(debug_script)
        
        # Save alternatives
        with open("execution-alternatives.md", "w") as f:
            f.write("# SUPABASE EXECUTION ALTERNATIVES\n\n")
            for method, content in alternatives.items():
                f.write(f"## {method.upper().replace('_', ' ')}\n")
                f.write(content)
                f.write("\n")
        
        print("\n✅ DEBUG COMPLETE!")
        print("📁 Files created:")
        print("   - debug-cli-sync.sh (run to diagnose)")
        print("   - execution-alternatives.md (alternative methods)")
        print()
        print("🎯 RECOMMENDATION: Use Manual SQL Editor method")
        print(f"   URL: {self.dashboard_url}")
        print("   Time: 5-10 minutes")
        print("   Risk: Low")

def main():
    """Main execution function"""
    debugger = SupabaseCLIDebugger()
    debugger.run_full_debug()

if __name__ == "__main__":
    main()
