---
summary: Bohemian/boho — the arch silhouette, paper grain, earth-only palette and old-style serif, with the sepia-plus-grain image recipe.
updated: 2026-08-23
---

# Bohemian

**c. 2015 — ongoing.** Wellness, ceramics, slow-fashion and independent-maker
branding. Lineage: 1970s craft revival, Moroccan and Scandinavian folk
patterning, art-school zine culture.

## The idea

Handmade warmth, *arranged* rather than laid out. The style signals that a
person made the thing and that the making took time. It is easy to caricature —
terracotta plus a macramé photo — so what matters is the structural moves, not
the mood board.

## The structural moves

- **The arch.** Rounded at the top, square at the base:
  `border-radius: 999px 999px 6px 6px`. This is boho's whole silhouette and the
  single most identifiable element.
- **Paper.** A repeating fibre texture over the entire ground plus warm sepia
  on every image, so nothing looks born on a screen.
- **An old-style serif** with real optical variety, set slightly large (19px)
  and slightly loose (1.72).
- **Asymmetry by hand.** Entries nudged and rotated a degree or two — not
  randomly, but never onto a shared axis either.
- **Earth colour only.** No blue anywhere on the page.

## Palette

| Role | Value |
|---|---|
| Sand | `#f4ece0` |
| Linen | `#fbf6ee` |
| Ink | `#3d2b1f` |
| Quiet | `#7a6250` (4.7:1 on sand) |
| Clay | `#b5623c` |
| Mustard | `#c99a2e` |
| Olive | `#7d8560` |

## Typography

EB Garamond (or Cormorant Garamond, Crimson). Italic for the wordmark, section
headings and pull-quotes. Wide-tracked (0.24em) uppercase at 11px for
metadata. A 3.6em italic drop cap on the first paragraph.

## Surface and depth

Soft, warm, low: `0 10px 28px rgb(61 43 31 / 0.13)`. Never a hard edge. The
paper texture is built from two fine repeating linear-gradients at 92° and 2°
plus a warm corner bloom — cheap, and enough to break the flatness.

## Layout and composition

Auto-fill grid at 19rem, centred text, with every second item pushed down by
1–3rem so the columns never align. Rotations cycle −1.4° / 1° / −0.5°.

## Motion

None to speak of. The style is about slowness, and animation reads as
impatience.

## Image treatment

**The reusable recipe.** Warm sepia with the contrast pulled back, plus a grain
overlay multiplied over the top. The photograph should look printed, not
displayed — and it should be inside an arch.

```css
.image {
  filter: sepia(0.42) saturate(1.15) contrast(0.94) brightness(1.04);
  border-radius: 999px 999px 4px 4px;
}
.slide::after {                     /* the grain */
  background-image:
    repeating-linear-gradient(0deg,  rgb(61 43 31 / 0.06) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgb(61 43 31 / 0.05) 0 1px, transparent 1px 4px);
  mix-blend-mode: multiply;
}
```

**For generating images in this style:** natural materials — raw clay, linen,
undyed wool, dried grasses; warm low afternoon sun through a window; terracotta
and cream palette with olive and mustard accents; visible hand-made texture and
irregularity; film grain; shot on medium-format film; arch or arched-window
framing; matte, never glossy.

## Prompt descriptors

`terracotta and cream palette` · `raw clay and linen` · `warm afternoon window
light` · `arched frame` · `medium-format film grain` · `matte natural
materials` · `dried grasses, undyed wool` · `handmade irregularity` · `sepia
warmth` · `slow-craft still life` · `no blue`

## Accessibility

Generally safe — the palette is high-contrast by nature (dark brown on sand is
9:1). Two cautions: mustard `#c99a2e` fails as text on sand and is used only as
rules and bullets here; and the italic serif at metadata sizes is a legibility
risk, so italics are confined to 16px and above.

## How it's built here

`src/themes/bohemian/` — the arch is applied to the figure *and* to the
carousel viewport and image, so the crop follows the frame rather than showing
square corners behind it.
