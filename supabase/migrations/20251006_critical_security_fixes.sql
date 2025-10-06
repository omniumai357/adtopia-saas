-- CRITICAL SECURITY FIXES - GDPR COMPLIANCE
-- Fix email-based RLS vulnerability that exposes customer data

-- 1. Fix email-based RLS vulnerability in purchases table
-- Current vulnerable policy allows any authenticated user to view other users' purchases
-- by knowing their email address - MAJOR GDPR VIOLATION

-- Drop vulnerable email-based policy
DROP POLICY IF EXISTS "users_view_own_purchases" ON purchases;

-- Create secure user_id-based policy
CREATE POLICY "users_view_own_purchases_secure" ON purchases
FOR SELECT 
TO authenticated
USING (
  -- Only allow access if user_id matches authenticated user
  user_id = auth.uid()
  OR
  -- Allow admin users to view all purchases
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 2. Add user_id column to purchases table if not exists
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- 4. Update existing purchases to link to users by email
-- This is a one-time migration to fix existing data
UPDATE purchases 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = purchases.customer_email 
  LIMIT 1
)
WHERE user_id IS NULL 
AND customer_email IS NOT NULL;

-- 5. Add RLS to purchases table if not enabled
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 6. Create secure insert policy
CREATE POLICY "users_insert_own_purchases" ON purchases
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 7. Create secure update policy
CREATE POLICY "users_update_own_purchases" ON purchases
FOR UPDATE 
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 8. Add comments for documentation
COMMENT ON POLICY "users_view_own_purchases_secure" ON purchases 
IS 'Secure RLS policy - users can only view their own purchases or admins can view all';

COMMENT ON POLICY "users_insert_own_purchases" ON purchases 
IS 'Secure RLS policy - users can only insert their own purchases or admins can insert any';

COMMENT ON POLICY "users_update_own_purchases" ON purchases 
IS 'Secure RLS policy - users can only update their own purchases or admins can update any';

-- 9. Create audit log for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admins_view_audit_log" ON security_audit_log
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 10. Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    current_setting('request.headers', true)::json->>'x-forwarded-for'::INET,
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add trigger to log purchase access
CREATE OR REPLACE FUNCTION log_purchase_access()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_security_event(
    'SELECT',
    'purchases',
    NEW.id::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for purchase access logging
DROP TRIGGER IF EXISTS purchase_access_audit ON purchases;
CREATE TRIGGER purchase_access_audit
  AFTER SELECT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION log_purchase_access();

-- 12. Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "users_view_own_rate_limits" ON rate_limits
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 13. Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Clean old entries
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  -- Get current count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND endpoint = p_endpoint
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO rate_limits (user_id, endpoint, request_count)
  VALUES (auth.uid(), p_endpoint, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Add webhook idempotency table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on webhook events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events
CREATE POLICY "service_role_webhook_events" ON webhook_events
FOR ALL 
TO service_role
USING (true);

-- 15. Create webhook idempotency function
CREATE OR REPLACE FUNCTION check_webhook_idempotency(
  p_stripe_event_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  event_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM webhook_events 
    WHERE stripe_event_id = p_stripe_event_id
  ) INTO event_exists;
  
  IF event_exists THEN
    RETURN FALSE; -- Event already processed
  END IF;
  
  -- Mark event as processed
  INSERT INTO webhook_events (stripe_event_id, event_type, processed)
  VALUES (p_stripe_event_id, 'unknown', TRUE)
  ON CONFLICT (stripe_event_id) DO NOTHING;
  
  RETURN TRUE; -- Event not processed before
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Add comments for all security measures
COMMENT ON TABLE security_audit_log IS 'Audit log for all security events and data access';
COMMENT ON TABLE rate_limits IS 'Rate limiting table to prevent API abuse';
COMMENT ON TABLE webhook_events IS 'Webhook idempotency table to prevent duplicate processing';
COMMENT ON FUNCTION log_security_event IS 'Logs security events for audit trail';
COMMENT ON FUNCTION check_rate_limit IS 'Checks and enforces rate limits for API endpoints';
COMMENT ON FUNCTION check_webhook_idempotency IS 'Prevents duplicate webhook processing';
