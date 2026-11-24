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
