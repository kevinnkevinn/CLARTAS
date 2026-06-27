import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FREE_CREDITS } from "@/lib/constants";
import { DEMO_CREDITS, isDemoMode } from "@/lib/demo/config";

/**
 * Credit service. Balance reads go through the user-scoped client (RLS), while
 * mutations use the service role via SECURITY DEFINER RPCs so the math is
 * atomic and tamper-proof.
 */

/** Read the current user's AI credit balance. Falls back to mock when unconfigured. */
export async function getCreditBalance(userId: string): Promise<number> {
  if (isDemoMode()) return DEMO_CREDITS;

  const supabase = await createClient();
  if (!supabase) return DEFAULT_FREE_CREDITS;

  const { data } = await supabase
    .from("profiles")
    .select("ai_credits")
    .eq("id", userId)
    .maybeSingle();

  return data?.ai_credits ?? 0;
}

export interface DeductResult {
  ok: boolean;
  reason?: "insufficient" | "unconfigured" | "error";
}

/** Atomically deduct credits. Returns ok=false (insufficient) without charging. */
export async function deductCredits(
  userId: string,
  amount: number,
  module: string,
  description?: string,
  workspaceId?: string | null,
): Promise<DeductResult> {
  if (isDemoMode()) return { ok: true };

  const admin = createAdminClient();
  if (!admin) return { ok: false, reason: "unconfigured" };

  const { data, error } = await admin.rpc("deduct_credits", {
    p_user: userId,
    p_amount: amount,
    p_module: module,
    p_description: description ?? null,
    p_workspace: workspaceId ?? null,
  });

  if (error) return { ok: false, reason: "error" };
  return data === true ? { ok: true } : { ok: false, reason: "insufficient" };
}

/** Add / refund / top-up credits. Returns the new balance or null on failure. */
export async function addCredits(
  userId: string,
  amount: number,
  module: string,
  description?: string,
  workspaceId?: string | null,
): Promise<number | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.rpc("add_credits", {
    p_user: userId,
    p_amount: amount,
    p_module: module,
    p_description: description ?? null,
    p_workspace: workspaceId ?? null,
  });

  if (error) return null;
  return data as number;
}

/** Read recent credit transactions for the current user. */
export async function getCreditHistory(userId: string, limit = 20) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("ai_credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
