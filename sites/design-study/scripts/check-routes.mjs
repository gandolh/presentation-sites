// Fails the build if a style in src/content/styles.ts has no theme directory or
// no route files of its own.
//
// The 28 route files under src/pages/<slug>/ are deliberately repetitive (see
// src/lib/routes.ts for why). This is the guard that keeps that repetition
// honest: add a style to the list and forget the files, and the build stops
// here rather than 404ing at runtime.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "src/content/styles.ts"), "utf8");

// Only the slugs inside the exported array, not the ones in the union type.
const array = source.match(/export const styles: Style\[\] = \[([\s\S]*?)\n\];/);
if (!array) {
  console.error("check-routes: could not find the styles array in styles.ts");
  process.exit(1);
}

const slugs = [...array[1].matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const required = (slug) => [
  `src/themes/${slug}/Shell.astro`,
  `src/themes/${slug}/Feed.astro`,
  `src/themes/${slug}/Post.astro`,
  `src/themes/${slug}/meta.ts`,
  `src/themes/${slug}/theme.css`,
  `src/pages/${slug}/index.astro`,
  `src/pages/${slug}/[slug].astro`,
];

const missing = [];
for (const slug of slugs) {
  for (const file of required(slug)) {
    if (!existsSync(join(root, file))) missing.push(file);
  }
}

if (missing.length) {
  console.error(`check-routes: ${slugs.length} styles declared, ${missing.length} files missing:`);
  for (const file of missing) console.error(`  ${file}`);
  process.exit(1);
}

console.log(`check-routes: ${slugs.length} styles, all theme and route files present`);
