import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { logError } from "@/lib/logger";

/**
 * Persist an AI image output URL into the processed-assets bucket and create an
 * assets row. Best-effort: failures are logged but do not fail the AI request.
 */
export async function persistProcessedImage(
  userId: string,
  imageUrl: string,
  meta: {
    action: string;
    jobId?: string | null;
    workspaceId?: string | null;
    sourceAssetId?: string;
  },
): Promise<{ assetId: string; signedUrl: string | null } | null> {
  const admin = createAdminClient();
  if (!admin || !imageUrl) return null;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = contentType.includes("jpeg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
    const path = `${userId}/processed/${meta.action}-${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKETS.processed)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      await logError("ai:storage", uploadError, { path }, userId);
      return null;
    }

    const { data: asset, error: insertError } = await admin
      .from("assets")
      .insert({
        user_id: userId,
        workspace_id: meta.workspaceId ?? null,
        file_path: path,
        file_type: contentType,
        original_filename: `${meta.action}-output.${ext}`,
        processing_status: "ready",
        metadata: {
          source: "ai",
          action: meta.action,
          jobId: meta.jobId,
          parentAssetId: meta.sourceAssetId ?? null,
        },
      })
      .select("id")
      .single();

    if (insertError || !asset) {
      await logError("ai:storage:insert", insertError, { path }, userId);
      return null;
    }

    const { data: signed } = await admin.storage
      .from(STORAGE_BUCKETS.processed)
      .createSignedUrl(path, 3600);

    if (meta.jobId) {
      await admin.from("ai_jobs").update({ asset_id: asset.id }).eq("id", meta.jobId);
    }

    return { assetId: asset.id, signedUrl: signed?.signedUrl ?? null };
  } catch (error) {
    await logError("ai:storage:fetch", error, { imageUrl: "[url]" }, userId);
    return null;
  }
}
