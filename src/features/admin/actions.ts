"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser, isAdminUser } from "@/features/auth/session";
import { addCredits } from "@/features/credits/service";

export interface AdminActionResult {
  error?: string;
  success?: boolean;
}

/** Manually adjust a user's credits (admin-only). Amount may be negative. */
export async function adjustCreditsAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const me = await getSessionUser();
  if (!me || !isAdminUser(me)) return { error: "Forbidden" };

  const userId = String(formData.get("userId") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "Admin adjustment").trim();

  if (!userId || !Number.isFinite(amount) || amount === 0) {
    return { error: "Provide a valid user id and non-zero amount" };
  }

  const result = await addCredits(userId, amount, "ADMIN_ADJUSTMENT", reason);
  if (result === null) return { error: "Adjustment failed (service role required)" };

  revalidatePath("/admin", "page");
  return { success: true };
}
