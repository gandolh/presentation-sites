import { expect, test } from "@playwright/test";
import { applyVariant, ROUTES, type Variant } from "./shapes.js";
import { open } from "./floor.js";

// Layout check for every route, the parish's seeds and the second parish's, and the 69-character name on Home, at
// the widths the board checked: 1280, 1024, 960, 768, 390 and 360. No page scrolls sideways, no control spills out
// of itself, and every line of text stays inside its card or cell and inside every ancestor that clips.
const widths = [1280, 1024, 960, 768, 390, 360];
const variants: Variant[] = ["parish", "seed2", "long"];

test.use({ hasTouch: false, isMobile: false });

test.describe("text stays in its column", () => {
  for (const { screen, path } of ROUTES) {
    for (const variant of variants) {
      if (variant === "long" && screen !== "home") continue;
      test(`${screen} ${variant}`, async ({ browser }) => {
        test.setTimeout(120_000);
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
        const page = await context.newPage();
        await open(page, path);
        for (const w of widths) {
          await page.setViewportSize({ width: w, height: 800 });
          await applyVariant(page, variant);
          const problems = await page.evaluate(() => {
            const out: string[] = [];
            const visible = (el: Element) =>
              el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
            const name = (el: Element) =>
              el.tagName.toLowerCase() + "." + String(el.getAttribute("class") ?? "").split(" ")[0];
            if (document.documentElement.scrollWidth > innerWidth) out.push("page scrolls sideways");
            // A box that draws itself: a border, or a fill with rounded corners (a card, a chip, a button, a callout).
            const boxed = (el: Element) => {
              const cs = getComputedStyle(el);
              const edge = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
              const fill = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderTopLeftRadius) > 0;
              return edge || fill;
            };
            const content = (el: Element) => {
              const b = el.getBoundingClientRect();
              const cs = getComputedStyle(el);
              return {
                l: b.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth),
                r: b.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth),
              };
            };
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
              const text = (n.textContent ?? "").trim();
              const el = n.parentElement;
              if (
                !text ||
                !el ||
                !visible(el) ||
                el.closest("script,style,.sr-only,textarea,iframe,[aria-hidden='true']")
              )
                continue;
              const range = document.createRange();
              range.selectNodeContents(n);
              const rects = [...range.getClientRects()].filter((r) => r.width > 0.5);
              if (!rects.length) continue;
              const left = Math.min(...rects.map((r) => r.left));
              const right = Math.max(...rects.map((r) => r.right));
              let nearest = true;
              for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) {
                if (nearest && boxed(a)) {
                  nearest = false;
                  const c = content(a);
                  if (left < c.l - 1 || right > c.r + 1)
                    out.push(
                      `text "${text.slice(0, 22)}" ${Math.round(left)}-${Math.round(right)} outside ${name(a)} ${Math.round(c.l)}-${Math.round(c.r)}`,
                    );
                }
                const cs = getComputedStyle(a);
                if (/hidden|clip/.test(cs.overflowX)) {
                  const b = a.getBoundingClientRect();
                  if (left < b.left - 1 || right > b.right + 1)
                    out.push(`text "${text.slice(0, 22)}" clipped by ${name(a)}`);
                }
              }
            }
            // A control that holds more than it shows.
            for (const el of document.querySelectorAll("a,button,label")) {
              if (!visible(el) || el.closest(".sr-only")) continue;
              if (
                el.scrollWidth > el.clientWidth + 1 &&
                el.clientWidth > 0 &&
                getComputedStyle(el).display !== "inline"
              )
                out.push(
                  `control ${name(el)} "${(el.textContent ?? "").trim().slice(0, 18)}" holds ${el.scrollWidth} in ${el.clientWidth}`,
                );
            }
            return [...new Set(out)].slice(0, 8);
          });
          expect(problems, `${screen} ${variant} at ${w}`).toEqual([]);
        }
        await context.close();
      });
    }
  }
});

// The first screen at the four sizes the board named: the name whole (never cut), the next service and its time
// above the fold on desktops, the bottom bar clear of the content on phones.
test.describe("Home's first screen", () => {
  for (const { w, h } of [
    { w: 1280, h: 800 },
    { w: 1366, h: 768 },
    { w: 390, h: 844 },
    { w: 360, h: 800 },
  ]) {
    for (const variant of variants) {
      test(`${w}x${h} ${variant}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await context.newPage();
        await open(page, "/");
        await applyVariant(page, variant);
        const r = await page.evaluate(() => {
          const h1 = document.querySelector("h1") as HTMLElement;
          const lh = parseFloat(getComputedStyle(h1).lineHeight);
          const range = document.createRange();
          range.selectNodeContents(h1);
          const last = [...range.getClientRects()].at(-1);
          const time = [...document.querySelectorAll("span")].find(
            (s) =>
              /^\d\d:\d\d$/.test(s.textContent ?? "") && getComputedStyle(s).fontSize === getComputedStyle(s).fontSize,
          );
          const timeBox = time?.getBoundingClientRect();
          return {
            lines: Math.round(h1.getBoundingClientRect().height / lh),
            clipped:
              h1.scrollWidth > h1.clientWidth + 1 ||
              getComputedStyle(h1).textOverflow === "ellipsis" ||
              getComputedStyle(h1).webkitLineClamp !== "none",
            h1Bottom: last ? Math.round(last.bottom) : 0,
            timeBottom: timeBox ? Math.round(timeBox.bottom) : 0,
          };
        });
        expect(r.clipped, "the name is cut").toBe(false);
        expect(r.h1Bottom, "the name sits above the fold").toBeLessThanOrEqual(h);
        if (w >= 960) expect(r.timeBottom, "the next service's time is above the fold").toBeLessThanOrEqual(h);
        console.log(`first screen ${w}x${h} ${variant}: name ${r.lines} lines, time bottom ${r.timeBottom}`);
        await context.close();
      });
    }
  }
});
