// Generates the Open Graph card — the one image this site ships.
//
// It is the same drawing as the pages: the marquee in true isometric, with a
// dimension line and the sheet's title block. Nothing here is a photograph,
// because the site does not use photography.
//
// Social platforms refuse an SVG og:image, so the drawing is wrapped in
// scripts/og-card.html with the real self-hosted Commissioner and IBM Plex Mono faces (a rasterizer's
// fallback font would also guess at ș and ț), screenshotted by headless Chrome
// at 1200x630, and palette-encoded to public/images/og-image.png, well under
// the 300 KB WhatsApp accepts.
//
//   npm run subcort:og            (CHROME=/path/to/chrome to pick the binary)

import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { marquee, isometric, pts, tone, dimension, INK, LINE, SIGNAL, SHEET, FILL } from "../src/lib/draft.ts";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(scriptsDir, "..", "public", "images");

const W = 1200,
  H = 630;
const M = marquee();
const P = isometric({ scale: 14, cx: 950, cy: 300 });

// The site's tokens as hex (src/styles/global.css): the card cannot read a CSS variable.
const FIELD = "#dfe8de";
const GRID = "#d4ded3";
const EDGE = "#b5bdb5";
const INK2 = "#516069";

let g = "";
const deck = M.panels.find((p) => p.part === "deck");
g += `<polygon points="${pts(deck.quad, P)}" fill="${FILL}" stroke="${LINE}" stroke-width="1.1"/>`;
for (const [a, b] of M.members) {
  const [x1, y1] = P(a);
  const [x2, y2] = P(b);
  g += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`;
}
for (const p of M.panels.filter((p) => p.part !== "deck")) {
  g += `<polygon points="${pts(p.quad, P)}" fill="${tone(p.quad)}" fill-opacity="0.92" stroke="${LINE}" stroke-width="1" stroke-linejoin="round"/>`;
}
// the ridge, in the annotation colour
const r0 = P([0, M.spec.ridge, -M.hd]);
const r1 = P([0, M.spec.ridge, M.hd]);
g += `<line x1="${r0[0].toFixed(1)}" y1="${r0[1].toFixed(1)}" x2="${r1[0].toFixed(1)}" y2="${r1[1].toFixed(1)}" stroke="${SIGNAL}" stroke-width="1.8"/>`;
// the span, dimensioned
const d0 = P([-M.hw, 0, M.hd]);
const d1 = P([M.hw, 0, M.hd]);
g += dimension([d0[0], d0[1]], [d1[0], d1[1]], "15,0 m", { offset: -46, bg: FIELD });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse" x="-1" y="-1">
      <path d="M32 0V32M0 32H32" fill="none" stroke="${GRID}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${FIELD}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  ${g}
  <rect x="48.5" y="48.5" width="680" height="533" fill="${SHEET}" stroke="${EDGE}" stroke-width="1"/>
  <line x1="48" y1="48.75" x2="729" y2="48.75" stroke="${INK}" stroke-width="1.5"/>
  <g font-family="'Commissioner Variable',system-ui,sans-serif" fill="${INK}">
    <text x="84" y="110" font-size="24" font-weight="700" letter-spacing="0.24">SUBCORT</text>
    <text x="216" y="110" font-size="18" font-weight="500" fill="${INK2}">Gorj, Oltenia</text>
    <text x="84" y="196" font-size="54" font-weight="650" letter-spacing="-1.08">Un spațiu pregătit,</text>
    <text x="84" y="256" font-size="54" font-weight="650" letter-spacing="-1.08">oriunde ai nevoie</text>
    <text x="84" y="316" font-size="54" font-weight="650" letter-spacing="-1.08">de el.</text>
    <text x="84" y="376" font-size="20" font-weight="400" fill="${INK2}">Corturi pentru evenimente, montate la tine acasă.</text>
  </g>
  <line x1="84" y1="428" x2="693" y2="428" stroke="#dde1dd" stroke-width="1"/>
  <g font-family="'Commissioner Variable',system-ui,sans-serif" font-size="14" font-weight="500" fill="${INK2}">
    <text x="84" y="466">Deschidere</text>
    <text x="238" y="466">Suprafață</text>
    <text x="412" y="466">Capacitate</text>
    <text x="548" y="466">Montaj</text>
  </g>
  <g font-family="'IBM Plex Mono',monospace" font-size="20" font-weight="600" fill="${INK}">
    <text x="84" y="500">8‒20 m</text>
    <text x="238" y="500">64‒300 m²</text>
    <text x="412" y="500">40‒320</text>
  </g>
  <text x="548" y="500" font-family="'Commissioner Variable',system-ui,sans-serif" font-size="20" font-weight="600" fill="${INK}">La tine acasă</text>
</svg>
`;

// Fonts resolve from the repo-root node_modules; latin-ext carries ă â î ș ț.
const FONTS = "../../../node_modules/@fontsource";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329," +
  "U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family, file, weight, format, ext) =>
  `@font-face{font-family:"${family}";src:url("${file}") format("${format}");font-weight:${weight};${ext ? `unicode-range:${LATIN_EXT};` : ""}}`;

const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8">
<!--
  GENERATED by scripts/gen-og.mjs — edit the generator, not this file.
  SOURCE for public/images/og-image.png. To regenerate: npm run subcort:og
-->
<style>
${face("Commissioner Variable", `${FONTS}-variable/commissioner/files/commissioner-latin-ext-wght-normal.woff2`, "100 900", "woff2-variations", true)}
${face("Commissioner Variable", `${FONTS}-variable/commissioner/files/commissioner-latin-wght-normal.woff2`, "100 900", "woff2-variations", false)}
${face("IBM Plex Mono", `${FONTS}/ibm-plex-mono/files/ibm-plex-mono-latin-ext-500-normal.woff2`, 500, "woff2", true)}
${face("IBM Plex Mono", `${FONTS}/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2`, 500, "woff2", false)}
${face("IBM Plex Mono", `${FONTS}/ibm-plex-mono/files/ibm-plex-mono-latin-ext-600-normal.woff2`, 600, "woff2", true)}
${face("IBM Plex Mono", `${FONTS}/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2`, 600, "woff2", false)}
*{margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
svg{display:block}
</style></head><body>
${svg}</body></html>
`;

const cardPath = join(scriptsDir, "og-card.html");
await writeFile(cardPath, html);
console.log("wrote scripts/og-card.html");

const tmp = await mkdtemp(join(tmpdir(), "subcort-og-"));
try {
  const shot = join(tmp, "card.png");
  execFileSync(
    process.env.CHROME ?? "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${W},${H}`,
      // give the @font-face files time to load before the capture
      "--virtual-time-budget=3000",
      `--screenshot=${shot}`,
      pathToFileURL(cardPath).href,
    ],
    { stdio: "ignore" },
  );
  const info = await sharp(shot).png({ palette: true, compressionLevel: 9 }).toFile(join(outDir, "og-image.png"));
  if (info.width !== W || info.height !== H) {
    throw new Error(`og-image.png came out ${info.width}x${info.height}, expected ${W}x${H}`);
  }
  console.log(`wrote public/images/og-image.png (${Math.round(info.size / 1024)} KB)`);
} finally {
  await rm(tmp, { recursive: true, force: true });
}
