import { expect, test } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { COLOR_MATHS } from "./floor.js";
import { applyVariant, type Variant } from "./shapes.js";

// Floor: text contrast of at least 4.5:1 (3:1 for large text), and 3:1 for icons, measured over the BUILT pages.
// Build the parish site first (`npm run build -w apps/parohia-harlesti-bacau`), then run this spec. The check
// serves its `dist` itself, so the numbers are those of the shipped CSS. It runs once for the parish's seeds and
// once with the second parish's (blue and silver) laid over them.
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json",
};

let server: Server;
let origin = "";
let root = "";

test.beforeAll(async ({ browserName: _browser }, info) => {
  root = join(info.config.rootDir, "..", "apps", "parohia-harlesti-bacau", "dist");
  if (!existsSync(join(root, "index.html"))) throw new Error(`no build at ${root}: run the site's build first`);
  server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/"));
    let file = join(root, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(root) || !existsSync(file)) {
      const missing = join(root, "404.html");
      res
        .writeHead(404, { "content-type": types[".html"] ?? "text/html" })
        .end(existsSync(missing) ? readFileSync(missing) : "");
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  origin = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
});

test.afterAll(() => {
  server.close();
});

interface Finding {
  where: string;
  ratio: number;
  need: number;
  kind: "text" | "icon";
}

for (const variant of ["parish", "seed2"] as Variant[])
  test(`every text and icon pair clears its contrast minimum, ${variant} seeds`, async ({ page }, info) => {
    const pages = ["/", "/nu-exista"];
    await page.goto(origin + "/");
    const links = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .map((a) => new URL(a.href, document.baseURI))
        .filter((u) => u.origin === location.origin && !/\.[a-z0-9]{2,5}$/i.test(u.pathname))
        .map((u) => u.pathname),
    );
    for (const l of links) if (!pages.includes(l)) pages.push(l);

    let minText = Infinity;
    let minIcon = Infinity;
    const failures: string[] = [];
    for (const path of pages) {
      await page.goto(origin + path);
      await page.waitForLoadState("networkidle");
      await applyVariant(page, variant);
      const found = await page.evaluate<Finding[]>(`(() => {
      ${COLOR_MATHS}
      const out = [];
      const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
      for (const el of document.querySelectorAll("body *")) {
        if (!visible(el) || el.closest("[hidden], [inert], .sr-only")) continue;
        const cs = getComputedStyle(el);
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
        const where = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "") + ":" + (el.textContent || "").trim().slice(0, 28);
        if (own && !el.matches(":disabled")) {
          const bg = backdrop(el);
          const fg = over(rgba(cs.color), bg);
          const size = parseFloat(cs.fontSize);
          const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
          out.push({ where, ratio: ratio(fg, bg), need: large ? 3 : 4.5, kind: "text" });
        }
        if (el.tagName.toLowerCase() === "svg" && cs.color) {
          const bg = backdrop(el);
          const fg = over(rgba(cs.color), bg);
          out.push({ where, ratio: ratio(fg, bg), need: 3, kind: "icon" });
        }
      }
      return out;
    })()`);
      for (const f of found) {
        if (f.kind === "text") minText = Math.min(minText, f.ratio);
        else minIcon = Math.min(minIcon, f.ratio);
        if (f.ratio < f.need) failures.push(`${path} ${f.kind} ${f.where}: ${f.ratio.toFixed(2)} < ${f.need}`);
      }
    }
    console.log(
      `${info.project.name} ${variant}: lowest text ${minText.toFixed(2)}:1, lowest icon ${minIcon.toFixed(2)}:1`,
    );
    expect(failures).toEqual([]);
  });
