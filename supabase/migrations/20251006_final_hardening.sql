-- Add stripe_event_id for full auditability
ALTER TABLE public.user_access
ADD COLUMN IF NOT EXISTS stripe_event_id text;

-- Enable 90-day cleanup automation
SELECT cron.schedule(
  'cleanup_idempotency_tables',
  '0 3 * * *',
  $$
  DELETE FROM public.product_sync_runs WHERE started_at < now() - interval '90 days';
  DELETE FROM public.stripe_events_processed WHERE processed_at < now() - interval '90 days';
  $$
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_access_stripe_event 
ON public.user_access(stripe_event_id);

-- Ensure all idempotency tables exist
CREATE TABLE IF NOT EXISTS public.product_sync_runs (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'stripe_product_sync',
  note text,
  completed_at timestamptz,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE TABLE IF NOT EXISTS public.product_sync_run_items (
  run_id uuid NOT NULL REFERENCES public.product_sync_runs(run_id) ON DELETE CASCADE,
  internal_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','success','failed','skipped')),
  stripe_product_id text,
  error jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (run_id, internal_id)
);

CREATE TABLE IF NOT EXISTS public.stripe_events_processed (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  access_level text,
  amount_cents integer
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_product_sync_run_items_internal_id
  ON public.product_sync_run_items(internal_id);

CREATE INDEX IF NOT EXISTS idx_product_sync_runs_started_at
  ON public.product_sync_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at
  ON public.stripe_events_processed(processed_at);

-- RLS policies
ALTER TABLE public.product_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sync_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events_processed ENABLE ROW LEVEL SECURITY;

-- Admin can read all idempotency data
CREATE POLICY IF NOT EXISTS "Admins can read sync runs" ON public.product_sync_runs
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins can read sync items" ON public.product_sync_run_items
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins can read processed events" ON public.stripe_events_processed
  FOR SELECT TO authenticated USING (public.is_admin());

-- Service role can manage all idempotency data
CREATE POLICY IF NOT EXISTS "Service role manages sync runs" ON public.product_sync_runs
  FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Service role manages sync items" ON public.product_sync_run_items
  FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Service role manages processed events" ON public.stripe_events_processed
  FOR ALL TO service_role USING (true);
