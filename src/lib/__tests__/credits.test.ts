import { describe, it, expect } from "vitest";
import { CREDIT_COSTS, PLANS } from "@/lib/constants";

describe("credit costs", () => {
  it("defines a positive cost for every AI action", () => {
    for (const [action, cost] of Object.entries(CREDIT_COSTS)) {
      expect(cost, action).toBeGreaterThan(0);
    }
  });

  it("matches the blueprint suggested costs", () => {
    expect(CREDIT_COSTS["remove-background"]).toBe(1);
    expect(CREDIT_COSTS["product-studio"]).toBe(5);
    expect(CREDIT_COSTS["object-cleanup"]).toBe(4);
    expect(CREDIT_COSTS["enhance-image"]).toBe(2);
    expect(CREDIT_COSTS["video-slideshow"]).toBe(10);
    expect(CREDIT_COSTS["text-to-speech"]).toBe(3);
    expect(CREDIT_COSTS["generate-copy"]).toBe(1);
  });
});

describe("plans", () => {
  it("grants increasing credits across tiers", () => {
    expect(PLANS.free.credits).toBeLessThan(PLANS.premium.credits);
    expect(PLANS.premium.credits).toBeLessThan(PLANS.enterprise.credits);
  });
});
