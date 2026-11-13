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

// The states the pages have besides their resting look: the open phone menu, Pomelnice's error and sent states
// (the dev server's demo path), and the IBAN after Copiază.
test.describe("state screenshots", () => {
  test.skip(!dir, "set SHOTS_DIR to write screenshots");
  test.use({ hasTouch: false, isMobile: false });

  for (const { w, h } of [
    { w: 1280, h: 800 },
    { w: 390, h: 844 },
  ]) {
    test(`pomelnice error and sent at ${w}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await context.newPage();
      await page.goto("/pomelnice");
      await page.waitForLoadState("networkidle");
      await page.locator("form").evaluate((f) => (f as HTMLFormElement).requestSubmit());
      await page.screenshot({ path: join(dir as string, `pomelnice-error-parish-${w}.png`), fullPage: true });
      await page.getByRole("textbox", { name: /Scrieți numele de botez ale celor vii/ }).fill("Ioan, Maria");
      await page.getByRole("button", { name: "Trimite Pomelnicul" }).click();
      await page.screenshot({ path: join(dir as string, `pomelnice-sent-parish-${w}.png`), fullPage: true });
      await context.close();
    });
  }

  test("phone menu open and the IBAN copied", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector('astro-island[component-url*="MobileNav"][ssr]') === null);
    await page.getByRole("button", { name: "Deschide meniul" }).click();
    await page.getByRole("dialog", { name: "Meniu" }).waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(dir as string, "menu-open-parish-390.png") });
    await page.keyboard.press("Escape");
    await page.goto("/donatii");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /^Copiază IBAN/ })
      .first()
      .click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(dir as string, "donatii-copied-parish-390.png") });
    await context.close();
  });
});
