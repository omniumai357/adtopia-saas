-- Migration: setup Stripe sync cron job
-- This sets up a daily cron job to sync Stripe products with Supabase

-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule daily Stripe sync at midnight UTC
select cron.schedule(
  'stripe_sync_daily',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://xwszqfmduotxjutlnyls.functions.supabase.co/functions/v1/omnia-shared/stripe-sync-products',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
  $$
);

-- Add comment for documentation
comment on function cron.schedule is 'Schedules daily Stripe product sync at midnight UTC';
