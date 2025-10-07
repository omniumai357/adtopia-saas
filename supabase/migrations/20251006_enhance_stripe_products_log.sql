-- Enhance stripe_products_log table for full sync support
ALTER TABLE public.stripe_products_log 
ADD COLUMN IF NOT EXISTS internal_id text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS features jsonb,
ADD COLUMN IF NOT EXISTS sync_action text,
ADD COLUMN IF NOT EXISTS last_synced timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS project text DEFAULT 'adtopia';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_products_log_internal_id 
ON public.stripe_products_log(internal_id);

CREATE INDEX IF NOT EXISTS idx_stripe_products_log_category 
ON public.stripe_products_log(category);

CREATE INDEX IF NOT EXISTS idx_stripe_products_log_project 
ON public.stripe_products_log(project);

-- Create unique constraint on stripe_product_id for upserts
ALTER TABLE public.stripe_products_log 
ADD CONSTRAINT IF NOT EXISTS unique_stripe_product_id 
UNIQUE (stripe_product_id);

-- Add RLS policy for admin access to enhanced table
CREATE POLICY IF NOT EXISTS "Admins can read stripe_products_log" 
ON public.stripe_products_log 
FOR SELECT 
TO authenticated 
USING (is_admin());

-- Add RLS policy for service role to insert/update
CREATE POLICY IF NOT EXISTS "Service role can manage stripe_products_log" 
ON public.stripe_products_log 
FOR ALL 
TO service_role 
USING (true);
