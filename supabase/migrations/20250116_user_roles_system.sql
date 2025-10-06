-- User Roles and Access System
-- Date: 2025-01-16

-- 1. Create user_roles table with proper constraints
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

-- 2. Create user_access table
CREATE TABLE IF NOT EXISTS public.user_access (
  user_id UUID PRIMARY KEY,
  access_level TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON public.user_access(user_id);

-- 4. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_roles
DROP POLICY IF EXISTS "read_own_roles" ON public.user_roles;
CREATE POLICY "read_own_roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

-- 6. Create RLS policies for user_access
DROP POLICY IF EXISTS "read_own_access" ON public.user_access;
CREATE POLICY "read_own_access" ON public.user_access
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

-- 7. Revoke client-side writes (server-only)
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_access FROM anon, authenticated;

-- 8. Create function to grant default user role
CREATE OR REPLACE FUNCTION public.grant_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 9. Create trigger for auto-granting user role on signup
DROP TRIGGER IF EXISTS trg_grant_user_role ON auth.users;
CREATE TRIGGER trg_grant_user_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.grant_default_user_role();

-- 10. Create helper function for admin role verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- 11. Grant admin role to omniumai357 (idempotent)
INSERT INTO public.user_roles (user_id, role)
VALUES ('9123a30c-0f40-4205-abe4-2e183e6fdddf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 12. Grant starter access to omniumai357 (idempotent)
INSERT INTO public.user_access (user_id, access_level)
VALUES ('9123a30c-0f40-4205-abe4-2e183e6fdddf', 'STARTER')
ON CONFLICT (user_id) DO UPDATE
  SET access_level = EXCLUDED.access_level,
      updated_at = NOW();
