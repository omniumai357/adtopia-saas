-- Gamma Gallery Migration Setup
-- Migration: 20241009_gamma_gallery_setup.sql
-- Description: Create storage bucket, gamma_gallery table, and A/B testing extensions

BEGIN;

-- ========================================
-- STORAGE BUCKET SETUP
-- ========================================

-- Create storage bucket for gamma cards
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gamma-cards', 'gamma-cards', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- GAMMA GALLERY TABLE
-- ========================================

-- Create gamma_gallery table to store metadata for each card
CREATE TABLE IF NOT EXISTS public.gamma_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_gamma_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    niche TEXT NOT NULL,
    language TEXT CHECK (language IN ('en', 'es')),
    title TEXT NOT NULL,
    description TEXT,
    fomo_score INTEGER CHECK (fomo_score BETWEEN 1 AND 10),
    cta_type TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_placeholder BOOLEAN DEFAULT false,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gamma_niche ON public.gamma_gallery(niche);
CREATE INDEX IF NOT EXISTS idx_gamma_language ON public.gamma_gallery(language);
CREATE INDEX IF NOT EXISTS idx_gamma_featured ON public.gamma_gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_gamma_placeholder ON public.gamma_gallery(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_gamma_fomo_score ON public.gamma_gallery(fomo_score);

-- ========================================
-- A/B TESTING EXTENSIONS
-- ========================================

-- Extend ab_tests table to link with gamma gallery
ALTER TABLE public.ab_tests 
ADD COLUMN IF NOT EXISTS gamma_gallery_id UUID REFERENCES public.gamma_gallery(id),
ADD COLUMN IF NOT EXISTS dwell_time_seconds INTEGER,
ADD COLUMN IF NOT EXISTS cta_variant TEXT;

-- Create index for gamma gallery A/B tests
CREATE INDEX IF NOT EXISTS idx_ab_tests_gamma ON public.ab_tests(gamma_gallery_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on gamma_gallery
ALTER TABLE public.gamma_gallery ENABLE ROW LEVEL SECURITY;

-- Public read access for gallery images
CREATE POLICY "gamma_gallery_public_read" ON public.gamma_gallery
    FOR SELECT TO anon, authenticated
    USING (true);

-- Admin write access for gallery management
CREATE POLICY "gamma_gallery_admin_write" ON public.gamma_gallery
    FOR ALL TO authenticated
    USING (public.is_system_admin())
    WITH CHECK (public.is_system_admin());

-- ========================================
-- STORAGE RLS POLICIES
-- ========================================

-- Public read access for gamma-cards bucket
CREATE POLICY "gamma_cards_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'gamma-cards');

-- Admin write access for gamma-cards bucket
CREATE POLICY "gamma_cards_admin_write" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gamma-cards' AND 
        auth.role() = 'service_role'
    );

-- Admin update access for gamma-cards bucket
CREATE POLICY "gamma_cards_admin_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'gamma-cards' AND 
        auth.role() = 'service_role'
    );

-- Admin delete access for gamma-cards bucket
CREATE POLICY "gamma_cards_admin_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gamma-cards' AND 
        auth.role() = 'service_role'
    );

-- ========================================
-- UPDATE TRIGGER
-- ========================================

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_gamma_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to gamma_gallery
CREATE TRIGGER update_gamma_gallery_updated_at
    BEFORE UPDATE ON public.gamma_gallery
    FOR EACH ROW
    EXECUTE FUNCTION public.update_gamma_gallery_updated_at();

-- ========================================
-- SEED DATA FOR TESTING
-- ========================================

-- Insert placeholder data for testing
INSERT INTO public.gamma_gallery (
    original_gamma_url,
    storage_path,
    niche,
    language,
    title,
    description,
    fomo_score,
    cta_type,
    is_featured,
    is_placeholder,
    utm_campaign
) VALUES 
(
    'https://stress-free-plumbing-fre-o80krz7.gamma.site/',
    'plumber/en/placeholder-1.png',
    'plumber',
    'en',
    'Stress-Free Plumbing',
    'Professional plumbing services with 24/7 emergency support',
    8,
    'urgency',
    true,
    true,
    'plumber_urgency_test'
),
(
    'https://coolfix-fresno-xhcbhqq.gamma.site/',
    'hvac/en/placeholder-2.png',
    'hvac',
    'en',
    'CoolFix HVAC',
    'Beat Fresno heat with our $99 tune-up special',
    9,
    'urgency',
    true,
    true,
    'hvac_heatwave_test'
),
(
    'https://modesto-piano-movers-vkcjkyg.gamma.site/',
    'movers/en/placeholder-3.png',
    'movers',
    'en',
    'Modesto Piano Movers',
    'Professional piano moving with 14 years experience',
    7,
    'trust',
    false,
    true,
    'movers_trust_test'
);

-- ========================================
-- AUDIT LOGGING
-- ========================================

INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'gamma_gallery_setup_completed',
    jsonb_build_object(
        'migration_type', 'gamma_gallery_setup',
        'storage_bucket_created', 'gamma-cards',
        'gamma_gallery_table_created', true,
        'ab_tests_extended', true,
        'rls_policies_created', 6,
        'seed_data_inserted', 3,
        'deployed_by', 'omniumai357',
        'deployment_timestamp', NOW()
    ),
    NOW()
);

COMMIT;

-- Verification queries
SELECT '✅ GAMMA GALLERY SETUP COMPLETED' as status;
SELECT COUNT(*) as gamma_gallery_records FROM public.gamma_gallery;
SELECT COUNT(*) as storage_buckets FROM storage.buckets WHERE id = 'gamma-cards';
