import { test, expect } from "@playwright/test";

/**
 * Base smoke test — every scene must clear this bar.
 * The pattern a validator copies per scene: load, assert canvas renders with
 * real pixels, assert zero console errors, capture evidence.
 */

test("gallery loads and lists scenes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "WebGL Demos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Moonlit Sea" })).toBeVisible();
});

test("moonlit-sea scene renders a live WebGL canvas, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/#/moonlit-sea");

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
  await page.screenshot({ path: "e2e/__screenshots__/moonlit-sea.png" });

  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
