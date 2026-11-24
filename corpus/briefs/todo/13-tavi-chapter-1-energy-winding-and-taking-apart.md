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
