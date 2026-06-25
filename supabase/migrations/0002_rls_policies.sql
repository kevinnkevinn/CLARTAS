-- =============================================================================
-- CLARTAS — Row Level Security
-- Enable RLS on every user-data table and define access policies.
-- Principle: a user can access their own rows, plus rows for workspaces they
-- are a member of. Writes to billing tables are reserved for the service role.
-- =============================================================================

-- Helper: is the current user a member of a workspace?
-- SECURITY DEFINER avoids infinite recursion when used inside RLS policies.
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws_id and m.user_id = auth.uid()
  );
$$ language sql security definer stable set search_path = public;

create or replace function public.is_workspace_editor(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','editor')
  );
$$ language sql security definer stable set search_path = public;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.assets enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.ai_credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.brand_kits enable row level security;
alter table public.approval_requests enable row level security;
alter table public.error_logs enable row level security;

-- --- profiles ---------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- --- workspaces -------------------------------------------------------------
drop policy if exists "workspaces_select_member" on public.workspaces;
create policy "workspaces_select_member" on public.workspaces
  for select using (owner_id = auth.uid() or public.is_workspace_member(id));

drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner" on public.workspaces
  for insert with check (owner_id = auth.uid());

drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner" on public.workspaces
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner" on public.workspaces
  for delete using (owner_id = auth.uid());

-- --- workspace_members ------------------------------------------------------
drop policy if exists "members_select" on public.workspace_members;
create policy "members_select" on public.workspace_members
  for select using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists "members_manage_owner" on public.workspace_members;
create policy "members_manage_owner" on public.workspace_members
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = workspace_id and w.owner_id = auth.uid())
  );

-- --- assets -----------------------------------------------------------------
drop policy if exists "assets_select" on public.assets;
create policy "assets_select" on public.assets
  for select using (
    user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

drop policy if exists "assets_insert" on public.assets;
create policy "assets_insert" on public.assets
  for insert with check (user_id = auth.uid());

drop policy if exists "assets_update" on public.assets;
create policy "assets_update" on public.assets
  for update using (
    user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_editor(workspace_id))
  );

drop policy if exists "assets_delete" on public.assets;
create policy "assets_delete" on public.assets
  for delete using (user_id = auth.uid());

-- --- ai_jobs ----------------------------------------------------------------
drop policy if exists "jobs_select" on public.ai_jobs;
create policy "jobs_select" on public.ai_jobs
  for select using (
    user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

drop policy if exists "jobs_insert" on public.ai_jobs;
create policy "jobs_insert" on public.ai_jobs
  for insert with check (user_id = auth.uid());

-- --- ai_credit_transactions (read-only for users) ---------------------------
drop policy if exists "credit_tx_select" on public.ai_credit_transactions;
create policy "credit_tx_select" on public.ai_credit_transactions
  for select using (user_id = auth.uid());

-- --- subscriptions (read-only for users; writes via service role) -----------
drop policy if exists "subs_select" on public.subscriptions;
create policy "subs_select" on public.subscriptions
  for select using (user_id = auth.uid());

-- --- transactions (read-only for users; writes via service role) ------------
drop policy if exists "tx_select" on public.transactions;
create policy "tx_select" on public.transactions
  for select using (user_id = auth.uid());

-- --- brand_kits (workspace scoped) ------------------------------------------
drop policy if exists "brand_select" on public.brand_kits;
create policy "brand_select" on public.brand_kits
  for select using (public.is_workspace_member(workspace_id));

drop policy if exists "brand_write" on public.brand_kits;
create policy "brand_write" on public.brand_kits
  for all using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

-- --- approval_requests (workspace scoped) -----------------------------------
drop policy if exists "approvals_select" on public.approval_requests;
create policy "approvals_select" on public.approval_requests
  for select using (public.is_workspace_member(workspace_id));

drop policy if exists "approvals_insert" on public.approval_requests;
create policy "approvals_insert" on public.approval_requests
  for insert with check (public.is_workspace_member(workspace_id) and requested_by = auth.uid());

drop policy if exists "approvals_update" on public.approval_requests;
create policy "approvals_update" on public.approval_requests
  for update using (public.is_workspace_editor(workspace_id));

-- --- error_logs: no client access (service role only). RLS on, no policies = deny.
-- (Intentionally no SELECT/INSERT policies for end users.)
