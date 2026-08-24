---
summary: Liquid Glass — refraction rather than blur, the feDisplacementMap chain, scroll as the honest analogue for device tilt, and what this implementation approximates.
updated: 2026-08-23
---

# Liquid Glass

**Apple, WWDC 2025.** The design language introduced across iOS 26, iPadOS,
macOS Tahoe and visionOS. The first system-wide Apple redesign since iOS 7
retired [skeuomorphism](skeuomorphism.md).

## The idea, stated precisely

| | |
|---|---|
| Glassmorphism | blur + translucency + a hairline |
| **Liquid Glass** | **refraction + specular highlight + edge lensing, all responding in real time to motion** |

Refraction is the load-bearing difference. A blur says *there is something
behind this*; a displacement says *this is a physical object with a thickness*.
Everything else — the capsules, the morphing chrome, the concentric radii —
follows from treating the panel as a lens rather than a filter.

## Defining traits

- **Refraction.** Content behind the panel is displaced, not just blurred, and
  the displacement is strongest at the edges.
- **Specular highlights that track motion.** On device, tilt. On the web there
  is no tilt, so the honest analogue is **scroll** — same causal story (the
  light stays put, the glass moves).
- **Edge lensing with chromatic dispersion.** A slight hue split at the rim.
  This is what stops a glass effect reading as a plain blur.
- **Morphing chrome.** Controls change shape rather than colour — a dot
  stretches into a capsule when selected.
- **Concentric radii.** Inner radius = outer radius − padding, so nested
  corners stay parallel instead of drifting.

## Palette

Very dark, so the highlights have somewhere to be bright.

| Role | Value |
|---|---|
| Void | `#0b1020` |
| Ground | `#2a4bd8`, `#0f9bb8`, `#7c2fd6` (fixed radial washes) |
| Ink | `#f2f5ff` |
| Quiet | `#a9b4d0` (7.9:1 on the glass) |
| Blue | `#5ac8fa` |
| Hairline | `rgb(255 255 255 / 0.22)` |

## Typography

SF Pro, with Inter as the substitute. 600 for headings at −0.04em tracking;
body 17px/1.62 at −0.011em. Apple's optical-size behaviour means display type
tracks much tighter than body — the two tracking values are not decorative.

## Image treatment

**The reusable recipe, and the most technically involved in the study.** Four
stacked layers:

```css
/* 1. refraction — a very low-frequency turbulence drives a displacement map */
```
```html
<filter id="lg-refract" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.003 0.009"
                numOctaves="2" seed="7" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="16"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```
```css
.image  { filter: url("#lg-refract") saturate(1.2) contrast(1.05); }

/* 2. chromatic fringe — the same photo, nudged and hue-shifted, masked to the rim */
.fringe { filter: url("#lg-refract") hue-rotate(24deg) saturate(2.2);
          translate: 3px 0; mix-blend-mode: screen; opacity: .55;
          mask-image: radial-gradient(ellipse 74% 74% at 50% 50%,
                                      transparent 58%, #000 100%); }

/* 3. the travelling specular band, position driven by scroll */
.specular { background: linear-gradient(104deg,
              transparent calc(var(--lg-sweep) * 100% - 26%),
              rgb(255 255 255/.42) calc(var(--lg-sweep) * 100% - 6%),
              rgb(255 255 255/.06) calc(var(--lg-sweep) * 100% + 4%),
              transparent calc(var(--lg-sweep) * 100% + 22%));
            mix-blend-mode: screen; }

/* 4. rim */
.rim { box-shadow: inset 0 1px 0 rgb(255 255 255/.6),
                   inset 0 0 0 1px rgb(255 255 255/.16),
                   inset 0 -14px 30px rgb(0 0 0/.28); }
```

**What this approximates, honestly.** The npm liquid-glass packages generate a
*signed-distance field* for the lens shape and feed that to the displacement
map, which produces true lens geometry. This generates a smooth noise field
instead — cheaper, and closer to "liquid" than "lens". It was hand-rolled
rather than taken as a dependency because the technique is ~60 lines and the
packages are young and single-purpose.

**For generating images in this style:** thick optical glass over a vivid
scene; visible refraction bending what is behind it; chromatic aberration at
the edges; a sharp specular streak across the surface; deep blue and violet
light sources; wet, molten, liquid glass; caustics; very dark background with
bright highlights.

## Prompt descriptors

`thick optical glass` · `refraction bending the background` · `chromatic
aberration at edges` · `specular streak highlight` · `caustics` · `molten
liquid glass` · `deep blue and violet light` · `dark background, bright
highlights` · `wet, glossy, dimensional` · `lensed distortion`

## Accessibility

Inherits every glassmorphism contrast risk and adds two:

1. **Refraction distorts text behind the panel.** Never place a glass panel
   over body copy — only over imagery or a gradient.
2. **The travelling specular band is motion.** Here it is scroll-driven rather
   than autonomous, and `prefers-reduced-motion` freezes it mid-sweep rather
   than removing it — the highlight is part of the material, only its travel
   is motion.

Cost is also real: `filter: url()` plus `backdrop-filter` plus a duplicated
image per slide is three expensive passes. Budget it.

## How it's built here

`src/themes/liquid-glass/Carousel.tsx` — one of only two themes that replaces
the shared carousel rather than restyling it. The `--lg-sweep` custom property
is recomputed from `getBoundingClientRect()` on a rAF-throttled passive scroll
listener.
