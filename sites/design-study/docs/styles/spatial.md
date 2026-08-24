---
summary: Spatial UI — depth as hierarchy, the three-level depth ladder, why controls are oversized, and the only theme in the study that renders real 3D.
updated: 2026-08-23
---

# Spatial UI

**visionOS, 2023.** Apple Vision Pro's design language; adjacent work in Meta
Horizon OS and WebXR. The first mainstream interface language designed for a
display with no fixed frame.

## The idea

The interface stops being a page and becomes **an arrangement of surfaces at
measured distances**. Depth is not decoration; it *is* the hierarchy. Where a
flat design uses size and colour to say "this matters more", a spatial design
brings it closer.

Two consequences follow, and both are easy to miss:

- **The designer does not control the background.** The UI is composited over a
  real room. That is why spatial palettes are dark, near-neutral and
  translucent — anything opinionated fights whatever is behind it.
- **The input is imprecise.** Gaze plus pinch is far coarser than a cursor.
  Everything is bigger than it looks like it needs to be, and that constraint
  is worth keeping even on a laptop.

## The depth ladder

Three levels, and nothing invents a fourth. Each has one shadow, one blur
strength and one border brightness:

| Level | Background | Border | Shadow |
|---|---|---|---|
| Ambient (−1) | `rgb(255 255 255 / 0.03)` | `/ 0.08` | none |
| Resting (0) | `/ 0.06` | `/ 0.14` | `0 18px 40px rgb(0 0 0/.55)` |
| Lifted (+1) | `/ 0.10` | `/ 0.22` | `0 34px 70px rgb(0 0 0/.65)` |

Arbitrary shadows are the fastest way to make a spatial design look like a
generic dark theme.

## Palette

| Role | Value |
|---|---|
| Room | `#0d0f14` |
| Ink | `#eef1f7` (white, because it is the only value legible over an unknown backdrop) |
| Quiet | `#a7b0c4` (8.1:1 on the resting panel) |
| Accent | `#9db4ff` |

## Typography

SF Pro / Inter at 500 — lighter than a flat UI would use, because glass panels
carry less visual weight. Body 17px/1.7. Nothing below 13px.

## Surface and depth

Radii 20–30px. `backdrop-filter: blur(30px) saturate(150%)`. Hover **lifts
toward the viewer** (`translate: 0 -6px`) rather than changing colour — the
spatial equivalent of a highlight. Minimum control size 2.75–3rem.

## Motion

`cubic-bezier(0.32, 0.72, 0, 1)` at 220–320ms — Apple's standard spatial curve,
which decelerates hard. Movement is in z as much as y.

## Image treatment

**The only theme here that renders genuine 3D.** Every other style in this
study fakes depth with a shadow, a blur or a transform; spatial UI's entire
premise is that depth is not a metaphor, so faking it would be the one place
the study told a lie.

`Carousel.tsx` mounts a react-three-fiber scene:

- the selected panel sits at `z = 0`, facing the viewer;
- neighbours recede along `−z` (1.5 units per step) and rotate 0.34rad toward
  the centre, so their parallax is real rather than a scale trick;
- a rim-light mesh sits 0.012 behind each panel — visionOS glass always has a
  lit edge;
- easing is frame-rate independent: `k = 1 − 0.0015^delta`, not a fixed
  fraction per frame.

**For generating images in this style:** flat rectangular panels floating at
different depths in a dark neutral void; soft ambient light with a cool blue
rim; glass with a faintly visible edge; real perspective and parallax between
layers; long soft shadows falling into darkness; nothing touching a floor;
calm, weightless, precise.

## Prompt descriptors

`floating glass panels at varying depths` · `dark neutral void` · `cool blue
rim light` · `soft ambient occlusion` · `real perspective and parallax` ·
`translucent frosted surfaces` · `no floor, no horizon` · `visionOS aesthetic`
· `calm and precise` · `long soft shadows into darkness`

## Accessibility

**WebGL has no accessibility tree.** Nothing inside a canvas is reachable by a
screen reader, focusable, or reflected in the DOM. This is the defining
constraint and it is handled by keeping the canvas `aria-hidden` and putting
the entire accessible surface outside it: ordinary `<button>` controls, an
`aria-live` region announcing the visible panel, and a WebGL-capability check
that falls back to plain `<img>`s.

Two further consequences of `client:only="react"`, which r3f requires:

- **The island contributes no server-rendered markup at all.** The `<noscript>`
  block in `PostCarousel.astro` is therefore not a nicety — without it, a reader
  with JavaScript disabled gets nothing.
- Depth-only hierarchy is invisible to a screen reader. Heading order has to
  carry it independently, which it does here.

## How it's built here

`src/themes/spatial/Carousel.tsx` and `theme.css`. The depth ladder is three
sets of custom properties; `.sp-panel` and `.sp-panel--lifted` are the only two
surface classes in the file.
