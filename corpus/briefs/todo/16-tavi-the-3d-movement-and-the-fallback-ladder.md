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
4. Reduced motion: still until Play.
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
- [ ] Reduced motion: still until Play. Zero frames over 2 s while paused, scrolled away, or in a hidden tab.
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
