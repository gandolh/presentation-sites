# Design

Visual system for Ana Saloon, rewritten on 2026-11-13 from what shipped in the
redesign "Menu beside the work". The tokens live in
[`src/styles/global.css`](src/styles/global.css) (Tailwind v4 `@theme`, Material
You color roles); [docs/tokens.md](docs/tokens.md) lists them. Identity
preservation wins: Fraunces and Manrope, Ana's photographs, WhatsApp green on
every booking action and the one light look all stay.

## Theme

Light, warm, boutique. A blush-cream ground (`#f5e8e2`) lit like daylight in a
calm studio, never sterile white, never dark. There is one look and no theme
switch. Surfaces separate by role, not by decoration: the **ground**, the
**band** (`#efdcd4`, which separates neighbouring sections), the **card**
(`#fffcfb`, always raised with a 1 px `outline-variant` edge and `--shadow-card`)
and the **well** (`#f3ddd5`, behind a picture). The footer stays dark
(`--color-inverse-surface`). Gold stays a thin accent: the rule, the notice's
foot, the signature underline, the focus ring in its text-safe shade.

## Color

| Role | Token | Hex |
|---|---|---|
| Ground | `--color-background` / `--color-surface` | `#f5e8e2` |
| Band | `--color-surface-container-low` | `#efdcd4` |
| Card | `--color-surface-container-lowest` | `#fffcfb` |
| Well | `--color-surface-container-high` | `#f3ddd5` |
| Ink / muted ink | `--color-on-surface` / `-variant` | `#241914` / `#4f4442` |
| Brand (rose-brown) | `--color-primary` | `#705955` |
| Blush (menu head, loyalty panel, header pill) | `--color-blush` | `#f4d6d0` |
| Blush deep (hover only) | `--color-blush-deep` | `#e8a6a0` |
| Gold (rule, never text) | `--color-gold` | `#c9a961` |
| Gold ink (prices, numerals, focus ring) | `--color-gold-ink` | `#7a6118` |
| Subtitles | `--color-secondary` | `#6f561a` |
| Notice band | `--color-secondary-container` / `on-` | `#f6e4bd` / `#5a4512` |
| WhatsApp | `--color-whatsapp` / `-deep` / `on-whatsapp` | `#118040` / `#0e7a37` / `#fffcfb` |
| Footer | `--color-inverse-surface` and its `inverse-on-surface*`, `-wash`, `-line` | `#3b2e28` |

**Rules.** Gold is never text; `gold-ink` carries text and the ring. Blush deep
is a hover colour, not a text colour. Green is the booking action everywhere,
and the only filled button on the page; the call button and Instagram are
outlined; the loyalty panel's button is rose-brown because green would clash on
blush. No gradient text, no side-stripe borders, no glassmorphism, no grain.

## Typography

Fraunces (`--font-display`, variable, `@fontsource-variable/fraunces` 5.3.0, the
`opsz` file) and Manrope (`--font-body`, `@fontsource/manrope` 5.3.0), both
self-hosted. Sentence case everywhere: no uppercase, no tracked capitals.

| Step | Class | Size / line | Notes |
|---|---|---|---|
| Display | `.heading-xl` (h1) | 64/68, weight 440 | phone `min(40px, 10vw)`; from 901 px `opsz` 96; runs on one line at 1280 |
| Heading | `.heading-lg` (h2) | 32/38, weight 440 | phone 28/34 |
| Title | `.heading-md` (h3), prices, steps, signature | 24/30, weight 500 | |
| Lead | `.copy-lead` | 18/28 | phone 16/24 |
| Body | | 16/24 | |
| Label | `.label-md` | 14/20, weight 600 | subtitles, notice, foot, legal |

The `--text-*` tokens in `@theme` carry these sizes. The Fraunces file has no
`SOFT` axis, so `"SOFT" 30` has no effect; optical size follows the font size.
`text-wrap: balance` on h1-h3 and `pretty` on paragraphs and list items, so
`WhatsApp.` never orphans. No dashes in rendered copy (hyphens only); the legal
pages' text is the exception.

## Layout

- **Container:** `.container-page`, 1200 px, gutters 32, 20 under 761 px, 16 under 381 px.
- **Sections:** `.section` 80 px (48 on phones), `.section--tight` 56 (40). The page alternates ground and band: hero (ground), About (band), Hygiene (ground), Gallery (band), Loyalty (ground), FAQ (band), Booking (ground), Contact (band), footer (dark).
- **Breakpoints:** 1040, 900, 760 and 380 px, written as media queries. At 901 and up the header nav shows; at 900 and under the menu button; the header pill shows from 761 px.
- **First screen is the offer.** The Services menu card sits in the hero beside the photograph (`#servicii` is the card, so `/#servicii` lands on it). At 1280x800 all three price rows are whole above the fold; on a phone the photo is short (46vw, 40vw under 381 px) so the first price row clears the dock. A header is 68 px at 901 and up, 64 below, and anchors take `scroll-padding-top` of the header plus 16.
- **Cards and rows.** Hygiene and the FAQ are each one raised card with ruled rows; Ana's island sits on a band, mirrored (text left, portrait right) with the gold rule and the signature; the Contact columns are balanced; the price never clips (`/ unghie` wraps to a second line).
- **Notice band:** in flow above the sticky header, pale gold with a gold foot, no dot.
- **Layers** are named: `--z-index-header` 20, `--z-index-dock` 30; the menu Drawer is above both.

## Interaction & Motion

- **Focus ring:** `2px solid var(--color-gold-ink)` at a 3 px offset on `:focus-visible`, declared with `:where(...)` (specificity 0); on the footer the ring takes `inverse-on-surface`. Never `outline: none`.
- **Targets:** 44 px and up on every control, 52 px on buttons.
- **Touch:** `touch-action: manipulation` and no tap highlight; `.btn:active` gives the press feedback. Keep the pair together.
- **One motion curve:** `cubic-bezier(0.22, 1, 0.36, 1)`. Scroll reveals use `IntersectionObserver` and enhance an already visible default; `Base.astro` force-reveals after 2.5 s so a bot never captures a blank page. Every motion has a `prefers-reduced-motion` path (no reveal, no smooth scroll, no zoom, no arrow slide).

## Shape & Elevation

Radii 8, 16, 24 and full (`--radius`, `-lg`, `-xl`, `-full`). Buttons and the pill are full; cards are 24 (20 on phones) except the help card and small panels at 16. Elevation is `--shadow-card` (cards, menu, islands, FAQ, header pill, dock) and `--shadow-glow` (the green booking buttons).

## Components

- **`.btn`:** 52 px pill, sentence case, Manrope 600 16/20. Variants: `.btn-whatsapp` (green, glow), `.btn-line` (outlined, for a call and Instagram), `.btn-primary` (rose-brown, on blush), `.btn-pill` (the header's blush Programează-te, 48 px).
- **`.link`:** underlined text link with an arrow icon 6 px after the words (never a glued `→`).
- **`.card`:** raised surface with a 1 px edge. **`.slot`:** the picture well (a gradient with the photograph over it; a failed picture never draws its alt text).
- **`.gold-divider`:** 48x2 px gold rule, kept for Ana's intro, the loyalty panel and the legal titles. **`.wordmark`:** italic Fraunces.
- **`MobileBookingBar`** (`#mobile-booking-bar`, 760 px and under, `z-index-dock`): docked from the first paint; the WhatsApp pill and a round `tel:` call button; no in-hero button on phones. No-JS default visible. The inline script only hides it while the menu is open or while the Booking card's or Contact's own button (`data-booking-cta`) is on screen. Reduced motion fades instead of sliding.
- **Menu Drawer** (`MobileMenu.tsx`): full height, wordmark and close, links in Fraunces 32/38, the blush pill.
- **Legal pages** (`LegalLayout.astro`): a plain header (wordmark and an arrow link back), the title with the gold rule, and the text on one raised card.

## Iconography & Imagery

Imagery is the brand: Ana's photographs (`public/images/real/*`, `PUBLIC_IMAGE_SOURCE=real`), SVG mocks as the committed fallback. One icon family, Phosphor: `astro-icon` in `.astro` files, named `@phosphor-icons/react` imports at `weight="light"` in the island. Never hand-roll icon paths.

## Parked

Testimonials stay commented out until Ana has real reviews. The facts pair (`3+ ani de experiență`, `1 la 1`) is not rendered while `site.stats.years` is a placeholder; to bring it back, render `site.stats.years` and the `1 la 1` line in About's text column under the signature.
