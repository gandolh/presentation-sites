# Task 14: tavi, chapter 2, Wheels: hours into seconds, and the hands

**Depends on:** 10, 12.

**Runs before:** nothing in particular; 13 and 15 may run before or after it.

**Builder:** Opus ([routing.md](../../routing.md)): it adds the motion works to the part table and draws the dial
side, a new drawing.

**Visual work, beyond the sketch.** The sketch drew chapter 1 only. Draw this one in its system (`sites/tavi/DESIGN.md`,
the part tokens, focus by subtraction); add no token.

**Before you start:** run `brief-board guide`, then `brief-board show 14`.

## Context

Chapter 2 shows how the train turns the barrel's slow turn into hours, minutes and seconds
(`design/tavi/direction.md`, "Chapters": "the train's ratios, 72/12 to 84/7, hands on the centre and fourth wheels").
The ratios are in the part table (brief 10): barrel 72 into the centre pinion's 12 (6:1), centre 80 into the third's
10 (8:1), third 75 into the fourth's 10 (7.5:1), fourth 84 into the escape pinion's 7 (12:1). So the barrel turns once
in six hours, the centre wheel once an hour, the fourth wheel once a minute and the escape wheel 720 times an hour.

The direction's "What the full site adds" also asks for "small seconds at 6 o'clock on the dial side, driven by the
fourth wheel, with blued Breguet hands". The fourth wheel sits about 8 o'clock seen from the dial, and moving it to 6
means re-laying the whole train and redrawing the approved sketch. The planner's call
([decisions-tavi.md](../../wiki/decisions-tavi.md), "Defaults the owner can change"): the small seconds sits over the
fourth wheel, where the table puts it.

### What the chapter says (steps; write the prose in the sketch's voice, short and concrete)

1. The barrel's 72 teeth drive the centre wheel's 12-leaf pinion: six to one, so the barrel turns once in six hours.
2. The centre wheel turns once an hour. Its arbor comes through to the dial and carries the minute hand.
3. Third wheel to fourth: the fourth wheel turns once a minute, the speed of a seconds hand.
4. Fourth to escape: the escape wheel turns twelve times a minute, and chapter 3 shows what it does.
5. Turned over, the dial side: the motion works (cannon pinion 10 into a minute wheel of 30, its pinion of 8 into an
   hour wheel of 32: twelve to one) carry the hour hand; the small seconds rides the fourth wheel's arbor. Blued
   Breguet hands.

**Copy (owner, 2026-11-24):** real, checked facts for every mechanism, part name, ratio, brand and bit of trivia,
with sources in the outcome; anything about Tavi may be invented ([decisions-tavi.md](../../wiki/decisions-tavi.md), Copy).

## Files you OWN

- `sites/tavi/src/movement/`: the motion works and the hands in the table (`parts.ts`), their ratios in `clock.ts`, a
  dial drawing (`svg/dial.ts` or similar), the train's pose; tests for the new numbers
- `sites/tavi/src/pages/index.astro` (chapter 2), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, the existing parts' positions and teeth in `parts.ts` (the drawing every other chapter uses), other
  sites.

## Steps

1. **The table**: add the cannon pinion, minute wheel and pinion, hour wheel, the dial, and three hands (hour and
   minute on the centre arbor, seconds on the fourth wheel's arbor). Tests: the motion works make 12:1; the minute
   hand turns once in 3,600 s and the seconds hand once in 60 s, jumping 1° a beat.
2. **The train's pose**: the barrel, centre, third, fourth and escape wheels in colour, everything else ghosted; beside
   each mesh its ratio in Plex Mono (`72 / 12`); the wheels turning at the figure's speed.
3. **The dial side**: a new drawing in the flat style: the dial in the paper and plate tones, a railroad minute track,
   applied indices with a highlight edge, the small seconds sub-dial over the fourth wheel, blued Breguet hands in the
   screw token. The hands start at 10:10:30 and run with the figure's clock, so a still frame is repeatable. Step 5
   turns the figure over (a cross-fade under reduced motion).
4. **Steps and part names**: the five steps on brief 12's engine, each part name a button (barrel, centre wheel,
   third wheel, fourth wheel, escape wheel, minute hand, hour hand, small seconds); the tray with Pause and Speed; the
   pager on to chapter 3.
5. **`tavi.spec.ts`**: each step's pose; a part name lights its wheel; step 5 shows the dial side.

## Acceptance

- [ ] `npm run tavi:test` passes with the motion-works and hand tests; the existing tests still pass unchanged.
- [ ] The five steps re-pose the figure in turn; the ratios read in Plex Mono beside their meshes; step 5 shows the
      dial with the small seconds over the fourth wheel.
- [ ] Paused, the seconds hand stands on a whole degree; at 1/10 it jumps once every 10/6 s.
- [ ] Reduced motion: still until Play; the turn-over is a cross-fade.
- [ ] Shots at 1280 x 800 and 390 x 844 of steps 1 and 5 (out of git); sloplint against the dev server: no FAIL.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`,
  run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (planner, the owner can change it): the small seconds sits over the fourth wheel, about 8
  o'clock from the dial, not at 6.
