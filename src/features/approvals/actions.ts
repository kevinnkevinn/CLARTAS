"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import {
  createApprovalRequest,
  updateApprovalStatus,
} from "@/features/approvals/service";
import { getPrimaryWorkspace } from "@/features/workspace/service";
import type { ApprovalStatus } from "@/lib/supabase/types";

export interface ApprovalActionResult {
  error?: string;
  success?: boolean;
}

export async function requestApprovalAction(
  _prev: ApprovalActionResult,
  formData: FormData,
): Promise<ApprovalActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const assetId = String(formData.get("assetId") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  if (!assetId) return { error: "Asset is required" };

  const workspace = await getPrimaryWorkspace(user.id);
  if (!workspace) return { error: "No workspace found" };

  const result = await createApprovalRequest(workspace.id, user.id, assetId, comment);
  if (result.error) return { error: result.error };

  revalidatePath("/approvals");
  return { success: true };
}

export async function reviewApprovalAction(
  requestId: string,
  status: ApprovalStatus,
  comment?: string,
): Promise<ApprovalActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const result = await updateApprovalStatus(requestId, user.id, status, comment);
  if (result.error) return { error: result.error };

  revalidatePath("/approvals");
  return { success: true };
}
