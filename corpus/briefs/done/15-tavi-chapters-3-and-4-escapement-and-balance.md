# Task 15: tavi, chapters 3 and 4, Escapement and Balance, driven by the clock

**Depends on:** 10, 12.

**Runs before:** 16 (which reuses this brief's frame loop rules), 19.

**Builder:** Opus ([routing.md](../../routing.md)): the escapement's kinematics drawn frame by frame.

**Visual work, beyond the sketch.** Draw both chapters in the sketch's system (`sites/tavi/DESIGN.md`); add no token.

**Before you start:** run `brief-board guide`, then `brief-board show 15`.

## Context

`design/tavi/direction.md`: chapter 3 shows the escape wheel and pallet fork "one tooth at a time"; chapter 4 the
balance and hairspring "breathing, six swings a second". The settled point from the critique: **chapter 3 opens at
1/10 speed**. At 1× the balance crosses the 50° lift window in about 9 ms, under one frame, so unlock, impulse, drop
and lock are a blur; at 1/10 they take about 90 ms and at 1/100 about 0.9 s.

The hero's CSS animations can't show that: `steps(30)` jumps the escape wheel a tooth at a time and has no impulse or
drop. These two figures are driven by brief 10's `stateAt(t)` each frame instead: the balance angle, the fork that
follows the impulse pin inside the lift window and rests on a banking outside it, and the escape wheel's recoil,
impulse, drop and lock. `design/tavi/prototype.html` does exactly this in 3D (`stateAt`, `applyState`, `frame`), and
its hairspring breathes with `hairPts(theta)`.

### What the chapters say (write the prose in the sketch's voice)

- **3. Escapement, let out tooth by tooth.** Locked: a pallet stone holds a tooth and the train waits. Unlock: the
  balance's impulse pin swings the fork, and the stone slides off the tooth. Impulse: the tooth pushes the stone's
  slanted face and gives the balance its push. Drop and lock: the wheel jumps a hair and the other stone catches the
  next tooth. Twelve degrees a beat, fifteen teeth, thirty beats a turn.
- **4. Balance, six swings a second.** The balance swings and the hairspring brings it back; each swing is one beat, six
  a second (21,600 an hour); the spring opens and closes as it swings; the impulse comes only inside the lift window,
  so the swing keeps its own time.

**Copy (owner, 2026-11-24):** real, checked facts for every mechanism, part name, ratio, brand and bit of trivia,
with sources in the outcome; anything about Tavi may be invented ([decisions-tavi.md](../../wiki/decisions-tavi.md), Copy).

## Files you OWN

- `sites/tavi/src/lib/clockFigure.ts` (new): the frame loop that applies `stateAt` to a drawing
- `sites/tavi/src/movement/svg/`: the close-up poses and the hairspring path from an angle; `src/movement/` tests if
  a pure function is added
- `sites/tavi/src/lib/figure.ts` (the hold), `sites/tavi/src/components/chapter/FigureTray.tsx` (its Pause shows a
  hold pressed, and un-pressing it releases the hold), `sites/tavi/src/pages/index.astro` (chapters 3 and 4), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/decisions-tavi.md` (only if the hold or the hook has to change),
  `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, the part table's existing values, other sites.

## Steps

1. **`clockFigure.ts`**: one loop per figure that writes the balance, roller, fork, escape wheel and hairspring
   transforms (and the path) from `stateAt(t)`, with `t` advanced by real time divided by the figure's `--slow`. It runs
   only while the page is playing (`playback.ts`), the figure is on screen (an IntersectionObserver) and the tab is
   visible; it clamps a frame's step at 0.25 s, as the prototype does, so a slow device keeps real time. Under reduced
   motion it starts on a still frame until its Pause is released. A figure can also be **held**: `data-hold` on the figure, a still
   frame that a step asks for. A hold is the figure's own: it never touches the page's `data-playing`, and the
   figure's tray shows its Pause pressed while it is held; un-pressing it releases the hold (and starts the page if it
   was paused). Every Pause keeps one name (a toggle); `decisions-tavi.md` has the ruling of 2026-11-24.
   Development only: one hook, `window.taviPose(figure, pose)`, keyed by the figure's id (`escapement` and `balance`
   here; brief 16 registers `together`), poses a figure for stills and tests. Both are in the islands' contract on
   [decisions-tavi.md](../../wiki/decisions-tavi.md).
2. **Chapter 3**: a close-up of the escape wheel, pallet fork with its ruby stones, and the roller with its impulse
   pin, cropped as the sketch crops chapter 1 (the edges fade). Each step holds a phase: the step sets `t` to a moment
   inside one beat that shows it and holds the figure there (`data-hold`) until its Pause is released. A beat counter in Plex Mono.
   The tray's Speed opens on 1/10.
3. **Chapter 4**: the balance and hairspring large, the lift window drawn as a thin arc, the amplitude as a readout;
   the hairspring's path follows the balance angle.
4. **Part names** as buttons (escape wheel, pallet fork, pallet stones, impulse pin, balance, hairspring, roller) on
   brief 12's engine; the pagers on to chapters 4 and 5.
5. **`tavi.spec.ts`**: chapter 3 loads with 1/10 chosen; across one beat at 1/100 the escape wheel advances 12°
   (posed through `taviPose("escapement", { t })`); the loop renders nothing while paused, scrolled away or hidden;
   reduced motion starts still; scrolling through chapter 3's steps never changes `data-playing`.

## Acceptance

- [ ] Chapter 3 opens at 1/10: the radio shows it chosen on load and the figure's `--slow` is 10.
- [ ] Held on step 1, a pallet stone holds a tooth and the fork rests on its banking (a shot at the posed `t`).
- [ ] Scrolling through chapter 3's steps never changes `data-playing` on `<html>`; the header's Pause and the hero are
      untouched by a step's hold.
- [ ] Over one beat the escape wheel's angle moves by exactly 12°, with the recoil before and the drop after.
- [ ] The loop stops: no frame for 1 s while paused, while the figure is off screen, and while the tab is hidden.
- [ ] A shot of chapter 3 at 1/100, paused, at device pixel ratio 2: the teeth and the hairspring read cleanly.
- [ ] Shots of both chapters at 1280 x 800 and 390 x 844 (out of git); sloplint: no FAIL.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (critique, adopted): chapter 3 opens at 1/10.

## Outcome (2026-11-25)

Built on `claude/determined-brown-s3fh54` as a local commit, `6cdf31d` (the loop, the hold, the close-ups,
chapters 3 and 4 and their tests), plus this closeout. Board move: not made, since brief-board was not available in
this session. vps-deploy has a `tavi` stack (status.md), so by this brief's rule the move is `ready_for_deploy`, with
the owner step `node cli.ts tavi deploy` from the vps-deploy checkout.

- **The frame loop** (`src/lib/clockFigure.ts`). `startClockFigure(name, { holds, start })` drives `#<name>-figure`:
  each frame it writes `rotate()` on every `[data-clock="escape" | "fork" | "balance"]` group and the path of
  `[data-clock="hair"]` from `stateAt(t)`, and the text of every `[data-readout]`. `t` moves by real time over the
  figure's `--slow`, a frame's step clamped at 0.25 s. It asks for a frame only while the page plays, the figure is
  on screen (an IntersectionObserver) and the tab is visible, and cancels the one pending when any of those stops.
  Reduced motion needs nothing of its own: the head script starts the page paused. Brief 16's loop can keep these
  rules; its figure registers with `registerPose("together", …)`, the same module's one dev hook
  (`window.taviPose(figure, pose)`, development builds only). A clock figure takes `{ t }`, holds there and returns the
  pose in degrees.
- **The hold** (`src/lib/figure.ts`: `hold`, `release`, `heldAt`). `data-hold` carries the held moment in seconds.
  `startClockFigure` maps steps to moments: a step with one holds the figure there, a step without one releases it.
  `FigureTray.tsx`'s Pause shows pressed while the page is paused or the figure held (from the first paint too,
  through `in-data-hold:`); un-pressing it releases the hold and plays the page; pressing it pauses the page as
  before. Nothing else touches `data-playing`. The contract in `decisions-tavi.md` needed no change.
- **The close-up** (`src/movement/svg/escapement.ts`, `closeUpSvg`). The escape wheel, the pallet fork with its two
  ruby stones, two banking pins, the roller (impulse and safety rollers) with its ruby impulse pin, and the balance
  with its hairspring, from the part table, with the bridges off. The stones are cut from the clock: each face is the
  path the tooth tip takes across the fork in the stone's unlocking beat (the locking face from full lock to the end
  of the unlock, the impulse face from there to the let-off), so the drawing agrees with `stateAt` at every moment.
  `node:test` (`escapement.test.ts`, inside `npm run tavi:test`) checks it through two beats: no tooth runs more than
  0.05 units into a stone, no tooth touches the fork's body, the impulse pin clears the fork in and out of the notch,
  a tooth tip lies on the locking face at full lock, each banking pin touches the lever at its banking, 12 degrees a
  beat with the recoil and the drop, and each held moment's phase. Outlines are non-scaling 1.1 px strokes, so the
  close-up keeps the hero's line weight; no token was added.
- **Chapter 3** (`index.astro`): five steps (locked, unlock, impulse, drop and lock, then twelve degrees a beat and
  Thomas Mudge), the first four holding the phases of beat 2, so the readouts read 24.0, 23.5, 29.3 and 36.0 degrees.
  The balance is cut away round its staff (a dashed circle) so the roller and the pin in the notch show. Opens at
  1/10 (`speed={10}`, `--slow: 10`), readouts "Beats" and "Escape wheel" in Plex Mono. Pager on to chapter 4.
- **Chapter 4**: the balance large with its arms, screws, collet and hairspring, the fork and escape wheel beside it,
  the lift window as a thin ink arc with its label and a mark on the rim in the impulse pin's direction; readouts
  "Amplitude 200°" and "Balance" (live, signed). The hairspring's path (`hairspringAt` in `pieces.ts`) turns its
  inner end with the balance and keeps its outer end at the stud, so its coils open as it unwinds and close as it
  winds. Opens at 1×. Pager on to chapter 5.
- **Part names** on brief 12's engine: escape wheel, pallet fork, pallet stones, impulse pin, balance, hairspring and
  roller. The stones are nested in the fork's group (naming the fork lights them; naming them ghosts the fork), the
  pin and the roller are their own.
- **Acceptance.**
  - Opens at 1/10: the radio is chosen on load and `--slow` is 10 (tested).
  - Held on step 1: the escape wheel at 24°, the fork at -5.279° (its banking), and a tooth tip within 0.05 units of
    the stone's locking face, measured in the page (tested); shots below.
  - Scrolling through steps 1 to 4 and back never changes `data-playing` (a MutationObserver counts 0), the header's
    Pause stays unpressed and the hero keeps ticking (tested).
  - Posed at 1/100 across one beat, the escape wheel turns 12.000°: -0.48° of recoil first, 9.84° at the end of the
    impulse, the drop to 12° after (tested through `taviPose`).
  - The loop stops: over 1 s, 0 frames asked for and 0 writes to the figure while paused, scrolled away and with the
    tab hidden (`visibilityState` overridden), and it runs again after each (tested on chapter 4).
  - Reduced motion: chapter 4 makes no frame for 1 s until its Pause is released (tested).
  - Shot at 1/100, paused, at device pixel ratio 2: the teeth, the stones and the hairspring's coils are crisp at
    1.1 px outlines (`escapement-1-100-paused-*@2.png`, `escapement-step2-impulse-drawing@2.png`).
  - Shots of both chapters at 1280 x 800 and 390 x 844, every step of chapter 3 and steps 1, 3 and 4 of chapter 4, in
    the run's scratch folder `t15/shots/`, out of git.
  - Sloplint: **not run**. The hallmark skill's `scripts/sloplint.mjs` is not in this container and no plugin
    provides it; the owner or a later session runs it with `--genre editorial --render` against the dev server.
  - `npm run check` exit 0 (typecheck, lint, format, conventions, the saloon bots, `tavi:test` with 53 tests);
    `SITES=tavi npx playwright test -c e2e` 114 passed after `npm run tavi:build` (the contrast Floor reads the build).
    One earlier full run had one failure, the focus Floor on the phone project; it passed alone, 12 times repeated
    and in the next full run, and its message was lost with the run's results. `bash corpus/lint.sh` passes.
- **Deviations.**
  - `src/components/chapter/PartName.astro` (not in this brief's files) takes three pieces the part table keeps
    inside a part: `stones`, `impulse-pin` (ruby, so the page's ink) and `roller` (steel). The part table is
    unchanged.
  - The close-up draws the impulse pin at the clock's radius (11, with a 12.5 roller, as the prototype does), not at
    the hero drawing's 6, so the pin sits in the fork's notch. Its balance has its arms 60 degrees round from the
    hero's, so the pin shows between them. Its hairspring's outer coil runs round the outside to the stud; the hero's
    small drawing takes a short curve across the coils, which the close-up's scale would show.
  - The breathing opens the coils as the spiral unwinds (the inner end turned clockwise loses part of a turn), the
    opposite sign to `prototype.html`'s `hairPts`.
  - Chapter 3's escape wheel has its own club teeth, leaning the way the clock turns it, so the stones meet their
    tips; the hero's outline is unchanged.
  - `tavi.spec.ts` gains `backToStep`: readStepOf puts a step's top on the reading line, which leaves the foot of the
    step above in the band too, so a jump straight back up never re-enters it. A visitor scrolling up does, so the
    page's step observer is unchanged.
  - `knip` warns that `registerPose` has no importer yet; it is the seam brief 16 registers `together` through.
- **Not mine, left alone.** Chapter 2 is in the code while brief 14 is still in `todo/`; nothing of it was touched.
- **Sources for the watch facts** (checked 2026-11-25 through a web search; the session could not open the pages):
  - Britannica, "lever escapement", and Wikipedia, "Thomas Mudge (horologist)": invented in England about 1755 by
    Thomas Mudge (Wikipedia's "Lever escapement" says 1754). Wikipedia, "Lever escapement": since about 1900 virtually
    every mechanical watch has used it; the pallets are angled so the escape wheel recoils a little during unlocking;
    the draw holds the lever against the banking pins while the balance swings free.
  - Horopedia, "Pallet stones", and WebChronos, "What is a watch stone?": two synthetic ruby stones with a locking
    face and an impulse face; the impulse passes to the balance through the impulse (roller) pin. Wikipedia, "Pallet
    fork": the impulse pin is set off centre in a disc on the balance staff.
  - NAWCC, Zoller, "Swiss escapement model": the escape wheel usually has 15 teeth and turns half of the 24 degrees
    between two teeth from one release to the next lock: 12 degrees a beat.
  - Professionalwatches, on the lift angle: the balance's swing while the pin is engaged, typically 48 to 54 degrees
    (the drawing's 50).
  - Caliber Corner, "Seiko NH35A", and Unimatic, "Seiko NH35A": 21,600 vibrations an hour (3 Hz), and a tolerance of
    -20 to +40 seconds a day.
  - Wikipedia, "Balance wheel": the period is set by the balance's moment of inertia and the spring's stiffness; with
    a detached escapement the balance swings free for most of its cycle. Barrington Watch Winders and WatchesBySJX on
    the hairspring breathing (expanding and contracting as the balance swings).
  - NIST: Huygens's balance wheel and spring (about 1675) let 17th-century watches keep time to about 10 minutes a
    day.
  - "About ten degrees" of impulse and the 200-degree swing are the drawing's own numbers (9.84° and the part
    table's amplitude); the page gives both with "here".
