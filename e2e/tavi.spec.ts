import { expect, test, type Page } from "@playwright/test";
import { isPhone, siteOf } from "./floor.js";

// tavi's own checks: every header link lands on its chapter, the global Pause drives the page's play state, reduced
// motion starts paused, the hero's drawing ticks at the movement's rate only while the page plays, the first screen
// holds the hero and keeps the repair line off it, the contents band's links land and fold to two columns on a phone,
// the footer shows Tavi's line as a placeholder, nothing works only with scripting, and no request leaves the origin.
// The chapters' checks follow, then the 3D movement's on its fallback ladder (the hero and chapter 5). The Floor specs are shared (floor-*.spec.ts); the phone menu's behaviour is in mobile-menu.spec.ts.
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(siteOf(info) !== "tavi", "tavi's own spec");
});

const CHAPTERS = ["energy", "wheels", "escapement", "balance", "together", "bench", "repairs"];

/** The page with the Chapters menu's island hydrated where it hydrates (below 64rem). */
async function ready(page: Page, phone: boolean) {
  await page.goto("/");
  if (phone) {
    await page.waitForFunction(
      () =>
        document.querySelector('astro-island[component-url*="ChaptersMenu"]') !== null &&
        document.querySelector('astro-island[component-url*="ChaptersMenu"][ssr]') === null,
    );
  }
}

test.describe("the header's chapter links", () => {
  test("each one lands on the element with its id", async ({ page }, info) => {
    const phone = isPhone(info);
    await ready(page, phone);
    for (const id of CHAPTERS) {
      await expect(page.locator(`#${id}`), `#${id} exists`).toHaveCount(1);
      if (phone) {
        await page.getByRole("button", { name: "Chapters", exact: true }).click();
        const dialog = page.getByRole("dialog", { name: "Chapters" });
        await expect(dialog).toBeVisible();
        await dialog.locator(`a[href="#${id}"]`).click();
        await expect(dialog).toBeHidden();
      } else {
        await page.locator(`header nav a[href="#${id}"]`).click();
      }
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`), `#${id} is on screen`).toBeInViewport();
    }
  });

  test("the skip link goes to the first chapter, the wordmark back to the top", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to the first chapter" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#energy$/);
    await expect(page.locator("#energy")).toBeInViewport();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.locator("header").getByRole("link", { name: "Tavi Ceasornicaru, back to the top" }).click();
    await expect(page).toHaveURL(/#top$/);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  });
});

/** The header's Pause: one name whatever the page's play state. */
const globalPause = (page: Page) =>
  page.locator("header").getByRole("button", { name: "Pause every moving drawing", exact: true });

/** A colour token as the page computes it, read through a probe element's background. */
async function tokenColour(page: Page, token: string) {
  return page.evaluate((t) => {
    const probe = document.createElement("div");
    probe.style.background = `var(${t})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, token);
}

test.describe("the global Pause", () => {
  test("is a toggle: its name and its word never change, and aria-pressed follows the page's play state", async ({
    page,
  }, info) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-playing", "true");
    const pause = globalPause(page);
    await expect(pause).toBeVisible();
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    // Below 40rem the button shows its icon only; its name still says what it does.
    if (!isPhone(info)) await expect(pause).toHaveText("Pause", { useInnerText: true });

    await pause.click();
    await expect(html).toHaveAttribute("data-playing", "false");
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(pause).toHaveAttribute("aria-label", "Pause every moving drawing");
    if (!isPhone(info)) await expect(pause).toHaveText("Pause", { useInnerText: true });
    // Pressed, it wears the tray's pressed look (after the colour fade); no Play button appears anywhere.
    const soft = await tokenColour(page, "--color-accent-soft");
    const accent = await tokenColour(page, "--color-accent");
    await expect.poll(() => pause.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(soft);
    await expect.poll(() => pause.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(accent);
    await expect(page.getByRole("button", { name: /\bplay\b/i })).toHaveCount(0);

    await pause.click();
    await expect(html).toHaveAttribute("data-playing", "true");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await expect(pause).toHaveAttribute("aria-label", "Pause every moving drawing");
  });

  test("keeps its width when pressed, so the header's links stay put", async ({ page }, info) => {
    test.skip(isPhone(info), "the phone shows the icon only");
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const where = () =>
      page.evaluate(() => {
        const button = document.querySelector(".global-pause")?.getBoundingClientRect();
        const link = document.querySelector("header nav a")?.getBoundingClientRect();
        return [button?.x, button?.width, link?.x];
      });
    const playing = await where();
    await globalPause(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-playing", "false");
    expect(await where()).toEqual(playing);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the page loads paused with the Pause pressed, and releasing it plays", async ({ page }) => {
      await page.goto("/");
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-playing", "false");
      const pause = globalPause(page);
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      await pause.click();
      await expect(html).toHaveAttribute("data-playing", "true");
      await expect(pause).toHaveAttribute("aria-pressed", "false");
    });
  });
});

/** Each running animation on the hero drawing's turning groups: the group, the duration, the keyframes' timing. */
async function heroAnimations(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("#hero-movement .rot")].flatMap((group) =>
      group
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => ({
          group: [...group.classList].find((c) => c.startsWith("rot-")) ?? "?",
          duration: Number(a.effect?.getComputedTiming().duration),
          iterations: a.effect?.getComputedTiming().iterations,
          timing: getComputedStyle(group).animationTimingFunction,
        })),
    ),
  );
}

/** Whether the hero moves: its 3D view's clock runs on, or, where the drawing shows, its balance swings in CSS. */
async function heroRuns(page: Page) {
  const gl = await page.locator(".hero-stage .movement-figure").getAttribute("data-gl");
  if (gl !== "live") return (await heroAnimations(page)).some((a) => a.group === "rot-balance");
  const before = (await glStats(page, "hero")).t;
  await page.waitForTimeout(300);
  return (await glStats(page, "hero")).t > before;
}

/** Makes every canvas on the page find no WebGL, before the page's scripts run: the fallback ladder's third rung. */
async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    const none = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return /webgl/i.test(type) ? null : (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
    };
    HTMLCanvasElement.prototype.getContext = none as typeof get;
  });
}

// Where WebGL works, the 3D movement takes the drawing's place once the page is idle; these check the drawing itself,
// so they run where it stays.
test.describe("the hero's drawing", () => {
  test.beforeEach(async ({ page }) => {
    await withoutWebGL(page);
  });

  test("ticks: the balance swings in 166.67 ms, the escape wheel turns in 5 s in 30 steps", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero-movement")).toBeVisible();
    const running = await heroAnimations(page);
    const of = (group: string) => running.find((a) => a.group === group);
    const balance = of("rot-balance");
    expect(balance, "the balance swings").toBeDefined();
    expect(balance?.duration).toBeCloseTo(166.667, 2);
    expect(balance?.iterations).toBe(Infinity);
    const escape = of("rot-escape");
    expect(escape, "the escape wheel turns").toBeDefined();
    expect(escape?.duration).toBe(5000);
    expect(escape?.timing).toMatch(/^steps\(30(, (jump-)?start)?\)$/);
    for (const group of ["rot-pallet", "rot-fourth", "rot-third", "rot-centre"]) expect(of(group), group).toBeDefined();

    await globalPause(page).click();
    expect(await heroAnimations(page)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("nothing turns until releasing the Pause sets data-playing to true", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#hero-movement")).toBeVisible();
      await page.waitForTimeout(300);
      expect(await heroAnimations(page)).toEqual([]);
      await globalPause(page).click();
      await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
      await expect.poll(async () => (await heroAnimations(page)).map((a) => a.group)).toContain("rot-balance");
    });
  });
});

/** The visible text on the first screen that matches `pattern`, leaving out the header's chapter list. */
async function firstScreenText(page: Page, pattern: RegExp) {
  return page.evaluate(
    ({ source, flags }) => {
      const match = new RegExp(source, flags);
      const found: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        const text = node.textContent ?? "";
        // The header's chapter list names chapter 7, Repairs: it is the page's navigation, not the repair line.
        if (!parent || !match.test(text) || parent.closest("header nav") || !parent.checkVisibility()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        const onScreen = box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
        if (onScreen && box.right > 0 && box.left < innerWidth) found.push(text.trim());
      }
      return found;
    },
    { source: pattern.source, flags: pattern.flags },
  );
}

test.describe("the hero", () => {
  test("its button lands on the first chapter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Start with the mainspring" }).click();
    await expect(page).toHaveURL(/#energy$/);
    await expect(page.locator("#energy")).toBeInViewport();
  });

  test("the first screen holds the head, the lede, the button and the drawing", async ({ page }, info) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator(".hero");
    await expect(hero.getByRole("heading", { level: 1, name: /^Six beats\s*every second$/ })).toBeInViewport({
      ratio: 1,
    });
    await expect(hero.getByText("Tavi loves clocks and watches. Here is how one keeps time.")).toBeInViewport({
      ratio: 1,
    });
    await expect(hero.getByRole("link", { name: "Start with the mainspring" })).toBeInViewport({ ratio: 1 });
    const drawing = page.locator("#hero-movement");
    if (isPhone(info)) {
      // The top of the drawing shows, and its callouts stay at 14 px or more on screen.
      await expect(drawing).toBeInViewport();
      const sizes = await drawing
        .locator(".callout text")
        .evaluateAll((texts) =>
          texts.map(
            (t) => ((t as SVGGraphicsElement).getScreenCTM()?.a ?? 0) * parseFloat(getComputedStyle(t).fontSize),
          ),
        );
      expect(sizes).toHaveLength(4);
      for (const size of sizes) expect(size).toBeGreaterThanOrEqual(14);
    } else {
      await expect(drawing).toBeInViewport({ ratio: 1 });
      for (const callout of await drawing.locator(".callout text").all())
        await expect(callout).toBeInViewport({ ratio: 1 });
    }
  });

  test("no text on the first screen says repair; the repair line is a scroll away", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(await firstScreenText(page, /repair/i)).toEqual([]);
    await expect(page.locator("#repairs-head")).toHaveText("Tavi repairs wristwatches");
    await expect(page.locator("#repairs-head")).not.toBeInViewport();
  });
});

test.describe("the contents band", () => {
  const band = (page: Page) => page.getByRole("navigation", { name: "Chapters, with what each one shows" });

  test("its seven links land on their chapters, chapter 7 on the footer", async ({ page }) => {
    await page.goto("/");
    const links = band(page).getByRole("link");
    expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
      CHAPTERS.map((id) => `#${id}`),
    );
    for (const id of CHAPTERS) {
      await band(page).locator(`a[href="#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`), `#${id} is on screen`).toBeInViewport();
    }
    expect(await page.locator("#repairs").evaluate((el) => el.tagName)).toBe("FOOTER");
  });

  test("on a phone it is two columns and no taller than the screen", async ({ page }, info) => {
    test.skip(!isPhone(info), "the phone's layout");
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const lefts = await band(page)
      .locator("li")
      .evaluateAll((items) => [...new Set(items.map((li) => Math.round(li.getBoundingClientRect().left)))]);
    expect(lefts, "two column starts").toHaveLength(2);
    const box = await band(page).boundingBox();
    expect(box?.height ?? Infinity).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);
  });
});

test.describe("the footer", () => {
  test("holds the name, the repair line and Tavi's line as a dashed placeholder, and no contact line", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer#repairs");
    await expect(footer.getByRole("heading", { level: 2, name: "Tavi repairs wristwatches" })).toBeVisible();
    await expect(footer).toContainText("In Romanian, the name means Tavi the watchmaker.");
    await expect(footer).toContainText("Every part on this page is drawn, not photographed.");
    const slot = footer.locator('[data-fill="tavi-line"]');
    await expect(slot).toHaveText("[Tavi’s line, in his own words]");
    await expect(slot).toHaveCSS("border-top-style", "dashed");
    // No contact line of any kind, and no promise of one.
    await expect(page.locator('a[href^="mailto:"], a[href^="tel:"], form')).toHaveCount(0);
    await expect(footer).not.toContainText(/contact|e-?mail|phone|reach|write to/i);
  });

  test("its wordmark goes back to the top", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Tavi Ceasornicaru, back to the top" }).click();
    await expect(page).toHaveURL(/#top$/);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  });
});

// Chapter 1 on the chapter engine: the steps beside the sticky figure, the part names, the current-chapter mark and
// the figure's tray.
const POSES = [
  { step: "1", e: "0.55" },
  { step: "2", e: "0.55" },
  { step: "3", e: "0.2" },
  { step: "4", e: "0" },
];

/** Scrolls a step of chapter 1 onto the reading line (lib/chapters.ts): mid-screen in two columns, lower in one. */
async function readStep(page: Page, step: string, phone: boolean) {
  await page.evaluate(
    ({ step, line }) => {
      const el = document.querySelector(`#energy .step[data-step="${step}"]`);
      if (el) window.scrollBy(0, el.getBoundingClientRect().top - innerHeight * line);
    },
    { step, line: phone ? 0.7 : 0.47 },
  );
}

/** The page with chapter 1's tray in view and its island hydrated: from step 2 the figure is stuck whole on screen. */
async function trayReady(page: Page, phone: boolean) {
  await page.goto("/");
  await readStep(page, "2", phone);
  await page.waitForFunction(() => document.querySelector('astro-island[component-url*="EnergyTray"]:not([ssr])'));
}

/** An element's own `--slow`, as the stylesheet resolves it. */
async function slowOf(page: Page, selector: string) {
  return page.evaluate(
    (s) =>
      getComputedStyle(document.querySelector(s) ?? document.body)
        .getPropertyValue("--slow")
        .trim(),
    selector,
  );
}

/** Each running animation on chapter 1's figure, by its turning group, with its duration. */
async function figureAnimations(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("#energy-figure .rot")].flatMap((group) =>
      group
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => ({
          group: [...group.classList].find((c) => c.startsWith("rot-")) ?? "?",
          duration: Number(a.effect?.getComputedTiming().duration),
        })),
    ),
  );
}

test.describe("chapter 1, on the chapter engine", () => {
  test("scrolling activates each step in turn, and the figure's data-step and --e follow", async ({ page }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    const figure = page.locator("#energy-figure");
    const lifted = page.locator("#energy-movement .lift-bridge");
    const transforms: string[] = [];
    for (const { step, e } of POSES) {
      await readStep(page, step, phone);
      await expect(figure).toHaveAttribute("data-step", step);
      await expect(page.locator("#energy .step.is-active")).toHaveAttribute("data-step", step);
      expect(await figure.evaluate((el) => el.style.getPropertyValue("--e"))).toBe(e);
      // The drawing takes the figure's pose: the barrel bridge rises with --e.
      await expect
        .poll(() =>
          lifted.evaluate((el) =>
            getComputedStyle(el.parentElement ?? el)
              .getPropertyValue("--e")
              .trim(),
          ),
        )
        .toBe(e);
      await page.waitForTimeout(500);
      transforms.push(await lifted.evaluate((el) => getComputedStyle(el).transform));
    }
    expect(transforms[0]).not.toBe(transforms[3]);
    expect(transforms[2]).not.toBe(transforms[3]);
    expect(transforms[3]).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test("hovering or focusing a part name lights that part and ghosts every other", async ({ page }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    await readStep(page, "1", phone);
    const figure = page.locator("#energy-figure");
    const mainspring = page.locator("#energy").getByRole("button", { name: "mainspring", exact: true });
    // Computed colours, read the way the drawing's own are: through an element filled and stroked with each token.
    const colours = () =>
      page.evaluate(() => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        probe.style.fill = "var(--color-ghost-fill)";
        probe.style.stroke = "var(--color-part-spring)";
        svg.append(probe);
        document.body.append(svg);
        const cs = getComputedStyle(probe);
        const found = { ghost: cs.fill, spring: cs.stroke };
        svg.remove();
        const drawing = document.querySelector("#energy-movement");
        const others = [...(drawing?.querySelectorAll(".mv .fo, .mv .drum") ?? [])].filter(
          (el) => !el.closest('[data-part="mainspring"]'),
        );
        return {
          ...found,
          lit: getComputedStyle(drawing?.querySelector(".p-spring .spring-f") ?? document.body).stroke,
          unghosted: others.filter((el) => getComputedStyle(el).fill !== found.ghost).length,
          others: others.length,
        };
      });
    const check = async () => {
      await expect(figure).toHaveAttribute("data-focus", "mainspring");
      const c = await colours();
      expect(c.others).toBeGreaterThan(30);
      expect(c.unghosted, "parts the prose doesn't name, left in colour").toBe(0);
      expect(c.lit).toBe(c.spring);
    };

    if (!phone) {
      await mainspring.hover();
      await check();
      await page.mouse.move(2, 2);
      await expect(figure).not.toHaveAttribute("data-focus");
    }
    await mainspring.focus();
    await check();
    await mainspring.blur();
    await expect(figure).not.toHaveAttribute("data-focus");

    // A part named in another step lights alone too, not the whole drawing ghosted.
    await page.locator("#energy").getByRole("button", { name: "crown", exact: true }).focus();
    await expect(figure).toHaveAttribute("data-focus", "crown");
    expect(
      await page.evaluate(() => {
        const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        probe.style.fill = "var(--color-ghost-fill)";
        document.querySelector("#energy-movement")?.append(probe);
        const ghost = getComputedStyle(probe).fill;
        probe.remove();
        return (
          getComputedStyle(document.querySelector('#energy-movement [data-part="crown"] .fo') ?? document.body).fill !==
          ghost
        );
      }),
      "the crown stays in colour",
    ).toBe(true);
  });

  test('"1 Energy" is current in the header and the band only while chapter 1 holds the reading line', async ({
    page,
  }) => {
    await page.goto("/");
    const marked = page.locator('[aria-current="true"]');
    const energy = page.locator('.chapters a[href="#energy"], .contents-band a[href="#energy"]');
    // In the hero nothing is marked.
    await page.waitForTimeout(300);
    await expect(marked).toHaveCount(0);

    await page.evaluate(() => document.querySelector('#energy .step[data-step="2"]')?.scrollIntoView());
    await expect(energy.nth(0)).toHaveAttribute("aria-current", "true");
    await expect(energy.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(marked).toHaveCount(2);

    // Past the chapter's end, it is no longer current.
    await page.evaluate(() => {
      const end = document.querySelector("#energy")?.getBoundingClientRect().bottom ?? 0;
      window.scrollBy(0, end - innerHeight * 0.3);
    });
    await expect(energy.nth(0)).not.toHaveAttribute("aria-current");
    await expect(energy.nth(1)).not.toHaveAttribute("aria-current");

    // Back up in the hero, nothing.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect(marked).toHaveCount(0);
  });

  test("the tray's Pause and the header's stay in step both ways", async ({ page }, info) => {
    await trayReady(page, isPhone(info));
    const html = page.locator("html");
    const pause = page.locator("#energy-figure").getByRole("button", { name: "Pause", exact: true });
    await expect(pause).toHaveAttribute("aria-pressed", "false");

    await pause.click();
    await expect(html).toHaveAttribute("data-playing", "false");
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(globalPause(page)).toHaveAttribute("aria-pressed", "true");
    expect(await figureAnimations(page)).toEqual([]);

    await globalPause(page).click();
    await expect(html).toHaveAttribute("data-playing", "true");
    await expect(pause).toHaveAttribute("aria-pressed", "false");

    await globalPause(page).click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await pause.click();
    await expect(html).toHaveAttribute("data-playing", "true");
    await expect(globalPause(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("Speed 1/10 makes the figure's animations ten times longer, and 1/100 a hundred", async ({ page }, info) => {
    await trayReady(page, isPhone(info));
    const speed = page.locator("#energy-figure").getByRole("radiogroup", { name: "Speed" });
    await expect(speed.getByRole("radio", { name: "1×", exact: true })).toBeChecked();
    const at1 = await figureAnimations(page);
    expect(at1.find((a) => a.group === "rot-balance")?.duration).toBeCloseTo(166.667, 2);

    for (const [name, factor] of [
      ["1/10", 10],
      ["1/100", 100],
    ] as const) {
      await speed.getByRole("radio", { name, exact: true }).click();
      await expect(speed.getByRole("radio", { name, exact: true })).toBeChecked();
      expect(await slowOf(page, "#energy-figure")).toBe(String(factor));
      const slowed = await figureAnimations(page);
      expect(slowed.map((a) => a.group)).toEqual(at1.map((a) => a.group));
      for (const [i, a] of slowed.entries()) expect(a.duration).toBeCloseTo((at1[i]?.duration ?? NaN) * factor, 1);
    }
    // The hero keeps its own speed.
    expect(await slowOf(page, ".hero-stage")).toBe("1");
  });

  test("Tab reaches every control, and the arrow keys move the speed", async ({ page }, info) => {
    await trayReady(page, isPhone(info));
    const chapter = page.locator("#energy");
    const names = ["mainspring", "barrel", "crown", "ratchet wheel", "arbor", "click", "centre wheel"];
    await chapter.getByRole("button", { name: "mainspring", exact: true }).focus();
    for (const name of names.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(chapter.getByRole("button", { name, exact: true })).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(chapter.getByRole("button", { name: "Pause", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    const one = chapter.getByRole("radio", { name: "1×", exact: true });
    await expect(one).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(chapter.getByRole("radio", { name: "1/10", exact: true })).toBeChecked();
    await expect(chapter.getByRole("radio", { name: "1/10", exact: true })).toBeFocused();
    expect(await slowOf(page, "#energy-figure")).toBe("10");
    await page.keyboard.press("ArrowLeft");
    await expect(one).toBeChecked();
    expect(await slowOf(page, "#energy-figure")).toBe("1");
    for (const name of ["Wind", "Take apart"]) {
      await page.keyboard.press("Tab");
      await expect(chapter.getByRole("slider", { name, exact: true })).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(chapter.getByRole("link", { name: "Back to Contents" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(chapter.getByRole("link", { name: "Next chapter 2. Wheels, hours into seconds" })).toBeFocused();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the figure starts still, Play runs it, and a new step's pose jumps", async ({ page }, info) => {
      const phone = isPhone(info);
      await trayReady(page, phone);
      await page.waitForTimeout(300);
      expect(await figureAnimations(page)).toEqual([]);
      const pause = page.locator("#energy-figure").getByRole("button", { name: "Pause", exact: true });
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      await pause.click();
      await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
      await expect.poll(async () => (await figureAnimations(page)).map((a) => a.group)).toContain("rot-balance");

      const lifted = page.locator("#energy-movement .lift-bridge");
      await expect(lifted).toHaveCSS("transition-duration", "0s");
      await readStep(page, "4", phone);
      await expect(page.locator("#energy-figure")).toHaveAttribute("data-step", "4");
      // No transition: the bridge is down at once.
      expect(await lifted.evaluate((el) => getComputedStyle(el).transform)).toMatch(
        /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
      );
    });
  });
});

// Chapter 1's own controls in its tray: Wind coils the mainspring, Take apart lifts the barrel's parts off.
/** The figure's lift groups: each one's --lift and its translate now, in the drawing's units. */
async function lifts(page: Page) {
  return page.locator("#energy-movement .lift").evaluateAll((groups) =>
    groups.map((g) => {
      const m = new DOMMatrix(getComputedStyle(g).transform === "none" ? undefined : getComputedStyle(g).transform);
      return {
        name: [...g.classList].find((c) => c.startsWith("lift-")) ?? "?",
        lift: Number(getComputedStyle(g).getPropertyValue("--lift")),
        x: m.e,
        y: m.f,
      };
    }),
  );
}

test.describe("chapter 1's Wind and Take apart", () => {
  const sliders = (page: Page) => {
    const tray = page.locator("#energy-figure");
    return {
      wind: tray.getByRole("slider", { name: "Wind", exact: true }),
      apart: tray.getByRole("slider", { name: "Take apart", exact: true }),
      readouts: tray.locator("output"),
    };
  };
  const springPathNow = (page: Page) =>
    page.locator("#energy-movement .p-spring .spring-f").evaluate((path) => path.getAttribute("d") ?? "");

  test("Wind at 0 and at 100 draws two springs, two readouts and two spoken values", async ({ page }, info) => {
    await trayReady(page, isPhone(info));
    const { wind, readouts } = sliders(page);
    // It opens where the drawing is built: 62, a quarter of a day left.
    await expect(wind).toHaveValue("62");
    await expect(readouts.nth(0)).toHaveText("25 of 41 h");
    await expect(wind).toHaveAttribute("aria-valuetext", "Wound to 25 of 41 hours");
    expect(await readouts.nth(0).evaluate((o) => getComputedStyle(o).fontFamily)).toMatch(/IBM Plex Mono/);
    const built = await springPathNow(page);

    await wind.focus();
    await page.keyboard.press("Home");
    await expect(readouts.nth(0)).toHaveText("0 of 41 h");
    await expect(wind).toHaveAttribute("aria-valuetext", "Wound to 0 of 41 hours");
    const letDown = await springPathNow(page);
    const arborDown = await page.locator("#energy-movement .rot-arbor").evaluate((g) => getComputedStyle(g).transform);

    await page.keyboard.press("End");
    await expect(readouts.nth(0)).toHaveText("41 of 41 h");
    await expect(wind).toHaveAttribute("aria-valuetext", "Wound to 41 of 41 hours");
    const wound = await springPathNow(page);
    const arborUp = await page.locator("#energy-movement .rot-arbor").evaluate((g) => getComputedStyle(g).transform);

    expect(letDown).not.toBe(wound);
    expect(letDown).not.toBe(built);
    expect(wound).not.toBe(built);
    // Both outlines of the spring are redrawn together.
    expect(await page.locator("#energy-movement .p-spring .spring-o").getAttribute("d")).toBe(wound);
    // The arbor turns with the spring: still at 0, a turn of 4.1 radians at 100.
    expect(arborDown).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    expect(arborUp).not.toBe(arborDown);
  });

  test("Take apart at 100 lifts each part along its axis, and each step re-poses it", async ({ page }, info) => {
    const phone = isPhone(info);
    await trayReady(page, phone);
    const { apart, readouts } = sliders(page);
    await expect(apart).toHaveValue("55");
    await expect(readouts.nth(1)).toHaveText("55%");

    await apart.focus();
    await page.keyboard.press("End");
    await expect(readouts.nth(1)).toHaveText("100%");
    expect(await page.locator("#energy-figure").evaluate((el) => el.style.getPropertyValue("--e"))).toBe("1");
    // Every lift group ends up its full lift along the one oblique axis: up and to the right, 30 degrees off vertical.
    await expect
      .poll(async () => (await lifts(page)).map((l) => [Math.round(l.x * 10) / 10, Math.round(l.y * 10) / 10]))
      .toEqual(
        (await lifts(page)).map((l) => [Math.round(l.lift * 0.5 * 10) / 10, Math.round(-l.lift * 0.866 * 10) / 10]),
      );
    expect((await lifts(page)).map((l) => l.name)).toEqual([
      "lift-bridge",
      "lift-ratchet",
      "lift-crownwheel",
      "lift-click",
    ]);
    await expect(page.locator("#energy-movement .axes")).toHaveCSS("opacity", "1");

    // Back to 0: everything down, the dashed axes gone.
    await page.keyboard.press("Home");
    await expect(page.locator("#energy-movement .axes")).toHaveCSS("opacity", "0");
    await expect.poll(async () => (await lifts(page)).every((l) => Math.abs(l.x) + Math.abs(l.y) < 0.01)).toBe(true);

    // The visitor's setting holds until the next step arrives, which takes the figure to its own pose.
    await readStep(page, "3", phone);
    await expect(page.locator("#energy-figure")).toHaveAttribute("data-step", "3");
    await expect(apart).toHaveValue("20");
    await expect(readouts.nth(1)).toHaveText("20%");
  });

  test("both sliders answer the arrows, Page Up and Page Down, Home and End", async ({ page }, info) => {
    await trayReady(page, isPhone(info));
    const { wind, apart } = sliders(page);
    for (const [slider, start] of [
      [wind, 62],
      [apart, 55],
    ] as const) {
      await slider.focus();
      await expect(slider).toHaveValue(String(start));
      for (const [key, value] of [
        ["ArrowRight", start + 1],
        ["ArrowUp", start + 2],
        ["ArrowLeft", start + 1],
        ["ArrowDown", start],
        ["PageUp", start + 10],
        ["PageDown", start],
        ["Home", 0],
        ["End", 100],
      ] as const) {
        await page.keyboard.press(key);
        await expect(slider, `${key}`).toHaveValue(String(value));
      }
    }
    // Take apart's value is the figure's --e.
    expect(await page.locator("#energy-figure").evaluate((el) => el.style.getPropertyValue("--e"))).toBe("1");
  });

  test("a hint under steps 1 and 2 names the control, at 15 px or more", async ({ page }) => {
    await page.goto("/");
    const hints = page.locator("#energy .try");
    await expect(hints).toHaveText(["Slide Take apart to see inside.", "Drag Wind to coil it."], {
      useInnerText: true,
    });
    for (const hint of await hints.all()) {
      await expect(hint).toBeVisible();
      expect(parseFloat(await hint.evaluate((el) => getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
    }
    await expect(page.locator('#energy .step[data-step="1"] .try')).toHaveCount(1);
    await expect(page.locator('#energy .step[data-step="2"] .try')).toHaveCount(1);
  });

  test("on a phone the tray is two rows with nothing wrapped, and the drawing keeps 30% of the screen", async ({
    page,
  }, info) => {
    test.skip(!isPhone(info), "the phone's tray");
    await trayReady(page, true);
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.evaluate(() => {
      const tray = document.querySelector("#energy-figure .tray");
      const top = (el: Element | null | undefined) => Math.round(el?.getBoundingClientRect().top ?? NaN);
      const sliders = [...(tray?.querySelectorAll('input[type="range"]') ?? [])].map((input) =>
        top(input.closest("[data-orientation]")),
      );
      const leaves = [...(tray?.querySelectorAll("*") ?? [])].filter(
        (el) => el.childElementCount === 0 && (el.textContent ?? "").trim() !== "" && el.checkVisibility(),
      );
      const wrapped = leaves
        .filter((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getClientRects().length > 1;
        })
        .map((el) => el.textContent);
      return { first: top(tray?.querySelector(".tray-row")), sliders, wrapped };
    });
    expect(rows.wrapped).toEqual([]);
    expect(rows.sliders).toHaveLength(2);
    expect(rows.sliders[0], "Wind and Take apart share a row").toBe(rows.sliders[1]);
    expect(rows.sliders[0] ?? 0, "under the Pause and the Speed").toBeGreaterThan(rows.first);
    const viewport = page.viewportSize()?.height ?? 0;
    const drawing = await page.locator("#energy-movement").boundingBox();
    expect(drawing?.height ?? 0).toBeGreaterThanOrEqual(viewport * 0.3 - 1);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("Take apart jumps: the parts are at their full lift at once", async ({ page }, info) => {
      await trayReady(page, isPhone(info));
      await expect(page.locator("#energy-movement .lift-ratchet")).toHaveCSS("transition-duration", "0s");
      await sliders(page).apart.focus();
      await page.keyboard.press("End");
      await expect(sliders(page).apart).toHaveValue("100");
      const now = await lifts(page);
      for (const l of now) {
        expect(l.x, l.name).toBeCloseTo(l.lift * 0.5, 1);
        expect(l.y, l.name).toBeCloseTo(-l.lift * 0.866, 1);
      }
    });
  });
});

// Chapter 2: the train's meshes one step at a time on the back, then the figure turned over to the dial side.
const WHEELS = ["barrel", "centre", "third", "fourth", "escape"];
const WHEEL_STEPS = [
  { step: "1", lit: ["barrel", "centre"], ratio: "72 / 12" },
  { step: "2", lit: ["centre", "third"], ratio: "80 / 10" },
  { step: "3", lit: ["third", "fourth"], ratio: "75 / 10" },
  { step: "4", lit: ["fourth", "escape"], ratio: "84 / 7" },
];

/** Scrolls a step of a chapter onto the reading line: mid-screen in two columns, lower in one. */
async function readStepOf(page: Page, chapter: string, step: string, phone: boolean) {
  await page.evaluate(
    ({ chapter, step, line }) => {
      const el = document.querySelector(`#${chapter} .step[data-step="${step}"]`);
      if (el) window.scrollBy(0, el.getBoundingClientRect().top - innerHeight * line);
    },
    { chapter, step, line: phone ? 0.7 : 0.47 },
  );
}

/** The page with chapter 2's tray hydrated, the figure stuck whole on screen. */
async function wheelsTrayReady(page: Page, phone: boolean) {
  await page.goto("/");
  await readStepOf(page, "wheels", "2", phone);
  await page.waitForFunction(() =>
    document.querySelector('#wheels-figure astro-island[component-url*="FigureTray"]:not([ssr])'),
  );
}

/** Which of the train's wheels are in colour (their first shape's fill isn't the ghost token's), and each ratio's
 * colour and font. */
async function trainColours(page: Page) {
  return page.evaluate((wheels) => {
    const drawing = document.querySelector("#wheels-train");
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    probe.style.fill = "var(--color-ghost-fill)";
    probe.style.stroke = "var(--color-ink)";
    drawing?.append(probe);
    const ghost = getComputedStyle(probe).fill;
    const ink = getComputedStyle(probe).stroke;
    probe.remove();
    const lit = wheels.filter(
      (w) => getComputedStyle(drawing?.querySelector(`[data-part="${w}"] .fo`) ?? document.body).fill !== ghost,
    );
    const ratios = [...(drawing?.querySelectorAll(".ratio text") ?? [])].map((t) => ({
      text: t.textContent,
      ink: getComputedStyle(t).fill === ink,
      font: getComputedStyle(t).fontFamily,
    }));
    const others = [...(drawing?.querySelectorAll('.mv [data-part="plate"] .fo, .mv [data-part="balance"] .fo') ?? [])];
    return { lit, ratios, othersGhosted: others.every((el) => getComputedStyle(el).fill === ghost) };
  }, WHEELS);
}

/** The faces' state: which is shown, and each one's transform and opacity. */
async function faces(page: Page) {
  return page.evaluate(() => {
    const face = (id: string) => {
      const cs = getComputedStyle(document.querySelector(id) ?? document.body);
      return { visibility: cs.visibility, transform: cs.transform, opacity: cs.opacity };
    };
    return { train: face("#wheels-train"), dial: face("#wheels-dial") };
  });
}

/** A hand's angle on the dial, in degrees from twelve: the turn it is drawn at plus its running animation's. */
async function handAngle(page: Page, hand: string) {
  return page.evaluate((h) => {
    const inner = document.querySelector(`#wheels-dial .rot-hand-${h}`);
    const drawn = Number(/rotate\(([-\d.]+)\)/.exec(inner?.parentElement?.getAttribute("transform") ?? "")?.[1]);
    const t = getComputedStyle(inner ?? document.body).transform;
    const m = new DOMMatrix(t === "none" ? undefined : t);
    return drawn + (Math.atan2(m.b, m.a) * 180) / Math.PI;
  }, hand);
}

test.describe("chapter 2, the wheels and the dial", () => {
  test("the five steps re-pose the figure in turn: each mesh's wheels and ratio, then the dial side", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    const figure = page.locator("#wheels-figure");
    for (const { step, lit, ratio } of WHEEL_STEPS) {
      await readStepOf(page, "wheels", step, phone);
      await expect(figure).toHaveAttribute("data-step", step);
      await expect(page.locator("#wheels .step.is-active")).toHaveAttribute("data-step", step);
      await expect.poll(async () => (await trainColours(page)).lit, `step ${step}'s wheels`).toEqual(lit);
      const colours = await trainColours(page);
      expect(colours.othersGhosted, "the plate and the balance are ghosted").toBe(true);
      expect(colours.ratios.filter((r) => r.ink).map((r) => r.text)).toEqual([ratio]);
      await expect.poll(async () => (await faces(page)).train.visibility).toBe("visible");
      expect((await faces(page)).dial.visibility).toBe("hidden");
    }
    await expect(page.locator('.contents-band a[href="#wheels"]')).toHaveAttribute("aria-current", "true");

    await readStepOf(page, "wheels", "5", phone);
    await expect(figure).toHaveAttribute("data-step", "5");
    await expect.poll(async () => (await faces(page)).train.visibility).toBe("hidden");
    const shown = await faces(page);
    expect(shown.dial).toEqual({ visibility: "visible", transform: "none", opacity: "1" });
    await expect(page.getByRole("img", { name: /^Diagram of the dial side/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /^Diagram of the going train/ })).toBeHidden();
  });

  test("the ratios read in Plex Mono beside their meshes", async ({ page }, info) => {
    await page.goto("/");
    await readStepOf(page, "wheels", "1", isPhone(info));
    const { ratios } = await trainColours(page);
    expect(ratios.map((r) => r.text)).toEqual(["72 / 12", "80 / 10", "75 / 10", "84 / 7"]);
    for (const r of ratios) expect(r.font).toMatch(/IBM Plex Mono/);
    // Each ratio's dot is on the pinion the wheel drives: the centre's, the third's, the fourth's, the escape wheel's.
    const onPinions = await page.evaluate(() =>
      [...document.querySelectorAll("#wheels-train .ratio")].map((ratio, i) => {
        const driven = ["centre", "third", "fourth", "escape"][i];
        const dot = ratio.querySelector(".dot")?.getBoundingClientRect();
        const pinion = document.querySelector(`#wheels-train [data-part="${driven}"] .pin`)?.getBoundingClientRect();
        if (!dot || !pinion) return false;
        const [x, y] = [dot.x + dot.width / 2, dot.y + dot.height / 2];
        return x >= pinion.left - 2 && x <= pinion.right + 2 && y >= pinion.top - 2 && y <= pinion.bottom + 2;
      }),
    );
    expect(onPinions).toEqual([true, true, true, true]);
    // Legible on a phone too: at least 13 px tall on screen.
    const heights = await page
      .locator("#wheels-train .ratio text")
      .evaluateAll((texts) =>
        (texts as SVGTextElement[]).map(
          (t) => parseFloat(getComputedStyle(t).fontSize) * (t.getBoundingClientRect().height / t.getBBox().height),
        ),
      );
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(13);
  });

  test("a part name lights its wheel and ghosts the others; a hand named while the back shows lights nothing", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    await readStepOf(page, "wheels", "2", phone);
    const chapter = page.locator("#wheels");
    const figure = page.locator("#wheels-figure");
    const third = chapter.getByRole("button", { name: "third wheel", exact: true });
    if (!phone) {
      await third.hover();
      await expect(figure).toHaveAttribute("data-focus", "third");
      expect((await trainColours(page)).lit).toEqual(["third"]);
      await page.mouse.move(2, 2);
      await expect(figure).not.toHaveAttribute("data-focus");
    }
    // Focused where they are, without scrolling, so step 2 stays on the reading line.
    const focus = (name: string) =>
      chapter.getByRole("button", { name, exact: true }).evaluate((el) => {
        (el as HTMLElement).focus({ preventScroll: true });
      });
    await focus("escape wheel");
    await expect(figure).toHaveAttribute("data-focus", "escape");
    expect((await trainColours(page)).lit).toEqual(["escape"]);
    // Every ratio steps back while a single wheel is lit.
    expect((await trainColours(page)).ratios.filter((r) => r.ink)).toEqual([]);

    // The minute hand is on the dial side, turned away during step 2: naming it changes nothing.
    await focus("minute hand");
    await expect(figure).not.toHaveAttribute("data-focus");
    expect((await trainColours(page)).lit).toEqual(["centre", "third"]);
  });

  test("step 5: the small seconds sits over the fourth wheel, and naming a hand lights it", async ({ page }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    await readStepOf(page, "wheels", "4", phone);
    await expect(page.locator("#wheels-figure")).toHaveAttribute("data-step", "4");
    await expect.poll(async () => (await faces(page)).train.transform).toBe("none");
    const centreOf = (selector: string) =>
      page.evaluate((s) => {
        const r = document.querySelector(s)?.getBoundingClientRect();
        return r ? [r.x + r.width / 2, r.y + r.height / 2] : [NaN, NaN];
      }, selector);
    const box = await page.locator("#wheels-train").boundingBox();
    const fourth = await centreOf('#wheels-train [data-part="fourth"] .rot');

    await readStepOf(page, "wheels", "5", phone);
    await expect.poll(async () => (await faces(page)).dial.transform).toBe("none");
    const small = await centreOf("#wheels-dial .subdial circle");
    // The same place seen in the mirror: across the figure's middle, at the same height.
    expect(Math.abs((small[0] ?? 0) - (2 * ((box?.x ?? 0) + (box?.width ?? 0) / 2) - (fourth[0] ?? 0)))).toBeLessThan(
      2,
    );
    expect(Math.abs((small[1] ?? 0) - (fourth[1] ?? 0))).toBeLessThan(2);

    const chapter = page.locator("#wheels");
    await chapter.getByRole("button", { name: "small seconds", exact: true }).focus();
    await expect(page.locator("#wheels-figure")).toHaveAttribute("data-focus", "seconds-hand");
    const lit = await page.evaluate(() => {
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      probe.style.fill = "var(--color-ghost-fill)";
      document.querySelector("#wheels-dial")?.append(probe);
      const ghost = getComputedStyle(probe).fill;
      probe.remove();
      const fill = (s: string) => getComputedStyle(document.querySelector(s) ?? document.body).fill;
      return {
        seconds: fill("#wheels-dial .rot-hand-seconds .hf") !== ghost,
        subdial: fill("#wheels-dial .subdial .fo") !== ghost,
        minute: fill("#wheels-dial .rot-hand-minute .hf") !== ghost,
        index: fill("#wheels-dial .index .fo") !== ghost,
      };
    });
    expect(lit).toEqual({ seconds: true, subdial: true, minute: false, index: false });
    // The fourth wheel is on the back, turned away now: naming it changes nothing.
    await chapter.getByRole("button", { name: "fourth wheel", exact: true }).evaluate((el) => {
      (el as HTMLElement).focus({ preventScroll: true });
    });
    await expect(page.locator("#wheels-figure")).toHaveAttribute("data-step", "5");
    await expect(page.locator("#wheels-figure")).not.toHaveAttribute("data-focus");
  });

  test("a focused name follows the turn-over: a hand lights once the dial turns in, and goes out as it turns away", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    const figure = page.locator("#wheels-figure");
    const focus = (name: string) =>
      page
        .locator("#wheels")
        .getByRole("button", { name, exact: true })
        .evaluate((el) => {
          (el as HTMLElement).focus({ preventScroll: true });
        });
    await readStepOf(page, "wheels", "4", phone);
    await expect(figure).toHaveAttribute("data-step", "4");
    await focus("hour hand");
    await expect(figure).not.toHaveAttribute("data-focus");
    await readStepOf(page, "wheels", "5", phone);
    await expect(figure).toHaveAttribute("data-step", "5");
    await expect(figure).toHaveAttribute("data-focus", "hour-hand");

    await focus("small seconds");
    await expect(figure).toHaveAttribute("data-focus", "seconds-hand");
    await readStepOf(page, "wheels", "4", phone);
    await expect(figure).not.toHaveAttribute("data-step", "5");
    await expect(figure).not.toHaveAttribute("data-focus");
    // The back is in its step's colours again, not all ghost.
    await expect.poll(async () => (await trainColours(page)).lit.length).toBeGreaterThan(0);
  });

  test("the hands stand at 10:10:30 when still; at 1/10 the seconds hand jumps once every 10/6 s", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await wheelsTrayReady(page, phone);
    await readStepOf(page, "wheels", "5", phone);
    await expect(page.locator("#wheels-figure")).toHaveAttribute("data-step", "5");
    const tray = page.locator("#wheels-figure");
    await tray.getByRole("radio", { name: "1/10", exact: true }).click();
    await expect(tray.getByRole("radio", { name: "1/10", exact: true })).toBeChecked();
    // Running at 1/10: a turn in 600 s, in 360 jumps, so one every 1,666.7 ms.
    const timing = await page.evaluate(() => {
      const [animation] = document.querySelector("#wheels-dial .rot-hand-seconds")?.getAnimations() ?? [];
      const t = animation?.effect?.getComputedTiming();
      const hand = document.querySelector("#wheels-dial .rot-hand-seconds") ?? document.body;
      return { duration: Number(t?.duration), easing: getComputedStyle(hand).animationTimingFunction };
    });
    expect(timing.duration).toBeCloseTo(600_000, 0);
    expect(timing.easing).toMatch(/^steps\(360(, (jump-)?start)\)$/);
    // Read at moments either side of each jump: 1, 1, 2, 2, 3 degrees past 30 s.
    const at = async (ms: number) => {
      await page.evaluate((time) => {
        const [animation] = document.querySelector("#wheels-dial .rot-hand-seconds")?.getAnimations() ?? [];
        if (animation) {
          animation.pause();
          animation.currentTime = time;
        }
      }, ms);
      return Math.round((await handAngle(page, "seconds")) * 1000) / 1000;
    };
    expect([await at(0), await at(1600), await at(1700), await at(3300), await at(3400)]).toEqual([
      181, 181, 182, 182, 183,
    ]);
    await page.evaluate(() => {
      for (const a of document.querySelector("#wheels-dial .rot-hand-seconds")?.getAnimations() ?? []) a.play();
    });
    await page.waitForTimeout(1900);

    // Paused, the figure stands on its still frame: every hand on a whole degree, at 10:10:30.
    await tray.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-playing", "false");
    const still = {
      seconds: await handAngle(page, "seconds"),
      minute: await handAngle(page, "minute"),
      hour: await handAngle(page, "hour"),
    };
    expect(Number.isInteger(Math.round(still.seconds * 1e6) / 1e6)).toBe(true);
    expect(still).toEqual({ seconds: 180, minute: 63, hour: 305.25 });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the figure is still until its Pause is released, and the turn-over is a cross-fade", async ({
      page,
    }, info) => {
      const phone = isPhone(info);
      await wheelsTrayReady(page, phone);
      await readStepOf(page, "wheels", "5", phone);
      await expect(page.locator("#wheels-figure")).toHaveAttribute("data-step", "5");
      const running = () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll("#wheels-figure .rot")].flatMap((g) =>
              g.getAnimations().filter((a) => a.playState === "running"),
            ).length,
        );
      await page.waitForTimeout(300);
      expect(await running()).toBe(0);
      // Nothing turns: one face fades out as the other fades in.
      const shown = await faces(page);
      expect(shown.train.transform).toBe("none");
      expect(shown.dial.transform).toBe("none");
      await expect.poll(async () => (await faces(page)).train.opacity).toBe("0");
      expect((await faces(page)).dial.opacity).toBe("1");
      await expect(page.locator("#wheels-dial")).toHaveCSS("transition-property", /opacity/);
      // A name focused while its face is faded out lights its part once it has faded in.
      await page
        .locator("#wheels")
        .getByRole("button", { name: "fourth wheel", exact: true })
        .evaluate((el) => {
          (el as HTMLElement).focus({ preventScroll: true });
        });
      await expect(page.locator("#wheels-figure")).not.toHaveAttribute("data-focus");
      await readStepOf(page, "wheels", "3", phone);
      await expect(page.locator("#wheels-figure")).toHaveAttribute("data-focus", "fourth");
      await readStepOf(page, "wheels", "5", phone);
      await expect(page.locator("#wheels-figure")).toHaveAttribute("data-step", "5");

      const pause = page.locator("#wheels-figure").getByRole("button", { name: "Pause", exact: true });
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      await pause.click();
      await expect.poll(running).toBeGreaterThan(0);
    });
  });
});

// Chapters 3 and 4 are drawn by the clock, not by CSS: a frame loop per figure (lib/clockFigure.ts) writes each turning
// group's rotation and the hairspring's path from stateAt(t). Chapter 3's steps hold the figure on one phase of a beat.
const BEAT = 1 / 6;
/** Half the lift window, in beats: the balance within 25 degrees of rest, of a swing of 200. */
const HALF_WINDOW = Math.asin(25 / 200) / Math.PI;
/** The time at a share of the lift window in beat `beat`, as the part table's clock reckons it. */
const inWindow = (share: number, beat: number) => (beat + 0.5 - HALF_WINDOW + share * 2 * HALF_WINDOW) * BEAT;

/** Poses a figure through the dev hook, as stills and tests do: it holds the figure at `t`. */
async function poseFigure(page: Page, figure: string, t: number) {
  await page.evaluate(
    ({ figure, t }) => {
      (window as unknown as { taviPose: (id: string, pose: { t: number }) => unknown }).taviPose(figure, { t });
    },
    { figure, t },
  );
}

/** A turning group's rotation as the loop last drew it, in degrees: the first group under that name in a drawing. */
async function drawn(page: Page, drawing: string, name: string) {
  return page.evaluate(
    ({ drawing, name }) =>
      Number(
        /rotate\(([-\d.e]+)\)/.exec(
          document.querySelector(`#${drawing} [data-clock="${name}"]`)?.getAttribute("transform") ?? "",
        )?.[1],
      ),
    { drawing, name },
  );
}

/**
 * Scrolls back up to a step as a visitor does. readStepOf puts a step's top on the reading line, which leaves the foot
 * of the step above it there too, so a jump straight back would never bring that step in again: the page first goes
 * past it, then comes back to it.
 */
async function backToStep(page: Page, chapter: string, step: string, phone: boolean) {
  await page.evaluate(
    ({ chapter, step }) => {
      const el = document.querySelector(`#${chapter} .step[data-step="${step}"]`);
      if (el) window.scrollBy(0, el.getBoundingClientRect().bottom - innerHeight * 0.3);
    },
    { chapter, step },
  );
  await page.waitForTimeout(150);
  await readStepOf(page, chapter, step, phone);
}

/** The page with a chapter's tray island hydrated (from step 2 its figure is stuck whole on screen), then at `step`. */
async function clockTrayReady(page: Page, chapter: string, phone: boolean, step = "2") {
  await page.goto("/");
  await readStepOf(page, chapter, "2", phone);
  await page.waitForFunction(
    (c) => document.querySelector(`#${c}-figure astro-island[component-url*="FigureTray"]:not([ssr])`),
    chapter,
  );
  if (step !== "2") await backToStep(page, chapter, step, phone);
  await expect(page.locator(`#${chapter}-figure`)).toHaveAttribute("data-step", step);
}

/** Counts every frame the page asks for, from before its scripts run. */
async function countFrames(page: Page) {
  await page.addInitScript(() => {
    const ask = window.requestAnimationFrame.bind(window);
    const w = window as unknown as { taviFrames: number };
    w.taviFrames = 0;
    window.requestAnimationFrame = (callback) => {
      w.taviFrames += 1;
      return ask(callback);
    };
  });
}

/** For `ms`: the frames the page asked for, and the writes to a figure (its drawing's attributes and its readouts). */
async function activity(page: Page, figure: string, ms: number) {
  return page.evaluate(
    ({ figure, ms }) =>
      new Promise<{ frames: number; writes: number }>((resolve) => {
        const w = window as unknown as { taviFrames: number };
        const before = w.taviFrames;
        let writes = 0;
        const watch = new MutationObserver((records) => {
          writes += records.length;
        });
        const el = document.getElementById(figure);
        if (el) {
          watch.observe(el.querySelector("svg") ?? el, { attributes: true, subtree: true });
          for (const readout of el.querySelectorAll("[data-readout]")) {
            watch.observe(readout, { childList: true, characterData: true, subtree: true });
          }
        }
        setTimeout(() => {
          watch.disconnect();
          resolve({ frames: w.taviFrames - before, writes });
        }, ms);
      }),
    { figure, ms },
  );
}

/** Whether the tab looks hidden to the page's scripts, and the event that tells them. */
async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((hide) => {
    if (hide) Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    else delete (document as unknown as { visibilityState?: string }).visibilityState;
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

test.describe("chapter 3, the escapement, drawn by the clock", () => {
  test("opens at 1/10, held on step 1: a tooth on a stone's locking face, the fork on its banking", async ({
    page,
  }, info) => {
    await clockTrayReady(page, "escapement", isPhone(info), "1");
    const figure = page.locator("#escapement-figure");
    await expect(figure).toHaveAttribute("data-step", "1");
    expect(await slowOf(page, "#escapement-figure")).toBe("10");
    await expect(figure.getByRole("radio", { name: "1/10", exact: true })).toBeChecked();
    expect(Number(await figure.getAttribute("data-hold"))).toBeCloseTo(2.25 * BEAT, 9);
    expect(await drawn(page, "escapement-drawing", "escape")).toBe(24);
    expect(await drawn(page, "escapement-drawing", "fork")).toBeCloseTo(-5.279, 3);
    await expect(figure.locator('[data-readout="beats"]')).toHaveText("2");
    await expect(figure.locator('[data-readout="escape"]')).toHaveText("24.0°");

    // In the drawing's own units: some tooth's tip lies on the locking face of the stone that is in.
    const gap = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>("#escapement-drawing");
      const wheel = svg?.querySelector<SVGGElement>('[data-clock="escape"]');
      const stones = [...(svg?.querySelectorAll<SVGPathElement>(".p-stones path") ?? [])];
      if (!svg || !wheel || stones.length !== 2) return NaN;
      const toSvg = (el: SVGGraphicsElement) =>
        (svg.getScreenCTM()?.inverse() ?? new DOMMatrix()).multiply(el.getScreenCTM() ?? new DOMMatrix());
      const points = (d: string) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      const wheelToSvg = toSvg(wheel);
      // Each tooth's tip is the corner after its back's curve.
      const tips = [
        ...(wheel.querySelector("path")?.getAttribute("d") ?? "").matchAll(
          /Q-?[\d.]+ -?[\d.]+ -?[\d.]+ -?[\d.]+ L(-?[\d.]+) (-?[\d.]+)/g,
        ),
      ].map((m) => new DOMPoint(Number(m[1]), Number(m[2])).matrixTransform(wheelToSvg));
      let best = Infinity;
      for (const stone of stones) {
        const outline = points(stone.getAttribute("d") ?? "").map(([x = 0, y = 0]) =>
          new DOMPoint(x, y).matrixTransform(toSvg(stone)),
        );
        // The locking face runs from the locking corner (the outline's first point) to its last.
        const a = outline[0];
        const b = outline.at(-1);
        if (!a || !b) continue;
        for (const q of tips) {
          const u = Math.max(
            0,
            Math.min(
              1,
              ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
            ),
          );
          best = Math.min(best, Math.hypot(q.x - a.x - u * (b.x - a.x), q.y - a.y - u * (b.y - a.y)));
        }
      }
      return best;
    });
    expect(gap).toBeLessThan(0.05);
  });

  test("each step holds its phase; the steps never touch the page's play state, the header's Pause or the hero", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await clockTrayReady(page, "escapement", phone, "1");
    const html = page.locator("html");
    await page.evaluate(() => {
      const w = window as unknown as { playingChanges: number };
      w.playingChanges = 0;
      new MutationObserver(() => {
        w.playingChanges += 1;
      }).observe(document.documentElement, { attributeFilter: ["data-playing"] });
    });
    const figure = page.locator("#escapement-figure");
    const pause = figure.getByRole("button", { name: "Pause", exact: true });
    const phases = [
      { step: "1", escape: (a: number) => a === 24 },
      { step: "2", escape: (a: number) => a < 24 && a > 23 },
      { step: "3", escape: (a: number) => a > 24 && a < 36 },
      { step: "4", escape: (a: number) => a === 36 },
    ];
    for (const [sweep, go] of [
      [phases, readStepOf],
      [[...phases].reverse().slice(1), backToStep],
    ] as const) {
      for (const { step, escape } of sweep) {
        await go(page, "escapement", step, phone);
        await expect(figure).toHaveAttribute("data-step", step);
        await expect(figure).toHaveAttribute("data-hold", /^\d/);
        await expect(pause).toHaveAttribute("aria-pressed", "true");
        const angle = await drawn(page, "escapement-drawing", "escape");
        expect(escape(angle), `step ${step} draws the escape wheel at ${angle}`).toBe(true);
        await expect(html).toHaveAttribute("data-playing", "true");
        await expect(globalPause(page)).toHaveAttribute("aria-pressed", "false");
      }
    }
    // Step 5 holds nothing: the figure runs at its 1/10, the balance swinging.
    await readStepOf(page, "escapement", "5", phone);
    await expect(figure).toHaveAttribute("data-step", "5");
    await expect(figure).not.toHaveAttribute("data-hold");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    const swing = await drawn(page, "escapement-drawing", "balance");
    await expect.poll(() => drawn(page, "escapement-drawing", "balance")).not.toBe(swing);
    expect(await page.evaluate(() => (window as unknown as { playingChanges: number }).playingChanges)).toBe(0);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect.poll(() => heroRuns(page)).toBe(true);
  });

  test("un-pressing the tray's Pause lets a held figure run on, and plays the page if it was paused", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    // From step 2 the figure, its tray too, is stuck whole on screen, so a click scrolls nothing.
    await clockTrayReady(page, "escapement", phone);
    const figure = page.locator("#escapement-figure");
    const pause = figure.getByRole("button", { name: "Pause", exact: true });
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await pause.click();
    await expect(figure).not.toHaveAttribute("data-hold");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    // From the held moment on: the balance swings through rest from 21 degrees.
    await expect.poll(() => drawn(page, "escapement-drawing", "balance")).toBeLessThan(0);

    // Pressed again it pauses the page, as every Pause does.
    await pause.click();
    await expect(page.locator("html")).toHaveAttribute("data-playing", "false");
    // A step holds the figure while the page is paused; releasing it plays the page.
    await readStepOf(page, "escapement", "3", phone);
    await expect(figure).toHaveAttribute("data-hold", /^\d/);
    await pause.click();
    await expect(figure).not.toHaveAttribute("data-hold");
    await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
    await expect(globalPause(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("posed across one beat at 1/100, the escape wheel turns 12 degrees: a recoil first, the drop after", async ({
    page,
  }, info) => {
    await clockTrayReady(page, "escapement", isPhone(info));
    const figure = page.locator("#escapement-figure");
    await figure.getByRole("radio", { name: "1/100", exact: true }).click();
    expect(await slowOf(page, "#escapement-figure")).toBe("100");
    const at = async (t: number) => {
      await poseFigure(page, "escapement", t);
      await expect(figure).toHaveAttribute("data-hold", String(t));
      return drawn(page, "escapement-drawing", "escape");
    };
    const start = 7.25 * BEAT;
    const before = await at(start);
    expect((await at(start + BEAT)) - before).toBeCloseTo(12, 3);
    expect((await at(inWindow(0.075, 7))) - before, "the recoil").toBeLessThan(-0.4);
    expect((await at(inWindow(0.82, 7))) - before, "the impulse ends short").toBeCloseTo(9.84, 2);
    expect((await at(inWindow(0.85, 7))) - before, "the drop").toBeGreaterThan(9.84);
    expect((await at(inWindow(0.88, 7))) - before, "locked").toBeCloseTo(12, 3);
    await expect(figure.locator('[data-readout="beats"]')).toHaveText("7");
  });

  test("a part name lights its piece: the stones alone, then the impulse pin alone", async ({ page }, info) => {
    await page.goto("/");
    await readStepOf(page, "escapement", "2", isPhone(info));
    const figure = page.locator("#escapement-figure");
    const lit = () =>
      page.evaluate(() => {
        const drawing = document.querySelector("#escapement-drawing");
        const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        probe.style.fill = "var(--color-ghost-fill)";
        drawing?.append(probe);
        const ghost = getComputedStyle(probe).fill;
        probe.remove();
        const colour = (s: string) => getComputedStyle(drawing?.querySelector(s) ?? document.body).fill !== ghost;
        return {
          stones: colour(".p-stones path"),
          fork: colour(".fork-body .fl"),
          pin: colour(".p-impulse circle"),
          wheel: colour(".p-escape .fo"),
        };
      });
    const focus = (name: string) =>
      page
        .locator("#escapement")
        .getByRole("button", { name, exact: true })
        .first()
        .evaluate((el) => {
          (el as HTMLElement).focus({ preventScroll: true });
        });
    await focus("pallet stones");
    await expect(figure).toHaveAttribute("data-focus", "stones");
    expect(await lit()).toEqual({ stones: true, fork: false, pin: false, wheel: false });
    await focus("impulse pin");
    await expect(figure).toHaveAttribute("data-focus", "impulse-pin");
    expect(await lit()).toEqual({ stones: false, fork: false, pin: true, wheel: false });
    await focus("pallet fork");
    expect(await lit()).toEqual({ stones: true, fork: true, pin: false, wheel: false });
  });
});

test.describe("chapter 4, the balance, drawn by the clock", () => {
  test.beforeEach(async ({ page }) => {
    await countFrames(page);
  });

  test("runs at 1×; the hairspring's path follows the balance, and the lift window and amplitude are shown", async ({
    page,
  }, info) => {
    await clockTrayReady(page, "balance", isPhone(info));
    const figure = page.locator("#balance-figure");
    await expect(figure.getByRole("radio", { name: "1×", exact: true })).toBeChecked();
    await expect(figure).not.toHaveAttribute("data-hold");
    await expect(figure.locator('[data-readout="amplitude"]')).toHaveText("200°");
    await expect(page.locator("#balance-drawing .window text")).toHaveText("Lift window, 50°");
    const hair = () => page.locator('#balance-drawing [data-clock="hair"]').getAttribute("d");
    await poseFigure(page, "balance", 0);
    const out = await hair();
    expect(await drawn(page, "balance-drawing", "balance")).toBe(200);
    await expect(figure.locator('[data-readout="balance"]')).toHaveText("+200°");
    await poseFigure(page, "balance", BEAT);
    expect(await drawn(page, "balance-drawing", "balance")).toBe(-200);
    await expect(figure.locator('[data-readout="balance"]')).toHaveText("−200°");
    expect(await hair()).not.toBe(out);
  });

  test("the loop asks for no frame and draws nothing while paused, scrolled away or hidden", async ({ page }, info) => {
    const phone = isPhone(info);
    await clockTrayReady(page, "balance", phone, "1");
    await page.waitForTimeout(300);
    const running = await activity(page, "balance-figure", 500);
    expect(running.writes).toBeGreaterThan(5);

    // The figure's own Pause, on screen in its tray: it pauses the whole page.
    const pause = page.locator("#balance-figure").getByRole("button", { name: "Pause", exact: true });
    await pause.click();
    await expect(page.locator("html")).toHaveAttribute("data-playing", "false");
    await page.waitForTimeout(100);
    expect(await activity(page, "balance-figure", 1000), "paused").toEqual({ frames: 0, writes: 0 });
    await pause.click();
    expect((await activity(page, "balance-figure", 300)).writes).toBeGreaterThan(0);

    // Away to chapter 2, which ticks in CSS: the hero's 3D view would ask for frames of its own at the top.
    await page.evaluate(() => {
      document.getElementById("wheels")?.scrollIntoView();
    });
    await page.waitForTimeout(200);
    expect(await activity(page, "balance-figure", 1000), "scrolled away").toEqual({ frames: 0, writes: 0 });
    await readStepOf(page, "balance", "2", phone);
    expect((await activity(page, "balance-figure", 300)).writes).toBeGreaterThan(0);

    await setHidden(page, true);
    await page.waitForTimeout(100);
    expect(await activity(page, "balance-figure", 1000), "hidden").toEqual({ frames: 0, writes: 0 });
    await setHidden(page, false);
    expect((await activity(page, "balance-figure", 300)).writes).toBeGreaterThan(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("chapter 4 starts on a still frame until its Pause is released", async ({ page }, info) => {
      await clockTrayReady(page, "balance", isPhone(info));
      await page.waitForTimeout(300);
      expect(await activity(page, "balance-figure", 1000)).toEqual({ frames: 0, writes: 0 });
      const pause = page.locator("#balance-figure").getByRole("button", { name: "Pause", exact: true });
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      await pause.click();
      await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
      expect((await activity(page, "balance-figure", 500)).writes).toBeGreaterThan(0);
    });
  });
});

// The 3D movement: one island on the hero and on chapter 5, climbing the fallback ladder (decisions-tavi.md). Its dev
// hook, `taviPose(name, pose)`, holds a figure at `{ t }` and, given an empty pose, reads the view's numbers.
interface GlStats {
  frames: number;
  calls: number;
  triangles: number;
  t: number;
  apart: number;
  tilt: number;
  turn: number;
  lit: string | null;
  pixelRatio: number;
  reserve: number;
  spring: number;
  ratchet: number;
  balance: number;
}

/** The 3D view's numbers through the dev hook; an empty pose changes nothing. */
async function glStats(page: Page, name: string): Promise<GlStats> {
  return page.evaluate(
    (n) => (window as unknown as { taviPose: (id: string, pose: object) => GlStats }).taviPose(n, {}),
    name,
  );
}

/** Poses a 3D view through the dev hook and returns its numbers. */
async function glPose(page: Page, name: string, pose: object): Promise<GlStats> {
  return page.evaluate(
    ({ n, p }) => (window as unknown as { taviPose: (id: string, pose: object) => GlStats }).taviPose(n, p),
    { n: name, p: pose },
  );
}

/** Scrolls chapter 5's figure to the middle of the screen, whole, beside its first step, which leaves it together. */
async function toTogether(page: Page) {
  await page.evaluate(() => {
    const figure = document.getElementById("together-figure");
    if (figure) window.scrollBy(0, figure.getBoundingClientRect().top - (innerHeight - figure.offsetHeight) / 2);
  });
}

/** A figure's island: the box the poster and the canvas share. */
const island = (page: Page, name: "hero" | "together") =>
  page.locator(name === "hero" ? ".hero-stage .movement-figure" : "#together .movement-figure");

/** Waits until a figure's 3D view has drawn and replaced its poster. */
async function glLive(page: Page, name: "hero" | "together") {
  await expect(island(page, name)).toHaveAttribute("data-gl", "live", { timeout: 20_000 });
}

/** three.js or the scene built on it: a request the first screen must not wait on. */
const THREE_REQUEST = /\/src\/three\/view\.ts|\.vite\/deps\/three|\/three\/(build|examples)\//;

/** The half beat at which the 3D view starts: the balance passing rest, as the poster draws it. */
const REST = 1 / 12;

/**
 * Where the plate's circle meets the lines through its centre in a shot of a figure's box, in pixels from the box's
 * edges: the first pixel from each side that differs from the ground.
 */
async function plateEdges(page: Page, shot: Buffer, viewBox: string) {
  return page.evaluate(
    async ({ png, viewBox }) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const g = canvas.getContext("2d");
      if (!g) return null;
      g.drawImage(bitmap, 0, 0);
      const { data, width, height } = g.getImageData(0, 0, bitmap.width, bitmap.height);
      const [vx = 0, vy = 0, vw = 1, vh = 1] = viewBox.split(/\s+/).map(Number);
      const s = Math.min(width / vw, height / vh);
      const cx = Math.round((width - vw * s) / 2 - vx * s);
      const cy = Math.round((height - vh * s) / 2 - vy * s);
      const at = (x: number, y: number) => [0, 1, 2].map((k) => data[(y * width + x) * 4 + k] ?? 0);
      const ground = at(cx, 2);
      const differs = (x: number, y: number) =>
        at(x, y).reduce((sum, v, k) => sum + Math.abs(v - (ground[k] ?? 0)), 0) > 90;
      const scan = (from: number, to: number, pick: (i: number) => [number, number]) => {
        for (let i = from; i !== to; i += Math.sign(to - from)) if (differs(...pick(i))) return i;
        return NaN;
      };
      return {
        left: scan(0, cx, (x) => [x, cy]),
        right: scan(width - 1, cx, (x) => [x, cy]),
        top: scan(0, cy, (y) => [cx, y]),
        bottom: scan(height - 1, cy, (y) => [cx, y]),
      };
    },
    { png: shot.toString("base64"), viewBox },
  );
}

/** Shoots a live figure's box, then shows its poster in the same box and shoots that: the plate within 2 px. */
async function expectPlateAligned(page: Page, name: "hero" | "together") {
  const box = island(page, name);
  await page.evaluate(() => document.fonts.ready);
  await glPose(page, name, { t: REST });
  const viewBox = (await box.locator("svg.movement").getAttribute("viewBox")) ?? "";
  const gl = await plateEdges(page, await box.screenshot(), viewBox);
  await box.evaluate((el) => {
    el.dataset.gl = "poster";
  });
  const drawn = await plateEdges(page, await box.screenshot(), viewBox);
  expect(gl).not.toBeNull();
  expect(drawn).not.toBeNull();
  for (const side of ["left", "right", "top", "bottom"] as const) {
    const a = gl?.[side] ?? NaN;
    const b = drawn?.[side] ?? NaN;
    expect(Math.abs(a - b), `the plate's ${side} edge: 3D at ${a} px, the poster at ${b} px`).toBeLessThanOrEqual(2);
  }
}

/** Records, from before the page's scripts run, every layout shift and when each island first left its poster. */
async function watchShifts(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { taviShifts: { at: number; value: number }[]; taviSwaps: number[] };
    w.taviShifts = [];
    w.taviSwaps = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
        if (!entry.hadRecentInput) w.taviShifts.push({ at: entry.startTime, value: entry.value });
    }).observe({ type: "layout-shift", buffered: true });
    new MutationObserver((records) => {
      for (const r of records)
        if ((r.target as Element).getAttribute("data-gl") !== "poster") w.taviSwaps.push(performance.now());
    }).observe(document, { attributeFilter: ["data-gl"], subtree: true });
  });
}

/** The layout-shift score from the first time an island left its poster. */
async function shiftSinceSwap(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { taviShifts: { at: number; value: number }[]; taviSwaps: number[] };
    const from = Math.min(...w.taviSwaps);
    return w.taviShifts.filter((s) => s.at >= from - 50).reduce((sum, s) => sum + s.value, 0);
  });
}

test.describe("the 3D movement, on the fallback ladder", () => {
  test("the hero paints the drawing first, then the 3D view takes its box, flat, plate on plate, nothing shifting", async ({
    page,
  }) => {
    await watchShifts(page);
    await page.goto("/");
    await glLive(page, "hero");
    await page.waitForTimeout(500);
    const timing = await page.evaluate((source) => {
      const three = new RegExp(source);
      const first = performance
        .getEntriesByType("resource")
        .filter((r) => three.test(r.name))
        .map((r) => r.startTime);
      const paint = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? Infinity;
      return { paint, three: Math.min(...first) };
    }, THREE_REQUEST.source);
    expect(timing.three, "three.js was requested").toBeLessThan(Infinity);
    expect(timing.paint, "the first paint comes before any three.js request").toBeLessThan(timing.three);
    expect(await shiftSinceSwap(page)).toBeLessThan(0.01);
    // The hero's text came first and stays; the poster's callouts stay over the flat view.
    await expect(page.getByRole("heading", { level: 1, name: /^Six beats\s*every second$/ })).toBeVisible();
    await expect(page.locator("#hero-movement .callout").first()).toHaveCSS("opacity", "1");
    await expect(page.getByRole("img", { name: /^A wristwatch movement in three dimensions/ })).toBeVisible();
    const stats = await glStats(page, "hero");
    expect(stats.tilt).toBe(0);
    expect(stats.calls).toBeLessThan(150);
    await expectPlateAligned(page, "hero");
  });

  test("chapter 5's view lines up with its poster, and stays flat until the first drag tilts it", async ({
    page,
  }, info) => {
    test.skip(isPhone(info), "a phone turns chapter 5 on its button; the drag is a mouse's here");
    await watchShifts(page);
    await page.goto("/");
    await toTogether(page);
    await glLive(page, "together");
    expect(await shiftSinceSwap(page)).toBeLessThan(0.01);
    await page.waitForTimeout(1200);
    expect((await glStats(page, "together")).tilt, "still flat after a second of ticking").toBe(0);
    await expectPlateAligned(page, "together");
    await island(page, "together").evaluate((el) => {
      el.dataset.gl = "live";
    });

    const canvas = page.locator("#together canvas");
    const where = await canvas.boundingBox();
    if (!where) throw new Error("no canvas");
    await page.mouse.move(where.x + where.width / 2, where.y + where.height / 2);
    await page.mouse.down();
    await page.mouse.move(where.x + where.width / 2 + 60, where.y + where.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(island(page, "together")).toHaveAttribute("data-tilted", "");
    await expect.poll(async () => (await glStats(page, "together")).tilt).toBe(1);

    // On the hero, an arrow key on the focused canvas tilts it the same way.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await glLive(page, "hero");
    expect((await glStats(page, "hero")).tilt).toBe(0);
    await page.locator(".hero-stage canvas").focus();
    await page.keyboard.press("ArrowLeft");
    await expect.poll(async () => (await glStats(page, "hero")).tilt).toBe(1);
    await expect(page.locator("#hero-movement .callout").first()).toHaveCSS("opacity", "0");
  });

  test("at device pixel ratio 3 the view draws at 2, in under 150 calls", async ({ browser }, info) => {
    test.skip(isPhone(info), "one size is enough");
    const context = await browser.newContext({
      baseURL: info.project.use.baseURL,
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    await page.goto("/");
    await glLive(page, "hero");
    const stats = await glStats(page, "hero");
    expect(stats.pixelRatio).toBe(2);
    expect(stats.calls).toBeLessThan(150);
    await context.close();
  });

  test("opened straight at chapter 5 on a phone, no three.js comes until Turn it in 3D is pressed", async ({
    page,
  }, info) => {
    test.skip(!isPhone(info), "the button is a phone's");
    const asked: string[] = [];
    page.on("request", (request) => {
      if (THREE_REQUEST.test(request.url())) asked.push(request.url());
    });
    await page.goto("/#together");
    const turn = page.getByRole("button", { name: "Turn it in 3D", exact: true });
    await expect(turn).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    expect(asked).toEqual([]);
    await expect(island(page, "hero")).toHaveAttribute("data-gl", "poster");
    await expect(island(page, "together")).toHaveAttribute("data-gl", "offer");

    await turn.click();
    await glLive(page, "together");
    expect(asked.length).toBeGreaterThan(0);
    await expect(turn).toHaveCount(0);
    const before = await glStats(page, "together");
    await expect.poll(async () => (await glStats(page, "together")).t).toBeGreaterThan(before.t);
    expect(before.tilt).toBe(0);
  });

  test.describe("without WebGL", () => {
    test.beforeEach(async ({ page }) => {
      await withoutWebGL(page);
    });

    test("the posters stay, chapter 5's with its one quiet line", async ({ page }, info) => {
      await page.goto("/");
      await toTogether(page);
      if (isPhone(info)) await page.getByRole("button", { name: "Turn it in 3D", exact: true }).click();
      await expect(island(page, "together")).toHaveAttribute("data-gl", "flat", { timeout: 15_000 });
      await expect(page.locator("#together .gl-note")).toHaveText("This browser can’t turn it in 3D; here it is flat.");
      await expect(page.locator("#together-movement .mv")).toBeVisible();
      await expect(page.locator("#together canvas")).toHaveCount(0);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
      await expect(island(page, "hero")).toHaveAttribute("data-gl", "poster");
      await expect(page.locator(".hero-stage .gl-note")).toHaveCount(0);
      await expect(page.locator("#hero-movement .mv")).toBeVisible();
    });
  });

  test("a lost context brings the poster back, keeping the clock and the play state, until it returns", async ({
    page,
  }, info) => {
    test.skip(isPhone(info), "the same island on a phone");
    await page.goto("/");
    await toTogether(page);
    await glLive(page, "together");
    const lose = (restore: boolean) =>
      page.locator("#together canvas").evaluate((canvas, back) => {
        const gl = (canvas as HTMLCanvasElement).getContext("webgl2");
        const ext = gl?.getExtension("WEBGL_lose_context");
        if (back) ext?.restoreContext();
        else ext?.loseContext();
        (window as unknown as { taviLose: unknown }).taviLose = ext;
      }, restore);
    await lose(false);
    await expect(island(page, "together")).toHaveAttribute("data-gl", "lost");
    await expect(page.locator("#together-movement .mv")).toBeVisible();
    await expect(page.locator("#together canvas")).toHaveCSS("opacity", "0");
    await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
    const t = (await glStats(page, "together")).t;
    await page.evaluate(() => {
      (window as unknown as { taviLose: { restoreContext: () => void } }).taviLose.restoreContext();
    });
    await glLive(page, "together");
    expect((await glStats(page, "together")).t).toBeGreaterThanOrEqual(t);
  });

  test("the view asks for no frame over 2 s while paused, scrolled away or in a hidden tab", async ({ page }, info) => {
    const phone = isPhone(info);
    await countFrames(page);
    await page.goto("/");
    await toTogether(page);
    if (phone) await page.getByRole("button", { name: "Turn it in 3D", exact: true }).click();
    await glLive(page, "together");
    await page.waitForFunction(() =>
      document.querySelector('#together-figure astro-island[component-url*="TogetherTray"]:not([ssr])'),
    );
    const frames = async (ms: number) => {
      const before = await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames);
      await page.waitForTimeout(ms);
      return (await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames)) - before;
    };
    expect(await frames(500), "playing").toBeGreaterThan(5);

    const pause = page.locator("#together-figure").getByRole("button", { name: "Pause", exact: true });
    await pause.click();
    await page.waitForTimeout(100);
    expect(await frames(2000), "paused").toBe(0);
    await pause.click();
    expect(await frames(300)).toBeGreaterThan(0);

    await page.evaluate(() => {
      document.getElementById("wheels")?.scrollIntoView();
    });
    await page.waitForTimeout(200);
    expect(await frames(2000), "scrolled away").toBe(0);
    await toTogether(page);
    expect(await frames(300)).toBeGreaterThan(0);

    await setHidden(page, true);
    await page.waitForTimeout(100);
    expect(await frames(2000), "hidden").toBe(0);
    await setHidden(page, false);
    expect(await frames(300)).toBeGreaterThan(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the view starts still until its Pause is released, and the first drag tilts it at once", async ({
      page,
    }, info) => {
      test.skip(isPhone(info), "the same island on a phone");
      await countFrames(page);
      await page.goto("/");
      await toTogether(page);
      await glLive(page, "together");
      await page.waitForFunction(() =>
        document.querySelector('#together-figure astro-island[component-url*="TogetherTray"]:not([ssr])'),
      );
      const pause = page.locator("#together-figure").getByRole("button", { name: "Pause", exact: true });
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      const t = (await glStats(page, "together")).t;
      const before = await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames);
      await page.waitForTimeout(2000);
      expect(await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames)).toBe(before);
      expect((await glStats(page, "together")).t).toBe(t);

      const canvas = page.locator("#together canvas");
      const where = await canvas.boundingBox();
      if (!where) throw new Error("no canvas");
      await page.mouse.move(where.x + 100, where.y + 100);
      await page.mouse.down();
      await page.mouse.move(where.x + 160, where.y + 100, { steps: 3 });
      await page.mouse.up();
      await page.waitForTimeout(50);
      expect((await glStats(page, "together")).tilt, "a jump, not an ease").toBe(1);

      await pause.click();
      await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
      await expect.poll(async () => (await glStats(page, "together")).t).toBeGreaterThan(t);
    });
  });
});

/** Chapter 5's labelled parts, in the order they come off: its parts list and its labels. */
const TOGETHER_PARTS = [
  "Balance cock",
  "Balance",
  "Hairspring",
  "Pallet bridge",
  "Pallet fork",
  "Ratchet wheel",
  "Crown wheel",
  "Click",
  "Train bridge",
  "Barrel bridge",
  "Escape wheel",
  "Fourth wheel",
  "Third wheel",
  "Centre wheel",
  "Barrel lid",
  "Barrel",
  "Mainspring",
  "Main plate",
  "Crown",
];

/**
 * Chapter 5 with step `step` on the reading line and its tray hydrated; with `gl`, the 3D view live (a phone presses
 * "Turn it in 3D" for it).
 */
async function togetherReady(page: Page, phone: boolean, { step = "2", gl = true } = {}) {
  await page.goto("/");
  // From step 2 the figure is stuck whole on screen, its tray in view, so the tray hydrates.
  await readStepOf(page, "together", "2", phone);
  await page.waitForFunction(() =>
    document.querySelector('#together-figure astro-island[component-url*="TogetherTray"]:not([ssr])'),
  );
  if (step !== "2") {
    // A step already on the reading line's edge reports no change: come to it from the top of the page.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
    await readStepOf(page, "together", step, phone);
  }
  await expect(page.locator("#together-figure")).toHaveAttribute("data-step", step);
  if (!gl) return;
  if (phone) await page.getByRole("button", { name: "Turn it in 3D", exact: true }).click();
  await glLive(page, "together");
}

/** Every leader shown over chapter 5's 3D view, read from its path, and every pair of them that meets. */
async function leaders(page: Page) {
  return page.locator("#together .leaders").evaluate((svg) => {
    type P = [number, number];
    const shown = [...svg.querySelectorAll<SVGGElement>("[data-leader]")].filter(
      (g) => getComputedStyle(g).visibility !== "hidden",
    );
    const lines = shown.map((g) => {
      const nums = (g.querySelector("path")?.getAttribute("d") ?? "").match(/-?[\d.]+/g)?.map(Number) ?? [];
      const pts: P[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i] ?? 0, nums[i + 1] ?? 0]);
      return { id: g.dataset.leader ?? "", pts };
    });
    const cross = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const on = (p: P, q: P, r: P) =>
      Math.abs(cross(p, q, r)) < 1e-6 &&
      r[0] >= Math.min(p[0], q[0]) &&
      r[0] <= Math.max(p[0], q[0]) &&
      r[1] >= Math.min(p[1], q[1]) &&
      r[1] <= Math.max(p[1], q[1]);
    const meet = (a: P, b: P, c: P, d: P) => {
      const [d1, d2, d3, d4] = [cross(c, d, a), cross(c, d, b), cross(a, b, c), cross(a, b, d)];
      return (d1 * d2 < 0 && d3 * d4 < 0) || on(c, d, a) || on(c, d, b) || on(a, b, c) || on(a, b, d);
    };
    const meets: string[] = [];
    lines.forEach((p, i) =>
      lines.slice(i + 1).forEach((q) => {
        for (let s = 1; s < p.pts.length; s++)
          for (let t = 1; t < q.pts.length; t++) {
            const [a, b, c, d] = [p.pts[s - 1], p.pts[s], q.pts[t - 1], q.pts[t]];
            if (a && b && c && d && meet(a, b, c, d)) {
              meets.push(`${p.id} / ${q.id}`);
              return;
            }
          }
      }),
    );
    return { ids: lines.map((l) => l.id), meets };
  });
}

/** How many pixels in a shot of chapter 5's figure box are in colour: the ghost pair and the paper are near grey. */
async function colouredPixels(page: Page) {
  const shot = await island(page, "together").screenshot();
  return page.evaluate(async (png) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const g = canvas.getContext("2d");
    if (!g) return 0;
    g.drawImage(bitmap, 0, 0);
    const { data } = g.getImageData(0, 0, bitmap.width, bitmap.height);
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r = 0, gr = 0, b = 0] = [data[i], data[i + 1], data[i + 2]];
      if (Math.max(r, gr, b) - Math.min(r, gr, b) > 40) n += 1;
    }
    return n;
  }, shot.toString("base64"));
}

test.describe("chapter 5, together, apart and back", () => {
  test("each step sets Take apart; a step's own parts are lit, framed and labelled alone", async ({ page }, info) => {
    const phone = isPhone(info);
    await togetherReady(page, phone, { step: "1", gl: !phone });
    const figure = page.locator("#together-figure");
    const apart = figure.getByRole("slider", { name: "Take apart", exact: true });
    const values = { "1": "0", "2": "45", "3": "58", "4": "68", "5": "96", "6": "100", "7": "0" };
    for (const [step, value] of Object.entries(values)) {
      await readStepOf(page, "together", step, phone);
      await expect(figure).toHaveAttribute("data-step", step);
      await expect(apart).toHaveValue(value);
    }
    if (phone) return;
    await readStepOf(page, "together", "2", phone);
    await expect.poll(async () => (await glStats(page, "together")).apart).toBe(0.45);
    await expect.poll(async () => (await leaders(page)).ids.sort()).toEqual(["balance", "balance-cock", "hairspring"]);
    // Moved off the step's value, the whole movement is framed and labelled again.
    await glPose(page, "together", { apart: 1 });
    await expect.poll(async () => (await leaders(page)).ids.length).toBe(TOGETHER_PARTS.length);
  });

  test("apart 100% at 1280 x 800, turned 0° and ±30°: every part labelled, and no two leaders on the page meet", async ({
    page,
  }, info) => {
    test.skip(isPhone(info), "a phone labels the lit part alone");
    await togetherReady(page, false);
    for (const turn of [0, 30, -30]) {
      const stats = await glPose(page, "together", { apart: 1, turn });
      expect(stats.turn).toBe(turn);
      const { ids, meets } = await leaders(page);
      expect(ids, `turned ${turn}°`).toHaveLength(TOGETHER_PARTS.length);
      expect(meets, `turned ${turn}°`).toEqual([]);
      // The labels stand in two columns inside the figure, none over another.
      const boxes = await page.locator("#together .labels .label").evaluateAll((labels) =>
        labels
          .filter((l) => getComputedStyle(l).visibility !== "hidden")
          .map((l) => {
            const r = l.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          }),
      );
      const box = await island(page, "together").boundingBox();
      if (!box) throw new Error("no figure");
      for (const [i, a] of boxes.entries()) {
        expect(a.x >= box.x && a.x + a.w <= box.x + box.width && a.y >= box.y && a.y + a.h <= box.y + box.height).toBe(
          true,
        );
        for (const b of boxes.slice(i + 1))
          expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true);
      }
      await expect(page.locator("#together-figure").getByRole("slider", { name: "Turn", exact: true })).toHaveValue(
        String(turn),
      );
    }
  });

  test("a click on a part lights it, its name in the prose and its label; a click on the paper lets it go", async ({
    page,
  }, info) => {
    test.skip(isPhone(info), "a mouse's click; a phone's tap is the parts list's test");
    await togetherReady(page, false);
    await glPose(page, "together", { apart: 1, turn: 0 });
    const dot = await page
      .locator('#together [data-leader="balance-cock"] circle')
      .evaluate((c) => [Number(c.getAttribute("cx")), Number(c.getAttribute("cy"))]);
    const canvas = page.locator("#together canvas");
    await canvas.click({ position: { x: dot[0] ?? 0, y: dot[1] ?? 0 } });
    await expect(page.locator("#together-figure")).toHaveAttribute("data-pick", "balance-cock");
    expect((await glStats(page, "together")).lit).toBe("balance-cock");
    await expect(page.locator('#together .part-name[data-part="balance-cock"]')).toHaveClass(/\bis-lit\b/);
    await expect(page.locator('#together .labels [data-label="balance-cock"]')).toHaveClass(/\bis-lit\b/);
    await expect(page.locator('#together .labels [data-label="balance-cock"]')).toHaveAttribute("aria-pressed", "true");
    // Every other part drops to the ghost pair: little colour is left.
    await page.mouse.move(0, 0);
    const lit = await colouredPixels(page);
    await canvas.click({ position: { x: 4, y: 4 } });
    await expect(page.locator("#together-figure")).not.toHaveAttribute("data-pick", /./);
    expect((await glStats(page, "together")).lit).toBeNull();
    await page.waitForTimeout(100);
    expect(lit).toBeLessThan((await colouredPixels(page)) * 0.4);
  });

  test("at 390 x 844 the parts list holds every labelled part as a button, and pressing one lights it", async ({
    page,
  }, info) => {
    test.skip(!isPhone(info), "the list is a phone's");
    await togetherReady(page, true, { gl: false });
    const list = page.getByRole("group", { name: "The parts: choose one to light it" });
    await expect(list.getByRole("button")).toHaveText(TOGETHER_PARTS);
    await expect(list).toBeVisible();

    // On the drawing, before any 3D: the part lights there, and its name in the prose.
    const balance = list.getByRole("button", { name: "Balance", exact: true });
    await balance.click();
    await expect(balance).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('#together-movement .part[data-part="balance"]')).toHaveClass(/\bis-focus\b/);
    await expect(page.locator('#together .part-name[data-part="balance"]').first()).toHaveClass(/\bis-lit\b/);
    await balance.click();
    await expect(balance).toHaveAttribute("aria-pressed", "false");

    // In 3D: the part lights, it is framed, and its label is the only one in the figure.
    await page.getByRole("button", { name: "Turn it in 3D", exact: true }).click();
    await glLive(page, "together");
    const fork = list.getByRole("button", { name: "Pallet fork", exact: true });
    await fork.click();
    await expect.poll(async () => (await glStats(page, "together")).lit).toBe("pallet");
    await expect(page.locator("#together .labels .label:visible")).toHaveText(["Pallet fork"]);
    await expect.poll(async () => (await leaders(page)).ids).toEqual(["pallet"]);
    await fork.click();
    await expect.poll(async () => (await glStats(page, "together")).lit).toBeNull();
    await expect(page.locator("#together .labels .label:visible")).toHaveCount(0);
  });

  test("keyboard only: Take apart, Put back, Turn, and the labels or the parts list", async ({ page }, info) => {
    const phone = isPhone(info);
    await togetherReady(page, phone);
    const fig = page.locator("#together-figure");
    const e = () => fig.evaluate((el) => el.style.getPropertyValue("--e"));

    await fig.getByRole("button", { name: "Pause", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(fig.getByRole("radio", { name: "1×", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    const run = fig.getByRole("button", { name: "Take apart", exact: true });
    await expect(run).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(e).toBe("1");
    const back = fig.getByRole("button", { name: "Put back", exact: true });
    await expect(back).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(e).toBe("0");
    await expect(run).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(fig.getByRole("slider", { name: "Take apart", exact: true })).toBeFocused();
    await page.keyboard.press("End");
    await expect.poll(e).toBe("1");
    await page.keyboard.press("Tab");
    const turn = fig.getByRole("slider", { name: "Turn", exact: true });
    await expect(turn).toBeFocused();
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    await expect(turn).toHaveValue("3");
    await expect.poll(async () => (await glStats(page, "together")).turn).toBe(3);
    await page.keyboard.press("PageDown");
    await expect.poll(async () => (await glStats(page, "together")).turn).toBe(-12);

    // From the 3D view, Tab reaches each label on a desktop, and the parts list on a phone; Enter lights the part.
    await page.locator("#together canvas").focus();
    await page.keyboard.press("Tab");
    const first = phone
      ? page
          .getByRole("group", { name: "The parts: choose one to light it" })
          .getByRole("button", { name: "Balance cock" })
      : page.locator('#together .labels [data-label="balance-cock"]');
    await expect(first).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(fig).toHaveAttribute("data-pick", "balance-cock");
    await expect.poll(async () => (await glStats(page, "together")).lit).toBe("balance-cock");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(fig).toHaveAttribute("data-pick", "balance");
    // Escape on the 3D view lets the part go.
    await page.locator("#together canvas").focus();
    await page.keyboard.press("Escape");
    await expect(fig).not.toHaveAttribute("data-pick", /./);
  });

  test.describe("without WebGL", () => {
    test.beforeEach(async ({ page }) => {
      await withoutWebGL(page);
    });

    test("the same slider takes the drawing apart, and the parts list lights its parts", async ({ page }, info) => {
      const phone = isPhone(info);
      await togetherReady(page, phone, { gl: false });
      if (phone) await page.getByRole("button", { name: "Turn it in 3D", exact: true }).click();
      await expect(island(page, "together")).toHaveAttribute("data-gl", "flat", { timeout: 15_000 });
      const fig = page.locator("#together-figure");
      // The drawing can't turn: Turn keeps its place, hidden.
      await expect(fig.locator(".turn-cell")).toHaveCSS("visibility", "hidden");

      const apart = fig.getByRole("slider", { name: "Take apart", exact: true });
      await apart.focus();
      await page.keyboard.press("End");
      await expect(apart).toHaveValue("100");
      // Every lift group rises its full drawn lift along the one oblique axis, and the drawing shrinks to hold them.
      const groups = () =>
        page.locator("#together-movement .lift-w").evaluateAll((list) =>
          list.map((g) => {
            const cs = getComputedStyle(g);
            const m = new DOMMatrix(cs.transform === "none" ? undefined : cs.transform);
            return { x: m.e, y: m.f, lift: Number(cs.getPropertyValue("--lift")) };
          }),
        );
      const off = (to: number) => async () =>
        Math.max(
          ...(await groups()).map((g) => Math.abs(g.x - to * g.lift * 0.5) + Math.abs(g.y + to * g.lift * 0.866)),
        );
      await expect.poll(off(1)).toBeLessThan(0.05);
      expect(await groups()).toHaveLength(20);
      const scale = () =>
        page.locator("#together-movement > .mv").evaluate((g) => {
          const t = getComputedStyle(g).transform;
          return new DOMMatrix(t === "none" ? undefined : t).a;
        });
      await expect.poll(scale).toBeLessThan(0.95);
      await page.keyboard.press("Home");
      await expect.poll(off(0)).toBeLessThan(0.05);
      await expect.poll(scale).toBe(1);

      const list = page.getByRole("group", { name: "The parts: choose one to light it" });
      await expect(list).toBeVisible();
      await list.getByRole("button", { name: "Train bridge", exact: true }).click();
      await expect(page.locator('#together-movement .part[data-part="train-bridge"]').first()).toHaveClass(
        /\bis-focus\b/,
      );
      // A bridge's screws light with it; every other part is ghosted.
      await expect(page.locator('#together-movement .part[data-part="train-bridge"]')).toHaveCount(2);
      await expect(page.locator('#together-movement .part[data-part="barrel"] .fo').first()).toHaveCSS(
        "fill",
        await page.evaluate(() => {
          const probe = document.createElement("div");
          probe.style.color = "var(--color-ghost-fill)";
          document.body.append(probe);
          const c = getComputedStyle(probe).color;
          probe.remove();
          return c;
        }),
      );
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("Take apart and the turn jump, and nothing moves until its Pause is released", async ({ page }, info) => {
      test.skip(isPhone(info), "the same island on a phone");
      await countFrames(page);
      await togetherReady(page, false);
      const fig = page.locator("#together-figure");
      const pause = fig.getByRole("button", { name: "Pause", exact: true });
      await expect(pause).toHaveAttribute("aria-pressed", "true");
      expect((await glStats(page, "together")).apart, "the step's value, at once").toBe(0.45);

      await fig.getByRole("button", { name: "Take apart", exact: true }).click();
      expect(await fig.evaluate((el) => el.style.getPropertyValue("--e"))).toBe("1");
      expect((await glStats(page, "together")).apart).toBe(1);
      const turn = fig.getByRole("slider", { name: "Turn", exact: true });
      await turn.focus();
      await page.keyboard.press("PageUp");
      expect((await glStats(page, "together")).turn).toBe(15);

      const t = (await glStats(page, "together")).t;
      await page.waitForTimeout(300);
      const before = await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames);
      await page.waitForTimeout(2000);
      expect(await page.evaluate(() => (window as unknown as { taviFrames: number }).taviFrames)).toBe(before);
      expect((await glStats(page, "together")).t).toBe(t);

      await pause.click();
      await expect.poll(async () => (await glStats(page, "together")).t).toBeGreaterThan(t);
    });
  });
});

// Chapter 6, the bench: the tools drawn top-down, each lit by its name in the prose and by its steps; nothing moves
// but the loupe, which slides over the balance on step 3.
const TOOLS = ["screwdrivers", "holder", "oil-cup", "oiler", "tweezers", "brass-tweezers", "loupe"];
const BENCH_STEPS = [
  { step: "1", lit: TOOLS },
  { step: "2", lit: ["holder"] },
  { step: "3", lit: ["holder", "loupe"] },
  { step: "4", lit: ["screwdrivers"] },
  { step: "5", lit: ["tweezers", "brass-tweezers"] },
  { step: "6", lit: ["oil-cup", "oiler"] },
];

/** The bench's tools in colour, in the drawing's order: those whose first shape isn't filled with the ghost token. */
async function benchLit(page: Page) {
  return page.evaluate(() => {
    const drawing = document.querySelector("#bench-drawing");
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    probe.style.fill = "var(--color-ghost-fill)";
    drawing?.append(probe);
    const ghost = getComputedStyle(probe).fill;
    probe.remove();
    const fill = (el: Element | null | undefined) => (el ? getComputedStyle(el).fill : ghost);
    const tools = [...(drawing?.querySelectorAll<SVGGElement>(".tool[data-part]") ?? [])];
    return {
      lit: tools.filter((t) => fill(t.querySelector(".m .fo")) !== ghost).map((t) => t.dataset.part),
      // The movement in the holder ghosts with it: its plate and its balance.
      movement: [".held [data-part='plate'] .fo", ".held [data-part='balance'] .fo"].map(
        (s) => fill(drawing?.querySelector(s)) !== ghost,
      ),
    };
  });
}

/** Where the loupe's lens is and where the balance is, on screen: each one's centre. */
async function loupeOverBalance(page: Page) {
  return page.evaluate(() => {
    const centre = (s: string) => {
      const r = document.querySelector(s)?.getBoundingClientRect();
      return r ? [r.x + r.width / 2, r.y + r.height / 2] : [NaN, NaN];
    };
    const [lx = NaN, ly = NaN] = centre("#bench-drawing .t-loupe .rim");
    const [bx = NaN, by = NaN] = centre("#bench-drawing .held .rot-balance");
    return Math.hypot(lx - bx, ly - by);
  });
}

test.describe("chapter 6, the bench, drawn", () => {
  test("each tool's name lights that tool and drops every other to the ghost pair", async ({ page }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    await readStepOf(page, "bench", "4", phone);
    const chapter = page.locator("#bench");
    const figure = page.locator("#bench-figure");
    const named = await chapter
      .locator(".part-name[data-part]")
      .evaluateAll((list) => list.map((b) => (b as HTMLElement).dataset.part ?? ""));
    // Every tool in the drawing has a name in the prose.
    expect(new Set(named)).toEqual(new Set(TOOLS));
    for (const tool of TOOLS) {
      // Focused where it is, without scrolling, so the step on the reading line stays.
      await chapter
        .locator(`.part-name[data-part="${tool}"]`)
        .first()
        .evaluate((el) => {
          (el as HTMLElement).focus({ preventScroll: true });
        });
      await expect(figure).toHaveAttribute("data-focus", tool);
      const { lit, movement } = await benchLit(page);
      expect(lit, `${tool} alone in colour`).toEqual([tool]);
      expect(movement, "the movement lights only with its holder").toEqual(
        tool === "holder" ? [true, true] : [false, false],
      );
    }
    if (!phone) {
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await expect(figure).not.toHaveAttribute("data-focus");
      await chapter.getByRole("button", { name: "oil cup", exact: true }).hover();
      await expect(figure).toHaveAttribute("data-focus", "oil-cup");
      await page.mouse.move(2, 2);
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await expect(figure).not.toHaveAttribute("data-focus");
    }
  });

  test("the six steps light their tools in turn, and step 3 slides the loupe over the balance", async ({
    page,
  }, info) => {
    const phone = isPhone(info);
    await page.goto("/");
    const figure = page.locator("#bench-figure");
    const slide = page.locator("#bench-drawing .slide");
    for (const { step, lit } of BENCH_STEPS) {
      await readStepOf(page, "bench", step, phone);
      await expect(figure).toHaveAttribute("data-step", step);
      await expect.poll(async () => (await benchLit(page)).lit, `step ${step}'s tools`).toEqual(lit);
      if (step === "3") {
        await expect.poll(() => loupeOverBalance(page), "the lens over the balance").toBeLessThan(1.5);
      } else {
        await expect.poll(() => slide.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      }
    }
    await expect(page.locator('.contents-band a[href="#bench"]')).toHaveAttribute("aria-current", "true");
  });

  test("nothing on the bench moves on its own: no tray, no Pause, no running animation", async ({ page }, info) => {
    await page.goto("/");
    await readStepOf(page, "bench", "2", isPhone(info));
    const figure = page.locator("#bench-figure");
    await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
    await expect(figure.locator(".tray")).toBeHidden();
    await expect(figure.getByRole("button")).toHaveCount(0);
    await page.waitForTimeout(600);
    const running = await figure.evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
    await expect(
      page.locator("#bench").getByRole("link", { name: "Next chapter 7. Repairs", exact: true }),
    ).toHaveAttribute("href", "#repairs");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the loupe jumps to the balance, and back", async ({ page }, info) => {
      const phone = isPhone(info);
      await page.goto("/");
      const slide = page.locator("#bench-drawing .slide");
      expect(await slide.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
      await readStepOf(page, "bench", "3", phone);
      await expect(page.locator("#bench-figure")).toHaveAttribute("data-step", "3");
      expect(await loupeOverBalance(page)).toBeLessThan(1.5);
      await readStepOf(page, "bench", "4", phone);
      await expect(page.locator("#bench-figure")).toHaveAttribute("data-step", "4");
      expect(await slide.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    });
  });
});

test.describe("chapters 3 and 4 without scripting", () => {
  test.use({ javaScriptEnabled: false });

  test("read in full beside their still drawings, the trays hidden, the pagers on to chapters 4 and 5", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#escapement .step p")).toHaveCount(5);
    await expect(page.locator("#balance .step p")).toHaveCount(5);
    for (const step of await page.locator("#escapement .step p, #balance .step p").all())
      await expect(step).toBeVisible();
    await expect(page.getByRole("img", { name: /^Diagram of the escapement close up/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /^Diagram of the balance close up/ })).toBeVisible();
    // Built at step 1's moment: locked, one tooth on.
    expect(await drawn(page, "escapement-drawing", "escape")).toBe(24);
    for (const id of ["escapement", "balance"]) await expect(page.locator(`#${id}-figure .tray`)).toBeHidden();
    await expect(
      page.locator("#escapement").getByRole("link", { name: "Next chapter 4. Balance, six swings a second" }),
    ).toBeVisible();
    await expect(
      page.locator("#balance").getByRole("link", { name: "Next chapter 5. Together, apart and back again" }),
    ).toBeVisible();
  });
});

// A short screen in one column, a phone turned sideways, and a small laptop window: the sticky figure must leave the
// step on the reading line readable. Both sizes take the one-column reading line, whichever project runs them.
for (const viewport of [
  { width: 844, height: 390 },
  { width: 1000, height: 600 },
]) {
  test.describe(`chapter 1 at ${viewport.width} x ${viewport.height}`, () => {
    test.use({ viewport });

    test("each step's text sits below the sticky figure as it reaches the reading line", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      for (const { step } of POSES) {
        await readStep(page, step, true);
        await expect(page.locator("#energy-figure")).toHaveAttribute("data-step", step);
        const where = await page.evaluate((n) => {
          const text = document.querySelector(`#energy .step[data-step="${n}"] p`)?.getBoundingClientRect();
          const stage = document.querySelector("#energy-figure")?.getBoundingClientRect();
          const head = document.querySelector(".site-head")?.getBoundingClientRect();
          return { text: text?.top ?? 0, stage: stage?.bottom ?? Infinity, head: head?.bottom ?? Infinity };
        }, step);
        expect(where.text, `step ${step}'s text clears the figure`).toBeGreaterThanOrEqual(where.stage);
        if (viewport.height < 512) expect(where.head, "the header has scrolled away").toBeLessThanOrEqual(0);
      }
    });
  });
}

/**
 * Scrolls through a chapter's steps a few pixels at a time, down to its end and back up, and records each change of
 * the figure's step as it happens: which way the page was going, and where the new step and the figure stood.
 */
async function sweepSteps(page: Page, chapter: string) {
  return page.evaluate(async (id) => {
    const figure = document.querySelector<HTMLElement>(`#${id}-figure`);
    const steps = document.querySelector(`#${id} .steps`);
    if (!figure || !steps) return [];
    const frame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    let going = "down";
    let last = figure.dataset.step;
    const changes: { step: string; going: string; text: number; foot: number; figure: number }[] = [];
    new MutationObserver(() => {
      const n = figure.dataset.step ?? "";
      if (n === last) return;
      last = n;
      const step = document.querySelector(`#${id} .step[data-step="${n}"]`);
      changes.push({
        step: n,
        going,
        text: step?.querySelector("p")?.getBoundingClientRect().top ?? NaN,
        foot: step?.getBoundingClientRect().bottom ?? NaN,
        figure: figure.getBoundingClientRect().bottom,
      });
    }).observe(figure, { attributeFilter: ["data-step"] });
    const by = 12;
    const top = steps.getBoundingClientRect().top + scrollY - innerHeight;
    const end = steps.getBoundingClientRect().bottom + scrollY - innerHeight / 2;
    scrollTo(0, top);
    await frame();
    for (let y = top; y <= end; y += by) {
      scrollTo(0, y);
      await frame();
    }
    going = "up";
    for (let y = end; y >= top; y -= by) {
      scrollTo(0, y);
      await frame();
    }
    return changes;
  }, chapter);
}

// On a short screen in one column the sticky figure reaches past 64% of the screen, where the phone's reading line
// sits: at 1000 x 600 it ends at 411 px, at 667 x 375 at 272 px. The reading line starts under the figure's foot
// there, so a step becomes active only where it shows: going down, its text is below the figure; going back up, the
// step above takes over only once it comes out from under the figure.
for (const viewport of [
  { width: 1000, height: 600 },
  { width: 667, height: 375 },
]) {
  test.describe(`the reading line at ${viewport.width} x ${viewport.height}`, () => {
    test.use({ viewport });

    test("sits under the sticky figure: a step becomes active only where it shows below it", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const changes = await sweepSteps(page, "energy");
      expect(changes.filter((c) => c.going === "down").map((c) => c.step)).toEqual(["2", "3", "4"]);
      expect(changes.filter((c) => c.going === "up").map((c) => c.step)).toEqual(["3", "2", "1"]);
      for (const c of changes) {
        if (c.going === "down") expect(c.text, `step ${c.step}'s text, going down`).toBeGreaterThanOrEqual(c.figure);
        else expect(c.foot, `step ${c.step}'s foot, going up`).toBeGreaterThan(c.figure);
      }
    });
  });
}

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled: false });

  test("chapter 1 reads in full, its figure is still, and its tray shows no control", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator("#energy .step p");
    await expect(steps).toHaveCount(4);
    for (const step of await steps.all()) await expect(step).toBeVisible();
    await expect(steps.nth(0)).toContainText("Everything here runs on one coiled spring, the mainspring.");
    await expect(steps.nth(3)).toContainText("Chapter 3 shows what holds it back.");
    await expect(page.getByRole("img", { name: /^Diagram of the barrel, opened/ })).toBeVisible();
    expect(await figureAnimations(page)).toEqual([]);
    await expect(page.locator("#energy-figure .tray")).toBeHidden();
    await expect(page.getByRole("radio")).toHaveCount(0);
    await expect(page.getByRole("slider")).toHaveCount(0);
    await expect(page.locator("#energy-figure").getByRole("button")).toHaveCount(0);
    // A hint points at a control that isn't there without scripting, so it is hidden too.
    await expect(page.locator("#energy .try")).toHaveCount(2);
    for (const hint of await page.locator("#energy .try").all()) await expect(hint).toBeHidden();
    await expect(page.locator("#energy").getByRole("link", { name: "Back to Contents" })).toBeVisible();
  });

  test("chapter 2 reads in full, its back shows still, and its tray shows no control", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator("#wheels .step p");
    await expect(steps).toHaveCount(5);
    for (const step of await steps.all()) await expect(step).toBeVisible();
    await expect(page.getByRole("img", { name: /^Diagram of the going train/ })).toBeVisible();
    await expect(page.locator("#wheels-dial")).toBeHidden();
    await expect(page.locator("#wheels-figure .tray")).toBeHidden();
    await expect(
      page.locator("#wheels").getByRole("link", { name: "Next chapter 3. Escapement, let out tooth by tooth" }),
    ).toBeVisible();
  });

  test("chapter 5 reads beside its still poster, the whole movement, with no canvas and no control", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#together .step p")).toHaveCount(7);
    await expect(page.locator("#together .step p").first()).toBeVisible();
    await expect(page.getByRole("img", { name: /^Diagram of the whole movement assembled/ })).toBeVisible();
    await expect(page.locator("#together canvas, #together .turn-3d")).toHaveCount(0);
    await expect(page.locator("#together-figure .tray")).toBeHidden();
    await expect(page.locator("#together .parts-list")).toBeHidden();
  });

  test("chapter 6 reads in full beside the whole bench, with no tray, on to chapter 7", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator("#bench .step p");
    await expect(steps).toHaveCount(6);
    for (const step of await steps.all()) await expect(step).toBeVisible();
    await expect(steps.nth(0)).toContainText("This is Tavi’s bench from above");
    const drawing = page.getByRole("img", { name: /^Diagram of Tavi’s bench from above/ });
    await expect(drawing).toBeVisible();
    await expect(drawing).toHaveAttribute("id", "bench-drawing");
    // Step 1's pose, the whole bench in colour; every tool is named in the prose.
    expect((await benchLit(page)).lit).toEqual(TOOLS);
    for (const tool of TOOLS)
      await expect(page.locator(`#bench .part-name[data-part="${tool}"]`).first()).toBeVisible();
    await expect(page.locator("#bench-figure .tray")).toBeHidden();
    await expect(page.locator("#bench").getByRole("link", { name: "Next chapter 7. Repairs" })).toBeVisible();
  });

  test("the hero's drawing is in the HTML, labelled, still", async ({ page }) => {
    await page.goto("/");
    const drawing = page.getByRole("img", { name: /^Diagram of a wristwatch movement seen from the back/ });
    await expect(drawing).toBeVisible();
    await expect(drawing).toHaveAttribute("id", "hero-movement");
    await expect(drawing.locator(".callout text")).toHaveText(["Barrel", "Wheel train", "Balance", "Escape wheel"]);
    expect(await heroAnimations(page)).toEqual([]);
  });

  test("the Pause and the Chapters button are not shown, and the chapters are all there", async ({ page }, info) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bjs\b/);
    await expect(page.locator("[data-toggle-play]")).toBeHidden();
    await expect(page.getByRole("button", { name: "Chapters", exact: true })).toBeHidden();
    if (!isPhone(info)) await expect(page.locator("header nav a")).toHaveCount(CHAPTERS.length);
    for (const id of CHAPTERS) await expect(page.locator(`#${id}`)).toHaveCount(1);
    const band = page.getByRole("navigation", { name: "Chapters, with what each one shows" });
    for (const id of CHAPTERS) await expect(band.locator(`a[href="#${id}"]`)).toBeVisible();
  });
});

test("every request stays on the origin, and the only fonts are Newsreader and IBM Plex Mono", async ({ page }) => {
  const requests: { url: string; type: string }[] = [];
  page.on("request", (request) => requests.push({ url: request.url(), type: request.resourceType() }));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const origin = new URL(page.url()).origin;
  const away = requests.filter((r) => !r.url.startsWith("data:") && new URL(r.url).origin !== origin);
  expect(away.map((r) => r.url)).toEqual([]);
  const fonts = requests.filter((r) => r.type === "font").map((r) => r.url);
  expect(fonts.filter((url) => !/newsreader|ibm-plex-mono/.test(url))).toEqual([]);
  expect(
    fonts.some((url) => url.includes("newsreader")),
    "a Newsreader face loads",
  ).toBe(true);
});

// The ticking sound, off until the Sound toggle is pressed, and chapter 5's Wind. The sound counts the ticks it has
// scheduled in `window.taviSound` in development builds.
test.describe("the ticking sound", () => {
  /** Counts every AudioContext the page makes, so a test can say none exists before the first press. */
  async function spyOnAudio(page: Page) {
    await page.addInitScript(() => {
      const w = window as unknown as { AudioContext: typeof AudioContext; madeContexts: number };
      w.madeContexts = 0;
      const Real = w.AudioContext;
      w.AudioContext = class extends Real {
        constructor(...args: ConstructorParameters<typeof AudioContext>) {
          super(...args);
          w.madeContexts += 1;
        }
      };
    });
  }
  const made = (page: Page) => page.evaluate(() => (window as unknown as { madeContexts: number }).madeContexts);
  const ticks = (page: Page) =>
    page.evaluate(() => (window as unknown as { taviSound?: { ticks: number } }).taviSound?.ticks ?? 0);
  const toggle = (page: Page) => page.locator("[data-toggle-sound]");

  test("is off on every visit: no audio object and no sound module until the toggle is pressed", async ({ page }) => {
    await spyOnAudio(page);
    const asked: string[] = [];
    page.on("request", (request) => {
      if (/lib\/sound/.test(request.url())) asked.push(request.url());
    });
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(toggle(page)).toHaveAccessibleName("Sound");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    expect(await made(page)).toBe(0);
    expect(asked).toEqual([]);
    expect(await ticks(page)).toBe(0);

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    expect(await made(page)).toBe(1);
    await expect.poll(() => ticks(page)).toBeGreaterThan(0);
    expect(asked.length).toBeGreaterThan(0);
    // Nothing is kept: a reload starts off again.
    await page.reload();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    expect(await made(page)).toBe(0);
  });

  test("ticks six times a second at 1×, none while paused, and a second press stops it", async ({ page }) => {
    await page.goto("/");
    // The 3D movement loads on idle; let it settle, as a visitor reading the first screen would.
    await page.waitForTimeout(3000);
    await toggle(page).click();
    await expect.poll(() => ticks(page)).toBeGreaterThan(0);
    const sample = () =>
      page.evaluate(() => ({
        n: (window as unknown as { taviSound?: { ticks: number } }).taviSound?.ticks ?? 0,
        at: performance.now(),
      }));
    const from = await sample();
    await page.waitForTimeout(3000);
    const to = await sample();
    const rate = ((to.n - from.n) / (to.at - from.at)) * 1000;
    expect(rate, "ticks a second").toBeGreaterThan(5);
    expect(rate, "ticks a second").toBeLessThan(7.2);

    await page.locator("[data-toggle-play]").click();
    await page.waitForTimeout(400);
    const paused = await ticks(page);
    await page.waitForTimeout(1000);
    expect(await ticks(page), "no tick while paused").toBe(paused);
    await page.locator("[data-toggle-play]").click();
    await expect.poll(() => ticks(page)).toBeGreaterThan(paused);

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(300);
    const stopped = await ticks(page);
    await page.waitForTimeout(1000);
    expect(await ticks(page), "no tick after the second press").toBe(stopped);
  });

  test("follows the speed: about 0.6 a second at 1/10", async ({ page }, info) => {
    test.skip(isPhone(info), "the tray's speed is read on the desktop layout");
    await page.goto("/#escapement");
    await page.locator("#balance").scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      document.getElementById("balance")?.scrollIntoView({ block: "center" });
    });
    await toggle(page).click();
    await expect.poll(() => ticks(page), { timeout: 10_000 }).toBeGreaterThan(0);
    await page.evaluate(() => {
      document.getElementById("balance-figure")?.style.setProperty("--slow", "10");
    });
    await page.waitForTimeout(500);
    const from = await ticks(page);
    await page.waitForTimeout(5000);
    const rate = ((await ticks(page)) - from) / 5;
    expect(rate, "ticks a second at 1/10").toBeGreaterThan(0.4);
    expect(rate, "ticks a second at 1/10").toBeLessThan(0.9);
  });

  test("the toggle is not offered without scripting", async ({ browser }, info) => {
    const context = await browser.newContext({ baseURL: info.project.use.baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-toggle-sound]")).toBeHidden();
    await context.close();
  });
});

test.describe("chapter 5's Wind", () => {
  test.beforeEach(({ page: _page }, info) => {
    test.skip(isPhone(info), "the 3D view is a desktop's here");
  });

  test("winds the 3D spring and steps the ratchet wheel a tooth at a time, and the readout and the voice agree", async ({
    page,
  }) => {
    await page.goto("/");
    await toTogether(page);
    await glLive(page, "together");
    const wind = page.locator("#together-figure").getByRole("slider", { name: "Wind" });
    await expect(wind).toHaveAttribute("aria-valuenow", "100");
    await expect(page.locator("#together-figure .tray")).toContainText("41:00 of 41 h");
    await wind.focus();
    await page.keyboard.press("Home");
    await expect(wind).toHaveAttribute("aria-valuetext", "Wound to 0 of 41 hours");
    await expect(page.locator("#together-figure .tray")).toContainText("0:00 of 41 h");
    const down = await glPose(page, "together", { apart: 1 });
    expect(down.reserve).toBe(0);
    expect(down.spring).toBe(0);
    expect(down.ratchet).toBeLessThan(0);
    await page.keyboard.press("End");
    await expect(page.locator("#together-figure .tray")).toContainText("41:00 of 41 h");
    const up = await glStats(page, "together");
    expect(up.spring).toBe(1);
    expect(up.ratchet).toBe(0);
    // One slider step is 0.41 h: the ratchet wheel is whole teeth at every value between.
    const teeth = new Set<number>();
    await wind.focus();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("ArrowLeft");
      teeth.add((await glStats(page, "together")).ratchet);
    }
    expect(teeth.size).toBeGreaterThan(1);
    for (const n of teeth) expect(Number.isInteger(n)).toBe(true);
  });

  test("the reserve falls in real time at 1×, and a spring let down stills the balance", async ({ page }) => {
    await page.goto("/");
    await toTogether(page);
    await glLive(page, "together");
    await page.evaluate(() => {
      document.getElementById("together-figure")?.removeAttribute("data-hold");
    });
    await glPose(page, "together", { reserve: 10 });
    await page.locator("[data-toggle-play]").evaluate((el) => {
      if (el.getAttribute("aria-pressed") === "true") (el as HTMLButtonElement).click();
    });
    await page.waitForTimeout(3000);
    const after = await glStats(page, "together");
    const used = 10 - after.reserve;
    expect(used, "hours used in about three seconds").toBeGreaterThan(1.5 / 3600);
    expect(used, "hours used in about three seconds").toBeLessThan(4.5 / 3600);
    // A full spring swings wider than a low one.
    const swing = async (reserve: number) => {
      let widest = 0;
      for (const t of [0, 0.5 / 6]) {
        const s = await glPose(page, "together", { reserve, t: t + 10 * 3600 });
        widest = Math.max(widest, Math.abs(s.balance));
      }
      return widest;
    };
    expect(await swing(41)).toBeGreaterThan(await swing(5));
    const still = await glPose(page, "together", { reserve: 0, t: 3 / 6 + 7 });
    expect(still.balance).toBe(0);
    await page.waitForTimeout(400);
    expect((await glStats(page, "together")).t, "the clock stands with no power").toBe(still.t);
  });
});
