---
name: Subcort
description: Event-tent rental & setup in Gorj/Oltenia. "On your ground": the tent stands on a measured sage plot, and the facts lie on it as cards and panels. Every graphic is a projection of one shared marquee model; the object is drawn in ink and every annotation is orange.
colors:
  ink: "#1d2e37"
  ink-2: "#516069"
  line: "#5b6c76"
  line-soft: "#a7b3ba"
  hair: "#dde1dd"
  signal: "#af4316"
  signal-hover: "#9a3409"
  signal-soft: "#fceae3"
  on-signal-soft: "#8f2d01"
  sheet: "#f0f4f0"
  field: "#dfe8de"
  grid: "#d4ded3"
  paper: "#fcfdfc"
  fill-2: "#eef1ee"
  edge: "#b5bdb5"
  deck: "#eceff1"
  membrane: "#fafaf8"
  membrane-shade: "#eeeeec"
  success: "oklch(52% 0.1 155)"
  error: "oklch(52% 0.17 28)"
typography:
  display:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1.63rem + 2.02vw, 3.25rem)"
    fontWeight: 650
    lineHeight: "56px at 1280, 38px at 390"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.4vw, 2.25rem)"
    fontWeight: 650
    lineHeight: "40px at 1280, 32px at 390"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  lede:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "1.125rem (1.0625rem on a phone)"
    fontWeight: 400
    lineHeight: "28px (26px on a phone)"
  body:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Commissioner Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    note: "Sentence case, untracked."
  figure:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.41
    note: "Figures, ranges with units and sheet numbers only."
rounded:
  sm: "0px"
  md: "2px"
  full: "9999px"
components:
  field:
    backgroundColor: "{colors.field}"
    note: "The plot behind the hero and every page head: a 32 px grid of two linear-gradients in {colors.grid}, a 1 px {colors.edge} rule below."
  card:
    backgroundColor: "{colors.paper}"
    border: "1px solid {colors.edge}, 1.5px {colors.ink} on top"
    note: "Lies on the field. No shadow; it reads by tone, an edge and its top rule."
  panel:
    backgroundColor: "{colors.paper}"
    border: "1px solid {colors.edge}"
    note: "Lies on the ground with a 24 px side gutter (12 px on a phone) and a head band."
  band:
    backgroundColor: "{colors.fill-2}"
    note: "A 48 px head band across a panel or page head: number (mono, signal), name, scale."
  dot:
    size: "32px"
    border: "1.5px solid {colors.signal}"
    rounded: "{rounded.full}"
    note: "The numbered callout in a key list."
  link-btn:
    border: "1px solid {colors.ink}"
    rounded: "{rounded.md}"
    minHeight: "48px"
    note: "Neutral. Never a filled call."
  size-picker:
    note: "2 x 2 targets of 48 px; the selected one is ink-filled with paper text."
---

# Design System: Subcort

## 1. Overview

**Creative North Star: "On your ground".**

The visitor's question is whether the crew can bring a proper covered space to
*their* ground and set it up to plan. So the first screen is a measured plot:
a sage field with a quiet 32 px grid, the marquee standing on it large, and the
facts laid on that plot as white cards, the way a drawing's title block sits in
its corner. Below, each part of the story is a panel with a head band that
names its number, its name and its scale.

The idea underneath is unchanged: the site is a drawing set, and every graphic
is a projection of one shared model, the marquee Subcort rents, in
[`src/lib/draft.ts`](src/lib/draft.ts). The hero renders it in WebGL (a still
SVG in the HTML first); the exploded plate, the scale plan and the OG card
render it as SVG at build time.

**Key characteristics:**
- One model, drawn many ways. The 3D hero and the SVG plate are the same object
  and must always agree. `draft.ts` changes colour only, through tokens.
- **The object is ink; every annotation is orange.** See the Annotation Rule.
- One light look, no theme switch: a pale sage ground, a darker sage field with
  a grid for the hero and page heads, near-white cards and panels.
- **Commissioner** for language, **IBM Plex Mono** for figures and sheet numbers.
- No shadow. A card reads by tone, a 1 px edge and a 1.5 px ink top rule.
- No photography.
- No calls to action. The hero's `Vezi dimensiunile și dotările` is a neutral
  link-button, never a filled call.

## 2. Colors

### Ink: the object
- **Ink** `#1d2e37`: text, the frame (drawn heaviest, because it is the
  object), rules, the selected size.
- **Ink-2** `#516069`: secondary text.
- **Line** `#5b6c76`: envelope outlines, the picker border.
- **Line-soft** `#a7b3ba`: extension lines, deck boards, the track of a
  dimension bar, link underlines.
- **Hair** `#dde1dd`: rules inside a card or panel.

### The annotation layer
- **Signal** `#af4316`: the callout circles and leaders, dimension values, sheet
  and step numbers, the ridge line, the current place in the nav, the focus
  ring. **Signal-hover** `#9a3409` for link hover. **Signal-soft** `#fceae3`
  with **on-signal-soft** `#8f2d01` for the note banner and the `Opționale`
  band (7.08:1).

### Ground, field, surfaces
- **Sheet** `#f0f4f0`: the page ground.
- **Field** `#dfe8de` with **grid** `#d4ded3` (1.10:1 on the field, half
  today's step): the plot behind the hero and the page heads, and the small
  plate under the tent on a phone.
- **Paper** `#fcfdfc`: header, cards, panels. **Fill-2** `#eef1ee`: the head
  band and the footer. **Edge** `#b5bdb5`: the 1 px edge of a card, panel,
  menu button or social button.
- **Deck, membrane, membrane-shade** `#eceff1`, `#fafaf8`, `#eeeeec`: the
  drawing's deck and its lit and shaded panels. Two tones are enough; the
  drawing reads by line.

### Named rules

**The Annotation Rule.** Everything that is the object is ink and line.
Everything the draughtsman added on top (callouts, leaders, dimensions, the
ridge, the current place) is orange. Never fill a surface with orange, and never
draw a structural member in it. The selected size in the Corturi picker is
ink-filled for this reason.

**The Plot Rule.** Cards lie on the field; panels lie on the ground. A card
carries a 1.5 px ink top rule, a panel a head band. Nothing is both.

**The One-Model Rule.** Every drawing comes from `marquee()` in `draft.ts`. If
the hero and the plate ever disagree about the tent, something drew its own
geometry.

## 3. Typography

**Commissioner Variable** (`@fontsource-variable/commissioner` 5.3.0) for
language and **IBM Plex Mono** (`@fontsource/ibm-plex-mono` 5.3.0) for figures,
both self-hosted: no Google Fonts CDN, so no visitor IPs leave for Google.
Commissioner's latin-ext file maps ș and ț to the comma-below glyphs Romanian
needs.

The ladder is the `--text-*` tokens: `display` 52/56 650 (34/38 on a phone),
`h2` 36/40 650 (28/32), `title` 20/26 600, `lede` 18/28 (17/26), `body` 16/26,
`label` 14/20 500 in sentence case, `figure` Plex Mono 17/24 600. Labels are
never uppercase or tracked.

**The Measurement-in-Mono Rule.** A number with a unit, a range, or a sheet
code is set in Plex Mono with tabular figures. Language is Commissioner.
Ranges use the figure dash U+2012 with no spaces (`8‒20 m`), a separator only,
never a figure; inside a sentence the range alone is mono (`.rg`).

## 4. Layout

- `.sheet`: the container, 75rem wide, side padding 24 px (12 px on a phone).
- **The field** (`.field`): hero and page heads. The hero is a 5/7 grid, the
  copy card left, the tent and the title block right. A page head is one card
  spanning the container: its band, then the title in 5 columns and the lede in
  7; on Contact it sits beside the data card.
- **Panels** (`.panel`): a head band (`.band`: number, name, scale, in sentence
  case), then the body at 32 px. The numbered register stays: `01`, `02`,
  `01.1`.
- **The title block** (`.tb`): five cells on a card. At 1024 it is six columns
  (2+2+2, then 3+3), split by hairlines. On a phone the drawing sits on its own
  gridded plate at the head of the spec card and the `Zonă` row leads the list.
- **The key** (home plate 01): the exploded drawing beside its parts list, with
  numbered circles on the drawing at every width, and no text labels on it.
- **Corturi:** the plan on the field, a 2 x 2 size picker of 48 px targets, the
  table folded per format on phones, each note 4 px under its label, `Opționale`
  on signal-soft. Plan labels stay at 12 px or more for dimensions and 11 px or
  more for the car at 390 and 360.
- **Footer:** facts are separate parts, never joined with a middle dot; links are
  underlined.

## 5. Elevation

None. No resting shadow, no raised shadow. A card is 1.25:1 against the field,
with a 1 px edge and its ink top rule; a panel head is a band, 1.14:1 on paper.
Depth in the drawings is line weight (frame 1.6 px ink, envelope 1.1 px line,
extension 0.7 px line-soft).

## 6. Motion

- **The hero assembly** (home): the layers start separated and settle into the
  finished structure. anime.js drives a plain state object; the Three.js scene
  maps it onto geometry. The rAF loop stops when the hero leaves the viewport.
  The comps show its resting frame; the motion is unchanged.
- **The scale plan** (`/corturi`): one spring carries the format index and a
  subscriber writes the SVG geometry directly (Motion reads `x`/`y` as
  transform shorthands, so animating geometry through props does nothing).
  Until the island runs, the picker rests disabled and the table gives every
  figure.
- **Scroll reveal**: visible by default; JS opts into the hidden start, with a
  2.5 s failsafe.

`prefers-reduced-motion`: Three.js is never downloaded and the visitor keeps
the isometric still, which is real markup in the HTML. The same holds with no
JS or no WebGL.

## 7. The drawing engine

[`src/lib/draft.ts`](src/lib/draft.ts) owns the model and the annotation
primitives: `marquee(spec)`, `isometric()`, `tone(quad)` (hex, for the WebGL
scene and the OG card) and `toneVar(quad)` (a `var(--color-membrane)` or
`var(--color-membrane-shade)` fill for the SVG drawings), and `dimension()`.
Its colour constants are the site's tokens as hex, for the places that cannot
read a CSS variable. To add a drawing, project `marquee()` through
`isometric()`; do not hand-author geometry.

## 8. Do's and Don'ts

### Do
- **Do** keep the object in ink and every annotation in orange.
- **Do** derive every drawing from `marquee()`, and colour it through tokens.
- **Do** set figures in Plex Mono and language in Commissioner, in sentence case.
- **Do** keep the numbers in a drawing's key identical to the circles on it.
- **Do** compute a drawing's viewBox from its geometry.
- **Do** hold WCAG 2.2 AA, and give interactive targets a real box of 44 px or more.

### Don't
- **Don't** add calls to action: no quote form, no booking widget, no sticky call bar.
- **Don't** add a dark surface or a theme switch.
- **Don't** fill a surface with orange, or draw structure in it.
- **Don't** set prose in the mono face, or a label in capitals.
- **Don't** add a shadow.
- **Don't** add photography.
- **Don't** name a site class like a Tailwind theme utility (`text-lede` while a
  `--text-lede` token exists): the utility layer wins.
