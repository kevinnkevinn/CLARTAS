"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

export interface AssetActionResult {
  error?: string;
  success?: boolean;
}

export async function deleteAssetAction(assetId: string): Promise<AssetActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { data: asset } = await supabase
    .from("assets")
    .select("file_path, metadata")
    .eq("id", assetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!asset) return { error: "Asset not found" };

  const bucket =
    (asset.metadata as { source?: string })?.source === "ai" ||
    asset.file_path.includes("/processed/")
      ? STORAGE_BUCKETS.processed
      : STORAGE_BUCKETS.raw;

  await supabase.storage.from(bucket).remove([asset.file_path]);
  const { error } = await supabase.from("assets").delete().eq("id", assetId);
  if (error) return { error: error.message };

  revalidatePath("/assets");
  return { success: true };
}

export async function renameAssetAction(
  assetId: string,
  filename: string,
): Promise<AssetActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { error } = await supabase
    .from("assets")
    .update({ original_filename: filename.trim() })
    .eq("id", assetId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  return { success: true };
}

export async function updateAssetTagsAction(
  assetId: string,
  tags: string[],
): Promise<AssetActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { data: existing } = await supabase
    .from("assets")
    .select("metadata")
    .eq("id", assetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { error: "Asset not found" };

  const metadata = { ...(existing.metadata as Record<string, unknown>), tags };
  const { error } = await supabase.from("assets").update({ metadata }).eq("id", assetId);
  if (error) return { error: error.message };

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  return { success: true };
}
