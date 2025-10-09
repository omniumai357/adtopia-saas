#!/bin/bash
# 🚀 EXECUTE MIGRATION VIA REST API
# Bypass CLI connection issues and execute directly via Supabase REST API

echo "🚀 EXECUTING MIGRATION VIA REST API..."
echo "📋 Bypassing CLI connection issues"

# Load environment variables
source .env.local

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
    echo "📋 Please check your .env.local file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📋 Supabase URL: $SUPABASE_URL"
echo "📋 Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Read the comprehensive migration file
MIGRATION_FILE="supabase/migrations/20241009_comprehensive_70_issue_purge.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"

# Execute migration via REST API
echo "🚀 Executing migration via REST API..."

# Use the Supabase REST API to execute SQL
curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -d "{\"sql\": \"$(cat $MIGRATION_FILE | sed 's/"/\\"/g' | tr '\n' ' ')\"}" \
  --connect-timeout 30 \
  --max-time 300

if [ $? -eq 0 ]; then
    echo "✅ Migration executed successfully via REST API"
else
    echo "❌ Migration execution failed via REST API"
    echo "📋 Fallback: Execute manually in SQL Editor"
    echo "🌐 URL: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea/sql"
    echo "📋 File: $MIGRATION_FILE"
fi

echo "🎯 Migration execution complete"
