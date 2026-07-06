import { FULL_LIMITS, LITE_LIMITS } from "@/lib/lite-mode/config";

export interface DownscaleOptions {
  maxDimension?: number;
  quality?: number;
  mime?: string;
}

/** Downscale image files client-side before upload to save bandwidth and memory. */
export async function downscaleImageFile(
  file: File,
  opts: DownscaleOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const lite =
    typeof window !== "undefined" &&
    (localStorage.getItem("clartas-lite-mode") === "true" ||
      process.env.NEXT_PUBLIC_LITE_MODE === "true");

  const limits = lite ? LITE_LIMITS : FULL_LIMITS;
  const maxDim = opts.maxDimension ?? limits.maxImageDimension;
  const quality = opts.quality ?? limits.jpegQuality;
  const outMime = opts.mime ?? (file.type === "image/png" ? "image/jpeg" : file.type);

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1 && outMime === file.type) {
    bitmap.close();
    return file;
  }

  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = lite ? "medium" : "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outMime, quality),
  );
  if (!blob) return file;

  const ext = outMime.includes("png") ? ".png" : ".jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}${ext}`, { type: outMime, lastModified: Date.now() });
}

/** Cap canvas dimensions to performance limits. */
export function capCanvasSize(
  width: number,
  height: number,
  maxPixels: number = FULL_LIMITS.maxCanvasPixels,
): { width: number; height: number; scale: number } {
  const pixels = width * height;
  if (pixels <= maxPixels) return { width, height, scale: 1 };
  const scale = Math.sqrt(maxPixels / pixels);
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
    scale,
  };
}
