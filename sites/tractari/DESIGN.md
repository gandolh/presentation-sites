# DESIGN.md: AXA Tractări

Visual system for the AXA Tractări demo site, as it shipped in the 2026-11-13
redesign ("Lines first"). The strategic context (register, audience, the one
structural move) lives in [PRODUCT.md](PRODUCT.md).

## North star

A driver on the shoulder at 3am needs a number, not a film. The page is type on
cold asphalt, one raised **board of three named phone lines**, and a 3D scene
that sits further down as a plate. Dark with no theme switch, no photographs.
One service (tractări auto pe platformă), one job (call), three owner numbers.

It still steps off the RO "tractari auto" market (red-on-white, stock photo,
four icon boxes) and off the generic AI landing template (centred hero stack,
equal-box grids, an eyebrow on every section).

## Theme

One dark look, with no switch. Colour strategy: **committed**. Safety orange is
the call and nothing else; amber marks things and is never text; ink is warm
off-white. Near-black ink (`on-accent`) sits on every orange: the plate, the
header call when filled, the dock.

## Colour (OKLCH, the full set in `src/styles/global.css`)

| Role | Token | Hex | Notes |
| --- | --- | --- | --- |
| Ground | `background`, `surface` | `#090e12` | cold asphalt |
| Raised | `surface-container` | `#181f25` | header, board, tiles, panel, strip |
| Raised, higher | `surface-container-high` | `#252c34` | line cells, pictogram wells, menu button |
| Ink | `on-surface` | `#f0eee9` | body and heads |
| Ink, muted | `on-surface-variant` | `#a8afb5` | lede, nav, copy |
| Edge, strong | `outline` | `#636a71` | outline calls |
| Edge | `outline-variant` | `#30363c` | panel edges, rules |
| Amber | `primary` | `#f3b01d` | marks: beacon, lane start, map hub, step nodes, focus ring |
| Orange | `accent` | `#f76400` | the call; hover `#fc7a14` |
| Ink on orange | `on-accent` | `#1a0b05` | 6.20:1 on the orange (white was 3.02) |

`-low`, `-lowest`, `-highest`, `primary-hover` and `primary-bright` stay as
aliases. The scene plate has its own tokens (`plate-*`, `scrim`) and the steps
strip's lane fade has `mask-on` and `mask-half`; `shadow-board` is the only
shadow. No red anywhere.

## Typography

Self-hosted from `@fontsource-variable/big-shoulders-display` 5.2.5 and
`@fontsource-variable/archivo` 5.3.0 (no Google CDN).

- **Display** Big Shoulders Display, weight 800, **sentence case**; the
  wordmark alone keeps its capitals.
- **Body** Archivo.
- Scale as tokens `--text-display` 80, `--text-h2` 48, `--text-h3` 28, `--text-lede`
  20, `--text-body` 16, `--text-label` 14 (600). At 760 px and under the heads
  step down to 44, 32, 24 and the lede to 17.
- Every phone number is tabular and `white-space: nowrap`. The plate's number
  never drops below 32 px on a phone and 48 px above it.

## Layout and components

- **Fixed banner and header** (36 + 65 px, 113 px with a wrapped banner on a
  phone). Anchors take `scroll-margin-top` 101 px (113 px at 760 and under).
  Nav follows the page: Servicii, Acoperire, Cum funcționează, Contact; the
  same in the Drawer.
- **Hero**: a plain status line (`Non-stop 24/7, Oltenia`), the h1, the lede
  with `Ce facem` as a text link (inline at the end of the lede on a phone, a
  44 px target), a lit lane, then the **board**.
- **The board** (`Contact.astro`, `id="contact"`): the only raised object.
  The dispatcher's line is the orange plate (48 px number, disc with the phone);
  Andrei and Vasile are two cells beside it. At 1000 px and under the plate
  takes the full row and the cells sit 6 + 6 under it; on a phone every line is
  a full-width row.
- **One observer** on the plate (`.line--main`) sets `data-plate="in|out"` on
  the page. While in: the header call is an outline, the dock is hidden. Once
  out: the header call fills (`accent`, `on-accent`) and, at 760 px and under,
  the dock shows. The dock is visible by default, so no-JS visitors keep it.
  Exactly one orange call per frame; the Servicii call is an outline at every
  width.
- **Servicii**: a full-width lead row with a 64 px pictogram over four tiles,
  each with its own pictogram (orange, in a raised well).
- **Acoperire**: one raised panel, copy and counties left, the map right with no
  frame (static SVG, no animation).
- **Cum funcționează**: the 3D scene is a 440 px plate (300 px on a phone) over
  its CSS backdrop; the h2 sits at the plate's lower left, 24 px above the steps
  strip, which overlaps the plate's foot. The plate's gradient and scrim end on
  `background`.
- **Call dock** (`CallDock.tsx`, phone only): an orange band, the dispatcher's
  call and a toggle that opens the other two lines (each with a 20 px phone
  glyph). Its focus ring is the dark ink, since amber vanishes on orange.
- **Footer**: rules and rows; the counties and legal ids are separate spans.

## The 3D scene (`src/components/hero/`)

A flatbed tow truck (RO plate "GJ 01 AAV") on a winding night road, seen from a
chase camera, built from Three.js primitives. `scene.ts` is the framework-free
builder; `HeroCanvas.tsx` is the `client:only` island that imports Three.js
dynamically, runs only when WebGL is available and reduced motion is off, caps
the pixel ratio and pauses off-screen. The camera view is offset by a quarter of
the plate's height so the truck clears the head and the strip.

## Motion and accessibility

- Reduced motion: the scene never draws; the plate's CSS backdrop stands in.
  Nothing else loops: the beacon pulse, scroll cue, map animations, the lane's
  travelling glow and the scroll reveal are gone.
- No-JS and crawlers: all copy and all nine `tel:` links are in the static HTML
  (header 1, board 3, Servicii 1, footer 3, dock 1; the dock's two backup lines
  appear when it opens).
- Contrast: lowest text 6.20:1, lowest icon 4.55:1 (scripted, both widths).
  Focus ring 2 px amber, ink on the dock; touch targets at least 44 px; the
  Drawer traps focus; a skip link.

## Performance

Astro static shell and lazy islands. Three.js ships in its own chunk fetched
only when `HeroCanvas` mounts, and only the plate waits on it. Served under
`/tractari` (`PUBLIC_BASE`, `withBase()`), exact dependency pins.
