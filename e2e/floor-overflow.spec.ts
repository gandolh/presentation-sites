import { expect, test } from "@playwright/test";
import { isPhone, pagesOf } from "./floor.js";

// Floor: no horizontal scroll at 390 px, on every page the home page links to.
test("no page scrolls sideways at 390 px", async ({ page }, info) => {
  test.skip(!isPhone(info), "the 390 px check runs on the phone project");
  for (const path of await pagesOf(page)) {
    await page.goto(path);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, `${path} overflows by ${over}px`).toBeLessThanOrEqual(0);
  }
});
