# Task 16: tavi, the 3D movement island and the fallback ladder

**Depends on:** 10, 12, 15 (its frame-loop rules).

**Runs before:** 17. The design-critic pass runs after 17, over both.

**Builder:** Opus ([routing.md](../../routing.md)): 3D, the island boundary and the ladder.

**Visual work.** This brief ports an approved prototype. Match it; don't redesign it.

**Before you start:** run `brief-board guide`, then `brief-board show 16`.

## Context

`design/tavi/prototype.html` is the centrepiece on its own page: the movement built in three.js from the part table,
flat colour per part with same-hue outlines, one vertex-coloured material and one mesh per outlined part (109 draw
calls), ticking from `stateAt(t)`, slowing down and coming apart. Read it whole, with the design
[README](../../../design/tavi/README.md) (its hooks for stills), `direction.md` ("Fallback ladder") and `critique.md`
("Weakest" 1 and 2).

This brief puts it in chapter 5 as the one React island for the movement, on the ladder
([decisions-tavi.md](../../wiki/decisions-tavi.md), "The fallback ladder, and where the 3D lives"):

1. Desktop with WebGL 2: the island replaces the SVG poster in the same box.
2. Phones (narrow and a coarse pointer): the poster stays; a "Turn it in 3D" button loads the island on demand.
3. No WebGL, or a lost context: the poster.
4. Reduced motion: still until its Pause is released.
5. No scripting: the still poster.

Brief 17 adds the chapter's steps, Take apart with labels, the parts list and turning. This brief ends with the 3D
movement ticking in chapter 5 at its flat first frame, with Pause and Speed.

### Where this brief differs from the prototype

- **three.js is bundled**, `three` and `@types/three` 0.187.0 pinned exactly, and imported dynamically inside the
  island: not the prototype's CDN import map. Nothing loads it but the island.
- **One part table.** The scene reads positions, teeth, radii and lift windows from `src/movement/` and angles from
  `clock.ts`. The prototype's own copy of the table and its gear functions are not ported; where the prototype samples
  an outline, sample it from brief 10's builders or a shared pure function.
- **It opens flat** (critique, weakest point 1): the first frame is the poster's top view, aligned to it in the same
  box, and it tilts to the prototype's view only on the first drag or arrow key. The prototype opens at 34°.
- **Colours from the stylesheet**: the part tokens read at runtime through a 1×1 canvas probe, as the prototype's
  `tokenColor` does (decisions-tavi, "Colours"). No colour literal in code (`check-base-ui` rule 6).
- **Lines at device pixel ratio 2** (critique, "Not checked"): the prototype's gear outlines are one-device-pixel
  lines, which look thinner than the bridges' on a HiDPI laptop or the owner's Android phone. Check and fix (step 6).

**Revised 2026-11-24 (owner): the 3D lives in the hero too, not only in chapter 5.** Mount the same island in the
hero's figure box as well (brief 11 sized it): the drawing paints first, the island loads after that first paint
(idle, not on first scroll) on any device with WebGL 2, phones included, opens on the drawing's flat view and tilts
on the first drag. Chapter 5 reuses the same three.js chunk and scene. The first screen must not wait on it: the
page's first paint and the hero's text come before any three.js request. See decisions-tavi.md, the fallback ladder.

## Files you OWN

- `sites/tavi/src/components/together/MovementFigure.tsx` (the island), `sites/tavi/src/three/` (scene, part
  builders, outlines, camera, loop; no file over 400 lines), tests for any pure function there (camera framing)
- `sites/tavi/src/pages/index.astro` (chapter 5's section and poster), `sites/tavi/src/styles/global.css`
- `sites/tavi/package.json` (`three`, `@types/three`), the root `package-lock.json`. tractari and subcort stay on
  three 0.185.1: after the install, `npm ls three` shows 0.187.0 under tavi and 0.185.1 for the other two.
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `wiki/site-patterns.md` (the off-screen WebGL pattern, if tavi's
  differs from tractari's), `log.md`

## Files you must NOT touch

- `design/`, the part table's values, other sites.

## Steps

1. **Chapter 5's section**: its head, one short step, and the poster: brief 10's `whole` pose (assembled, no callouts)
   in the figure box, with the tray (Pause and Speed from brief 12).
2. **The island**: `MovementFigure.tsx`, `client:visible` with a 200px root margin, the poster passed in as its child
   so the first paint is the drawing. It picks a rung: a desktop (`(min-width: 64rem) and (pointer: fine)`) with
   WebGL 2 loads three and the scene; a phone shows "Turn it in 3D", which does the same on press; a failed context
   keeps the poster with one quiet line ("This browser can't turn it in 3D; here it is flat."); `webglcontextlost`
   swaps the poster back, keeping the clock and the play state.
3. **The scene**: port the prototype's building blocks (extruded shapes with holes, the vertex-coloured material, the
   outline shells, the instanced screws and jewels, the hairspring ribbon) onto the shared table and clock.
4. **The first frame is the poster**: a camera looking straight down the movement's axis that frames exactly the
   poster's `viewBox` in the same box (orthographic, or a perspective camera far enough away to match). Swap poster
   for canvas with no layout shift. The first drag, or an arrow key with the canvas focused, eases to the prototype's
   tilt in 420 ms (a jump under reduced motion); before that it stays flat however long it runs. The canvas takes
   `touch-action: pan-y`, so a vertical drag scrolls the page.
5. **The loop**: render only while something moves; stop when paused, off screen or hidden (brief 15's rules); clamp a
   frame's step at 0.25 s; cap the pixel ratio at 2.
6. **Lines at DPR 2**: shoot a paused pose at device pixel ratio 2. If the gear outlines read thinner than the SVG's
   at the same size, draw them as screen-space-width lines (three's `LineSegments2` and `LineMaterial`, width in CSS
   pixels) and recount the draw calls (keep under about 150). Say in the outcome which method stayed and the count.
7. **The dev hook**: register `together` with brief 15's one hook, `window.taviPose("together", { t, apart, yaw,
   hide })` (`hide` lists parts to hide, as the prototype's `taviHide` did), under `import.meta.env.DEV`, for stills
   and tests. Don't add a second global.
8. **`tavi.spec.ts`**: the checks below.

## Acceptance

- [ ] At 1280 x 800 with WebGL, the poster and the island's first frame line up: the plate's circle within 2 px in
      shots of each. The swap adds under 0.01 to the layout-shift score.
- [ ] Before any drag the view stays flat; the first drag tilts it.
- [ ] The hero: at 1280 x 800 and 390 x 844 with WebGL, the first paint is the drawing with no three.js request
      before it; the island then replaces it with no layout shift and the poster alignment above.
- [ ] At 390 x 844 with touch and the hero's island not loaded (scrolled straight to chapter 5), no three.js chunk is
      requested until "Turn it in 3D" is pressed; then it loads and
      runs.
- [ ] With WebGL unavailable the poster stays with its line; a forced context loss (`WEBGL_lose_context`) returns to
      the poster.
- [ ] Reduced motion: still until its Pause is released. Zero frames over 2 s while paused, scrolled away, or in a hidden tab.
- [ ] The built chunks: three.js only in the island's chunk; the outcome lists the island's size gzipped and the
      first screen's script size before and after (unchanged).
- [ ] The DPR 2 shot reads cleanly; the outcome names the line method and the draw calls.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (owner): vanilla three.js 0.187.0 in one React island, not react-three-fiber.
- Settled 2026-11-24 (planner, the owner can change it): the 3D lives in chapter 5; the hero stays the drawing.

## Outcome (2026-11-25)

Built on `claude/determined-brown-s3fh54` as a local commit, `835c955` (the island, the scene, chapter 5 and the tests), plus
this closeout. Board move: not made, since brief-board was not available in this session. vps-deploy has a `tavi`
stack (status.md), so by this brief's rule the move is `ready_for_deploy`, with the owner step
`node cli.ts tavi deploy` from the vps-deploy checkout.

- **The island** (`src/components/together/MovementFigure.tsx`), the poster passed in as its child, so the server's
  render and the first paint are the drawing. On the hero it is `client:idle` and loads the scene once the hero is on
  screen, on any device with WebGL 2; on chapter 5 it is `client:visible` with a 200px root margin and loads at once
  on a desktop (`(min-width: 64rem) and (pointer: fine)`), or shows "Turn it in 3D" on a phone unless the hero has
  already loaded three.js on the page. Its rung is `data-gl` on the box (`poster`, `offer`, `loading`, `live`,
  `lost`, `flat`); the stylesheet shows the canvas only once it is `live`, after its first frame. Live, the poster's
  body is hidden (`display: none`, so its CSS stops) and its callouts stay over the flat view, fading when it tilts.
  No WebGL 2, or no context: the poster stays, and chapter 5 says "This browser can’t turn it in 3D; here it is
  flat." `webglcontextlost` shows the poster again (the clock and `data-playing` are kept) and
  `webglcontextrestored` brings the view back.
- **The scene** (`src/three/`, no file over 301 lines): `kit.ts`, `build.ts`, `train.ts` and `bridges.ts` port the
  prototype's building blocks onto the part table: positions, teeth, radii, heights and lift windows from
  `movement/parts.ts`, angles from `stateAt(t)` in `clock.ts`, and every outline sampled from the drawing's own
  builders (`gearOutline`, `crossings`, `escapeOutline`, `ratchetOutline`, `hull`, `springPath`, `hairspringAt`)
  through `path.ts`, a sampler of the SVG paths they write. One vertex-coloured material, outline shells, the
  mainspring's wall, the hairspring's ribbon redrawn each frame, and two instanced meshes for six bridge screws plus
  the crown wheel's and five jewels. Each view clones one template built once per page, so the hero and chapter 5
  share geometry and materials. `colours.ts` reads the part tokens through a 1×1 canvas probe; no colour is written
  in code. `movement.ts` poses and lifts it; `view.ts` runs the renderer, the camera, the loop and the drag.
- **The first frame is the poster** (`camera.ts`, pure, tested in `camera.test.ts`): a perspective camera at a 0.5°
  field of view, straight down the axis, framing the poster's viewBox in the box as SVG's `xMidYMid meet` does; the
  test projects the viewBox's corners and the plate's edge at the plate's height and 35 units above it, and all land
  within 0.5 px of where the poster draws them. The first drag (4 px or more) or ArrowLeft/ArrowRight on the focused
  canvas eases field of view, tilt, framing and yaw together to the prototype's view (22°, 34° tilt, -18° yaw, fitted
  as the prototype fits it) in 420 ms on the `--ease-out` curve; under reduced motion it jumps. Before that it stays
  flat however long it runs. The canvas takes `touch-action: pan-y`.
- **The loop** keeps brief 15's rules: `t` moves by real time over the figure's `--slow`, a step clamped to 0 to
  0.25 s (a frame's timestamp can precede the wake, which stepped the clock back by a few milliseconds); frames only
  while the page plays, the figure isn't held, the canvas is on screen and the tab is visible, or while the tilt
  eases; one frame for a resize or a drag while still. Pixel ratio capped at 2. The clock starts half a beat in, the
  balance at rest and the fork centred, as the poster draws them.
- **Lines at DPR 2** (step 6): shot paused at device pixel ratio 2, the prototype's `EdgesGeometry` lines are one
  device pixel, about half the drawing's outline at that size. They are drawn now as screen-width lines,
  `LineSegments2` with `LineMaterial`, `linewidth` in CSS pixels set each frame to the drawing's 1.1 units at the
  view's scale (`setLineScale`), so the flat view's gear outlines match the poster's weight. **80 draw calls** either
  way (the prototype's 109); 125,140 triangles with the wide lines, 49,360 with one-pixel ones. Shots
  `dpr2-compare.png` (poster, one-pixel lines, wide lines) in the run's scratch folder, out of git.
- **The dev hook**: `registerPose` from `lib/clockFigure.ts`, no second global. `window.taviPose("together" | "hero",
  { t, apart, yaw, hide })`: `t` holds the figure there, `apart` lifts the parts (0 to 1), `yaw` (degrees) puts the
  view at full tilt turned to it, `hide` leaves out parts by table id; it returns the view's numbers (frames, draw
  calls, triangles, `t`, `apart`, `tilt`, pixel ratio). An empty pose only reads them.
- **Chapter 5** (`index.astro`): its head, one step (the whole movement, the plate as the floor, the bridges holding
  the top pivots in synthetic rubies, "A Seiko NH35 has 24 of those jewels"), the `whole` poster in a
  `-250 -205 450 410` frame, the tray's Pause and Speed, and the pager on to chapter 6. The step is shorter than the
  figure, so the figure doesn't stick yet; brief 17's steps give it room. The `whole` poster keeps every colour on its
  step (focus by subtraction leaves `.mode-whole` alone).
- **Acceptance.**
  - 1280 x 800: the plate's left, right, top and bottom edges in a shot of the 3D view and a shot of the poster in the
    same box are within 2 px, on the hero and on chapter 5; also on the hero at 390 x 844 (tested). The layout-shift
    score from the swap on is under 0.01 (tested, both sizes).
  - Flat after 1.2 s of ticking, tilted after a 60 px drag; ArrowLeft on the hero's canvas tilts it too, and its
    callouts fade (tested).
  - The hero: first contentful paint before any three.js request, at both sizes (tested). Measured on the build:
    first paint at 40 to 56 ms, the scene chunk requested at 190 to 245 ms.
  - 390 x 844 with touch, opened at `/#together`: no three.js request for 1.5 s after the button shows, the hero still
    on its poster; pressing "Turn it in 3D" loads it and it runs (tested).
  - Without WebGL the posters stay, chapter 5's with its line; `WEBGL_lose_context` shows the poster, keeps
    `data-playing` and the clock, and `restoreContext` brings the view back (tested).
  - Zero frames over 2 s while paused (the tray's Pause), scrolled away (chapter 2) and hidden, at both sizes; under
    reduced motion zero frames over 2 s and a still clock until the Pause is released (tested).
  - Built chunks (`npm run tavi:build`): three.js is only in the scene chunk `view-*.js`, 609 kB, **154.5 kB gzip**;
    the island `MovementFigure-*.js` is 4.1 kB, **2.0 kB gzip**. The first screen's own module scripts at 1280 x 800:
    **6.66 kB gzip before, 7.68 kB after**. Not unchanged: the drawing's outline builders (`draw.ts`) are now shared
    with the scene, so the shared chunk the page already loads keeps more of them (+0.86 kB), and `clockFigure` moved
    to its own chunk (+0.16 kB); Astro's inline idle loader adds 316 characters. After the first paint, at idle, the
    desktop now also loads React (about 61 kB gzip, which its first screen didn't load before: the Chapters menu
    hydrates only below 64rem), the island and the scene. On a phone, where React was already on the first screen,
    the page's scripts by `load` went from 101.1 to 102.3 kB gzip, the scene after.
  - Device pixel ratio 3 draws at 2, in under 150 calls (tested).
  - `npm run check` exit 0 (`tavi:test` 66 tests); `SITES=tavi npx playwright test -c e2e`: 127 passed, none failed, after
    `npm run tavi:build`; `bash corpus/lint.sh` passes.
  - Sloplint: **not run**, the hallmark skill's script is not in this container; the owner or a later session runs
    it.
- **Deviations.**
  - `src/components/Hero.astro` (not in this brief's files) mounts the island round the hero's drawing, as the
    owner's revision asks, and its figure takes the id `hero-figure`.
  - The phone header is `position: relative`, not `static`, in `global.css`: a static element's z-index doesn't
    apply, so the hero's positioned canvas painted over the Chapters drawer the header holds (two phone menu checks
    failed until then). It still scrolls away.
  - `e2e/tavi.spec.ts`: the hero drawing's CSS ticking checks now run without WebGL, where the drawing stays;
    chapter 4's "scrolled away" goes to chapter 2 rather than the top, where the hero's 3D view now runs; chapter 3's
    last check accepts either the 3D hero's clock or the drawing's swing.
  - Outlines follow the drawing's strokes (1.1 units centred on a `.fo` edge, 1.3 outside a band) rather than the
    prototype's 1.3-outside shells everywhere, so the flat view prints where the poster does. The wheels keep the
    prototype's meshing phases, so their teeth sit up to half a tooth round from the poster's, which draws every
    wheel from 0.
  - The dial side (hands, dial, motion works) is not built: from the back it is under the plate.
  - three's renderer gets a WebGL 2 context the view makes itself, so a browser without one returns to the poster
    without three's console error.
  - The lockfile: this container's npm 10.9 drops the `libc` fields; they were put back, so the diff is three.js and
    its types only. `npm ls three`: 0.187.0 under tavi, 0.185.1 for subcort, tractari and design-study.
  - The build now prints Vite's 500 kB chunk warning for tavi's scene chunk; brief 22's context says tavi builds
    clean, so it should take tavi too (the controller's call; its files don't include tavi's config).
- **Sources for the watch facts** (checked 2026-11-25 through a web search): Caliber Corner, "Seiko SII Caliber
  NH35", and Cousins UK, "6809 Seiko NH36 Technical Sheet": the NH35A has 24 jewels and beats 21,600 an hour.
  Synthetic rubies as the jewels of the pivots: the same sources, and brief 15's (Horopedia, "Pallet stones").
