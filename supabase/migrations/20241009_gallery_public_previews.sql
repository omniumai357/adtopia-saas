-- Gallery Public Previews Migration
-- Makes gallery publicly accessible for active previews
-- Auth gating removed - public can view active previews

-- Add status and expires_at fields to gamma_gallery table
ALTER TABLE gamma_gallery 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_gamma_gallery_status ON gamma_gallery(status);
CREATE INDEX IF NOT EXISTS idx_gamma_gallery_expires ON gamma_gallery(expires_at);

-- Create RLS policy for public read access to active previews
CREATE POLICY "previews_public_read" ON public.gamma_gallery
FOR SELECT TO anon
USING (status = 'active' AND expires_at > NOW());

-- Ensure the policy is enabled
ALTER TABLE gamma_gallery ENABLE ROW LEVEL SECURITY;

-- Update existing records to have active status
UPDATE gamma_gallery 
SET status = 'active', expires_at = NOW() + INTERVAL '30 days'
WHERE status IS NULL;

-- Create policy for authenticated users to manage previews
CREATE POLICY "previews_admin_manage" ON public.gamma_gallery
FOR ALL TO authenticated
USING (true);

-- Create policy for service role to manage all previews
CREATE POLICY "previews_service_manage" ON public.gamma_gallery
FOR ALL TO service_role
USING (true);
