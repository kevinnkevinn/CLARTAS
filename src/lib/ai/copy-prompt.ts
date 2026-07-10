import type { MarketplaceId } from "@/lib/marketplace/constants";
import { getMarketplaceSpec } from "@/lib/marketplace/constants";

export interface CopyPromptInput {
  productName: string;
  details?: string;
  keywords?: string;
  marketplace?: string;
  tone?: string;
  brandVoice?: string;
  language?: string;
  type?: string;
}

const MARKETPLACE_TONE: Record<string, string> = {
  shopee: "casual, friendly Indonesian seller tone with emoji sparingly, highlight free shipping",
  tokopedia: "professional yet approachable Indonesian, emphasize trust and warranty",
  lazada: "clear and promotional, SEA marketplace style",
  tiktok: "trendy, short, hook-first for Gen Z shoppers",
  amazon: "concise, benefit-focused, no promotional language in title",
  etsy: "handcrafted, story-driven, artisan appeal",
  shopify: "brand-forward, premium DTC tone",
};

/** Bangun prompt LLM untuk generate copy marketplace. */
export function buildCopyPrompt(input: CopyPromptInput): string {
  const marketplace = input.marketplace ?? "general";
  const spec = getMarketplaceSpec(marketplace as MarketplaceId);
  const tone = input.tone ?? MARKETPLACE_TONE[marketplace] ?? "professional";
  const lang = input.language === "id" ? "Indonesian (Bahasa Indonesia)" : input.language === "zh" ? "Mandarin Chinese" : "English";
  const type = input.type ?? "description";
  const maxTitle = spec.maxTitleLength;

  return `You are an expert e-commerce copywriter for ${spec.name}.

Product: ${input.productName}
Details: ${input.details ?? "N/A"}
Keywords: ${input.keywords ?? "N/A"}
Brand voice: ${input.brandVoice ?? tone}
Language: ${lang}
Output type: ${type}

Rules:
- Optimize for ${spec.name} search algorithm and buyer psychology
- Title max ${maxTitle} characters if type is title
- Include primary keyword naturally
- No false health claims or prohibited terms
- For Indonesian marketplaces use Rp formatting when mentioning price
- Return ONLY the requested copy text, no explanations

Generate ${type} now:`;
}
