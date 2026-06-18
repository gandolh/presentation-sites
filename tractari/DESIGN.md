# DESIGN.md — AXA Tractări

Visual system for the AXA Tractări demo site. The strategic context (register,
audience, the one structural move) lives in [PRODUCT.md](PRODUCT.md).

## North star

"Headlights on a wet road at 3am." Dark by default — asphalt at night, not a
white brochure. Light comes from the things that rescue you: the truck's
headlights, the rotating amber beacon, the lit lane markings. The site is
minimalist; the **3D scene is the main accent**. One service (tractări auto pe
platformă), one job (call), three owner numbers.

Deliberately steps off the entire RO "tractari auto" market (red-on-white
template, stock photo, four icon boxes) and off the generic AI landing template
(centered hero stack, equal-box grids, eyebrow-on-every-section).

## Theme

Dark-first. The base surface tokens ARE the dark asphalt; the rare light panel
uses the inverse tokens. Color strategy: **Committed** — amber carries the
identity across a dark field; one hotter safety-orange is reserved for the call
action.

## Color (OKLCH; full token set in `src/styles/global.css`)

| Role | Token | Value | Notes |
| --- | --- | --- | --- |
| Page background | `--color-background` | `oklch(16% 0.012 250)` | cold asphalt, never pure black |
| Surface container | `--color-surface-container` | `oklch(22% 0.015 250)` | cards, panels |
| Body text | `--color-on-surface` | `oklch(95% 0.008 90)` | warm off-white, ≥4.5:1 on bg |
| Secondary text | `--color-on-surface-variant` | `oklch(72% 0.012 250)` | ≥4.5:1 |
| **Primary — amber beacon** | `--color-primary` | `oklch(80% 0.16 80)` | identity: wordmark mark, kicker, glow, 24/7 badge. Dark ink rides on it |
| **Accent — safety orange** | `--color-accent` | `oklch(68% 0.2 45)` | the ONE call CTA; white text on it |
| Headlight | `--color-headlight` | `oklch(95% 0.03 230)` | cold xenon white-blue, hero highlights |

No red (every competitor uses red). Amber is the actual colour of a tow truck's
warning light and is distinctive in the category.

## Typography

Two families, paired on a contrast axis (industrial condensed display vs. neutral
grotesque body). Self-hosted via `@fontsource` (no Google CDN — GDPR).

- **Display** `--font-display`: **Big Shoulders Display** (variable). Drawn from
  American highway/industrial signage — flat terminals, heavy weights. Used
  uppercase for headings + wordmark. The "signage / heavy-duty / urgent" register.
- **Body** `--font-body`: **Archivo** (variable). A grotesque with real
  character and full RO diacritics. (Inter was rejected — it is on impeccable's
  reflex-reject list.)

Headings: `clamp()` fluid, line-height ~0.9, uppercase, `text-wrap: balance`.
Numbers use `font-variant-numeric: tabular-nums` (`.tnum`) so phone numbers don't
jitter. Hero title ceiling ≤ 6rem.

## Layout & components

- Asphalt-dark sections; one quiet lighter band (Coverage). Radius is hard /
  industrial (`--radius` ~0.3rem).
- **The road spine (`.road` / `.road__line` / `.stop`)** — the one structural
  move made literal. Below the hero, a single dashed, two-tone (amber→orange)
  lane line runs down the page in a left gutter, with a travelling amber glow
  (off under reduced motion). Every section is a `.stop` pinned to it by a
  glowing `.stop__marker` node; Contact gets the larger safety-orange
  `--end` destination node. The "stops on one drive" idea is now the page's
  actual backbone, not just prose in the docs.
- **Full-bleed cinematic hero**: the 3D scene fills the entire opening viewport
  as the background plate; copy is overlaid lower-left (film-title framing) over
  a bottom-left legibility scrim + edge vignette (`.hero-scrim`). No boxed panel.
- **Sticky demo banner** fixed at the very top; the fixed nav sits directly
  beneath it (offset by `--banner-h`). The phone is load-bearing: a `btn-call`
  in the nav (desktop) and a persistent full-width `.call-dock` at the bottom
  (mobile).
- **Servicii** (`.svc-grid`): asymmetric capability tiles — the real job
  (tractări pe platformă) is the wide amber-edged `--lead` tile, the rest
  support it. Not an equal-box icon grid.
- **Cum funcționează**: the 3-step `.timeline` (vertical on mobile, a horizontal
  road on lg+). One call → we drive → safe transport.
- **Coverage**: asymmetric copy-left / animated-SVG-map-right (the 5 Oltenia
  counties radiating from the Târgu-Jiu hub). Pure SVG + CSS, works without JS.
- **Contact**: the destination. The primary owner number dominates (large,
  safety-orange); the other two sit beneath, asymmetric — not a 3-card grid.
- A single quiet `.stop-label` (small amber tracked label) opens each stop.
  One deliberate cadence, not an eyebrow on every section.

## The 3D hero scene (`src/components/hero/`)

A flatbed tow truck (empty platform, RO plate "GJ 01 AAV") driving a winding
night road, seen from a **chase camera behind it**. The truck keeps the **right
lane**, steers and banks into the curves; headlights, tail lights and a rotating
amber beacon light the scene; dashed centre-line and reflector posts stream past
for speed. Built entirely from Three.js primitives — no external model, no
textures, tiny on disk, fully on-brand.

- `scene.ts` — pure, framework-agnostic scene builder; returns `{ render, resize,
  dispose }`. The road ribbon + furniture + truck all sample one `roadX(z)` curve
  so they stay locked to the same lane; everything flows toward the camera as the
  truck drives forward.
- `HeroCanvas.tsx` — React island (`client:only`). Dynamically imports Three.js
  (so it never touches the initial bundle), runs only when WebGL is available and
  `prefers-reduced-motion` is not set, caps pixel-ratio, and pauses the loop when
  off-screen or the tab is hidden.

## Motion & accessibility

- Reduced motion: the 3D scene does not run; the `.hero-stage` CSS night-road
  backdrop carries the visual. Beacon pulse, scroll cue, and SVG map animations
  all have `prefers-reduced-motion: reduce` off-switches.
- No-JS / crawler: all copy and all three `tel:` links are in the static HTML;
  the 3D scene and call-dock expansion are pure enrichment.
- Dark theme contrast verified (warm off-white body ≥4.5:1 on asphalt; amber
  large text ≥3:1). Focus-visible rings, ≥44px touch targets, keyboard-trapped
  mobile menu, skip link.

## Performance

Astro static shell + lazy islands. Three.js ships in its own chunk fetched only
when `HeroCanvas` mounts; the initial HTML/CSS carries no 3D. Served under
sub-path `/tractari` (`PUBLIC_BASE`, `withBase()`), pinned exact dep versions.
