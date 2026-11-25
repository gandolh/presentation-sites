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
- [ ] Reduced motion: Take apart and the turn jump; nothing moves until its Pause is released.
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

## Outcome (2026-11-25)

Built on `claude/determined-brown-s3fh54` as a local commit, `cfc19aa` (chapter 5's steps, the tray, the labels,
picking, turning, the parts list, the drawing apart and the tests), plus this closeout. Board move: not made, since
brief-board was not available in this session. vps-deploy has a `tavi` stack (status.md), so by this brief's rule the
move is `ready_for_deploy`, with the owner step `node cli.ts tavi deploy` from the vps-deploy checkout.

- **The steps** (`index.astro`): seven, part names as buttons, each with its Take apart: assembled (0); the balance
  cock and the balance with its hairspring (45%); the pallet bridge and the pallet fork, and the ratchet wheel, the
  crown wheel and the click off the barrel bridge (58%); the train bridge and the barrel bridge (68%); the escape,
  fourth, third and centre wheels, then the barrel lid and the barrel (96%); everything apart, labelled (100%); put
  back (0). Each value is where its parts have just finished lifting in the part table's windows. Steps 2 to 5 name
  their parts in `frames` (a prop of the island): while Take apart stands at the step's value, the 3D view frames
  those parts (eased over 420 ms), lights them (the rest in the ghost pair) and labels only them; moved off it, the
  whole movement is framed, lit and labelled again.
- **Take apart** (`components/together/TogetherTray.tsx`): a Base UI `Slider` on the figure's `--e`, and a "Take apart"
  / "Put back" button that runs it to 1 or 0 over the prototype's timing (1.8 s for the whole run plus 0.2 s, cubic
  in and out), the slider moving with it; a drag, a key on the slider or a new step stops the run where it is. Under
  reduced motion the button and the steps jump. A step's new value runs in the 3D view on the same timing. The view
  tilts from 34 to 68 degrees as the movement comes apart (the prototype's), and a Take apart above 0 tilts the flat
  first frame, which can't show a lift. Screws unscrew as they lift, two turns, in 3D (as before) and in the drawing.
- **Turn**: a `Slider` from -180 to 180 degrees about the view the 3D opens on (a turn of 0 is the prototype's -18
  degree yaw); the canvas's drag and ArrowLeft/ArrowRight write back to it through the figure's `data-turn`; the first
  move tilts the flat first frame. Its cell is hidden, keeping its place, while the drawing shows.
- **Labels on a desktop**: HTML buttons over the canvas and their leaders in one SVG (`three/labelLayer.ts`), placed
  each frame from the anchors projected by the camera's own arithmetic. The layout is a pure function,
  `three/labels.ts`: labels go to the column on their anchor's side; each column's rows are the least-squares fit to
  the anchors' heights a row's pitch apart (pooled adjacent violators, clamped into the box); every leader turns at
  one elbow line; any two slanted runs that cross swap rows, which shortens them, so the swaps end with no crossing.
  An anchor outside the box or under a column goes unlabelled. The camera's fit keeps the columns' share of the width
  free, scaled by how far the labels have faded in (from 30% to 60% apart, the prototype's). A label fades to 40%
  while a ray from the camera finds another part in front of its anchor: four labels a frame while the view moves,
  all of them on a still frame (19 rays, about 6 ms in headless Chromium); while some parts are lit, only those hide
  an anchor. While a part is lit the other labels fade to half and its own is bold.
- **Picking**: a click or tap that isn't a drag casts a ray (`three/picking.ts`) and chooses the labelled part under
  it (a bridge's screws stand for their bridge, the arbor for the barrel), or none over the paper; the chosen part
  again lets it go, and so does Escape on the canvas. The choice is the figure's `data-pick`; `setFocus` falls back to
  it when nothing else is pointed at (`lib/figure.ts`), so a prose name's hover and focus still win. Lit, every other
  part drops to the ghost pair: each solid swaps to a copy of its geometry painted from the ghost tokens
  (`--color-ghost-fill`, `--color-ghost-line`, read like the part tokens), lines and flats to ghost materials, the
  screws and jewels to a twin of their instanced mesh; the copies are made once per page. The prose's part names
  light with it (`is-lit`). 82 draw calls (the two twins).
- **The phone's parts list** (`PartsList.tsx`): the 19 labelled parts as Base UI toggles in the order they come off,
  one row that scrolls sideways under the figure (a fade at its end says there is more) so the stuck figure stays
  short. A press lights the part, frames it with room round it and shows its label alone, on the right. A desktop
  shows the list only where the drawing stays, and gives the drawing the row's height.
- **The drawing apart** (`movement/svg/movement.ts`): the `whole` pose wraps 20 groups in lift groups with each part's
  lift, window and spin from the table (the mainspring and arbor ride with the barrel; each bridge carries its jewels;
  its screws share its name, so they light with it). The CSS lifts each through its window with the same smoothstep
  as the 3D, along chapter 1's oblique axis at 1.4 times the table's lift, and shrinks the drawing into the frame that
  holds the lifted stack (`apartFit`, worked out at build time) by `--e` 0.5. The parts list lights its parts there.
- **Acceptance.**
  - `labels.test.ts`: the real movement built under `node:test`, apart 100%, turned 0 and ±30 degrees, in chapter 5's
    figure box at 1280 x 800 (640 x 476) and 1440 x 900 (681 x 500): every part labelled, no two leaders meet, no two
    rows closer than the pitch, every anchor between the columns; and 300 seeded random sets of 19 anchors with no
    meeting leaders. On the page at 1280 x 800, apart 100%, turned 0 and ±30 degrees: 19 leaders read from their paths,
    none meeting, the labels inside the figure and none over another (tested).
  - 390 x 844: the list holds the 19 parts as buttons in order; a press lights the part in the drawing and in 3D, with
    its label alone; a second press lets it go (tested).
  - Keyboard only, at both sizes: Take apart and Put back from the button, the Take apart slider's End, Turn's arrows
    and Page Down, then from the canvas Tab to a label (desktop) or the list (phone), Enter to light, Escape to let go
    (tested).
  - Without WebGL, at both sizes: the same slider lifts all 20 groups their full drawn lift and the drawing shrinks,
    Home puts them back, Turn is hidden, and the list lights the train bridge with its screws while the rest ghost
    (tested).
  - Reduced motion: the button's Take apart and Turn's Page Up land at once; no frame and a still clock over 2 s
    until the Pause is released (tested).
  - Shots in the run's scratch folder, out of git: `chapter5-assembled-flat-1280x800.png`,
    `chapter5-assembled-1280x800.png`, `chapter5-apart-1280x800.png`, `chapter5-apart-turned-30-1280x800.png`,
    `chapter5-apart-turned-minus-30-1280x800.png`, `chapter5-step2-balance-1280x800.png`, `chapter5-apart-390x844.png`,
    `chapter5-apart-picked-390x844.png`. Sloplint: **not run**, the hallmark skill's script is not in this container;
    the owner or a later session runs it.
  - `npm run check` exit 0 (`tavi:test` 82 tests); `SITES=tavi npx playwright test -c e2e`: 137 passed, none failed, after
    `npm run tavi:build`; `bash corpus/lint.sh` passes.
  - Built chunks: the scene `view-*.js` 620 kB, 159.4 kB gzip (154.5 before); the island 6.2 kB, 2.7 kB gzip (2.0
    before); the tray 2.4 kB, 1.2 kB gzip.
- **Deviations.**
  - The steps' order follows the lift windows, which is the order watchmakers take a movement down (the balance, then
    the pallet fork, then the bridges and the train), not the brief's list (the train bridge and its wheels before the
    pallet fork and the escape wheel): at any Take apart value the pallet fork is off before the train bridge, so the
    brief's order could not match the figure. The part table's values are unchanged.
  - Steps 2 to 5 light their own parts and label only them, as focus by subtraction does in chapters 1 to 4; with only
    framing, the close views put the other parts' labels over the movement.
  - Outside the brief's files: `lib/figure.ts` (the pick, the turn, `apartOf`; `setFocus(null)` falls back to the
    pick) and `components/chapter/FigureTray.tsx` (an `actions` slot for the button in the tray's first row).
  - Desktop labels are buttons too, so a keyboard reaches the parts where the parts list doesn't show.
  - `view.ts` is 580 lines: the chapter's apart run, turn, framing, lighting and labels share its loop's state.
  - Going back to a step whose bottom edge is already on the reading line reports no change to the steps' observer,
    so the e2e helper comes to an earlier step from the top of the page.
- **Sources for the watch facts** (checked 2026-11-25 through a web search): letting the power down at the click
  first, then the balance, then the pallet fork, before the bridges and the train: horlogerie-suisse, "Disassembling a
  mechanical watch", and Nicholas Hacko, "DIY Seiko 7S26", chapter 9; the balance cock off before the balance with its
  stud: Seiko 4R37A technical guide. Putting back: the train, the bridges and a check that it runs freely, then the
  pallet fork, then the balance, its roller jewel seated in the fork: Hacko, chapter 12, and Watch Repair Talk. A cock
  is held at one end only, a bridge at both: Horopedia, "Balance cock". The NH35's 24 jewels: brief 16's sources.
  Tavi's tray of covered dishes is invented, as the copy rule allows.
