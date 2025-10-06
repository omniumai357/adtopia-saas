-- Migration: create stripe_products_log table
create table if not exists public.stripe_products_log (
  id uuid primary key default gen_random_uuid(),
  project text not null default 'adtopia',
  stripe_product_id text not null,
  name text not null,
  price_usd numeric not null,
  metadata jsonb,
  created_at timestamptz default now()
);

comment on table public.stripe_products_log is 'Audit log of all Stripe product creations from Edge Functions';
