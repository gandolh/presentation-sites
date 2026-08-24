---
summary: Maximalism as governed excess — two typefaces that disagree, a deep ground, layering over spacing — and the duotone-clash image recipe.
updated: 2026-08-23
---

# Maximalism

**c. 2018 — ongoing.** A reaction against a decade of flat, white, Helvetica-
and-a-grid product design. Lineage runs through Memphis, 1990s rave flyers,
David Carson's *Ray Gun*, and the current Y2K revival.

## The idea

More, deliberately — but *governed*. The failure mode is noise: everything loud
and nothing legible. What separates good maximalism is that the excess follows
rules as strict as minimalism's, they are just different rules.

## The four rules used here

1. **Two typefaces that disagree**, and they never do the same job. A high-
   contrast display serif for voice, a heavy grotesque for information.
2. **A deep ground.** On white, maximalism reads as a broken stylesheet; on
   aubergine it reads as deliberate. The saturated colours need somewhere dark
   to sit.
3. **Layering over spacing.** Things overlap, tilt and bleed past their
   containers. Nothing is centred in its box.
4. **The reading measure stays honest.** The body column never exceeds ~64ch
   and never drops below 1.6 line-height. That single restraint is what keeps
   it a blog instead of a poster.

## Palette

| Role | Value |
|---|---|
| Void | `#1b0f2e` deep aubergine |
| Plum | `#2d1650` |
| Hot | `#ff2e88` magenta |
| Acid | `#ffe66d` |
| Jade | `#00d4a0` |
| Tangerine | `#ff7a29` |
| Cream | `#fff4e6` |

Five chromatic colours in play at once, which is four more than most styles
allow.

## Typography

Playfair Display (900, italic) against Archivo (500–800). The serif carries
display and pull-quotes; the grotesque carries body and metadata. Layered text
shadows on the wordmark (`4px 4px 0 pink, 8px 8px 0 jade`) build a printed
mis-registration effect. Drop cap at 4.2em on the first paragraph.

## Surface and depth

Hard offset shadows (`10–14px 10–14px 0`) in palette colours rather than black,
plus 3–4px borders in a *different* palette colour than the fill. Diagonal
repeating-gradient stripes as texture on the masthead.

## Layout and composition

Auto-fill grid at 17rem minimum with `align-items: start`, so cards ragged
naturally. Every fourth card gets a different rotation (−1.2°, 0.8°, −0.6°,
1.4°), border colour and gradient. `overflow-x: clip` on the page root, because
tilted blocks bleed and the page must not scroll sideways.

## Motion

Minimal, surprisingly. The style is already busy; adding motion tips it into
unusable. Hover swaps the background-size of a highlight from a 0.28em
underline to a full fill.

## Image treatment

**The reusable recipe.** A duotone clash: the image is pushed toward a hot
magenta/acid pair, then a second differently-hued layer is blended over it with
`color-burn`. Deliberately too much.

```css
.image { filter: saturate(1.8) contrast(1.3) hue-rotate(-12deg); }
.slide::after {
  background: linear-gradient(35deg, #ff2e88, transparent 45%, #00d4a0);
  mix-blend-mode: color-burn;
  opacity: 0.55;
}
```

**For generating images in this style:** duotone or tritone with clashing
hues; heavy colour grading; collage with visible cut edges; layered pattern
behind the subject; halftone or scan-line texture over the top; oversaturated;
elements rotated off-axis; 1990s magazine or rave-flyer energy.

## Prompt descriptors

`duotone magenta and acid yellow` · `collage, cut-paper edges` · `clashing
colour grade` · `layered pattern background` · `1990s rave flyer` · `Memphis
pattern` · `oversaturated` · `scan-line overlay` · `off-axis rotation` ·
`maximalist editorial spread`

## Accessibility

The hardest style in the study to keep accessible, and it takes real work.
What this theme does: cream `#fff4e6` on the aubergine ground clears 12:1;
the body column is the one quiet room in the building (solid 86%-opaque panel,
64ch, 1.65 leading); the acid yellow is used only on dark, never as a fill
behind text. What it cannot fix: the sheer density is fatiguing, and for
cognitive-load reasons this style is a poor fit for anything transactional.

## How it's built here

`src/themes/maximalism/` — note the comment block at the top of `theme.css`
naming the four rules, and `.mx-article__body`, which is deliberately the
calmest element in the file.
