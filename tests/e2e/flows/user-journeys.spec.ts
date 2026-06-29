import { test, expect, gotoAppRoute } from "../../helpers/fixtures";

/**
 * E2E — alur pengguna multi-langkah.
 * Traceability: TC-EDT-031, TC-DMO-001
 */
test.describe("E2E @e2e", () => {
  test("TC-EDT-031: deep link editor ?tool=remove-background", async ({ page }) => {
    await gotoAppRoute(page, "/editor?tool=remove-background");
    await expect(page).toHaveURL(/tool=remove-background/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("TC-DMO-001: alur dashboard → editor → aset → billing", async ({ page }) => {
    await gotoAppRoute(page, "/dashboard");
    await page.locator('aside a[href="/editor"]').click();
    await expect(page).toHaveURL(/\/editor/);

    await page.locator('aside a[href="/assets"]').click();
    await expect(page).toHaveURL(/\/assets/);

    await page.locator('a[href="/billing"]').first().click();
    await expect(page).toHaveURL(/\/billing/);
  });

  test("navigasi intelligence sub-routes", async ({ page }) => {
    await gotoAppRoute(page, "/intelligence");
    await expect(page).toHaveURL(/\/intelligence/);

    await gotoAppRoute(page, "/intelligence/research");
    await expect(page).toHaveURL(/\/intelligence\/research/);

    await gotoAppRoute(page, "/intelligence/assistant");
    await expect(page).toHaveURL(/\/intelligence\/assistant/);
  });

  test("halaman ai-tools dan brand-kit", async ({ page }) => {
    await gotoAppRoute(page, "/ai-tools");
    await expect(page.locator("main")).toBeVisible();
    await gotoAppRoute(page, "/brand-kit");
    await expect(page.locator("main")).toBeVisible();
  });
});
