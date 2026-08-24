// Generates this site's two brand rasters-as-vectors: the social card and the
// favicon. Both are drawn in the "Bordcomputer" world — a near-black binnacle
// bezel, one amber illumination, the M tri-color as coded segments.
//
// The site ships NO photography (the owner confirmed none is coming), so there
// are no hero/gallery placeholders any more: the workshop is drawn in
// src/components/BayScene.astro and the gallery section was removed rather than
// filled with stock. If real photos ever arrive, drop them in
// public/images/real/ and add their logical names to src/content/images.ts.
//
//   node scripts/gen-placeholders.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images");

// Hex mirrors of the OKLCH tokens in src/styles/global.css. SVG files are read
// by crawlers and mail clients with no CSS custom properties, so they are
// literal here on purpose.
const C = {
  ground: "#07090c",
  well: "#0e1116",
  face: "#12161c",
  bezel: "#2b3038",
  ink: "#eef1f4",
  ink2: "#9aa2ac",
  amber: "#ff8a1e",
  amberLo: "#8a4a0d",
  mBlue: "#2e9be6",
  mIndigo: "#5b4bc4",
  mRed: "#e8331f",
};

const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

/** The dial, drawn once and reused at both sizes. */
function dial(cx, cy, r, { ticks = true } = {}) {
  const A0 = -125, A1 = 125, MAX = 8, VAL = 0.82, REDLINE = 6.5;
  const tR = r - r * 0.14;
  let out = `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.bezel}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - r * 0.045}" fill="${C.well}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - r * 0.065}" fill="${C.face}"/>
  <path d="${arc(cx, cy, r - r * 0.09, A0 - 4, A1 + 4)}" fill="none" stroke="${C.amber}" stroke-width="${r * 0.016}" stroke-linecap="round" opacity="0.5"/>`;

  if (ticks) {
    for (let i = 0; i <= MAX * 4; i++) {
      const v = i / 4;
      const ang = A0 + (A1 - A0) * (v / MAX);
      const major = Number.isInteger(v);
      const red = v >= REDLINE;
      const len = major ? r * 0.09 : r * 0.042;
      const [x0, y0] = polar(cx, cy, tR, ang);
      const [x1, y1] = polar(cx, cy, tR - len, ang);
      out += `\n  <line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${red ? C.mRed : major ? C.ink : "#5c646f"}" stroke-width="${major ? r * 0.016 : r * 0.007}"/>`;
    }
    out += `\n  <path d="${arc(cx, cy, tR + r * 0.033, A0 + (A1 - A0) * (REDLINE / MAX), A1)}" fill="none" stroke="${C.mRed}" stroke-width="${r * 0.024}"/>`;
  }

  const ang = A0 + (A1 - A0) * (VAL / MAX);
  const nl = r - r * 0.18;
  out += `
  <g transform="rotate(${ang.toFixed(1)} ${cx} ${cy})">
    <path d="M${cx - r * 0.026} ${cy + r * 0.075} L${cx - r * 0.011} ${cy - nl} L${cx + r * 0.011} ${cy - nl} L${cx + r * 0.026} ${cy + r * 0.075} Z" fill="${C.mRed}"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.09}" fill="#171b21" stroke="#333a44" stroke-width="${r * 0.007}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.028}" fill="${C.mRed}"/>`;
  return out;
}

/** Three coded segments in the canonical M order, hairline-separated. */
function mSegments(x, y, w, h) {
  const seg = (w - 2 * (h * 0.5)) / 3;
  const gap = h * 0.5;
  return `
  <rect x="${x}" y="${y}" width="${seg}" height="${h}" fill="${C.mBlue}"/>
  <rect x="${x + seg + gap}" y="${y}" width="${seg}" height="${h}" fill="${C.mIndigo}"/>
  <rect x="${x + 2 * (seg + gap)}" y="${y}" width="${seg}" height="${h}" fill="${C.mRed}"/>`;
}

function ogCard(w = 1200, h = 630) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="BavAuto Gorj — service BMW în Târgu-Jiu">
  <defs>
    <radialGradient id="bloom" cx="76%" cy="52%" r="52%">
      <stop offset="0%" stop-color="${C.amber}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${C.amber}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.ground}"/>
  <rect width="${w}" height="${h}" fill="url(#bloom)"/>
${mSegments(0, 0, w, 6)}
${dial(w * 0.79, h * 0.52, 218)}
  <circle cx="72" cy="86" r="7" fill="${C.amber}"/>
  <text x="94" y="95" font-family="Archivo, Arial Narrow, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="1" fill="${C.ink}">BAVAUTO<tspan fill="${C.amber}">·</tspan>GORJ</text>
  <text x="72" y="266" font-family="Archivo, Arial Narrow, Arial, sans-serif" font-size="76" font-weight="800" letter-spacing="-2" fill="${C.ink}">Service BMW</text>
  <text x="72" y="348" font-family="Archivo, Arial Narrow, Arial, sans-serif" font-size="76" font-weight="800" letter-spacing="-2" fill="${C.ink}">în Târgu-Jiu.</text>
  <text x="72" y="416" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${C.ink2}">Atelier independent de familie. Diagnoză dedicată,</text>
  <text x="72" y="452" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${C.ink2}">deviz scris înainte de lucrare, garanție 12 luni.</text>
  <rect x="72" y="504" width="292" height="62" rx="5" fill="${C.amber}"/>
  <text x="218" y="544" text-anchor="middle" font-family="Archivo, Arial Narrow, Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="2" fill="#180c00">SUNĂ ACUM</text>
</svg>
`;
}

function favicon() {
  // At 16px only two things survive: the amber arc and the red needle. The M
  // segments are deliberately absent here — they smear at tab size.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="BavAuto Gorj">
  <rect width="64" height="64" rx="13" fill="${C.ground}"/>
  <circle cx="32" cy="32" r="25" fill="${C.bezel}"/>
  <circle cx="32" cy="32" r="22.5" fill="${C.face}"/>
  <path d="${arc(32, 32, 18.5, -125, 125)}" fill="none" stroke="${C.amber}" stroke-width="5" stroke-linecap="round"/>
  <g transform="rotate(-99 32 32)">
    <path d="M30.4 36 L31.3 14.5 L32.7 14.5 L33.6 36 Z" fill="${C.mRed}"/>
  </g>
  <circle cx="32" cy="32" r="4.4" fill="#171b21"/>
  <circle cx="32" cy="32" r="2" fill="${C.mRed}"/>
</svg>
`;
}

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "og-image.svg"), ogCard());
await writeFile(join(__dirname, "..", "public", "favicon.svg"), favicon());
console.log("wrote public/images/og-image.svg + public/favicon.svg");
