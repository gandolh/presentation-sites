---
name: Subcort
description: Event-tent rental & setup in Gorj/Oltenia — calm, occasion-neutral; warm cream paper lit from within by a clay lamp glow, with a committed canopy green owning the dark anchors.
colors:
  primary: "oklch(40% 0.085 150)"
  primary-hover: "oklch(34% 0.08 150)"
  primary-bright: "oklch(74% 0.1 148)"
  primary-container: "oklch(93% 0.025 150)"
  on-primary-container: "oklch(33% 0.07 150)"
  accent: "oklch(58% 0.12 55)"
  accent-hover: "oklch(52% 0.115 52)"
  accent-bright: "oklch(76% 0.11 62)"
  accent-soft: "oklch(92% 0.04 60)"
  on-accent-soft: "oklch(40% 0.1 50)"
  glow-lamp-strong: "oklch(72% 0.13 58 / 0.22)"
  glow-lamp-soft: "oklch(66% 0.12 56 / 0.1)"
  glow-lamp-wash: "oklch(80% 0.05 70 / 0.55)"
  success: "oklch(56% 0.11 150)"
  error: "oklch(55% 0.19 27)"
  background: "oklch(97.4% 0.013 84)"
  surface-container-lowest: "oklch(99.4% 0.006 88)"
  surface-container-low: "oklch(96.2% 0.015 82)"
  surface-container: "oklch(94.4% 0.019 80)"
  surface-container-high: "oklch(92.2% 0.022 78)"
  surface-container-highest: "oklch(89.4% 0.025 74)"
  on-surface: "oklch(26% 0.022 150)"
  on-surface-variant: "oklch(43% 0.02 148)"
  outline: "oklch(62% 0.018 95)"
  outline-variant: "oklch(87% 0.016 88)"
  inverse-surface: "oklch(25.5% 0.046 152)"
  inverse-surface-2: "oklch(30% 0.052 152)"
  inverse-on-surface: "oklch(96% 0.01 92)"
  inverse-on-surface-variant: "oklch(81% 0.022 105)"
typography:
  display:
    fontFamily: "Bitter Variable, Georgia, serif"
    fontSize: "clamp(2.3rem, 5.5vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bitter Variable, Georgia, serif"
    fontSize: "clamp(1.85rem, 3.8vw, 2.8rem)"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Bitter Variable, Georgia, serif"
    fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Mulish Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Mulish Variable, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.13em"
rounded:
  sm: "0.25rem"
  md: "0.625rem"
  lg: "0.875rem"
  xl: "1.25rem"
  full: "9999px"
components:
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "1.35rem (mobile) → 1.75rem (≥640px)"
  card-lit:
    backgroundImage: "linear-gradient(180deg, {colors.glow-lamp-wash} 0%, transparent 42%)"
    borderColor: "oklch(72% 0.09 60 / 0.4)"
    note: "The one lamp-lit feature card in a set — warm clay wash from the top edge."
  lamp-glow:
    background: "radial pool of {colors.glow-lamp-strong} → {colors.glow-lamp-soft} → transparent"
    note: "A soft pool of lamplight behind a light section's content; breathes, frozen under reduced-motion."
  panel:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.xl}"
  chip-included:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.full}"
  chip-optional:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.on-accent-soft}"
    rounded: "{rounded.full}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "0.85rem 1.5rem"
---

# Design System: Subcort

## 1. Overview

**Creative North Star: "Warm cream + lamp, dark anchors."**

A large canvas structure pitched on a grassy field as the light goes, warm from
within — but read by **daylight**. The page body is **warm cream paper lit from
within**: a deep canopy green still owns the structural *anchors* (the hero, the
footer, the subpage headers, the coverage band) as lit-tent ends at dusk, and the
warm clay **lamp glow** is the connective warmth threading the light body between
those dark ends. The system feels **calm, square, and dependable** — a crew that
has pitched a hundred of these and will quietly handle yours.

The palette is that scene by day: warm cream paper for the open air (warmer than
the old near-white off-white, but still genuinely light and daylight-readable —
warm paper, not a heavy sand and not a dark theme), a deep canopy green that is
the tent itself and carries the brand on the dark anchors, and one warm clay
accent doing the work of the lamp glowing through the canvas — now on the light
body too, not only inside the dark anchors.

The signature is the **guy-line**: a thin two-tone bar, canopy green easing into
warm clay, like a taut tent line catching the last light. It serves as a section
divider, the mark beside the wordmark, and a hero edge. It is a gradient on a
background bar, never on text and never as a side-border. Its companion is the
**lamp glow** (`.lamp-glow` / `.card--lit`): a soft pool of lamplight behind a
feature section or the one lit card in a set — the clay doing real work on the
cream, never a loud SaaS gradient blob.

This system explicitly rejects the **festive party-rental skin** (confetti,
gold-glitter, a dancing-couple hero), the **cheap classifieds listing** (clutter,
watermarked phone photos, all-caps price shouting), the **generic SaaS landing**
(hero-metric template, identical icon-card grids, gradient blobs, buzzword copy),
and the **forest-green-on-cream "natural brand" cliché** (a timid sage accent
floating on cream). Here the green *commits*: it owns the hero, the footer, and
the structural anchors, instead of hovering as a polite accent.

**Key characteristics:**
- Warm cream paper body, daylight-readable, with a committed canopy green owning
  the dark anchors and one warm clay (the lamp glow) as the single companion
  accent. No third hue.
- The lamp glow is a first-class primitive (`--glow-lamp-*`), doing real work on
  the light body — soft glow pools behind feature content, a warm wash on the one
  lit card in a set — not just light inside the dark anchors.
- Green-leaning graphite ink that carries the canopy hue without going cold,
  clearing WCAG AA on every surface (including the warmer cream).
- A sturdy warm **slab serif** headline (Bitter) against a calm humanist **sans**
  body (Mulish): grounded and sheltering, not festive-script, not editorial-italic.
- Flat at rest: warm greige panels and hairlines build depth, not resting shadows.
- Soft-but-square radii (0.25–1.25rem): grounded, never pill-soft, never sharp.
- **Mobile-first**: layouts stack and breathe on phones first, then open up at the
  breakpoints (cards take a tighter padding floor on small screens).
- **No calls-to-action anywhere.** The site informs and steps back.

## 2. Colors

A **warm cream paper** base carrying one committed canopy green on the dark
anchors, with a warm clay (the lamp glow) as the sole companion accent doing real
work on the light body. Strategy: **Committed + lamp-lit** — green carries the
page anchors (hero, footer, subpage headers, coverage band ≈ 30–45% of the
surface), and the clay glow threads the warm-cream body between them.

### Primary
- **Canopy Green** (`oklch(40% 0.085 150)`): The committed brand colour. Carries
  the dark hero/footer surface, the wordmark, focus rings, link emphasis, and the
  green end of the guy-line. Deep and muted, so white text clears AA (~7.4:1).
  **Hover** `oklch(34% 0.08 150)`.
- **Bright Green** (`oklch(74% 0.1 148)`): Links and accents **on dark surfaces
  only** (hero, footer), where Canopy Green would fail contrast.
- **Green Tint** (`oklch(93% 0.025 150)`): Pale wash for the "inclus" chips and
  quiet panels; pairs with `oklch(33% 0.07 150)` ink.

### Accent
- **Warm Clay** (`oklch(58% 0.12 55)`): The single companion hue, the lamp glow
  through the canvas. Distinct from green in both hue (~55°) and lightness. White
  text on the filled accent clears AA (~4.6:1). Used for the clay end of the
  guy-line, "opțional" chips (soft variant), and small warm highlights. **Hover**
  `oklch(52% 0.115 52)`; **Bright** `oklch(76% 0.11 62)` on dark surfaces.

### Lamp Glow (the connective warmth on the light body)
The clay made into a soft pool of lamplight on the warm-cream body — the signature
of this direction. Authored as translucent clay so it layers over any warm surface
and stays subtle in daylight; never a loud, hard-edged SaaS gradient blob.
- **Glow Strong** (`oklch(72% 0.13 58 / 0.22)`): the core of a glow halo.
- **Glow Soft** (`oklch(66% 0.12 56 / 0.1)`): the halo falloff.
- **Glow Wash** (`oklch(80% 0.05 70 / 0.55)`): the warm top-edge wash on a lit card.

### Neutral
- **Warm Cream** (`oklch(97.4% 0.013 84)`): Page background. Warm paper lit from
  within — warmer than the old near-white off-white, but chroma still low enough to
  read as warm paper, not sand, and to clear AA under all ink.
- **Warm White** (`oklch(99.4% 0.006 88)`): Card and input fill, lifting off the base.
- **Warm Greige Ramp** (`oklch(96.2% → 89.4%`, low → highest, hue ~74–82): Tonal
  panels; this ramp does the work shadows would, warming with the base.
- **Graphite-Green Ink** (`oklch(26% 0.022 150)`): Body and headings. **Secondary
  ink** `oklch(43% 0.02 148)` (still ≥4.5:1).
- **Outline** (`oklch(62% 0.018 95)`) and **Warm Hairline** (`oklch(87% 0.016 88)`):
  warmed a touch so they sit on the cream rather than reading cool-grey on it.
- **Deep Canopy** (`oklch(25.5% 0.046 152)`): Inverse surface for the dark anchors
  (hero, footer, page headers, coverage band, mobile menu); deepened and warmed
  toward the lamp so the clay glow inside it reads as genuine warm light. Warm
  near-white ink reverses onto it.

### Named Rules
**The One Green Rule.** A single committed green carries the identity (dark
surfaces, links, focus, primary fills). On light surfaces use Canopy Green; on
dark surfaces switch to Bright Green for contrast. Warm Clay is the *one*
sanctioned companion; introduce no third accent hue. Green carries the structure,
clay carries the warmth, neutrals carry everything else.

**The Committed-Green Rule.** Green must own real surface (the hero, footer, and
subpage headers are deep canopy green), not float as a polite sage accent on a
cream page. If the green only appears in small accents while the page reads cream,
the brand has collapsed into the cliché it rejects.

**The Lamp-Does-Work Rule.** The clay is not a timid trim — it is the lamp, and the
lamp lights the room. On the warm-cream body it appears as the glow pool behind a
feature section and the wash on the one lit card per set; inside the dark anchors
it is the warm light within. Keep it soft and used sparingly (one lit element per
section): a hard, saturated gradient blob would collapse into the generic-SaaS
look the system rejects.

## 3. Typography

**Display Font:** Bitter Variable (slab serif; Georgia, serif fallback)
**Body Font:** Mulish Variable (humanist sans; system-ui fallback)

**Character:** A contrast pairing on the serif/sans axis. Bitter is a sturdy,
warm slab serif designed for screens, its square slabs read as *structural and
sheltering* (the right register for a tent), and it sidesteps both the festive
script and the editorial-italic-serif lane. Mulish is a calm, rounded humanist
sans, the even, reassuring voice that explains the logistics. Both are
self-hosted (no Google Fonts CDN) and carry latin-ext for Romanian diacritics
(ă â î ș ț).

### Hierarchy
- **Display** (`heading-xl`, weight 800, `clamp(2.3rem, 5.5vw, 4rem)`, lh 1.04,
  tracking -0.02em): The hero headline. One per page. Max ≈64px, never shouting.
- **Headline** (`heading-lg`, weight 750, `clamp(1.85rem, 3.8vw, 2.8rem)`):
  Section headings.
- **Title** (`heading-md`, weight 700, `clamp(1.3rem, 2.5vw, 1.7rem)`): Card and
  sub-section titles.
- **Body** (Mulish, weight 400, 1rem, lh 1.6): Running copy. Cap measure 65–75ch.
- **Eyebrow** (Mulish, weight 700, 0.78rem, tracking 0.13em, UPPERCASE): Short
  kickers paired with the guy-line. Hero + at most one section, never every one.

### Named Rule
**The Grounded-Head, Even-Body Rule.** Headings are the sturdy slab set tight and
heavy for a sheltering, structural feel; body stays even and open at 1.6 for
calm legibility. The serif/sans contrast is the system; never set headings in the
body sans or body in the slab.

## 4. Elevation

Flat by default, depth from the warm greige ramp. Surfaces are flat at rest; depth
is built from the warm-greige tonal ramp and 1px hairlines, not resting drop
shadows. The lamp glow is *atmosphere*, not elevation — a translucent pool behind
content, it never substitutes for a card's flat-at-rest hairline. A shadow appears
only as a soft, tinted lift tied to **state** (focus ring, the open mobile menu),
never a generic gray ambient shadow on a flat card.

### Named Rule
**The Flat-By-Default Rule.** A card or panel at rest has a hairline border and a
tonal background, never a resting shadow. A gray ambient shadow on a flat card is
forbidden; it reads as a 2014 app.

## 5. Components

The component feel is **calm and grounded**: soft-but-square radii, even weight,
solid panels, generous whitespace. Nothing pill-soft, nothing festive.

### The Guy-Line + Lamp Glow (signature components)
- **Guy-line:** a thin two-tone bar, Canopy Green → Warm Clay, `rounded.full`.
  Default 3px × 60px as a divider or wordmark mark; `--full` becomes a 4px
  full-width square-edged section break; `--bright` swaps to the brighter ends for
  placement on dark canopy surfaces. Never on text, never a side-border.
- **Lamp glow** (`.lamp-glow` on a section, `.card--lit` on a card): the clay made
  into a soft pool of lamplight on the warm-cream body. Put `.lamp-glow` on a
  `position: relative; overflow: clip` section (a single warm pool top-right, or
  `--center` behind a centred block); `.card--lit` gives the one feature card a
  warm top-edge wash and a clay-tinted hairline. Both breathe on the hero's cadence
  and are frozen under reduced-motion. One lit element per section — never every card.

### Cards / Panels
- **Cards** (`.card`): Warm White, `rounded.lg`, 1px warm hairline. Mobile-first
  padding: 1.35rem on phones, opening to 1.75rem at ≥640px. No resting shadow. Used
  for tent sizes and services; never nested.
- **Lit cards** (`.card--lit`): a `.card` with the lamp-glow wash and clay hairline —
  the one feature card in a set (the "incluse" teaser, the "prin parteneri" note,
  the leading tent size, the contact "Program" aside).
- **Panels** (`.panel`): Warm greige `surface-container`, `rounded.xl` — a quiet
  grouping container, an alternative to a card grid.
- **Chips** (`.chip-included` / `.chip-optional`): Tiny uppercase pills. Included
  = green tint; optional = soft clay.

### Buttons (rare by design)
The site has **no calls-to-action**, so buttons barely appear. `.btn-primary`
(Canopy Green fill, white label), `.btn-outline`, and `.btn-outline-inverse`
exist for neutral utility links (e.g. "Înapoi la site" on legal pages). They are
never promoted as conversion CTAs. 200ms ease-out; `:active` presses 1px.

### Navigation
- **Style:** Sticky top bar. **Over the dark hero** (home) it is transparent with
  warm near-white wordmark + links. **Once scrolled** (or on any solid subpage) it
  gains a warm-cream backdrop (`oklch(97.4% 0.013 84 / 0.86)` + blur) and a bottom
  hairline; text flips to graphite-green ink. A small guy-line sits by the
  wordmark.
- **Mobile:** A burger opens a deep-canopy overlay (React island) with a warm clay
  radial wash and staggered link entrance (45ms apart), honouring reduced-motion.
- **No call/WhatsApp button in the bar** — unlike the sibling sites, by design.

### Scroll Reveal (signature behavior)
Content is visible by default; JS opts into a hidden start (`opacity:0`,
`translateY(14px)`) and reveals on scroll via IntersectionObserver, with a 2.5s
hard failsafe that force-reveals everything so the page never ships blank to
crawlers, link-preview bots, or throttled tabs. Suppressed under
`prefers-reduced-motion`.

## 6. Do's and Don'ts

### Do:
- **Do** let the green commit: the hero, footer, and subpage headers are deep
  canopy green, green owns the page anchors (the Committed-Green Rule).
- **Do** let the lamp do work: a soft glow pool behind a feature section and a wash
  on the one lit card per set, so the clay reads as lamplight on the cream (the
  Lamp-Does-Work Rule). Keep it soft and one element per section.
- **Do** keep the guy-line green→clay, as a divider / wordmark mark / hero edge
  only; never on text, never a side-border.
- **Do** stay occasion-neutral and calm in copy and imagery (empty, prepared
  tents), so the site honestly serves a wedding and a memorial alike.
- **Do** set the sturdy slab headline tight against the even humanist body, and
  cap body measure at 65–75ch.
- **Do** design mobile-first: stack and breathe on phones first, then open up at
  the breakpoints (cards take a tighter padding floor on small screens).
- **Do** keep surfaces flat at rest with warm hairlines and the warm greige ramp;
  hold WCAG 2.2 AA on every text/background pair, including the warmer cream.

### Don't:
- **Don't** add calls-to-action: no quote form, no booking widget, no sticky
  call/WhatsApp bar, no "Cere ofertă" buttons. The site informs and steps back.
- **Don't** collapse into **forest-green-on-cream**: no timid sage accent floating
  on the page. Green commits on the anchors and the clay lamp does real work; the
  cream is warm paper *lit from within*, not a passive backdrop.
- **Don't** turn the lamp glow into a hard, saturated SaaS **gradient blob**, and
  don't drift the cream so warm it reads as sand or so dark it stops being a
  daylight-readable light theme.
- **Don't** look **festive** (confetti, gold glitter, a celebration hero) or like
  a **cheap classifieds listing** (clutter, watermarked photos, all-caps prices).
- **Don't** introduce a third accent hue beyond green and clay (the One Green
  Rule); never use Canopy Green as text on a dark surface (use Bright Green).
- **Don't** put a gray ambient drop shadow on a flat card, and don't add an
  uppercase eyebrow above every section.
- **Don't** use light-gray body text for "elegance"; the graphite-green ink is
  chosen so nothing falls below contrast.
