# Tavi Ceasornicaru: direction A, "The workshop explained", as built

A wristwatch movement drawn as a flat technical illustration on warm paper. The visitor winds it, slows it
down and takes it apart, one chapter at a time. Every part wears its own metal; blued steel is the only UI
colour. English only, light only, no photographs, no contact line.

`sketch.html` is built by `node gen/build.mjs` from `gen/sketch.src.html`. `prototype.html` is the three.js
centrepiece, one file with no build step. `gen/geometry.mjs` holds the one part table; `gen/movement.mjs`
draws it as SVG.

## Palette

All tokens live on `:root` in `gen/sketch.src.html`. The prototype declares the same values and reads them.

| Token | Value | Job |
|---|---|---|
| `--color-paper` | `oklch(96.6% 0.011 84)` | page ground |
| `--color-paper-2`, `-3` | `oklch(93.4% 0.014 84)`, `oklch(90.2% 0.016 84)` | contents band, tray, footer, hovers |
| `--color-surface` | `oklch(98.8% 0.005 84)` | header, the sticky figure's card |
| `--color-rule`, `-strong` | `oklch(85.5% 0.014 84)`, `oklch(62% 0.016 84)` | hairlines, control borders |
| `--color-ink`, `-2` | `oklch(23% 0.016 258)`, `oklch(35% 0.014 258)` | heads, body |
| `--color-muted` | `oklch(46% 0.014 70)` | captions, readout labels |
| `--color-accent` | `oklch(43% 0.135 262)` | blued steel: the button, thumbs, the chosen speed, the current chapter |
| `--color-focus` | `oklch(45% 0.19 262)` | 2px focus ring |

Each part gets a flat fill, a darker outline of the same hue, and a text-safe shade for when the prose names it.

| Part | Fill | Line | In prose |
|---|---|---|---|
| plate | `oklch(90.5% 0.012 84)` | `oklch(56% 0.016 84)` | |
| bridges, cocks | `oklch(86.5% 0.008 245)` | `oklch(47% 0.014 245)` | |
| barrel, brass | `oklch(81% 0.088 82)` | `oklch(47% 0.08 70)` | `oklch(44% 0.085 66)` |
| train wheels, gilt | `oklch(87.5% 0.07 92)` | `oklch(50% 0.075 84)` | `oklch(44% 0.08 80)` |
| steel parts | `oklch(83% 0.01 245)` | `oklch(41% 0.016 245)` | `oklch(40% 0.02 245)` |
| mainspring | `oklch(70% 0.07 215)` | `oklch(37% 0.065 225)` | `oklch(40% 0.075 225)` |
| balance | `oklch(79% 0.075 52)` | `oklch(46% 0.085 42)` | `oklch(44% 0.09 40)` |
| screws, blued | `oklch(47% 0.13 262)` | `oklch(29% 0.08 262)` | |
| jewels, ruby | `oklch(54% 0.165 18)` | `oklch(35% 0.11 18)` | |
| ghost, out of focus | `oklch(94.6% 0.009 84)` | `oklch(80% 0.012 84)` | |

Ruby and brass are materials, never UI. Focus by subtraction: a part the prose doesn't name drops to the
ghost pair, so the step's parts are the only colour in the figure.

## Type

- Newsreader for everything that reads. Display at optical size 72, body at 17px, step prose at 19px.
  Display `clamp(2.75rem, 4.2vw + 1rem, 5.25rem)`, section heads `clamp(2.125rem, 2.2vw + 1.25rem, 3.25rem)`.
- Italic only in the wordmark, Tavi's signature. Every head is roman, one weight.
- IBM Plex Mono only for figures and readouts, the `.fig` class, always `tabular-nums` so a ticking number keeps its width.
- Labels are the body face a step smaller, sentence case, never tracked capitals.

Spacing runs 2 to 144px. Radii are 6, 8 and 14px by nesting level. The container caps at 1360px.

## Chapters

The header holds the wordmark, seven chapter links and one global Pause. Below 64rem the links fold into a
"Chapters" menu. A chapter becomes current only when it reaches the reading line.

| # | Chapter | What the figure does | In the sketch |
|---|---|---|---|
| | Hero | "Six beats every second", the whole movement ticking with four callouts | built |
| | Contents | seven numbered chapters with one line each; a list on phones | built |
| 1 | Energy | barrel opened, mainspring coils as you wind, bridge and ratchet lift off | built |
| 2 | Wheels | the train's ratios, 72/12 to 84/7, hands on the centre and fourth wheels | |
| 3 | Escapement | escape wheel and pallet fork at 1/100, one tooth at a time | |
| 4 | Balance | the balance and hairspring breathing, six swings a second | |
| 5 | Together | the whole movement exploded with labels, then put back | prototype.html |
| 6 | The bench | Tavi's loupe, screwdrivers, tweezers and movement holder, drawn | |
| 7 | Repairs | the footer, with his name, what it means and "Tavi repairs wristwatches" | built |

A chapter is prose steps on the left beside a sticky figure on the right. Each step re-poses the same drawing.
Part names in the prose are buttons in the part's own colour; hovering or focusing one lights the part.
On phones the figure sticks to the top at 30% of the screen and the steps scroll under it.

## Motion

- One clock runs at 21,600 vph, so a beat is 1/6 s. The balance swings, the fork flips, the escape wheel
  steps 12° per beat, and every other wheel follows by its tooth ratio. The fourth wheel turns once a minute,
  the centre wheel once an hour. Speed 1×, 1/10 and 1/100 stretches every duration. At 1× the escapement is
  a blur, so the slow speeds are the point.
- The SVG ticks with CSS animations keyed to `--beat`. The prototype computes every angle from one
  `stateAt(t)` function, so a paused frame is exact and repeatable. The fork follows the impulse pin inside
  the 50° lift window and rests on a banking outside it; the escape wheel recoils, takes its impulse, drops
  and locks inside that window.
- Every moving figure has a Pause in its tray, plus the global one in the header, as WCAG 2.2.2 asks.
- Under `prefers-reduced-motion: reduce` the movement starts paused on a still frame. Play still runs it,
  because the visitor asked. Explode, step changes and hovers jump instead of easing.
- With scripting off the drawing is still and complete, and every chapter link works.
- The WebGL loop renders only while something moves. It stops when paused, off screen or in a hidden tab.
- Moving things animate `transform` and `opacity` only. Hovers fade colour, background and border.
  Durations are 120, 220 and 420ms on `cubic-bezier(0.16, 1, 0.3, 1)`.

## Fallback ladder

One part table, two renderers. The SVG drawing is always the first paint; the WebGL movement replaces it only
where it helps. Today `sketch.html` covers rungs 3 to 5 and `prototype.html` is rung 1 on its own page. The
swap between them, rungs 1 and 2, is site work.

1. Desktop with WebGL 2. The three.js movement replaces the SVG poster once the island loads, in the same
   box, so the page doesn't shift. It must open on the poster's flat top view and tilt only after that, or
   the swap jumps. The prototype opens at a 34° tilt today.
2. Phones, meaning narrow screens with a coarse pointer. The SVG drawing stays, ticking in CSS. A "Turn it
   in 3D" button loads the WebGL island on demand, so nobody downloads ~300 KB of three.js to scroll past it.
3. No WebGL, or a lost context. The SVG drawing, with explode through its lift groups.
4. Reduced motion. Whichever figure is showing, paused on a still frame until Play.
5. No scripting. The still SVG and all the prose.

## What the full site adds beyond the sketch

- Chapters 2 to 6, each with its own pose of the same movement, and the pager links between them.
- The bench chapter, drawn in the same flat style from the same tokens. Nothing photographed.
- Tavi's own line in the footer slot, and a way to reach him once the owner gives one.
- The centrepiece in the site. Drag or arrow keys turn it, a tap lights a part, phones get the parts list
  as buttons under the figure, and desktop keeps the labels with leader lines.
- A ticking sound, synthesised, off by default, behind a speaker toggle next to the global Pause.
- Winding in 3D. The mainspring coils, the ratchet clicks round, the power reserve falls as it runs.
- Small seconds at 6 o'clock on the dial side, driven by the fourth wheel, with blued Breguet hands.
- Tavi's favourite calibre in place of the generic 21,600 vph train, if the owner names one.
- The build: Astro 7.3.5, one React island for the movement, Base UI controls, the SVG generator at build time.
