/**
 * Browser-based image processing for demo mode.
 * Produces real visual output without external AI APIs.
 */

export interface FilterOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  vibrance?: number;
  sharpness?: number;
  hue?: number;
  exposure?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, type = "image/png"): string {
  return canvas.toDataURL(type, 0.92);
}

export async function applyFilters(
  imageUrl: string,
  opts: FilterOptions,
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  const b = opts.brightness ?? 100;
  const c = opts.contrast ?? 100;
  const s = opts.saturation ?? 100;
  const v = opts.vibrance ?? 100;
  const h = opts.hue ?? 0;
  const e = opts.exposure ?? 100;
  const satBoost = s + (v - 100) * 0.5;
  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${satBoost}%) hue-rotate(${h}deg) brightness(${e}%)`;
  ctx.drawImage(img, 0, 0);
  if ((opts.sharpness ?? 0) > 0) {
    applySharpen(ctx, canvas.width, canvas.height, (opts.sharpness ?? 0) / 100);
  }
  return canvasToDataUrl(canvas);
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const copy = new Uint8ClampedArray(d);
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += copy[idx]! * kernel[ki]!;
            ki++;
          }
        }
        d[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, sum));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/** Simple chroma-style background removal using corner color sampling. */
export async function removeBackground(imageUrl: string, threshold = 40): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  const corners = [
    0,
    (canvas.width - 1) * 4,
    (canvas.height - 1) * canvas.width * 4,
    ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4,
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const i of corners) {
    br += d[i]!;
    bg += d[i + 1]!;
    bb += d[i + 2]!;
  }
  br /= 4;
  bg /= 4;
  bb /= 4;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt(
      (d[i]! - br) ** 2 + (d[i + 1]! - bg) ** 2 + (d[i + 2]! - bb) ** 2,
    );
    if (dist < threshold) d[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function addSolidBackground(
  imageUrl: string,
  color: string,
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function addGradientBackground(
  imageUrl: string,
  colors: [string, string],
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function addShadow(imageUrl: string): Promise<string> {
  const img = await loadImage(imageUrl);
  const pad = 40;
  const canvas = document.createElement("canvas");
  canvas.width = img.width + pad * 2;
  canvas.height = img.height + pad * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;
  ctx.drawImage(img, pad, pad);
  ctx.shadowColor = "transparent";
  return canvasToDataUrl(canvas);
}

export async function removeReflection(imageUrl: string): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  const h = canvas.height;
  for (let y = Math.floor(h * 0.55); y < h; y++) {
    const fade = (y - h * 0.55) / (h * 0.45);
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      d[i] = Math.round(d[i]! * (1 - fade * 0.6));
      d[i + 1] = Math.round(d[i + 1]! * (1 - fade * 0.6));
      d[i + 2] = Math.round(d[i + 2]! * (1 - fade * 0.6));
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function upscaleImage(imageUrl: string, scale = 2): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToDataUrl(canvas);
}

export async function denoiseImage(imageUrl: string): Promise<string> {
  return applyFilters(imageUrl, { sharpness: -20, contrast: 102, saturation: 98 });
}

export async function colorCorrect(imageUrl: string): Promise<string> {
  return applyFilters(imageUrl, { contrast: 108, saturation: 112, vibrance: 115, exposure: 105 });
}

export async function retouchProduct(imageUrl: string): Promise<string> {
  return applyFilters(imageUrl, { contrast: 110, saturation: 105, sharpness: 30, exposure: 108 });
}

export async function repairImage(imageUrl: string): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "contrast(105%) saturate(105%)";
  ctx.drawImage(img, 0, 0);
  return canvasToDataUrl(canvas);
}

export type ScenePreset =
  | "studio"
  | "luxury"
  | "lifestyle"
  | "outdoor"
  | "home"
  | "advertisement"
  | "white"
  | "marketplace";

const SCENE_BACKGROUNDS: Record<ScenePreset, [string, string]> = {
  studio: ["#f5f5f5", "#e8e8e8"],
  luxury: ["#1a1a2e", "#16213e"],
  lifestyle: ["#fef3e2", "#fde8d0"],
  outdoor: ["#87ceeb", "#98d8aa"],
  home: ["#faf6f0", "#ede4d9"],
  advertisement: ["#ff6b35", "#f7c59f"],
  white: ["#ffffff", "#ffffff"],
  marketplace: ["#ffffff", "#f0f0f0"],
};

export async function applyScene(
  imageUrl: string,
  scene: ScenePreset,
  withShadow = true,
): Promise<string> {
  const fg = await removeBackground(imageUrl);
  const [c1, c2] = SCENE_BACKGROUNDS[scene] ?? SCENE_BACKGROUNDS.studio;
  let result = await addGradientBackground(fg, [c1, c2]);
  if (withShadow) result = await addShadow(result);
  return result;
}

export async function generateVariation(
  imageUrl: string,
  index: number,
): Promise<string> {
  const scenes: ScenePreset[] = [
    "studio",
    "luxury",
    "lifestyle",
    "outdoor",
    "home",
    "advertisement",
    "marketplace",
    "white",
  ];
  const scene = scenes[index % scenes.length]!;
  const hue = (index * 37) % 360;
  let result = await applyScene(imageUrl, scene, index % 3 !== 0);
  result = await applyFilters(result, {
    hue,
    saturation: 95 + (index % 20),
    contrast: 100 + (index % 15),
    vibrance: 100 + (index % 25),
  });
  return result;
}

export async function cropResize(
  imageUrl: string,
  aspectRatio: string,
  targetWidth?: number,
): Promise<string> {
  const img = await loadImage(imageUrl);
  let tw = img.width;
  let th = img.height;
  if (aspectRatio !== "free") {
    const [aw, ah] = aspectRatio.includes("x")
      ? aspectRatio.split("x").map(Number)
      : aspectRatio.split(":").map(Number);
    const ratio = aw! / ah!;
    if (tw / th > ratio) tw = Math.round(th * ratio);
    else th = Math.round(tw / ratio);
  }
  if (targetWidth) {
    th = Math.round((targetWidth / tw) * th);
    tw = targetWidth;
  }
  const sx = (img.width - tw) / 2;
  const sy = (img.height - th) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, tw, th, 0, 0, tw, th);
  return canvasToDataUrl(canvas);
}

export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export async function blobUrlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
