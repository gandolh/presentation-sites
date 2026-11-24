# Task 10: tavi, the part table, the drawing at build time, and the hero poster

**Depends on:** 09.

**Runs before:** 11 to 19. Every drawing and the 3D island import what this brief writes.

**Builder:** Opus ([routing.md](../../routing.md)): geometry, the clock and the tests that pin them.

**Visual work.** This brief ports an approved drawing. Match the sketch; don't redraw it.

**Before you start:** run `brief-board guide`, then `brief-board show 10`.

## Context

The movement is one part table with two renderers ([decisions-tavi.md](../../wiki/decisions-tavi.md), "One part
table, two renderers"). In the design record it is spread over three files:

- `design/tavi/gen/geometry.mjs`: the table. A 21,600 vph train: barrel 72 teeth, centre 80 with a 12-leaf pinion,
  third 75 with 10, fourth 84 with 10, escape wheel 15 teeth with a 7-leaf pinion; pallet and balance on one line;
  ratchet and crown wheel; units where the plate's radius is 190, y down. `check()` measures centre distances.
- `design/tavi/gen/movement.mjs`: draws the table as SVG strings with classes the page's CSS colours: gear outlines,
  crossings, the club-toothed escape wheel, ratchet, bridges and cocks, jewels, screws, the mainspring and hairspring,
  the pallet fork, the balance, callouts. Two modes: `hero` (assembled, with callouts) and `chapter` (the barrel
  opened, bridge, ratchet, crown wheel and click in lift groups).
- `design/tavi/prototype.html`, lines 216 to 260: the clock. `stateAt(t)` gives the balance angle, the fork, the
  escape wheel's steps and the beat count as one pure function of time; the fork follows the impulse pin inside the
  50° lift window and rests on a banking outside it; the escape wheel recoils, takes its impulse, drops and locks.
  The drawn amplitude is 200° (`AMP`), not the real ~300°, by eye. The prototype also keeps its own copy of the table
  (its `const M` line) and its own gear functions: the site has one copy only.

This brief turns those into typed modules under `sites/tavi/src/movement/`, imported by Astro components that render
the SVG at build time (no generated files in git, no build step of their own), and later by the 3D island. subcort's
`src/lib/draft.ts` is the in-repo precedent: one model drives every graphic. It ends with the hero's drawing on the
page, ticking in CSS; brief 11 builds the hero around it.

### Where this brief differs from the design record

- The generator's unused `smooth()` helper and the unused `end` in `hairspring()` go (ESLint would fail them).
- The tests check more than `check()` did: an equal module for each meshing pair, and the clock.

## Files you OWN

- `sites/tavi/src/movement/`: the table (`parts.ts`), the clock (`clock.ts`), the SVG builders (`svg/`, split so no
  file passes 400 lines, `check-structure`'s rule 11), and their `*.test.ts`
- `sites/tavi/src/components/drawing/Movement.astro`
- `sites/tavi/src/styles/global.css` (the drawing's classes and tick animations), `sites/tavi/src/pages/index.astro`
  (the hero's drawing), `sites/tavi/package.json` (`test`), root `package.json` (`tavi:test` and the `check` list)
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, other sites.

## Steps

1. **`parts.ts`**: the calibre as one typed object, the sketch's numbers unchanged. Each part has an id, a material
   key (which token pair colours it), its centre, teeth and pitch radius, its pinion, its layer, and its explode lift
   and window (from the prototype's `part(name, label, { lift, win, spin, anchor, phone })` calls), a label and the
   prose colour key. Derive positions from the meshing rules as `geometry.mjs` does, so a different calibre is a
   different object, not edits across files.
2. **`clock.ts`**: port `stateAt(t)`, `escEase` and `forkAngle`; every train angle comes from the escape wheel's angle
   and the tooth ratios, never a per-wheel constant. The balance amplitude is a parameter with the prototype's value
   as its default (brief 19 lowers it as the spring runs down). Pure, no DOM.
3. **The tests**, `node:test` with type stripping, the way the saloon bots' tests run
   (`node --experimental-strip-types --test`): every meshing pair sits at the sum of its pitch radii (to 1e-6) and
   at an equal module (2r / N the same for wheel and pinion: 2.0, 1.4, 1.2267, 1.0); every part sits inside the plate;
   barrel to escape is 4,320:1, so the escape wheel makes 720 turns an hour; the escape wheel is at 72° at 1 s and
   360° at 5 s; the fourth wheel turns 360° in 60 s and the centre wheel in 3,600 s; 21,600 beats at 3,600 s; the fork
   never passes its bankings; `stateAt` returns the same state for the same `t`. Add the `test` script, a root
   `tavi:test`, and `tavi:test` to the root `check` list, so the tests gate.
4. **The SVG builders** under `src/movement/svg/`: port `movement.mjs` to typed modules returning SVG strings with
   the same classes and structure, reading the table. Keep both modes, plus a `whole` pose (assembled, no callouts)
   for chapter 5's poster. Each drawing gets ids unique to its instance.
5. **`Movement.astro`**: props for the pose, `viewBox`, the `aria-label` and the callouts; renders the `<svg
   role="img">` with `set:html`.
6. **The drawing's styles**, copied from `gen/sketch.src.html` into `global.css`: the part classes on the tokens, the
   ghost pair, outline widths, the lift groups (`--lift`, `--e`), and the `.rot-*` animations keyed to `--beat`
   (166.667ms) and `--slow`, running only under `.js` and `[data-playing="true"]`, with the sketch's reduced-motion
   rules. No colour literal in a class string or a script (rule 6): the colours stay in tokens.
7. **The hero's drawing**: the hero section of `index.astro` shows `<Movement pose="hero">` with the four callouts
   (Barrel, Wheel train, Balance, Escape wheel) and the sketch's `aria-label`, at the sketch's size. Its words and
   layout are brief 11's.
8. **`tavi.spec.ts`**: the hero drawing is in the HTML with scripting off; with it on, the balance's animation runs at
   166.67 ms a swing and the escape wheel's at 5 s a turn in 30 steps; with reduced motion nothing runs until
   `data-playing` is `"true"`.

## Acceptance

- [ ] `npm run tavi:test` passes the tests of step 3, and `npm run check` runs them.
- [ ] The hero's built SVG matches the sketch's: both rendered at the same box size at 1280 x 800, paused on the same
      frame, differ by under 1% of pixels (or the outcome lists each difference and why).
- [ ] `tavi.spec.ts` passes its step 8 checks.
- [ ] `git grep -nE "oklch|#[0-9a-fA-F]{6}\b|rgb\(" -- sites/tavi/src ':!*.css'` finds nothing.
- [ ] No file under `src/movement/` passes 400 lines; `npm run check` exits 0; `bash corpus/lint.sh` passes.
- [ ] A shot of the hero at device pixel ratio 2 (out of git): the gear outlines read as clearly as the bridges'.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (default, the owner can change it): the generic 21,600 vph NH35-class train, swappable through
  the part table if the owner names Tavi's favourite calibre.
