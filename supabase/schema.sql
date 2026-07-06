-- ============================================================
-- Pflegeberatung Wien – Supabase schema
-- Run this in the Supabase SQL editor (or via supabase db push).
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'open'
    check (status in ('open', 'booked', 'cancelled')),
  appointment_type text not null,
  location text not null default 'Wien / nach Vereinbarung',
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_message text,
  customer_reason text,
  created_at timestamptz not null default now(),
  booked_at timestamptz,
  cancel_token text,
  cancelled_at timestamptz,

  constraint appointments_time_valid check (end_time > start_time)
);

-- Migration for databases created before customer cancellation existed.
alter table public.appointments
  add column if not exists cancel_token text,
  add column if not exists cancelled_at timestamptz;

-- The cancellation token is a secret per booking and must be unique.
create unique index if not exists appointments_cancel_token_idx
  on public.appointments (cancel_token)
  where cancel_token is not null;

create index if not exists appointments_status_start_idx
  on public.appointments (status, start_time);

-- Prevent overlapping non-cancelled slots at the database level
-- (belt and suspenders on top of the application-level check).
create extension if not exists btree_gist;

alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    tstzrange(start_time, end_time) with &&
  ) where (status <> 'cancelled');

-- ------------------------------------------------------------
-- Row Level Security
--
-- The Next.js API routes use the service role key (bypasses RLS),
-- so we lock the table down completely for anon/authenticated
-- clients. Public visitors never talk to Supabase directly.
--
-- Later, when the admin area gets Supabase Auth, add policies for
-- authenticated admin users here.
-- ------------------------------------------------------------

alter table public.appointments enable row level security;

-- no policies for anon/authenticated => no direct access

-- Explicit grants for the server-side service role, so the app works even
-- when the project was created with "automatically expose new tables"
-- disabled (service_role bypasses RLS by design).
grant usage on schema public to service_role;
grant all on public.appointments to service_role;
