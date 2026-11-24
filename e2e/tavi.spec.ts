import { expect, test, type Page } from "@playwright/test";
import { isPhone, siteOf } from "./floor.js";

// tavi's own checks: every header link lands on its chapter, the global Pause drives the page's play state, reduced
// motion starts paused, the hero's drawing ticks at the movement's rate only while the page plays, the first screen
// holds the hero and keeps the repair line off it, the contents band's links land and fold to two columns on a phone,
// the footer shows Tavi's line as a placeholder, nothing works only with scripting, and no request leaves the origin.
// The chapter briefs extend it. The Floor specs are shared (floor-*.spec.ts); the phone menu's behaviour is in mobile-menu.spec.ts.
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

test.describe("the hero's drawing", () => {
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
