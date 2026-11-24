# Task 13: tavi, chapter 1, Energy: winding the spring and taking the barrel apart

**Depends on:** 10, 12.

**Runs before:** nothing in particular; 14 may run first.

**Builder:** Sonnet ([routing.md](../../routing.md)): a port of the sketch's chapter 1 controls onto brief 12's
engine.

**Visual work.** This brief builds an approved design. Follow the sketch; don't redesign it.

**Before you start:** run `brief-board guide`, then `brief-board show 13`.

## Context

Brief 12 built the chapter engine and put chapter 1's steps and figure on it, with Pause and Speed only. The sketch's
chapter 1 tray also has **Wind** and **Take apart**, the critique's "best moment on the page": the barrel bridge,
ratchet wheel, crown wheel and click lift off along one axis with dashed assembly lines, and the mainspring coils as
you wind. Read `design/tavi/gen/sketch.src.html`'s chapter 1 markup (the two `.slider` blocks, the hints) and its
inline script (`springPath`, `setWind`, `setExplode`), and brief 10's `springPath(wind)` in `src/movement/`.

### Where this brief differs from the sketch

- **Base UI `Slider`s** through `src/components/ui/Slider.tsx` (rule 13), not native range inputs. The screen-reader
  text comes from `getAriaValueText`; Page Up and Page Down step by a large step.
- **On a phone, Wind and Take apart sit in one row of two compact sliders** (critique, "Phone"): the sketch's tray
  wrapped to two rows and took as much height as the drawing.
- **The hints** ("Slide Take apart to see inside.", "Drag Wind to coil it.") sat near the noise floor at 15px in
  `--color-muted` (critique, "Legibility"). Keep them, at no less than 15px, and make them read as hints to the
  controls, not as body text.

**Copy (owner, 2026-11-24):** real, checked facts for every mechanism, part name, ratio, brand and bit of trivia,
with sources in the outcome; anything about Tavi may be invented ([decisions-tavi.md](../../wiki/decisions-tavi.md), Copy).

## Files you OWN

- `sites/tavi/src/components/chapter/` (chapter 1's tray controls), `sites/tavi/src/components/ui/Slider.tsx`,
  `sites/tavi/src/pages/index.astro` (chapter 1), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, `src/movement/` (use `springPath` as it is; report if it needs a change), `src/lib/` (use `figure.ts`
  as it is), other sites.

## Steps

1. **Wind**: 0 to 100, the readout "25 of 41 h" in Plex Mono (`Math.round(wind × 41)`), screen-reader text "Wound to
   25 of 41 hours". Moving it redraws the mainspring with `springPath(wind)` and turns the arbor and the ratchet wheel
   as the sketch does. Start at the sketch's 62.
2. **Take apart**: 0 to 100%, written to the figure's `--e` through `figure.ts`; the bridge, ratchet, crown wheel and
   click lift along their axis; the dashed assembly axes show above 2%. Each step sets it (0.55, 0.55, 0.2, 0); the
   visitor's drag wins until the next step arrives.
3. **The hints** under steps 1 and 2.
4. **The phone tray**: Pause and Speed in one row, Wind and Take apart in the next, both compact; nothing wraps at
   390 px.
5. **`tavi.spec.ts`**: Wind at 0 and at 100 gives different spring paths and readouts; Take apart at 100 moves the
   lift groups along their axis; the sliders answer the keyboard; under reduced motion the explode jumps.

## Acceptance

- [ ] Wind changes the mainspring's path, the readout and the screen-reader text; Take apart lifts the four parts with
      their axes, and each step re-poses it.
- [ ] Every control works from the keyboard (arrows, Page Up and Down, Home and End).
- [ ] At 390 x 844 the tray is two rows with nothing wrapped, and the figure keeps at least its sketch height.
- [ ] Shots of chapter 1 at 1280 x 800 and 390 x 844 with the barrel apart (out of git), read beside the sketch at
      `#energy`, differences listed.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (approved sketch): chapter 1 as drawn, with Wind and Take apart.

## Outcome (2026-11-24)

Built on `main` as local commits: `e57bf08` (the design-critic's fixes after brief 12), `cf05433` (Wind, with the
`Slider` wrapper and chapter 1's island), `819b993` (Take apart), `4622509` (the hints), `83a746c` (the tray's rows),
`769e748` (`tavi.spec.ts`), `16bc1ec` (the slider's thumb over the tick marks), plus this closeout. Board move: `done`,
with the owner step `node cli.ts tavi deploy` from the vps-deploy checkout when the owner wants it live.

- **The critic's fixes after brief 12** (`e57bf08`).
  - Must-fix 1: the header's Pause is a toggle like the tray's. It keeps the word "Pause", the pause glyph and the
    name "Pause every moving drawing"; `aria-pressed` follows the page's play state (`Header.astro`), and while paused
    it wears the tray's pressed look (`global.css`, `:root[data-playing="false"] .global-pause`). The `.if-playing` and
    `.if-paused` rules are gone. The controller's ruling is in `corpus/wiki/decisions-tavi.md` (rung 4 "until its Pause
    is released"; a hold "released by un-pressing its tray's Pause"; a new line, "Every Pause is a toggle"), and
    `sites/tavi/DESIGN.md`'s copies of the same lines say the same. Tested: the name never changes, `aria-pressed`
    and the blued-steel ground follow each press, no Play button appears, reduced motion loads it pressed.
  - Must-fix 2: `(width < 64rem) and (height < 32rem)` takes the phone's static header and the figure at `top: 0`,
    with the phone's tighter card. Tested at 844 x 390 and 1000 x 600 (both projects, the one-column reading line):
    each step's text sits below the sticky figure as it reaches the reading line, and at 844 x 390 the header has
    scrolled away. Without the rule the 844 x 390 test fails (text 298 px under a figure ending at 323 px).
  - Should-fix 3: the tray keeps the word "Pause" at 390 (`FigureTray.tsx`); the row fits with room to spare.
  - Should-fix 4: measured and left. The empty band above the drawing at 768 x 1024 is the lift groups' travel room:
    at Take apart 100% the ratchet's top reaches y = -231.9 against the viewBox top of -250, so a trim would clip the
    parts brief 13 lifts there.
  - Nit 5: the part name's focus ring sits at offset 0 on a 1 px inline padding (`global.css`, `.part-name`), 2 px
    clear of the word before it. A 2 px offset with more padding (tried) can't clear the word before, since padding
    moves the name and not its box's edge, and it parted the name from the comma after it.
  - Nit 6: no change. At 1280 the active step's prose already computes to `--color-ink` (oklch 23%) and the others
    to `--color-ink-2` (35%), as in the sketch.
- **What later briefs build on.**
  - `src/components/ui/Slider.tsx`: `label`, `value`, `readout` (a node, set in Plex Mono), `getAriaValueText(value)`,
    `onValueChange(value, reason)` (`reason` is Base UI's: `"drag"`, `"keyboard"`, `"track-press"`...),
    `onValueCommitted`, `min`, `max`, `largeStep` (10). `thumbAlignment="edge"`, ticks every tenth inset by half the
    thumb; compact below 40rem. The thumb's disc is a pseudo-element so the floor-focus spec, which reads Base UI's
    hidden range input, measures its ring against the track.
  - `src/components/chapter/EnergyTray.tsx` is chapter 1's island (`figure`, `opening`): `FigureTray` with Wind and
    Take apart as children. Brief 19's Wind in chapter 5 can copy its `Wind`: the readout "25 of 41 h", the
    screen-reader text "Wound to 25 of 41 hours".
  - Wind writes `--wind` (0 to 1) on the figure and redraws both `.p-spring` paths with `springPath`; the stylesheet
    turns `.mode-chapter .rot-arbor` and `.rot-ratchet` by `--wind × 4.1 rad`, with a 0.62 fallback, the wind the
    drawing is built at. So the arbor's hook meets the spring's inner end from the first paint, without scripting too
    (in brief 10's drawing it pointed at 0°).
  - Take apart reads and writes the figure's `--e` through `setPose(figure, figure.dataset.step, { e })` and
    `onFigureChange`; a drag puts `dragging` on the figure (`.dragging .lift` has no transition) until it is
    committed.
  - `Step.astro` has a `hint` slot: `.try`, hidden without scripting, a small blued-steel slider glyph, 15 px in
    `--color-ink-2`, the control named in `.ctl` (weight 600, ink).
  - The tray's first row is `.tray-row` in the stylesheet. From 50 to 64rem the tray is one row (`auto` and two
    equal columns, the buttons level with the tracks); below 40rem two compact rows.
  - `trayReady` in `tavi.spec.ts` waits for the `EnergyTray` island; `globalPause(page)` and `tokenColour(page, token)`
    are new helpers.
- **Acceptance.**
  - Wind changes the mainspring's path (both outlines), the readout and the screen-reader text; Take apart lifts the
    four groups along their axis (at 100% each translate equals `--lift × (0.5, -0.866)`), the dashed axes show above
    2%, and each step re-poses it (a drag holds until the next step arrives; checked live: a drag away and back to its
    start value still clears `dragging` on release).
  - Both sliders answer the arrows, Page Up and Page Down (10) and Home and End.
  - At 390 x 844 the tray is two rows (Pause and Speed, then Wind and Take apart) with nothing wrapped, also at 360
    and 412; the drawing keeps 30svh (253 px, the sketch's), the figure ends at 403 px (the sketch's at 411).
  - `npm run check` exit 0 (`check-base-ui` 0 errors, 0 warnings); `SITES=tavi npx playwright test -c e2e` exit 0, 76
    passed; `npm run tavi:build` exit 0; `bash corpus/lint.sh` passes.
  - Shots (out of git, in the run's scratch folder `tavi13/shots/`): `site-step2-apart-1280x800.png` and
    `site-step2-apart-390x844.png` with the barrel apart, beside `sketch-step2-apart-*.png` (the sketch's explode at
    100 too). At `#energy` on 1280 the tray is below the fold and not yet hydrated, so `site-energy-apart-*` show the
    step's 55%. Differences from the sketch: the arbor's hook meets the spring's end; the hints carry the slider glyph
    and darker ink; the ticks are inset by half the thumb; the header's Pause shows pressed, not Play; the steps are
    46svh (brief 12), so step 1's text still shows above step 2 at 1280. Otherwise the figure, the tray's rows and the
    sliders sit where the sketch's do (the figure 88 to 763 px against 88 to 762 px at 1280).
- **For the design critic.** At 1000 x 600 the figure ends at 411 px, inside the one-column reading band (384 to
  468 px); at 667 x 375 at 272 px, inside 240 to 293 px. The step's text is below the figure as it arrives, but
  scrolls under it sooner than on a phone. A fuller fix moves the one-column reading line in `lib/chapters.ts` for
  short screens, outside this brief's files.
- **Deviations.**
  - `sites/tavi/DESIGN.md` changed in `e57bf08` beside `decisions-tavi.md`: it repeats the same contract lines and
    named the removed `.if-playing` and `.if-paused`.
  - The one-row tray from 50 to 64rem and the short screens' tighter card (`global.css`, `@media (50rem <= width <
    64rem)` and `(width < 64rem) and (height < 32rem)`): not in the brief, needed so the taller tray keeps must-fix 2.
  - The arbor and the ratchet wheel turn in CSS from the first paint (`--wind`), not only once Wind moves as in the
    sketch's script.
  - Take apart's screen-reader text is "55% apart" (the brief names Wind's only).
- **Sources for the watch facts** (re-read 2026-11-24 from brief 12's saved copies): Time Module, NH35 technical guide
  (`NH35_TG.pdf`): "Duration time: More than 41 hours (Mainspring after fully wound up)", the Wind scale's 41 h.
  Wikipedia, "Mainspring": "Winding the watch turns the arbor, which tightens the mainspring, wrapping it closer around
  the arbor" (the wound coils hug the arbor), and "The arbor has a ratchet attached to it, with a click to prevent the
  spring from turning the arbor backward" (the ratchet wheel turns with the arbor). The hints are the sketch's words.
