"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface SettingsResult {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prev: SettingsResult,
  formData: FormData,
): Promise<SettingsResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const preferredLocale = String(formData.get("preferredLocale") ?? "en");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, preferred_locale: preferredLocale })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
