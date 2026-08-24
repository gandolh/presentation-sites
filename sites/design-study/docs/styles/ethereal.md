---
summary: Ethereal — masks instead of edges, bloom instead of shadow, a light serif on pale washes, and the honest contrast compromise the style forces.
updated: 2026-08-23
---

# Ethereal

**c. 2021.** Adjacent to "dreamcore" and the soft-gradient wave that followed
Stripe-style mesh backgrounds. Common in wellness, fragrance, ambient-music and
AI-product marketing.

## The idea

Nothing has a hard boundary. Where another style draws a border, this one lets
the thing fade out; where another crops a photograph, this one feathers it into
the page. Every technical choice serves the absence of edges.

## The vocabulary

- `mask-image` with a radial or linear gradient, so images end in air rather
  than at an edge.
- **Bloom** — a brightened, low-contrast, faintly blurred image with a soft
  halo composited over it. This is what makes light appear to spill.
- A **light serif at large sizes** with wide leading. A thin face is the only
  one that survives a low-contrast palette; a grotesque at 300 weight just
  looks broken.
- Pale lavender, blush and mist, layered as soft radial washes, `background-
  attachment: fixed` so they drift as the page scrolls.
- Wide letter-spacing (0.32–0.42em) on all small type.

## Palette

| Role | Value |
|---|---|
| Mist | `#f7f3fb` |
| Blush | `#fbeef2` |
| Lavender | `#c9b6e4` |
| Sky | `#bcd6ec` |
| Ink | `#4a4458` (7.4:1 on mist) |
| Quiet | `#6f6880` (4.9:1 — the palest text permitted) |

## Typography

Cormorant at 300–400, body set unusually large (21px) at 1.85 leading. Italic
for display. Text shadows used as glow rather than depth: `0 0 42px rgb(201 182
228 / 0.9)`.

## Surface and depth

No shadows in the conventional sense. Depth is glow and blur. Separators are
`border-image` gradients that dissolve at both ends — the theme cannot bring
itself to draw a full line.

## Layout and composition

One slow centred column, 34rem measure, with very large vertical padding
(clamp to 6rem+). Everything is centre-aligned, which is unusual in this study
and is part of why it reads as weightless.

## Motion

Slow (400ms+) and confined to opacity and glow. Nothing translates.

## Image treatment

**The reusable recipe.** Bloom, then feather.

```css
.image {
  filter: brightness(1.1) contrast(0.82) saturate(0.85) blur(0.2px);
  mask-image: radial-gradient(ellipse 78% 78% at 50% 50%, #000 52%, transparent 100%);
}
.slide::after {                   /* the spill */
  inset: 0;                       /* NOT negative — see the note below */
  background: radial-gradient(ellipse 66% 66% at 50% 45%,
              transparent 52%, rgb(247 243 251 / 0.85) 100%);
}
```

One implementation trap worth recording: the halo must stay **inside** the
slide box. A negative inset gets clipped by the carousel viewport's `overflow:
hidden` and renders as a hard rectangle — the exact opposite of the effect. It
was built that way first and it was immediately obvious in the browser.

**For generating images in this style:** overexposed, backlit, hazy; lens
bloom and light leaks; pale lavender, blush and mist palette; soft focus at the
edges; subject dissolving into the background; fog, gauze, sheer fabric,
water vapour; no hard shadows anywhere; dreamlike, weightless.

## Prompt descriptors

`backlit, overexposed` · `lens bloom and light leak` · `pale lavender and
blush` · `soft focus, feathered edges` · `hazy, dreamlike` · `sheer fabric,
fog, vapour` · `low contrast, lifted blacks` · `subject dissolving into
background` · `no hard shadow` · `weightless`

## Accessibility

**The theme most likely to fail WCAG if handled carelessly**, and the one place
in this study where a deliberate compromise was made and should be named. The
style's instinct is pale-grey-on-pale-lavender text at perhaps 2.5:1. This
theme instead pins body text to `#4a4458` (7.4:1) and refuses to let any text
colour go below `#6f6880` (4.9:1). Only decorative type — the wordmark's glow —
is allowed to be pale. Purists would say it is no longer ethereal enough. The
alternative is a page a partially-sighted reader cannot use.

Also: `mask-image` on images means the visual edge and the layout box differ,
so focus rings on interactive images can appear detached.

## How it's built here

`src/themes/ethereal/` — see the header comment, which states the contrast
compromise in the file itself rather than only here.
