---
summary: Skeuomorphism — the lighting rules that made the illusion hold, the hard 50% gloss cut, letterpress vs engraved text, and the sepia-plus-bevel image recipe.
updated: 2026-08-23
---

# Skeuomorphism

**2007 — 2013.** iPhone OS through iOS 6; Mac OS X Aqua before it. Ended
abruptly with iOS 7 in 2013, which is why the style has such a precise
death date.

## The idea

New interfaces borrow the appearance of the physical objects they replace, so
people already know how to use them. The Notes app was legal-pad yellow because
you already knew what a legal pad did.

The thing usually misremembered is that skeuomorphism was not merely
*textured*. It was **lit**. Every surface declared a light source in the top
left and obeyed it without exception, and that consistency is what made the
illusion hold. Break the light direction on one control and the whole screen
collapses into decoration.

## The lighting rules

| Rule | CSS |
|---|---|
| One light, top-left, always | — |
| Raised: light top edge, dark bottom edge, cast shadow below | `inset 0 1px 0 rgb(255 255 255/.9), inset 0 -1px 0 rgb(0 0 0/.12), 0 6px 14px rgb(0 0 0/.22)` |
| Recessed: the inverse | `inset 0 2px 5px rgb(0 0 0/.45), inset 0 -1px 0 rgb(255 255 255/.35)` |
| Text on light: **letterpress** | `text-shadow: 0 1px 0 rgb(255 255 255/.9)` |
| Text on dark: **engraved** | `text-shadow: 0 -1px 0 rgb(0 0 0/.8)` |
| The gloss | a white highlight over the top half, **cut off hard at 50%** |

That hard 50% cut is the era's single most identifiable move:

```css
background:
  linear-gradient(180deg, rgb(255 255 255/.45) 0%, rgb(255 255 255/.06) 50%, transparent 50%),
  linear-gradient(180deg, #f2eee2 0%, #d3cbb8 100%);
```

## Palette

Materials, not colours.

| Material | Value |
|---|---|
| Tooled leather | `#4a3a26` → `#2f2416` |
| Brushed linen | `#d8d2c4` |
| Paper | `#f6f2e8` |
| Brushed metal | `#f2eee2` → `#d3cbb8` |
| Aqua blue | `#1f6fd0` |
| Ink | `#35302a` |

## Typography

Lucida Grande, then Helvetica Neue — Open Sans is the closest available
substitute. 800 for headings. Every piece of text carries a letterpress or
engraved shadow; nothing sits flat on its surface.

## Surface and depth

Four to six stacked shadows per element is normal and correct here. Stitched
edges (`border: 2px dashed` inset by 8px). Grouped table rows with alternating
gradients and a light 1px separator, which is the other unmistakable 2010
pattern.

## Layout and composition

Cards on a desk. Auto-fill grid at 19rem. Photographs sit in *recessed wells*
with an inner bevel — a frame, not a border.

## Motion

Press states only, and they are instant: the gloss inverts and the shadow goes
inset. No transition duration; a physical button does not ease.

## Image treatment

**The reusable recipe.** Warm sepia, an inner bevel, and a gloss that stops
dead at the halfway line.

```css
.image    { filter: sepia(0.28) saturate(1.15) contrast(1.08); border-radius: 3px; }
.viewport { box-shadow: inset 0 2px 6px rgb(0 0 0/.55), inset 0 -1px 0 rgb(255 255 255/.25); }
.slide::after {
  background: linear-gradient(180deg,
    rgb(255 255 255/.32) 0%, rgb(255 255 255/.1) 50%, transparent 50%);
}
```

**For generating images in this style:** photographed real materials — tooled
leather, brushed aluminium, felt, linen, walnut, stitched thread; warm studio
light from the upper left; a soft cast shadow down-right; glossy highlight on
the upper third; rich saturated warmth; shallow depth of field; product-catalogue
realism, circa 2010.

## Prompt descriptors

`tooled leather and brushed metal` · `warm studio light from upper left` ·
`glossy highlight on upper third` · `soft cast shadow down-right` · `stitched
edge detail` · `felt and linen texture` · `2010 product catalogue` · `rich warm
saturation` · `shallow depth of field` · `photoreal material study`

## Accessibility

Better than its reputation. Contrast is high (dark ink on warm paper), controls
are unmistakably controls, and the pressed state is genuinely visible. Its real
failing was different: it consumed enormous visual bandwidth on chrome, and on
small screens the texture competed with the content. The letterpress shadow
also very slightly reduces effective contrast on small text — worth checking at
13px and below.

## How it's built here

`src/themes/skeuomorphism/` — `.sk-raised` is the one raised-panel recipe and
every surface on the desk reuses it, so the light direction cannot drift.
Compare [neumorphism.md](neumorphism.md), which kept the shadows and threw away
the materials.
