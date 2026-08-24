---
summary: NeoBrutalism — hard black outlines, flat zero-blur offset shadows, saturated primaries, and mechanical step() interaction, with the saturate/contrast image recipe.
updated: 2026-08-23
---

# NeoBrutalism

**c. 2020.** Gumroad's 2021 redesign is the usual reference point, along with
Figma community kits and the shadcn-adjacent component ecosystem. Sometimes
called "neubrutalism".

## The idea

It borrows brutalism's black outlines and flatness, and inverts its argument.
Brutalism refuses to design; neobrutalism designs very loudly using a
deliberately tiny vocabulary. The result reads as raw but is heavily styled —
the opposite of its namesake.

## Defining traits

1. Every surface is a flat block of saturated colour. **No gradient, ever.**
2. Every block has a 3px pure-black border and a hard offset shadow with **zero
   blur** — the shadow is a shape, not a light effect.
3. One heavy grotesque, set big, often uppercase.
4. Interaction is physical: pressing a thing moves it into its own shadow.
5. Small rotations (−3° to +2°) on badges and quotes, so nothing sits square.

## Palette

Primaries at full saturation, on a coloured ground rather than white.

| Role | Value |
|---|---|
| Ink | `#000000` |
| Yellow (ground) | `#ffe600` |
| Pink | `#ff5bb0` |
| Cyan | `#3ddbd9` |
| Lime | `#b8ff3d` |
| Paper | `#fffdf5` |

## Typography

Archivo, Space Grotesk or similar — a grotesque with a heavy weight that stays
legible. 800 for headings, 500–600 for body. Uppercase headings with tight
tracking (−0.03em). Body at 17px/1.5.

## Surface and depth

```css
border: 3px solid #000;
box-shadow: 6px 6px 0 #000;   /* zero blur — this is the whole style */
border-radius: 0;             /* or a small 4–8px in softer variants */
```

Press state:

```css
transition: translate 80ms steps(2), box-shadow 80ms steps(2);
:active { translate: 3px 3px; box-shadow: 0 0 0 #000; }
```

`steps(2)` rather than an ease — the motion should feel mechanical, like a
physical switch, not springy.

## Layout and composition

Card grids with generous gaps (1.75rem+) so the offset shadows have room. A
faint 24px grid drawn on the background so the blocks sit on something. Cards
cycle through the palette by `:nth-child`.

## Motion

Only the press. 80ms, stepped, no easing curves. Anything smoother belongs to
claymorphism.

## Image treatment

**The reusable recipe.** The photograph is treated as another colour block:
pushed hard on saturation and contrast, then framed in the same 3px black.

```css
filter: saturate(1.7) contrast(1.25);
border: 3px solid #000;
box-shadow: 6px 6px 0 #000;
border-radius: 0;
```

**For generating images in this style:** flat, poster-like, high-saturation;
bold simple shapes with thick black outlines; primary and secondary colours
with no gradient; sticker or risograph feel; hard-edged shadow offset down-right
in a single flat colour; no photographic depth of field.

## Prompt descriptors

`flat vector poster` · `thick black outlines` · `hard offset drop shadow, no
blur` · `saturated primary palette` · `sticker illustration` · `risograph
print` · `no gradients` · `bold geometric shapes` · `Memphis-adjacent` ·
`high contrast, high chroma`

## Accessibility

Strong by accident of its own rules: black on saturated yellow/lime/cyan clears
AAA comfortably, and the 3px borders give every control an unmissable boundary.
Two real risks — white or light text on the pink (`#ff5bb0` needs black ink,
not white), and the rotations, which can push a focus ring visually off its
control if the rotation is applied to the focusable element rather than a
wrapper.

## How it's built here

`src/themes/neo-brutalism/` — the shadow pair lives in `--nb-shadow` /
`--nb-shadow-sm` and every block reuses it, so the offset never drifts between
components. Compare [brutalism.md](brutalism.md).
