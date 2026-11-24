# Task 12: tavi, the chapter engine, on chapter 1's steps

**Depends on:** 09, 10, 11, and the design-critic pass after 11 (its fixes may land in this run first).

**Runs before:** 13 to 18. Every chapter is built on this engine.

**Builder:** Opus ([routing.md](../../routing.md)): a shared engine and the islands' contract.

**Visual work.** This brief builds an approved design. Follow the sketch; don't redesign it.

**Before you start:** run `brief-board guide`, then `brief-board show 12`.

## Context

A chapter is prose steps on the left beside a sticky figure on the right. As a step reaches the reading line, the
same drawing re-poses. Part names in the prose are buttons in the part's own colour; hovering or focusing one lights
that part, and every part the prose doesn't name drops to the ghost pair ("focus by subtraction"). Each moving figure
has a tray with its own Pause and a Speed (1×, 1/10, 1/100). On phones the figure sticks to the top at 30% of the
screen and the steps scroll under it. `design/tavi/sketch.html`'s chapter 1 is the model: its markup and CSS in
`gen/sketch.src.html` (`.chapter`, `.steps`, `.step`, `.stage`, `.tray`, `.part-name`, `.pager`) and its inline script
(the steps observer, the current-chapter observer, `focusPart`).

This brief builds that engine and proves it on chapter 1's four steps and its opened-barrel drawing at fixed poses.
Brief 13 adds chapter 1's own Wind and Take apart controls. The islands' contract is in
[decisions-tavi.md](../../wiki/decisions-tavi.md), "The islands and their shared contract": play is one state on
`<html>` through `src/lib/playback.ts`; speed is `--slow` on each figure.

### Where this brief differs from the sketch or a skill

- **The tray is a React island** with Base UI controls (rule 13): the speed is a `RadioGroup` (rule 16: one is always
  chosen, kept on the device), drawn as the sketch's segmented control; the Pause is a Base UI `Toggle` bound to
  `playback.ts`. It hydrates `client:visible`. Base UI only through `src/components/ui/` wrappers.
- **The steps observer, the part-name buttons and the current-chapter mark are a plain module script**, so the prose
  works before React arrives and with the island still loading.
- **Without scripting** the tray shows no controls that do nothing: it is hidden until the page is scripted.
- **Step height.** The critique's weakest point 3: each step was 58% of the screen tall, leaving the desktop's left
  column mostly empty paper. Try about 45 to 50% on a desktop, keep the sketch's rhythm on a phone, and record what you
  chose for the design critic.

## Files you OWN

- `sites/tavi/src/components/chapter/` (`Chapter.astro`, `Step.astro`, `PartName.astro`, `Pager.astro`,
  `FigureTray.tsx`), `sites/tavi/src/components/ui/` (`Toggle.tsx`, `RadioGroup.tsx`; `Slider.tsx` is brief 13's, so
  knip finds no unused file)
- `sites/tavi/src/lib/` (`figure.ts`, `chapters.ts`), `sites/tavi/src/pages/index.astro` (chapter 1),
  `sites/tavi/src/styles/global.css`, `sites/tavi/src/components/Header.astro` and `Contents.astro` (the current mark)
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, `src/movement/` except adding a pose's data if chapter 1 needs it, other sites.

## Steps

1. **The figure's small API**, `src/lib/figure.ts`: a figure is an element holding a drawing; `setPose(name, values)`,
   `setFocus(part | null)` and `setSpeed(1 | 10 | 100)` write data attributes and CSS custom properties on it (`--e`,
   `--slow`, `data-focus`, `data-step`) and fire one event, so the module script and the islands agree. The figure's
   state lives on the element, not in React.
2. **`Chapter.astro`, `Step.astro`, `PartName.astro`, `Pager.astro`**: the head, the steps column, the sticky figure
   card with its tray slot, and the pager ("Back to Contents", "Next chapter" with the next chapter's head). A step
   carries its pose (for chapter 1, the sketch's `data-explode`: 0.55, 0.55, 0.2, 0). A part name is a `<button>` with
   the part's prose colour and `data-part`.
3. **`chapters.ts`**: an IntersectionObserver per chapter on its steps at the sketch's reading lines (desktop
   `-45% 0px -50% 0px`, phone `-64% 0px -22% 0px`) sets the active step and the figure's pose; another marks the
   header's and the contents band's link `aria-current` only while the chapter holds the reading line, never in the
   hero. A part name's hover or focus calls `setFocus`; leaving clears it. Under reduced motion pose changes jump.
4. **`FigureTray.tsx`**: Pause and Speed, with a slot for a chapter's own controls. Its look is the sketch's tray:
   quiet bordered buttons, the segmented speed with the chosen value in blued steel, Plex Mono figures. On a phone it
   stays compact; brief 13 settles its final row.
5. **Chapter 1**: the four steps' prose from the sketch, word for word, with its part names as buttons (mainspring,
   barrel, crown, ratchet wheel, arbor, click, centre wheel); its figure is brief 10's opened-barrel drawing; its tray
   has Pause and Speed. Wind and Take apart come in brief 13; the hints under the steps can wait for it.
6. **Phones**: the figure sticks at the top at 30% of the screen, the steps scroll under it, the stage's crop fades at
   its edges as the sketch's does.
7. **`tavi.spec.ts`**: the scroll, focus, current-mark, pause, speed, keyboard and no-script checks below.

## Acceptance

- [ ] Scrolling chapter 1 at 1280 and at 390 activates each step in turn, and the figure's `data-step` and `--e`
      follow.
- [ ] Hovering or focusing "mainspring" leaves the mainspring in colour and puts every unnamed part in the ghost pair
      (the computed fill of an unnamed part equals the ghost token).
- [ ] "1 Energy" is marked current in the header and the contents band only while chapter 1 holds the reading line;
      in the hero nothing is marked.
- [ ] The tray's Pause and the header's stay in step both ways. Speed 1/10 makes the figure's animation durations ten
      times longer. Tab reaches every control; arrow keys move the speed.
- [ ] With reduced motion the figure starts still; Play runs it; step changes jump.
- [ ] With JavaScript off every step reads in full, the figure is still, and no tray control shows.
- [ ] `npm run check` exits 0, `check-base-ui` strict included; `SITES=tavi npx playwright test -c e2e` passes;
      `bash corpus/lint.sh` passes.
- [ ] Shots of chapter 1 at 1280 x 800 and 390 x 844 (out of git), read beside the sketch's chapter 1 at `#energy`;
      the step height chosen is in the outcome.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (approved sketch): steps beside a sticky figure, focus by subtraction, part names as buttons,
  every moving figure with its own Pause beside the global one.

## Outcome (2026-11-24)

Built on `main` as local commits: `0c1a0a7` (the design-critic's fixes after brief 11), `5f5c25f` (`figure.ts`),
`dc57ec6` (`chapters.ts`), `67213b8` (`Chapter`, `Step`, `PartName`, `Pager` and the chapter's styles, steps 2 and 6
together), `4aba21e` (`FigureTray` and the `Toggle` and `RadioGroup` wrappers), `7f67017` (chapter 1 on the engine),
`c5f43b8` (`tavi.spec.ts`), plus this closeout. Board move: `done`, with the owner step `node cli.ts tavi deploy` from
the vps-deploy checkout when the owner wants it live.

- **The critic's fixes after brief 11** (`0c1a0a7`). Should-fix 1: a quiet button's two labels share one grid cell
  and the idle one is only hidden (`global.css:360-369`), so the header's Pause stays 85 px wide and its links stay put
  when it turns into Play, on a toggle and on the first paint under reduced motion (a desktop test guards it, and fails
  without the fix). Should-fix 2: `text-wrap: balance` on the band's lines (`global.css:509`); at 390 five of the six
  two-column cells no longer end on one word, and "Tavi's tools, / drawn." still does (balancing can't split it
  better). Nit 3 was measured and left: at device pixel ratio 2 the footer wordmark at weight 500 has the sketch's ink
  (3,356 against 3,357) and width (200.5 px against 200.5 px); weight 450 and `"opsz" 18` are both 9% and 4% lighter
  and 3.5 px narrower. Nits 4 and 5 left, as asked.
- **What later briefs build on.**
  - `src/lib/figure.ts`: a figure is the element `#<chapter>-figure` (`figure.stage[data-figure]`).
    `setPose(figure, name, { e })` writes `data-step` and `--e` on it and drops the drawing's own `--e` (the build-time
    value for a page without scripting), so **write `--e` only on the figure**: a write on the `<svg>`, as the
    sketch's `setExplode` does, would override it. `setFocus(figure, part | null)` writes `data-focus` and toggles
    `is-focus` on every `.part[data-part=…]` (the barrel has two). `setSpeed(figure, 1 | 10 | 100)` writes `--slow`;
    `speedOf(figure)` reads it; `onFigureChange(figure, listener)` subscribes to the one `tavi:figure` event.
  - `src/lib/chapters.ts`, run once from `Chapter.astro`'s module script: every `section.chapter` with a
    `[data-figure]` gets the steps observer (the reading line `-45% 0px -50% 0px`, or `-64% 0px -22% 0px` in one
    column, below 64rem), the part names (hover and focus light the part, leaving returns to a keyboard-focused name or
    the step) and, for every `section.chapter[id]`, the current mark: `aria-current="true"` on `.chapters a` and
    `.contents-band a` for that id at `-40% 0px -55% 0px`.
  - `Chapter.astro` props `id`, `n`, `head`, `caption`, `opening` (`{ e }`), `speed` (default 1), `next`
    (`{ href, head }`); slots: the steps (default), `figure` (the drawing), `tray` (the island, inside
    `.tray.no-js:hidden`). `Step.astro` (`n`, `pose`; step 1 starts `is-active`), `PartName.astro` (`part`, a
    `PartId`; the shade is the part table's `ink`), `Pager.astro` (`n`, `next`).
  - `FigureTray.tsx` (`figure` id, `speed`, `children`): the Pause and the Speed in the tray's first row; a chapter's
    own controls are **React children** in the chapter's own island (Astro children would be static HTML), placed in
    the tray's two-column grid. A figure that opens at another speed (chapter 3, 1/10) passes it to both `Chapter`
    and `FigureTray`, or the server render shows 1×.
  - `ui/Toggle.tsx` (the quiet look, pressed in blued steel) and `ui/RadioGroup.tsx` (the segmented look, `label`,
    `labelClassName`). Base UI is imported nowhere else.
  - At 1280 x 800 the tray is below the fold while step 1 is read; tests scroll to step 2 first (`trayReady`).
- **The step height** for the design critic: **46svh** on a desktop (368 px at 800; the sketch's 58svh left most of
  the left column empty), the last step 55svh so the figure stays whole until step 4 is read (the sketch's last step
  had no height, and its figure was 140 px off the top by then). The phone keeps the sketch's 34svh and 40svh.
- **Acceptance.**
  - `SITES=tavi npx playwright test -c e2e` exit 0: 61 passed at 390 and 1280 (the Floor specs, the menu spec and
    `tavi.spec.ts`), with chapter 1's checks: each step in turn sets the figure's `data-step` and `--e` and the barrel
    bridge's transform follows; hovering and focusing "mainspring" leaves its stroke in the spring token and every
    other part's computed fill equal to the ghost token (48 shapes); "crown", named in step 2, lights alone while step
    1 is active; "1 Energy" is marked in the header and the band only while chapter 1 holds the reading line, never in
    the hero; the tray's Pause and the header's stay in step both ways; 1/10 and 1/100 make every figure animation 10
    and 100 times longer while the hero stays at 1; Tab walks the seven part names, the Pause, the Speed and the pager,
    and the arrow keys move the speed; under reduced motion the figure starts still, Play runs it and a new pose
    jumps; without scripting the four steps read in full, the figure is still and no tray control shows.
  - `npm run check` exit 0 (`check-base-ui`: 0 errors, 0 warnings, strict). `npm run tavi:build` exit 0.
    `bash corpus/lint.sh` passes.
  - Shots (out of git, in the run's scratch folder `tavi12/shots/`): `site-energy-1280x800.png` and
    `site-energy-390x844.png` beside `sketch-energy-*.png` at `#energy`, and each step at both sizes
    (`site-step1..4-*.png`, `sketch-step1..4-*.png`). At 1280 the head, the first step and the figure sit where the
    sketch's do; the tray holds only the Pause and the Speed until brief 13 adds Wind and Take apart, so the card is
    80 px shorter. At 390 the figure sticks at the top at 30% of the screen and the steps scroll under it, as in the
    sketch. At 768 x 1024 (`site-step2-768x1024.png`) each step's text is read below the figure; in the sketch at that
    width the active step sits behind the figure.
  - For the design critic: on a phone the header scrolls away, so when the page is paused (or under reduced motion)
    the only play control on screen is the tray's icon-only Pause, shown pressed in blued steel
    (`site-step2-390x844.png`).
- **Deviations.**
  - The tray's Pause keeps the word and icon "Pause" and shows its state pressed (`aria-pressed`, the accent-soft
    ground), where the sketch turns it into Play (`FigureTray.tsx:50-63`): a toggle's name must not change with its
    state, and a voice-control user says the word on it. Before the island hydrates the pressed look follows the page's
    play state (`in-data-[playing=false]:`, `FigureTray.tsx:57`).
  - One column starts at 64rem, not the sketch's 40rem, for the reading line and the 30svh figure
    (`chapters.ts:12`, `global.css:747-778`): between 40 and 64rem the sketch's 500 px figure covered its own reading
    line.
  - The last step is 55svh on a desktop (`global.css:550`), see the step height above.
  - Focus beats a step's ghosting (`global.css:1110-1121`): in the sketch, pointing at "crown" while step 1 was active
    ghosted the whole drawing. The pins, the balance's roller, the pallet's fork pin and the barrel's drum now ghost
    with their part (`global.css:957-960`, `1112-1130`); they kept their colours in the sketch. This changes brief 10's
    drawing rules; the hero's drawing has no ghosting and is unchanged.
  - `--e` lives on the figure, and the drawing's own build-time value is removed once scripted (`figure.ts:27`). The
    dashed lift axes hide in CSS when nothing is lifted (`global.css:1137`), where the sketch's script did it.
  - The speed is not saved across visits: it lives on the figure for the page's life ("kept on the device" read as
    "not saved to a server", rule 16), so chapter 3 can open at 1/10.
  - The pager is named "After chapter 1" (`Pager.astro:12`): the sketch's "Chapter pages" would repeat for every
    chapter. The hints under the steps wait for brief 13; the dev hook `window.taviPose` is not built (no step asked
    for it). Shots were taken with the repo's Playwright, not agent-browser. Steps 2 and 6 share one commit.
- **Sources for the watch facts** (checked 2026-11-24): Time Module, NH35 technical guide (`NH35_TG.pdf`): "Duration
  time: more than 41 hours (mainspring after fully wound up)", and the ratchet wheel and the click among its parts.
  Wikipedia, "Mainspring": the spring coiled round an arbor inside the barrel, which is free to turn; the spring's
  inner end on the arbor and its outer end on the barrel; the ratchet on the arbor with a click (a pawl) that stops it
  turning back; the barrel's ring of teeth meshing with the centre wheel's pinion. From the part table, not a maker's
  calibre: the barrel's 72 teeth on the centre's 12-leaf pinion, so the barrel turns once every six hours, and about
  seven turns hold 41 hours.
