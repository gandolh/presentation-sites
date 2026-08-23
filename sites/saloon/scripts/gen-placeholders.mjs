// Generates SVG placeholders for the gallery, hero, and portrait.
// Each placeholder is a soft gradient in the brand palette with a small label.
// Replace these with real photography in a later phase.
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images");

const palette = [
  { from: "#F4D6D0", to: "#E8A6A0" },
  { from: "#FBF7F2", to: "#F4D6D0" },
  { from: "#FAE4DB", to: "#C9A961" },
  { from: "#FFE9E2", to: "#E8A6A0" },
  { from: "#F4DED6", to: "#705955" },
  { from: "#FFDCD4", to: "#C9A961" },
];

function svg({ width, height, from, to, label }) {
  const angle = 135;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <g opacity="0.45" font-family="Playfair Display, Georgia, serif" fill="#241914">
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(Math.min(width, height) * 0.06)}" font-style="italic">${label}</text>
  </g>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Hero (wide, light)
  await writeFile(
    join(outDir, "hero.svg"),
    svg({ width: 1200, height: 1400, from: "#F4D6D0", to: "#FBF7F2", label: "Hero photo" }),
  );

  // Portrait (4:5)
  await writeFile(
    join(outDir, "ana-portrait.svg"),
    svg({ width: 800, height: 1000, from: "#FAE4DB", to: "#E8A6A0", label: "Portret Ana" }),
  );

  // Gallery (6 images, mixed aspect ratios for masonry feel) — matches
  // src/content/gallery.ts, which drives how many the page renders.
  const aspects = [
    [800, 1000],
    [800, 800],
    [800, 1100],
    [800, 900],
    [800, 1000],
    [800, 1200],
  ];
  for (let i = 0; i < 6; i++) {
    const p = palette[i];
    const [w, h] = aspects[i];
    await writeFile(
      join(outDir, `gallery-0${i + 1}.svg`),
      svg({ width: w, height: h, from: p.from, to: p.to, label: `Galerie ${i + 1}` }),
    );
  }

  // OG image
  await writeFile(
    join(outDir, "og-image.svg"),
    svg({ width: 1200, height: 630, from: "#F4D6D0", to: "#C9A961", label: "Ana Saloon" }),
  );

  console.log("✓ Placeholders generated in", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
