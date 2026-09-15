import { test, expect } from "@playwright/test";

test("demo ready opens radar", async ({ page }) => {
  await page.goto("/demo/ready");
  await page.getByRole("button", { name: /restore demo scenario/i }).click();
    await expect(page.getByRole("heading", { name: /switch radar/i })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(/synthetic demo data/i)).toBeVisible();
});
