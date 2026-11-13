import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { siteOf } from "./floor.js";

// subcort's own checks: the first screens, the hero's still frame and its off-screen pause, the size picker, the
// clip, text-in-column and label-gap checks, and the screenshots. The Floor specs are shared (floor-*.spec.ts).
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(siteOf(info) !== "subcort", "subcort's own spec");
});

const REDUCED = { reducedMotion: "reduce" } as const;

/** The dev toolbar is off in the config; the style is a belt for a run against another server. */
async function ready(page: Page, path = "/") {
  await page.goto(path);
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" });
  await page.waitForLoadState("networkidle");
}

async function bottomOf(page: Page, selector: string, nth = 0) {
  const b = await page.locator(selector).nth(nth).boundingBox();
  if (!b) throw new Error(`${selector} has no box`);
  return b.y + b.height;
}

test.describe("first screens", () => {
  test("home at 1280x800 shows the Zonă cell above the fold", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, ...REDUCED });
    const page = await context.newPage();
    await ready(page);
    const cell = page.locator(".tb dl > div", { hasText: "Zonă" });
    const b = (await cell.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(800);
    await context.close();
  });

  for (const [w, h] of [
    [390, 844],
    [360, 800],
  ] as const) {
    test(`home at ${w}x${h}: the Zonă row leads the spec list, on the first screen`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: w, height: h },
        hasTouch: true,
        isMobile: true,
        ...REDUCED,
      });
      const page = await context.newPage();
      await ready(page);
      const rows = page.locator(".tb dl > div");
      const first = (await rows.first().boundingBox())!;
      // DOM order keeps Zonă last (the five cells read in the comp's order on a desktop); on a phone it is placed first.
      const zona = (await page.locator(".tb dl > div", { hasText: "Zonă" }).boundingBox())!;
      for (const [i] of [0, 1, 2, 3, 4].entries()) {
        const b = (await rows.nth(i).boundingBox())!;
        expect(zona.y, "the Zonă row is the top row").toBeLessThanOrEqual(b.y);
      }
      expect(first.height).toBeGreaterThan(0);
      expect(zona.y + zona.height).toBeLessThanOrEqual(h);
      await context.close();
    });

    test(`contact at ${w}x${h}: the address is on the first screen`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: w, height: h },
        hasTouch: true,
        isMobile: true,
        ...REDUCED,
      });
      const page = await context.newPage();
      await ready(page, "/contact/");
      const rows = page.locator(".crow");
      expect(await rows.count()).toBe(3);
      expect(await bottomOf(page, ".crow", 2), "the address row ends above the fold").toBeLessThanOrEqual(h);
      await context.close();
    });
  }

  test("servicii at 1280x800 holds the three services whole", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, ...REDUCED });
    const page = await context.newPage();
    await ready(page, "/servicii/");
    expect(await page.locator(".svc").count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      expect(await bottomOf(page, ".svc", i), `service ${i + 1} ends above the fold`).toBeLessThanOrEqual(800);
    }
    await context.close();
  });
});

test.describe("the hero tent", () => {
  test("under reduced motion it stays one still frame", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, ...REDUCED });
    const page = await context.newPage();
    await ready(page);
    await page.waitForTimeout(1500);
    expect(await page.locator("[data-stage][data-live]").count(), "WebGL never starts").toBe(0);
    await expect(page.locator("[data-still] svg")).toBeVisible();
    await context.close();
  });

  test("its render loop pauses off-screen", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
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
    });
    await ready(page);
    const live = await page
      .waitForSelector("[data-stage][data-live]", { timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!live, "this browser has no WebGL, so the hero stays on its still frame");
    const draws = () => page.evaluate(() => (window as unknown as { __draws: number }).__draws);
    const a = await draws();
    await page.waitForTimeout(400);
    expect(await draws(), "it draws while in view").toBeGreaterThan(a);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(400);
    const b = await draws();
    await page.waitForTimeout(500);
    expect(await draws(), "it stops drawing off-screen").toBe(b);
    await context.close();
  });
});

test.describe("the size picker", () => {
  test("the plan moves to the chosen format, and the picker rests disabled without script", async ({
    browser,
    baseURL,
  }) => {
    const nojs = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const noPage = await nojs.newPage();
    await noPage.goto("/corturi/");
    expect(await noPage.locator(".pick button:disabled").count(), "four sizes rest disabled").toBe(4);
    await nojs.close();

    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await ready(page, "/corturi/");
    await page.locator(".plan").scrollIntoViewIfNeeded();
    const buttons = page.locator(".pick button");
    await expect(buttons.first()).toBeEnabled();
    expect(
      await buttons
        .first()
        .boundingBox()
        .then((b) => b?.height ?? 0),
    ).toBeGreaterThanOrEqual(48);
    await buttons.first().click();
    await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".data dd").first()).toContainText("64");
    await context.close();
  });

  for (const width of [390, 360]) {
    test(`plan labels stay readable at ${width}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 800 },
        hasTouch: true,
        isMobile: true,
        ...REDUCED,
      });
      const page = await context.newPage();
      await ready(page, "/corturi/");
      await page.locator(".plan").scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll(".plan__svg text")].map((t) => ({
          text: (t.textContent ?? "").trim(),
          px: parseFloat(getComputedStyle(t).fontSize) * (t as SVGTextElement).getScreenCTM()!.a,
        })),
      );
      expect(sizes.length).toBe(3);
      for (const s of sizes) {
        const min = /mașină/.test(s.text) ? 11 : 12;
        expect(s.px, `"${s.text}" at ${width}`).toBeGreaterThanOrEqual(min);
      }
      await context.close();
    });
  }
});

const PAGES = ["/", "/corturi/", "/servicii/", "/zona/", "/contact/", "/termeni/"];

test.describe("layout checks", () => {
  for (const width of [1280, 1024, 768, 390, 360]) {
    test(`clip, text in its column, and label gaps at ${width}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width, height: 800 }, ...REDUCED });
      const page = await context.newPage();
      for (const path of PAGES) {
        await ready(page, path);
        const found = await page.evaluate(() => {
          const out: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const text = (n.textContent ?? "").trim();
            const el = n.parentElement;
            if (!text || !el || el.closest(".sr-only,svg,thead") || ["SCRIPT", "STYLE"].includes(el.tagName)) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            const r = range.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            // clipped by an overflow-hidden ancestor
            for (let a: HTMLElement | null = el; a && a !== document.documentElement; a = a.parentElement) {
              const cs = getComputedStyle(a);
              if (!/hidden|clip/.test(cs.overflowX + cs.overflowY) || a === document.body) continue;
              const b = a.getBoundingClientRect();
              if (
                r.left < b.left - 0.5 ||
                r.right > b.right + 0.5 ||
                r.top < b.top - 0.5 ||
                r.bottom > b.bottom + 0.5
              ) {
                out.push(`clip: "${text.slice(0, 24)}" in <${a.tagName.toLowerCase()} class="${a.className}">`);
              }
            }
            // outside its own block's content box
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
            [".notes li", "b", "span", 12],
            [".parts li", "h3", "p", 12],
            [".am", "h3", "p", 12],
            [".svc", "h3", "p", 12],
            [".step", "h3", "p", 16],
            [".crow", "dt", "dd", 12],
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
        expect(found, `${path} at ${width}`).toEqual([]);
      }
      await context.close();
    });
  }
});

// SHOTS_DIR=<dir> SITES=subcort npx playwright test -c e2e --project subcort-desktop subcort.spec.ts -g shots
test("shots: every screen once per width", async ({ browser, baseURL }) => {
  const dir = process.env["SHOTS_DIR"];
  test.skip(!dir, "set SHOTS_DIR to take the screenshots");
  test.setTimeout(300_000);
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
      ["corturi", "/corturi/"],
      ["servicii", "/servicii/"],
      ["zona", "/zona/"],
      ["contact", "/contact/"],
      ["confidentialitate", "/confidentialitate/"],
      ["cookie-uri", "/cookie-uri/"],
      ["termeni", "/termeni/"],
    ] as const) {
      await ready(page, path);
      // let the lazily hydrated plan draw
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
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
  // the plan before it runs, and the picker with no script
  const nojs = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const np = await nojs.newPage();
  await np.goto("/corturi/");
  await np.screenshot({ path: join(dir!, "corturi-noscript-light-1280.png"), fullPage: true });
  await nojs.close();
});
