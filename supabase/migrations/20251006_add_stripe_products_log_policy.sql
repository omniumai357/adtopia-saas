-- Migration: add admin-only policy for stripe_products_log
alter table public.stripe_products_log enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "admins_can_read_stripe_products_log" on public.stripe_products_log;

create policy "admins_can_read_stripe_products_log"
on public.stripe_products_log
for select
to authenticated
using ( public.is_admin() );

comment on policy "admins_can_read_stripe_products_log" on public.stripe_products_log
is 'Allows only admin users to view Stripe product logs';