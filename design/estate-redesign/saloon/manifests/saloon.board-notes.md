# The board's notes: Saloon

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Reopened: the phone booking bar. DESIGN.md has it wait for the hero to scroll away and hold WhatsApp only; here it is docked from the first paint, adds a round call button and the hero's own button goes on phones. Accept? 2. Approve Menu beside the work (prices beside the photo on the first screen) as Saloon's direction, or take the runner-up, Daylight studio (today's order, refined into islands)? 3. Ana's "3+ ani de experiență" is a placeholder in site.ts, so the facts pair is not drawn until the real number is set. Confirm Ana's number, or keep the pair hidden? (beside `saloon-direction`)

## Decisions

- Air under the header (28 px) and between the headline, the sentence and the green button, so the page opens calm; the headline runs on one line [A's strength, judge ruling 1]. The sentence breaks so WhatsApp. never orphans. (beside `saloon-proposed-home-1280`)
- The Services menu sits beside the photo, so what the work looks like, what it costs and how to book are all on the first screen. This is DESIGN.md's real-element exception: the section moved up into the hero. Each row has its own pre-filled Programează. (beside `saloon-proposed-home-1280`)
- Ana's island sits on a band, mirrored: text left, portrait right. The gold rule and the signature stay. The facts pair (3+ ani, 1 la 1) is not drawn until Ana's number is real. (beside `saloon-proposed-home-1280`)
- Hygiene keeps its numbered protocol but as one raised card with ruled rows, on the ground between two bands, so neighbours separate. Vezi serviciile is gone: the list starts right there on the first screen. (beside `saloon-proposed-home-1280`)
- On a phone the photo is short (about 180 px at 390 and 144 at 360) so the first price row clears the dock on first load. Under 380 px the gutters drop to 16. (beside `saloon-proposed-home-first-390`)
- Fraunces and Manrope are today's faces, loaded from Google Fonts here; the build keeps Fontsource. The site has no form field, no toast and no popover, so none is drawn. (beside `saloon-direction`)

## Reopened rules

- Recorded (DESIGN.md, MobileBookingBar): the bar waits for the hero to scroll away and holds WhatsApp only. Proposed: docked from the first paint, WhatsApp plus a round call button, and no in-hero button on phones; it still hides while Programează-te or Unde mă găsești is on screen. (beside `saloon-proposed-home-first-390`)
- Recorded (DESIGN.md, Typography): buttons, nav, subtitles and the Bun de știut label are tracked capitals, and the arrow is a glued →. Proposed: sentence case, untracked, and an arrow icon 6 px after the words (Hallmark Floor 9, 10 and gate 67). The words are unchanged. (beside `saloon-direction`)
- Recorded (DESIGN.md, Interaction): the focus ring is gold, 2.14:1 on today's ground. Proposed: gold-ink at 2 px with a 3 px offset, 4.9:1 on the ground. Still gold, which is the gold's real job. (beside `saloon-direction`)

## The Floor

- Contrast is scripted over 46 pairs, all AA: text min 4.88 (rose-brown on the band, it appears on card in the comps), 3.84 on the large picture labels, focus ring 4.47 to 11.52, call-button edge 3.41 to 4.43. Surfaces: card 1.17 on ground with a 1.4 edge and shadow, band 1.11, card on band 1.30. No sideways overflow at 1280, 1024, 768, 390 or 360, and no control spills its box; phone targets are 44 px or more (dock 52). First screen at 1280x800: all three prices whole, the last row ends at y 796. At 390x844 and 360x800 the first price row, Programează included, ends at y 753 and 711, above the dock (top 771 and 727). A clip check (every text box inside every overflow-hidden ancestor) passes at 1280, 1024, 768, 390 and 360; the Nail Art price wraps whole, never cut. Sloplint --scope app gives 0 FAIL, 0 WARN on the four Proposed twins; 24b, 26b, 38ii and 72 are waived with reasons. The direction sheet shows the phone Drawer and the states strip. (beside `saloon-direction`)

## Other notes

- Round 2: the price line wraps (/ unghie drops under the title on phones); from 761 px the header keeps the WhatsApp pill and the photo is 240 px; the header is 68 px at 1280 with more air above the card, and the h1 uses optical size 96 on desktop; the FAQ is one raised card and its help card has the shadow; Unde mă găsești balances its columns; anchors carry scroll-padding (header + 16), and the phone Servicii landing opens on the card.
- Services now live in the hero, so /#servicii lands on the menu card under the sticky header. This screen shows that landing view and the next section, with no second list lower down. Galerie and Programări are drawn the same way, as the landing views of their anchors.
- No dock here: it hides while Programează-te or Unde mă găsești is on screen, as today.
- Notice band: in flow and pale gold (7.3:1), no dot; the header is sticky. Copy is word for word. Three separators were dropped from the visible text so they do not read as dot-joined lines (Hallmark 63): Răspund cel mai repede aici, Sună-mă and the legal strip. The placeholder phone shows as 07xx xxx xxx here only because gate 67 reads typed capitals; site.ts keeps 07XX XXX XXX and the real number is digits.
- Picture slots are today's placeholder gradients with their labels (Hero photo, Portret Ana, Galerie 1 to 6). The footer stays dark, as today, and keeps its legal strip at 14 px. Testimonials stay parked.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| ink on ground | 14.31 |  | 4.5 |
| ink on band | 12.95 |  | 4.5 |
| ink on card | 16.8 |  | 4.5 |
| ink on blush | 12.56 |  | 4.5 |
| muted ink on ground | 7.83 |  | 4.5 |
| muted ink on band | 7.09 |  | 4.5 |
| muted ink on card | 9.19 |  | 4.5 |
| muted ink on blush | 6.87 |  | 4.5 |
| muted ink on well | 7.2 |  | 4.5 |
| primary (signature, figures) on card | 6.33 |  | 4.5 |
| primary on ground | 5.39 |  | 4.5 |
| primary on band | 4.88 |  | 4.5 |
| gold-ink (prices, numerals) on card | 5.79 |  | 4.5 |
| gold-ink on ground | 4.94 |  | 4.5 |
| secondary (subtitles) on card | 6.81 |  | 4.5 |
| secondary on ground | 5.8 |  | 4.5 |
| white on whatsapp | 4.91 |  | 4.5 |
| white on whatsapp-deep (hover) | 5.33 |  | 4.5 |
| on-secondary-container on notice | 7.3 |  | 4.5 |
| on-primary-container on blush | 6.23 |  | 4.5 |
| white on primary (loyalty button) | 6.33 |  | 4.5 |
| ink on blush-deep (header pill hover) | 8.49 |  | 4.5 |
| inverse text on footer | 11.52 |  | 4.5 |
| inverse muted on footer | 8.33 |  | 4.5 |
| picture label (ink 58%) on blush, large text | 3.84 |  | 3 |
| picture label (ink 58%) on blush-deep, large text | 3.3 |  | 3 |
| picture label (ink 58%) on well, large text | 3.9 |  | 3 |
| focus ring gold-ink on ground | 4.94 |  | 3 |
| focus ring gold-ink on card | 5.79 |  | 3 |
| focus ring gold-ink on band | 4.47 |  | 3 |
| focus ring on footer (inverse-on-surface) | 11.52 |  | 3 |
| control edge (outline) on card, call button | 4.43 |  | 3 |
| control edge on ground | 3.77 |  | 3 |
| control edge on band | 3.41 |  | 3 |
| whatsapp fill on ground (UI part) | 4.19 |  | 3 |
| whatsapp fill on card (dock) | 4.91 |  | 3 |
| primary icon (FAQ plus) on card | 6.33 |  | 3 |
| SURFACE card on ground | 1.17 |  | 1.09 |
| SURFACE band on ground | 1.11 |  | 1.09 |
| SURFACE card on band | 1.3 |  | 1.09 |
| SURFACE blush on ground (loyalty, menu head on card) | 1.14 |  | 1.09 |
| SURFACE blush head on card | 1.34 |  | 1.09 |
| SURFACE picture well on ground | 1.09 |  | 1.09 |
| SURFACE footer on ground | 10.9 |  | 1.09 |
| EDGE outline-variant on ground | 1.4 |  | 1.3 |
| EDGE outline-variant on card | 1.64 |  | 1.3 |

## The runner-up

**Runner-up: A, Daylight studio (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today, B the menu beside the work) and two judges compared every pair against today, in both orders, at 1280 and 390 in the site's one light look. All 12 verdicts agreed: B won 4, A 2, today 0. Today lost on structure (the header sits on the hero's own sheet) and its high-contrast display face lost the crossbar of its e. B won because it does the screen's job on the first screen: every service with its price and a book link in a ruled menu card, and on the phone a docked WhatsApp-and-call bar. What A did better: a calmer, better-spaced hero. Say so here if you'd rather keep today's order with the prices further down (A).

## The artboards on the board

- Direction · Menu beside the work
- Home, first screen · 1280 · light · today
- Home, first screen · 390 · light · today
- Servicii · 1280 · light · today
- Servicii · 390 · light · today
- Galerie · 1280 · light · today
- Galerie · 390 · light · today
- Programări · 1280 · light · today
- Programări · 390 · light · today
- Home · 1280 · light · proposed
- Home · 390 · light · proposed
- Servicii · 1280 · light · proposed
- Servicii · 390 · light · proposed
- Galerie · 1280 · light · proposed
- Galerie · 390 · light · proposed
- Programări · 1280 · light · proposed
- Programări · 390 · light · proposed
- Home · 390 · first paint with the dock · proposed (fixed 390 x 844 frame, not a fluid page; the dock is docked from the first paint)
- Runner-up A, Daylight studio · light 1280 (sketch)
- Runner-up A, Daylight studio · dark 390 (sketch)
