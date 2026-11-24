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
    await expect(page.locator("#energy-figure").getByRole("button")).toHaveCount(0);
    await expect(page.locator("#energy").getByRole("link", { name: "Back to Contents" })).toBeVisible();
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
