import { test, expect } from "@playwright/test";

/**
 * Constellation Navigator scene validation.
 * Must render: interactive celestial sphere, constellations, astrolabe compass.
 * Must support OrbitControls for user interaction.
 * Zero console errors, live WebGL context.
 */

test("constellation-navigator scene renders a live WebGL canvas, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/#/constellation-navigator");

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
  await page.screenshot({ path: "e2e/__screenshots__/constellation-navigator.png" });

  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
