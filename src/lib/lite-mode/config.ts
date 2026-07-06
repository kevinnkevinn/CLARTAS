/** Performance limits for full vs lite mode (low-spec / legacy devices). */

export const LITE_STORAGE_KEY = "clartas-lite-mode";

export interface PerformanceLimits {
  maxImageDimension: number;
  maxCanvasPixels: number;
  jpegQuality: number;
  slideshowFps: number;
  slideshowEnabled: boolean;
  batchVariationsEnabled: boolean;
  decorativeBackgrounds: boolean;
  backdropBlur: boolean;
  pageSize: number;
}

export const FULL_LIMITS: PerformanceLimits = {
  maxImageDimension: 4096,
  maxCanvasPixels: 16_777_216,
  jpegQuality: 0.92,
  slideshowFps: 30,
  slideshowEnabled: true,
  batchVariationsEnabled: true,
  decorativeBackgrounds: true,
  backdropBlur: true,
  pageSize: 48,
};

export const LITE_LIMITS: PerformanceLimits = {
  maxImageDimension: 1024,
  maxCanvasPixels: 1_048_576,
  jpegQuality: 0.75,
  slideshowFps: 15,
  slideshowEnabled: false,
  batchVariationsEnabled: false,
  decorativeBackgrounds: false,
  backdropBlur: false,
  pageSize: 24,
};

/** Essential editor tool IDs available in lite mode. */
export const LITE_EDITOR_TOOL_IDS = new Set([
  "crop-resize",
  "adjustments",
  "remove-background",
  "white-background",
  "caption-generator",
  "object-cleanup",
]);

export function getLimits(lite: boolean): PerformanceLimits {
  return lite ? LITE_LIMITS : FULL_LIMITS;
}

/** Client-side auto-detect for lite mode (2010-era / low RAM). */
export function detectLiteDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_LITE_MODE === "true") return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return true;
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

export function readLitePreference(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LITE_STORAGE_KEY);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}
