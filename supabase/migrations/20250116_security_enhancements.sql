-- Security Enhancements Migration
-- Based on BizBox migration security analysis
-- Date: 2025-01-16

-- 1. Create secure admin role verification function
CREATE OR REPLACE FUNCTION public.is_secure_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.email IN ('admin@bizbox.host', 'support@bizbox.host')
  );
$$;

-- 2. Update admin verification function to use secure method
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_secure_admin();
$$;

-- 3. Create data retention cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_customer_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_previews INTEGER;
  deleted_leads INTEGER;
BEGIN
  -- Delete previews older than 30 days
  DELETE FROM public.previews 
  WHERE viewed_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_previews = ROW_COUNT;
  
  -- Delete leads older than 90 days that haven't converted
  DELETE FROM public.leads 
  WHERE created_at < NOW() - INTERVAL '90 days' 
    AND status = 'pending';
  GET DIAGNOSTICS deleted_leads = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO public.conversion_events (
    session_id, event_type, email, metadata
  ) VALUES (
    'system_cleanup',
    'data_retention_cleanup',
    'system@bizbox.host',
    jsonb_build_object(
      'deleted_previews', deleted_previews,
      'deleted_leads', deleted_leads,
      'cleanup_date', NOW()
    )
  );
  
  RETURN deleted_previews + deleted_leads;
END;
$$;

-- 4. Create security audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_access(
  action_type text,
  resource_type text,
  resource_id text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.conversion_events (
    session_id, 
    event_type, 
    email,
    metadata
  ) VALUES (
    COALESCE(resource_id, gen_random_uuid()::text),
    'admin_access_audit',
    (SELECT email FROM public.profiles WHERE id = auth.uid()),
    jsonb_build_object(
      'action', action_type,
      'resource_type', resource_type,
      'resource_id', resource_id,
      'admin_user_id', auth.uid(),
      'timestamp', NOW(),
      'additional_data', metadata
    )
  );
END;
$$;

-- 5. Ensure profiles table has proper admin role constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_role_values 
CHECK (role IN ('user', 'admin', 'moderator'));

-- 6. Create index for better admin query performance
CREATE INDEX IF NOT EXISTS idx_profiles_admin_lookup 
ON public.profiles (role, email) 
WHERE role = 'admin';

-- 7. Update existing admin users to have proper role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('admin@bizbox.host', 'support@bizbox.host')
  AND role IS DISTINCT FROM 'admin';

-- 8. Create secure lead policies
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;
DROP POLICY IF EXISTS "Enhanced rate limited lead creation" ON public.leads;
DROP POLICY IF EXISTS "Rate limited lead creation" ON public.leads;

CREATE POLICY "Secure lead creation with rate limiting"
ON public.leads
FOR INSERT
WITH CHECK (
  check_rate_limit(email, 3, 15) AND
  length(email) > 5 AND
  email LIKE '%@%'
);

CREATE POLICY "Admin only lead access"
ON public.leads
FOR ALL
USING (public.is_secure_admin())
WITH CHECK (public.is_secure_admin());

-- 9. Create secure preview policies
DROP POLICY IF EXISTS "Rate limited preview creation" ON public.previews;

CREATE POLICY "Secure preview creation with rate limiting"
ON public.previews
FOR INSERT
WITH CHECK (
  check_rate_limit(email, 5, 15) AND
  length(email) > 5 AND
  email LIKE '%@%'
);

CREATE POLICY "Admin only preview access"
ON public.previews
FOR ALL
USING (public.is_secure_admin())
WITH CHECK (public.is_secure_admin());

-- 10. Create security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  email text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 11. Enable RLS on security_events table
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 12. Create policy for security_events (admin only)
CREATE POLICY "Admin only security events access"
ON public.security_events
FOR ALL
USING (public.is_secure_admin())
WITH CHECK (public.is_secure_admin());

-- 13. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_email text DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    email,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    event_type,
    auth.uid(),
    user_email,
    ip_address,
    user_agent,
    metadata
  );
END;
$$;
