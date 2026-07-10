import { getMarketplaceSpec, type MarketplaceId } from "./constants";
import type { ComplianceIssue } from "./compliance";

export interface ListingScoreInput {
  marketplace: MarketplaceId | string;
  title?: string;
  description?: string;
  keywords?: string;
  imageCount?: number;
  hasWhiteBackground?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  hasVideo?: boolean;
  complianceIssues?: ComplianceIssue[];
}

export interface ListingScoreResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: { category: string; points: number; max: number; tip: string }[];
  recommendations: string[];
}

function gradeFromScore(score: number): ListingScoreResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

/** Hitung Listing Score (0–100) berdasarkan kelengkapan dan kepatuhan. */
export function calculateListingScore(input: ListingScoreInput): ListingScoreResult {
  const spec = getMarketplaceSpec(input.marketplace);
  const breakdown: ListingScoreResult["breakdown"] = [];
  const recommendations: string[] = [];

  // Foto utama (25 poin)
  let photoPts = 0;
  if (input.imageWidth && input.imageHeight) {
    const minSide = Math.min(input.imageWidth, input.imageHeight);
    if (minSide >= spec.minImagePx) photoPts += 15;
    else recommendations.push(`Tingkatkan resolusi foto minimal ${spec.minImagePx}px.`);
    if (input.hasWhiteBackground || !spec.requiresWhiteBackground) photoPts += 10;
    else recommendations.push("Tambahkan background putih untuk foto utama.");
  } else {
    recommendations.push("Unggah foto produk untuk meningkatkan skor.");
  }
  breakdown.push({
    category: "Foto utama",
    points: photoPts,
    max: 25,
    tip: spec.requiresWhiteBackground ? "Background putih wajib" : "Foto berkualitas tinggi",
  });

  // Judul (20 poin)
  let titlePts = 0;
  if (input.title?.trim()) {
    titlePts += 10;
    const len = input.title.length;
    if (len <= spec.maxTitleLength && len >= 30) titlePts += 5;
    if (input.keywords && input.title.toLowerCase().includes(input.keywords.split(",")[0]?.trim().toLowerCase() ?? ""))
      titlePts += 5;
    else if (input.keywords) recommendations.push("Masukkan keyword utama di judul.");
    if (len > spec.maxTitleLength) recommendations.push(`Pendekkan judul (max ${spec.maxTitleLength} karakter).`);
  } else {
    recommendations.push("Tambahkan judul produk yang dioptimalkan SEO.");
  }
  breakdown.push({ category: "Judul", points: titlePts, max: 20, tip: "Keyword di 60 karakter pertama" });

  // Deskripsi (20 poin)
  let descPts = 0;
  if (input.description?.trim()) {
    descPts += 10;
    if (input.description.length >= 150) descPts += 5;
    if (input.description.includes("✅") || input.description.includes("•")) descPts += 5;
    else recommendations.push("Gunakan bullet point di deskripsi.");
  } else {
    recommendations.push("Tambahkan deskripsi produk lengkap.");
  }
  breakdown.push({ category: "Deskripsi", points: descPts, max: 20, tip: "Bullet + garansi + CTA" });

  // Galeri (15 poin)
  const imgCount = input.imageCount ?? (input.imageWidth ? 1 : 0);
  const galleryPts = Math.min(15, Math.round((imgCount / Math.min(5, spec.maxImages)) * 15));
  if (imgCount < 3) recommendations.push("Tambahkan minimal 3–5 foto (sudut berbeda + lifestyle).");
  breakdown.push({ category: "Galeri foto", points: galleryPts, max: 15, tip: `Ideal: ${Math.min(5, spec.maxImages)}+ foto` });

  // Video (10 poin)
  const videoPts = input.hasVideo ? 10 : 0;
  if (!input.hasVideo) recommendations.push("Tambahkan video produk 15–60 detik untuk TikTok/Shopee.");
  breakdown.push({ category: "Video", points: videoPts, max: 10, tip: "Video meningkatkan konversi" });

  // Kepatuhan (10 poin)
  const errors = (input.complianceIssues ?? []).filter((i) => i.severity === "error").length;
  const compliancePts = Math.max(0, 10 - errors * 5);
  if (errors > 0) recommendations.push("Perbaiki masalah kepatuhan sebelum publish.");
  breakdown.push({ category: "Kepatuhan", points: compliancePts, max: 10, tip: "Tanpa pelanggaran kebijakan" });

  const score = Math.min(100, breakdown.reduce((s, b) => s + b.points, 0));

  return {
    score,
    grade: gradeFromScore(score),
    breakdown,
    recommendations: recommendations.slice(0, 5),
  };
}
