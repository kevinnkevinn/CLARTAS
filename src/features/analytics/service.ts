import { createClient } from "@/lib/supabase/server";

export interface UsageAnalytics {
  totalAssets: number;
  totalJobs: number;
  succeededJobs: number;
  failedJobs: number;
  creditsUsed: number;
  jobsByAction: Record<string, number>;
  recentActivity: Array<{ date: string; jobs: number }>;
  businessMetrics: {
    ctr: number | null;
    conversionRate: number | null;
    roi: number | null;
    revenue: number | null;
  };
}

export async function getUsageAnalytics(userId: string): Promise<UsageAnalytics> {
  const supabase = await createClient();
  const empty: UsageAnalytics = {
    totalAssets: 0,
    totalJobs: 0,
    succeededJobs: 0,
    failedJobs: 0,
    creditsUsed: 0,
    jobsByAction: {},
    recentActivity: [],
    businessMetrics: { ctr: null, conversionRate: null, roi: null, revenue: null },
  };
  if (!supabase) return empty;

  const [assetsRes, jobsRes, creditsRes] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("ai_jobs")
      .select("action, status, credit_cost, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("ai_credit_transactions")
      .select("amount")
      .eq("user_id", userId)
      .lt("amount", 0),
  ]);

  const jobs = jobsRes.data ?? [];
  const jobsByAction: Record<string, number> = {};
  let succeededJobs = 0;
  let failedJobs = 0;
  let creditsUsed = 0;

  for (const j of jobs) {
    jobsByAction[j.action] = (jobsByAction[j.action] ?? 0) + 1;
    if (j.status === "succeeded") succeededJobs++;
    if (j.status === "failed") failedJobs++;
    creditsUsed += j.credit_cost ?? 0;
  }

  const creditDeductions = (creditsRes.data ?? []).reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0,
  );

  const byDay = new Map<string, number>();
  for (const j of jobs.slice(0, 30)) {
    const day = j.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const recentActivity = [...byDay.entries()]
    .map(([date, count]) => ({ date, jobs: count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return {
    totalAssets: assetsRes.count ?? 0,
    totalJobs: jobs.length,
    succeededJobs,
    failedJobs,
    creditsUsed: creditDeductions || creditsUsed,
    jobsByAction,
    recentActivity,
    businessMetrics: { ctr: null, conversionRate: null, roi: null, revenue: null },
  };
}
