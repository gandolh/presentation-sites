# Task 18: tavi, chapter 6, The bench, drawn

**Depends on:** 10, 12.

**Runs before:** 20.

**Builder:** Opus ([routing.md](../../routing.md)): a new drawing from nothing, in the movement's style.

**Visual work, beyond the sketch.** The sketch never drew the bench. Draw it in the movement's system
(`sites/tavi/DESIGN.md`, the part tokens, flat fills with same-hue outlines); add no token unless a tool's material has
none, and then say so in the outcome.

**Before you start:** run `brief-board guide`, then `brief-board show 18`.

## Context

The critique's verdict: "What it still lacks is Tavi. Without the bench chapter and his own line, this is a beautiful
watch explainer that happens to carry his name." Chapter 6 is where the site turns from the watch to the person who
mends it: Tavi's bench and tools, drawn, never photographed ([decisions-tavi.md](../../wiki/decisions-tavi.md)).
`direction.md`: "Tavi's loupe, screwdrivers, tweezers and movement holder, drawn"; the contents band's line is "Tavi's
tools, drawn."

Nobody has sent words from Tavi yet, and his own line waits in the footer's placeholder
([todos/tavi-own-line.md](../../todos/tavi-own-line.md)). So the prose speaks about the tools and the work they do in
a repair. **Revised 2026-11-24 (owner):** details about Tavi may be invented (fictive, never a real person's data);
the tools, their names, makers and uses must be real and checked ([decisions-tavi.md](../../wiki/decisions-tavi.md),
Copy). No review step.

## Files you OWN

- `sites/tavi/src/bench/` (new): a small typed table of the tools (shape, size, material key, label) and the SVG
  builders that draw them, with a test for anything pure that can be checked (each tool inside the bench, no overlap)
- `sites/tavi/src/pages/index.astro` (chapter 6), `sites/tavi/src/styles/global.css`
- `e2e/tavi.spec.ts`; corpus: `wiki/status.md`, `log.md`

## Files you must NOT touch

- `design/`, `src/movement/` (draw the movement in its holder with brief 10's builders at a small scale; report if
  they need a change), other sites.

## Steps

1. **The tools**: a loupe, a set of screwdrivers (blued-steel blades, coloured caps as a real set has), tweezers, a
   movement holder with the movement in it (the same drawing, small), and, if the composition wants them, an oiler, a
   case knife and a dust blower. Drawn top-down on the bench mat like the movement: flat material fills, darker
   outlines of the same hue, the paper ground.
2. **The steps**: one per tool or pair of tools, what it does in a repair, each tool's name a button that lights it,
   focus by subtraction as in the movement chapters. The figure sticks beside the steps as the others do.
3. **Motion**: nothing loops. If a tool moves on a step (the loupe sliding over the movement), it eases on transform
   and jumps under reduced motion; with nothing moving, the tray holds no Pause.
4. **The pager** on to the footer's chapter 7, Repairs.
5. **`tavi.spec.ts`**: each tool's button lights its tool; the chapter reads in full with scripting off.

## Acceptance

- [ ] Every tool has a name button in the prose that lights it in the drawing.
- [ ] `git grep -nE "oklch|#[0-9a-fA-F]{6}\b|rgb\(" -- sites/tavi/src ':!*.css'` finds nothing.
- [ ] Anything about Tavi is fictive; every claim about a tool or a technique is real, with its source in the outcome.
- [ ] Shots at 1280 x 800 and 390 x 844 (out of git); sloplint: no FAIL.
- [ ] `npm run check` exits 0; `SITES=tavi npx playwright test -c e2e` passes; `bash corpus/lint.sh` passes.

## Owner steps

- End move: `done` while
  vps-deploy has no `tavi` stack; `ready_for_deploy` with `node cli.ts tavi deploy`, run from the vps-deploy checkout,
  once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (owner): the bench is drawn or modelled, never photographed.
