import { test, expect, gotoAppRoute, expectCreditsVisible } from "../../helpers/fixtures";

/**
 * UAT — kriteria penerimaan pengguna (acceptance).
 * Traceability: TC-BILL-001, TC-CNT-001, TC-DMO-002
 */
test.describe("UAT @uat", () => {
  test("TC-BILL-001: pengguna demo melihat saldo kredit unlimited", async ({ page }) => {
    await gotoAppRoute(page, "/dashboard");
    await expectCreditsVisible(page);
    const billingLink = page.locator('a[href="/billing"]').first();
    const text = await billingLink.textContent();
    expect(text?.replace(/\D/g, "")).toMatch(/999999/);
  });

  test("TC-CNT-001: generator konten dapat diakses pengguna", async ({ page }) => {
    await gotoAppRoute(page, "/content");
    await expect(page).toHaveURL(/\/content/);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("TC-DMO-002: workspace dan approvals tersedia untuk admin demo", async ({ page }) => {
    await gotoAppRoute(page, "/workspace");
    await expect(page).toHaveURL(/\/workspace/);
    await gotoAppRoute(page, "/approvals");
    await expect(page).toHaveURL(/\/approvals/);
  });

  test("kriteria UAT: modul video dan e-commerce siap digunakan", async ({ page }) => {
    const modules = ["/video-editor", "/video-ad", "/ecommerce", "/photography", "/agents", "/automation"];
    for (const mod of modules) {
      await gotoAppRoute(page, mod);
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
