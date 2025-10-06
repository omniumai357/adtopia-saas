-- Stripe Products Log Table with RLS
-- Date: 2025-01-16

-- Create the stripe_products_log table
CREATE TABLE IF NOT EXISTS public.stripe_products_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is ON
ALTER TABLE public.stripe_products_log ENABLE ROW LEVEL SECURITY;

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop any existing policies to avoid duplicates
DROP POLICY IF EXISTS "admins_can_read_stripe_products_log" ON public.stripe_products_log;
DROP POLICY IF EXISTS "service_role_can_insert_stripe_products_log" ON public.stripe_products_log;

-- Allow only admins to read
CREATE POLICY "admins_can_read_stripe_products_log"
ON public.stripe_products_log
FOR SELECT
TO authenticated
USING ( public.is_admin() );

-- Allow service role to insert (for Edge Functions)
CREATE POLICY "service_role_can_insert_stripe_products_log"
ON public.stripe_products_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_products_log_project 
ON public.stripe_products_log (project);

CREATE INDEX IF NOT EXISTS idx_stripe_products_log_created_at 
ON public.stripe_products_log (created_at DESC);
