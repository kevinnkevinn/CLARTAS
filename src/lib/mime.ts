/** Infer MIME type from filename when the browser omits `file.type`. */
export function resolveFileMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
  };
  return map[ext] ?? "";
}

export function isVideoMime(type: string): boolean {
  return type.startsWith("video/");
}

export function isImageMime(type: string): boolean {
  return type.startsWith("image/");
}
