import { getMarketplaceSpec, type MarketplaceId } from "./constants";

export type ComplianceSeverity = "error" | "warning" | "info";

export interface ComplianceIssue {
  id: string;
  severity: ComplianceSeverity;
  message: string;
  fix?: string;
}

export interface ComplianceInput {
  marketplace: MarketplaceId | string;
  title?: string;
  imageWidth?: number;
  imageHeight?: number;
  hasWhiteBackground?: boolean;
  hasWatermark?: boolean;
  hasTextOverlay?: boolean;
  prohibitedTerms?: string[];
}

const PROHIBITED_ID = [
  "obat",
  "100% sembuh",
  "jamin sembuh",
  "palsu",
  "replika",
  "fake",
  "counterfeit",
  "miracle cure",
];

/** Pindai listing untuk masalah kepatuhan marketplace. */
export function scanCompliance(input: ComplianceInput): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const spec = getMarketplaceSpec(input.marketplace);

  if (input.imageWidth && input.imageHeight) {
    const minSide = Math.min(input.imageWidth, input.imageHeight);
    if (minSide < spec.minImagePx) {
      issues.push({
        id: "resolution_low",
        severity: "error",
        message: `Resolusi terlalu rendah (${minSide}px). Minimum ${spec.name}: ${spec.minImagePx}px.`,
        fix: "Gunakan Smart Enhancer atau unggah foto resolusi lebih tinggi.",
      });
    }
  }

  if (spec.requiresWhiteBackground && input.hasWhiteBackground === false) {
    issues.push({
      id: "white_bg_required",
      severity: "error",
      message: `${spec.name} memerlukan background putih pada foto utama.`,
      fix: "Gunakan alat White Background atau Remove Background.",
    });
  }

  if (input.hasWatermark) {
    issues.push({
      id: "watermark",
      severity: "error",
      message: "Watermark terdeteksi — melanggar kebijakan marketplace.",
      fix: "Hapus watermark sebelum publish.",
    });
  }

  if (input.hasTextOverlay && input.marketplace === "amazon") {
    issues.push({
      id: "amazon_text",
      severity: "error",
      message: "Amazon melarang teks/promosi pada foto utama.",
      fix: "Gunakan foto produk tanpa teks overlay.",
    });
  }

  if (input.title) {
    if (input.title.length > spec.maxTitleLength) {
      issues.push({
        id: "title_long",
        severity: "warning",
        message: `Judul melebihi ${spec.maxTitleLength} karakter untuk ${spec.name}.`,
        fix: "Pendekkan judul, letakkan keyword utama di awal.",
      });
    }
    const lower = input.title.toLowerCase();
    for (const term of PROHIBITED_ID) {
      if (lower.includes(term)) {
        issues.push({
          id: `prohibited_${term}`,
          severity: "error",
          message: `Klaim terlarang terdeteksi: "${term}".`,
          fix: "Hapus klaim kesehatan/palsu dari judul dan deskripsi.",
        });
      }
    }
    if (input.prohibitedTerms?.length) {
      for (const term of input.prohibitedTerms) {
        if (lower.includes(term.toLowerCase())) {
          issues.push({
            id: `custom_${term}`,
            severity: "warning",
            message: `Istilah berisiko: "${term}".`,
          });
        }
      }
    }
  }

  if (issues.length === 0) {
    issues.push({
      id: "all_clear",
      severity: "info",
      message: `Listing memenuhi persyaratan dasar ${spec.name}.`,
    });
  }

  return issues;
}

/** Deteksi background putih sederhana dari data URL (sampling sudut). */
export async function detectWhiteBackground(imageUrl: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(false);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      const corners = [0, (size - 1) * 4, (size - 1) * size * 4, ((size - 1) * size + size - 1) * 4];
      let whiteCount = 0;
      for (const i of corners) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (r > 240 && g > 240 && b > 240) whiteCount++;
      }
      resolve(whiteCount >= 3);
    };
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}

/** Ukur dimensi gambar dari URL. */
export function getImageDimensions(
  imageUrl: string,
): Promise<{ width: number; height: number }> {
  if (typeof window === "undefined") return Promise.resolve({ width: 0, height: 0 });
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = imageUrl;
  });
}
