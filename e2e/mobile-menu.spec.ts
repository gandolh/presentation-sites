import { expect, test, type Locator, type Page } from "@playwright/test";

// What differs between the four phone menus. The three full-screen panels
// have no page outside them to tap; subcort's hangs under its header.
const menus: Record<string, { dialog: string; closeButton: boolean; outsideTap: boolean }> = {
  "auto-service": { dialog: "Meniu de navigare", closeButton: true, outsideTap: false },
  saloon: { dialog: "Meniu de navigare", closeButton: true, outsideTap: false },
  subcort: { dialog: "Meniu", closeButton: false, outsideTap: true },
  tractari: { dialog: "Meniu de navigare", closeButton: true, outsideTap: false },
};

function menuFor(site: string) {
  const menu = menus[site];
  if (!menu) throw new Error(`no menu described for ${site}`);
  return menu;
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("the element has no box");
  return box;
}

async function ready(page: Page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      document.querySelector('astro-island[component-url*="MobileMenu"]') !== null &&
      document.querySelector('astro-island[component-url*="MobileMenu"][ssr]') === null,
  );
}

async function openMenu(page: Page, dialogName: string) {
  const trigger = page.getByRole("button", { name: "Deschide meniul" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: dialogName });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

// A finger drag along the vertical axis. A mouse drag does not swipe a Base UI
// Drawer, only touch does, so the touch events go through the protocol.
async function swipeUp(page: Page, x: number, fromY: number, toY: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: fromY }] });
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const y = fromY + ((toY - fromY) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("the phone menu", () => {
  test.beforeEach(async ({ page }) => {
    await ready(page);
  });

  test("closes on Esc and gives focus back to the menu button", async ({ page }, info) => {
    const { trigger, dialog } = await openMenu(page, menuFor(info.project.name).dialog);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on its X and gives focus back to the menu button", async ({ page }, info) => {
    const menu = menuFor(info.project.name);
    const { trigger, dialog } = await openMenu(page, menu.dialog);
    // Subcort has no X in the panel: its menu button turns into one. The
    // drawer makes the page behind it inert, so the button is no longer in the
    // accessibility tree and a press on it is a press outside.
    await (
      menu.closeButton
        ? dialog.getByRole("button", { name: "Închide meniul" })
        : page.locator("header button", { hasText: "Închide meniul" })
    ).click({ force: true });
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a tap outside", async ({ page }, info) => {
    const menu = menuFor(info.project.name);
    test.skip(!menu.outsideTap, "the panel fills the screen: there is nothing outside it to tap");
    const { trigger, dialog } = await openMenu(page, menu.dialog);
    const box = await boxOf(dialog);
    await page.touchscreen.tap(195, Math.min(box.y + box.height + 120, 800));
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a swipe up and gives focus back to the menu button", async ({ page }, info) => {
    const { trigger, dialog } = await openMenu(page, menuFor(info.project.name).dialog);
    await page.waitForTimeout(600);
    const box = await boxOf(dialog);
    const mid = box.y + box.height / 2;
    await swipeUp(page, 5, mid, mid - box.height * 0.7);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a link inside the menu closes it", async ({ page }, info) => {
    const { dialog } = await openMenu(page, menuFor(info.project.name).dialog);
    await dialog.getByRole("link").first().click();
    await expect(dialog).toBeHidden();
  });

  test("has no horizontal scroll at 390 px, shut or open", async ({ page }, info) => {
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await openMenu(page, menuFor(info.project.name).dialog);
    expect(await overflow()).toBeLessThanOrEqual(0);
  });
});
