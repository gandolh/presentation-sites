---
title: The 3D island and its fallback ladder
description: What loads three.js, what the visitor sees first, and what happens when WebGL, a phone, reduced motion or scripting is missing.
---

One React island, `components/together/MovementFigure.tsx`, carries the 3D movement. The scene is in `src/three/`, and
three.js is imported only by the island, dynamically, so nothing else on the page waits on it. The build splits it into
pieces under 500 kB that load together with the scene.

The drawing is always the first paint. The island receives it as its child and the canvas takes its place in the same
box.

## The ladder

1. **WebGL 2.** The island hydrates on the hero once the page is idle and on chapter 5 as it nears. It opens on the
   drawing's flat top view, within 2 px of it, and tilts only on the first drag or arrow key, so the swap does not
   jump. Phones load it on the hero too.
2. **A phone that reaches chapter 5 before the hero has loaded three.js.** The drawing stays, ticking in CSS, and "Turn
   it in 3D" loads the island on demand.
3. **No WebGL, or a lost context.** The drawing, taken apart through its lift groups, with one quiet line in chapter 5. A
   lost context swaps the drawing back, keeping the clock and the play state, until it returns.
4. **Reduced motion.** Whichever figure shows starts paused on a still frame until its Pause is released. Releasing it
   still runs it.
5. **No scripting.** The still drawing, all the prose and every chapter link, which the contents band carries.

The island tracks its rung as `data-gl` on its box (`poster`, `offer`, `loading`, `live`, `lost` or `flat`), which the
stylesheet reads.

## The scene

`build.ts`, `train.ts` and `bridges.ts` build each part as a group named by its table id; a turning part keeps a pivot
that names the clock angle it follows. Gear outlines are screen-width `LineSegments2` lines, because one-pixel lines
read at half the drawing's weight at a device pixel ratio of 2.

`view.ts` runs the renderer, the camera and the frame loop. It renders only while something moves, not when the page
is paused, the figure held, the canvas off screen or the tab hidden.

In chapter 5 the view also:

- comes apart with the figure's `--e`, in a watchmaker's order (the table's lift-window order: balance, pallet fork
  and winding parts, the two big bridges, the wheels, the barrel);
- turns with `data-turn`, which a drag or an arrow key on the canvas writes back;
- lights the focused part and drops the rest to the ghost pair, and chooses the part under a click that is not a drag;
- labels parts in two columns on a desktop (a pure layout function in `labels.ts`, each label a button), and on a phone
  lists them under the figure (`PartsList.tsx`) and labels the lit part alone;
- winds: the Wind control coils the 3D mainspring, steps the ratchet wheel a tooth at a time and runs the reserve down
  in real time while the figure ticks.
