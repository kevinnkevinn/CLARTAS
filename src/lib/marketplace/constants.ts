/** Spesifikasi marketplace untuk dimensi, aturan, dan optimasi listing. */

export type MarketplaceId =
  | "shopee"
  | "tokopedia"
  | "lazada"
  | "tiktok"
  | "amazon"
  | "etsy"
  | "shopify"
  | "general";

export interface MarketplaceSpec {
  id: MarketplaceId;
  name: string;
  mainImage: { width: number; height: number };
  minImagePx: number;
  maxTitleLength: number;
  maxImages: number;
  requiresWhiteBackground: boolean;
  aspectRatios: string[];
  locales: string[];
}

export const MARKETPLACE_SPECS: Record<MarketplaceId, MarketplaceSpec> = {
  shopee: {
    id: "shopee",
    name: "Shopee",
    mainImage: { width: 800, height: 800 },
    minImagePx: 500,
    maxTitleLength: 120,
    maxImages: 9,
    requiresWhiteBackground: true,
    aspectRatios: ["1:1", "4:5"],
    locales: ["id", "en", "zh"],
  },
  tokopedia: {
    id: "tokopedia",
    name: "Tokopedia",
    mainImage: { width: 700, height: 700 },
    minImagePx: 300,
    maxTitleLength: 150,
    maxImages: 5,
    requiresWhiteBackground: true,
    aspectRatios: ["1:1"],
    locales: ["id"],
  },
  lazada: {
    id: "lazada",
    name: "Lazada",
    mainImage: { width: 800, height: 800 },
    minImagePx: 330,
    maxTitleLength: 255,
    maxImages: 8,
    requiresWhiteBackground: false,
    aspectRatios: ["1:1"],
    locales: ["id", "en"],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Shop",
    mainImage: { width: 1080, height: 1080 },
    minImagePx: 600,
    maxTitleLength: 255,
    maxImages: 9,
    requiresWhiteBackground: false,
    aspectRatios: ["1:1", "9:16"],
    locales: ["id", "en"],
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    mainImage: { width: 2000, height: 2000 },
    minImagePx: 1000,
    maxTitleLength: 200,
    maxImages: 9,
    requiresWhiteBackground: true,
    aspectRatios: ["1:1"],
    locales: ["en"],
  },
  etsy: {
    id: "etsy",
    name: "Etsy",
    mainImage: { width: 2000, height: 2000 },
    minImagePx: 2000,
    maxTitleLength: 140,
    maxImages: 10,
    requiresWhiteBackground: false,
    aspectRatios: ["1:1", "4:5"],
    locales: ["en"],
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    mainImage: { width: 2048, height: 2048 },
    minImagePx: 800,
    maxTitleLength: 255,
    maxImages: 250,
    requiresWhiteBackground: false,
    aspectRatios: ["1:1", "4:5", "16:9"],
    locales: ["en"],
  },
  general: {
    id: "general",
    name: "General",
    mainImage: { width: 1200, height: 1200 },
    minImagePx: 500,
    maxTitleLength: 200,
    maxImages: 10,
    requiresWhiteBackground: false,
    aspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    locales: ["en", "id"],
  },
};

export const MARKETPLACE_LIST = Object.values(MARKETPLACE_SPECS).filter(
  (m) => m.id !== "general",
);

export function getMarketplaceSpec(id: string): MarketplaceSpec {
  return MARKETPLACE_SPECS[id as MarketplaceId] ?? MARKETPLACE_SPECS.general;
}

/** Pemetaan persona ke marketplace default. */
export const PERSONA_MARKETPLACE: Record<string, MarketplaceId> = {
  shopee: "shopee",
  tokopedia: "tokopedia",
  tiktok: "tiktok",
  amazon: "amazon",
  etsy: "etsy",
  shopify: "shopify",
  umkm: "shopee",
  sme: "tokopedia",
  individual: "general",
  agency: "general",
  enterprise: "amazon",
  influencer: "tiktok",
  affiliate: "shopee",
  live: "shopee",
  youtube: "general",
  "tiktok-creator": "tiktok",
  instagram: "general",
  ebay: "amazon",
};
