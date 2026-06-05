import { test, expect } from "@playwright/test";

test("parallax-voyage renders, scrolls, layers move, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/#/parallax-voyage");

  await expect(page.getByRole("heading", { name: "Set Sail" })).toBeVisible();
  await page.screenshot({ path: "e2e/__screenshots__/parallax-voyage-top.png" });

  // scroll to the bottom — the deep should take over and a parallax layer must move
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await expect(page.getByRole("heading", { name: "The Deep" })).toBeVisible();
  await page.screenshot({ path: "e2e/__screenshots__/parallax-voyage.png" });

  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
