# RLS Policies

The **source of truth** for Row Level Security lives in the migrations:

- `supabase/migrations/0002_rls_policies.sql` — table RLS policies
- `supabase/migrations/0003_storage.sql` — storage bucket policies

## Access model

| Table | Read | Write |
| --- | --- | --- |
| `profiles` | own row | own row |
| `workspaces` | owner or member | owner |
| `workspace_members` | self or co-members | workspace owner |
| `assets` | owner or workspace member | owner / workspace editor |
| `ai_jobs` | owner or workspace member | owner (insert) |
| `ai_credit_transactions` | own rows | service role only |
| `subscriptions` | own rows | service role only (webhooks) |
| `transactions` | own rows | service role only (webhooks) |
| `brand_kits` | workspace member | workspace editor |
| `approval_requests` | workspace member | member (insert) / editor (review) |
| `error_logs` | none (service role only) | service role only |

## Principles

1. Every user-data table has RLS **enabled**.
2. Users can only reach their own data or workspaces they belong to.
3. Billing tables (`subscriptions`, `transactions`) and credit ledger writes are
   performed exclusively with the **service role** key from trusted server code
   (Paddle webhook, credit RPCs), never from the browser.
4. Storage objects are namespaced by `auth.uid()` as the first path segment, so a
   user can only read/write files under their own prefix. Temporary access for AI
   providers is granted via short-lived **signed URLs** generated server-side.
