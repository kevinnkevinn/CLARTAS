import { createClient } from "@/lib/supabase/server";
import type { AIJob } from "@/lib/supabase/types";

export async function getRecentJobs(userId: string, limit = 6): Promise<AIJob[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("ai_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AIJob[]) ?? [];
}

export async function getJobCount(userId: string): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("ai_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
