import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin data access. Uses the service role client (bypasses RLS) and is only
 * ever called from admin-guarded routes.
 */

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();
  if (!admin) return { totalUsers: 0, totalJobs: 0, totalRevenue: 0, activeSubscriptions: 0 };

  const [users, jobs, subs, txs] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("ai_jobs").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("transactions").select("amount").eq("status", "completed"),
  ]);

  const totalRevenue = (txs.data ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + Number(t.amount ?? 0),
    0,
  );

  return {
    totalUsers: users.count ?? 0,
    totalJobs: jobs.count ?? 0,
    totalRevenue,
    activeSubscriptions: subs.count ?? 0,
  };
}

export async function listUsers(limit = 25) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, plan_status, ai_credits, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listJobs(limit = 25) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("ai_jobs")
    .select("id, action, provider, status, credit_cost, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listTransactions(limit = 25) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("transactions")
    .select("id, amount, currency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listSubscriptions(limit = 25) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("subscriptions")
    .select("id, plan_name, status, current_period_end, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listErrorLogs(limit = 25) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("error_logs")
    .select("id, scope, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
