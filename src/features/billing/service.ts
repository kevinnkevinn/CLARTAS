import { createClient } from "@/lib/supabase/server";
import type { Subscription, Transaction } from "@/lib/supabase/types";

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Subscription) ?? null;
}

export async function getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Transaction[]) ?? [];
}
