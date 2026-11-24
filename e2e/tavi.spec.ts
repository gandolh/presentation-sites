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

test.describe("the global Pause", () => {
  test("flips data-playing on the page and its label", async ({ page }, info) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-playing", "true");
    const pause = page.getByRole("button", { name: "Pause every moving drawing" });
    await expect(pause).toBeVisible();
    // Below 40rem the button shows its icon only; its name still says what it does.
    if (!isPhone(info)) await expect(pause).toHaveText("Pause", { useInnerText: true });

    await pause.click();
    await expect(html).toHaveAttribute("data-playing", "false");
    const play = page.getByRole("button", { name: "Play every moving drawing" });
    await expect(play).toBeVisible();
    if (!isPhone(info)) await expect(play).toHaveText("Play", { useInnerText: true });

    await play.click();
    await expect(html).toHaveAttribute("data-playing", "true");
    await expect(page.getByRole("button", { name: "Pause every moving drawing" })).toBeVisible();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the page loads paused, and Play still plays", async ({ page }) => {
      await page.goto("/");
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-playing", "false");
      await page.getByRole("button", { name: "Play every moving drawing" }).click();
      await expect(html).toHaveAttribute("data-playing", "true");
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

    await page.getByRole("button", { name: "Pause every moving drawing" }).click();
    expect(await heroAnimations(page)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("nothing turns until Play sets data-playing to true", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#hero-movement")).toBeVisible();
      await page.waitForTimeout(300);
      expect(await heroAnimations(page)).toEqual([]);
      await page.getByRole("button", { name: "Play every moving drawing" }).click();
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

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled: false });

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
