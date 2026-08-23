---
name: BavAuto Gorj
description: Independent family BMW specialist in Târgu-Jiu — phone-first, mechanically precise, run on the dark garage floor with one electric blue and a loud M tri-color.
colors:
  primary: "oklch(58% 0.17 250)"
  primary-hover: "oklch(64% 0.16 248)"
  primary-bright: "oklch(78% 0.12 244)"
  primary-container: "oklch(30% 0.07 252)"
  on-primary-container: "oklch(85% 0.08 250)"
  m-blue: "oklch(68% 0.15 242)"
  m-indigo: "oklch(46% 0.16 285)"
  m-red: "oklch(60% 0.22 27)"
  whatsapp: "oklch(62% 0.15 153)"
  whatsapp-hover: "oklch(68% 0.14 153)"
  success: "oklch(72% 0.16 150)"
  error: "oklch(64% 0.22 27)"
  background: "oklch(20% 0.022 256)"
  surface-container-lowest: "oklch(23.5% 0.026 256)"
  surface-container-low: "oklch(25.5% 0.028 256)"
  surface-container: "oklch(28% 0.03 257)"
  surface-container-high: "oklch(31% 0.032 257)"
  surface-container-highest: "oklch(34.5% 0.034 258)"
  on-surface: "oklch(96% 0.006 250)"
  on-surface-variant: "oklch(78% 0.014 255)"
  outline: "oklch(55% 0.02 256)"
  outline-variant: "oklch(40% 0.022 256)"
  inverse-surface: "oklch(97% 0.004 250)"
  inverse-surface-2: "oklch(100% 0 0)"
  inverse-on-surface: "oklch(23% 0.03 255)"
  inverse-on-surface-variant: "oklch(43% 0.025 255)"
typography:
  display:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.1rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo Variable, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.6vw, 1.8rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  sm: "0.1875rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.6rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "oklch(15% 0.03 153)"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.6rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.6rem"
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
  input:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "0.8rem 1rem"
---

# Design System: BavAuto Gorj

## 1. Overview

**Creative North Star: "Pit Wall / Garage Floor"**

This is the bay at night, doors up, the lift lights on and an M-stripe across the
wall. The site lives on a deep graphite-steel floor, not a daylit off-white — the
register is the workshop itself, seen from the doorway, run by people who love
these cars. Depth comes from how steel panels step *up* off the dark floor in the
lift light; one electric BavAuto blue does the work of a lit dash control; and the
M motorsport tri-color is no longer kept under glass — it carries real energy
across the page, the red especially. A single bright "service bay" inversion (the
Contact slab) is where the floor opens to daylight: the conversion moment, lit so
it stands out. The system is built to make a BMW owner think "these are my people,
they work where I can see it, and they won't take me for a ride."

The signature is the M motorsport tri-color stripe (light blue → indigo → red):
divider, wordmark tick, the vertical rule beside the hero headline, the rail
threading the Process steps, and a sanctioned single-element red accent where the
page wants enthusiast lift. It stays disciplined (never a fake-carbon texture or a
tuner decal) but it is allowed to be loud. BavAuto is an **independent specialist**,
so the language is enthusiast, never dealer: the blue and the stripe carry the
heritage nominatively; the BMW roundel never appears.

**Key Characteristics:**
- A committed dark graphite-steel floor; panels step *up* in lightness to lift off it (the ramp does the shadow work).
- One electric brand blue carrying every CTA/link as a lit control; the M tri-color as a confident motorsport accent, the red as the sanctioned single-element energy.
- Near-white graphite-tinted ink, clearing WCAG AA on every dark surface; the lone light "service bay" panel reverses to graphite ink.
- Display type set tight, heavy and large (Archivo); body set open and legible (Hanken Grotesk) with extra line-height for light-on-dark.
- Tight mechanical radii (0.1875–0.75rem). Flat at rest, lit by blue glow and M-red on state and the CTA. Mobile-first, phone-call-first.

## 2. Colors

A committed dark garage-floor base carrying one electric brand blue, with the
BMW-M tri-color as a precise but energetic signature accent, and a single bright
"service bay" inversion for the conversion section.

### Primary
- **BavAuto Blue** (`oklch(58% 0.17 250)`): The committed brand colour, electric enough to read as a lit control on the dark floor. Carries the primary CTA (the phone call), focus rings, and link emphasis. White label on it clears AA. **Hover** *brightens* to `oklch(64% 0.16 248)` and gains a soft blue glow.
- **Link Blue** (`oklch(78% 0.12 244)`): The lighter blue used for links and accents **as text on the dark floor**, where the base blue would fail contrast.
- **Blue Container** (`oklch(30% 0.07 252)`): A dim blue panel/chip wash for quiet emphasis on dark.

### Secondary
- **M Light Blue** (`oklch(68% 0.15 242)`), **M Indigo** (`oklch(46% 0.16 285)`), **M Racing Red** (`oklch(60% 0.22 27)`): The motorsport tri-color, lifted in lightness so it reads on the dark floor. The three together always appear in that fixed order as the `.m-stripe` signature. **M Racing Red additionally serves as the sanctioned enthusiast accent** (a highlighted clause, a lit status dot, rating stars, an active step) per the M-Color Rule; light blue and indigo stay inside the stripe.
- **WhatsApp Green** (`oklch(62% 0.15 153)`): The secondary contact CTA; carries dark-green label text on its fill for AA.

### Neutral
- **Garage Floor** (`oklch(20% 0.022 256)`, ~#10151d): Page background and default surface. A deep graphite-steel carrying the brand-blue hue, lit by a faint dot-grain so it reads as a material, not a flat fill.
- **Steel Panels** (`oklch(23.5% → 34.5%`, lowest → highest): The tonal ramp steps *up* off the floor; this does the work resting shadows would.
- **Ink** (`oklch(96% 0.006 250)`): Body text and headings, near-white with a cool tint. **Secondary ink** `oklch(78% 0.014 255)`.
- **Outline** (`oklch(55% 0.02 256)`) and **Hairline** (`oklch(40% 0.022 256)`): Borders and dividers on dark.
- **Service Bay** (`oklch(97% 0.004 250)`): The one bright light-panel inversion (Contact). Graphite ink (`oklch(23% 0.03 255)`) reverses onto it.

### Named Rules
**The M-Color Rule.** The M tri-color is the brand's motorsport signature and carries real energy. The full stripe (light blue → indigo → red, in that fixed order) is the headline mark: dividers, the wordmark tick, the hero's vertical rule, the Process rail. Beyond the stripe, **M Racing Red may be a deliberate single-element accent** — a highlighted clause, a lit dot, rating stars, an active step. The discipline is intent, not scarcity. Never reorder the bands; never let red drop below AA where it carries text; never a fake-carbon texture or tuner decal.

**The One Blue Rule.** A single committed blue carries the structural identity (CTAs, links, focus). On the dark floor, links/accents use the lighter Link Blue; CTA fills use the deeper BavAuto Blue. The M tri-color is the *one* sanctioned companion. No third accent hue.

**The Lit-Floor Rule.** The page is dark by default. A section is light **only** when it is a deliberate "service bay" inversion (the conversion moment). Don't scatter light panels; the contrast of the one bright bay against the dark floor is the move.

## 3. Typography

**Display:** Archivo Variable. **Body:** Hanken Grotesk Variable. Both committed
brand families, self-hosted (no Google Fonts CDN), carrying latin-ext for Romanian
diacritics (ă â î ș ț). Archivo set tight, heavy and large reads as machined,
stamped-metal headlines; Hanken stays open and calm — the voice that explains the
estimate. Light-on-dark gets extra line-height (body 1.6).

### Hierarchy
- **Display** (`heading-xl`, weight 800, `clamp(2.6rem, 7vw, 5rem)`, line-height 0.98, tracking -0.035em): Hero + page-header headline only.
- **Headline** (`heading-lg`, weight 800, `clamp(2rem, 4.5vw, 3.1rem)`, tracking -0.03em): Section headings.
- **Title** (`heading-md`, weight 700, tracking -0.02em): Card and sub-section titles.
- **Body** (Hanken, 1rem, line-height 1.6): Running copy, capped 65–75ch.
- **Kicker** (Hanken, 700, 0.8rem, tracking 0.16em, UPPERCASE): The ONE brand label. **Reserved for the hero and the subpage PageHeader only**, always paired with the stripe. Functional field/column labels (footer columns, contact fields) may share the look but are not section eyebrows.

### Named Rules
**The Tight-Head, Open-Body Rule.** Headings tracked negative and set heavy/large for machined confidence; body at normal tracking and 1.6 line-height for calm legibility on dark. The contrast between the two voices is the system.

**The No-Eyebrow Rule.** A tiny uppercase tracked label above *every* section is AI scaffolding, and was removed in the rebrand. The kicker appears on the hero and the page header — nowhere else as a section eyebrow. Section headings stand on their own, or with just an M-stripe divider.

## 4. Elevation

Flat by default, lit by state. Surfaces are flat at rest; depth comes from the
steel tonal ramp stepping up off the floor and 1px hairlines, not from resting
drop shadows. Shadow/glow appears only as a soft, colored cue tied to state or the
brand: a blue glow under (and around, on hover) the primary CTA, a blue focus halo
on inputs, a lit M-red dot, a deep graphite drop under the mobile-menu overlay.
Every glow is tinted to its element's own hue; no generic gray ambient shadow.

### Shadow Vocabulary
- **CTA Lift** (`0 8px 26px -12px` brand-blue): under the primary button; on hover it adds a `0 0 22px` blue bloom so the call glows like a lit control.
- **Focus Ring** (`0 0 0 3px` Link-Blue at 0.18): the input focus halo.
- **Lit Dot** (`0 0 8px` M-red): the "familie" / status dot.
- **Menu Lift** (`0 8px 50px -12px` near-black): under the dark mobile-menu overlay.

### Named Rules
**The Flat-By-Default, Lit-By-State Rule.** A panel at rest has a hairline and a tonal step off the floor, never a resting shadow. Any drop shadow/glow must be earned by state or by being the primary CTA, and must be tinted to that element's own hue.

## 5. Components

Firm and motorsport-confident: tight radii, confident weight, precise edges, the
snap of a well-engineered control. Energy where it earns lift (an M-red accent, a
blue hover bloom), but precise, never chaotic.

### Buttons
- **Shape:** mechanical, `rounded.md` (0.375rem), 1.5px transparent border baked in so variants share geometry.
- **Primary** (`.btn-primary`): BavAuto Blue fill, white label, CTA glow; brightens and blooms on hover. The phone call — the single brightest element on the floor.
- **WhatsApp** (`.btn-whatsapp`): WhatsApp Green fill, dark-green label.
- **Outline** (`.btn-outline`): transparent with a translucent-white border/text — the default for the dark floor. **`.btn-outline-inverse`** uses dark translucent borders for the light service-bay panel.
- **Hover/Focus:** 120–200ms `--ease-out-quart`; `:active` presses 1px. Global `:focus-visible` is a 2px Link-Blue outline.

### Cards / Containers
- `rounded.lg` (0.5rem), `surface-container-lowest` steel fill lifting off the floor, 1px hairline, no resting shadow. Used deliberately (testimonials are the canonical use); most sections compose with grid + hairlines.

### Inputs / Fields
- `surface-container-low` fill, 1.5px hairline, `rounded.md`. **Focus:** Link-Blue border + blue halo. Placeholder at secondary ink (AA). Textarea vertical-resize; native select appearance stripped.

### Navigation
- Sticky top bar, dark throughout. Transparent over the hero at rest; once scrolled (`data-scrolled`), a frosted **dark** glass backdrop (`oklch(18% 0.022 256 / 0.72)` + blur) and a bottom hairline. Text stays light at every state. Wordmark carries a small M-stripe tick.
- **Mobile:** burger opens a dark overlay (React island) with a blue radial wash and staggered link entrance, honouring reduced-motion.

### The M Stripe (signature)
Three bands, light blue → indigo → red, fixed 33.33% each. `.m-stripe` 4×64px divider/tick; `.m-stripe--full` full-width edge; `.m-stripe--v` a vertical rule (hero headline, Process rail). The one piece of motorsport heritage the brand wears — never the roundel.

### Scroll Reveal (signature behavior)
Content visible by default; JS opts into a hidden start (`opacity:0`, `translateY(14px)`) and reveals on scroll via IntersectionObserver, with a 2.5s failsafe that force-reveals everything so the page never ships blank. Suppressed under `prefers-reduced-motion`.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page on the dark garage floor; let steel panels step *up* off it for depth, and reserve the one light "service bay" inversion for the conversion section.
- **Do** make the phone call the brightest element — the blue CTA with its glow is the lit control everything funnels toward.
- **Do** keep the M tri-color in fixed band order, and let M Racing Red carry single-element enthusiast energy per the M-Color Rule.
- **Do** set headings tight, heavy and large (Archivo) against open calm body (Hanken, 1.6), cap body 65–75ch, and hold WCAG 2.2 AA (light ink on dark clears it; verify the light bay too).
- **Do** keep call + WhatsApp one tap away on mobile.

### Don't:
- **Don't** flee to a light/off-white default; the dark floor is the identity. Don't scatter light panels — the single lit bay is the move.
- **Don't** look like a **cold corporate dealership**, a **cheap roadside garage**, or a **generic SaaS landing** (hero-metric template, identical icon-card grids, gradient blobs, buzzword copy). No BMW roundel.
- **Don't** put an uppercase tracked eyebrow above every section (the No-Eyebrow Rule) — the kicker lives on the hero and page header only.
- **Don't** reorder the M stripe, fake-carbon it, or use M-red for body copy.
- **Don't** introduce a third accent hue (the One Blue Rule), use the base blue as text on dark (use Link Blue), or put a gray ambient shadow on a flat panel.
- **Don't** use dim gray body text; the near-white ink and AA-tuned accents are chosen so nothing falls below contrast.
