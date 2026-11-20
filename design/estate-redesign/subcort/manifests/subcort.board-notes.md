# The board's notes: Subcort

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Approve B, On your ground, as Subcort's direction, or take the runner-up A, Montaj, mounted? B reopens DESIGN.md sections 2, 3 and 4 (the near-white sheet, Plex Sans for language, the plate-head spine) and stays light. 2. The hero link: keep the neutral "Vezi dimensiunile și dotările" in the hero (the default), or put it back under Plate 01's list? 3. The hero lede is two sentences: keep both, word for word (the default), or end it after "climatizare"? (beside `subcort-direction`)

## Decisions

- The head card and the spec card end on the same line (ruling 2); the grid lines are about half today's contrast (1.10 on the field); the eyebrow is gone and its job moves into the Zonă cell, on the first screen (ruling 1). (beside `subcort-proposed-home-1280`)
- The title block stays a card in the plot's corner with the five facts in one row, Zonă last, as today. On phones the tent sits on its own gridded plate at the head of the spec card and the Zonă row leads the list. (beside `subcort-proposed-home-1280`)
- Each plate is a panel with a head band carrying its number, name and scale in sentence case, no tracked capitals. Plate 02's four steps are four columns split by hairlines. (beside `subcort-proposed-home-1280`)
- The exploded drawing sits beside its parts list, the same numbers in both. Under 600 px the drawing keeps numbered circles only (scaled 1.7) and the list names them. (beside `subcort-proposed-home-1280`)
- The plan keeps today's drawing (grid, footprint, ridge, dimensions, the car), drawn at 10 × 15 m, with the four sizes as a 2 × 2 picker of 48 px targets. On a phone the table folds into one block per format, so nothing scrolls sideways. (beside `subcort-proposed-corturi-1280`)
- Contact puts the head and the data card side by side on the plot, so phone, mail and address are on the first screen. The hours get their own panel with the distance note beside them. No form, no call button. (beside `subcort-proposed-contact-1280`)
- The hero tent's motion stays in the build: today's HeroScene keeps its rAF loop, IntersectionObserver, exploded state and reduced-motion path. This comp is its resting frame. No new motion is added. (beside `subcort-proposed-home-1280`)

## Reopened rules

- Recorded (DESIGN.md section 2, Light-Sheet Rule; PRODUCT.md principle 5): the sheet is near-white and stays that way. Proposed: the page ground and the hero plot are a pale sage-grey (#f0f4f0, #dfe8de), cards and panels near-white. Still light, flat and one look. (beside `subcort-direction`)
- Recorded (DESIGN.md section 3): Plex Sans for language, chosen for the comma-below ș and ț. Proposed: Commissioner, whose latin-ext file maps U+0219 and U+021B to the comma-below glyphs; Plex Mono stays for figures. (beside `subcort-direction`)
- Recorded (DESIGN.md section 4, The plate): the plate-head spine and one asymmetric rule applied everywhere. Proposed: a head band across each panel and cards on a plot. The numbered register (01, 02, 01.1) stays. (beside `subcort-direction`)
- Recorded (DESIGN.md section 2 and the Don'ts): never fill a surface with the signal orange; today's selected size is an orange chip. Proposed: the selected size is ink-filled with paper text (14.02:1), the orange stays on numbers, leaders and the current place. (beside `subcort-proposed-corturi-1280`)

## The Floor

- Round 2, scripted from scratch. Contrast 35 pairs, all pass: text min 5.07, focus ring 4.60 on the field, 5.20 on the ground; surfaces as before (card on field 1.25, panel on ground 1.10, band on paper 1.14, each with a 1 px edge of 1.53 to 1.92). Shoot: no page overflow at 1280, 1024, 768, 390 or 360; no control spills its box; no text clipped by an overflow ancestor (the table head that is hidden on phones is a screen-reader-only header, not content); no text outside its column; label-to-note gaps at most 12 px; phone targets 44 px or more; plan labels at 390 and 360 render at 13.0 px (dimensions) and 11.6 px (car), floors 12 and 11. Sloplint --scope app --render on the four Proposed twins: 0 FAIL, 0 WARN; 24b, 26b, 71, 80 and 47c waived, F19 dismissed, each with its reason. wf.py OK on all 9 files. First screens: home Zonă ends at 570 of 800 (1280), 727 of 844 (390) and 727 of 800 (360); Servicii's three descriptions end at 744, 744 and 770 at 1280 (whole above 800); the Contact address row ends at 464 at 1280 and 751 at 360. Today's 360 shot was not captured. (beside `subcort-direction`)

## Other notes

- Copy changes made for the Floor: "complet — pardoseală" is "complet: pardoseală", the contact lede's "—" is a comma, "Fig. 1 — Cort" is "Fig. 1. Cort" (gate 19, no dashes in sentences). Ranges use the figure dash U+2012 ("8‒20 m", "64‒300 m²", "40‒320", "90‒110 persoane", "09:00‒18:00", "Luni‒Vineri"), the estate's ruling for data ranges, replacing the source's en dash and the hyphen of round 1. The placeholder phone shows as "07xx xxx xxx" because gate 67 reads typed capitals; the site keeps 07XX XXX XXX. Footer legal facts are separate spans instead of dot-joined.
- Commissioner and Plex Mono load from Google Fonts here; the build self-hosts with fontsource (DESIGN.md: no Google CDN). The site has no form field, toast or popover, so none is drawn. The board's numbered markers (dark circles in the left margin, 1280 only) are not part of the design.
- Round 2 (critic, then the controller's rulings 1 to 7). Corturi phone: each format note sits 4 px under its own label with a hairline between pairs, the plan frame is 4 px and its labels are 13 px and 11.6 px, and Opționale sits on signal-soft (7.08:1) so the extras read apart from what is included. Contact phone: values and Duminică's hours are left-aligned. Page heads run the container width (title 5 columns, lede 7), which brings Servicii's three services above the fold at 1280; on phones the band bleeds to the card's edges. Panels keep the 24 px side gutter at every width. The footer's links are underlined again. Home's Plate 02 steps are numbered 01 to 04 in mono signal with no ring, so the circled 1 to 4 on home mean only the tent's parts. At 1024 the spec card is a 6-column grid (3 cells of 2, then 2 of 3), split by hairlines.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| ink on paper | 13.75 |  | 4.5 |
| ink on sheet | 12.62 |  | 4.5 |
| ink on field | 11.17 |  | 4.5 |
| ink on fill-2 (band) | 12.32 |  | 4.5 |
| ink-2 on paper | 6.38 |  | 4.5 |
| ink-2 on sheet | 5.86 |  | 4.5 |
| ink-2 on field | 5.19 |  | 4.5 |
| ink-2 on fill-2 (band) | 5.72 |  | 4.5 |
| signal on paper (numbers, current place) | 5.66 |  | 4.5 |
| signal on fill-2 (band number) | 5.07 |  | 4.5 |
| signal on sheet | 5.2 |  | 4.5 |
| signal-hover on paper (link hover) | 7.18 |  | 4.5 |
| on-signal-soft on signal-soft (banner) | 7.08 |  | 4.5 |
| paper on ink (selected size) | 13.75 |  | 4.5 |
| signal (focus ring) on paper | 5.66 |  | 3 |
| signal (focus ring) on field | 4.6 |  | 3 |
| signal (focus ring) on sheet | 5.2 |  | 3 |
| signal (focus ring) on fill-2 | 5.07 |  | 3 |
| line (tent envelope) on field | 4.35 |  | 3 |
| line (tent envelope) on paper | 5.35 |  | 3 |
| ink (tent object lines) on field | 11.17 |  | 3 |
| signal (callout rings) on paper | 5.66 |  | 3 |
| ink (link-button edge) on paper | 13.75 |  | 3 |
| edge (menu button edge) on paper | 1.89 |  | 1.3 |
| paper on field (card on plot) | 1.23 |  | 1.09 |
| paper on sheet (panel on ground) | 1.09 |  | 1.09 |
| field on sheet (plot on ground) | 1.13 |  | 1.09 |
| fill-2 on paper (band on panel) | 1.12 |  | 1.09 |
| edge on sheet (panel edge) | 1.73 |  | 1.3 |
| edge on field (card edge) | 1.53 |  | 1.3 |
| edge on paper (card edge on panel) | 1.89 |  | 1.3 |
| fill-2 on sheet (footer; parted by its 1.5 px ink top rule) | 1.02 |  | 1 |
| hair on paper (rules in a card) | 1.3 |  | 1.2 |
| hair on fill-2 (rules in the footer) | 1.16 |  | 1.1 |
| grid on field (decoration, quieted) | 1.1 |  | 1.05 |

## The runner-up

**Runner-up: A, Montaj, mounted (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today, B on your ground) and two judges compared every pair against today, in both orders, at 1280 and 390 in the site's one light look. All 12 verdicts agreed: B won 4, A 2, today 0. Today lost on structure: the header floats on one off-white sheet, sections part only by whitespace, the drawing sits small in empty space, and the hero has no next step. B won on fit and distinctiveness: the gridded field ties the page to how the business shows its tents, as measured drawings, and the spec block under the drawing reads as a drawing's title block. What A did better: one tightly aligned hero card. Say so here if you'd rather keep today's IBM Plex Sans and a grey page with white cards (A).

## The artboards on the board

- Direction · On your ground
- Home · 1280 · today
- Home · 390 · today
- Corturi · 1280 · today
- Corturi · 390 · today
- Servicii · 1280 · today
- Servicii · 390 · today
- Contact · 1280 · today
- Contact · 390 · today
- Home · 1280 · proposed
- Home · 390 · proposed
- Corturi · 1280 · proposed
- Corturi · 390 · proposed
- Servicii · 1280 · proposed
- Servicii · 390 · proposed
- Contact · 1280 · proposed
- Contact · 390 · proposed
- Runner-up A, Montaj, mounted · light 1280 (sketch)
- Runner-up A, Montaj, mounted · dark 390 (sketch)
