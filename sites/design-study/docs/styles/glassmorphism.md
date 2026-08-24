---
summary: Glassmorphism — backdrop-filter as the whole style, why the ground must be busy, and the contrast fix that most real examples skip.
updated: 2026-08-23
---

# Glassmorphism

**2020.** Named in a Michal Malewicz post; the visual language of macOS Big Sur
and Windows 11 Acrylic/Mica. Its ancestor is Windows Vista Aero (2007), which
did the same thing with far worse type rendering.

## The idea

One property does almost all the work: `backdrop-filter`. A panel has no real
fill; it has a blur of whatever is behind it, plus enough white to catch the
light. Everything else in the style exists to make that legible.

```css
background: linear-gradient(145deg, rgb(255 255 255/.2), rgb(255 255 255/.08)),
            rgb(43 27 87 / 0.42);          /* <- the opaque tint. see below */
backdrop-filter: blur(22px) saturate(165%);
border: 1px solid rgb(255 255 255 / 0.28);
box-shadow: 0 18px 44px rgb(12 6 30 / 0.45);
```

## The four supporting requirements

1. **A busy, saturated ground.** Glass over a flat colour is just a grey box —
   the blur needs something worth blurring, hence the drifting orbs.
2. **A hairline in near-white at partial alpha**, brighter along the top edge,
   standing in for a lit bevel.
3. **`saturate()` alongside the blur.** A plain blur desaturates and the panel
   goes muddy. This is the most commonly omitted half of the recipe.
4. **Depth by stacking.** Overlap and a large soft shadow, never a border, are
   how hierarchy is expressed.

## Palette

| Role | Value |
|---|---|
| Void | `#2b1b57` |
| Ground orbs | `#6a3fd6`, `#0f8fb8`, `#d8459b`, `#2b6ce0` |
| Ink | `#f4f1ff` |
| Quiet | `#c3bce4` (7.1:1 over the panel tint) |
| Cyan | `#7bdff2` |
| Hairline | `rgb(255 255 255 / 0.28)` |

## Typography

Inter or SF Pro. 700 for headings at tight tracking (−0.035em); body 17px/1.65.
White for headings, a slightly cooled off-white for body — pure white body text
on glass reads as glare.

## Surface and depth

Radii 14–22px. Shadows are large, soft and dark (`0 18px 44px`), never tight.
Chrome floats *over* content rather than framing it — the carousel controls
here sit inside the image as a capsule, not below it.

## Image treatment

**The reusable recipe.** The photograph is brightened and saturated so it
survives being seen through glass, then a pane is laid over its lower edge with
the controls inside.

```css
filter: saturate(1.35) brightness(1.06) contrast(1.04);
/* controls: position absolute inside the frame, capsule, own backdrop-filter */
```

**For generating images in this style:** vivid, saturated, high-key photography
or 3D; a colourful blurred bokeh or gradient-mesh background; translucent
frosted panels floating in front; visible light refraction at panel edges; deep
purple, cyan and magenta light sources; glossy, clean, no grain.

## Prompt descriptors

`frosted glass panel` · `vivid gradient mesh background` · `blurred colourful
bokeh` · `translucent overlay` · `saturated cyan and magenta light` ·
`high-key, glossy` · `soft light refraction at edges` · `floating panels` ·
`macOS Big Sur aesthetic` · `no grain`

## Accessibility

The trap is that **contrast varies with what is behind the panel** — text can
clear 4.5:1 over one part of the background and fail over another, and no
static audit catches it because the failure is positional.

The fix, which most real examples of the style skip: put an **opaque tint layer
underneath the translucency** so the panel has a contrast floor independent of
its backdrop. This theme uses `rgb(43 27 87 / 0.42)` beneath the white
gradient, which is what lets `--gl-quiet` hold 7.1:1 everywhere rather than on
average.

Second caution: `backdrop-filter` is expensive. Fourteen blurred panels on one
scrolling feed will drop frames on low-end hardware — worth budgeting.

## How it's built here

`src/themes/glassmorphism/` — `.gl-pane` is the one recipe, and its `::before`
draws the lit top edge as a single bright hairline. Compare
[liquid-glass.md](liquid-glass.md), which is what happens when the blur becomes
a refraction.
