import { test, expect, gotoAppRoute } from "../../helpers/fixtures";
import { APP_ROUTES } from "../../helpers/traceability";

/**
 * Regression — semua rute app utama merespons tanpa error fatal.
 * Traceability: TC-PLAT-004, TC-PLAT-001, TC-MKT-001
 */
test.describe("Regression @regression", () => {
  for (const route of APP_ROUTES.app) {
    test(`rute ${route} dimuat tanpa crash`, async ({ page }) => {
      await gotoAppRoute(page, route);
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")));
      await expect(page.locator("main, [role=main]").first()).toBeVisible({ timeout: 20_000 });
    });
  }

  test("TC-MKT-001: halaman pricing publik dimuat", async ({ page }) => {
    const response = await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-PLAT-004: kontrol tema tersedia di topbar", async ({ page }) => {
    await gotoAppRoute(page, "/dashboard");
    const themeBtn = page.getByRole("button", { name: /Switch to (light|dark) mode/i });
    await expect(themeBtn).toBeVisible();
    await expect(themeBtn).toBeEnabled();
  });
});
