// Generates illustrated SVG mock-ups for the hero, gallery, and OG image.
//
// These are stylized VECTOR scenes (not photos): a lit tent at blue hour, an
// empty prepared interior, the structure being raised, a string of lights. They
// are drawn in the brand palette (deep canopy green + warm off-white + clay
// lamp-glow) and are intentionally illustrative — occasion-neutral, never a
// celebration in progress — so the brand reads calm and dependable.
//
//   node scripts/gen-placeholders.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images");

// Brand palette (matches src/styles/global.css; hex approximations of the OKLCH).
// Lifted a notch from the on-page canopy green so the scenes read as IMAGES
// against the dark hero/cards instead of dissolving into them. The dusk sky now
// climbs from a deep canopy base into a warmer blue-hour band near the horizon.
const C = {
  sky0: "#12211a", // deepest canopy (top of sky)
  sky1: "#1f3a2c", // deep canopy green (inverse-surface)
  sky2: "#365441", // lifted canopy
  haze: "#4a6450", // mid-distance atmospheric haze
  horizon: "#8a7853", // warm blue-hour band just above the field
  horizonHot: "#c79a64", // the hottest sliver of the dusk horizon
  field: "#1c2a20", // dark grassy field at dusk
  fieldFar: "#2c4233", // far field, lifted by the horizon light
  line: "#5d7a64", // structural lines (brighter, reads as edges)
  canvasL: "#f3f4ec", // warm off-white canvas highlight
  canvasSh: "#cdd2c2", // shaded canvas (the unlit side / folds)
  ink: "#f6f4ea", // warm near-white
  green: "#6fa178", // brighter green
  greenD: "#3a6b46",
  clay: "#d2864f", // warm clay (lamp glow)
  clayL: "#f0b985", // brighter clay glow
  clayHot: "#fcd9a8", // the core of the lamp, near-white-warm
};

// Shared building blocks ----------------------------------------------------

function defs(lampCx = "50%", lampCy = "64%", lampR = "46%") {
  return `
  <defs>
    <!-- Dusk sky: deep canopy at the top easing through a mid haze into a warm
         blue-hour band, with a hot sliver right at the horizon, then the dark
         field. The extra stops give real atmospheric depth instead of a flat
         two-tone wash. -->
    <linearGradient id="dusk" x1="0" y1="0" x2="0.12" y2="1">
      <stop offset="0%" stop-color="${C.sky0}"/>
      <stop offset="32%" stop-color="${C.sky1}"/>
      <stop offset="56%" stop-color="${C.haze}"/>
      <stop offset="70%" stop-color="${C.horizon}"/>
      <stop offset="75%" stop-color="${C.horizonHot}"/>
      <stop offset="79%" stop-color="${C.sky2}"/>
      <stop offset="86%" stop-color="${C.fieldFar}"/>
      <stop offset="100%" stop-color="${C.field}"/>
    </linearGradient>
    <!-- A wide, low glow sitting on the horizon line (the sun just gone). -->
    <radialGradient id="horizonGlow" cx="50%" cy="76%" r="62%" fx="50%" fy="76%">
      <stop offset="0%" stop-color="${C.horizonHot}" stop-opacity="0.5"/>
      <stop offset="38%" stop-color="${C.horizon}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${C.horizon}" stop-opacity="0"/>
    </radialGradient>
    <!-- The lamp: a hot near-white core falling off through clay to nothing.
         Three stops so the glow has a believable falloff, not a flat disc. -->
    <radialGradient id="lamp" cx="${lampCx}" cy="${lampCy}" r="${lampR}">
      <stop offset="0%" stop-color="${C.clayHot}" stop-opacity="0.85"/>
      <stop offset="22%" stop-color="${C.clayL}" stop-opacity="0.5"/>
      <stop offset="55%" stop-color="${C.clay}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${C.clay}" stop-opacity="0"/>
    </radialGradient>
    <!-- Soft vertical haze used to push distant elements back. -->
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.haze}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${C.haze}" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="guyline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.green}"/>
      <stop offset="100%" stop-color="${C.clayL}"/>
    </linearGradient>
    <!-- A faint vignette to seat the composition. -->
    <radialGradient id="vignette" cx="50%" cy="46%" r="75%">
      <stop offset="62%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="${C.sky0}" stop-opacity="0.55"/>
    </radialGradient>
  </defs>`;
}

// The guy-line (signature) along the top edge.
function guyline(w, h = 5) {
  return `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#guyline)"/>`;
}

// A peaked tent silhouette with a glowing interior, drawn at unit scale and
// translated/scaled by the caller. Two-peak marquee shape.
function tent(cx, baseY, scale = 1, glow = true) {
  const w = 360 * scale;
  const peak = 150 * scale;
  const eave = 80 * scale;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const midL = cx - w * 0.18;
  const midR = cx + w * 0.18;
  // Roofline: eave → peak → dip → peak → eave (a two-bay marquee).
  const roof = `M${x0},${baseY - eave}
    L${midL},${baseY - peak}
    L${cx},${baseY - peak * 0.82}
    L${midR},${baseY - peak}
    L${x1},${baseY - eave}`;
  const body = `${roof}
    L${x1},${baseY}
    L${x0},${baseY} Z`;
  const opening = glow
    ? `<path d="M${cx - 46 * scale},${baseY}
         L${cx - 46 * scale},${baseY - eave * 0.92}
         Q${cx},${baseY - eave * 1.15} ${cx + 46 * scale},${baseY - eave * 0.92}
         L${cx + 46 * scale},${baseY} Z" fill="${C.clayL}" opacity="0.9"/>
       <path d="M${cx - 30 * scale},${baseY}
         L${cx - 30 * scale},${baseY - eave * 0.78}
         Q${cx},${baseY - eave * 0.95} ${cx + 30 * scale},${baseY - eave * 0.78}
         L${cx + 30 * scale},${baseY} Z" fill="${C.ink}" opacity="0.85"/>`
    : "";
  // The canvas is split down the ridge: the right bay catches the last warm
  // light, the left bay falls into shade. That single split is what makes the
  // structure read as a lit object in space rather than a flat cut-out.
  const litHalf = `M${cx},${baseY - peak * 0.82}
    L${midR},${baseY - peak} L${x1},${baseY - eave} L${x1},${baseY} L${cx},${baseY} Z`;
  const shadeHalf = `M${cx},${baseY - peak * 0.82}
    L${midL},${baseY - peak} L${x0},${baseY - eave} L${x0},${baseY} L${cx},${baseY} Z`;
  const groundShadow = glow
    ? `<ellipse cx="${cx}" cy="${baseY + 4 * scale}" rx="${w * 0.62}" ry="${10 * scale}" fill="${C.sky0}" opacity="0.4"/>`
    : "";
  return `<g>
    ${groundShadow}
    <path d="${body}" fill="${C.canvasL}" opacity="0.97"/>
    <path d="${shadeHalf}" fill="${C.canvasSh}" opacity="0.55"/>
    <path d="${litHalf}" fill="${C.clayL}" opacity="${glow ? 0.16 : 0}"/>
    <path d="${roof} L${x1},${baseY - eave}" fill="none" stroke="${C.greenD}" stroke-width="${2.5 * scale}" opacity="0.32"/>
    <line x1="${cx}" y1="${baseY - peak * 0.82}" x2="${cx}" y2="${baseY}" stroke="${C.greenD}" stroke-width="${1.5 * scale}" opacity="0.22"/>
    <line x1="${midL}" y1="${baseY - peak}" x2="${midL}" y2="${baseY}" stroke="${C.greenD}" stroke-width="${1.5 * scale}" opacity="0.22"/>
    <line x1="${midR}" y1="${baseY - peak}" x2="${midR}" y2="${baseY}" stroke="${C.greenD}" stroke-width="${1.5 * scale}" opacity="0.22"/>
    ${opening}
    <!-- guy ropes -->
    <line x1="${x0}" y1="${baseY - eave}" x2="${x0 - 34 * scale}" y2="${baseY}" stroke="${C.green}" stroke-width="${1.5 * scale}" opacity="0.55"/>
    <line x1="${x1}" y1="${baseY - eave}" x2="${x1 + 34 * scale}" y2="${baseY}" stroke="${C.green}" stroke-width="${1.5 * scale}" opacity="0.55"/>
  </g>`;
}

// A flat, hazed-back distant tent silhouette for the far field — depth cue only,
// no interior detail. Drawn small and low-contrast so it sits behind the haze.
function distantTent(cx, baseY, scale) {
  const w = 360 * scale, peak = 150 * scale, eave = 80 * scale;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const midL = cx - w * 0.18, midR = cx + w * 0.18;
  const body = `M${x0},${baseY - eave} L${midL},${baseY - peak}
    L${cx},${baseY - peak * 0.82} L${midR},${baseY - peak} L${x1},${baseY - eave}
    L${x1},${baseY} L${x0},${baseY} Z`;
  return `<path d="${body}" fill="${C.haze}" opacity="0.55"/>
    <path d="${body}" fill="${C.canvasL}" opacity="0.12"/>`;
}

// A string of warm bulbs across the frame.
function lights(w, y, n = 9) {
  let s = `<path d="M0,${y} Q${w / 2},${y + 28} ${w},${y}" fill="none" stroke="${C.line}" stroke-width="1.5" opacity="0.5"/>`;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * w;
    const yy = y + Math.sin(Math.PI * t) * 28;
    s += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="3.5" fill="${C.clayL}" opacity="0.9"/>`;
  }
  return s;
}

function caption(w, h, label) {
  const fs = Math.max(13, Math.round(Math.min(w, h) * 0.04));
  return `<g font-family="Georgia, 'Times New Roman', serif">
    <text x="50%" y="${h - fs * 1.1}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${C.ink}" opacity="0.9">${label}</text>
  </g>`;
}

function frame(w, h, inner, label, lamp) {
  const l = lamp || {};
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${defs(l.cx, l.cy, l.r)}
  <rect width="${w}" height="${h}" fill="url(#dusk)"/>
  <rect width="${w}" height="${h}" fill="url(#horizonGlow)"/>
  ${inner}
  <rect width="${w}" height="${h}" fill="url(#lamp)"/>
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
  ${guyline(w)}
  ${label ? caption(w, h, label) : ""}
</svg>`;
}

// Scenes --------------------------------------------------------------------

// Hero: a lit tent on a field at blue hour. Built in depth — a hazed far field
// with two distant tents, the horizon line, then the subject tent set slightly
// off-centre with a string of warm lights arcing above it. The lamp glow is
// aimed at the subject's interior so it reads as the focal point.
function sceneHero(w, h, label) {
  const baseY = h * 0.84;
  const horizonY = h * 0.66;
  // subject sits right-of-centre so a left-aligned headline has room to breathe
  const subjectCx = w * 0.62;
  const subjectScale = Math.min(w, h) / 480;
  const inner = `
  <!-- far field, pushed back by haze -->
  ${distantTent(w * 0.2, horizonY + h * 0.05, subjectScale * 0.42)}
  ${distantTent(w * 0.82, horizonY + h * 0.07, subjectScale * 0.5)}
  <line x1="0" y1="${horizonY}" x2="${w}" y2="${horizonY}" stroke="${C.horizonHot}" stroke-width="1.5" opacity="0.25"/>
  <rect x="0" y="${horizonY}" width="${w}" height="${h * 0.1}" fill="url(#haze)"/>
  <!-- ground plane -->
  <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="${C.line}" stroke-width="2" opacity="0.35"/>
  <!-- string lights arc above the subject -->
  ${lights(w, h * 0.22)}
  ${tent(subjectCx, baseY, subjectScale, true)}`;
  // aim the lamp at the subject tent's lit opening
  return frame(w, h, inner, label, { cx: "61%", cy: "72%", r: "44%" });
}

// Empty prepared interior: a row of tables under the canopy, warm light.
function sceneInterior(w, h, label) {
  const baseY = h * 0.84;
  let tables = "";
  const rows = 2, cols = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = w * (0.22 + c * 0.28);
      const y = baseY - r * h * 0.22 - h * 0.04;
      const sc = 1 - r * 0.18;
      tables += `<ellipse cx="${x}" cy="${y}" rx="${42 * sc}" ry="${14 * sc}" fill="${C.canvasL}" opacity="${0.92 - r * 0.15}"/>
        <rect x="${x - 4}" y="${y}" width="8" height="${22 * sc}" fill="${C.line}" opacity="0.5"/>`;
    }
  }
  const inner = `
  <!-- canopy ceiling lines -->
  <path d="M0,${h * 0.16} L${w * 0.5},${h * 0.06} L${w},${h * 0.16}" fill="none" stroke="${C.line}" stroke-width="2" opacity="0.4"/>
  <rect x="0" y="${h * 0.16}" width="${w}" height="${h * 0.04}" fill="${C.sky2}" opacity="0.4"/>
  ${lights(w, h * 0.24, 7)}
  <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="${C.line}" stroke-width="2" opacity="0.45"/>
  ${tables}`;
  return frame(w, h, inner, label);
}

// Setup: the structure half-raised, frame visible.
function sceneSetup(w, h, label) {
  const baseY = h * 0.82;
  const cx = w * 0.5;
  const ww = w * 0.62, peak = h * 0.42;
  const x0 = cx - ww / 2, x1 = cx + ww / 2;
  const inner = `
  <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="${C.line}" stroke-width="2" opacity="0.4"/>
  <!-- frame -->
  <g stroke="${C.green}" stroke-width="4" fill="none" opacity="0.85" stroke-linecap="round">
    <line x1="${x0}" y1="${baseY}" x2="${x0}" y2="${baseY - peak * 0.5}"/>
    <line x1="${x1}" y1="${baseY}" x2="${x1}" y2="${baseY - peak * 0.5}"/>
    <line x1="${cx}" y1="${baseY}" x2="${cx}" y2="${baseY - peak}"/>
    <line x1="${x0}" y1="${baseY - peak * 0.5}" x2="${cx}" y2="${baseY - peak}"/>
    <line x1="${x1}" y1="${baseY - peak * 0.5}" x2="${cx}" y2="${baseY - peak}"/>
  </g>
  <!-- canvas being pulled over one side -->
  <path d="M${x0},${baseY - peak * 0.5} L${cx},${baseY - peak} L${cx},${baseY} L${x0},${baseY} Z" fill="${C.canvasL}" opacity="0.9"/>
  <line x1="${x0}" y1="${baseY - peak * 0.5}" x2="${x0 - 30}" y2="${baseY}" stroke="${C.clay}" stroke-width="2" opacity="0.7"/>`;
  return frame(w, h, inner, label);
}

// A small tent row (coverage / gallery filler).
function sceneField(w, h, label) {
  const baseY = h * 0.8;
  const inner = `
  <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="${C.line}" stroke-width="2" opacity="0.4"/>
  ${tent(w * 0.3, baseY, Math.min(w, h) / 900, false)}
  ${tent(w * 0.62, baseY - h * 0.02, Math.min(w, h) / 620, true)}`;
  return frame(w, h, inner, label);
}

// String-lights detail.
function sceneLights(w, h, label) {
  const inner = `
  ${lights(w, h * 0.34, 6)}
  ${lights(w, h * 0.54, 5)}
  ${tent(w * 0.5, h * 0.86, Math.min(w, h) / 760, true)}`;
  return frame(w, h, inner, label);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Hero carries no baked-in caption (the page supplies the headline). The OG
  // card keeps its label since it travels standalone in link previews.
  // Wide hero for the desktop full-bleed stage, and a taller portrait variant
  // for narrow viewports so the subject tent stays in frame on mobile. Both
  // carry no baked caption (the page lays its headline over the scene).
  await writeFile(join(outDir, "hero.svg"), sceneHero(1600, 1000, ""));
  await writeFile(join(outDir, "hero-tall.svg"), sceneHero(1080, 1500, ""));
  await writeFile(join(outDir, "og-image.svg"), sceneHero(1200, 630, "Subcort · corturi pentru evenimente"));

  // No baked-in captions: the page renders its own <figcaption> from g.alt over
  // each tile. Baking a label here too produced doubled, overlapping text.
  await writeFile(join(outDir, "gallery-01.svg"), sceneInterior(1000, 750, ""));
  await writeFile(join(outDir, "gallery-02.svg"), sceneSetup(1000, 750, ""));
  await writeFile(join(outDir, "gallery-03.svg"), sceneLights(1000, 750, ""));
  await writeFile(join(outDir, "gallery-04.svg"), sceneInterior(1000, 750, ""));
  await writeFile(join(outDir, "gallery-05.svg"), sceneField(1000, 750, ""));
  await writeFile(join(outDir, "gallery-06.svg"), sceneSetup(1000, 750, ""));

  // Favicon: a tiny tent peak mark.
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="${C.sky1}"/>
  <path d="M6,23 L13,9 L16,13 L19,9 L26,23 Z" fill="${C.canvasL}"/>
  <path d="M13,23 L13,16 Q16,14 19,16 L19,23 Z" fill="${C.clayL}"/>
</svg>`;
  await writeFile(join(outDir, "favicon.svg"), favicon);

  console.log("Illustrated placeholder SVGs generated in public/images/");
}

main();
