import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/constants";

export type FileKind = "image" | "video";

export interface ValidationResult {
  ok: boolean;
  kind?: FileKind;
  error?: "type" | "size";
}

/** Validate a file's MIME type and size against product rules. */
export function validateUpload(type: string, size: number): ValidationResult {
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
    if (size > MAX_IMAGE_BYTES) return { ok: false, kind: "image", error: "size" };
    return { ok: true, kind: "image" };
  }
  if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(type)) {
    if (size > MAX_VIDEO_BYTES) return { ok: false, kind: "video", error: "size" };
    return { ok: true, kind: "video" };
  }
  return { ok: false, error: "type" };
}

export function isImage(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}
