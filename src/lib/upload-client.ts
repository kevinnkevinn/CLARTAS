import { addDemoAsset } from "@/features/demo/local-assets";
import { env } from "@/lib/env";
import { downscaleImageFile } from "@/lib/image/downscale";
import { resolveFileMimeType } from "@/lib/mime";
import { validateUpload } from "@/lib/upload-validation";

export type UploadErrorCode =
  | "file_too_large"
  | "invalid_file_type"
  | "upload_failed"
  | "Unauthorized";

export interface UploadSuccess {
  signedUrl: string;
  assetId?: string;
  kind: "image" | "video";
}

/** Validate and upload a media file (demo uses blob URLs; production hits `/api/upload`). */
export async function uploadMediaFile(
  file: File,
): Promise<{ ok: true; data: UploadSuccess } | { ok: false; error: UploadErrorCode }> {
  const mime = resolveFileMimeType(file);
  const validation = validateUpload(mime, file.size);
  if (!validation.ok || !validation.kind) {
    return {
      ok: false,
      error: validation.error === "size" ? "file_too_large" : "invalid_file_type",
    };
  }

  let uploadFile = file;
  if (validation.kind === "image") {
    uploadFile = await downscaleImageFile(file);
  }

  if (env.demoMode) {
    const asset = await addDemoAsset(uploadFile);
    return {
      ok: true,
      data: { signedUrl: asset.url, assetId: asset.id, kind: validation.kind },
    };
  }

  const fd = new FormData();
  fd.append("file", uploadFile);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { error?: UploadErrorCode; signedUrl?: string; asset?: { id: string } };
  if (!res.ok || !data.signedUrl) {
    return { ok: false, error: data.error ?? "upload_failed" };
  }
  return {
    ok: true,
    data: { signedUrl: data.signedUrl, assetId: data.asset?.id, kind: validation.kind },
  };
}
