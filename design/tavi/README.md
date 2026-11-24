# Tavi Ceasornicaru: the approved sketch

The design record for `sites/tavi`, the interactive watch site for Tavi Ceasornicaru. The owner approved direction A,
"The workshop explained", on 2026-11-24, from these files. They are the spec for the site's briefs (09 onward in
[corpus/briefs/](../../corpus/briefs/)). Nobody edits them; they record what was approved.

## What is here

| Path | What it is |
| --- | --- |
| `sketch.html` | The approved sketch: header, hero with the drawn ticking movement, contents band, chapter 1 (Energy) beside its sticky figure, footer. Open it in a browser. Built from `gen/` |
| `prototype.html` | The three.js centrepiece on its own page: the same movement from the same part table, ticking, slowing down and coming apart with labels. One file, three.js 0.187.0 from a CDN |
| `direction.md` | The design system as built: palette and part colours, type, the seven chapters, motion rules, the fallback ladder, and what the full site adds beyond the sketch |
| `critique.md` | The self-review before the owner saw it: what holds up, the weakest points, the fixes already made, and what was left for the site |
| `sketch-1280x800.png`, `sketch-390x844.png` | Renders of the sketch's first screen, desktop and phone |
| `prototype-1280x800.png`, `prototype-apart-1280x800.png`, `prototype-390x844.png` | Renders of the prototype, assembled and taken apart |
| `gen/geometry.mjs` | The one part table: a 21,600 vph train (barrel 72/12, centre 80/10, third 75/10, fourth 84/7, a 15-tooth escape wheel), every meshing pair at the sum of its pitch radii, and `check()` |
| `gen/movement.mjs` | Draws the part table as SVG: wheels, escape wheel, pallet fork, balance and hairspring, bridges, jewels, screws, the barrel opened, callouts |
| `gen/sketch.src.html`, `gen/build.mjs` | The sketch's page source and the script that inlines the drawings into `sketch.html` (`node gen/build.mjs`) |
| `gen/shoot.sh` | Takes a render of the sketch with the agent-browser tool: `bash gen/shoot.sh <w> <h> <abs-path.png> [#id offset]` |

The prototype exposes `taviPose(t, apart, yaw)`, `taviLook(x, y, z, span)` and `taviHide([names])` for stills, and
`stateAt(t)` for checking the clock.

## Which file wins

1. The decisions in [corpus/wiki/decisions-tavi.md](../../corpus/wiki/decisions-tavi.md) and the briefs.
2. `sketch.html` and `prototype.html`, with `direction.md`'s tokens, type, chapters, motion and fallback ladder.
3. `critique.md`, for why each fix was made and what was left for the site.
4. The renders, which show the sketch at device pixel ratio 1 only.

## What is out of date

- Both pages load Newsreader and IBM Plex Mono from Google Fonts, and the prototype loads three.js from cdnjs. The
  site self-hosts the fonts and bundles three.js: it makes no third-party request.
- The sketch's controls are native range inputs, radio buttons and a `<details>` Chapters menu. The site builds them
  on Base UI as the repo's other sites do: sliders, a radio group for the speed, and a drawer for the Chapters menu.
- The prototype opens at a 34° tilt. In the site the 3D opens on the poster's flat top view and tilts on the first
  drag, so the swap from the drawing doesn't jump.
- The prototype's labels fan into one column on desktop, where some leaders cross, and label only eight parts on a
  phone. The site puts the labels in two columns on desktop and a parts list under the figure on phones.
- The prototype keeps its own copy of the part table and the gear functions. The site has one table, imported by
  both renderers.
- The footer's dashed slot, "[Tavi's line, in his own words]", waits for the owner to send Tavi's line.
- `gen/shoot.sh` was changed when it was copied here: it finds the sketch beside itself instead of naming a folder.
  The rest is as approved, and `node gen/build.mjs` rebuilds `sketch.html` byte for byte.
- The sketch's `scratch/` and `.hallmark/` folders, its browser socket folder and its working status file stayed out.
