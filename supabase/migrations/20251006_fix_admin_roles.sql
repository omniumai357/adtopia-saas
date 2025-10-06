-- Fix Admin Roles - UUID-based Role Management
-- This migration fixes the admin role system to use proper UUIDs

-- 1. First, let's see what users exist
-- Run this query first to see existing users:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- 2. Create admin role for omniumai357@example.com (if exists)
-- This uses dynamic lookup by email to get the correct UUID
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::text
FROM auth.users 
WHERE email = 'omniumai357@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Create admin role for any other admin emails you want
-- Add more INSERT statements for other admin users:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::text
-- FROM auth.users 
-- WHERE email = 'admin@adtopia.io'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verify admin roles were created
-- Run this query to confirm admin roles:
-- SELECT ur.user_id, ur.role, au.email 
-- FROM public.user_roles ur
-- JOIN auth.users au ON ur.user_id = au.id
-- WHERE ur.role = 'admin';

-- 5. Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 6. Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 7. Create function to grant admin role by email
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;
  
  -- If user not found, return false
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- 8. Create function to revoke admin role by email
CREATE OR REPLACE FUNCTION public.revoke_admin_by_email(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;
  
  -- If user not found, return false
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Delete admin role
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id 
  AND role = 'admin';
  
  RETURN TRUE;
END;
$$;

-- 9. Add comments for documentation
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION public.get_user_role() IS 'Get current user role';
COMMENT ON FUNCTION public.grant_admin_by_email(TEXT) IS 'Grant admin role to user by email';
COMMENT ON FUNCTION public.revoke_admin_by_email(TEXT) IS 'Revoke admin role from user by email';

-- 10. Create view for admin users with emails
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
  ur.user_id,
  ur.role,
  au.email,
  au.created_at as user_created_at,
  ur.created_at as role_created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- 11. Grant access to admin users view
GRANT SELECT ON public.admin_users TO authenticated;

-- 12. Add RLS policy for admin users view
ALTER VIEW public.admin_users SET (security_invoker = true);

-- 13. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 14. Add helpful comments
COMMENT ON VIEW public.admin_users IS 'View of all admin users with their email addresses';
COMMENT ON TABLE public.user_roles IS 'User roles table - stores user permissions and access levels';
