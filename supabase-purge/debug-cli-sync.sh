#!/bin/bash
# 🔍 SUPABASE CLI DEBUG SCRIPT
# Run this to diagnose CLI sync issues

echo "🔍 SUPABASE CLI SYNC DEBUG SCRIPT"
echo "=================================="

# Check environment
echo "1. Environment Check:"
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+SET}"
echo "   Project Ref: auyjsmtnfnnapjdrzhea"

# Check CLI version
echo "2. CLI Version:"
supabase --version

# Check project link
echo "3. Project Link Status:"
supabase projects list | grep auyjsmtnfnnapjdrzhea

# Check migration status
echo "4. Migration Status:"
supabase db pull --dry-run

# Check Docker
echo "5. Docker Status:"
docker ps > /dev/null 2>&1 && echo "   Docker: Running" || echo "   Docker: Not running"

# Test API connection
echo "6. API Connection Test:"
curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "https://auyjsmtnfnnapjdrzhea.supabase.co/rest/v1/" | head -1

echo "7. Recommendations:"
echo "   - If migration issues: Use manual SQL editor"
echo "   - If Docker issues: Use --remote flag or manual editor"
echo "   - If API issues: Verify service role key in dashboard"
echo "   - If CLI issues: Use alternative execution methods"

echo "✅ Debug complete!"
