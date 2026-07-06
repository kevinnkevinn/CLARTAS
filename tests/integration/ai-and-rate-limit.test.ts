import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  removeBackgroundSchema,
  productStudioSchema,
  generateCopySchema,
} from "@/lib/ai/schemas";

describe("rate limit @integration", () => {
  it("TC-AI-007: mengizinkan 30 request dalam window", async () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 30; i++) {
      const r = await checkRateLimit(key, 30, 60_000);
      expect(r.ok).toBe(true);
    }
    const blocked = await checkRateLimit(key, 30, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe("AI schema validation @integration", () => {
  it("TC-AI-004: product-studio menolak prompt terlalu pendek", () => {
    const result = productStudioSchema.safeParse({ prompt: "ab" });
    expect(result.success).toBe(false);
  });

  it("TC-AI-004: product-studio menerima prompt valid", () => {
    const result = productStudioSchema.safeParse({ prompt: "Studio shot produk premium" });
    expect(result.success).toBe(true);
  });

  it("TC-EDT-030: generate-copy menolak productName kosong", () => {
    const result = generateCopySchema.safeParse({ productName: "" });
    expect(result.success).toBe(false);
  });

  it("TC-AI-001: remove-background menerima imageUrl", () => {
    const result = removeBackgroundSchema.safeParse({
      imageUrl: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });
});
