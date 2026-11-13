import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { isPhone, siteOf } from "./floor.js";

// saloon's own checks: the first screens, the docked booking bar, the clip check and the screenshots. The Floor specs
// (contrast, focus, motion, overflow) are shared and live in floor-*.spec.ts.
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(siteOf(info) !== "saloon", "saloon's own spec");
});

const REDUCED = { reducedMotion: "reduce" } as const;

/** The dev toolbar is not part of the page. */
async function ready(page: Page, path = "/") {
  await page.goto(path);
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" });
  await page.waitForLoadState("networkidle");
}

async function box(page: Page, selector: string) {
  const b = await page.locator(selector).first().boundingBox();
  if (!b) throw new Error(`${selector} has no box`);
  return b;
}

test.describe("first screens", () => {
  test("1280x800 holds all three price rows whole", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, ...REDUCED });
    const page = await context.newPage();
    await ready(page);
    const rows = page.locator(".menu__row");
    expect(await rows.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      const b = (await rows.nth(i).boundingBox())!;
      expect(b.y + b.height, `row ${i + 1} ends above the fold`).toBeLessThanOrEqual(800);
    }
    await context.close();
  });

  for (const [w, h] of [
    [390, 844],
    [360, 800],
  ] as const) {
    test(`${w}x${h} shows the first price row, Programează included, above the dock`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: w, height: h },
        hasTouch: true,
        isMobile: true,
        ...REDUCED,
      });
      const page = await context.newPage();
      await ready(page);
      const dock = await box(page, "#mobile-booking-bar");
      const row = (await page.locator(".menu__row").first().boundingBox())!;
      expect(dock.y, "the dock sits at the bottom edge").toBeGreaterThan(h - 100);
      expect(row.y + row.height, "the first row clears the dock").toBeLessThanOrEqual(dock.y);
      await context.close();
    });
  }
});

test.describe("the docked booking bar", () => {
  test.beforeEach(({ browserName: _browser }, info) => {
    test.skip(!isPhone(info), "the dock is a phone control");
  });

  test("a wa.me link is in view at every scroll step, and the dock hides only beside the page's own buttons", async ({
    page,
  }) => {
    await page.emulateMedia(REDUCED);
    await ready(page);
    const dock = page.locator("#mobile-booking-bar");
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const problems: string[] = [];
    for (let y = 0; y < total; y += 200) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(60);
      const state = await page.evaluate(() => {
        const dockEl = document.getElementById("mobile-booking-bar")!;
        const dockShown = dockEl.dataset.state === "shown";
        const inView = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
        };
        const own = [...document.querySelectorAll("[data-booking-cta]")].some(inView);
        const wa = [...document.querySelectorAll('a[href*="wa.me"]')].some(inView);
        return { dockShown, own, wa };
      });
      if (!state.wa && !state.dockShown) problems.push(`scrollY ${y}: no WhatsApp link in view`);
      if (state.own && state.dockShown) problems.push(`scrollY ${y}: the dock doubles the page's own button`);
      if (!state.own && !state.dockShown)
        problems.push(`scrollY ${y}: the dock is hidden with no booking button on screen`);
    }
    expect(problems).toEqual([]);
    await expect(dock.locator('a[href^="tel:"]')).toHaveCount(1);
  });

  test("is there from the first paint and without scripts", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#mobile-booking-bar")).toBeVisible();
    await context.close();
  });

  test("hides while the menu is open", async ({ page }) => {
    await ready(page);
    await page.waitForFunction(() => document.querySelector('astro-island[component-url*="MobileMenu"][ssr]') === null);
    await expect(page.locator("#mobile-booking-bar")).toHaveAttribute("data-state", "shown");
    await page.getByRole("button", { name: "Deschide meniul" }).click();
    await expect(page.locator("#mobile-booking-bar")).toHaveAttribute("data-state", "hidden");
  });
});

test.describe("the clip check", () => {
  for (const width of [1280, 1024, 768, 390, 360]) {
    test(`no text box leaves an overflow-hidden ancestor at ${width}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width, height: 800 }, ...REDUCED });
      const page = await context.newPage();
      for (const path of ["/", "/termeni/"]) {
        await ready(page, path);
        // Open every FAQ row so its answer counts too.
        await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
        const clipped = await page.evaluate(() => {
          const out: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const text = (n.textContent ?? "").trim();
            const el = n.parentElement;
            if (!text || !el || el.closest(".sr-only") || ["SCRIPT", "STYLE"].includes(el.tagName)) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            const r = range.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            for (let a: HTMLElement | null = el; a && a !== document.documentElement; a = a.parentElement) {
              const cs = getComputedStyle(a);
              if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
              const b = a.getBoundingClientRect();
              if (
                r.left < b.left - 0.5 ||
                r.right > b.right + 0.5 ||
                r.top < b.top - 0.5 ||
                r.bottom > b.bottom + 0.5
              ) {
                out.push(`"${text.slice(0, 30)}" leaves <${a.tagName.toLowerCase()} class="${a.className}">`);
              }
            }
          }
          return out;
        });
        expect(clipped, `${path} at ${width}`).toEqual([]);
      }
      await context.close();
    });
  }
});

// SHOTS_DIR=<dir> SITES=saloon npx playwright test -c e2e --project saloon-desktop saloon.spec.ts -g shots
test("shots: every screen once per width", async ({ browser, baseURL }) => {
  const dir = process.env["SHOTS_DIR"];
  test.skip(!dir, "set SHOTS_DIR to take the screenshots");
  test.setTimeout(240_000);
  mkdirSync(dir!, { recursive: true });
  for (const [width, height] of [
    [1280, 800],
    [390, 844],
    [360, 800],
  ] as const) {
    const phone = width < 700;
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: phone,
      isMobile: phone,
      ...REDUCED,
    });
    const page = await context.newPage();
    for (const [name, path] of [
      ["home", "/"],
      ["confidentialitate", "/confidentialitate/"],
      ["cookie-uri", "/cookie-uri/"],
      ["termeni", "/termeni/"],
    ] as const) {
      await ready(page, path);
      await page.screenshot({ path: join(dir!, `${name}-light-${width}.png`), fullPage: true });
      if (name === "home") await page.screenshot({ path: join(dir!, `${name}-first-light-${width}.png`) });
    }
    if (phone) {
      await ready(page);
      await page.waitForFunction(
        () => document.querySelector('astro-island[component-url*="MobileMenu"][ssr]') === null,
      );
      await page.getByRole("button", { name: "Deschide meniul" }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(dir!, `drawer-light-${width}.png`) });
    }
    await context.close();
  }
});
