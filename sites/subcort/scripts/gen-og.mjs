// Generates the Open Graph card — the one image this site ships.
//
// It is the same drawing as the pages: the marquee in true isometric, with a
// dimension line and the sheet's title block. Nothing here is a photograph,
// because the site does not use photography.
//
//   node scripts/gen-og.mjs

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  marquee, isometric, pts, tone, dimension,
  INK, LINE, SIGNAL, SHEET,
} from "../src/lib/draft.ts";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

const W = 1200, H = 630;
const M = marquee();
const P = isometric({ scale: 13.5, cx: 855, cy: 300 });

let g = "";
const deck = M.panels.find((p) => p.part === "deck");
g += `<polygon points="${pts(deck.quad, P)}" fill="#EDEFF1" stroke="${LINE}" stroke-width="1.1"/>`;
for (const [a, b] of M.members) {
  const [x1, y1] = P(a); const [x2, y2] = P(b);
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
g += dimension([d0[0], d0[1]], [d1[0], d1[1]], "15,0 m", { offset: -46 });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${SHEET}"/>
  <g font-family="'IBM Plex Mono',monospace" font-size="17" font-weight="500" fill="${SIGNAL}" letter-spacing="1.6">
    <text x="74" y="96">SUBCORT · GORJ — OLTENIA</text>
  </g>
  <line x1="74" y1="120" x2="${W - 74}" y2="120" stroke="${INK}" stroke-width="1.5"/>
  ${g}
  <g font-family="'IBM Plex Sans',system-ui,sans-serif" fill="${INK}">
    <text x="74" y="228" font-size="60" font-weight="600" letter-spacing="-2">Un spațiu pregătit,</text>
    <text x="74" y="296" font-size="60" font-weight="600" letter-spacing="-2">oriunde ai nevoie de el.</text>
    <text x="74" y="360" font-size="23" font-weight="400" fill="#5E7180">Corturi pentru evenimente, montate la tine acasă.</text>
  </g>
  <line x1="74" y1="470" x2="${W - 74}" y2="470" stroke="${INK}" stroke-width="1.5"/>
  <g font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="500" fill="#5E7180" letter-spacing="1.2">
    <text x="74" y="500">DESCHIDERE</text><text x="74" y="530" font-size="21" fill="${INK}">8 – 20 m</text>
    <text x="330" y="500">SUPRAFAȚĂ</text><text x="330" y="530" font-size="21" fill="${INK}">64 – 300 m²</text>
    <text x="610" y="500">CAPACITATE</text><text x="610" y="530" font-size="21" fill="${INK}">40 – 320</text>
    <text x="880" y="500">MONTAJ</text><text x="880" y="530" font-size="21" fill="${INK}">La tine acasă</text>
  </g>
</svg>
`;

await writeFile(join(outDir, "og-image.svg"), svg);
console.log("wrote public/images/og-image.svg");
