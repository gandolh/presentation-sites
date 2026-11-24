# Task 11: tavi, the hero, the contents band and the footer

**Depends on:** 09, 10.

**Runs before:** 12. The design-critic pass runs between them.

**Builder:** Opus ([routing.md](../../routing.md)): the site's first look.

**Visual work.** This brief builds an approved design. Follow the sketch; don't redesign it.

**A design-critic pass follows.** After this brief the controller runs the `design-critic` agent on the built first
screen, contents band and footer against `design/tavi/` and this brief's shots. Its fixes land in the next brief's
run or a short fix brief, as Gatehouse did. Leave the shots it needs (Acceptance) in your scratch folder and name the
folder in your report.

**Before you start:** run `brief-board guide`, then `brief-board show 11`.

## Context

The first screen, the map of the chapters and the footer, as `design/tavi/sketch.html` draws them, with the drawing
brief 10 put on the page. Read [design/tavi/README.md](../../../design/tavi/README.md), then `sketch.html` beside its
source `gen/sketch.src.html` (the hero, `.contents` and `.site-foot` markup and CSS), `critique.md` ("Hierarchy",
"Does the first screen say what the site is?", "Phone") and the two `sketch-*.png` renders. The tokens and type are in
`sites/tavi/DESIGN.md`.

The words, from the sketch:

- Hero: the head "Six beats every second" (a break after "beats"), the lede "Tavi loves clocks and watches. Here is
  how one keeps time.", the button "Start with the mainspring" to `#energy`, and the figure's caption "The movement
  from the back, beating 21,600 times an hour." (the number in `.fig`).
- Contents band, seven numbered entries, each a link: Energy "Where the power waits.", Wheels "Hours down to
  seconds.", Escapement "Let out, tooth by tooth.", Balance "Six swings a second.", Together "Apart and back again.",
  The bench "Tavi's tools, drawn.", Repairs "What Tavi mends." (to `#repairs`).
- Footer, `id="repairs"`: the wordmark, "In Romanian, the name means Tavi the watchmaker.", the head "Tavi repairs
  wristwatches", the dashed slot "[Tavi's line, in his own words]", and "Every part on this page is drawn, not
  photographed."

### Where this brief differs from the sketch

- **The contents band on a phone is two columns**, not the sketch's seven-row list, which took a whole screen before
  chapter 1 (critique, "Phone").
- **The repair line stays quiet**: in the footer and the contents band's chapter 7, never on the first screen. A
  default the owner can change ([decisions-tavi.md](../../wiki/decisions-tavi.md)).
- **No contact line** of any kind, and no promise of one.

**Revised 2026-11-24 (owner): the 3D lives in the hero too.** This brief still builds the hero's figure as the
SVG drawing ticking in CSS: it is the first paint and the poster that brief 16's island replaces in place. Keep the
figure in one sized box (no layout shift when the island swaps in).

## Files you OWN

- `sites/tavi/src/components/` (`Hero.astro`, `Contents.astro`, `Footer.astro`), `sites/tavi/src/pages/index.astro`,
  `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, `src/movement/` (ask in your report if the drawing needs a change), other sites.

## Steps

1. **The hero**: the head left and the drawing right at about 520px on a desktop, nothing competing; the blue button
   the only saturated colour. On a phone: head, lede, button, then the drawing at full width with its callouts at no
   less than 14px. The drawing ticks at 1× (the head promises six beats a second); the header's Pause stops it.
2. **The contents band**: seven numbered entries with their lines, on `--color-paper-2`, as the sketch lays them on a
   desktop, two columns on a phone. It is a `<nav>` labelled for what it is. Chapter 7 links to the footer.
3. **The footer**: as the sketch, on its quiet band. The placeholder slot stays visibly a placeholder (dashed, the
   bracketed words), so nobody mistakes it for Tavi's words. The wordmark links to the top.
4. **No JavaScript added**: the hero, band and footer are Astro HTML. The motion is brief 10's CSS.
5. **Sloplint**: the hallmark skill's `scripts/sloplint.mjs` with `--genre editorial --render`, against the dev
   server. Fix every FAIL; list each WARN you keep with its reason in the outcome (the sketch kept 3 waived and 1
   dismissed).
6. **Shots** at 1280 x 800 and 390 x 844 (the first screen), plus the contents band and the footer at both widths, out
   of git. Read them beside `design/tavi/sketch-1280x800.png` and `sketch-390x844.png` and list every difference.
7. **`tavi.spec.ts`**: the hero button lands on `#energy`; the contents band's seven links land; at 390 px the band
   is two columns; no text on the first screen says "repair".

## Acceptance

- [ ] At 1280 x 800 the first screen holds the head, the lede, the button and the whole drawing with its four
      callouts. At 390 x 844 it holds the head, the lede, the button and the top of the drawing.
- [ ] At 390 px the contents band is two columns and no taller than one screen.
- [ ] The footer's placeholder slot shows, dashed; there is no contact line.
- [ ] Sloplint: no FAIL. The shots read against the sketch's renders, differences listed.
- [ ] `SITES=tavi npx playwright test -c e2e` passes (Floor and `tavi.spec.ts`).
- [ ] `npm run check` exits 0; `bash corpus/lint.sh` passes.

## Owner steps

- None. The owner judges the first look after the design-critic pass. End move: `done` while vps-deploy has no
  `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`, run from the vps-deploy checkout, once it has one.
  The controller says which.

## Owner decisions

- Settled 2026-11-24 (owner): no contact details yet.
- Settled 2026-11-24 (default, the owner can change it): the repair line stays quiet; Tavi's own line stays a
  placeholder until the owner sends it ([todos/tavi-own-line.md](../../todos/tavi-own-line.md)).
