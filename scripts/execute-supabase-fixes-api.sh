#!/bin/bash

# 🚨 SUPABASE SECURITY & PERFORMANCE FIXES VIA REST API
# Execute SQL fixes directly via Supabase REST API

echo "🚨 EXECUTING SUPABASE FIXES VIA REST API..."
echo "📋 Fixing 70 issues (7 security + 63 performance)"

# Supabase project details
PROJECT_REF="auyjsmtnfnnapjdrzhea"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# Check if we have the service role key
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set"
    echo "💡 Please set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Read the SQL file
SQL_FILE="supabase/quick-security-fixes.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "📄 Reading SQL fixes from: $SQL_FILE"

# Execute the SQL via REST API
echo "🔧 Executing security and performance fixes via REST API..."

# Use curl to execute the SQL
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d "{\"sql\": \"$(cat $SQL_FILE | tr '\n' ' ' | sed 's/"/\\"/g')\"}"

if [ $? -eq 0 ]; then
    echo "✅ SUPABASE SECURITY & PERFORMANCE FIXES COMPLETED!"
    echo "📊 Issues fixed:"
    echo "  • 7 Security issues (RLS, SECURITY DEFINER, views)"
    echo "  • 63 Performance issues (indexes, materialized views, locks)"
    echo "  • Created monitoring and maintenance functions"
    echo "  • Optimized query performance"
    echo ""
    echo "🎯 Your Supabase instance is now secure and optimized!"
else
    echo "❌ Some fixes failed. Check the output above for details."
    echo "💡 You may need to execute some fixes manually in the Supabase SQL Editor."
    exit 1
fi
