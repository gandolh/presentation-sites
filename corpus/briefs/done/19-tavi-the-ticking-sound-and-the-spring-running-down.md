# Task 19: tavi, the ticking sound and the spring running down

**Depends on:** 15, 17.

**Runs before:** 20.

**Builder:** Sonnet ([routing.md](../../routing.md)): two narrow additions on the clock and the island.

**Before you start:** run `brief-board guide`, then `brief-board show 19`.

## Context

Two items from `design/tavi/direction.md`'s "What the full site adds":

- "A ticking sound, synthesised, off by default, behind a speaker toggle next to the global Pause." No recording of a
  watch exists ([decisions-tavi.md](../../wiki/decisions-tavi.md)), so it is synthesised.
- "Winding in 3D. The mainspring coils, the ratchet clicks round, the power reserve falls as it runs."

The research's method for the sound: resume the `AudioContext` inside the toggle's click handler (browsers block
audio until a visitor acts); schedule each tick on the audio clock (`currentTime`), not `setTimeout`; a 3 to 5 ms
noise burst through a band-pass filter, tick and tock a little apart in pitch.

## Files you OWN

- `sites/tavi/src/lib/sound.ts` (new, imported dynamically on the first press), the speaker toggle in
  `sites/tavi/src/components/Header.astro`
- `sites/tavi/src/movement/clock.ts` (the amplitude from the reserve) and its tests
- `sites/tavi/src/components/together/` and `sites/tavi/src/three/` (Wind in chapter 5)
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, other sites.

## Steps

1. **The toggle**: a plain `<button aria-pressed>` labelled Sound beside the global Pause, off on every visit (nothing
   stored), hidden without scripting. The first press loads `sound.ts`, makes and resumes the `AudioContext`.
2. **The ticks** follow the moving figure nearest the reading line, at its speed: six a second at 1×, slower at 1/10
   and 1/100, from the clock's beats (`stateAt`). Silent while paused, while the tab is hidden, and while no moving
   figure is in view. A soft level; a second press stops it at once.
3. **The reserve**: `stateAt` takes the reserve (0 to 41 h); the balance amplitude falls with it, and at zero the
   balance stops. Tests: full reserve gives today's amplitude; zero gives a still balance.
4. **Winding in 3D**: chapter 5's tray gains Wind as chapter 1 has it (0 to 41 h, the same readout and screen-reader
   text); with the barrel's lid off (taken apart), the 3D mainspring coils as it is wound, the ratchet wheel steps
   round a tooth at a time, and the reserve readout falls in real time at 1× (stretched at the slow speeds).
5. **`tavi.spec.ts`**: no `AudioContext` exists before the first press (a spy on its constructor); with sound on, at
   1× about six ticks are scheduled a second (a dev-only counter); none while paused.

## Acceptance

- [ ] No audio object and no sound until the toggle is pressed; then ticks at the figure's beat; none while paused or
      hidden.
- [ ] `npm run tavi:test` passes with the reserve tests.
- [ ] Wind in chapter 5 coils the 3D spring and steps the ratchet; the readout falls as it runs.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- Turn the sound on once on a phone and say if the tick is too loud or too sharp. End move: `done` while vps-deploy has
  no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`, run from the vps-deploy checkout, once it has
  one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (default, the owner can change it): the sound is synthesised and off by default.

## Outcome (2026-11-25)

- **Sound.** `sites/tavi/src/lib/sound.ts` is imported dynamically on the first press of the header's Sound toggle
  (`Header.astro`: a `<button aria-pressed>` beside the global Pause, off on every visit, nothing stored, hidden without
  scripting and not offered where `AudioContext` is missing). The click handler makes and resumes the `AudioContext`
  itself, so Safari sees a gesture, and hands it to `createSound`. A tick is 4 ms of noise through a band-pass filter,
  2700 Hz for the tick and 2250 Hz for the tock, at a master level of 0.22. Ticks are scheduled on the audio clock 0.25 s
  ahead from a 30 ms look; a late look skips beats rather than playing them in a rush. A Pause, a scroll away or a
  held step cuts what is scheduled at once, and the second press disconnects the master gain.
- **What it follows.** The moving figure nearest the reading line (mid-screen) among the hero, chapters 1 to 5, at its
  `--slow`. Figures drawn by the clock (chapters 3, 4 and 5, and the hero once its 3D view is live) stamp their moment
  (`markClock` in `lib/figure.ts`, read back by `clockOf`), so each tick lands as the balance passes rest. The CSS-driven
  ones (the hero's drawing, chapters 1 and 2) get the same rate with no phase. A figure held at a moment by a step, or
  chapter 5 with no reserve, is silent; so is chapter 3, 4 or 5 with no stamp from its clock.
- **Reserve.** `stateAt(t, { reserve })` takes 0 to 41 h (`RESERVE_HOURS`). `amplitudeAt` runs from the drawn 200
  degrees when full to 65% of it as the spring runs down, then eases to nothing over the last hour; at zero the balance
  is at rest and the fork on its banking. Open question taken at the brief's default: none; the curve itself is mine.
  The escape wheel's `steps` keep counting whole beats in the pure function, so the view stops its own clock at zero.
- **Wind in chapter 5.** The tray has a third slider, Wind, 0 to 100 of 41 h, with chapter 1's spoken value ("Wound to
  N of 41 hours"). Its readout counts hours and minutes (`14:00 of 41 h`) rather than chapter 1's whole hours,
  because a reserve falling in real time is never seen to fall in whole hours: this is a deviation from "the same
  readout". The reserve lives on the figure as `data-reserve` (hours); the 3D view runs it down by real time over
  `--slow` while the clock runs and tells the tray once a minute. The figure opens fully wound, not at chapter 1's
  62%, so its first frame and the balance's amplitude are unchanged. The three slider cells share one row from 64rem
  (four columns from 50rem), hidden but keeping their place without the 3D view. Below 50rem (a phone) Wind is left
  out: a third slider is a third row, which moved the sticky figure far enough to change which step sits on the reading
  line and broke two chapter 5 checks. A phone's reserve stays full.
- **In 3D.** `three/movement.ts` `pose(state, apart, wind)` redraws the mainspring's coils (`springPath`, through
  `setCurtain` in `shapes.ts`, which gives each view geometry of its own on first use so the hero's is untouched) when
  the wind moves by 0.2%, and turns the ratchet wheel by whole teeth over the arbor's 4.1 radians, standing still at a
  full spring. The click does not move. The dev hook's stats gain `reserve`, `spring`, `ratchet` and `balance`, and
  `taviPose` takes `reserve`.
- **Tests.** `clock.test.ts` (96 tests in the site, 3 new): full reserve equals the default, the amplitude falls with
  the reserve, zero is a still balance. `tavi.spec.ts`: no `AudioContext` and no `sound` request before the first
  press; about six ticks a second at 1× (a dev-only counter, `window.taviSound`), none while paused, none after the second
  press; about 0.6 a second at 1/10; the toggle hidden without scripting; Wind steps the ratchet in whole teeth and the
  readout and spoken value agree; the reserve falls at about real time and zero stills the balance and the clock.
- **Outside the brief's file list:** `lib/figure.ts`, `lib/clockFigure.ts` (the clock stamp, `data-reserve`),
  `three/build.ts`, `three/bridges.ts`, `three/shapes.ts`, `styles/global.css`, `components/together/TogetherTray.tsx`.
- Not run: sloplint (the hallmark script is not in this container). The tick has not been heard on a phone.
