import { describe, expect, it } from "vitest";
import { calculateListingScore } from "@/lib/marketplace/listing-score";
import { scanCompliance } from "@/lib/marketplace/compliance";

describe("listing-score", () => {
  it("memberikan skor tinggi untuk listing lengkap", () => {
    const issues = scanCompliance({
      marketplace: "shopee",
      title: "Tas Kulit Premium Wanita — Original | Gratis Ongkir",
      imageWidth: 800,
      imageHeight: 800,
      hasWhiteBackground: true,
    });
    const result = calculateListingScore({
      marketplace: "shopee",
      title: "Tas Kulit Premium Wanita — Original | Gratis Ongkir",
      description: "Tas kulit asli dengan kualitas premium.\n\n✅ Garansi resmi\n✅ Pengiriman cepat",
      keywords: "tas wanita, kulit",
      imageCount: 5,
      hasWhiteBackground: true,
      imageWidth: 800,
      imageHeight: 800,
      hasVideo: true,
      complianceIssues: issues,
    });
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.grade).toMatch(/^[AB]$/);
  });

  it("memberikan skor rendah tanpa foto", () => {
    const result = calculateListingScore({ marketplace: "shopee" });
    expect(result.score).toBeLessThan(50);
    expect(result.grade).toMatch(/^[DF]$/);
  });
});
