-- Track each sync run for complete auditability
CREATE TABLE IF NOT EXISTS public.product_sync_runs (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'stripe_product_sync',
  note text,
  completed_at timestamptz,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

-- Ensure pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Per-product idempotency per run (prevents duplicate processing)
CREATE TABLE IF NOT EXISTS public.product_sync_run_items (
  run_id uuid NOT NULL REFERENCES public.product_sync_runs(run_id) ON DELETE CASCADE,
  internal_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','success','failed','skipped')),
  stripe_product_id text,
  error jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (run_id, internal_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_product_sync_run_items_internal_id
  ON public.product_sync_run_items(internal_id);

CREATE INDEX IF NOT EXISTS idx_product_sync_runs_started_at
  ON public.product_sync_runs(started_at DESC);

-- Stripe webhook idempotency (prevents duplicate charges)
CREATE TABLE IF NOT EXISTS public.stripe_events_processed (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  access_level text,
  amount_cents integer
);

-- Performance index for cleanup
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at
  ON public.stripe_events_processed(processed_at);

-- Cleanup old records (90-day retention)
SELECT cron.schedule(
  'cleanup_idempotency_tables',
  '0 3 * * *',
  $$
  DELETE FROM public.product_sync_runs WHERE started_at < now() - interval '90 days';
  DELETE FROM public.stripe_events_processed WHERE processed_at < now() - interval '90 days';
  $$
);

-- RLS policies for idempotency tables
ALTER TABLE public.product_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sync_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events_processed ENABLE ROW LEVEL SECURITY;

-- Admin can read all idempotency data
CREATE POLICY "Admins can read sync runs" ON public.product_sync_runs
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can read sync items" ON public.product_sync_run_items
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can read processed events" ON public.stripe_events_processed
  FOR SELECT TO authenticated USING (public.is_admin());

-- Service role can manage all idempotency data
CREATE POLICY "Service role manages sync runs" ON public.product_sync_runs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages sync items" ON public.product_sync_run_items
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages processed events" ON public.stripe_events_processed
  FOR ALL TO service_role USING (true);
