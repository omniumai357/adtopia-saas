-- Simple test migration to verify CLI is working
CREATE TABLE IF NOT EXISTS test_migration_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test data
INSERT INTO test_migration_table (name) VALUES ('CLI Migration Test') ON CONFLICT DO NOTHING;

-- Log the test
INSERT INTO admin_audit_log (action, details, created_at)
VALUES (
  'cli_migration_test',
  jsonb_build_object(
    'test_timestamp', NOW(),
    'test_status', 'success',
    'migration_method', 'supabase_cli',
    'user', 'omniumai357'
  ),
  NOW()
);

SELECT '✅ CLI Migration Test Successful' as status;
