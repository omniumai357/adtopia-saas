-- Phase 2: Semi-Automatic Workflow with Supabase & API
-- Migration: 20241009_phase2_semi_automatic_workflow.sql
-- Description: Automated form handling, Gamma generation, and payment integration

BEGIN;

-- ========================================
-- PHASE 2: SEMI-AUTOMATIC WORKFLOW TABLES
-- ========================================

-- 1. Gamma Prompts Table (Customer Data Storage)
CREATE TABLE IF NOT EXISTS public.gamma_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    service TEXT NOT NULL,
    location TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    target_audience TEXT,
    pain_points TEXT[],
    budget_range TEXT,
    timeline TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gamma Generated Table (Generated Pages Storage)
CREATE TABLE IF NOT EXISTS public.gamma_generated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gamma_prompt_id UUID REFERENCES public.gamma_prompts(id) ON DELETE CASCADE,
    gamma_url TEXT,
    preview_url TEXT,
    template_used TEXT,
    generation_status TEXT DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. Gamma Sales Table (Payment Integration)
CREATE TABLE IF NOT EXISTS public.gamma_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gamma_id UUID REFERENCES public.gamma_prompts(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    customer_email TEXT NOT NULL,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    status BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Gamma Templates Table (Template Management)
CREATE TABLE IF NOT EXISTS public.gamma_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche TEXT NOT NULL,
    template_name TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    variables JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Gamma Prompts Indexes
CREATE INDEX IF NOT EXISTS idx_gamma_prompts_status ON public.gamma_prompts(status);
CREATE INDEX IF NOT EXISTS idx_gamma_prompts_created_at ON public.gamma_prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_gamma_prompts_niche ON public.gamma_prompts(niche);
CREATE INDEX IF NOT EXISTS idx_gamma_prompts_contact_email ON public.gamma_prompts(contact_email);

-- Gamma Generated Indexes
CREATE INDEX IF NOT EXISTS idx_gamma_generated_prompt_id ON public.gamma_generated(gamma_prompt_id);
CREATE INDEX IF NOT EXISTS idx_gamma_generated_status ON public.gamma_generated(generation_status);
CREATE INDEX IF NOT EXISTS idx_gamma_generated_created_at ON public.gamma_generated(created_at);

-- Gamma Sales Indexes
CREATE INDEX IF NOT EXISTS idx_gamma_sales_gamma_id ON public.gamma_sales(gamma_id);
CREATE INDEX IF NOT EXISTS idx_gamma_sales_status ON public.gamma_sales(status);
CREATE INDEX IF NOT EXISTS idx_gamma_sales_payment_status ON public.gamma_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_gamma_sales_stripe_intent ON public.gamma_sales(stripe_payment_intent_id);

-- Gamma Templates Indexes
CREATE INDEX IF NOT EXISTS idx_gamma_templates_niche ON public.gamma_templates(niche);
CREATE INDEX IF NOT EXISTS idx_gamma_templates_active ON public.gamma_templates(is_active);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.gamma_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamma_generated ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamma_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamma_templates ENABLE ROW LEVEL SECURITY;

-- Gamma Prompts Policies
CREATE POLICY "gamma_prompts_public_insert" ON public.gamma_prompts
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "gamma_prompts_public_select" ON public.gamma_prompts
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "gamma_prompts_admin_all" ON public.gamma_prompts
    FOR ALL TO authenticated
    USING (public.is_system_admin())
    WITH CHECK (public.is_system_admin());

-- Gamma Generated Policies
CREATE POLICY "gamma_generated_public_select" ON public.gamma_generated
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "gamma_generated_admin_all" ON public.gamma_generated
    FOR ALL TO authenticated
    USING (public.is_system_admin())
    WITH CHECK (public.is_system_admin());

-- Gamma Sales Policies
CREATE POLICY "gamma_sales_public_select" ON public.gamma_sales
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "gamma_sales_admin_all" ON public.gamma_sales
    FOR ALL TO authenticated
    USING (public.is_system_admin())
    WITH CHECK (public.is_system_admin());

-- Gamma Templates Policies
CREATE POLICY "gamma_templates_public_select" ON public.gamma_templates
    FOR SELECT TO anon
    USING (is_active = true);

CREATE POLICY "gamma_templates_admin_all" ON public.gamma_templates
    FOR ALL TO authenticated
    USING (public.is_system_admin())
    WITH CHECK (public.is_system_admin());

-- ========================================
-- TRIGGERS FOR AUTOMATION
-- ========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_gamma_prompts_updated_at
    BEFORE UPDATE ON public.gamma_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamma_templates_updated_at
    BEFORE UPDATE ON public.gamma_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- SEED DATA FOR GAMMA TEMPLATES
-- ========================================

-- Insert default templates for different niches
INSERT INTO public.gamma_templates (niche, template_name, prompt_template, variables) VALUES
(
    'cleaning',
    'Cleaning Service Template',
    'Create a professional landing page for {customer_name}, a {service} company in {location}. 
    
    Business Details:
    - Company: {customer_name}
    - Service: {service}
    - Location: {location}
    - Description: {description}
    - Target Audience: {target_audience}
    - Pain Points: {pain_points}
    
    Include:
    1. Hero section with compelling headline
    2. Service benefits and features
    3. Customer testimonials section
    4. Contact form with QR code
    5. Call-to-action buttons
    6. Professional design with {customer_name} branding',
    '{"customer_name": "string", "service": "string", "location": "string", "description": "string", "target_audience": "string", "pain_points": "array"}'
),
(
    'contractor',
    'Contractor Service Template',
    'Create a professional landing page for {customer_name}, a {service} contractor in {location}.
    
    Business Details:
    - Company: {customer_name}
    - Service: {service}
    - Location: {location}
    - Description: {description}
    - Target Audience: {target_audience}
    - Pain Points: {pain_points}
    
    Include:
    1. Hero section with project showcase
    2. Services offered with pricing
    3. Portfolio gallery
    4. Customer reviews and ratings
    5. Contact form with QR code
    6. Emergency contact section',
    '{"customer_name": "string", "service": "string", "location": "string", "description": "string", "target_audience": "string", "pain_points": "array"}'
),
(
    'hvac',
    'HVAC Service Template',
    'Create a professional landing page for {customer_name}, an HVAC {service} company in {location}.
    
    Business Details:
    - Company: {customer_name}
    - Service: {service}
    - Location: {location}
    - Description: {description}
    - Target Audience: {target_audience}
    - Pain Points: {pain_points}
    
    Include:
    1. Hero section with emergency contact
    2. 24/7 service availability
    3. Service areas and specialties
    4. Energy efficiency benefits
    5. Contact form with QR code
    6. Seasonal promotions',
    '{"customer_name": "string", "service": "string", "location": "string", "description": "string", "target_audience": "string", "pain_points": "array"}'
),
(
    'plumbing',
    'Plumbing Service Template',
    'Create a professional landing page for {customer_name}, a {service} company in {location}.
    
    Business Details:
    - Company: {customer_name}
    - Service: {service}
    - Location: {location}
    - Description: {description}
    - Target Audience: {target_audience}
    - Pain Points: {pain_points}
    
    Include:
    1. Hero section with emergency call button
    2. Common plumbing problems solved
    3. Licensed and insured credentials
    4. Customer testimonials
    5. Contact form with QR code
    6. Service guarantee section',
    '{"customer_name": "string", "service": "string", "location": "string", "description": "string", "target_audience": "string", "pain_points": "array"}'
),
(
    'moving',
    'Moving Service Template',
    'Create a professional landing page for {customer_name}, a {service} company in {location}.
    
    Business Details:
    - Company: {customer_name}
    - Service: {service}
    - Location: {location}
    - Description: {description}
    - Target Audience: {target_audience}
    - Pain Points: {pain_points}
    
    Include:
    1. Hero section with moving quote form
    2. Services offered (local/long-distance)
    3. Moving checklist and tips
    4. Customer reviews and ratings
    5. Contact form with QR code
    6. Insurance and protection info',
    '{"customer_name": "string", "service": "string", "location": "string", "description": "string", "target_audience": "string", "pain_points": "array"}'
);

-- ========================================
-- AUDIT LOGGING
-- ========================================

INSERT INTO public.admin_audit_log (action, details, created_at)
VALUES (
    'phase2_semi_automatic_workflow_deployed',
    jsonb_build_object(
        'migration_type', 'phase2_semi_automatic_workflow',
        'tables_created', 4,
        'templates_seeded', 5,
        'triggers_created', 2,
        'policies_created', 8,
        'indexes_created', 12,
        'deployed_by', 'omniumai357',
        'deployment_timestamp', NOW(),
        'features', jsonb_build_object(
            'automated_form_handling', true,
            'gamma_generation_ready', true,
            'payment_integration_ready', true,
            'template_management', true,
            'row_level_security', true
        )
    ),
    NOW()
);

COMMIT;

-- Verification
SELECT '✅ PHASE 2 SEMI-AUTOMATIC WORKFLOW DEPLOYED' as status;
SELECT COUNT(*) as templates_created FROM public.gamma_templates;
SELECT COUNT(*) as tables_created FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'gamma_%';
