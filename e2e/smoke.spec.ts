import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const shotDir = "/opt/cursor/artifacts";

test.beforeAll(() => {
  fs.mkdirSync(shotDir, { recursive: true });
});

test("homepage opens radar with readable evidence and brief", async ({ page }) => {
  page.on("pageerror", (err) => {
    throw err;
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /competitors win/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /apple leads on fit/i })).toBeVisible();
  await page.screenshot({ path: path.join(shotDir, "marketing_home.png"), fullPage: true });

  await page.getByRole("button", { name: /open this scenario/i }).click();
  await expect(page.getByRole("heading", { name: /switch radar/i })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(/illustrative review/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/suggested next step/i)).toBeVisible();
  await expect(page.getByText(/priority heuristic/i)).toHaveCount(0);
  await page.screenshot({ path: path.join(shotDir, "switch_radar.png"), fullPage: true });

  await page.getByRole("link", { name: "Print brief" }).first().click();
  await expect(page.getByRole("heading", { name: /switch brief/i })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/illustrative review/i).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/tozo-erg-n-/);
  await page.screenshot({ path: path.join(shotDir, "print_brief.png"), fullPage: true });
});

test("marketing and analysis loop", async ({ page }) => {
  page.on("pageerror", (err) => {
    throw err;
  });

  await page.goto("/product");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.goto("/pricing");
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/demo/ready");
  await page.getByRole("button", { name: /restore demo scenario/i }).click();
  await expect(page.getByRole("heading", { name: /switch radar/i })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(/competitive exposure/i).first()).toBeVisible();
  await page.screenshot({ path: path.join(shotDir, "switch_radar_ready.png"), fullPage: true });

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: /hierarchy: wireless-earphones/i })).toBeVisible();
  await page.screenshot({ path: path.join(shotDir, "dashboard.png"), fullPage: true });

  await page.getByRole("link", { name: "Topics" }).click();
  await expect(page.getByRole("heading", { name: /^topics$/i })).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: path.join(shotDir, "topics.png"), fullPage: true });
});
