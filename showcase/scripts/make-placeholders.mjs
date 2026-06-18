#!/usr/bin/env node
/**
 * Generate branded placeholder screenshots for each project tile.
 *
 *   node scripts/make-placeholders.mjs
 *
 * Writes public/shots/<slug>.png (1600×1000) — a dark terminal plate that says
 * the real capture is pending. Drop a real screenshot in at the same path to
 * replace it; nothing else changes. Requires ImageMagick (`convert`) on PATH.
 *
 * This is a one-off authoring helper, NOT part of the build.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(HERE, "..", "public", "shots");
mkdirSync(SHOTS, { recursive: true });

const W = 1600;
const H = 1000;

// Keep in sync with src/content/projects.ts (slug + name only).
const projects = [
  { slug: "saloon", name: "Ana Saloon" },
  { slug: "subcort", name: "Subcort" },
  { slug: "auto-service", name: "BavAuto Gorj" },
  { slug: "tractari", name: "AXA Tractari" },
  { slug: "churchix", name: "Churchix" },
];

function svg(slug, name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="vig" cx="50%" cy="38%" r="75%">
      <stop offset="55%" stop-color="#171922"/>
      <stop offset="100%" stop-color="#0e0f15"/>
    </radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.2" fill="#2a2f3b" fill-opacity="0.5"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <g font-family="monospace">
    <text x="80" y="150" font-size="34" fill="#f0b545" fill-opacity="0.85">gandolh ~ %</text>
    <text x="330" y="150" font-size="34" fill="#cfd4de">open ./${slug}</text>
    <text x="80" y="500" font-size="120" fill="#e9e2cf" letter-spacing="2">${name}</text>
    <text x="84" y="580" font-size="40" fill="#8b93a3">// screenshot pending</text>
    <text x="84" y="640" font-size="32" fill="#5f6675">drop a real capture at /shots/${slug}.png</text>
  </g>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#39414f" stroke-width="2"/>
</svg>`;
}

for (const { slug, name } of projects) {
  const tmp = join(SHOTS, `${slug}.svg`);
  const out = join(SHOTS, `${slug}.png`);
  writeFileSync(tmp, svg(slug, name));
  const res = spawnSync("convert", ["-background", "none", tmp, out], {
    stdio: "inherit",
  });
  rmSync(tmp);
  if (res.status !== 0) {
    console.error(`✗ convert failed for ${slug} (is ImageMagick installed?)`);
    process.exit(1);
  }
  console.log(`✓ ${slug}.png`);
}
console.log("\nDone. Replace any file in public/shots/ with a real capture.");
