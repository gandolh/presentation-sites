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
