import { expect, test, type Page } from "@playwright/test";
import { isPhone, siteOf } from "./floor.js";

// The job card's own behaviour: the open-now window, and the phone call bar that appears once the card's call has
// left the view. auto-service only.
test.beforeEach(({ browserName: _browser }, info) => {
  test.skip(siteOf(info) !== "auto-service", "the job card is auto-service's");
});

const WED_NOON = new Date("2026-11-11T12:00:00+02:00"); // inside Luni-Vineri 08:00-18:00
const SUN_NOON = new Date("2026-11-15T12:00:00+02:00"); // Duminica: closed
const WED_NIGHT = new Date("2026-11-11T21:00:00+02:00"); // after closing

async function windowAt(page: Page, time: Date) {
  await page.clock.install({ time });
  await page.goto("/");
  return page.locator(".card .hours");
}

test.describe("the readout window", () => {
  test("shows the green dot and Deschis acum inside the hours", async ({ page }) => {
    const win = await windowAt(page, WED_NOON);
    await expect(win.getByText("Deschis acum")).toBeVisible();
    await expect(win.getByText("Târgu-Jiu, Gorj")).toBeVisible();
    await expect(win.getByText("L‒V 08:00‒18:00")).toBeVisible();
  });

  for (const [name, time] of [
    ["on a closed day", SUN_NOON],
    ["after closing", WED_NIGHT],
  ] as const) {
    test(`keeps the town and the hours, with no Deschis acum, ${name}`, async ({ page }) => {
      const win = await windowAt(page, time);
      await expect(win.getByText("Deschis acum")).toBeHidden();
      await expect(win.getByText("Târgu-Jiu, Gorj")).toBeVisible();
      await expect(win.getByText("Sâ 09:00‒14:00")).toBeVisible();
    });
  }

  test("keeps the town with scripts off", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto("/");
    const win = page.locator(".card .hours");
    await expect(win.getByText("Deschis acum")).toBeHidden();
    await expect(win.getByText("Târgu-Jiu, Gorj")).toBeVisible();
    await context.close();
  });
});

test.describe("the phone call bar", () => {
  test.beforeEach(({ browserName: _browser }, info) => {
    test.skip(!isPhone(info), "the bar is a phone control");
  });

  test("appears once the card's call has left the view and hides at the contact block", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("[data-call-bar]");
    await expect(page.locator("[data-call-card]")).toBeInViewport();
    await expect(bar).toBeHidden();

    await page.locator(".sec", { has: page.locator("#why-title") }).scrollIntoViewIfNeeded();
    await expect(page.locator("[data-call-card]")).not.toBeInViewport();
    await expect(bar).toBeVisible();

    await page.locator("[data-call-own]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-call-own]")).toBeInViewport();
    await expect(bar).toBeHidden();
  });

  test("stays visible with scripts off", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-call-bar]")).toBeVisible();
    await context.close();
  });

  for (const [width, height] of [
    [390, 844],
    [360, 800],
  ] as const) {
    test(`the first screen at ${width}x${height} holds the window, the call, WhatsApp and three symptom rows`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.clock.install({ time: WED_NOON });
      await page.goto("/");
      const parts = [
        page.locator(".card .hours"),
        page.locator(".card .call"),
        page.locator(".card .wab"),
        ...(await page.locator(".card .sym li").all()),
      ];
      expect(parts).toHaveLength(6);
      for (const part of parts) {
        const box = await part.boundingBox();
        if (!box) throw new Error("a part of the card has no box");
        expect(box.y + box.height).toBeLessThanOrEqual(height);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await expect(page.locator("[data-call-bar]")).toBeHidden();
    });
  }
});
