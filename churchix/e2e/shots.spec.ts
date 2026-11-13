import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { applyVariant, ROUTES, type Variant } from "./shapes.js";

// Screenshots of every screen at 1280x800, 1366x768, 390x844 and 360x800, for the parish's seeds and the second
// parish's, written outside git:
//
//   SHOTS_DIR=<folder> npx playwright test -c e2e shots --project churchix-desktop
//
// Without SHOTS_DIR the spec skips. The dev server has no real endpoint for Pomelnice, so its form runs the demo path.
const dir = process.env["SHOTS_DIR"];
const sizes = [
  { w: 1280, h: 800 },
  { w: 1366, h: 768 },
  { w: 390, h: 844 },
  { w: 360, h: 800 },
];
const variants: Variant[] = ["parish", "seed2", "long"];

test.describe("screenshots", () => {
  test.skip(!dir, "set SHOTS_DIR to write screenshots");
  test.use({ hasTouch: false, isMobile: false });

  for (const { screen, path } of ROUTES) {
    for (const variant of variants) {
      if (variant === "long" && screen !== "home") continue;
      test(`${screen} ${variant}`, async ({ browser }) => {
        for (const { w, h } of sizes) {
          const context = await browser.newContext({ viewport: { width: w, height: h } });
          const page = await context.newPage();
          await page.goto(path);
          await page.waitForLoadState("networkidle");
          await applyVariant(page, variant);
          const base = join(dir as string, `${screen}-${variant}-${w}`);
          mkdirSync(dir as string, { recursive: true });
          await page.screenshot({ path: `${base}.png`, fullPage: true });
          if (screen === "home") await page.screenshot({ path: `${base}-fold.png` });
          expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
          await context.close();
        }
      });
    }
  }
});
