---
summary: Web brutalism as refusal — browser defaults, raw structure, 1-bit halftone imagery — plus why it is the fastest and least accessible theme in the study.
updated: 2026-08-23
---

# Brutalism

**Web, c. 2014.** Named after Brutalist architecture's *béton brut* (raw
concrete), but the web version is a different argument: not "honest material"
so much as "honest document". Popularised by brutalistwebsites.com, Bloomberg's
early-2010s features, Craigslist as the accidental patron saint.

## The idea

Every softening move — the rounded corner, the drop shadow, the webfont, the
max-width — is a small dishonesty about what a web page is. Brutalism removes
them and shows the document. It is a position, not an aesthetic, which is why
"ugly on purpose" misses it: the page is not styled *badly*, it is styled
*barely*.

## Defining traits

- The browser's default typeface. Times New Roman, because that is what the UA
  picks when nobody intervenes.
- Default link colours: `#0000EE`, underlined, `#551A8B` once visited.
- No max-width. Text runs the full window.
- Hard 1px borders, zero radius, zero shadow, zero transition.
- Structure printed as text — file names, counts, section markers, indices.
- Monospace for anything machine-ish.

## Palette

| Role | Value |
|---|---|
| Ground | `#ffffff` |
| Ink | `#000000` |
| Link | `#0000ee` / visited `#551a8b` |
| Disabled | `#999999` |

No third colour. Ever.

## Typography

`"Times New Roman", Times, serif` for prose; `ui-monospace, "Courier New"` for
metadata. No webfont is loaded at all — which incidentally makes this the
fastest theme in the study by a wide margin (zero font bytes, and its CSS is
small enough that Astro inlines it, so the page ships **no external stylesheet
either**).

## Surface and depth

None, aggressively. `border: 1px solid #000` is the only surface treatment in
the file.

## Layout and composition

Full-bleed, 8px page padding. Bordered boxes stacked vertically. Headings are
oversized (3.5rem) against 1rem body with 1.3 leading — tight, dense, cheap.
`##` printed literally before `<h2>`s, because the markup should be visible.

## Motion

Zero. Not "reduced" — absent.

## Image treatment

**The reusable recipe, and the most transferable one in the study.** A true
1-bit threshold via an SVG filter, then a dot screen laid over it: newsprint
halftone, an image reduced to the smallest number of decisions that still
describes a shape.

```html
<filter id="brut-threshold" color-interpolation-filters="sRGB">
  <feColorMatrix type="saturate" values="0"/>
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 1"/>
    <feFuncG type="discrete" tableValues="0 1"/>
    <feFuncB type="discrete" tableValues="0 1"/>
  </feComponentTransfer>
</filter>
```

```css
.image { filter: url("#brut-threshold"); image-rendering: pixelated; }
.slide::after {                    /* the dot screen */
  background-image: radial-gradient(circle at center, #fff 0.9px, transparent 1px);
  background-size: 3px 3px;
  mix-blend-mode: lighten;
}
```

Note `feComponentTransfer` with two discrete steps is a *real* threshold, not a
contrast boost pretending to be one — the difference is visible on midtones.

**For generating images in this style:** 1-bit black and white; heavy dot
screen or dithering; photocopied, xeroxed, degraded; high contrast with no
midtones; visible halftone rosette; scanned newsprint; bold simple silhouette
that survives being reduced to two values.

## Prompt descriptors

`1-bit black and white` · `halftone dot screen` · `xerox / photocopy
degradation` · `newsprint texture` · `threshold, no midtones` · `dithered` ·
`high-contrast silhouette` · `zine photocopy` · `coarse dot pattern` · `1980s
fax`

## Accessibility

The worst measure in the study, deliberately. Full-window line length at
desktop widths is genuinely hard to read — the eye loses the return sweep past
about 90 characters and this style routinely exceeds 200. That is the style's
position and the theme does not soften it.

What it gets *right*, and what many prettier styles get wrong: real semantic
elements, default focus rings, link colours that carry visited state, and
contrast that cannot fail because there are only two colours.

## How it's built here

`src/themes/brutalism/` — the SVG filter is declared once per document in
`Shell.astro`. See [neo-brutalism.md](neo-brutalism.md) for the descendant that
kept the outlines and threw away the argument.
