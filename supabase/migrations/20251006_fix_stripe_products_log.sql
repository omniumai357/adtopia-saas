-- Fix stripe_products_log table with proper schema
DROP TABLE IF EXISTS public.stripe_products_log CASCADE;

CREATE TABLE public.stripe_products_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_product_id text NOT NULL,
  name text NOT NULL,
  price_usd numeric(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  internal_id text,
  category text,
  features jsonb,
  sync_action text,
  last_synced timestamptz DEFAULT now(),
  project text DEFAULT 'adtopia',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_stripe_products_log_internal_id ON public.stripe_products_log(internal_id);
CREATE INDEX idx_stripe_products_log_category ON public.stripe_products_log(category);
CREATE INDEX idx_stripe_products_log_project ON public.stripe_products_log(project);
CREATE INDEX idx_stripe_products_log_stripe_id ON public.stripe_products_log(stripe_product_id);

-- Create unique constraint on stripe_product_id for upserts
ALTER TABLE public.stripe_products_log 
ADD CONSTRAINT unique_stripe_product_id UNIQUE (stripe_product_id);

-- Enable RLS
ALTER TABLE public.stripe_products_log ENABLE ROW LEVEL SECURITY;

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create RLS policies
CREATE POLICY "Admins can read stripe_products_log" 
ON public.stripe_products_log 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Service role can manage stripe_products_log" 
ON public.stripe_products_log 
FOR ALL 
TO service_role 
USING (true);
