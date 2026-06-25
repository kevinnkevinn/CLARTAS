-- Add reviewer role for approval workflows
do $$ begin
  alter type member_role add value if not exists 'reviewer' after 'editor';
exception
  when duplicate_object then null;
end $$;

-- Reviewers can update approval requests in their workspace
drop policy if exists "approvals_update" on public.approval_requests;
create policy "approvals_update" on public.approval_requests
  for update using (
    public.is_workspace_editor(workspace_id)
    or exists (
      select 1 from public.workspace_members m
      where m.workspace_id = approval_requests.workspace_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'reviewer')
    )
  );
