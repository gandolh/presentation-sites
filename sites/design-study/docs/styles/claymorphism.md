---
summary: Claymorphism — the opposing-inset shadow recipe that makes surfaces read as inflated, why it keeps its contrast where neumorphism loses it, and the pastel-wash image recipe.
updated: 2026-08-23
---

# Claymorphism

**2021.** Named by Michal Malewicz (who also named neumorphism); popularised by
3D illustration sets, the Clay UI kits, and a wave of fintech and edtech
onboarding screens.

## The idea

Often filed next to [neumorphism](neumorphism.md) because both fake depth with
shadows, but the physics are opposite. Neumorphism extrudes a flat sheet;
claymorphism makes **separate objects** that were squeezed out of a tube and
landed on the page.

That distinction is not academic — it is why one style keeps its contrast and
the other cannot. Because clay objects are coloured *differently from the
ground*, they have a real edge, and their text has a real background.

## The shadow recipe

Three shadows, and the two insets must oppose each other:

```css
box-shadow:
  26px 26px 52px rgb(139 92 246 / 0.28),      /* big, far, COLOURED cast */
  inset -7px -7px 14px rgb(139 92 246 / 0.22), /* underside darkening    */
  inset  7px  7px 14px rgb(255 255 255 / 0.95);/* top-left inflation      */
```

Two inset shadows in opposition are what make the surface read as *puffy*
rather than merely rounded. The cast shadow is tinted with the accent hue, not
black — a black cast shadow drops it straight back into neumorphism.

## Defining traits

- Border radius large enough to be absurd: 24–48px, sometimes 50%.
- Pastel fills, cycling by `:nth-child` so no two adjacent cards match.
- A rounded typeface. Anything with sharp terminals fights the shape language.
- A slight squash on press — clay should feel compressible.

## Palette

| Role | Value |
|---|---|
| Ground | `#ecdcf8` → `#ffe9f3` (radial washes) |
| Card | `#ffffff` |
| Mint | `#cdf3e4` |
| Lemon | `#fdf0c4` |
| Peach | `#ffdcd1` |
| Lilac | `#e6dcff` |
| Ink | `#3a2b52` (9.6:1 on white) |
| Quiet | `#6c5b8a` (5.3:1) |
| Violet | `#8b5cf6` |

## Typography

Nunito, Quicksand, Baloo — rounded, and heavy (800–900) for headings. Body at
17px/1.7 in weight 500, which is slightly heavier than usual because pastel
grounds eat thin strokes.

## Surface and depth

One recipe (`--cl-clay`) and one small variant (`--cl-clay-sm`), reused
everywhere. Nothing invents a third.

## Motion

The one animation the style earns: a springy squash on press.

```css
transition: scale 160ms cubic-bezier(0.34, 1.56, 0.64, 1);
:active { scale: 0.9; }
```

The overshoot in that curve (>1) is the point — clay rebounds.

## Image treatment

**The reusable recipe.** The photograph becomes another lump of clay: enormous
radius, a pastel wash blended over it, and the same puffy shadow as everything
else.

```css
.viewport {
  border-radius: 34px;
  box-shadow: 18px 18px 38px rgb(139 92 246 / 0.3),
              inset -6px -6px 12px rgb(139 92 246 / 0.2),
              inset 6px 6px 12px rgb(255 255 255 / 0.9);
}
.image { filter: saturate(0.9) brightness(1.1) contrast(0.9); border-radius: 34px; }
.slide::after {
  background: linear-gradient(150deg, rgb(230 220 255/.5), rgb(255 220 209/.35));
  mix-blend-mode: soft-light;
}
```

**For generating images in this style:** 3D-rendered modelling clay or
plasticine; inflated, rounded, no sharp edges anywhere; pastel palette with a
violet-tinted shadow; soft global illumination; matte surface with a slight
subsurface glow; objects floating just above a pastel ground; toy-like,
friendly, chunky proportions.

## Prompt descriptors

`3D rendered plasticine` · `inflated rounded forms` · `pastel palette, violet
shadow` · `soft global illumination` · `matte clay with subsurface scatter` ·
`chunky toy proportions` · `no sharp edges` · `floating above pastel ground` ·
`blender clay render` · `friendly, squishy`

## Accessibility

**The accessible member of the soft-3D family**, and the contrast with
neumorphism is the useful lesson: identical shadow technique, opposite outcome,
because the objects are a different colour from the ground. Ink on white is
9.6:1; ink on the pastel fills stays above 7:1.

Two cautions: the huge radii can clip descenders on text set too close to a
corner (keep 1.25rem+ of padding), and `scale(0.9)` on press moves the focus
ring with the element, which is correct — but a `scale` on a *parent* would
detach it.

## How it's built here

`src/themes/claymorphism/` — see the header comment in `theme.css` for the
shadow recipe stated as a formula rather than a value.
