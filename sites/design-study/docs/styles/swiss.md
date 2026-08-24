---
summary: Swiss/International Typographic Style — the twelve-column grid, objective typography, one red, and grayscale hard-cropped photography, with the reusable image recipe.
updated: 2026-08-23
---

# Swiss Design

**1950s, Basel and Zürich.** The International Typographic Style — Müller-
Brockmann, Hofmann, Ruder, Frutiger. Formalised in *Grid Systems in Graphic
Design* (1981), which is still the primary source.

## The idea

Design as an objective activity. The designer's taste is a source of error;
the grid, a neutral typeface and a system of proportions remove it. Content is
organised, not interpreted. This is the ancestor of nearly every design system
in software, which is why it can look like "just good defaults" — it *became*
the defaults.

## Defining traits

- A modular grid, usually twelve columns with a fixed gutter, and nothing off
  it. The grid is not scaffolding, it is the design.
- Flush left, ragged right. No centring, no justification.
- One neutral grotesque (Helvetica, Univers, Akzidenz-Grotesk), two weights.
- Hierarchy from size, weight and position only — never colour or ornament.
- Hairline rules to divide, at 1px, in the ink colour.
- Photography treated as information: grayscale, hard-cropped, square corners.
- Asymmetry within order — the balance is optical, not centred.

## Palette

| Role | Value |
|---|---|
| Paper | `#ffffff` |
| Ink | `#111111` |
| Grey | `#767676` (4.6:1 — the lightest permitted) |
| Red | `#e1000f`, used as a mark, never as decoration |

The red is the only chromatic element and appears three or four times per page
at most: an eyebrow, an active state, a rule terminal.

## Typography

Inter or Helvetica. Body 16px/1.5. Tracking −0.006em at body, −0.035em at
display. Tabular figures throughout (`font-feature-settings: "tnum"`) so
numbers align down the column. Uppercase with 0.08em tracking for labels.
Display sizes are large and set very tight — 4rem at 1.02 line-height.

## Surface and depth

Flat. Zero radius, zero shadow. Depth would imply a metaphor, and the style
refuses metaphor.

## Layout and composition

Twelve columns, 1.25rem gutter, margins clamped 1.25–4rem. Elements span named
column ranges (`1 / span 5`, `7 / span 6`) rather than percentages. Baseline
rhythm on an 8px unit. On narrow viewports it collapses to six columns, never
to a single stacked flow — the grid stays visible.

## Motion

None. Hover changes colour, nothing else.

## Image treatment

**The reusable recipe.** The photograph is evidence, not atmosphere.

```css
filter: grayscale(1) contrast(1.06);
border-radius: 0;
box-shadow: none;
```

- Cropped to the grid, not to the subject. If the crop cuts the subject, the
  grid wins.
- Aligned flush to a column edge on at least two sides.
- Captions set as small type on the same hairline rule as everything else.

**For generating images in this style:** black-and-white; a single clear
subject, geometric and centred or on a third; strong tonal separation between
subject and ground; even, direct light with a hard edge; industrial or
architectural subjects; no colour, no filter warmth, no vignette; composed so
the frame edge cuts a shape cleanly.

## Prompt descriptors

`black and white photograph` · `high tonal separation` · `geometric subject` ·
`hard directional light` · `flush-cropped to frame edge` · `Bauhaus / Ulm
sensibility` · `objective documentary` · `no vignette, no grain` · `flat
lighting` · `square-cornered` · `1:1 or 4:5`

## Accessibility

Structurally excellent — real hierarchy, high contrast, honest heading order.
Two cautions: the grey must not go below `#767676` on white, and the tight
display tracking becomes hard to read below about 1.5rem, so it is applied only
at display sizes here.

## How it's built here

`src/themes/swiss/` — `.swiss-grid` is applied by name to every section, so the
grid is legible in the markup as well as on screen. The feed figure is capped
at 22rem because an uncapped 4:5 image at five columns runs ~660px tall against
three lines of text and stops reading as one entry.
