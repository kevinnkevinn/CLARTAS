import { getMarketplaceSpec, MARKETPLACE_LIST, type MarketplaceId } from "./constants";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Resize gambar ke dimensi marketplace via canvas. */
export async function resizeForMarketplace(
  imageUrl: string,
  marketplaceId: MarketplaceId | string,
): Promise<string> {
  const spec = getMarketplaceSpec(marketplaceId);
  const img = await loadImage(imageUrl);
  const { width: tw, height: th } = spec.mainImage;
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tw, th);
  const scale = Math.min(tw / img.width, th / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (tw - w) / 2, (th - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export interface MarketplaceExportItem {
  marketplaceId: MarketplaceId;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

/** Ekspor gambar ke semua marketplace utama. */
export async function exportToAllMarketplaces(imageUrl: string): Promise<MarketplaceExportItem[]> {
  const results: MarketplaceExportItem[] = [];
  for (const spec of MARKETPLACE_LIST) {
    const dataUrl = await resizeForMarketplace(imageUrl, spec.id);
    results.push({
      marketplaceId: spec.id,
      name: spec.name,
      dataUrl,
      width: spec.mainImage.width,
      height: spec.mainImage.height,
    });
  }
  return results;
}

/** Unduh data URL sebagai file. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
