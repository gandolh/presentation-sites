# Task 17: tavi, chapter 5, Together: apart and back, with labels and a parts list

**Depends on:** 16.

**Runs before:** 19. The design-critic pass runs after this brief, over 16 and 17.

**Builder:** Opus ([routing.md](../../routing.md)): the centrepiece's interaction and its label layout.

**Visual work.** This brief builds an approved design. Follow the prototype; don't redesign it.

**A design-critic pass follows.** After this brief the controller runs the `design-critic` agent over chapter 5 (the
3D movement, its labels and the phone's parts list) against `design/tavi/prototype*.png` and this brief's shots. Its
fixes land in the next brief's run or a short fix brief. Leave the shots it needs (Acceptance) in your scratch folder
and name the folder in your report.

**Before you start:** run `brief-board guide`, then `brief-board show 17`.

## Context

Brief 16 put the 3D movement in chapter 5 on the fallback ladder, flat at first, with Pause and Speed. This brief makes
chapter 5 the critique's "strongest thing in either file": the whole movement taken apart in real disassembly order
and put back, with labels. Read `design/tavi/prototype.html` (`part(…)` with each part's `lift` and `win`,
`setApartUI`, `placeLabels`, `placeCamera`, the Take apart button's run from 0 to 1 and back), `direction.md` ("What
the full site adds": drag or arrow keys turn it, a tap lights a part, phones get the parts list as buttons under the
figure, desktop keeps the labels with leader lines) and `critique.md` (weakest point 2).

### Where this brief differs from the prototype

- **Labels on desktop sit in two columns**, left and right of the figure, each sorted by its anchor's height on
  screen and joined by an elbowed leader, so **no two leaders cross**. The prototype fans eight leaders into one narrow
  band on the right, and some cross.
- **Phones get a parts list under the figure** instead of crowded labels: every labelled part as a button. Only the
  chosen part's label shows in the figure. The prototype's phone view was small, with eight labels.
- **Base UI controls**: Take apart and Turn are `Slider`s; Take apart / Put back is a button that runs the slider.
- **The drawing takes apart too.** On rungs 2 and 3 (phone without 3D, no WebGL) the same tray takes the SVG poster
  apart through lift groups for the whole movement, from the same lift windows.

**Copy (owner, 2026-11-24):** real, checked facts for every mechanism, part name, ratio, brand and bit of trivia,
with sources in the outcome; anything about Tavi may be invented ([decisions-tavi.md](../../wiki/decisions-tavi.md), Copy).

## Files you OWN

- `sites/tavi/src/components/together/` (the island's tray, the parts list), `sites/tavi/src/three/` (labels,
  picking, turning), a pure label-layout module with its `node:test` file
- `sites/tavi/src/movement/svg/` (the whole movement's lift groups), `sites/tavi/src/pages/index.astro` (chapter 5's
  steps), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, the part table's values, other sites.

## Steps

1. **Steps** (prose in the sketch's voice, part names as buttons): assembled; the balance cock and balance come off;
   the train bridge and its wheels; the pallet fork and the escape wheel; the barrel bridge and the barrel; everything
   apart, labelled; put back. Each step sets Take apart and the camera's framing.
2. **Take apart**: a slider 0 to 100% driving every part's lift through its window, and a "Take apart" / "Put back"
   button that runs it over the prototype's timing (a jump under reduced motion). Screws unscrew as they lift.
3. **Turn**: a slider for the turn, plus drag and arrow keys on the focused canvas; the slider is the reliable path on
   a phone. The first turn tilts from the flat first frame (brief 16).
4. **Labels on desktop**: HTML labels over the canvas, projected from each part's anchor each frame, laid out by a pure
   function in two columns by side and sorted by screen height, with elbowed SVG leaders. A label fades when its
   anchor is hidden behind another part (a raycast every few frames). The layout function's test: for a set of poses
   (apart 100%, turn 0° and ±30°, at 1280 x 800 and 1440 x 900), no two leaders intersect.
5. **Picking**: a click or tap lights a part (raycast on pointer-up) and its name in the prose and the list; every
   other part goes to the ghost pair, as focus by subtraction does in the drawings.
6. **The phone's parts list**: under the figure, every labelled part as a button; Tab through them, Enter or a tap
   lights the part and frames it; only its label shows in the figure.
7. **The drawing apart**: brief 10's `whole` pose gains lift groups for every part from the table's lift windows, and
   the tray drives it when the poster is what shows. The parts list lights parts there too.
8. **`tavi.spec.ts`**: the checks below.

## Acceptance

- [ ] The label-layout test passes, and at 1280 x 800, apart 100%, turned 0° and ±30°, no two leaders on the page
      intersect (segments read in a Playwright evaluation).
- [ ] At 390 x 844 the parts list holds every labelled part as a button, and pressing one lights it in the figure.
- [ ] Keyboard only: Take apart, Put back, Turn and the parts list all work.
- [ ] With WebGL unavailable, the same slider takes the drawing apart.
- [ ] Reduced motion: Take apart and the turn jump; nothing moves until Play.
- [ ] Shots at 1280 x 800 (assembled, apart) and 390 x 844 (apart, the list showing), out of git, beside
      `design/tavi/prototype-*.png`; sloplint `--scope app`: no FAIL.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- None before the deploy. After it, open chapter 5 on your Android phone: "Turn it in 3D", turn it, take it apart, pick
  a part from the list (nobody has tried the 3D on a real phone yet). End move: `done` while vps-deploy has no
  `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`, run from the vps-deploy checkout, once it has one.
  The controller says which.

## Owner decisions

- Settled 2026-11-24 (critique, adopted): label leaders don't cross on desktop; phones get a parts list under the
  figure.
