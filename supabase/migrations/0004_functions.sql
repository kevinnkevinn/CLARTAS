-- =============================================================================
-- CLARTAS — Credit functions (atomic)
-- These run with SECURITY DEFINER so credit math is consistent and cannot be
-- tampered with from the client. The API layer calls these via RPC.
-- =============================================================================

-- Atomically deduct credits if the balance is sufficient.
-- Returns true on success, false if insufficient balance.
create or replace function public.deduct_credits(
  p_user uuid,
  p_amount integer,
  p_module text,
  p_description text default null,
  p_workspace uuid default null
)
returns boolean as $$
declare
  current_balance integer;
begin
  if p_amount <= 0 then
    return false;
  end if;

  select ai_credits into current_balance
  from public.profiles
  where id = p_user
  for update;

  if current_balance is null or current_balance < p_amount then
    return false;
  end if;

  update public.profiles
  set ai_credits = ai_credits - p_amount
  where id = p_user;

  insert into public.ai_credit_transactions (user_id, workspace_id, amount, module, description)
  values (p_user, p_workspace, -p_amount, p_module, p_description);

  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- Add (grant / top-up / refund) credits. Returns new balance.
create or replace function public.add_credits(
  p_user uuid,
  p_amount integer,
  p_module text,
  p_description text default null,
  p_workspace uuid default null
)
returns integer as $$
declare
  new_balance integer;
begin
  update public.profiles
  set ai_credits = ai_credits + p_amount
  where id = p_user
  returning ai_credits into new_balance;

  insert into public.ai_credit_transactions (user_id, workspace_id, amount, module, description)
  values (p_user, p_workspace, p_amount, p_module, p_description);

  return new_balance;
end;
$$ language plpgsql security definer set search_path = public;

-- These functions bypass RLS, so they must only be callable from trusted
-- server code using the service role key — never from the browser.
revoke execute on function public.deduct_credits(uuid, integer, text, text, uuid) from anon, authenticated;
revoke execute on function public.add_credits(uuid, integer, text, text, uuid) from anon, authenticated;
grant execute on function public.deduct_credits(uuid, integer, text, text, uuid) to service_role;
grant execute on function public.add_credits(uuid, integer, text, text, uuid) to service_role;
