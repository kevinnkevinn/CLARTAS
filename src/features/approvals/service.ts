import { createClient } from "@/lib/supabase/server";
import type { ApprovalRequest, ApprovalStatus } from "@/lib/supabase/types";

export async function getApprovalRequests(workspaceId: string): Promise<ApprovalRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("approval_requests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data as ApprovalRequest[]) ?? [];
}

export async function createApprovalRequest(
  workspaceId: string,
  userId: string,
  assetId: string,
  comment?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { error } = await supabase.from("approval_requests").insert({
    workspace_id: workspaceId,
    asset_id: assetId,
    requested_by: userId,
    status: "pending",
    comment: comment ?? null,
  });

  return error ? { error: error.message } : {};
}

export async function updateApprovalStatus(
  requestId: string,
  reviewerId: string,
  status: ApprovalStatus,
  comment?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { error } = await supabase
    .from("approval_requests")
    .update({
      status,
      reviewer_id: reviewerId,
      comment: comment ?? null,
    })
    .eq("id", requestId);

  return error ? { error: error.message } : {};
}
