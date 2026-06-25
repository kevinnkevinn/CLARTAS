"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/features/workspace/service";
import { STORAGE_BUCKETS } from "@/lib/constants";

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

  const workspace = await getActiveWorkspace(user.id);
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

export async function deleteBrandKitAction(kitId: string): Promise<BrandKitResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { error } = await supabase.from("brand_kits").delete().eq("id", kitId);
  if (error) return { error: error.message };

  revalidatePath("/brand-kit");
  return { success: true };
}

export async function updateBrandKitAction(
  kitId: string,
  _prev: BrandKitResult,
  formData: FormData,
): Promise<BrandKitResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required" };

  const { error } = await supabase
    .from("brand_kits")
    .update({
      name,
      brand_colors: parseList(String(formData.get("colors") ?? "")),
      brand_fonts: parseList(String(formData.get("fonts") ?? "")),
      brand_voice: String(formData.get("voice") ?? "").trim() || null,
    })
    .eq("id", kitId);

  if (error) return { error: error.message };
  revalidatePath("/brand-kit");
  return { success: true };
}

export async function uploadBrandLogoAction(
  kitId: string,
  formData: FormData,
): Promise<BrandKitResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected" };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${user.id}/brand/${kitId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.brand)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: signed } = await supabase.storage
    .from(STORAGE_BUCKETS.brand)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  const { error } = await supabase
    .from("brand_kits")
    .update({ logo_url: signed?.signedUrl ?? path })
    .eq("id", kitId);

  if (error) return { error: error.message };
  revalidatePath("/brand-kit");
  return { success: true };
}
