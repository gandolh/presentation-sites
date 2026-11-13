import type { Page, TestInfo } from "@playwright/test";

// What every Floor spec shares: which pages to walk, and the page-side colour maths. Copied from the root sites'
// Floor checks (their e2e folder is a workspace of the sites, churchix is its own project).

export function isPhone(info: TestInfo): boolean {
  return info.project.metadata["device"] === "phone";
}

/** `page.goto`, once more if a cold dev server cut the first load off while Vite re-optimized its dependencies. */
export async function open(page: Page, path: string): Promise<void> {
  await page.goto(path).catch(async () => {
    await page.waitForTimeout(2000);
    await page.goto(path);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300); // a Vite re-optimization reloads the page once more, right after the first load
  await page.waitForLoadState("networkidle");
}

/** The home page plus every same-site page its links reach, with no fragment, at most `limit` of them. */
export async function pagesOf(page: Page, limit = 12): Promise<string[]> {
  await open(page, "/");
  const origin = new URL(page.url()).origin;
  const hrefs = await page.evaluate((o) => {
    const found = new Set<string>();
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const url = new URL(a.href, document.baseURI);
      if (url.origin !== o || !/^https?:$/.test(url.protocol)) continue;
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) continue;
      found.add(url.pathname);
    }
    return [...found];
  }, origin);
  return [new URL(page.url()).pathname, ...hrefs.filter((h) => h !== new URL(page.url()).pathname)].slice(0, limit);
}

/** Page-side helpers as one string, for `page.evaluate` bodies that cannot import. */
export const COLOR_MATHS = `
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (css) => {
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = "#000";
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (top, under) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat([1]);
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const backdrop = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] === 1) break;
    }
    let out = rgba(getComputedStyle(document.documentElement).backgroundColor);
    if (out[3] === 0) out = [255, 255, 255, 1];
    for (const l of layers.reverse()) out = over(l, out);
    return out;
  };
`;
