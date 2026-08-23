# Design

Visual system for Ana Saloon. Captured from the live tokens in
[`src/styles/global.css`](src/styles/global.css) (Tailwind v4 `@theme`,
Material You color roles) — this is the committed brand, not a proposal.
Identity preservation wins: new work composes within these tokens.

## Theme

Light, warm, boutique. A soft blush-cream world lit like daylight in a calm
studio — never sterile white, never dark. Color strategy is **restrained**:
tinted near-white surfaces carry the page, a single blush brand color does the
work, and gold appears only as a thin accent (≤10% of any surface). Warmth
comes from the surface tint, the serif display face, and the photography — not
from saturation or decoration.

## Color

OKLCH-described, stored as hex in `@theme`. Brand hue is a muted rose-brown
(`--color-primary` `#705955`); surfaces are tinted toward that hue rather than
toward generic "warm."

| Role | Token | Hex | Use |
|---|---|---|---|
| Body background | `--color-background` / `--color-surface` | `#fff8f6` | Page bg — warm off-white, tinted toward blush |
| Surface (lowest) | `--color-surface-container-lowest` | `#ffffff` | Cards, raised panels |
| Surface (low/var) | `--color-surface-container-low` | `#fff1ec` | Inputs, subtle fills |
| Surface (high) | `--color-surface-container-high` | `#fae4db` | Section banding, image placeholders |
| Ink (primary) | `--color-on-surface` | `#241914` | Headings + body. 4.5:1+ on all surfaces |
| Ink (muted) | `--color-on-surface-variant` | `#4f4442` | Secondary text — verify ≥4.5:1 on tinted bg |
| Brand | `--color-primary` | `#705955` | Wordmark tint, primary structural color |
| Blush | `--color-blush` | `#f4d6d0` | Primary button fill, selection, accents |
| Blush deep | `--color-blush-deep` | `#e8a6a0` | Button hover, link hover |
| Gold | `--color-gold` | `#c9a961` | Thin accent only: dividers, focus ring, small flourishes |
| Secondary | `--color-secondary` | `#745b1b` | Eyebrow/label text (deep ochre for contrast) |
| Cream | `--color-cream` | `#fbf7f2` | Alt warm surface |
| Error | `--color-error` | `#ba1a1a` | Validation, with `error-container` `#ffdad6` |
| Outline | `--color-outline` / `-variant` | `#817472` / `#d3c3c0` | Borders, input outlines |

**Rules.** Gold is an accent, never a fill or gradient-text. Blush is the
action color. Keep muted-ink-on-tinted-surface combinations at AA — bump toward
`--color-on-surface` if a pairing is borderline. No gradient text, no
side-stripe borders, no glassmorphism.

## Typography

Two families on a contrast axis (serif display + humanist sans), self-hosted
via Fontsource (no external font requests).

- **Display:** `"Fraunces Variable", Georgia, serif` — `--font-display`. A warm,
  soft-serif variable face (chosen over Playfair, a reflex-reject Didone, to read
  hand-made/intimate rather than fashion-masthead). Headings h1–h4, wordmark
  (italic 500), `.heading-xl/lg/md`. `font-optical-sizing: auto` +
  `font-variation-settings: "SOFT" 30, "opsz" <size>` to round the terminals;
  weight 440–500, `line-height: 1.08–1.2`, `letter-spacing: -0.005em` to `-0.015em`.
- **Body:** `"Manrope", system-ui, sans-serif` — `--font-body`. Body, labels,
  buttons. Base 16px / `line-height: 1.5`.
- **Scale:** fluid via `clamp()`. `heading-xl` `clamp(2.5rem, 6vw, 3.5rem)`,
  `heading-lg` `clamp(2rem, 4vw, 2.5rem)`, `heading-md` `clamp(1.5rem, 3vw, 2rem)`.
  Display ceiling stays well under the 6rem cap.
- **Labels / eyebrows:** `.label-md` — Manrope 600, 0.875rem, `letter-spacing:
  0.05em`, uppercase, in `--color-secondary`.

Use `text-wrap: balance` on h1–h3 and `pretty` on long prose. No all-caps body.

> **Section cadence:** section headings stand on their own (display heading +
> gold divider), with no uppercase eyebrow above them — the inconsistent
> per-section eyebrow scaffold was removed. `.label-md uppercase` is reserved
> for *in-card* sub-labels (e.g. a service subtitle, the "Bun de știut" panel
> label, contact field labels), not as a kicker above section titles.

## Spacing & Layout

- **Container:** `.container-page` — `max-width: 1200px`, centered,
  `padding-inline: 1.25rem` (→ `2rem` at ≥768px).
- **Section rhythm:** `.section` — `padding-block: 3rem` (→ `6rem` at ≥768px).
  Vary this for rhythm rather than applying uniformly.
- **Breakpoint:** mobile-first; primary desktop switch at `768px` (`md`).
- Grid for 2D section layouts (hero 2-col), flex for 1D rows.

## Shape & Elevation

- **Radii:** `--radius-sm` 0.25rem · `--radius` 0.5rem · `--radius-md` 0.75rem ·
  `--radius-lg` 1rem · `--radius-xl` 1.5rem · `--radius-full` 9999px.
- **Buttons & inputs** are pill-shaped (`--radius-full`); cards use `--radius-lg`.
- **Elevation:** soft, low, warm-tinted shadows only —
  `0 4px 24px -16px rgba(43,31,26,0.08)` (cards),
  `0 4px 16px -8px rgba(43,31,26,0.12)` (primary button). No hard drop shadows.

## Components

- **`.btn` / `.btn-primary` / `.btn-secondary`** — pill, uppercase 0.875rem
  Manrope 600, `letter-spacing: 0.05em`. Primary = blush fill → blush-deep
  hover. Secondary = transparent with 1.5px blush border → blush fill on hover.
- **`.btn-whatsapp`** — solid WhatsApp green (`--color-whatsapp` `#118040`,
  white text = 5.02:1 AA) for the primary booking action. The single strongest
  CTA on the page; green is the recognizable "message me" cue and marks every
  WhatsApp action site-wide (Booking panel, Contact, mobile sticky FAB).
- **`.btn-on-blush`** — solid brand-primary fill for CTAs placed on a blush
  surface (e.g. the Loyalty panel) where `.btn-primary`'s blush would vanish.
- **`.card`** — white surface, `--radius-lg`, 2rem padding, soft shadow. Use
  sparingly; never nest cards.
- **`.input` / `textarea.input`** — pill (textarea = `--radius-lg`), low
  surface fill, outline-variant border, **gold focus border**.
- **`.gold-divider`** — 48×1.5px gold rule, the signature accent flourish.
- **`.wordmark`** — italic Fraunces, the brand mark.
- **`.reveal`** — scroll-in reveal, opt-in via `.js-reveal` so content is
  visible without JS; reduced-motion collapses it to no transition.
- **`MobileBookingBar`** (`#mobile-booking-bar`, `md:hidden`, `z-30`) — sticky
  bottom WhatsApp CTA for phones (the nav booking button is hidden on mobile).
  Safe-area aware. No-JS default visible; the inline script (`.js-fab`) only
  refines *when* to hide it: while the mobile menu is open, while Booking /
  Contact / Footer are on screen (their own WhatsApp CTA would be redundant),
  and until the user scrolls past the hero. Reduced-motion fades instead of
  sliding.

## Motion

Quiet and purposeful. Reveal-on-scroll (opacity + 8px translateY, 600ms
`cubic-bezier(0.22, 1, 0.36, 1)` / ease-out-quint) is the main motion language;
button/link state transitions are 200ms `ease-out`. No bounce, no elastic, no
scroll-jacking. Every animation has a `prefers-reduced-motion: reduce` path
(already in global.css). Reveals enhance an already-visible default — never
gate content visibility on them.

**Reveal failsafe (Base.astro).** Because a JS-capable client that never
scrolls — a headless renderer, a link-preview / social-card bot, a backgrounded
tab where IntersectionObserver is throttled — would otherwise leave below-fold
`.reveal`s stuck at `opacity:0` and capture a blank page, the script (a) reveals
anything in the first viewport synchronously at load, and (b) force-reveals
everything still hidden after a 2.5s timeout regardless of scroll. The failsafe
snaps in with no transition (`.reveal-now`) since it's a correction, not an
entrance. No-JS clients are unaffected: `js-reveal` is never added, so the CSS
default keeps all content visible.

## Iconography & Imagery

- **Imagery is the brand.** Real photos of Ana's work (`public/images/real/*`,
  swapped in via `PUBLIC_IMAGE_SOURCE=real`), SVG mocks as the safe-to-commit
  fallback. Hero uses a 4:5 portrait crop in a rounded frame with a faint gold
  radial accent.
- Keep iconography minimal and line-based if used; no clip-art service icons
  (an explicit anti-reference).
