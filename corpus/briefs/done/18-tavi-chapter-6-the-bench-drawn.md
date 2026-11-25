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

## Outcome (2026-11-25)

Built on `claude/determined-brown-s3fh54` as a local commit (chapter 6's tool table, drawing, prose and tests), plus
this closeout. Board move: not made, since brief-board was not available in this session. vps-deploy has a `tavi` stack
(status.md), so by this brief's rule the move is `ready_for_deploy`, with the owner step `node cli.ts tavi deploy`
from the vps-deploy checkout.

- **The tool table** (`src/bench/tools.ts`): seven tools in millimetres on a 240 x 164 mm mat, each with its shape,
  footprint, angle, material key, prose shade and the steps that light it. The movement sits in the holder at the
  NH35's 27.4 mm (`MOVEMENT_SCALE` turns the part table's units into millimetres), turned a quarter so the crown points
  up between the rails. `loupeSlide()` is step 3's move, from the loupe's place to the balance.
- **The drawing** (`src/bench/svg.ts`): one builder a shape, top-down, flat fills with a darker outline of the same hue
  on the paper mat. The holder is Bergeon's 4040, two chromed jaws on two steel rails, their lips over the plate's
  edge, the steps on their inner faces; inside it, the hero's drawing from `movementBody("hero")`, unchanged. The loupe
  is Bergeon's 2611 eyeglass standing on its eyecup, the black body round an open 20 mm lens with a glint. The
  screwdrivers are Bergeon's 30081 set of five, 0.8 to 1.6 mm, smallest on the left: swivel caps in yellow, black,
  red, grey and violet, knurled steel handles, collets, blades ground to their widths. The tweezers are a Dumont No. 5
  in steel and a brass pair with blunter points. The oiler is Bergeon's 7013-R, red cap, knurled handle, a fine point,
  laid with its tip by the oil cup. Every tool is a `.part` with its id, so the chapter engine lights it.
- **The steps** (`index.astro`): six. Step 1 shows the whole bench in colour and names every tool; then the holder; the
  loupe with the holder; the screwdrivers; the two tweezers; the oiler and the oil cup. Each tool's name is a button
  (`src/bench/ToolName.astro`, a part name's look and shade) that lights it and drops the rest, the movement included,
  to the ghost pair. Trailing punctuation goes in its `after`, so a line never breaks between a name and its comma.
  The pager goes on to "7. Repairs".
- **Motion**: the loupe slides over the balance on step 3 (420 ms on transform, a jump under reduced motion) and back
  when the step changes. Nothing loops: the held movement's ticking is switched off in CSS, the figure has no tray
  (an empty tray is hidden) and so no Pause. The drawing takes the mat's shape, at most the screen's height under the
  header, a third of it in one column.
- **Tokens**: ten new, `--color-tool-{black,yellow,red,grey,violet}` and their `-line` shades, for the coloured plastic
  of Bergeon's caps and the loupe's body, which no part token covers. The metals reuse the parts' pairs: steel, brass,
  and the bridges' pair for chrome plate. Glass has no token and no fill: the lens is open.
- **Tests**: `bench.test.ts` (11 tests, in `npm run tavi:test`): every tool on the mat 3 mm clear of its edge, no two
  footprints overlapping (a separating-axis test, itself tested), unique ids, step 1 showing every tool and every other
  step lighting one, the movement at 27.4 mm inside the holder's 20 to 43 mm, the loupe's lens on the balance, the
  screwdrivers in blade order with distinct caps, the SVG's id, label, groups, slide and no colour of its own.
  `e2e/tavi.spec.ts`, 5 tests on both projects: each name lights its tool alone (and the movement only with the holder),
  a hover on a desktop too; the six steps light their tools and step 3 puts the lens within 1.5 px of the balance; no
  tray, no button and no running animation in the figure; under reduced motion the loupe jumps there and back; without
  scripting the six steps, the labelled drawing in step 1's colours, every name and the pager show.
- **Checked**: `npm run check` exit 0 (`tavi:test` 93 tests); `SITES=tavi npx playwright test -c e2e`: 147 passed
  after `npm run tavi:build`; `bash corpus/lint.sh` passes. Shots in the run's scratch folder, out of git:
  `chapter6-step1-1280x800.png`, `chapter6-step3-1280x800.png`, `chapter6-step5-1280x800.png`, and the same three at
  390 x 844. Sloplint: **not run**, the hallmark skill's script is not in this container; the owner or a later session
  runs it.
- **Size**: the page's HTML went from 410 to 493 kB, 107 to 131 kB gzip, most of it the movement drawn again in the
  holder (66 kB before compression). No script was added.
- **Deviations.**
  - The blades are drawn in the steel pair, not blued as the brief asked: Bergeon's blades are hardened stainless steel
    (30081) or carbon steel (30080), and no source showed a blued one, so a blue blade would be a false claim.
  - The case knife and the dust blower, optional in the brief, are left out: at their real sizes (a Bergeon 4657
    blower is 130 x 58 mm) they would crowd the mat.
  - Outside the brief's files: `src/three/view.ts`, one line. A 3D take-apart run ended `from + (to - from)` away from
    its target, 0.45000000000000007 for 0.45; once chapter 6 made the page longer, chapter 5's e2e check met it every
    full run. A run now lands on its target exactly.
  - The acceptance grep for colour literals finds two lines that predate this brief: `layouts/Base.astro`'s
    `theme-color` (`#fdfbf7`) and a comment in `three/colours.ts` that names oklch. This brief adds none.
- **Sources for the tool facts** (checked 2026-11-25 through a web search; retailer listings, since Bergeon's own
  catalogue was not reachable from this container):
  - Bergeon 30081 colour code, 0.8 mm yellow, 1.0 black, 1.2 red, 1.4 grey, 1.6 violet (and 0.5 orange, 0.6 white,
    2.0 green, 2.5 blue), and the five-piece 30081-P05 holding the five drawn: boley.de and brack.ch (30081-050 orange,
    -080 yellow, -100 black), watchia (30081-200 green, -250 blue). Stainless shank and handle, a synthetic POM head,
    hardened stainless blades: flume.de, 30081-100. The swivelling, colour-coded head: Esslinger's 30081 listings.
  - The grip, the index finger on the head and the thumb and middle finger turning the body: Horopedia, "Screwdriver".
    A blade as wide as the slot, so neither the screw head nor the plate round it is damaged: Eternal Tools, "Complete
    guide to watchmakers screwdrivers".
  - Bergeon 4040: extensible and reversible, for movements from 8¾ to 19 lignes, 20 to 43 mm; chromium plated, with a
    synthetic 4040-P: Esslinger and flume.de listings.
  - The NH35's 27.40 mm diameter: the SII NH35 specification sheet; Caliber Corner, "Seiko caliber NH35A".
  - Bergeon 2611 eyeglasses, sold by focal length with a 20 mm lens: 2 inches 5x, 1.5 inches 6.7x, in black or white:
    H.S. Walsh's 2611 listings; 250 mm over the focal length gives 4.9 and 6.6. A loupe that sits in the eye socket and
    leaves both hands free: Otto Frei's watchmaker's loupe listings.
  - Dumont No. 5, fine points, in Dumoxel, an antimagnetic stainless steel that doesn't become magnetised: Esslinger,
    "Dumont #5 tweezer EQ stainless antimagnetic", and Otto Frei's Dumoxel listing. Brass tweezers, soft and
    non-magnetic, for polished parts that mustn't be scratched: Esslinger's and Cousins' brass tweezers listings.
  - Bergeon 7013 dip oilers, the set of four 7013-4: red 0.18 mm (7013-R), blue 0.24, green 0.32, yellow 0.45:
    H.S. Walsh, flume.de and Perrin listings.
  - Moebius 9010 for the balance and escape wheel pivots, 9415 grease for the pallet stones: Esslinger, "How to oil a
    watch"; Cousins, "Moebius 9415 for pallet jewels"; Caliber Corner, "Watch oils".
  - Invented, as the copy rule allows: Tavi putting each tool back in the same place, and keeping the 2-inch loupe in
    his eye for most of a service.
