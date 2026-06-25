-- =============================================================================
-- CLARTAS — Storage buckets & policies
-- Three private buckets. Files are namespaced by user id (first path segment),
-- e.g. "<user_id>/<workspace_id>/<filename>". Access is granted via signed URLs
-- generated server-side; direct reads require ownership.
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('raw-assets', 'raw-assets', false),
  ('processed-assets', 'processed-assets', false),
  ('brand-assets', 'brand-assets', false)
on conflict (id) do nothing;

-- Helper predicate reused across policies: the object's first folder == uid.
-- (storage.foldername returns an array of path segments.)

-- raw-assets
drop policy if exists "raw_rw_own" on storage.objects;
create policy "raw_rw_own" on storage.objects
  for all using (
    bucket_id = 'raw-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'raw-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- processed-assets
drop policy if exists "processed_rw_own" on storage.objects;
create policy "processed_rw_own" on storage.objects
  for all using (
    bucket_id = 'processed-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'processed-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- brand-assets
drop policy if exists "brand_rw_own" on storage.objects;
create policy "brand_rw_own" on storage.objects
  for all using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
