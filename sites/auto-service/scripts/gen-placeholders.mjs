// Generates illustrated SVG mock-ups for the hero, gallery, and OG image.
//
// These are stylized VECTOR scenes (not photos): a BMW silhouette on a lift, a
// diagnosis laptop, an engine/timing detail, brakes, the team — drawn in the
// brand palette (graphite + the M motorsport stripe). They are intentionally
// illustrative so no one mistakes them for the shop's real photos; drop real
// JPEGs into public/images/real/ and they take over automatically (see
// public/images/real/README.md + src/content/images.ts).
//
//   node scripts/gen-placeholders.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images");

// Brand palette (matches src/styles/global.css).
const C = {
  bg0: "#10161f", // deepest graphite
  bg1: "#18222f", // graphite
  bg2: "#243348", // lifted graphite
  line: "#33445c", // structural lines
  steel: "#5b6b82", // mid steel
  steelL: "#8b9bb3", // light steel
  ink: "#e6edf5", // near-white
  blue: "#2e9ee3", // M blue
  indigo: "#3a2d7a", // M indigo
  red: "#e2231a", // M red
  primary: "#3f7fe0", // brand primary blue
};

// Shared building blocks ----------------------------------------------------

function defs() {
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.bg2}"/>
      <stop offset="100%" stop-color="${C.bg0}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="32%" r="60%">
      <stop offset="0%" stop-color="${C.primary}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${C.primary}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

// Faint engineering grid, clipped to the frame.
function grid(w, h, step = 40, opacity = 0.06) {
  let lines = "";
  for (let x = step; x < w; x += step) lines += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = step; y < h; y += step) lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return `<g stroke="${C.ink}" stroke-width="1" opacity="${opacity}">${lines}</g>`;
}

// The M motorsport stripe along the top edge.
function mStripe(w, h = 6) {
  const t = w / 3;
  return `<g>
    <rect x="0" y="0" width="${t}" height="${h}" fill="${C.blue}"/>
    <rect x="${t}" y="0" width="${t}" height="${h}" fill="${C.indigo}"/>
    <rect x="${t * 2}" y="0" width="${t}" height="${h}" fill="${C.red}"/>
  </g>`;
}

// A compact BMW-ish coupe silhouette (long hood, short deck, Hofmeister kink),
// drawn at unit scale ~ 360x130, translated/scaled by the caller. NOT a logo.
function carSilhouette(fill = C.bg0, stroke = C.steel, sw = 3) {
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round">
    <path d="M10,92
             C30,78 60,72 92,70
             L120,46 C128,38 140,34 158,33
             L250,33 C268,34 280,40 292,52
             L322,72 C340,74 352,80 360,90
             L362,104 C362,112 356,116 348,116
             L300,116
             C300,100 286,88 270,88 C254,88 240,100 240,116
             L150,116
             C150,100 136,88 120,88 C104,88 90,100 90,116
             L24,116 C14,116 8,110 8,102 Z"/>
    <path d="M132,46 L168,46 L168,66 L120,66 Z" fill="${C.bg2}" stroke="none"/>
    <path d="M176,46 L246,46 C258,47 266,54 274,64 L176,66 Z" fill="${C.bg2}" stroke="none"/>
    <path d="M250,49 L252,64 L268,64 Z" fill="${C.bg2}" stroke="none"/>
    <circle cx="120" cy="116" r="22" fill="${C.bg1}" stroke="${stroke}" stroke-width="${sw}"/>
    <circle cx="120" cy="116" r="9" fill="${C.steel}" stroke="none"/>
    <circle cx="270" cy="116" r="22" fill="${C.bg1}" stroke="${stroke}" stroke-width="${sw}"/>
    <circle cx="270" cy="116" r="9" fill="${C.steel}" stroke="none"/>
  </g>`;
}

function caption(w, h, label) {
  const fs = Math.max(13, Math.round(Math.min(w, h) * 0.045));
  return `<g font-family="Arial, Helvetica, sans-serif">
    <rect x="${w / 2 - (label.length * fs * 0.32 + 24)}" y="${h - fs * 2.4}" width="${label.length * fs * 0.64 + 48}" height="${fs * 1.7}" rx="${fs * 0.85}" fill="${C.bg0}" opacity="0.55"/>
    <text x="50%" y="${h - fs * 1.0}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${C.ink}" opacity="0.92">${label}</text>
  </g>`;
}

function frame(w, h, inner, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${defs()}
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${grid(w, h)}
  ${inner}
  ${mStripe(w)}
  ${label ? caption(w, h, label) : ""}
</svg>`;
}

// Scenes --------------------------------------------------------------------

// Hero: a BMW up on a two-post lift inside a bay, daylight from the doors.
function sceneHero(w, h, label) {
  const inner = `
  <!-- bay doors / light wash -->
  <rect x="${w * 0.62}" y="0" width="${w * 0.38}" height="${h}" fill="${C.bg2}" opacity="0.5"/>
  <g stroke="${C.line}" stroke-width="2" opacity="0.5">
    ${Array.from({ length: 6 }, (_, i) => `<line x1="${w * 0.62 + i * (w * 0.38) / 6}" y1="0" x2="${w * 0.62 + i * (w * 0.38) / 6}" y2="${h}"/>`).join("")}
  </g>
  <!-- floor -->
  <rect x="0" y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="${C.bg0}"/>
  <line x1="0" y1="${h * 0.82}" x2="${w}" y2="${h * 0.82}" stroke="${C.line}" stroke-width="2"/>
  <!-- two-post lift -->
  <g stroke="${C.steel}" stroke-width="10" stroke-linecap="round">
    <line x1="${w * 0.2}" y1="${h * 0.18}" x2="${w * 0.2}" y2="${h * 0.82}"/>
    <line x1="${w * 0.8}" y1="${h * 0.18}" x2="${w * 0.8}" y2="${h * 0.82}"/>
  </g>
  <rect x="${w * 0.18}" y="${h * 0.16}" width="${w * 0.64}" height="10" rx="4" fill="${C.steel}"/>
  <!-- arms holding the car -->
  <g stroke="${C.steelL}" stroke-width="8" stroke-linecap="round">
    <line x1="${w * 0.2}" y1="${h * 0.52}" x2="${w * 0.36}" y2="${h * 0.52}"/>
    <line x1="${w * 0.8}" y1="${h * 0.52}" x2="${w * 0.64}" y2="${h * 0.52}"/>
  </g>
  <!-- the car, lifted -->
  <g transform="translate(${w / 2 - 200}, ${h * 0.3}) scale(1.1)">
    ${carSilhouette(C.bg0, C.steelL, 3)}
  </g>`;
  return frame(w, h, inner, label);
}

// Diagnosis: a laptop with an OBD trace + the M colours on screen.
function sceneDiagnosis(w, h, label) {
  const cx = w / 2, cy = h * 0.46;
  const inner = `
  <g transform="translate(${cx - 150}, ${cy - 90})">
    <!-- screen -->
    <rect x="0" y="0" width="300" height="170" rx="10" fill="${C.bg0}" stroke="${C.steel}" stroke-width="3"/>
    <rect x="14" y="14" width="272" height="142" rx="4" fill="${C.bg2}"/>
    <!-- trace -->
    <polyline points="22,120 60,120 78,60 96,120 150,120 168,40 186,120 280,120" fill="none" stroke="${C.blue}" stroke-width="3"/>
    <line x1="22" y1="120" x2="280" y2="120" stroke="${C.line}" stroke-width="2"/>
    <!-- module dots -->
    <circle cx="40" cy="36" r="6" fill="${C.red}"/><circle cx="62" cy="36" r="6" fill="${C.indigo}"/><circle cx="84" cy="36" r="6" fill="${C.blue}"/>
    <!-- base / keyboard -->
    <path d="M-26,170 L326,170 L350,200 L-50,200 Z" fill="${C.steel}"/>
    <rect x="-50" y="200" width="400" height="6" fill="${C.line}"/>
  </g>
  <!-- OBD cable to a port -->
  <path d="M${cx + 150},${cy + 40} C ${w * 0.86},${cy + 40} ${w * 0.86},${h * 0.78} ${w * 0.8},${h * 0.78}" fill="none" stroke="${C.steelL}" stroke-width="4"/>
  <rect x="${w * 0.74}" y="${h * 0.76}" width="40" height="22" rx="4" fill="${C.bg0}" stroke="${C.steel}" stroke-width="3"/>`;
  return frame(w, h, inner, label);
}

// Timing / chain: overlapping gears + a chain loop.
function sceneTiming(w, h, label) {
  const cx = w / 2, cy = h * 0.46;
  function gear(x, y, r, teeth) {
    let t = "";
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const x1 = x + Math.cos(a) * r, y1 = y + Math.sin(a) * r;
      const x2 = x + Math.cos(a) * (r + 10), y2 = y + Math.sin(a) * (r + 10);
      t += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${C.steelL}" stroke-width="6" stroke-linecap="round"/>`;
    }
    return `<g>${t}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.bg0}" stroke="${C.steelL}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="${C.steel}"/></g>`;
  }
  const inner = `
  <path d="M${cx - 70},${cy - 70} a70,70 0 1,0 140,0" fill="none" stroke="${C.blue}" stroke-width="6" opacity="0.7"/>
  ${gear(cx - 60, cy, 46, 14)}
  ${gear(cx + 70, cy + 18, 34, 12)}`;
  return frame(w, h, inner, label);
}

// Brakes: a vented disc + caliper.
function sceneBrakes(w, h, label) {
  const cx = w / 2, cy = h * 0.46, r = Math.min(w, h) * 0.26;
  let vents = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    vents += `<line x1="${(cx + Math.cos(a) * r * 0.45).toFixed(1)}" y1="${(cy + Math.sin(a) * r * 0.45).toFixed(1)}" x2="${(cx + Math.cos(a) * r * 0.9).toFixed(1)}" y2="${(cy + Math.sin(a) * r * 0.9).toFixed(1)}" stroke="${C.line}" stroke-width="3"/>`;
  }
  const inner = `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.bg0}" stroke="${C.steelL}" stroke-width="5"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.92}" fill="none" stroke="${C.steel}" stroke-width="2"/>
  ${vents}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${C.bg2}" stroke="${C.steelL}" stroke-width="4"/>
  ${Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(cx + Math.cos(a) * r * 0.22).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.22).toFixed(1)}" r="5" fill="${C.steel}"/>`; }).join("")}
  <!-- caliper -->
  <path d="M${cx - r - 10},${cy - r * 0.5} a${r * 0.55},${r * 0.55} 0 0,0 0,${r} l28,0 l0,-${r} Z" fill="${C.red}" opacity="0.85"/>`;
  return frame(w, h, inner, label);
}

// Engine detail: a valve cover with plug coils.
function sceneEngine(w, h, label) {
  const x = w * 0.16, y = h * 0.3, bw = w * 0.68, bh = h * 0.4;
  let coils = "";
  for (let i = 0; i < 4; i++) {
    const cxp = x + bw * 0.16 + i * bw * 0.22;
    coils += `<rect x="${cxp}" y="${y - 18}" width="${bw * 0.1}" height="34" rx="5" fill="${C.steel}"/><rect x="${cxp + bw * 0.02}" y="${y - 34}" width="${bw * 0.05}" height="20" rx="3" fill="${C.steelL}"/>`;
  }
  const inner = `
  <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="14" fill="${C.bg0}" stroke="${C.steelL}" stroke-width="5"/>
  <g stroke="${C.line}" stroke-width="3">
    ${Array.from({ length: 5 }, (_, i) => `<line x1="${x}" y1="${y + bh * (i + 1) / 6}" x2="${x + bw}" y2="${y + bh * (i + 1) / 6}"/>`).join("")}
  </g>
  ${coils}
  <!-- oil cap -->
  <circle cx="${x + bw - 40}" cy="${y + bh - 32}" r="18" fill="${C.bg2}" stroke="${C.steelL}" stroke-width="4"/>`;
  return frame(w, h, inner, label);
}

// Team: three figures + the M stripe behind them.
function sceneTeam(w, h, label) {
  function person(cx, base, scale, fill) {
    const r = 22 * scale;
    return `<g fill="${fill}">
      <circle cx="${cx}" cy="${base - 120 * scale}" r="${r}"/>
      <path d="M${cx - 34 * scale},${base} C${cx - 34 * scale},${base - 70 * scale} ${cx - 24 * scale},${base - 96 * scale} ${cx},${base - 96 * scale} C${cx + 24 * scale},${base - 96 * scale} ${cx + 34 * scale},${base - 70 * scale} ${cx + 34 * scale},${base} Z"/>
    </g>`;
  }
  const base = h * 0.86;
  const inner = `
  <rect x="0" y="${base - 6}" width="${w}" height="6" fill="${C.line}"/>
  ${person(w * 0.34, base, 1.05, C.bg0)}
  ${person(w * 0.5, base, 1.18, C.steel)}
  ${person(w * 0.66, base, 1.05, C.bg0)}
  <!-- overall accent stripe on the middle figure -->
  <rect x="${w * 0.5 - 4}" y="${base - 96 * 1.18}" width="8" height="${96 * 1.18}" fill="${C.blue}" opacity="0.5"/>`;
  return frame(w, h, inner, label);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, "hero.svg"), sceneHero(1600, 1000, "BavAuto Gorj · atelier BMW"));
  await writeFile(join(outDir, "og-image.svg"), sceneHero(1200, 630, "BavAuto Gorj · Service BMW"));
  await writeFile(join(outDir, "atelier.svg"), sceneHero(1200, 800, "Atelierul nostru"));

  await writeFile(join(outDir, "gallery-01.svg"), sceneHero(1200, 900, "BMW pe elevator"));
  await writeFile(join(outDir, "gallery-02.svg"), sceneDiagnosis(800, 600, "Diagnoză computerizată"));
  await writeFile(join(outDir, "gallery-03.svg"), sceneTiming(800, 600, "Distribuție & lanț"));
  await writeFile(join(outDir, "gallery-04.svg"), sceneBrakes(800, 600, "Sistem de frânare"));
  await writeFile(join(outDir, "gallery-05.svg"), sceneEngine(800, 600, "Detaliu motor"));
  await writeFile(join(outDir, "gallery-06.svg"), sceneTeam(800, 600, "Echipa atelierului"));

  console.log("Illustrated placeholder SVGs generated in public/images/");
}

main();
