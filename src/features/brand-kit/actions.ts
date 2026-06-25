"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getPrimaryWorkspace } from "@/features/workspace/service";

export interface BrandKitResult {
  error?: string;
  success?: boolean;
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createBrandKitAction(
  _prev: BrandKitResult,
  formData: FormData,
): Promise<BrandKitResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const workspace = await getPrimaryWorkspace(user.id);
  if (!workspace) return { error: "No workspace found" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required" };

  const { error } = await supabase.from("brand_kits").insert({
    workspace_id: workspace.id,
    name,
    brand_colors: parseList(String(formData.get("colors") ?? "")),
    brand_fonts: parseList(String(formData.get("fonts") ?? "")),
    brand_voice: String(formData.get("voice") ?? "").trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/brand-kit", "page");
  return { success: true };
}
