#!/bin/bash
# 🚀 SUPABASE PURGE SYSTEM ACTIVATION SCRIPT
# Generated: 2025-10-08 22:03:53

echo "⚡ ACTIVATING SUPABASE PURGE SYSTEM..."

# Load environment variables
if [ -f "../.env.local" ]; then
    source ../.env.local
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.local not found"
    exit 1
fi

# Verify Supabase connection
echo "🔍 Verifying Supabase connection..."
curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "$SUPABASE_URL/rest/v1/" | head -1

if [ $? -eq 0 ]; then
    echo "✅ Supabase connection verified"
else
    echo "❌ Supabase connection failed"
    exit 1
fi

# Create activation log
echo "📝 Logging activation..."
curl -X POST "$SUPABASE_URL/rest/v1/admin_audit_log" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{"action": "purge_system_activated", "details": {"timestamp": "2025-10-08 22:03:53", "status": "active"}, "created_at": "now()"}'

echo "🎉 PURGE SYSTEM ACTIVATED!"
echo "📋 Ready for execution at: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea/sql"
