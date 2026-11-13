import { expect, test, type Locator, type Page } from "@playwright/test";
import { isPhone } from "./floor.js";

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("the element has no box");
  return box;
}

async function ready(page: Page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      document.querySelector('astro-island[component-url*="MobileNav"]') !== null &&
      document.querySelector('astro-island[component-url*="MobileNav"][ssr]') === null,
  );
}

async function openMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "Deschide meniul" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Meniu" });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

// A finger drag along the vertical axis (down, for the sheet that rises from the bottom bar). A mouse drag does not swipe a Base UI Drawer, only touch does, so
// the touch events go through the protocol.
async function swipe(page: Page, x: number, fromY: number, toY: number) {
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
  test.beforeEach(async ({ page }, info) => {
    test.skip(!isPhone(info), "the bottom bar and its menu are on the phone project");
    await ready(page);
  });

  test("closes on Esc and gives focus back to the menu button", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on its X and gives focus back to the menu button", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    // The Meniu place of the bottom bar turns into the X. The drawer makes the page behind it inert, so a press
    // on it is a press outside, and the button is no longer in the accessibility tree.
    await page.locator('nav[aria-label="Locuri principale"] button[data-base-ui-click-trigger]').click({ force: true });
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a tap outside and gives focus back to the menu button", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    const box = await boxOf(dialog);
    await page.touchscreen.tap(60, Math.max(box.y - 120, 100));
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on its own close button and gives focus back to the menu button", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    await dialog.getByRole("button", { name: "Închide meniul" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a swipe down and gives focus back to the menu button", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    await page.waitForTimeout(600);
    const box = await boxOf(dialog);
    const mid = box.y + box.height / 2;
    await swipe(page, box.x + box.width / 2, mid, mid + box.height * 0.9);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a link inside the menu closes it, and focus goes on with the link", async ({ page }) => {
    const { trigger, dialog } = await openMenu(page);
    // Stay on the page: the link's navigation is not what is under test.
    await dialog
      .getByRole("link")
      .first()
      .evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
    await dialog.getByRole("link").first().click();
    await expect(dialog).toBeHidden();
    await expect(trigger).not.toBeFocused();
  });

  test("the bar has five places, the current one marked, and sits at the bottom edge", async ({ page }) => {
    const bar = page.getByRole("navigation", { name: "Locuri principale" });
    await expect(bar.getByRole("link")).toHaveCount(4);
    await expect(bar.getByRole("link", { name: "Acasă" })).toHaveAttribute("aria-current", "page");
    await expect(bar.getByRole("button", { name: "Deschide meniul" })).toBeVisible();
    const box = await boxOf(bar);
    expect(box.height).toBeGreaterThanOrEqual(64);
    expect(Math.round(box.y + box.height)).toBe(844);
  });

  test("has no horizontal scroll at 390 px, shut or open", async ({ page }) => {
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await openMenu(page);
    expect(await overflow()).toBeLessThanOrEqual(0);
  });
});
