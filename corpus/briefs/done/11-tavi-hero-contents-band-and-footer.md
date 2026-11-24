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

## Outcome (2026-11-24)

Built on `main` as one local commit, `44f7a7f` (the hero, the contents band, the footer, their styles and their tests),
plus this closeout. The build paused for the owner's rollout after that commit, and the rollout deployed tavi from it;
the code is unchanged since, so the live site already shows this brief. Board move: `done`, with the owner step
`node cli.ts tavi deploy` from the vps-deploy checkout when the owner wants the finished brief live.

- **What later briefs build on.**
  - `Hero.astro`: `section.hero` with `#hero-head`, `.lede`, `.btn` to `#energy`, and `figure.hero-fig` holding
    `.hero-stage` (width 100%, `aspect-ratio: 500 / 430`, at most `calc(100svh - var(--header-h) - 160px)` tall from
    64rem up, no cap below) with `#hero-movement` inside. Brief 16's island mounts inside `.hero-stage` and fills it;
    the box is 673.6 x 576 at (555.2, 105) at 1280 x 800, the same as brief 10's, and 358 x 308 at 390 x 844.
  - `Contents.astro`: `nav.contents-band#contents`, `aria-label="Chapters, with what each one shows"`, an `ol` of
    seven links (`.n`, `.t`, `.d`). `a[aria-current="true"] .n` turns the number blue, for brief 12's steps
    observer to set.
  - `Footer.astro`: `footer.site-foot#repairs`, `aria-labelledby="repairs-head"`, the wordmark to `#top`, the
    meaning line, `h2#repairs-head`, the dashed `.fill[data-fill="tavi-line"]` slot, `.foot-small`.
  - `global.css`: `.btn` (the one blue button), the hero rules, `.contents-band` and the footer rules, with the
    phone (40rem) and tablet (64rem) rules; `.btn` and `.contents-band a` are in the reduced-motion list.
  - `e2e/tavi.spec.ts`: `firstScreenText(page, pattern)` lists the visible first-screen text matching a pattern,
    leaving out the header's chapter list.
- **Acceptance.**
  - At 1280 x 800 the first screen holds the head, lede, button and the whole drawing with its four callouts; the
    band's top edge is at 782. At 390 x 844 it holds the head, lede, button and the drawing (stage at y 328), with
    callouts at 14.32 px; the band starts at 737.
  - At 390 px the band is two columns (starts at x 16 and 195) and 357 px tall, under one screen.
  - The footer's slot is dashed with the bracketed words; there is no contact line (tested).
  - `npm run tavi:build` exit 0. `SITES=tavi npx playwright test -c e2e` exit 0: 44 passed (the Floor specs, the
    menu spec and `tavi.spec.ts` at 390 and 1280; the phone-only band test runs at 390).
  - `npm run check`: the first run exited 1 on one saloon test outside this brief, `webhook-http.test.ts:171` (a
    streamed oversized body, `write ECONNRESET`); that suite alone passed three runs of three, and the second full
    run exited 0. `bash corpus/lint.sh` passes.
  - Sloplint (`--genre editorial --render`, against the dev server): 0 FAIL, 0 WARN, 3 REFLEX, all kept (the script
    exits 1 on any REFLEX). Before this brief it was the same three, at 489 and 411 px.
    - 44c, "hero ends at 587px of a 900px screen" at 1440: the rule measures the text column. The drawing and its
      caption fill the screen to about 750 and the band follows at about 820 (the 1440 x 900 shot). The sketch
      waived it.
    - 79, "313px of nothing between the hero's last content (y 587) and the fold": the same measurement, under the
      text column; the right half holds the drawing. Waived by the sketch.
    - 77, "1 thin section: 6. The bench": the chapter is a stub until its brief (18). Dismissed by the sketch.
- **Shots against the sketch** (paused after `document.fonts.ready`, out of git, in the run's scratch folder, beside
  `design/tavi/sketch-1280x800.png`, `sketch-390x844.png` and the sketch's band and footer shots):
  - 1280 x 800: matches the sketch render: head, lede and button at the same y, the same drawing box, the caption at
    704, the band's edge at 782. The shot is paused, so the header shows Play and the balance sits on another frame.
  - 390 x 844: matches down to the band at 737. The band is two columns where the sketch has a seven-row list.
  - Band at 1280: the same, except the sketch marks 1 as the current chapter (brief 12 sets `aria-current`).
  - Footer: the same layout, at the same place at both widths. The dashed slot is 7 px narrower (220 against 227),
    and the footer's wordmark reads a touch heavier: Fontsource's variable italic against the sketch's Google
    instance, both weight 500, with optical sizing applied (opsz 28).
  - For the design-critic: at 1440 x 900 the band's titles, "7 Repairs" with them, show at the bottom of the first
    screen, as in the sketch. At 1280 x 800 and on a phone they don't.
- **Deviations.**
  - The brief's steps landed as one commit, `44f7a7f`, from the paused run, not one per step.
  - The band's class is `.contents-band`, not the sketch's `.contents` (`Contents.astro:16`,
    `global.css:447`): Tailwind generates a `contents` utility (`display: contents`) that beat the component layer
    and erased the band.
  - On a phone chapter 7 takes the last row whole (`global.css:652`), so the odd seventh entry doesn't leave an
    empty cell.
  - The "no repair on the first screen" test leaves out the header's chapter list (`e2e/tavi.spec.ts:161`): the
    approved header (brief 09, the sketch) shows "7 Repairs" at 1280, and the line the test guards is the footer's
    statement.
- **Sources for the watch facts** (checked 2026-11-24): "21,600 times an hour" and "six beats" and "six swings a
  second" come from Time Module, Seiko Instruments' movement brand, product line-up page "Mechanical NH0 & NH3": the
  NH35 at 21,600 vibrations an hour (3 Hz, six vibrations a second), brief 10's source. "Ceasornicaru" is the
  colloquial articled form of "ceasornicar", the watchmaker (dexonline, "ceasornicar").
