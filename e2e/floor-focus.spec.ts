import { expect, test } from "@playwright/test";
import { COLOR_MATHS, pagesOf } from "./floor.js";

// Floor: a visible focus ring on every interactive element, from a keyboard pass, and the ring must stand out from
// what is behind it (3:1, the non-text minimum).
test("every tab stop shows a focus ring of at least 3:1", async ({ page }) => {
  for (const path of await pagesOf(page)) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const problems: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 150; i++) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(`(() => {
        ${COLOR_MATHS}
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const label = el.tagName.toLowerCase() + (el.getAttribute("href") ? "[" + el.getAttribute("href") + "]" : "") + (el.getAttribute("aria-label") ? "(" + el.getAttribute("aria-label") + ")" : "") + ":" + (el.textContent || "").trim().slice(0, 24);
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const skip = el.classList.contains("sr-only");
        const hasOutline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
        let ring = hasOutline ? cs.outlineColor : null;
        if (!ring && cs.boxShadow !== "none") {
          const m = cs.boxShadow.match(/(rgba?\\([^)]*\\)|oklch\\([^)]*\\)|color\\([^)]*\\))/);
          ring = m ? m[1] : null;
        }
        const ratioVal = ring ? ratio(over(rgba(ring), backdrop(el.parentElement || el)), backdrop(el.parentElement || el)) : 0;
        return { label, skip, hasRing: !!ring, ratio: ratioVal, visible: r.width > 0 && r.height > 0 };
      })()`);
      if (!stop) break;
      const s = stop as { label: string; skip: boolean; hasRing: boolean; ratio: number; visible: boolean };
      if (seen.has(s.label)) break;
      seen.add(s.label);
      if (s.skip) continue;
      if (!s.visible) problems.push(`${s.label}: focused but not visible`);
      else if (!s.hasRing) problems.push(`${s.label}: no focus ring`);
      else if (s.ratio < 3) problems.push(`${s.label}: ring contrast ${s.ratio.toFixed(2)}`);
    }
    expect(seen.size, `${path} has no tab stops`).toBeGreaterThan(0);
    expect(problems, `${path} focus problems`).toEqual([]);
  }
});
