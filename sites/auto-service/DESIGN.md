---
name: BavAuto Gorj
description: A workshop job card on warm graphite. One light card carries the call; Encode Sans in sentence case; M red on the call alone.
colors:
  background: "#161310"
  surface: "#161310"
  surface-container-lowest: "#24211e"
  surface-container-low: "#24211e"
  surface-container: "#312d29"
  surface-container-high: "#312d29"
  surface-container-highest: "#312d29"
  surface-window: "#0f0d0b"
  on-surface: "#f2f0ec"
  on-surface-variant: "#bbb7b0"
  outline: "#736e67"
  outline-variant: "#413c38"
  outline-window: "#201c18"
  lit-window: "#fcb368"
  inverse-surface: "#ece9e4"
  inverse-on-surface: "#201c18"
  inverse-on-surface-variant: "#5a544e"
  inverse-outline-variant: "#cbc7c0"
  inverse-surface-container: "#dddad5"
  primary: "#c52525"
  primary-hover: "#ae1c1d"
  on-primary: "#fdfcf9"
  primary-bright: "#fdc9c2"
  m-blue: "#2fa7f3"
  m-indigo: "#7e74e1"
  m-red: "#ed413b"
  success: "#4fc47f"
  error: "#e97ab2"
  whatsapp: "#42b970"
  whatsapp-on-inverse: "#00773d"
typography:
  display: { fontFamily: "Encode Sans Variable", fontSize: 4rem, fontWeight: 800, lineHeight: 4.125rem, letterSpacing: -0.02em }
  heading: { fontFamily: "Encode Sans Variable", fontSize: 2.5rem, fontWeight: 800, lineHeight: 2.75rem, letterSpacing: -0.015em }
  number: { fontFamily: "Encode Sans Variable", fontSize: 1.5rem, fontWeight: 700, lineHeight: 1.75rem }
  title: { fontFamily: "Encode Sans Variable", fontSize: 1.125rem, fontWeight: 700, lineHeight: 1.625rem }
  body: { fontFamily: "Encode Sans Variable", fontSize: 1rem, fontWeight: 400, lineHeight: 1.625rem }
  label: { fontFamily: "Encode Sans Variable", fontSize: 0.875rem, fontWeight: 600, lineHeight: 1.25rem }
rounded:
  md: 4px
  lg: 8px
  full: 9999px
---

# Design System: BavAuto Gorj

## Overview

**Creative North Star: "The job card"**

The page is a workshop job card laid on a warm graphite bench. The ground is one dark look (no theme switch). Panels step up out of it one notch (`surface-container-lowest`, then `surface-container` for wells, buttons and the map placeholder), and are told apart by a 1px hairline, never by a shadow. The one light material is the card itself: a pale paper-grey surface that holds the call, WhatsApp, the three symptoms a worried owner arrives with, and the readout window. On a wide screen it is pinned at the right from the hero to the end of the services (sticky, 88px under the 64px header); on a phone it sits under the lede. The legal pages read on the same card.

The call is the only red button on the page. It sits on the card or on the ground, never on a panel. Everything else is ink, steel and hairlines. Type is one face, Encode Sans Variable, in sentence case, with no mono and no tracked capitals; only the wordmark is set uppercase, at width 125.

Two constraints from before still hold. **There is no photography, by decision**: the owner confirmed none is coming, so the workshop is drawn (`BayScene.astro`, a line elevation of a two-post lift in ink and line). And this is an **independent** BMW specialist: no roundel anywhere, a standing disclaimer in the footer, and the M tri-colour used only as a 4px stripe above the banner and the footer.

**Key Characteristics:**
- Warm graphite ground, panels one step up, hairlines instead of shadows
- One light card, pinned on a wide screen, inline on a phone, carrying the one red call
- Services as an index of hairline rows with a pictogram well, a title, a subtitle and the description, never a card grid
- One face, one weight ladder (400, 600, 700, 800), six sizes
- The M stripe is the only tri-colour; the other tokens are quiet
- One closed 1.75-stroke pictogram set; no icon library, no emoji
- Everything readable before scripts run; two small scripts add the open-now dot and the phone call bar

## Colors

All values are in `src/styles/global.css` (`@theme`), from the board's token sheet.

- **Ground and panels:** `background` and `surface` `#161310`; `surface-container-lowest` and `-low` `#24211e` (the default panel: header, trust table, indexes, about and contact panels, footer); `surface-container`, `-high` and `-highest` `#312d29` (wells, steel buttons, the map placeholder); `surface-window` `#0f0d0b` (the readout window).
- **Ink:** `on-surface` `#f2f0ec`, `on-surface-variant` `#bbb7b0` for secondary text, `outline` `#736e67` for control edges, `outline-variant` `#413c38` for panel edges and row hairlines.
- **The card:** `inverse-surface` `#ece9e4`, `inverse-on-surface` `#201c18`, `inverse-on-surface-variant` `#5a544e`, `inverse-outline-variant` `#cbc7c0` for hairlines inside it, `inverse-surface-container` `#dddad5` for hover on the card only.
- **The call:** `primary` `#c52525`, `primary-hover` `#ae1c1d`, `on-primary` `#fdfcf9`. `primary-bright` `#fdc9c2` is the focus ring on dark; on the card the ring is `inverse-on-surface`.
- **The window:** `lit-window` `#fcb368` is the one amber, for the hours in the readout window, with no glow.
- **M tri-colour:** `m-blue` `#2fa7f3`, `m-indigo` `#7e74e1`, `m-red` `#ed413b`, in that order, in the stripe only.
- **Status and vendor:** `success` `#4fc47f` (the open-now dot), `error` `#e97ab2` (always with an icon and words), `whatsapp` `#42b970` on dark and `whatsapp-on-inverse` `#00773d` on the card, as a mark and never as text.

### Named Rules

**The One-Card Rule.** The card is the page's one light material. A second light surface is one too many; the legal pages read on the card as well.

**The One-Red Rule.** M red fills the call and nothing else: no link, no focus ring, no accent.

**The One-Amber Rule.** Amber lights the hours in the readout window and nowhere else.

**The One-Set Rule.** One closed pictogram set, drawn on a 24px box at a 1.75px stroke, round caps and joins, no fill. WhatsApp, Facebook and Instagram are the only filled marks.

## Typography

One face: **Encode Sans Variable** (`@fontsource-variable/encode-sans` 5.3.0, latin and latin-ext for ă â î ș ț, self-hosted, never a CDN). Its width axis is used once, for the wordmark at 125.

| Token | Size / line | Weight | Used for |
|---|---|---|---|
| `display` | 64 / 66 (40 / 44 on a phone, 34 / 38 under 380px) | 800 | the home h1 |
| `heading` | 40 / 44 (30 / 34 on a phone) | 800 | section headings |
| `number` | 24 / 28 | 700 | the card's number, the drawer's links |
| `title` | 18 / 26 | 700 | lede, row titles |
| `body` | 16 / 26 | 400 | running text |
| `label` | 14 / 20 | 600 | labels, readouts, never tracked |

Tabular figures are on everywhere. No figure is set in mono.

## Layout

- Container 1240px, 36px side padding (20px on a phone). Sections are 96px apart (64px on a phone).
- The header is a sticky 64px band with a hairline foot; its phone link is on screen at every scroll position. Header, pinned card and phone call bar all switch at 960px.
- Home and Servicii use a two-column grid (the page, 400px for the card). The card is `position: sticky; top: 88px` and fits 800px and 768px tall screens. Despre and Contact have no card.
- Contact's call sits on the ground, with the details on a panel and the map placeholder beside it.
- The trust table has a 160px label column at 1280, and the label over the title under 1200px. No note is shortened.

## Elevation & Depth

Depth is tone and hairline, not shadow. The one shadow is `--shadow-card` (`0 16px 40px -16px rgb(0 0 0 / 0.6)`), on the card. Everything else is flat.

## Shapes

Three radii: 4px for controls and wells, 8px for the card and panels, full for dots.

## Components

### The job card
The call (72px tall, 64 on a phone, the label over the number at 24px), a WhatsApp outline button (48px), a divider, "Spune-ne ce are mașina" and three full-width symptom rows of equal height (52px at 1280, 48 at 390) with the WhatsApp mark at the end, each opening WhatsApp with its message already written, then the readout window. On a phone the window is the card's head.

### The readout window
A near-black inset (`surface-window`, 1px `outline-window`) from the old instrument cluster, the one cue that survives. Line 1: a green dot, "Deschis acum" and the town; line 2: the hours in `lit-window`. A few lines of script in `Base.astro` add the dot and the words only inside the opening hours, read in the Europe/Bucharest zone from `site.hours`. Out of hours or with scripts off, line 1 keeps the town.

### Buttons
Controls are 4px radius with a 1px `outline` edge. **Call:** `primary` fill, `on-primary` label, hover `primary-hover`. **Steel:** `surface-container` fill. **Outline:** transparent. On the card the WhatsApp button is an outline in card ink with the mark in `whatsapp-on-inverse`.

### The phone call bar
A fixed bar on the ground with the call and a WhatsApp square. Without scripts it stays visible; a script shows it once the card's call has left the view and hides it while a page's own call (the contact block) is in view, so a first screen never shows two red calls.

### Index and tables
The services index, the trust table, the reasons list and the FAQ are rows divided by hairlines inside one panel, with a 44px pictogram well where a row has an icon. "Cum lucrăm" keeps its step nodes and a grey hairline over each short result. The record line on Despre is three cells with a divider.

### Navigation
A sticky band, the uppercase wordmark at width 125, text links (the current one underlined by a 2px rule), and a phone link as an outlined control. Under 960px a menu button opens the Drawer: the wordmark and an X, four 56px links at `number` size, the call and WhatsApp. It is full screen, closes on Esc, a swipe up or the X, and gives focus back to its button.

### Focus
A 2px `primary-bright` outline at 2px offset on dark, `inverse-on-surface` on the card. Never removed.

### Motion
Nothing loops and nothing large moves. The only transitions are the drawer's fade and the links' rise, both behind `motion-safe`; smooth scrolling is off under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep the call the page's only red button, on the card or the ground.
- **Do** separate regions with a 1px hairline rather than a gap, a card edge or a shadow.
- **Do** write ranges with the figure dash and no spaces (`08:00‒18:00`, `Luni‒Vineri`) and avoid em dashes in copy.
- **Do** draw any new symbol into `Icon.astro` on the same 24px box at the same 1.75 stroke.
- **Do** keep the M stripe in its blue, indigo, red order.
- **Do** ship every surface readable before scripts run.

### Don't:
- **Don't** add a second light surface, or a theme switch.
- **Don't** set anything in mono or in tracked capitals, and don't put amber anywhere but the window.
- **Don't** rebuild the services as a grid of icon cards.
- **Don't** add photography or stock imagery; there is none by decision.
- **Don't** import an icon library or use an emoji.
- **Don't** load fonts from a CDN.
- **Don't** ship a BMW roundel or any manufacturer mark. This is an independent specialist.
