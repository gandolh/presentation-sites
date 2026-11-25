---
title: The part table and its two renderers
description: One typed table holds the movement; Astro draws it as SVG at build time and a three.js island builds it in 3D.
---

The movement is one typed table in `src/movement/`. Nothing else keeps a copy of a position, a tooth count or a radius.

## What the table holds

`calibre.ts` takes a spec (tooth counts, pitch radii and the angle each wheel sits at from its neighbour) and derives
the geometry from the meshing rules: a pinion takes the module of the wheel that drives it, and each pair sits at the
sum of their pitch radii. `parts.ts` then adds what each part is made of, how high it sits, how it comes apart and what
it is called.

The calibre on the site is a 21,600 vph train of the NH35 class:

| Wheel | Teeth | Pinion on its arbor |
| --- | --- | --- |
| Barrel | 72 | none |
| Centre wheel | 80 | 12 leaves |
| Third wheel | 75 | 10 leaves |
| Fourth wheel | 84 | 10 leaves |
| Escape wheel | 15 | 7 leaves |

These tooth counts are the drawing's own, chosen so the centre wheel turns once an hour and the fourth once a minute.
They are not copied from any one maker's calibre. Another calibre is another spec, not edits across files.

Each part has an id (the drawing's `data-part` name), a material, a pivot, a layer height, an explode window, and, for
the parts the page labels, an anchor for the 3D label's leader. Parts below the plate are the dial side: the hands,
the dial and the motion works.

## The clock

`clock.ts` is one pure function, `stateAt(t)`, of time. The balance swings at the calibre's beat rate, the escape
wheel moves half a tooth each beat (a hair of recoil, the impulse, the drop, then lock), every other wheel follows by
its tooth ratio, and the hands follow the centre and fourth wheels. A beat is 1/6 of a second, and the hands start at
10:10:30.

A reserve of 0 to 41 hours lowers the balance's amplitude from the drawn one down to 65 percent of it, then eases it
to nothing over the last hour. At zero the balance stands still and so does everything it drives.

`node:test` checks the table (every meshing pair at the sum of its pitch radii, at an equal module) and the clock
(the escape wheel at 72 degrees after one second and 360 after five, the fourth wheel at 360 after one minute, 21,600
beats in an hour), inside the root `npm run check`.

## The two renderers

- **SVG, at build time.** The builders in `src/movement/svg/` (the train, the escapement, the dial, the whole
  movement) return SVG markup, which `components/drawing/Movement.astro` and the chapters place. Every chapter's figure
  is on the page before any script runs. Chapters 3 and 4 are then drawn frame by frame from the clock.
- **three.js, in one island.** `src/three/` builds the same table part by part. Each outline comes from the drawing's
  own builders (`gearOutline`, `springPath`), so the 3D scene's flat view is the drawing. Colours are read from the
  stylesheet's part tokens at runtime, never written as literals.

Chapter 6's tools are a second typed table, in `src/bench/`, drawn as SVG at real size.
