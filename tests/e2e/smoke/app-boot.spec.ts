import { test, expect, gotoAppRoute, expectCreditsVisible } from "../../helpers/fixtures";

/**
 * Smoke — verifikasi cepat: app hidup, dashboard, navigasi inti.
 * Traceability: TC-PLAT-007, TC-PLAT-005, TC-AUTH-013 (demo)
 */
test.describe("Smoke @smoke", () => {
  test("TC-PLAT-007: dashboard dimuat dengan shell CLARTAS", async ({ page }) => {
    await gotoAppRoute(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expectCreditsVisible(page);
  });

  test("TC-PLAT-005: sidebar navigasi ke editor dan aset", async ({ page }) => {
    await gotoAppRoute(page, "/dashboard");
    await page.locator('aside a[href="/editor"]').click();
    await expect(page).toHaveURL(/\/editor/);
    await page.locator('aside a[href="/assets"]').click();
    await expect(page).toHaveURL(/\/assets/);
  });

  test("TC-AUTH-013: mode demo — akses dashboard tanpa sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page.locator("aside").first()).toBeVisible({ timeout: 45_000 });
  });
});
