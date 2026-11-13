---
name: The porch notice
description: The white-label design system of the Romanian Orthodox parish template. A full-width name band, a program board and a giving card that rise out of its edge, one look per parish, re-skinned from four seed colours.
seeds:
  primary: "#6b1f2a"
  secondary: "#c8a24b"
  surface: "#faf6ef"
  on-primary: "#ffffff"
typography:
  display-md: { family: Cardo, size: 52px, line-height: 60px, weight: 700, use: "the parish name on the Home band from 960 px" }
  display-sm: { family: Cardo, size: 36px, line-height: 44px, weight: 700, use: "the next service's name (30/36 on phones)" }
  time: { family: Inter, size: 48px, line-height: 52px, weight: 600, use: "17:00, the loudest fact after the name (40/44 on phones)" }
  headline-lg: { family: Cardo, size: 32px, line-height: 40px, weight: 700, use: "section heads (28/36 on phones)" }
  headline-md: { family: Cardo, size: 24px, line-height: 32px, weight: 700, use: "card titles" }
  wordmark: { family: Cardo, size: 22px, line-height: 28px, weight: 700, use: "Header and Footer (20/24 on phones)" }
  body-lg: { family: Inter, size: 18px, line-height: 28px, weight: 400, use: "lede, IBAN, time rows" }
  body-md: { family: Inter, size: 16px, line-height: 24px, weight: 400, use: "body, buttons (600)" }
  label-md: { family: Inter, size: 14px, line-height: 20px, weight: 600, letter-spacing: 0, use: "labels, badges, footer text; sentence case" }
rounded: { control: 8px, card: 16px, pill: full }
elevation: { shadow-sm: "the news cards", shadow-board: "the board, the giving card, the page-head cards, the Drawer" }
---

# Design System: The porch notice

Brief 05 of Churchix, approved on the estate redesign board on 2026-11-13. It replaces "Ecclesia Digitalis" and its
liturgical rail (the history is in [corpus/wiki/design-system.md](corpus/wiki/design-system.md) and
[decisions](corpus/wiki/decisions.md)). The original Stitch token spec stays in `docs/design/` as the archive.

## 1. Overview

A parish site opens the way a church door does: the parish's name and its picture on a burgundy band, the program
pinned on a raised board that rises out of the band, the account beside it. The page is built for one job, to let a
parishioner find the service times and the news, and to let someone give. Everything else (history, contact,
pomelnice) sits one step behind it.

- **One look per parish**, no dark palette and no theme switch. A church sets four seeds in its `site.json` `brand`
  (`primary`, `secondary`, `surface`, `onPrimary`); every other colour is a `color-mix()` of them. Shared packages
  hold no per-church value.
- **Cardo** for the parish's name and every heading, **Inter** for facts, labels and the time. Both are self-hosted
  from `@fontsource` packages at exact pins (5.3.0).
- **Sentence case everywhere.** No tracked capitals, no eyebrows, nothing under 12 px (the 14 px label is the smallest
  in use). Romanian copy is formal and liturgical; every fact comes from the church's content.
- **A full-strength 1 px edge on every card** (`outline-variant`), and two shadows, nothing else for depth.

## 2. Colours

Roles keep the template's own names (`--color-` is the Tailwind prefix in `theme.css`). The derivations live in
`packages/ui/src/styles/tokens.css`.

- **Seeds:** `primary` (the band, filled actions, links, headings), `secondary` (gold or silver: rules, the arch line, the
  logo cross on the primary; never text, never an icon on a light surface), `surface` (the page), `on-primary`.
- **Text:** `on-surface` is the primary 12 % into near-black, `on-surface-variant` the primary 22 % into grey, so a blue
  parish gets blue-black text.
- **Surfaces:** `surface-container-lowest` (white: cards, header, bottom bar, inputs), `surface-container` (primary 7 %
  into the surface: the news tray, name-card heads), `surface-container-high` (the footer, the progress track),
  `surface-highlight` (the Sunday row: `secondary-strong` 18 % into white).
- **New roles:** `primary-strong` (primary 80 % with black: hover, pressed, the arch fill), `secondary-strong`
  (secondary 55 % with primary: every icon and mark on a light surface, at 3:1 or more for both seed sets),
  `on-primary-variant` (the lede on the band), `surface-highlight`.
- **Kept for the components that use them:** `primary-container` (Badge, Alert), `on-primary-container`,
  `surface-container-low`, `secondary-container` (now 30 %, badges and the beneficiary callout).
- **Edges:** `outline-variant` for cards and the header, `outline` for inputs, chips and the outlined button.

## 3. Typography

The scale is in the frontmatter. The name never shrinks below 28 px and is never cut: it wraps. The time is the loudest
fact after the name. Phone type steps (28/34 name, 30/36 next service, 40/44 time) are set per breakpoint, and the
`h2`/`h3` sizes of the phone block are scoped so `Transfer bancar`, `Date de contact` and the footer headings keep their own.

## 4. Elevation

`shadow-sm` for the news cards; `shadow-board` for the Home board and giving card, the page-head cards and the Drawer.
Every card also carries its edge, because a card on the page differs from it by only 1.08:1.

## 5. Layout

The only breakpoint that matters is **960 px**: the header, the bottom bar, the band and the card rows switch there.
(Other steps: 600 px, where the name goes from 28/34 to 32/40; 380 px, where the IBAN takes one line at 16/24;
780 px of screen height, where the arch shrinks.) The container is 1200 px with 24 px gutters (16 px on phones).

## 6. Components

- **Header:** a white band, 72 px (56 on phones), the wordmark, six places in sentence case with the current one in
  `primary` under a 2 px `secondary-strong` line, the language switcher when the church ships more than one locale, and
  `Donează`, the one filled pill. On phones the header holds the wordmark only.
- **BottomBar:** below 960 px, fixed, 64 px plus the gesture inset (`viewport-fit=cover`): Acasă, Program, Pomelnice,
  Donează and `Meniu`. Pomelnice and Donează follow `features.pomelnice` and `features.giving`. `Meniu` is the
  `MobileNav` island, whose Base UI Drawer rises above the bar. The Footer pads its bottom by the bar's height.
- **Hero (Home):** the band, with the name (52/60 from 960 px, 32/40 from 600, 28/34 below) and the arch: 246 x 298 in the
  band's middle, 210 x 252 on screens 780 px tall or less, 96 x 116 on phones. A photo fills the 5:6 arch (cover); with none,
  the arch is `primary-strong` with the church glyph in light gold. Two cards rise 64 px out of the band: the board (next
  service, then the week with Sunday on `surface-highlight`, and one route to /program) and the giving card. The giving
  card hides its account lines while the IBAN fails the mod-97 check (`lib/iban.ts`); the route to /donatii stays.
- **PageShell (inner pages):** a slim band with the title (40/48, 28/34 on phones) and the lede, and the first cards
  raised 56 px over its edge. No kicker, no rail.
- **Button:** 48 px (44 for `sm`), 8 px radius, label 16 px at 600. `primary` fills with `primary`, hover and pressed
  `primary-strong`; `secondary` is outlined with the grey `outline` edge (3:1; a gold edge fails it); `ghost` is
  transparent. Disabled is `surface-container-high`.
- **Card:** white, 16 px radius, 1 px `outline-variant`; `elevation` is `none`, `sm` or `board`; `featured` adds the gold
  bottom edge (the pinned lead).
- **Field:** a white 48 px control with a 1 px `outline` edge; an error is a 2 px `error` edge with the message in
  `on-error-container` under it. Focus is a 2 px `primary` ring with a 2 px offset (`on-primary` on the band).
- **ServiceSchedule:** one card per day on a two-column grid, the time at 32/40, the service in Cardo, Sunday on the
  highlight row; the movable feasts in a wide trailing card.
- **GivingChannels:** the transfer card beside the project card, the beneficiary line a callout inside the transfer card
  (`secondary-container`), `Copiază` the page's one filled action, Form 230 a wide card.
- **PomelnicForm:** the note that online sending is off comes first, as the first card over the band; then two name cards
  with tinted heads, then the offering chips beside the optional contact card. No submit while no endpoint is set (the dev
  server keeps its demo submit).
- **AnnouncementList / Home news:** a tinted tray with white cards, the pinned lead first with the gold bottom edge.
- **EmptyState, ErrorLayout, Alert, Badge:** a white card with the glyph in `primary`, the 404 on the slim band, tonal
  alerts without borders, a sentence-case badge.

## 7. Do's and Don'ts

Do keep every colour on the four seeds; use `secondary-strong` for any icon on a light surface; give every card its
edge; keep the name whole; keep the Pomelnice note first. Don't add a theme switch or a dark palette, a tracked-capital
label, a gold left stripe, a nested grey box inside a card, or a per-church fork of a component. Bare
`max-w-sm|md|lg|xl` collapse layouts in this theme (`packages/ui/scripts/check-max-w.mjs`).
