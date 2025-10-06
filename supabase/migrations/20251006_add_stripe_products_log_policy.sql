-- Migration: add admin-only policy for stripe_products_log
-- Date: 2025-10-06

-- Enable RLS on stripe_products_log table
alter table public.stripe_products_log enable row level security;

-- Create or replace is_admin function
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Drop existing policy if it exists
drop policy if exists "admins_can_read_stripe_products_log" on public.stripe_products_log;

-- Create admin-only read policy
create policy "admins_can_read_stripe_products_log"
on public.stripe_products_log
for select
to authenticated
using ( public.is_admin() );

-- Add comment for documentation
comment on policy "admins_can_read_stripe_products_log" on public.stripe_products_log
is 'Allows only admin users to view Stripe product logs';

-- Ensure the stripe_products_log table exists with proper structure
create table if not exists public.stripe_products_log (
  id uuid primary key default gen_random_uuid(),
  project text not null,
  stripe_product_id text not null,
  name text not null,
  price_usd numeric(10,2) not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_stripe_products_log_project on public.stripe_products_log(project);
create index if not exists idx_stripe_products_log_created_at on public.stripe_products_log(created_at);
create index if not exists idx_stripe_products_log_stripe_product_id on public.stripe_products_log(stripe_product_id);

-- Ensure user_roles table exists for admin function
create table if not exists public.user_roles (
  user_id uuid not null,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Create index for user_roles
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role on public.user_roles(role);
