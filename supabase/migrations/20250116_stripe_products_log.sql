-- Stripe Products Logging Schema
-- AdTopia SaaS - Comprehensive Product Tracking
-- Date: 2025-01-16

-- Create stripe_products_log table for tracking all created products
CREATE TABLE IF NOT EXISTS public.stripe_products_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional indexes for fast reporting
CREATE INDEX IF NOT EXISTS idx_stripe_products_project ON public.stripe_products_log(project);
CREATE INDEX IF NOT EXISTS idx_stripe_products_created_at ON public.stripe_products_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_products_stripe_id ON public.stripe_products_log(stripe_product_id);

-- Enable RLS for security
ALTER TABLE public.stripe_products_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_products_log
CREATE POLICY "Service role can manage all products log" ON public.stripe_products_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin can view all products log" ON public.stripe_products_log
  FOR SELECT USING (public.is_secure_admin());

-- Create function to log product creation
CREATE OR REPLACE FUNCTION public.log_stripe_product_creation(
  p_project TEXT,
  p_stripe_product_id TEXT,
  p_name TEXT,
  p_price_usd NUMERIC,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.stripe_products_log (
    project,
    stripe_product_id,
    name,
    price_usd,
    metadata
  ) VALUES (
    p_project,
    p_stripe_product_id,
    p_name,
    p_price_usd,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to get product creation summary
CREATE OR REPLACE FUNCTION public.get_stripe_products_summary(
  p_project TEXT DEFAULT NULL
)
RETURNS TABLE (
  project TEXT,
  total_products BIGINT,
  total_value NUMERIC,
  latest_creation TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spl.project,
    COUNT(*) as total_products,
    SUM(spl.price_usd) as total_value,
    MAX(spl.created_at) as latest_creation
  FROM public.stripe_products_log spl
  WHERE (p_project IS NULL OR spl.project = p_project)
  GROUP BY spl.project
  ORDER BY total_products DESC;
END;
$$;

-- Create function to get recent product activity
CREATE OR REPLACE FUNCTION public.get_recent_stripe_products(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  project TEXT,
  stripe_product_id TEXT,
  name TEXT,
  price_usd NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spl.id,
    spl.project,
    spl.stripe_product_id,
    spl.name,
    spl.price_usd,
    spl.created_at
  FROM public.stripe_products_log spl
  ORDER BY spl.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Insert sample data for AdTopia products (for testing)
INSERT INTO public.stripe_products_log (project, stripe_product_id, name, price_usd, metadata) VALUES
('adtopia', 'prod_sample_001', 'Starter Package', 29.00, '{"package_type": "starter", "category": "ad_package", "internal_id": "001"}'),
('adtopia', 'prod_sample_002', 'Growth Package', 79.00, '{"package_type": "growth", "category": "ad_package", "internal_id": "002"}'),
('adtopia', 'prod_sample_003', 'Pro Package', 149.00, '{"package_type": "pro", "category": "ad_package", "internal_id": "003"}'),
('adtopia', 'prod_sample_004', 'Full Beta Package', 297.00, '{"package_type": "full_beta", "category": "ad_package", "internal_id": "004"}'),
('adtopia', 'prod_sample_005', 'Extra Translation', 29.00, '{"package_type": "translation", "category": "add_on", "internal_id": "005"}'),
('adtopia', 'prod_sample_006', 'Domain + SSL', 49.00, '{"package_type": "domain_ssl", "category": "add_on", "internal_id": "006"}'),
('adtopia', 'prod_sample_007', 'Extra Cards', 39.00, '{"package_type": "extra_cards", "category": "add_on", "internal_id": "007"}'),
('adtopia', 'prod_sample_008', 'Premium Analytics', 19.00, '{"package_type": "analytics", "category": "add_on", "internal_id": "008"}'),
('adtopia', 'prod_sample_009', 'Social Media Pack', 35.00, '{"package_type": "social_pack", "category": "add_on", "internal_id": "009"}');

-- Create view for easy reporting
CREATE OR REPLACE VIEW public.stripe_products_report AS
SELECT 
  project,
  COUNT(*) as product_count,
  SUM(price_usd) as total_value,
  AVG(price_usd) as avg_price,
  MIN(price_usd) as min_price,
  MAX(price_usd) as max_price,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM public.stripe_products_log
GROUP BY project
ORDER BY total_value DESC;

-- Grant permissions
GRANT SELECT ON public.stripe_products_log TO authenticated;
GRANT SELECT ON public.stripe_products_report TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_stripe_product_creation TO service_role;
GRANT EXECUTE ON FUNCTION public.get_stripe_products_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_stripe_products TO authenticated;
