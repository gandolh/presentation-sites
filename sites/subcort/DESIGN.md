---
name: Subcort
description: Event-tent rental & setup in Gorj/Oltenia — the site as a drawing set. Every page is a numbered sheet, every graphic is a projection of one shared marquee model, and the object is drawn in ink while every annotation is orange.
colors:
  ink: "oklch(29% 0.028 234)"
  ink-2: "oklch(48% 0.024 233)"
  line: "oklch(52% 0.026 234)"
  line-soft: "oklch(76% 0.017 233)"
  hair: "oklch(90.5% 0.006 230)"
  signal: "oklch(52.5% 0.152 40)"
  signal-hover: "oklch(47% 0.145 39)"
  signal-soft: "oklch(95% 0.022 45)"
  on-signal-soft: "oklch(44% 0.14 39)"
  sheet: "oklch(98.6% 0.002 90)"
  paper: "oklch(100% 0 0)"
  fill: "oklch(94.5% 0.004 233)"
  fill-2: "oklch(96.6% 0.003 233)"
  success: "oklch(52% 0.1 155)"
  error: "oklch(52% 0.17 28)"
typography:
  display:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 5.2vw, 3.9rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.034em"
  headline:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.028em"
  title:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.7vw, 1.2rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.014em"
  contact:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.12rem, 2vw, 1.45rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.02rem, 1.4vw, 1.12rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-sm:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "0.93rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  small:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "0.87rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  plate-no:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.09em"
  datum-key:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
  dimension:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "0px"
  md: "2px"
  pill: "999px"
components:
  plate-head:
    display: "grid"
    columns: "11rem minmax(0, 1fr) ≥900px"
    borderTop: "1.5px solid {colors.ink}"
    note: "Plate number left, content right. The page spine; nothing is centred."
  titleblock:
    borderTop: "1.5px solid {colors.ink}"
    backgroundColor: "{colors.fill-2}"
    note: "The band of key dimensions along the foot of a drawing."
  callout-no:
    size: "1.65rem"
    border: "1.5px solid {colors.signal}"
    rounded: "{rounded.pill}"
    note: "The numbered circle. The one round thing in the system, because a drawing callout is round."
  dimbar:
    note: "A dimension line with tick terminators, sized to the value. Replaces the progress bar."
  panel:
    backgroundColor: "{colors.paper}"
    border: "1px solid {colors.hair}"
    note: "Flat. A drawing has no shadows — depth is line weight."
  chip-included:
    textColor: "{colors.ink-2}"
    border: "1px solid currentColor"
    rounded: "{rounded.sm}"
  chip-optional:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.on-signal-soft}"
    rounded: "{rounded.sm}"
  btn-outline:
    border: "1px solid {colors.line}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1.1rem"
    note: "Neutral utility links only — never a conversion CTA."
---

# Design System: Subcort

## 1. Overview

**Creative North Star: "Montaj" — the site is a drawing set.**

Subcort's product is not a tent; it is an *erection*. Somebody arrives with a
structure, puts it up on your ground exactly to plan, and takes it away again.
The artifact that already exists between a crew and a client for that work is a
**drawing**: an exploded axonometric showing what the thing is made of, with
numbered callouts, dimension lines and a title block.

So the site is that drawing set. Every page is a numbered sheet. Every graphic
is a projection of one shared model — the marquee Subcort actually rents — and
that model lives in exactly one place, [`src/lib/draft.ts`](src/lib/draft.ts).
The hero renders it in WebGL; the exploded plate, the scale plan and the OG card
render it as deterministic SVG at build time.

**Key characteristics:**
- One model, drawn many ways. The 3D hero and the SVG plate are the *same
  object* rendered twice, and they must always agree.
- **The object is ink; every annotation is orange.** No exceptions — see the
  Annotation Rule below.
- Light throughout: a near-white sheet, no dark surfaces anywhere.
- **IBM Plex Sans** for language, **IBM Plex Mono** for every measurement.
- Flat. A drawing has no shadows; depth is line weight.
- Square corners everywhere except the callout circle.
- **No calls-to-action anywhere.** The site informs and steps back.

## 2. Colors

### Ink — the object
- **Ink** `oklch(29% 0.028 234)` — body copy, headings, and the structural
  members of the frame, which are drawn heaviest because they *are* the object.
- **Line** `oklch(52% 0.026 234)` — envelope outlines and panel edges.
- **Line-soft** `oklch(76% 0.017 233)` — extension lines, deck boards, the
  bare track of a dimension bar.
- **Hair** `oklch(90.5% 0.006 230)` — table rules and cell borders.

### The annotation layer
- **Signal** `oklch(52.5% 0.152 40)` — callout circles and leaders, dimension
  values, plate numbers, step numbers, the ridge line, the current nav item, the
  active format, the focus ring. Darkened from the comp's brighter orange so it
  clears AA as text at 0.7rem; a deeper burnt orange is closer to real drafting
  red anyway.

### The sheet
- **Sheet** `oklch(98.6% 0.002 90)` — the paper.
- **Paper** `#fff` — plan panels and cards, lifting off the sheet.
- **Fill / Fill-2** — panel washes and the title-block band.

### Named rules

**The Annotation Rule.** Everything that *is the object* is drawn in ink and
line. Everything the draughtsman *added on top* — callouts, leaders, dimensions,
the ridge highlight, state — is orange. This is the whole colour system, and it
is a semantic rule, not a palette preference. Never fill a surface with orange,
and never draw a structural member in it.

**The Light-Sheet Rule.** The sheet is near-white and stays that way, from the
masthead to the ANPC line. There are no dark surfaces in this system.

**The One-Model Rule.** Every drawing on the site comes from `marquee()` in
`draft.ts`. If the hero and the plate ever disagree about the tent, the bug is
that something drew its own geometry.

## 3. Typography

**IBM Plex Sans** (variable) and **IBM Plex Mono**, self-hosted via fontsource —
no Google Fonts CDN, so no visitor IPs leave for Google. Plex draws the Romanian
comma-below diacritics (ș ț) correctly, which many grotesques do not.

The mono face is not a costume for "technical": it is used **only for
measurement and register** — dimensions, capacities, areas, plate numbers,
sheet codes, datum keys. Prose is never set in it.

The ramp, and nothing off it: **3.9/2.35 → 2.6/1.8 → 1.45 → 1.2 → 1.12 → 1 →
0.93 → 0.87 → 0.78 → 0.7 rem.**

### Named rule
**The Measurement-in-Mono Rule.** If it is a number with a unit, or a code that
identifies a sheet, it is set in Plex Mono with tabular figures so it aligns
down a column. If it is language, it is set in Plex Sans.

## 4. Layout

### The sheet
`.sheet` is the page container: 84rem max, padded by `--sheet-pad`.

### The plate
Every section is a `.plate` opened by a `.plate-head`: a 1.5px ink rule, the
plate number and note in an 11rem left column, the content in the right. One
asymmetric rule, applied everywhere, stacking on phones.

### Named rules
**The Numbered-Register Rule.** Section numbers are legitimate here and nowhere
else on any sibling site: a drawing set *is* a numbered register, and the reader
navigates it by number. `01 · Alcătuire`, `02 · Execuție`, `01.1 · Plan`. The
navigation, the mobile menu and the footer all carry the same numbers.

**The Uncentred Rule.** Nothing on this site is centre-aligned. The plate-head
grid is the spine.

## 5. Elevation

Flat. Surfaces at rest have a 1px hairline and a tonal fill, never a resting
shadow — a drawing has no shadows, and depth is carried by line weight (frame
1.6px ink, envelope 1.1px line, extension 0.7px line-soft). The single shadow in
the system belongs to the open mobile menu, bound to a state.

## 6. Motion

**One authored moment per page.**

- **The hero assembly** (home): the layers start separated in the vertical,
  exactly as the plate draws them, and settle into the finished structure —
  which is literally the service. anime.js drives a plain state object; the
  Three.js scene maps it onto geometry. The rAF loop stops when the hero leaves
  the viewport.
- **The scale plan** (`/corturi`): one spring carries the format index and a
  subscriber writes the SVG geometry attributes directly. *Motion reads `x`/`y`
  as transform shorthands, so animating SVG geometry through props silently does
  nothing* — hence the imperative write.
- **Scroll reveal**: visible by default; JS opts into the hidden start, with a
  2.5s failsafe so nothing ships blank to a crawler.

`prefers-reduced-motion` is honoured throughout, and it also means **Three.js is
never downloaded** — the visitor keeps the isometric still, which is real markup
in the HTML. The same is true with no JS or no WebGL.

## 7. The drawing engine

[`src/lib/draft.ts`](src/lib/draft.ts) owns the model and the annotation
primitives:

- `marquee(spec)` — the structural members and envelope panels of a gable
  marquee, in metres. One source of truth.
- `isometric()` — true isometric projection (no perspective), the projection a
  real assembly drawing uses.
- `tone(quad)` — flat tonal shading from a fixed high-left sun, used by *both*
  the SVG plate and the WebGL hero so they match.
- `dimension(from, to, label)` — a dimension line with 45° tick terminators and
  the value sitting on the line.
- `callout(n, anchor, at, label)` — the numbered circle on a dashed leader.

**To add a drawing:** project `marquee()` through `isometric()`. Do not
hand-author geometry.

## 8. Do's and Don'ts

### Do
- **Do** keep the object in ink and every annotation in orange.
- **Do** derive every drawing from `marquee()` in `draft.ts`.
- **Do** set measurements in Plex Mono and language in Plex Sans.
- **Do** number the plates, and keep the numbers in a drawing's key identical to
  the callout numbers on the drawing itself.
- **Do** compute a drawing's viewBox from its geometry, so it can never grow out
  of its box (see `ExplodedPlate.astro`).
- **Do** keep surfaces flat; carry depth in line weight.
- **Do** hold WCAG 2.2 AA, and give interactive targets a real box
  (`padding-block` does not lay out on an inline element).

### Don't
- **Don't** add calls-to-action: no quote form, no booking widget, no sticky
  call bar. The site informs and steps back.
- **Don't** introduce a dark surface anywhere.
- **Don't** fill a surface with the signal orange, or draw structure in it.
- **Don't** set prose in the mono face.
- **Don't** put an uppercase tracked-out eyebrow above a heading — the plate
  number is a sibling in the left column, not a hat.
- **Don't** centre a section.
- **Don't** add a resting shadow to a flat surface.
- **Don't** animate SVG geometry through Motion props (see §6).
