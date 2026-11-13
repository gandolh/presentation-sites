import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { siteOf } from "./floor.js";

// tractari's own checks: the first screens, the call dock and the header call driven by one observer, the scene's
// pause off-screen, "no phone number wraps", clip, text-in-column and label-gap checks, and the screenshots.
// The Floor specs are shared (floor-*.spec.ts).
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(siteOf(info) !== "tractari", "tractari's own spec");
});

const REDUCED = { reducedMotion: "reduce" } as const;

/** The dev toolbar is off in the config; the style is a belt for a run against another server. */
async function ready(page: Page, path = "/") {
  await page.goto(path);
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" });
  await page.waitForLoadState("networkidle");
}

function phoneContext(
  browser: import("@playwright/test").Browser,
  baseURL: string | undefined,
  w: number,
  h: number,
  extra = {},
) {
  const phone = w < 700;
  return browser.newContext({
    baseURL,
    viewport: { width: w, height: h },
    hasTouch: phone,
    isMobile: phone,
    ...extra,
  });
}

const SIZES = [
  [1280, 800],
  [768, 1024],
  [390, 844],
  [360, 800],
  [360, 690],
] as const;

async function box(page: Page, selector: string, nth = 0) {
  const b = await page.locator(selector).nth(nth).boundingBox();
  if (!b) throw new Error(`${selector} has no box`);
  return b;
}

test.describe("first screens", () => {
  for (const [w, h] of SIZES) {
    test(`home at ${w}x${h}: the dispatcher's number is on the first screen`, async ({ browser, baseURL }) => {
      const context = await phoneContext(browser, baseURL, w, h, REDUCED);
      const page = await context.newPage();
      await ready(page);
      const main = await box(page, ".line--main");
      expect(main.y + main.height, "the plate ends above the fold").toBeLessThanOrEqual(h);
      // the board and its three lines read as one block, Andrei whole where the screen is 690 tall
      if (h === 690) {
        const a = await box(page, ".line--a");
        expect(a.y + a.height, "Andrei is whole on the first screen").toBeLessThanOrEqual(h);
      }
      await context.close();
    });
  }
});

test.describe("one call per frame", () => {
  test("at 1280 the header call is an outline while the plate shows and fills once it leaves", async ({
    browser,
    baseURL,
  }) => {
    const context = await phoneContext(browser, baseURL, 1280, 800, REDUCED);
    const page = await context.newPage();
    await ready(page);
    const fill = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await fill('[data-call="nav"]'), "outline at the top").toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    await expect(page.locator("html")).toHaveAttribute("data-plate", "in");
    await page.evaluate(() => document.getElementById("servicii")?.scrollIntoView({ behavior: "instant" }));
    await expect(page.locator("html")).toHaveAttribute("data-plate", "out");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.background = "var(--color-accent)";
      document.body.append(probe);
      const c = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return c;
    });
    expect(await fill('[data-call="nav"]'), "filled once the plate left").toBe(accent);
    // exactly one orange call in the frame: the Servicii call stays an outline
    const orange = await page.evaluate((a) => {
      let n = 0;
      // what is under the fixed header is not in the frame
      const under = document.getElementById("site-nav")!.getBoundingClientRect().bottom;
      for (const el of document.querySelectorAll<HTMLElement>('a[href^="tel:"]')) {
        const r = el.getBoundingClientRect();
        if ((r.bottom <= under && !el.closest("#site-nav")) || r.top > innerHeight) continue;
        if (getComputedStyle(el).backgroundColor === a) n++;
      }
      return n;
    }, accent);
    expect(orange).toBe(1);
    await context.close();
  });

  test("on a phone the dock shows only once the plate has left, and stays without script", async ({
    browser,
    baseURL,
  }) => {
    const context = await phoneContext(browser, baseURL, 390, 844, REDUCED);
    const page = await context.newPage();
    await ready(page);
    const dock = page.locator(".call-dock");
    await expect(dock).toBeHidden();
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await expect(dock).toBeVisible();
    const link = page.locator(".call-dock__main");
    await expect(link).toBeVisible();
    const ratio = await link.evaluate((el) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const g = canvas.getContext("2d", { willReadFrequently: true })!;
      const rgb = (css: string) => {
        g.clearRect(0, 0, 1, 1);
        g.fillStyle = css;
        g.fillRect(0, 0, 1, 1);
        return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const lum = (c: number[]) =>
        c
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i]!, 0);
      const fg = rgb(getComputedStyle(el).color);
      const bg = rgb(getComputedStyle(el.closest(".call-dock")!).backgroundColor);
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      return (hi! + 0.05) / (lo! + 0.05);
    });
    expect(ratio, "the dock's call against what is behind it").toBeGreaterThanOrEqual(4.5);
    await context.close();

    const nojs = await phoneContext(browser, baseURL, 390, 844, { javaScriptEnabled: false });
    const np = await nojs.newPage();
    await np.goto("/");
    await expect(np.locator(".call-dock__main")).toBeVisible();
    await nojs.close();
  });

  test("the dock reaches the bottom with the scene running", async ({ browser, baseURL }) => {
    const context = await phoneContext(browser, baseURL, 390, 844);
    const page = await context.newPage();
    await ready(page);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await expect(page.locator(".call-dock__main")).toBeVisible();
    await context.close();
  });

  test("the plate's call is clickable before the scene's chunk has loaded", async ({ browser, baseURL }) => {
    const context = await phoneContext(browser, baseURL, 390, 844);
    const page = await context.newPage();
    await page.route(/scene/, (route) => route.abort());
    await page.goto("/");
    const link = page.locator(".line--main");
    await expect(link).toBeVisible();
    await link.click({ trial: true });
    const onTop = await link.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest("a") === el;
    });
    expect(onTop, "nothing covers the plate's call").toBe(true);
    expect(await link.getAttribute("href")).toMatch(/^tel:\+/);
    await context.close();
  });
});

const COUNT_DRAWS = () => {
  const w = window as unknown as { __draws: number };
  w.__draws = 0;
  for (const C of [WebGL2RenderingContext, WebGLRenderingContext]) {
    for (const fn of ["drawElements", "drawArrays"] as const) {
      const orig = C.prototype[fn] as (...a: unknown[]) => unknown;
      (C.prototype as unknown as Record<string, unknown>)[fn] = function (...a: unknown[]) {
        w.__draws++;
        return orig.apply(this, a);
      };
    }
  }
};

test.describe("the scene plate", () => {
  test("under reduced motion the scene never draws, so the plate stays its CSS backdrop", async ({
    browser,
    baseURL,
  }) => {
    const context = await phoneContext(browser, baseURL, 1280, 800, REDUCED);
    const page = await context.newPage();
    await page.addInitScript(COUNT_DRAWS);
    await ready(page);
    await page.evaluate(() => document.getElementById("cum-functioneaza")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as { __draws: number }).__draws)).toBe(0);
    await context.close();
  });

  test("its render loop pauses off-screen", async ({ browser, baseURL }) => {
    const context = await phoneContext(browser, baseURL, 1280, 800);
    const page = await context.newPage();
    await page.addInitScript(COUNT_DRAWS);
    await ready(page);
    const draws = () => page.evaluate(() => (window as unknown as { __draws: number }).__draws);
    // off-screen at the top: after its first frame it stops
    await page.waitForTimeout(800);
    const idle = await draws();
    await page.waitForTimeout(500);
    expect(await draws(), "it does not draw while the plate is off-screen").toBe(idle);
    await page.evaluate(() => document.getElementById("cum-functioneaza")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(1500);
    const a = await draws();
    test.skip(a === idle, "this browser has no WebGL, so the plate stays its backdrop");
    await page.waitForTimeout(400);
    expect(await draws(), "it draws while in view").toBeGreaterThan(a);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(600);
    const b = await draws();
    await page.waitForTimeout(500);
    expect(await draws(), "it stops drawing off-screen").toBe(b);
    await context.close();
  });
});

test.describe("layout checks", () => {
  for (const width of [1280, 1024, 1000, 800, 768, 390, 360]) {
    test(`no phone number wraps, no clip, text in its column and label gaps at ${width}`, async ({
      browser,
      baseURL,
    }) => {
      const context = await phoneContext(browser, baseURL, width, 800, REDUCED);
      const page = await context.newPage();
      await ready(page);
      const found = await page.evaluate(() => {
        const out: string[] = [];
        // a phone number sits on one line box
        for (const a of document.querySelectorAll('a[href^="tel:"]')) {
          const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!/\d/.test(n.textContent ?? "")) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top / 4)));
            if (tops.size > 1) out.push(`wrap: "${(n.textContent ?? "").trim()}" in ${a.className}`);
          }
        }
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = (n.textContent ?? "").trim();
          const el = n.parentElement;
          if (!text || !el || el.closest(".sr-only,svg,astro-dev-toolbar") || ["SCRIPT", "STYLE"].includes(el.tagName))
            continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          const r = range.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          for (let a: HTMLElement | null = el; a && a !== document.documentElement; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (!/hidden|clip/.test(cs.overflowX + cs.overflowY) || a === document.body) continue;
            const b = a.getBoundingClientRect();
            if (r.left < b.left - 0.5 || r.right > b.right + 0.5 || r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5) {
              out.push(`clip: "${text.slice(0, 24)}" in <${a.tagName.toLowerCase()} class="${a.className}">`);
            }
          }
          let blk: HTMLElement | null = el;
          while (blk && getComputedStyle(blk).display.startsWith("inline")) blk = blk.parentElement;
          if (blk) {
            const cs = getComputedStyle(blk);
            const b = blk.getBoundingClientRect();
            const left = b.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
            const right = b.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
            if (r.left < left - 1 || r.right > right + 1) {
              out.push(`column: "${text.slice(0, 24)}" in <${blk.tagName.toLowerCase()} class="${blk.className}">`);
            }
          }
        }
        // a label and its note stay together
        for (const [parent, a, b, max] of [
          [".tile", "h3", "p", 12],
          [".strip li", "h3", "p", 16],
        ] as const) {
          for (const li of document.querySelectorAll(parent)) {
            const x = li.querySelector(a)?.getBoundingClientRect();
            const y = li.querySelector(b)?.getBoundingClientRect();
            if (x && y && y.top >= x.bottom - 2 && y.top - x.bottom > max) {
              out.push(`gap: ${parent} ${a} to ${b} is ${Math.round(y.top - x.bottom)} px`);
            }
          }
        }
        return out;
      });
      expect(found, `at ${width}`).toEqual([]);
      await context.close();
    });
  }
});

// SHOTS_DIR=<dir> SITES=tractari npx playwright test -c e2e --project tractari-desktop tractari.spec.ts -g shots --workers=2
test("shots: every screen once per width", async ({ browser, baseURL }) => {
  const dir = process.env["SHOTS_DIR"];
  test.skip(!dir, "set SHOTS_DIR to take the screenshots");
  test.setTimeout(540_000);
  mkdirSync(dir!, { recursive: true });
  for (const [width, height] of [
    [1280, 800],
    [768, 1024],
    [390, 844],
    [360, 800],
    [360, 690],
  ] as const) {
    const phone = width < 700;
    const context = await phoneContext(browser, baseURL, width, height, REDUCED);
    const page = await context.newPage();
    await ready(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(dir!, `home-first-dark-${width}x${height}.png`) });
    if (height === 800 || height === 1024 || (width === 390 && height === 844)) {
      await page.screenshot({ path: join(dir!, `home-dark-${width}.png`), fullPage: true });
    }
    // scrolled frames: the plate has left, so the header call fills (and on a phone the dock shows)
    if (height !== 690) {
      await page.evaluate(() => document.getElementById("servicii")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(dir!, `home-servicii-dark-${width}.png`) });
      await page.evaluate(() => document.getElementById("cum-functioneaza")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(dir!, `home-cum-dark-${width}.png`) });
    }
    if (phone && height !== 690 && width === 390) {
      await page.evaluate(() => document.getElementById("servicii")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(300);
      const toggle = page.locator(".call-dock__toggle");
      await toggle.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(dir!, `dock-open-dark-${width}.png`) });
      await toggle.click();
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(
        () => document.querySelector('astro-island[component-url*="MobileMenu"][ssr]') === null,
      );
      await page.getByRole("button", { name: "Deschide meniul" }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(dir!, `drawer-dark-${width}.png`) });
    }
    await context.close();
  }
  // the scene running (software WebGL in headless Chromium): the plate with the truck
  for (const [width, height] of [
    [1280, 800],
    [390, 844],
  ] as const) {
    const context = await phoneContext(browser, baseURL, width, height);
    const page = await context.newPage();
    await ready(page);
    await page.evaluate(() => document.getElementById("cum-functioneaza")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(dir!, `home-cum-scene-dark-${width}.png`) });
    await context.close();
  }
  // the page without script: the dock stays visible
  const nojs = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const np = await nojs.newPage();
  await np.goto("/");
  await np.screenshot({ path: join(dir!, "home-first-noscript-dark-390.png") });
  await nojs.close();
});
