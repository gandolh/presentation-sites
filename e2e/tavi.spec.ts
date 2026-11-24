import { expect, test, type Page } from "@playwright/test";
import { isPhone, siteOf } from "./floor.js";

// tavi's own checks: every header link lands on its chapter, the global Pause drives the page's play state, reduced
// motion starts paused, the hero's drawing ticks at the movement's rate only while the page plays, nothing works only
// with scripting, and no request leaves the origin. The chapter briefs
// extend it. The Floor specs are shared (floor-*.spec.ts); the phone menu's behaviour is in mobile-menu.spec.ts.
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
    await page.getByRole("link", { name: "Tavi Ceasornicaru, back to the top" }).click();
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
