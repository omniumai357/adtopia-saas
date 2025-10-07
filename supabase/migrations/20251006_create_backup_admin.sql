-- Create backup admin account for operational safety
-- Run this in Supabase SQL Editor

-- First, create the backup admin user in auth.users (if not exists)
-- Note: You'll need to sign up with this email first, then run this SQL

-- Grant admin role to backup admin
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'backup-admin@adtopia.io'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Also grant to your main account if not already admin
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'omniumai357@gmail.com'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify admin accounts exist
SELECT 
  u.email,
  ur.role,
  u.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY u.created_at;
