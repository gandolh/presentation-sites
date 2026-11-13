import { expect, test } from "@playwright/test";
import { open, pagesOf } from "./floor.js";

// Floor: with prefers-reduced-motion on, nothing loops and nothing large moves.
test.use({ reducedMotion: "reduce" });

test("reduced motion leaves no looping animation and no smooth scrolling", async ({ page }) => {
  for (const path of await pagesOf(page)) {
    await open(page, path);
    await page.waitForTimeout(500);
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => {
          const t = a.effect?.getComputedTiming();
          return a.playState === "running" && (t?.iterations === Infinity || (t?.duration as number) > 1000);
        })
        .map((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.className ?? "?"),
    );
    expect(running, `${path} runs a looping or long animation`).toEqual([]);
    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(behavior, `${path} scrolls smoothly`).toBe("auto");
  }
});
