# SUPABASE EXECUTION ALTERNATIVES

## MANUAL EDITOR

-- MANUAL SQL EDITOR EXECUTION (RECOMMENDED)
-- URL: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea/sql
-- Steps:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy/paste SQL blocks from supabase-fixes-setup.py
-- 3. Execute in order: Security → Performance → Verification
-- 4. Verify with provided queries
-- Time: 5-10 minutes
-- Risk: Low (direct database access)

## REST API

-- REST API EXECUTION
-- Requires: Valid SUPABASE_SERVICE_ROLE_KEY
curl -X POST 'https://auyjsmtnfnnapjdrzhea.supabase.co/rest/v1/rpc/execute_fixes' \
  -H 'Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"sql": "[fixes_sql_here]"}'

-- Note: Requires custom RPC function to be created first

## DIRECT POSTGRES

-- DIRECT POSTGRESQL CONNECTION
-- Requires: Database connection string
psql "postgresql://postgres:[password]@db.auyjsmtnfnnapjdrzhea.supabase.co:5432/postgres" \
  -f security-fixes.sql \
  -f performance-optimizations.sql \
  -f verification-queries.sql

-- Note: Requires database password and network access

## MIGRATION REPAIR

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

