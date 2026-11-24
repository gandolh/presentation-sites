// Inlines the generated drawings into sketch.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { movementSvg } from './movement.mjs';
import { M } from './geometry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'sketch.src.html'), 'utf8');
const hero = movementSvg({
  mode: 'hero',
  viewBox: '-250 -215 500 430',
  label: 'Diagram of a wristwatch movement seen from the back: the barrel and crown at the upper left, the wheel train across the middle, the escape wheel, pallet fork and balance at the bottom.',
  callouts: ['barrel', 'train', 'balance', 'escape'],
});
const ch1 = movementSvg({
  mode: 'chapter',
  viewBox: '-255 -250 420 345',
  label: 'Diagram of the barrel, opened: the mainspring coiled round its arbor inside the toothed drum, with the barrel bridge, ratchet wheel, crown wheel and click lifted above it.',
});
const out = src
  .replace('<!--HERO_SVG-->', hero)
  .replace('<!--CH1_SVG-->', ch1)
  .replace('__BARREL__', JSON.stringify(M.barrel.c.map((v) => +v.toFixed(3))));
writeFileSync(join(here, '..', 'sketch.html'), out);
console.log('sketch.html', out.length, 'bytes');
