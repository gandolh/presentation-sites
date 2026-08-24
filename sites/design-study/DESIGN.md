# DESIGN — design-study

This site has no single visual system. It has fourteen, plus one piece of
neutral chrome that must not look like any of them. This document describes the
chrome and the seams; each theme's system is documented in its own
`theme.css` header and in `docs/styles/<slug>.md`.

## The neutral layer

Three things are shared and deliberately style-free.

### The switcher

Fixed to the bottom of every one of the 183 pages. It is the instrument, not
the specimen, so it:

- lives **outside `.ds-page`**, as a direct child of `<body>`, where no theme
  rule can select into it;
- states every property outright — font, size, colour, spacing — rather than
  inheriting anything;
- keeps one fixed dark palette (`#1c1c1e` / `#f2f2f7` / `#8e8e93`) across all
  fourteen themes, so it reads as browser furniture.

### The landing gallery

Same dark system chrome. Each of the fourteen cards carries a **flat
three-value swatch** (background, foreground, accent) rather than a live
preview — an index must not start looking like the thing it indexes.

### base.css

The only global stylesheet. It holds exactly two things: a reset thin enough
that Brutalism can still get browser defaults back, and the *structural*
carousel rules — the geometry the Embla island needs in order to be a carousel
at all. Everything decorative is a theme's business.

## The seams a theme plugs into

| Seam | Contract |
|---|---|
| `.ds-page` | The theme's root. **All** theme CSS is scoped under it. |
| `.ds-carousel__*` | Documented DOM contract, restyled by every theme; two themes replace the component. |
| `.ds-feed__item` | One feed entry. The pager toggles `hidden` on these. |
| `.ds-pager__*` | The feed pager's markup; each theme draws its own. |
| `[data-theme]` | On `<html>` and `<body>`, for the page background. |

Astro island props must be serialisable, so **the styling seam is CSS, not
JSX**. There are no render-prop slots; a theme that needs a different carousel
*mechanism* (spatial, liquid-glass) ships its own component instead.

## Typography across the study

Eight families, chosen so that no two adjacent styles in the gallery share one,
and each loaded only by the theme that uses it:

| Theme | Family |
|---|---|
| Minimalism, Swiss, Glassmorphism, Liquid Glass, Spatial | Inter |
| Brutalism | Times New Roman — **no webfont at all** |
| NeoBrutalism | Archivo |
| Maximalism | Playfair Display + Archivo |
| Surrealism | Playfair Display |
| Bohemian | EB Garamond |
| Ethereal | Cormorant |
| Skeuomorphism | Open Sans |
| Neumorphism, Claymorphism | Nunito |

## Image treatment as a design surface

The fourteen themes share one photo set and differ in how they treat it. That
is where the shared source stops being a limitation and becomes the point — the
full table lives in each dossier's **Image treatment** section, and ranges from
Swiss's `grayscale(1)` to Brutalism's SVG threshold plus dot screen to Liquid
Glass's four-layer refraction stack.

Every treatment is CSS or inline SVG. **The markup and the `src` never change.**

## Accessibility posture

The study renders styles faithfully, including their failures — but it will not
ship a page nobody can read. Where those two goals conflict, the theme takes
the smallest possible departure and says so in its own CSS:

- **Neumorphism** — body text at 7.2:1 instead of the era's ~2:1, and a visible
  focus ring on every control. Both are departures from the style.
- **Ethereal** — no text colour paler than 4.9:1; only decorative type is
  allowed to glow.
- **Glassmorphism** — an opaque tint layer under the translucency, so contrast
  has a floor independent of the backdrop.
- **Brutalism** — full-window measure *kept*, because that is the style's
  position rather than an oversight.
- **Spatial** — the WebGL canvas is `aria-hidden`; the whole accessible surface
  is DOM outside it, plus a `<noscript>` fallback.

Everywhere: exactly one `<h1>` per page (the wordmark on a feed, the article
title on a post), no horizontal overflow at 390px or 1440px, and a working
no-JS path — the feed shows all twelve posts and the carousel swipes on
scroll-snap before Embla hydrates.
