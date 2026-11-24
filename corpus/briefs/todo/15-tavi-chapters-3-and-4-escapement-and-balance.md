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

## Files you OWN

- `sites/tavi/src/lib/clockFigure.ts` (new): the frame loop that applies `stateAt` to a drawing
- `sites/tavi/src/movement/svg/`: the close-up poses and the hairspring path from an angle; `src/movement/` tests if
  a pure function is added
- `sites/tavi/src/pages/index.astro` (chapters 3 and 4), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, the part table's existing values, other sites.

## Steps

1. **`clockFigure.ts`**: one loop per figure that writes the balance, roller, fork, escape wheel and hairspring
   transforms (and the path) from `stateAt(t)`, with `t` advanced by real time divided by the figure's `--slow`. It runs
   only while the page is playing (`playback.ts`), the figure is on screen (an IntersectionObserver) and the tab is
   visible; it clamps a frame's step at 0.25 s, as the prototype does, so a slow device keeps real time. Under reduced
   motion it starts on a still frame until Play. In development only, `window.taviPose(t)` poses a figure for stills.
2. **Chapter 3**: a close-up of the escape wheel, pallet fork with its ruby stones, and the roller with its impulse
   pin, cropped as the sketch crops chapter 1 (the edges fade). Each step holds a phase: the step sets `t` to a moment
   inside one beat that shows it and pauses there until Play. A beat counter in Plex Mono. The tray's Speed opens on
   1/10.
3. **Chapter 4**: the balance and hairspring large, the lift window drawn as a thin arc, the amplitude as a readout;
   the hairspring's path follows the balance angle.
4. **Part names** as buttons (escape wheel, pallet fork, pallet stones, impulse pin, balance, hairspring, roller) on
   brief 12's engine; the pagers on to chapters 4 and 5.
5. **`tavi.spec.ts`**: chapter 3 loads with 1/10 chosen; across one beat at 1/100 the escape wheel advances 12°
   (posed through the dev hook); the loop renders nothing while paused, scrolled away or hidden; reduced motion starts
   still.

## Acceptance

- [ ] Chapter 3 opens at 1/10: the radio shows it chosen on load and the figure's `--slow` is 10.
- [ ] Paused on step 1, a pallet stone holds a tooth and the fork rests on its banking (a shot at the posed `t`).
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
