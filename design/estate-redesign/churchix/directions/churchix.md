# churchix (the parish template): two directions

Written 2026-11-13 by the art director. Repo: churchix, brief 05. Shown with its one parish, `apps/parohia-harlesti-bacau`.

**One look, no dark.** Parish sites keep the one look designed for each church, with no theme switch and no dark palette (owner, 2026-11-10, Q18; brief 05, "Interplay"). This overrides the usual dark renders. The sketch has one `.theme-light` class and no `theme` tweak. Render `light-1280.png`, `light-1280-full.png`, `light-390.png` and `light-390-full.png`, and make no dark files. The judges compare light at 1280 and **light at 390**.

**Recorded calls both directions keep:**
- Cardo headings (owner, 2026-11-04, `wiki/decisions.md`). Inter stays the body face: it is today's, and the parish's own `fontBody` seed pins it.
- The four-seed contract: `primary`, `secondary`, `surface` and `onPrimary` in `site.json` `brand`, with every other role derived by `color-mix()`. No new seed (brief 05, decision 1), and the parish's seeds unchanged.
- Gold is never text on light, and the focus ring is burgundy on light (DESIGN.md). The template ships no photos (decision 4). The phone menu is the Base UI Drawer (brief 04). Romanian keeps ă â î ș ț, in a formal tone.

## 1. Today's strengths (keep all of them)

1. **The schedule is the hero's subject.** At 1280 the first screen shows the next service and a raised `Săptămâna aceasta` card with every weekly row (day, time, service), with Sunday marked.
2. **A familiar header.** Logo and wordmark on the left, six places with the current one marked, and `Donează` as the one filled pill. It is its own sticky band, with an edge under it.
3. **The first screen gives both main jobs a visible action.** Giving gets the filled button, the schedule the lighter second one.
4. **Raised white cards on the cream.** The pinned announcement leads, wider, with its `Fixat` badge and a gold bottom edge.
5. **One strong change of surface.** A full-width burgundy band groups the parish facts (hram, eparchy, Liturgy) as label and value rows.
6. **The footer repeats the address and the IBAN,** so the giving details are on every page.
7. **It reads as Orthodox and dignified.** Cardo, cream, burgundy and sparing gold, and a parish re-skins from four seeds.

**Faults both directions fix:**
- At 390, the header cuts the wordmark to `Parohia …`, an ellipsis on content.
- At 390, the week card sits below the first screen, under a 250 px empty picture panel.
- At 1280, the name runs five lines at 72 px.
- Floor 9: tracked capitals on the nav, buttons, eyebrows, `Fixat` and the labels. The source strings are sentence case; CSS adds the capitals.
- Floor 10: middle-dot strings (`Vecernia · Sâmbătă 17:00`, `Sfinții Trei Ierarhi · 30 ianuarie`), and arrows glued to five links.
- The gold left stripe on the next service, which DESIGN.md bans.
- Card edges at 30-40 % alpha.
- The second news card stretches into an empty box.
- The hero's two radial washes.

## 2. The main screen

The home page, `/`. Today's shots: `light-1280-home.png` and `light-390-home.png`, plus `light-1280-home-full.png` (1280 × 2054) and `light-390-home-full.png` (390 × 3198).

**The sketch covers the whole home page,** all six blocks, header to footer. The judges see the first screen at 1280 × 800 and 390 × 844, and the full pages go to the critic.

## 3. The content fixture

Word for word from the shot and the parish's content, in source case.

**Size.** A header: 6 places, 1 action. A hero: the name, 1 line, the next service in 3 parts, 2 actions and the picture slot. A week card of 2 rows, and 2 news cards. Despre, with 3 facts. A footer: 3 columns, 4 links, 1 IBAN.

Add no rows, news, numbers or phone.

**Header.** The parish's `logo.svg` (a `primary` disc with a three-bar cross in `secondary`), drawn from the tokens. The wordmark `Parohia Hârlești`. Places `Acasă` (current), `Despre`, `Program`, `Anunțuri`, `Pomelnice`, `Contact`, and the action `Donează`. The phone menu button: `aria-label` `Deschide meniul`, drawer title `Meniu`.

**Hero.** `<h1>` `Parohia Ortodoxă „Sfinții Trei Ierarhi” – Hârlești`. Under it, `Biserica Ortodoxă Română`: today's eyebrow, which Floor 9 bans. The next service, pinned (today it is computed from the build day): `Următoarea slujbă`, then `Vecernia`, `Sâmbătă` and `17:00` as separate parts. Actions `Sprijinește parohia` (`/donatii`) and `Vezi programul` (`/program`). **Picture slot.** The parish has no photo (no `ogImage`), so draw the direction's own no-photo state with the filled church glyph. No stock photo, no caption.

**Week card.** `Săptămâna aceasta`, with the link `Programul complet` (`/program`). Rows `Sâm` `17:00` `Vecernia` and `Dum` `09:30` `Sfânta Liturghie`; Sunday carries the church glyph. `Vezi programul` and `Programul complet` both go to `/program`. A direction may drop one, and must say which.

**Anunțuri.** `Anunțuri`, with `Din viața parohiei` under it, and the link `Vezi toate`. The lead card, pinned: badge `Fixat` with a pin; title `Hramul bisericii — Sfinții Trei Ierarhi`; text `Vă invităm la sărbătoarea hramului bisericii noastre, pe 30 ianuarie, cu Sfânta Liturghie.`; link `Citește`. The second card: a calendar icon and `23 feb. 2026`, then `Programul slujbelor din Postul Mare`. No summary, as today, and the card sizes to its content.

**Despre.** `Despre parohia noastră` heads the facts card. Heading `Un spațiu al păcii și al regăsirii`. Paragraph `Biserica „Sfinții Trei Ierarhi” din satul Hârlești, comuna Filipești, județul Bacău`. Link `Citește istoricul`. Facts: `Hram`: `Sfinții Trei Ierarhi`, then `30 ianuarie` on its own line; `Eparhie`: `Arhiepiscopia Romanului și Bacăului`; `Sfânta Liturghie`: `Duminica, ora 09:30`.

**Footer.** The wordmark, the paragraph, then `© 2026 Parohia Ortodoxă „Sfinții Trei Ierarhi” – Hârlești.` and `Toate drepturile rezervate.` `Navigare`: `IBAN Donații`, `Contact Preot`, `Termeni și Condiții`, `Politică de Confidențialitate`. `Contact`: `Sat Hârlești, comuna Filipești`, `jud. Bacău, România`. `Donații prin transfer`: `Cont curent` `(RON)` and `RO00 XXXX 0000 0000 0000 0000`. This is the placeholder IBAN: keep it exactly. No phone and no email: both are empty in the content.

**Copy B reuses (existing strings only).** The giving card: `Donații prin transfer`, `Cont curent (RON)` and the IBAN from the footer, `Copiază` (the `CopyIban` button's label on `/donatii`) and `Sprijinește parohia`. The bottom bar: `Acasă`, `Program`, `Pomelnice`, `Donează`, `Meniu`.

**Second seed set.** One extra render, `seed2-1280.png`, for the critic, not the judges. Same content, with seeds `primary` `#1f3f66`, `secondary` `#a8b0b8`, `surface` `#f5f6f4`, `onPrimary` `#ffffff`. Write the roles as the `color-mix()` derivations below, so only the seeds change.

**Font check.** `Hârlești`, `Sfinții`, `Bacăului` and `Sâmbătă` must render ș and ț as comma-below glyphs from Cardo and from Inter, not from a fallback.

## 4. Palette (both directions, light only, derived from the four seeds)

| Role (the app's token) | Derivation | Parish | Seed 2 |
|---|---|---|---|
| ground `surface`, `background` | seed | `#faf6ef` | `#f5f6f4` |
| card, header `surface-container-lowest` | fixed | `#ffffff` | `#ffffff` |
| edge `outline-variant` (full strength on every card and the header) | primary 18 % into surface | `#e0cfcc` | `#ced5da` |
| field and outline-button edge `outline` | on-surface 50 % into surface | `#8d8682` | `#868888` |
| tray `surface-container` (B) | surface 93 % with primary | `#f0e7e1` | `#e6e9ea` |
| footer `surface-container-high` | surface 90 % with black | `#e1ddd7` | `#dddddc` |
| ink `on-surface` | primary 12 % into `#161412` | `#201515` | `#17191c` |
| muted `on-surface-variant` | primary 22 % into `#5b5552` | `#5f4949` | `#4e5056` |
| action and band `primary` / `on-primary` | seeds | `#6b1f2a` / `#ffffff` | `#1f3f66` / `#ffffff` |
| hover and B's arch fill `primary-container` (now darker) | primary 80 % with black | `#561922` | `#193252` |
| muted on band `on-primary-variant` (new name, no seed) | on-primary 80 % with primary | `#e1d2d4` | `#d2d9e0` |
| gold `secondary` (rules, frames, underline, decorative icons only) | seed | `#c8a24b` | `#a8b0b8` |
| light gold on band `secondary-fixed` | secondary 25 % into white | `#f1e8d2` | `#e9ebed` |
| badge `secondary-container` / `on-secondary-container` | secondary 30 % into white / black | `#efe3c9` / `#3c3117` | `#e5e7ea` / `#323537` |
| Sunday row `surface-highlight` (new name, no seed) | secondary 16 % into white | `#f6f0e2` | `#f1f2f4` |

**Pre-checked contrast, parish / seed 2.** Re-run `contrast.mjs` on the final values.
- **Text:** ink on ground: 16.5 / 16.3; muted on a card: 8.28 / 8.06; on ground: 7.69 / 7.43; on the tray: 6.79 / 6.60; primary on a card: 11.3 / 10.7; white on the band: 11.3 / 10.7; band muted: 7.75 / 7.52; light gold on the band: 9.28 / 8.96; badge ink: 10.0 / 9.97.
- **UI:** outline on ground: 3.32 / 3.29; on a card: 3.58 / 3.56; gold on the band: 4.70 / 4.88; focus, 2 px with a 2 px offset: `primary` on light, 10.5; `on-primary` on the band, 11.3.
- **Surfaces:** a card on ground is **1.08 / 1.08**, so the edge is required (edge on ground: 1.40 / 1.37); a card on the tray: 1.22 / 1.22; the tray on ground: 1.13 / 1.13; the footer on ground: 1.26 / 1.25; A's facts-card edge (`on-primary` 20 % into primary) on the band: 1.74 / 1.79; B's arch fill on the band: only 1.19 / 1.21, so the gold line around the arch carries the boundary (4.70 / 4.88).

## 5. Directions

### A. Iconostasis, restored (Evolve today)
- **Idea:** today's page with its frame restored. The name is sized to leave room for the service, the next service gets its own raised card, labels go sentence case, and on a phone the schedule comes before the picture.
- **Header:** a 72 px white band with the edge under it. Logo at 36, then the wordmark. Places centred at 16/24 in 500, muted. The current one is `primary` at 600 with a 2 px gold underline. `Donează` as a 44 px filled pill.
- **Hero:** on the ground, in a 1200 container. The rail runs in the left gutter at 840 and up: a 1 px gold rule with one diamond level with each section heading. **Left (6 of 12 columns):** the `<h1>` at 48/56, balanced, 3 lines at most; `Biserica Ortodoxă Română` at 18/28, muted; the next-service card: white, with the edge, radius 12, shadow-sm and a 2 px gold bottom edge. Inside: the clock in a sunk circle, `Următoarea slujbă` at 14/20 600, `Vecernia` in Cardo 32/40 `primary`, then `Sâmbătă` and `17:00` (tabular, 600) at 18/28; two 48 px actions: one filled, one outlined in 1 px `primary`. **Right (6 columns):** today's framed slot, fixed at 16:10, with a gold 1 px frame 6 px outside it. With no photo, it shows a `primary` panel with the glyph; under it, the week card. Its head row holds the title at 16/24 600 and the link. Then 56 px rows: the day at 14/20 600 muted, the time at 18/28 tabular `primary`, the service at 16/24. Sunday sits on `surface-highlight` with a gold glyph.
- **Anunțuri:** the heading in Cardo 32/40, with `Din viața parohiei` under it and `Vezi toate` on the right; a 7/5 grid. The lead card has 32 px padding, the gold bottom edge and its title in Cardo 24/32. The second card is top-aligned, never stretched.
- **Despre:** the full-bleed `primary` band stays. The heading is in Cardo 32/40, the paragraph in `on-primary-variant`, and the link in light gold, underlined. Beside them sits the facts card, with the 20 % edge and gold icons.
- **Footer:** on `surface-container-high` with a top edge; 3 columns, with headings at 16/24 600.
- **390:** **Header, 64 px:** logo at 32, the wordmark in Cardo 20/24 (it wraps, never an ellipsis), the `Donează` pill and a 48 px menu button for the Drawer. **Order:** the name at 32/38, the line, the next-service card, the week card, both actions full width, then the picture at 16:10. No rail.
- **Type:** Cardo 700 at 48, 32 and 24; Inter at 18, 16 and 14.
- **Shape:** radii: 8 for controls, 12 for cards, 16 for the frame, full for pills; shadow-sm: `0 1px 2px`, ink at 6 %; hover: `0 4px 10px`, ink at 8 %.
- **Signature:** the liturgical rail, given a job. Its diamonds mark the section heads instead of sitting evenly spaced.
- **Another parish:** the name wraps balanced and is never cut: 70 characters fit in 4 lines; the photo fills the 16:10 frame (`object-fit: cover`), and the `primary` panel stands in without one; colours come from the seeds only; the week card holds 0 rows (`EmptyState`) to 10 without scrolling inside.
- **Reference:** `starbucks`, for one move: a warm canvas, one deep brand band in the page's rhythm, and gold kept for ceremony. Nothing of its palette or type.
- **Reopens:** nothing.

### B. The porch notice
- **Idea:** the page opens the way a church door does. The parish's name and picture sit on a burgundy band across the top. The program is pinned on a raised board that rises out of the band, with the account beside it. The service, the giving and the proof that this is the real parish all share the first screen.
- **Skeleton:** a band and then a board, stacked top to bottom, where today splits the hero left and right. The header is A's at 840 and up.
- **Name band:** full-bleed `primary`, 48 px top padding, its bottom 64 px behind the board. **Left (8 of 12 columns):** the `<h1>` in Cardo 40/48 `on-primary` (2 lines at 1280), then `Biserica Ortodoxă Română` at 18/28 in `on-primary-variant`. **Right:** the arched window, 200 × 240. The picture sits under a round arch (full radius at the top, 12 at the foot), with a 1 px gold line 6 px outside it that follows the arch. With no photo: `primary-container` with the glyph in light gold.
- **Board row:** pulled up over the band's edge. White, radius 16, the edge, and a shadow of `0 4px 12px` at 10 % ink. **Program board (8 columns):** two halves split by a hairline. Left: `Următoarea slujbă` at 16/24 600, muted; `Vecernia` in Cardo 40/48 `primary`; `Sâmbătă` at 18/28; and `17:00` in Inter 40/48 600, tabular, `primary`. Right: `Săptămâna aceasta`, A's rows, and `Programul complet` at the foot. B drops `Vezi programul`: the board is the program. **Giving card (4 columns):** the gold bank icon and `Donații prin transfer`; `Cont curent (RON)`; the IBAN at 18/28 600, tabular; a ghost `Copiază` button; `Sprijinește parohia`, filled, full width, 48 px.
- **Anunțuri:** as in A, but on a full-width `surface-container` tray with 56 px padding, the cards white.
- **Despre:** on the ground, with no second band. On the left, the heading in Cardo 28/36 `primary`, the paragraph and `Citește istoricul`; on the right, the white facts card.
- **Footer:** A's.
- **390:** **Header, 56 px:** the logo and the wordmark only. **Band:** the name at 28/34, 5 lines at most, beside a 96 × 116 arch. **Board:** pulled up 32 px, in one column: the next service, a hairline, the week, then `Programul complet`. Then the giving card, the tray, Despre and the footer. **Bottom bar:** 64 px plus the gesture inset, icon over label at 14/20: `Acasă` (current), `Program`, `Pomelnice`, `Donează` and `Meniu`. `Meniu` opens brief 04's Drawer with the rest. Pad the page by the bar's height. B is not comercial-website's filter band, not sports-app's Up first split, and not ward-auth's hung panels.
- **Type:** Cardo 700 at 40, 28 and 22; Inter at 18, 16 and 14, plus 40 at 600 for the time.
- **Shape:** radii: 8 for controls, 16 for cards, the arch, full for pills; two shadows: the board row's, and shadow-sm on the news cards.
- **Signature:** the arched window. Any parish's photo, or the fallback, is cropped under a round arch traced in gold, set in the band beside the name.
- **Another parish:** the name wraps balanced: 70 characters fit in 3 lines at 1280; the photo fills the 5:6 arch (`object-fit: cover`); the band is the parish's own primary, so a blue parish gets a blue door; colours come from the seeds only; the board holds 0 to 10 rows.
- **Reference:** `wise`, for one move: a tinted hero band that hosts the working card (its converter) as the hero's subject. Nothing of its lime, pills or type.
- **Reopens:** phone navigation: today it is the Drawer alone; B adds a bottom bar and keeps the Drawer for the overflow; the hero's split, the rail and the burgundy Despre band, all from the 2026-06-18 redesign (`wiki/design-system.md`); strength 3, in form only: give and the schedule stay on the first screen, but in two islands, not side by side under the name.

## 6. Owner questions

1. Which direction?
2. B gives parish phones a bottom bar of five places (`Acasă`, `Program`, `Pomelnice`, `Donează`, `Meniu`), with brief 04's Drawer behind `Meniu`, and it retires the liturgical rail for the arched window. Do parish phones get visible places, or only the menu?
3. The footer links `Termeni și Condiții` and `Politică de Confidențialitate` lead to pages the parish app doesn't have (they 404 today). Should the template add those pages, or drop the links?

Notes for the board, not questions:
- Both directions set the strings in sentence case, split the middle-dot strings and drop the glued arrows.
- `primary-container` turns darker for hover.
- `on-primary-variant` and `surface-highlight` are new derived names, with no new seed.

## 7. Registry lines

| churchix (A) | Iconostasis, restored | Cardo (today's; owner 2026-11-04) | Inter (today's; the parish's `fontBody` seed) | the parish's seeds: burgundy `#6b1f2a` action (OKLCH hue 16, L 0.36; today's, 11° from auto-service B's brighter M red), gold `#c8a24b` only in rules and frames (hue 86, today's, near lantern's amber) | white 72 px header band with six places and Donează; split hero: name, next-service card and two actions left, the framed picture over the week card right; the rail in the gutter; a 7/5 news row; a burgundy Despre band with a facts card; phone: header with Donează and the Drawer, the schedule before the picture |
| churchix (B) | The porch notice | Cardo (today's) | Inter (today's) | the parish's seeds (burgundy and gold, today's, as A); burgundy as a full-width name band, gold only on the arch and rules | white header band; a burgundy name band with an arched picture; a raised program board (next service and week) and a giving card pulled up over its edge; news on a tray band; Despre text beside a facts card; phone: band, board, giving card, a bottom bar of five places |
