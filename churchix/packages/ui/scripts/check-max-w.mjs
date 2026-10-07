// Guard for the Tailwind v4 max-w collision (see the note in src/styles/theme.css).
// In this theme bare max-w-sm|md|lg|xl bind to the spacing scale and collapse layouts.
// Fails on a bare class; variants (sm:max-w-...), max-w-2xl+ and max-w-[NNrem] pass.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const EXT = /\.(astro|tsx|ts)$/;
const SKIP = new Set(['node_modules', 'dist', '.astro']);
// Not preceded by a class-name character or a variant colon's max- prefix; not followed by one.
const BARE = /(?<![\w-])max-w-(sm|md|lg|xl)(?![\w-])/g;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.test(e.name)) yield p;
  }
}

const hits = [];
for (const top of ['apps', 'packages']) {
  for (const file of walk(join(root, top))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(BARE)) {
        // Variant-prefixed forms (sm:max-w-...) are deliberately allowed.
        const before = line.slice(0, m.index);
        if (before.endsWith(':')) continue;
        hits.push(`${relative(root, file)}:${i + 1}: ${m[0]}`);
      }
    });
  }
}

if (hits.length) {
  console.error('Bare max-w-{sm,md,lg,xl} collapses layouts in this theme. Use max-w-2xl+ or max-w-[NNrem]:');
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}
console.log('check-max-w: ok');
