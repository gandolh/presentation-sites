---
name: BavAuto Gorj
description: The page is the instrument binnacle of a BMW at night — graphite bezel, steel wells, printed legends, one amber that lights only what is live.
colors:
  # --- the binnacle: ground and the steel wells machined out of it ---
  background: "oklch(13.5% 0.008 255)"
  surface: "oklch(13.5% 0.008 255)"
  surface-container-lowest: "oklch(17% 0.010 255)"
  surface-container-low: "oklch(20% 0.012 256)"
  surface-container: "oklch(23.5% 0.014 256)"
  surface-container-high: "oklch(27.5% 0.016 257)"
  surface-container-highest: "oklch(31.5% 0.018 257)"
  bezel-edge-top: "oklch(20% 0.012 256)"
  bezel-edge-bottom: "oklch(15% 0.009 255)"
  band-ground-top: "oklch(15.5% 0.010 255)"
  band-ground-bottom: "oklch(12% 0.008 255)"
  overlay-ground: "oklch(12% 0.008 255)"
  # --- printed legends (ink on the dial face) ---
  on-surface: "oklch(96% 0.004 250)"
  on-surface-variant: "oklch(76% 0.010 255)"
  outline: "oklch(48% 0.014 256)"
  outline-variant: "oklch(29% 0.014 256)"
  hairline-inset: "oklch(22% 0.012 256)"
  # --- the brushed-aluminium console trim: the one light material ---
  inverse-surface: "oklch(87% 0.005 250)"
  inverse-surface-2: "oklch(93% 0.004 250)"
  inverse-on-surface: "oklch(20% 0.012 256)"
  inverse-on-surface-variant: "oklch(40% 0.014 256)"
  link-on-trim: "oklch(42% 0.140 45)"
  # --- PRIMARY: the illumination ---
  primary: "oklch(72% 0.170 58)"
  primary-hover: "oklch(78% 0.155 62)"
  primary-lift: "oklch(84% 0.140 66)"
  primary-deep: "oklch(66% 0.170 55)"
  primary-rim: "oklch(86% 0.10 68)"
  on-primary: "oklch(17% 0.040 55)"
  primary-container: "oklch(26% 0.055 58)"
  on-primary-container: "oklch(88% 0.080 62)"
  primary-bright: "oklch(82% 0.125 65)"
  primary-edge: "oklch(46% 0.060 58)"
  # --- M motorsport tri-color: LED segment coding, canonical order ---
  m-blue: "oklch(68% 0.15 242)"
  m-indigo: "oklch(52% 0.17 285)"
  m-red: "oklch(60% 0.22 27)"
  led-off: "oklch(24% 0.012 256)"
  led-off-edge: "oklch(31% 0.014 256)"
  # --- unlit controls (the steel switch on the bezel) ---
  control-steel: "oklch(19% 0.011 256)"
  control-steel-hover: "oklch(23% 0.013 256)"
  control-edge: "oklch(34% 0.014 256)"
  control-edge-hover: "oklch(50% 0.016 256)"
  lamp-well-edge: "oklch(26% 0.013 256)"
  # --- reserved instrument-lamp codes ---
  success: "oklch(72% 0.16 150)"
  warning: "oklch(80% 0.15 82)"
  error: "oklch(64% 0.22 27)"
  on-error: "oklch(99% 0 0)"
  # --- vendor identity, exempt from the one-accent rule ---
  whatsapp: "oklch(62% 0.15 153)"
  whatsapp-hover: "oklch(68% 0.14 153)"
  whatsapp-on-trim: "oklch(48% 0.13 153)"
typography:
  display:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 6.4vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.028em"
    fontVariation: '"wdth" 112, "wght" 800'
  page-title:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.026em"
    fontVariation: '"wdth" 112, "wght" 800'
  headline:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.026em"
    fontVariation: '"wdth" 110, "wght" 800'
  subhead:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 3vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.026em"
    fontVariation: '"wdth" 112, "wght" 800'
  title:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.018em"
    fontVariation: '"wdth" 106, "wght" 700'
  wordmark:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.22rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.005em"
    fontVariation: '"wdth" 118, "wght" 800'
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  body-lead:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1.06rem"
    fontWeight: 400
    lineHeight: 1.62
  body-small:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.015em"
  label:
    fontFamily: "Azeret Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.2em"
  reading:
    fontFamily: "Azeret Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.09em"
    fontFeature: "tabular-nums"
rounded:
  sm: "0.125rem"
  DEFAULT: "0.1875rem"
  md: "0.25rem"
  lg: "0.375rem"
  xl: "0.625rem"
  full: "9999px"
  circle: "50%"
spacing:
  hair: "0.24rem"
  xs: "0.55rem"
  sm: "0.6rem"
  md: "1rem"
  lg: "1.55rem"
  xl: "2rem"
  2xl: "2.75rem"
  3xl: "4rem"
  gutter: "1.25rem"
  gutter-wide: "2.25rem"
  section: "clamp(3.25rem, 6.5vw, 5.75rem)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.95rem 1.55rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "1.1rem 1.9rem"
  button-outline:
    backgroundColor: "{colors.control-steel}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.95rem 1.55rem"
  button-outline-hover:
    backgroundColor: "{colors.control-steel-hover}"
    textColor: "{colors.on-surface}"
  button-outline-inverse:
    backgroundColor: "transparent"
    textColor: "{colors.inverse-on-surface}"
    rounded: "{rounded.md}"
    padding: "0.95rem 1.55rem"
  button-whatsapp:
    backgroundColor: "{colors.control-steel}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.95rem 1.55rem"
  input:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "0.85rem 1rem"
    width: "100%"
  well:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  trim-panel:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    rounded: "0"
    padding: "clamp(3.25rem, 6.5vw, 5.75rem) 1.25rem"
  legend:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label}"
  legend-dim:
    textColor: "{colors.outline}"
    typography: "{typography.label}"
  led:
    backgroundColor: "{colors.led-off}"
    rounded: "0"
    width: "1.55rem"
    height: "0.4rem"
  led-amber:
    backgroundColor: "{colors.primary}"
    width: "1.55rem"
    height: "0.4rem"
  service-lamp:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.DEFAULT}"
    size: "2.6rem"
  service-lamp-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  nav-link:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-small}"
  nav-link-active:
    textColor: "{colors.on-surface}"
  nav-tel:
    textColor: "{colors.on-surface}"
    typography: "{typography.reading}"
---

# Design System: BavAuto Gorj

## Overview

**Creative North Star: "The Bordcomputer"**

The page is not a description of a workshop; it *is* the instrument binnacle of a BMW at night, key at position II. The ground is a near-black graphite bezel with the faintest cool cast. Panels do not float on it — they are steel wells machined *up* out of it, each step of the surface ramp one lightness notch brighter than the last. Legends are printed silver-white, the way they are silkscreened onto a real dial. One amber illumination runs through the whole system and lights only what is live in this moment. The BMW-M tri-color survives only as LED segment coding in its canonical order, never as decoration. The single light material is a strip of brushed anodised console trim, and it carries the conversion moment.

The world is dense where a cluster is dense and empty where a bezel is empty. Text is set tight and wide: Archivo is driven on its **width** axis (wdth 106–118), not just its weight axis, so headings read as stamped dial legends rather than as a UI sans. Numbers, hours, codes and part numbers are set in Azeret Mono because they are measurements; running prose never is. Body copy is Hanken Grotesk, the calm voice that explains the estimate.

Two constraints shape everything else. First, **there is no photography anywhere, by decision** — the owner confirmed none is coming, so the gallery was deleted rather than filled with stock and the workshop is drawn instead (`BayScene.astro`, a line elevation of a two-post lift). The whole visual load therefore sits on type, material, drawn assets and the instrument itself. Second, this is an *independent* BMW specialist: instrument language throughout, and no BMW roundel anywhere. The confirmed anti-reference is the category default this build refuses — a dark hero with a grid of icon cards under it, which is why the services surface is a check-control legend board of hairlines and lamps rather than a card grid.

**Key Characteristics:**
- Near-black graphite ground with steel wells stepping up out of it in a six-step lightness ramp
- Exactly one accent hue (amber), spent only on what is live right now
- M tri-color as LED segment coding in a fixed order, never as decoration
- Archivo driven on the width axis; Azeret Mono strictly for measurements
- One brushed-aluminium trim panel per page as the only light material
- One closed 1.75-stroke pictogram set; no icon library, no emoji
- No photography; the workshop is drawn
- Everything server-rendered and legible before JS; one authored motion moment

## Colors

An OKLCH palette of one accent hue against a six-step graphite ramp, with the motorsport tri-color quarantined into coded LED segments and one light metal for contrast.

### Primary
- **Cluster Amber** (`oklch(72% 0.170 58)`): the illumination. The call CTA fill, the DESCHIS ACUM pilot dot, the nav pilot, the focused field border, the open FAQ row's lit edge, the hovered service lamp and process step, the map-load control. Nothing else.
- **Filament Bright** (`primary-bright`, `oklch(82% 0.125 65)`): amber used **as text** on the dark ground — the lit word in the hero headline, the inline "sună-ne" link, the open FAQ question. Measured ~11:1 on the ground.
- **Filament Lift / Filament Deep** (`primary-hover`, `primary-lift`, `primary-deep`): the three stops that make the lit control a filament rather than a flat swatch — the button's vertical gradient runs lift → primary → deep, and brightens by one stop on hover.
- **Bulb-Glass Ink** (`on-primary`, `oklch(17% 0.040 55)`): the near-black label that sits on the amber fill. Measured 5.8–9.3:1 across the gradient.
- **Dim Amber Well** (`primary-container`) and **Warm Legend** (`on-primary-container`): the unlit-but-warm pairing held in reserve for an amber-tinted well.

### Secondary
- **M Light Blue** (`oklch(68% 0.15 242)`), **M Indigo** (`oklch(52% 0.17 285)`), **M Red** (`oklch(60% 0.22 27)`): segment coding only — the service-interval LED band, the process rail, the `.m-stripe` hairline (three segments split by a transparent gap so they can never read as a blend), and the needle red on the gauge. Fixed order, always blue → indigo → red.

### Tertiary
- **Console Aluminium** (`inverse-surface`, `oklch(87% 0.005 250)`) with **Aluminium Highlight** (`inverse-surface-2`): the one light material, always brushed. Its ink is **Anodised Ink** (`inverse-on-surface`, 12.2:1) and **Anodised Ink Dim** (`inverse-on-surface-variant`, 6.2:1).
- **Signal Green** (`whatsapp`, with `whatsapp-hover` and a darkened `whatsapp-on-trim` at 4.1:1): vendor identity, carried by the WhatsApp *mark* only. The control around it stays steel.

### Neutral
- **Binnacle Graphite** (`background` / `surface`): the ground behind everything.
- **The well ramp** (`surface-container-lowest` → `surface-container-highest`, 17% → 31.5%): each step is a deeper machining into the bezel. `lowest` is the default panel and the field background; the higher steps carry raised chrome and the scrollbar thumb.
- **Bezel Edge Top / Bottom**, **Band Ground Top / Bottom**, **Overlay Ground**: the fixed vertical gradients that make the nav lip, the LED band and the mobile menu read as separate machined pieces rather than the same flat fill.
- **Silver-White Legend** (`on-surface`, 17.9:1) and **Secondary Print** (`on-surface-variant`, 9.1:1): printed ink, two levels.
- **Outline** and **Bezel Hairline** (`outline-variant`, plus the inset `hairline-inset`): every division on this site is a hairline, not a gap.
- **Steel Switch** (`control-steel` / `control-steel-hover`) and **Switch Edge** (`control-edge` / `control-edge-hover`): the unlit control at rest and on hover.
- **LED Off / LED Off Edge**, **Lamp Well Edge**: the dark state of a segment or lamp, always visibly present so a lit one reads as a change of state, not an appearance.
- **Reserved lamp codes** (`success`, `warning`, `error`, `on-error`): declared instrument-lamp colours held for future states. The live "Deschis acum" dot is deliberately amber, not green — it is live, and live is amber.

### Named Rules

**The Live-Amber Rule.** Amber marks only what is live in this moment: the call control, the DESCHIS ACUM dot, the nav pilot, the focused field, the open FAQ row, the hovered or focused service lamp and process step, the map-load control. Never a background wash, never decoration, never a decorative gradient. Break it and the page becomes a tuning shop. Audit test: point at any amber pixel and name the thing that is live. If you can't, delete it.

**The Segment-Coding Rule.** The M tri-color exists only as coded segments in the canonical order blue → indigo → red, always separated by a hairline gap so the three can never blend. It is never reordered, never a gradient wash, never a border on a card.

**The Trim Rule.** The one light material in this world is brushed anodised console trim — not paper, not white. It carries the conversion moment and the long-read legal pages, and it is always brushed (fine horizontal grain plus one raking sheen), never a flat sheet. Two of these on a page is one too many.

## Typography

**Display Font:** Archivo Variable, driven on its **wdth** axis (fallback Arial Narrow, system-ui)
**Body Font:** Hanken Grotesk Variable (fallback system-ui)
**Label/Mono Font:** Azeret Mono Variable (fallback ui-monospace, SFMono-Regular)

All three are self-hosted via `@fontsource-variable` — no Google Fonts CDN, for the GDPR reasons documented in `docs/LEGAL.md` — and all carry latin-ext so Romanian diacritics (ă â î ș ț) render in the real face.

**Character:** The width axis is load-bearing, not a nicety. Archivo is set wide and heavy (wdth 106 at title, 110 at headline, 112 at display, 118 at the wordmark) so headings read as legends stamped into a dial rather than as a UI sans. Hanken Grotesk underneath is deliberately calm and unstyled — the voice that explains an estimate. Azeret Mono is squarish and technical and appears only where a real number lives. Body copy runs `tabular-nums` site-wide because the site is full of readings.

### Hierarchy
- **Display** (800, `clamp(2.7rem, 6.4vw, 4.75rem)`, 1.02, wdth 112, tracking −0.028em): the hero headline only, balanced and hard-broken across three lines with one word lit.
- **Page Title** (800, `clamp(2.1rem, 5vw, 3.4rem)`, 1.06, wdth 112): the `<h1>` on interior pages, in the page header.
- **Headline** (800, `clamp(2rem, 4.2vw, 3rem)`, 1.08, wdth 110, tracking −0.026em): section `<h2>`.
- **Subhead** (800, `clamp(1.3rem, 3vw, 1.6rem)`, 1.08): a sub-section break inside a long section.
- **Title** (700, `clamp(1.2rem, 2.2vw, 1.5rem)`, 1.2, wdth 106, tracking −0.018em): a service row, a band cell, a process step, an FAQ question.
- **Wordmark** (800, 1.12rem mobile / 1.22rem from 768px, wdth 118, uppercase, tracking +0.005em): the nav mark, with an amber mid-dot between the two words.
- **Body** (400, 16px, 1.62): running prose. Ledes cap at 60ch, service descriptions at 46ch, section heads at 58ch.
- **Body Lead** (400, 1.02–1.06rem): section ledes and the hero lede.
- **Body Small** (400, 0.875–0.95rem) and **Caption** (400, ~0.7–0.78rem): supporting notes, footer, fine print.
- **Button** (700, 0.95rem, 1.0, tracking +0.015em; `btn-lg` at 1rem): control labels.
- **Label / printed legend** (mono 500, 0.66rem, tracking +0.2em, uppercase): a field name, a unit, a column header — `Adresă`, `Program`, `AUTORIZARE`.
- **Reading** (mono 500, 0.8rem, tracking +0.09em, tabular): the phone number, opening hours, kilometres, part numbers, dial numerals.

### Named Rules

**The Printed-Legend Rule.** The mono face is for measurements only — numbers, codes, hours, part numbers, readings. Running prose is never mono. Audit test: if you could not put a unit after it, it is not a reading.

**The No-Eyebrow Rule.** The `.legend` style is a printed field name on an instrument, not a section kicker. It labels a value beside or beneath it; it never sits above a heading as a decorative eyebrow.

**The Width-Axis Rule.** Heading weight is set through `font-variation-settings` on both axes. A heading that ships without an explicit `"wdth"` value is wrong, however correct its weight looks.

## Layout

A single centred measure of **1240px** (`--container-max-width`) with 1.25rem gutters, widening to 2.25rem from 768px. The service-interval LED band deliberately breaks the measure and runs to 1560px so it reads as a full instrument strip spanning the binnacle rather than a boxed row.

Vertical rhythm is one section step: `clamp(3.25rem, 6.5vw, 5.75rem)` of block padding, uniform across every section. Inside sections the spacing scale is short and repeated — 0.55/0.6rem for inline control gaps, 1rem for stacked text, 1.55rem for panel padding, 2/2.75/4rem for column and grid gaps.

Breakpoints are per-component and chosen where the content actually breaks, not from a fixed device ladder: 520, 560, 600, 640, 700, 720, 768, 860, 900 and 1024px all appear. The load-bearing ones are **640px** (band goes two-up, nav phone appears), **768px** (wide gutters, larger wordmark), **900px** (the services legend board goes two-column) and **1024px** (the hero becomes the two-column binnacle with the instrument at right; the desktop nav links appear).

Mobile is the primary surface for this business, so the hero stacks intro → instrument → actions and the instrument ships at reduced size rather than being hidden. A sticky mobile call bar holds the phone at the bottom of every viewport. Scroll anchoring reserves 5.5rem of `scroll-padding-top` for the overlay nav, whose real height is measured at runtime into `--nav-h`.

**The Bezel Rule.** Empty space is proportioned as bezel around an instrument, not left over as padding. Quiet regions are composed: if a gap can't be described as a margin the instrument needs, it is slack and should be closed.

## Elevation & Depth

Depth is **tonal and material, not cast**. Nothing on this site floats above the page on a drop shadow. Surfaces separate by stepping up the graphite lightness ramp, by a 1px hairline at the join, and by a `inset 0 1px 0` top highlight that reads as the machined lip of a bezel. The whole page carries a fixed 1px repeating horizontal scan (`oklch(100% 0 0 / 0.014)`) as the bezel's grain.

The only outward shadows in the system are **light**, not weight: the amber bloom under the lit call control, the coloured glow around a lit LED segment, and the text-shadow halo on the lit word. That is why the same button loses its bloom on the aluminium trim — a filament glows against night, not against metal.

### Shadow Vocabulary
- **Machined lip** (`inset 0 1px 0 oklch(100% 0 0 / 0.055), 0 1px 0 oklch(0% 0 0 / 0.6)`): the nav bezel edge and any panel that reads as the top rim of the binnacle.
- **Lit control bloom** (`inset 0 0 0 1px oklch(86% 0.10 68 / 0.85), 0 9px 26px -10px oklch(72% 0.17 58 / 0.62), 0 0 34px -8px oklch(72% 0.17 58 / 0.42)`): the primary call button on the dark ground; both spreads open further on hover.
- **Trim-suppressed control** (`inset 0 0 0 1px oklch(58% 0.15 50 / 0.55), 0 2px 6px -2px oklch(35% 0.07 55 / 0.4)`): the same button on the aluminium panel, bloom removed.
- **LED glow** (`0 0 8px <segment hue> / 0.7–0.8`): a lit segment in the service-interval band.
- **Lamp well** (`inset 0 0 0 1px oklch(26% 0.013 256)`, becoming `inset 0 0 0 1px oklch(86% 0.10 68 / 0.7), 0 0 20px -4px oklch(72% 0.17 58 / 0.65)` when live): the service pictogram wells.
- **Field focus ring** (`0 0 0 3px oklch(72% 0.17 58 / 0.17)`): a focused input; the global `:focus-visible` outline is a 2px `primary-bright` stroke at 2px offset.
- **Aluminium relief** (`inset 0 1px 0 oklch(100% 0 0 / 0.7), inset 0 -1px 0 oklch(0% 0 0 / 0.16)`) with black 22%-alpha borders top and bottom: the trim strip's edge.
- **Overlay drop** (`0 10px 54px -14px oklch(0% 0 0 / 0.85)`): the mobile menu, the only true modal surface.

**The Light-Not-Weight Rule.** A shadow in this system is illumination, never mass. If a shadow's purpose is to lift a card off the page, it does not belong; if its purpose is to show that something is glowing, it does.

**The Hairline Rule.** Regions divide by a 1px `outline-variant` rule, not by a gap, a card border-radius, or a change of background. Cells in the LED band and rows in the legend board are separated by hairlines and nothing else.

## Shapes

Radii are machined and tight, and the scale tops out where most systems begin: 2px (`sm`, the focus-ring corner), 3px (default, the service lamp well), 4px (`md`, every control and field), 6px (`lg`, a steel well), 10px (`xl`, the largest panel), plus `full`/`50%` for genuinely circular instrument parts — the pilot dot, the needle hub, the LED status dot.

The recurring silhouettes are the **well** (a lowest-step surface behind a hairline border at 6px), the **band cell** (no radius at all, defined entirely by hairlines), the **LED segment** (a 1.55 × 0.4rem rectangle with square corners — a segment is not a pill), and the **dial** (the only true circle, and the only place a circle is allowed to be large). Full-bleed strips — the LED band, the trim panel, the nav bezel — carry no radius: they are pieces of the dashboard, and dashboard trim does not have rounded ends.

**The Square-Segment Rule.** Anything that reads as an indicator segment is a rectangle. Pill shapes belong to consumer UI, not to a cluster.

## Components

The feel of every control here is **switchgear**: tight radius, firm 1.5px edge, a real pressed state, and exactly one of them genuinely lit.

### Buttons
- **Shape:** machined corners (4px, `rounded.md`), 1.5px border, `translateY(1px)` on `:active` so it presses like a switch. Transitions run 200ms on `ease-out-quart`, transform at 110ms.
- **Primary (the call):** the one lit control on the whole bord. A three-stop vertical amber gradient (lift → primary → deep) with bulb-glass ink, an amber rim inset and the bloom. Padding 0.95rem × 1.55rem; `btn-lg` at 1.1rem × 1.9rem. In the hero it is a two-line stack: the label "SUNĂ ACUM" over the phone number as a mono reading at 0.82 opacity.
- **Hover / Focus:** the filament brightens one stop and the bloom opens; focus takes the global 2px `primary-bright` outline at 2px offset.
- **Outline (unlit switch):** steel fill with a `control-edge` border and silver-white label; on hover the edge brightens and the fill lifts one step. The default control everywhere on the bezel.
- **WhatsApp:** structurally identical to outline — the control stays steel and only the *mark* carries brand green. A green surface would be a second accent hue.
- **Inverse variants:** on the trim panel, controls drop to transparent fills with black 22%-alpha borders and anodised ink; the primary keeps its amber but loses the bloom.

### Chips
- **Symptom chips** (the three hero entry points): small steel chips carrying a pictogram plus a phrase, each opening WhatsApp with the symptom pre-written. Rest state is a hairline-edged steel plate with secondary print; hover brings the edge and the ink up. They are actions, not filters — there is no selected state.

### Cards / Containers
There is no card grid on this site. The two container patterns are:
- **The well:** `surface-container-lowest` fill, 1px `outline-variant` border, 6px radius. Used where content genuinely needs a machined recess.
- **The band cell / legend row:** no fill, no radius, no shadow. Divided from its neighbours by 1px hairlines only, with generous block padding (1.5–1.7rem). This is the default; reach for the well only when the recess is the point.

### Inputs / Fields
- **Style:** full-width, `surface-container-lowest` fill, 1.5px `outline-variant` border, 4px radius, 0.85rem × 1rem padding, body face at 1rem. Placeholders are secondary print at 0.75 opacity. Textareas resize vertically only with a 7rem floor; selects drop native appearance.
- **Focus:** the border goes amber and a 3px amber halo at 17% alpha appears — the field is now the live thing on the page. The page caret is `primary-bright`, the `accent-color` is `primary`.

### Navigation
Overlay nav sitting on the hero with a bezel-edge gradient and a machined lip. The wordmark is Archivo at wdth 118 uppercase with an amber pilot dot and an amber mid-dot separator. Links are secondary-print body-small at rest, silver-white on hover and when active, with an underline mark on the active item; they appear only from 1024px. The phone sits in the bar as a mono reading from 640px and goes `primary-bright` on hover. Below 1024px the trigger opens a full overlay (`overlay-ground` with a single amber radial bloom from the top-right corner) whose links stagger in at 42ms intervals — suppressed entirely under `prefers-reduced-motion`.

### The Gauge (signature)
A server-rendered SVG instrument: bezel ramp, printed 0.25-step scale with major ticks and numerals, an M-red redline arc from 6.5, a needle on a circular hub, and a dot-matrix OBC window carrying two short lines of text inside the dial. A `compact` shoulder variant drops the window and coarsens the scale to whole steps. The dial is fully drawn and legible before a byte of JS arrives.

### The Service-Interval LED Band (signature)
Four cells, each a printed legend, a row of five LED segments (lit count varying per cell), a title and a note. Segments are coded blue / indigo / red / amber in the M order; unlit segments stay visibly present as dark plates with a lighter inset edge. It runs wider than the page measure and is bounded top and bottom by hairlines.

### The Check-Control Legend Board (signature)
The services surface, deliberately **not** a card grid: a two-column list of hairline-separated rows, each with a pictogram in a small square lamp well, a title, a printed legend subtitle and a description capped at 46ch. On hover or focus-within, the lamp lights amber with its glow — the single interaction that makes the board read as a live check-control panel.

### Motion
Everything is server-rendered and legible before JS. There is exactly **one authored motion moment**: the ignition sweep on load (anime.js v4), where the needles sweep the full scale and settle back on an elastic ease while the backlight bloom comes up. It is suppressed entirely under `prefers-reduced-motion` — the needle simply sits at rest, and nothing stays hidden. The scroll-reveal opts *in* to a hidden start via a `js-reveal` class and carries a 2.5s force-reveal failsafe, so the page never ships blank to a crawler or to a visitor whose JS fails.

## Do's and Don'ts

### Do:
- **Do** spend amber only on what is live right now, per The Live-Amber Rule — the call control, the open row, the focused field, the hovered lamp.
- **Do** separate regions with a 1px `outline-variant` hairline rather than with a gap or a card edge.
- **Do** set every heading with an explicit `"wdth"` value (106 title / 110 headline / 112 display / 118 wordmark) alongside its weight.
- **Do** put numbers, hours, codes, kilometres and part numbers in Azeret Mono as `.reading`, and keep prose in Hanken Grotesk.
- **Do** step surfaces up the graphite ramp to create depth, and use `inset 0 1px 0` highlights for the machined lip.
- **Do** draw any new symbol into `Icon.astro` on the same 24px box at the same 1.75 stroke, round caps and joins, no fill.
- **Do** ship every surface fully rendered and legible before JS runs, and gate any motion behind `prefers-reduced-motion`.
- **Do** keep the M tri-color in its canonical blue → indigo → red order, split by a hairline gap.
- **Do** hold body ink at or above the measured floor: 9.1:1 for secondary print on the dark ground, 6.2:1 on the trim panel, WCAG 2.2 AA as the target throughout.

### Don't:
- **Don't** use amber as a background wash, a decorative accent, or a gradient on anything that is not a lit control.
- **Don't** put a second brushed-aluminium trim panel on a page; one light material per page, per The Trim Rule.
- **Don't** import an icon library or use an emoji. The pictogram set is closed; WhatsApp, Facebook and Instagram marks are the only sanctioned filled exceptions because a brand mark is a signature, not a pictogram.
- **Don't** put a `.legend` above a heading as a section kicker or eyebrow — it labels a value, not a section.
- **Don't** rebuild the services surface as a grid of icon cards. Hairlines and lamps; that card grid is the category cliché this world exists to refuse.
- **Don't** add a drop shadow to lift a surface off the page. Shadows here are light, not mass.
- **Don't** use a radius above 10px, and never a pill on an indicator segment.
- **Don't** introduce a second accent hue. WhatsApp green is a vendor mark on a steel control, never a green surface.
- **Don't** add photography or stock imagery. There is none by decision; new visual weight comes from type, material, drawn assets or the instrument.
- **Don't** load fonts from a CDN. All three faces are self-hosted via `@fontsource` with latin-ext for Romanian diacritics.
- **Don't** ship a BMW roundel or any manufacturer mark. This is an independent specialist.
