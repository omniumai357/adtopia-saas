-- AdTopia Database Schema
-- Production-ready with RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Ad Cards table
CREATE TABLE public.ad_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  qr_code_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_card_id UUID REFERENCES public.ad_cards(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'share', 'download')),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE public.gallery_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Ad Cards policies
CREATE POLICY "Users can view own ad cards" ON public.ad_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad cards" ON public.ad_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad cards" ON public.ad_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad cards" ON public.ad_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_cards 
      WHERE ad_cards.id = analytics.ad_card_id 
      AND ad_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert analytics" ON public.analytics
  FOR INSERT WITH CHECK (true);

-- Gallery images are public read
CREATE POLICY "Gallery images are public read" ON public.gallery_images
  FOR SELECT USING (true);

-- Insert sample gallery images
INSERT INTO public.gallery_images (title, description, image_url, language, category, is_featured) VALUES
('Plumbing Services', 'Professional plumbing QR code', '/gallery/plumbing-en.jpg', 'en', 'services', true),
('Servicios de Plomería', 'Código QR profesional de plomería', '/gallery/plumbing-es.jpg', 'es', 'services', true),
('HVAC Services', 'HVAC service QR code', '/gallery/hvac-en.jpg', 'en', 'services', true),
('Servicios HVAC', 'Código QR de servicios HVAC', '/gallery/hvac-es.jpg', 'es', 'services', true);

-- Create indexes for performance
CREATE INDEX idx_purchases_email ON public.purchases(email);
CREATE INDEX idx_purchases_stripe_session ON public.purchases(stripe_session_id);
CREATE INDEX idx_ad_cards_user_id ON public.ad_cards(user_id);
CREATE INDEX idx_analytics_ad_card_id ON public.analytics(ad_card_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);
CREATE INDEX idx_gallery_images_language ON public.gallery_images(language);
CREATE INDEX idx_gallery_images_category ON public.gallery_images(category);
