---
name: Ecclesia Digitalis
description: The white-label Material-3 design system for Romanian Orthodox parish sites — reverent, formal, architectural; re-skins per church by token swap alone.
colors:
  primary: "#4e0816"
  on-primary: "#ffffff"
  primary-container: "#611220"
  on-primary-container: "#160207"
  secondary: "#c8a24b"
  on-secondary: "#ffffff"
  secondary-container: "#e6cd9b"
  on-secondary-container: "#3c3017"
  secondary-fixed: "#e9d6a4"
  surface: "#fcf9f4"
  background: "#fcf9f4"
  on-surface: "#1c1c19"
  on-surface-variant: "#544243"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f0eb"
  surface-container: "#ebe8e3"
  surface-container-high: "#e3e0db"
  surface-container-highest: "#dbd8d3"
  inverse-surface: "#31302d"
  inverse-on-surface: "#f3f0eb"
  outline: "#8e8786"
  outline-variant: "#dcc2c3"
  tertiary: "#29241c"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#fde7e5"
typography:
  display-lg:
    fontFamily: "Cardo, Source Serif 4, Georgia, serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "56px"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Cardo, Source Serif 4, Georgia, serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
  headline-md:
    fontFamily: "Cardo, Source Serif 4, Georgia, serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0.01em"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  sm: "0.25rem"
  DEFAULT: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  base: "0.25rem"
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "4rem"
  gutter: "1.5rem"
  container-max: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.DEFAULT}"
    padding: "24px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 12px"
---

# Design System: Ecclesia Digitalis

## 1. Overview

**Creative North Star: "The Digital Iconostasis"**

In an Orthodox church the iconostasis is the carved screen that frames the altar: it does not compete with what it holds, it composes the eye toward it. This system is that screen. Every surface is a quiet, dignified frame around sacred content — the next service, this week's announcement, a pomelnic of names, the parish IBAN. Reverence is carried by typographic authority, generous quiet, warm parchment tone, and the sparing glint of gold. It is never carried by ornament for its own sake.

The system is **reverent, formal, and architectural**. Depth comes from tonal layers and 1px outlines, not from heavy shadows. Color comes from the chromatic tradition of iconography: liturgical burgundy, divine gold, parchment cream, charcoal ink. It is built for the faithful who actually visit — older, mobile-first, multilingual (Romanian and the diaspora's English, Italian, Spanish, German), sometimes on a slow connection — so legibility, large targets, and fast static pages are part of the design, not polish on top of it.

It explicitly rejects four things. **Generic SaaS / startup**: no gradient-drenched hero-metric templates, no rounded-everything card grids, no purple-blue tech palette, no "transform your community" voice. **Evangelical megachurch / Hillsong**: no concert-lighting glow, no crowds-with-hands-raised stock, no upbeat all-sans friendliness. **Dated parish HTML / clip-art**: no 2000s tables, no Comic Sans, no spinning crosses, no gold-on-blue gradients. **Cold corporate / sterile fintech**: a giving page must read as *the parish's own* trust, never a payment processor's chrome. The whole system re-skins per church by swapping a tiny seed set of color tokens; components never fork.

**Key Characteristics:**
- Burgundy primary, gold accent (decorative only), warm cream surface, charcoal ink.
- Cardo headings (old-style biblical-scholarship serif) + Inter body; a fixed Material-3 type scale, no fluid display.
- Tonal layering and hairline outlines over shadows; one soft `shadow-sm` at rest.
- Full Material-3 role palette derived from ~4 church-settable seed tokens via `color-mix()`.
- Diacritic-correct (ă â î ș ț) and long-string-safe across RO/DE; WCAG 2.1 AA.

## 2. Colors

A warm, liturgical palette rooted in iconography: parchment cream as the ground, deep burgundy as the voice of dignity, gold as the rare glint of the divine, charcoal as the ink of long-form prayer and scripture. The full ~50-role Material-3 set is **derived** from a small seed set via `color-mix()`; the values below are the default Orthodox theme, the same chain a re-skin shifts from ~4 inputs.

### Primary
- **Liturgical Burgundy** (`#4e0816`): the system's voice of dignity. Solid primary buttons, headings (`h1`–`h4`), links, the wordmark, the full-bleed hero background when no photo is set. Reads ~14.6:1 on cream — heavy, authoritative, calm. The hover/pressed tone is **Burgundy Ember** (`primary-container`, derived ~`#611220`).

### Secondary
- **Divine Gold** (`#c8a24b`): the rare glint. Dividers, featured-card accents, ≥2px borders, decorative icons, progress fills, and the hero's "next service" chip label as *light* `secondary-fixed` (`#e9d6a4`) text on dark burgundy. Gold is the sparing accent, never the workhorse. **Not the focus ring** on light surfaces (see the Focus rule below) — gold is ~2.3:1 on cream and a focus indicator must be legible, so it would fail WCAG 2.1 AA non-text contrast (1.4.11).

### Neutral
- **Parchment Cream** (`surface` `#fcf9f4`): the page ground. Warm, low-glare, parchment-like; replaces harsh white to ease long reading and evoke the church interior.
- **White** (`surface-container-lowest` `#ffffff`): cards and floating panels lift one tonal step above cream.
- **Tonal Cream Ladder** (`surface-container-low` → `highest`, ~`#f3f0eb` → `#dbd8d3`): "pockets" of slightly darker cream that distinguish content zones, alternating list rows, and hover fills — depth without shadow.
- **Charcoal Ink** (`on-surface` `#1c1c19`): body text and maximum-legibility theological copy (~16:1 on cream).
- **Muted Mauve-Grey** (`on-surface-variant` `#544243`): secondary metadata, labels, captions (~8.9:1 on cream — still AA, never the light-grey AI default).
- **Hairline Outline** (`outline-variant`, a faint burgundy-tinted line ~`#dcc2c3`): the 1px borders that carry structure where shadows don't.

### Named Rules
**The Gold Is Never Text On Light Rule.** Divine Gold (`secondary`, ~`#c8a24b`/`#c9a227`) is **~2.2:1 on cream — forbidden as body or label text on any light surface.** Gold is permitted *only* as: fills behind a dark `on-secondary`/`on-secondary-container` tone, borders and dividers of ≥2px, decorative icons, progress fills, and as *light* `secondary-fixed` text on the dark burgundy hero. Never set gold as readable text on cream, white, or any pale surface. If you need gold "text," you need a dark tone on a gold fill instead.

**The Focus Ring Is Burgundy On Light Rule.** A focus indicator is *information*, not decoration, so it must clear WCAG 2.1 AA non-text contrast (§1.4.11, 3:1 threshold). On light surfaces (cream/white) the focus ring is **burgundy `--primary`** (`focus-visible:ring-primary`, ~14.6:1), never gold (which is ~2.3:1 on cream and fails). Gold rings are allowed *only* on the dark burgundy hero, where `ring-secondary` sits on `ring-offset-primary` (~6.4:1).

**The Seed-And-Derive Rule.** A church sets only `primary`, `secondary`, `surface` (and optionally `error`, `onPrimary`, fonts, radius) in its `site.brand` entry. Every other role is derived in `tokens.css` via `color-mix()`. Never hand-set a derived role per church and never write a raw hex inside `packages/*` — always go through a token. The church-facing surface stays tiny even though the system uses the full M3 palette.

**The On-Container Is Dark Rule.** The `on-*-container` tones (e.g. `on-secondary-container`, `on-primary-container`) are derived **dark** (`color-mix(seed 30%, #000)`), not as the bright seed. They are the readable color *over* a pale tonal tint — gold-on-gold and burgundy-on-burgundy both fail AA. This is why every chip, badge, and alert tint clears ~9.5:1.

## 3. Typography

**Display Font:** Cardo (with Source Serif 4, Georgia, Times New Roman, serif fallback)
**Body Font:** Inter (with system-ui, Segoe UI, Roboto, sans-serif fallback)

Both are self-hosted (no Google Fonts runtime; latin + latin-ext subsets cover RO ă ș ț and DE ä ö ü ß). Cardo is an old-style serif drawn for classical and biblical scholarship (Latin, Greek, Hebrew); it carries the liturgical, ecclesiastical voice of a printed missal. It ships static 400 and 700 weights only (no variable axis, no 600 file), so the 600-weight headline tokens resolve to the 700 face. Inter is on the usual "reflex-reject" list, but here it is a **committed, shipped identity choice** paired on a real contrast axis with the serif. Source Serif 4 remains the documented fallback and a valid per-church `fontHeading` alternative.

**Character:** Cardo gives headings a scholarly, ecclesiastical authority, the register of a printed liturgical text, without tipping into theatrical calligraphy. Inter keeps long-form prayer, scripture, news, and administrative detail maximally legible for an older audience. The contrast is serif-authority over sans-clarity, never two competing voices.

### Hierarchy
- **Display Large** (700, 48px / 56px, tracking −0.02em): the hero church name and the largest page openings only. A fixed, restrained ceiling — reverent, not shouting.
- **Headline Large** (700, 32px / 40px; 28px / 36px on mobile): major section titles.
- **Headline Medium** (700, 24px / 32px): card titles, sub-section heads.
- **Body Large** (400, 18px / 28px): lead paragraphs, hero subtitles, prose intros.
- **Body Medium** (400, 16px / 24px): default body and prose; line-height 1.5–1.75 to seat diacritics; cap measure at ~65–75ch.
- **Label Medium** (500, 14px / 20px, tracking 0.01em): button labels (uppercase), nav items, field labels, eyebrows.
- **Caption** (400, 12px / 16px): field hints and errors, fine print.

### Named Rules
**The Fixed-Scale Wrap-Discipline Rule.** The display scale is intentionally **fixed** (48px desktop / 28px mobile), not fluid `clamp()`. Romanian and German parish names run long ("Parohia Înălțarea Domnului Hărlești"). Because the scale doesn't shrink to fit, hero and heading copy **must be tested at every breakpoint** and use `text-wrap: balance` (h1–h3); it must wrap gracefully and **never overflow its container**. The viewport is part of the design.

**The Uppercase-Labels-Only Rule.** Uppercase with tracking is reserved for short labels (≤4 words), button text, and a single hero eyebrow. Never set sentences or body copy in all-caps; liturgical Romanian reads in sentence case.

## 4. Elevation

This system is **flat by default, layered by tone**. Depth is conveyed first by the tonal cream ladder (`surface` → `surface-container-*`) and 1px `outline-variant` hairlines — "pockets" of color, the way a church interior reads as deep through stone and light rather than drop shadows. Shadows are a quiet second voice, used at rest only as a single soft `shadow-sm` on cards, and otherwise reserved as a *response to state* (hover lift on interactive cards and buttons).

### Shadow Vocabulary
- **Rest** (`shadow-sm`, ~`0 1px 2px rgba(0,0,0,0.05)`): the only at-rest shadow, on cards and floating panels above the cream ground.
- **Hover / Lift** (`shadow-md`, ~`0 4px 6px rgba(0,0,0,0.07)` + `translateY(-2px)`): interactive cards and primary buttons on hover.
- **Hero scrim** (`bg-black/40` overlay; chip uses `backdrop-blur-md`): the one place glass/blur is allowed — over a full-bleed photo so white hero text stays legible.

### Named Rules
**The Tonal-Before-Shadow Rule.** Reach for a tonal step (`surface-container-low/high`) or a hairline outline before reaching for a shadow. If a surface needs to feel deeper, darken its cream, don't drop a shadow under it. Never pair a 1px border with a wide (≥16px blur) drop shadow on the same element — pick one. If it looks like a 2014 app, the shadow is too dark and the blur is too wide.

## 5. Components

### Buttons
- **Shape:** gently squared corners (`rounded`, 0.5rem) by default; full pill (`rounded-full`) only for chip-like CTAs such as the header Donează. Generous horizontal padding (24px at `md`) to seat long Romanian verbs ("Trimite pomelnicul"). Labels are uppercase Label Medium with `tracking-wide`.
- **Primary:** solid Liturgical Burgundy fill, white label. Hover deepens to Burgundy Ember (`primary-container`) and adds `shadow-md`; active scales to 0.98.
- **Secondary:** gold **outline** (1px `secondary`) with a **burgundy** label — never a gold label (Gold Rule). Hover fills gently with `secondary-container/20`.
- **Ghost:** transparent, burgundy label, hover fills `surface-container-high`.
- **Focus:** every button shows a visible `focus-visible` ring with a 2px offset — **burgundy** (`ring-primary`) on light surfaces; gold (`ring-secondary`) only on the dark hero. (See the Focus Ring rule in Colors.)

### Cards / Containers
- **Corner Style:** `rounded` (0.5rem) default; `rounded-md`/`rounded-lg` (0.75/1rem) for larger panels. Never exceed 1rem on a card — this system does not over-round.
- **Background:** White (`surface-container-lowest`) lifting one tonal step above the cream page.
- **Border:** hairline `outline-variant/30`. **Featured** cards add a gold *bottom* border (`border-b-2 border-secondary`). There is no left/right side-stripe variant — colored side-stripes are banned (the `accent="bar"` option was retired); featured emphasis is always the bottom border.
- **Shadow Strategy:** `shadow-sm` at rest; interactive/linked cards lift to `shadow-md` + `-translate-y-0.5` on hover and gain the burgundy focus ring.
- **Internal Padding:** `p-md` (1.5rem) default; `none` for edge-to-edge media.

### Inputs / Fields
- **Style:** transparent background, 1px `outline-variant/50` border, `rounded` (0.5rem), Body Medium charcoal text. Placeholder at `on-surface-variant/50`. Label is Label Medium charcoal, sits above the control, associated via `for`/`id`.
- **Focus:** the border transitions to **gold** (`secondary`) and a 2px ring in **burgundy** (`ring-primary`) appears — the ring carries the legible focus signal, the gold border the brand glint.
- **Error:** border, ring, and helper text turn `error` red; `aria-invalid` set; the caption-size error message is announced via the field's `aria-describedby`.

### Navigation
- **Style:** sticky glass header — `bg-surface/95 backdrop-blur-md` with a hairline bottom outline. Wordmark in display serif burgundy. Desktop nav items are uppercase Label Medium; idle items are muted (`on-surface-variant`), the active item is burgundy with a **gold underline** (`border-b-2 border-secondary`) and `aria-current="page"`.
- **States:** hover shifts idle items to burgundy with a faint `surface-container-low` fill; burgundy focus ring throughout.
- **Mobile:** collapses to a hydrated `MobileNav` sheet (focus trap, Esc restores focus). Desktop nav is `flex-wrap min-w-0` so long RO/DE labels wrap instead of clipping. Language switcher appears only when a church ships more than one locale.

### Byzantine Divider (signature)
- A horizontal hairline rule with a small centered **Byzantine node**: an inline-SVG cross set in a gold (`secondary`) ring. The line uses `currentColor` (tone `subtle` → `outline-variant`, `strong` → `on-surface-variant`); the cross and ring are drawn in gold. Pure SVG, scales crisply, re-skins by token. Decorative by default (`aria-hidden`); becomes `role="separator"` with an `aria-label` when given one. This is the system's one ornament, and it earns its place.

### Hero (signature)
- Full-bleed background photo with a `bg-black/40` scrim (or a tonal burgundy fallback when no image). Centered, reverent stack: a gold-tinted uppercase eyebrow, the church name in Display Large with a drop shadow, an optional glass "Următoarea Slujbă: …" chip (`backdrop-blur-md`, `border-white/20`), and up to two CTAs. On the dark hero the primary CTA inverts to a white fill with burgundy label; outline CTAs use a `secondary-fixed` (light gold) border.

## 6. Do's and Don'ts

### Do:
- **Do** route every color through an M3 token (`bg-primary`, `text-on-surface-variant`). Raw hex inside `packages/*` is forbidden.
- **Do** re-skin a church by editing only its `site.brand` seeds (`primary`, `secondary`, `surface`, optional `error`/`onPrimary`/fonts/radius). Let `color-mix()` derive the rest.
- **Do** keep gold decorative: fills, ≥2px borders, dividers, progress fills, icons, and *light* `secondary-fixed` on the dark hero only.
- **Do** use a **burgundy** focus ring (`ring-primary`) on light surfaces — it's information and must clear WCAG 2.1 AA non-text contrast (3:1); gold rings only on the dark hero.
- **Do** convey depth with the tonal cream ladder and 1px hairlines first; add `shadow-sm` at rest and `shadow-md` only on hover.
- **Do** keep cards at `rounded`–`rounded-lg` (0.5–1rem); pill is for tags and chip CTAs only.
- **Do** test heading and hero copy at every breakpoint with long RO/DE parish names; `text-wrap: balance` on h1–h3, never overflow.
- **Do** fall back to the shared `EmptyState` primitive anywhere a list can render zero items, and reuse `ErrorLayout` for 404.
- **Do** keep diacritics correct (ă â î ș ț) and money in explicit currency from integer minor units.
- **Do** give every animation a `prefers-reduced-motion: reduce` alternative; motion here is reverent and slow.

### Don't:
- **Don't** set gold (`secondary`) as body or label text on any light surface — it is ~2.2:1 on cream. (The Gold Rule.)
- **Don't** use a gold focus ring on a light surface — it fails WCAG 2.1 AA non-text contrast (~2.3:1). Use `ring-primary` (burgundy); gold rings belong only on the dark hero.
- **Don't** ship the **generic SaaS / startup** look: no gradient hero-metric templates, no purple-blue tech palette, no rounded-everything card grids, no "transform your community" copy.
- **Don't** ship the **evangelical megachurch / Hillsong** look: no concert-lighting glow, no crowds-with-hands-raised stock, no upbeat all-sans brand energy.
- **Don't** ship **dated parish HTML / clip-art**: no 2000s table layouts, Comic Sans, gold-on-blue gradients, spinning crosses, or amateur clip-art.
- **Don't** let a giving or pomelnic surface read as **cold corporate / sterile fintech** — trust must read as the parish's own, white-labelled, never a payment processor's chrome.
- **Don't** over-round: a card at 24/28/32px radius is wrong for this system.
- **Don't** pair a 1px border with a wide (≥16px blur) drop shadow on the same element; pick one.
- **Don't** use a colored `border-left`/`border-right` stripe as decoration anywhere; featured emphasis is the gold bottom border only (the `accent="bar"` left-stripe was retired from the system).
- **Don't** use gradient text (`background-clip: text`), decorative glassmorphism beyond the hero scrim/chip, or all-caps body copy.
- **Don't** fork a component per church or hand-set a derived M3 role; if a need can only be met by forking, it is the wrong need.
