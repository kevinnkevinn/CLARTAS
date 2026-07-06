import { test, expect, gotoAppRoute } from "../../helpers/fixtures";

/**
 * Sanity — modul inti berfungsi setelah deploy/build.
 * Traceability: TC-EDT-004, TC-AST-001, TC-BILL-010
 */
test.describe("Sanity @sanity", () => {
  test("TC-EDT-004: halaman editor studio dimuat", async ({ page }) => {
    await gotoAppRoute(page, "/editor");
    await expect(page).toHaveURL(/\/editor/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("TC-AST-001: halaman perpustakaan aset dimuat", async ({ page }) => {
    await gotoAppRoute(page, "/assets");
    await expect(page).toHaveURL(/\/assets/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("TC-BILL-010: halaman billing dimuat", async ({ page }) => {
    await gotoAppRoute(page, "/billing");
    await expect(page).toHaveURL(/\/billing/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("modul konten dan desain dapat diakses", async ({ page }) => {
    await gotoAppRoute(page, "/content");
    await expect(page).toHaveURL(/\/content/);
    await gotoAppRoute(page, "/design");
    await expect(page).toHaveURL(/\/design/);
  });
});
