-- =============================================================================
-- CLARTAS — Initial schema
-- Tables, enums, indexes, and triggers. Run this first.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- Enums ------------------------------------------------------------------
do $$ begin
  create type processing_status as enum ('pending', 'processing', 'ready', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('queued', 'processing', 'succeeded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'free');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('owner', 'admin', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- --- updated_at helper -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- --- profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan_status text not null default 'free',
  preferred_locale text not null default 'en',
  ai_credits integer not null default 20,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- workspaces -------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  role_map jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_workspaces_owner on public.workspaces(owner_id);

-- --- workspace_members ------------------------------------------------------
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
create index if not exists idx_members_workspace on public.workspace_members(workspace_id);
create index if not exists idx_members_user on public.workspace_members(user_id);

-- --- assets -----------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  file_url text,
  file_path text not null,
  file_type text not null,
  original_filename text not null,
  processing_status processing_status not null default 'ready',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_assets_user on public.assets(user_id);
create index if not exists idx_assets_workspace on public.assets(workspace_id);

-- --- ai_jobs ----------------------------------------------------------------
create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  asset_id uuid references public.assets(id) on delete set null,
  action text not null,
  provider text not null,
  status job_status not null default 'queued',
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  credit_cost integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_jobs_user on public.ai_jobs(user_id);
create index if not exists idx_jobs_status on public.ai_jobs(status);

-- --- ai_credit_transactions -------------------------------------------------
create table if not exists public.ai_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  amount integer not null,
  module text not null,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_tx_user on public.ai_credit_transactions(user_id);

-- --- subscriptions ----------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paddle_customer_id text,
  paddle_subscription_id text unique,
  status subscription_status not null default 'free',
  plan_name text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subs_user on public.subscriptions(user_id);

-- --- transactions -----------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null,
  gateway_ref text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_tx_user on public.transactions(user_id);

-- --- brand_kits -------------------------------------------------------------
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  logo_url text,
  brand_colors jsonb not null default '[]'::jsonb,
  brand_fonts jsonb not null default '[]'::jsonb,
  brand_voice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_brand_workspace on public.brand_kits(workspace_id);

-- --- approval_requests ------------------------------------------------------
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  status approval_status not null default 'pending',
  reviewer_id uuid references auth.users(id) on delete set null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_approvals_workspace on public.approval_requests(workspace_id);

-- --- error_logs (audit / ops) ----------------------------------------------
create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  scope text not null,
  message text not null,
  context jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_logs_created on public.error_logs(created_at desc);

-- --- updated_at triggers ----------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','workspaces','assets','ai_jobs','subscriptions',
    'brand_kits','approval_requests'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated on public.%1$s;
       create trigger trg_%1$s_updated before update on public.%1$s
       for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- --- New user bootstrap: create profile, default workspace, free subscription
create or replace function public.handle_new_user()
returns trigger as $$
declare
  ws_id uuid;
  base_slug text;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  base_slug := 'ws-' || substr(replace(new.id::text, '-', ''), 1, 12);

  insert into public.workspaces (owner_id, name, slug)
  values (new.id, 'My Workspace', base_slug)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner')
  on conflict do nothing;

  insert into public.subscriptions (user_id, status, plan_name)
  values (new.id, 'free', 'free')
  on conflict do nothing;

  insert into public.ai_credit_transactions (user_id, workspace_id, amount, module, description)
  values (new.id, ws_id, 20, 'SIGNUP_BONUS', 'Welcome credits');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
