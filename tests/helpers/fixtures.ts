import { test as base, expect } from "@playwright/test";

/** Fixture umum: pastikan viewport desktop dan tunggu app shell. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await use(page);
  },
});

export { expect };

/** Navigasi ke rute app dan tunggu shell (sidebar + main). */
export async function gotoAppRoute(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `HTTP status untuk ${path}`).toBeLessThan(500);
  await expect(page.locator("aside").first()).toBeVisible({ timeout: 45_000 });
  await expect(page.locator("main").first()).toBeVisible({ timeout: 15_000 });
}

/** Verifikasi badge kredit di topbar (mode demo: 999,999). */
export async function expectCreditsVisible(page: import("@playwright/test").Page) {
  const creditsLink = page.locator('a[href="/billing"]').first();
  await expect(creditsLink).toBeVisible({ timeout: 15_000 });
}
