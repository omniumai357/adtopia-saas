-- Create client gallery system tables
-- Manages 60-card vaults, heart favorites, and checkout flow

-- Client gallery images table (60-card vault)
CREATE TABLE IF NOT EXISTS client_gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('ad_card', 'landing_page', 'logo', 'banner')),
  service_type TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('urgency', 'value', 'hybrid')),
  title TEXT NOT NULL,
  description TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client cart items table
CREATE TABLE IF NOT EXISTS client_cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  image_id UUID NOT NULL REFERENCES client_gallery_images(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client gallery summary table
CREATE TABLE IF NOT EXISTS client_galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  total_images INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, service_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_gallery_images_client_id ON client_gallery_images(client_id);
CREATE INDEX IF NOT EXISTS idx_client_gallery_images_service_type ON client_gallery_images(service_type);
CREATE INDEX IF NOT EXISTS idx_client_gallery_images_variant ON client_gallery_images(variant);
CREATE INDEX IF NOT EXISTS idx_client_gallery_images_is_favorite ON client_gallery_images(is_favorite);
CREATE INDEX IF NOT EXISTS idx_client_cart_items_client_id ON client_cart_items(client_id);
CREATE INDEX IF NOT EXISTS idx_client_cart_items_image_id ON client_cart_items(image_id);
CREATE INDEX IF NOT EXISTS idx_client_galleries_client_id ON client_galleries(client_id);

-- Enable Row Level Security
ALTER TABLE client_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_galleries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_gallery_images
CREATE POLICY "Users can view own gallery images" ON client_gallery_images
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Users can update own gallery images" ON client_gallery_images
  FOR UPDATE 
  USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage all gallery images" ON client_gallery_images
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for client_cart_items
CREATE POLICY "Users can manage own cart items" ON client_cart_items
  FOR ALL 
  USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage all cart items" ON client_cart_items
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for client_galleries
CREATE POLICY "Users can view own galleries" ON client_galleries
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage all galleries" ON client_galleries
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, UPDATE ON client_gallery_images TO authenticated;
GRANT ALL ON client_cart_items TO authenticated;
GRANT SELECT ON client_galleries TO authenticated;

-- Add comments
COMMENT ON TABLE client_gallery_images IS '60-card vault for each client with heart favorites';
COMMENT ON TABLE client_cart_items IS 'Shopping cart for client gallery purchases';
COMMENT ON TABLE client_galleries IS 'Summary of client gallery statistics';
COMMENT ON COLUMN client_gallery_images.image_type IS 'Type of image (ad_card, landing_page, logo, banner)';
COMMENT ON COLUMN client_gallery_images.variant IS 'A/B test variant (urgency, value, hybrid)';
COMMENT ON COLUMN client_gallery_images.is_favorite IS 'Whether client has favorited this image';
