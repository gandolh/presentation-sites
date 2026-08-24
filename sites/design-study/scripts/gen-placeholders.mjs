// Generates the 18-image shared pool as SVG placeholders.
//
//   node scripts/gen-placeholders.mjs   ->  public/images/photo-01.svg … photo-18.svg
//
// These are stand-ins for photography, so they are built to survive the thing
// this study does to them: every theme runs its own filter over the same file.
// A flat two-stop gradient turns to mud under a 1-bit threshold and vanishes
// under a duotone. So each placeholder carries
//
//   * a full tonal range — a light ground and a subject well down the scale,
//     so `threshold` and `halftone` find an actual edge to work with;
//   * a legible subject shape off the centre, so cropping 4:5 -> 1:1 still
//     composes;
//   * film grain, so `sepia` and `contrast` have texture to bite on.
//
// Authored at 1080x1350 (Instagram 4:5). Posts that want 1:1 crop with
// `object-fit: cover`, exactly as they would with a real photograph.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images");

const WIDTH = 1080;
const HEIGHT = 1350;

// Eighteen grounds, walked around the wheel and across the value scale so that
// no two themes' filters produce the same result twice. `ground` is the light
// end, `subject` the dark end — the pair a threshold filter will split on.
const palettes = [
  { ground: "#EDE7DE", subject: "#3B3129", accent: "#B4704A" },
  { ground: "#E4E7E9", subject: "#26313A", accent: "#5B7C8D" },
  { ground: "#F0EAE1", subject: "#4A3B2F", accent: "#C99B6A" },
  { ground: "#E9EBE4", subject: "#2F3A2C", accent: "#7E9166" },
  { ground: "#F2E9E9", subject: "#412C2E", accent: "#A9636A" },
  { ground: "#E7E9EE", subject: "#2A2E42", accent: "#6C74A0" },
  { ground: "#F1EDE3", subject: "#3A3520", accent: "#B9A05C" },
  { ground: "#E6EAEA", subject: "#213330", accent: "#5C8A82" },
  { ground: "#F0E8EC", subject: "#3A2A3C", accent: "#8E6A94" },
  { ground: "#EFEAE0", subject: "#453626", accent: "#C08A55" },
  { ground: "#E5E8EC", subject: "#232C38", accent: "#4F7391" },
  { ground: "#EEEBE3", subject: "#37372B", accent: "#8E8C63" },
  { ground: "#F2E7E2", subject: "#432E26", accent: "#B0724F" },
  { ground: "#E4EAE7", subject: "#22342E", accent: "#5E8B74" },
  { ground: "#EDE9EF", subject: "#302B3E", accent: "#7A6F9C" },
  { ground: "#F1ECE4", subject: "#3E3527", accent: "#AE8B58" },
  { ground: "#E6E9EB", subject: "#252F36", accent: "#5A7C8C" },
  { ground: "#F0E9E6", subject: "#3D3029", accent: "#A67A5E" },
];

// Six subject arrangements, cycled across the pool. Each one puts real form in
// the frame — an edge, a curve, a horizon — so the filters have something to
// describe. Coordinates are in the 1080x1350 user space.
const compositions = [
  // A large sphere, low and left, with a cast shadow.
  (c) => `
    <ellipse cx="330" cy="1130" rx="300" ry="46" fill="${c.subject}" opacity="0.22"/>
    <circle cx="380" cy="880" r="270" fill="url(#sphere)"/>
    <rect x="0" y="0" width="${WIDTH}" height="470" fill="${c.accent}" opacity="0.16"/>`,
  // A horizon with a standing rectangle — the most photograph-like of the set.
  (c) => `
    <rect x="0" y="760" width="${WIDTH}" height="${HEIGHT - 760}" fill="${c.subject}" opacity="0.82"/>
    <rect x="620" y="330" width="250" height="640" fill="${c.accent}" opacity="0.85"/>
    <circle cx="290" cy="360" r="130" fill="${c.accent}" opacity="0.5"/>`,
  // An arc cropped by the top edge, with a horizontal band.
  (c) => `
    <path d="M -60 620 A 640 640 0 0 1 1140 620 Z" fill="${c.subject}" opacity="0.9"/>
    <rect x="0" y="900" width="${WIDTH}" height="160" fill="${c.accent}" opacity="0.7"/>
    <circle cx="820" cy="1160" r="120" fill="${c.subject}" opacity="0.45"/>`,
  // Stacked bars, off-centre — reads as structure under a halftone.
  (c) => `
    <rect x="140" y="260" width="800" height="150" fill="${c.subject}" opacity="0.88"/>
    <rect x="140" y="470" width="560" height="150" fill="${c.accent}" opacity="0.9"/>
    <rect x="140" y="680" width="800" height="150" fill="${c.subject}" opacity="0.55"/>
    <rect x="140" y="890" width="380" height="150" fill="${c.accent}" opacity="0.7"/>`,
  // A soft vertical gradient wall with a punched circular aperture.
  (c) => `
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#wall)"/>
    <circle cx="700" cy="640" r="240" fill="${c.ground}"/>
    <circle cx="700" cy="640" r="240" fill="none" stroke="${c.subject}" stroke-width="8" opacity="0.6"/>
    <rect x="0" y="1080" width="${WIDTH}" height="270" fill="${c.subject}" opacity="0.75"/>`,
  // Two overlapping planes at an angle — deep shadow in the overlap.
  (c) => `
    <polygon points="0,340 780,140 780,900 0,1120" fill="${c.subject}" opacity="0.8"/>
    <polygon points="380,520 1080,300 1080,1080 380,1260" fill="${c.accent}" opacity="0.75"/>
    <rect x="0" y="1240" width="${WIDTH}" height="110" fill="${c.subject}" opacity="0.5"/>`,
];

function svg(index, c, composition) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${c.ground}"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="sphere" cx="0.36" cy="0.3" r="0.85">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="55%" stop-color="${c.subject}" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="${c.subject}"/>
    </radialGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${c.subject}" stop-opacity="0.95"/>
    </linearGradient>
    <!-- Film grain. Kept subtle; sepia and high-contrast treatments amplify it. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${index * 7}" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#ground)"/>
  ${composition(c)}
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#grain)" opacity="0.14" style="mix-blend-mode:overlay"/>
</svg>
`;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (let i = 0; i < 18; i++) {
    const name = `photo-${String(i + 1).padStart(2, "0")}`;
    const palette = palettes[i];
    const composition = compositions[i % compositions.length];
    await writeFile(join(outDir, `${name}.svg`), svg(i, palette, composition), "utf8");
  }

  console.log(`Wrote 18 placeholders to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
