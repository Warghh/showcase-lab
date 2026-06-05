import { test, expect } from "@playwright/test";

test("treasure-hoard renders a live WebGL canvas, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/#/treasure-hoard");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible({ timeout: 10_000 });

  const ok = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c || c.width === 0 || c.height === 0) return false;
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  });
  expect(ok).toBe(true);

  await page.waitForTimeout(1200);
  await page.screenshot({ path: "e2e/__screenshots__/treasure-hoard.png" });
  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
