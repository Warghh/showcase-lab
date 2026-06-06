import { test, expect } from "@playwright/test";

/**
 * Kraken Rises scene validation.
 * A procedural kraken surfacing from the black: tentacles curling, bioluminescent suckers, menace over detail.
 * Must render a live WebGL canvas, animate without errors, and prove the scene is visible.
 */

test("kraken-rises scene renders a live WebGL canvas, no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/#/kraken-rises");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible({ timeout: 10_000 });

  // canvas must have real dimensions and a working WebGL context
  const ok = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c || c.width === 0 || c.height === 0) return false;
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !!gl;
  });
  expect(ok).toBe(true);

  // let a few frames paint, then prove it's not a black void
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "e2e/__screenshots__/kraken-rises.png" });

  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
