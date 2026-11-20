# The board's notes: AXA Tractări

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Approve Lines first as the direction? It reopens two recorded calls: DESIGN.md's full-bleed hero (the 3D scene fills the opening viewport) and PRODUCT.md's one continuous night road (each section a stop on one drive). The scene moves to Cum funcționează, the spine goes, and the call board opens the page. 2. responseMinutes: 30 sits in site.ts "for the animated counter" and is shown nowhere; show it as a promise to a stranded driver, or delete it? 3. This design has 9 tel: links (header 1, board 3, Servicii 1, footer 3, dock 1), where brief 08's acceptance asks for 10 because the hero call merged into the board: change that line to 9? (beside `tractari-direction`)

## Decisions

- Hours and area stand before the headline in one plain sentence-case line, "Non-stop 24/7, Oltenia" (ruling 4; today's kicker was tracked capitals with a dot). (beside `tractari-proposed-home-1280`)
- One observer watches the dispatcher plate (a tighter trigger than "the card" in RESULT ruling 2, same intent). While the plate is on screen the header call is an outline, so the first screen has one orange call. Once it leaves, the header call fills orange (Servicii, Acoperire and the scrolled frame draw it filled) and, on a phone, the dock appears. The header call is kept from 761 px up, between the wordmark and the burger; the dock is phone-only (760 and below). (beside `tractari-proposed-home-1280`)
- The dispatcher's plate is the hero's call and Contact's dispatcher as one control. Its name, "sună acum" and number are near-black on orange (6.20:1), not today's white at 3.02:1 (ruling 1). The two backup lines are tone-only cells inside the board. (beside `tractari-proposed-home-1280`)
- "Ce facem" is a text link under the paragraph, not a button at the edge (ruling 3); on a phone it sits inline at the end of the lede, 44 px tall, which wins back 40 px. The hero's only button-weight action is the call. (beside `tractari-proposed-home-1280`)
- The 3D scene lives here, in Cum funcționează, as today's reduced-motion backdrop (the build mounts the canvas over it); the head sits at the plate's lower left, 24 px above the three steps on a raised strip that overlaps the plate's foot; the plate's gradient and scrim end on the ground colour, so with the scene off there is no black hole. (beside `tractari-proposed-home-1280`)
- On a phone the call stays in reach: once the board's last line leaves the screen, a docked dark-on-orange bar holds the main line, with the other two behind its toggle (ruling 2). In the build it is visible by default and a script hides it while the board is on screen, so no-JS visitors keep it; the first phone screen shows one orange call. (beside `tractari-proposed-home-scrolled-390`)
- Heads are Big Shoulders Display in sentence case (road signs set destinations in mixed case); the wordmark stays in capitals. Amber is no longer a text colour: only the beacon, the lane line's start, the map hub, step nodes and the focus ring. No glow word, no text-shadow, no stop-labels, no beacon-pulse dots. (beside `tractari-proposed-home-1280`)
- The lead job, tractări pe platformă, is a full-width row with its pictogram at 64 px; four supporting tiles sit under it, each with its own pictogram (today's four identical arrows go). The Servicii call is an outline at every width, so the page never holds a second orange call: the dispatcher plate while it is on screen, then the header (desktop and tablet) or the dock (phone). (beside `tractari-proposed-servicii-1280`)
- Coverage is one raised panel: copy and the county list on the left (Gorj the hub, in today's order), today's map on the right with no frame of its own, sentence-case labels in Archivo. (beside `tractari-proposed-acoperire-1280`)
- On the home page Contact is the board under the headline (id="contact", so #contact still works); this screen shows it alone with the mail line, as the nav link lands on it. (beside `tractari-proposed-contact-1280`)
- Phone numbers never wrap. At 1000 px and below the dispatcher plate takes the full row with Andrei and Vasile 6 + 6 under it, and every number is nowrap (the plate's number stays at 48, 32 on a phone). The backup cells carry a 20 px phone glyph in orange (before the number on desktop, left of the name on phone rows and in the open dock), so they read as callable. (beside `tractari-proposed-home-1280`)
- The nav follows the page: Servicii, Acoperire, Cum funcționează, Contact, in the Drawer too. Each anchor takes a scroll-margin-top of the banner plus the header at that width (101 px; 113 px on a phone). (beside `tractari-proposed-home-1280`)

## Reopened rules

- Recorded (DESIGN.md and PRODUCT.md, locked via /the-one-move): "Full-bleed cinematic hero: the 3D scene fills the entire opening viewport" and "The whole page is one continuous night road … each section is a stop on that single drive." Proposed: the hero is type on the ground, the scene plays in Cum funcționează, and the spine is dropped. DESIGN.md also says white text on the orange call; the Floor wins (3.02:1). (beside `tractari-direction`)

## The Floor

- Round 2, Floor re-run from scratch. Contrast is scripted over 25 pairs plus the scene plate measured from pixels: text min 5.51:1, icons and edges at least 3.04, focus ring 8.75, all pass. Every text on orange is near-black #1a0b05 on #f76400 at 6.20:1 (7.25 on hover): the dispatcher plate, the header call once filled, and the dock; the phone glyphs on the backup cells are orange on #252c34 at 4.55. Checks at 1280, 1024, 960, 800, 768, 390, 360 and 360x690 on all four screens plus the scrolled frame: no page overflow, no control spilling its box, no text clipped by an overflow ancestor, no text outside its card or column, no overlapping text, and no phone number on more than one line (exit 0). First screens: 1280x800 shows status, h1, lede, Ce facem, the whole board and the mail line to y 725; 768x1024 shows everything to y 917; 390x844 shows all three lines to y 717 (mail 802); 360x800 to y 739; at 360x690 Andrei is whole (619-675) and Vasile is cut by the fold (683-739). Exactly one orange call per frame. Sloplint --scope app --render gives 0 FAIL, 0 WARN on the four Proposed twins (tiles reflex 3 and 26b waived with reasons in the file). The scrolled frame is a fixed 390 frame and is not linted. The site has no empty, loading or error state; the sheet draws the scene off, the dock closed and open, and the open menu. (beside `tractari-direction`)

## Other notes

- Copy edits: em dashes in sentences end the sentence or become a colon or comma. "autoturism — defect" is "autoturism: defect"; "combustibil — uneori" is "combustibil. Uneori"; "țară — venim" is "țară, venim"; "linia potrivită — sau sună" is "linia potrivită. Sau sună"; the legal line reads "S.R.L., site demonstrativ"; the hero's aria-label reads "AXA Tractări, tractări auto…". The kicker's "·" becomes a comma; the Derulează cue and the film grain go. The words are otherwise the site's own.
- Round 2 changes, from the critic and the controller's rulings: header call kept 761 to 1000 px and filled when the plate is out of view; Servicii call outline at every width; plate full-row with numbers nowrap at 1000 and below; Ce facem inline on the phone; Cum funcționează head at the plate's lower left, plate ending on ground; phone glyphs on the backup cells; nav order and scroll-margin-top; direction-sheet type specimens no longer clip. Tile pictograms stay orange (the sketch's). The 9 tel: links recount unchanged: header 1, board 3, Servicii 1, footer 3, dock 1.
- Tokens for the code brief are in manifests/tractari.tokens.css and tractari.tokens-map.md, in the site's own names. The board has no theme tweak: the site keeps one dark look (brief 08, Q18).

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| ink on ground (body, h1) |  | 16.72 | 4.5 |
| ink on surface (header, board, tiles, panel) |  | 14.36 | 4.5 |
| ink on surface-2 (line cells, dock chevron well) |  | 12.17 | 4.5 |
| ink-muted on ground (lede, mail line, status) |  | 8.74 | 4.5 |
| ink-muted on surface (copy, nav, footer) |  | 7.5 | 4.5 |
| ink-muted on surface-2 (backup lines' names) |  | 6.36 | 4.5 |
| ink-muted on line (backup line under the pointer) |  | 5.51 | 4.5 |
| on-call on call: dispatcher plate name, tag and number, the header call once filled, dock |  | 6.2 | 4.5 |
| on-call on call-hover (hover of every orange control) |  | 7.25 | 4.5 |
| call on on-call (phone icon in the ink disc, dock chevron) |  | 6.2 | 3 |
| call on ground (county dots, header phone icon) |  | 6.26 | 3 |
| call on surface (icons in tile wells, county dots, header, backup-line glyphs on surface-2 see below) |  | 5.37 | 3 |
| call on surface-2 (pictogram wells, backup-line phone glyphs) |  | 4.55 | 3 |
| amber on ground (lane line start, focus ring) |  | 10.19 | 3 |
| amber on surface (beacon, step nodes' rim, focus ring) |  | 8.75 | 3 |
| on-amber on amber (step numbers 1 to 3) |  | 9.88 | 4.5 |
| on-banner on banner (demo banner) |  | 8.81 | 4.5 |
| line-strong on ground (outline header call, Servicii call, Ce facem underline) |  | 3.54 | 3 |
| line-strong on surface (outline controls inside panels) |  | 3.04 | 3 |
| ink on ground, skip link (ground on ink) |  | 16.72 | 4.5 |
| surface on ground (board, tiles, panels, header band) |  | 1.16 | 1.09 |
| line on ground (a panel's edge) |  | 1.59 | 1.3 |
| line on surface (rules inside a panel) |  | 1.36 | 1.3 |
| surface-2 on surface (cells inside the board, wells) |  | 1.18 | 1.09 |
| ink on the scene plate behind the h2, lightest pixel #090e12 (measured at 1280) |  | 16.72 | 4.5 |
| ink on the scene plate behind the h2, lightest pixel #090e12 (measured at 390) |  | 16.72 | 4.5 |

## The runner-up

**Runner-up: A, Night road, lit (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today, B lines first) and two judges compared every pair against today, in both orders, at 1280 and 390 in the site's one dark look. All 12 verdicts agreed: B won 4, A 2, today 0. Today lost on structure: the header shares the hero's near-black behind a hairline, the top quarter is an empty glow with a scroll cue, and its capitals headline lets the breve on PLATFORMĂ hit the O of AUTO. B won because its first screen is a dispatch board: the dispatcher's name and number on an orange plate, two backup lines, the counties, 24/7 and an email fallback in one card. What A did better: the hours and area stated before the headline, which the build took over. Say so here if you'd rather keep today's full-bleed hero and one continuous night road (A).

## The artboards on the board

- Direction · Lines first
- Home · 1280 · today
- Home · 390 · today
- Servicii · 1280 · today
- Servicii · 390 · today
- Acoperire · 1280 · today
- Acoperire · 390 · today
- Contact · 1280 · today
- Contact · 390 · today
- Home · 1280 · proposed
- Home · 390 · proposed
- Servicii · 1280 · proposed
- Servicii · 390 · proposed
- Acoperire · 1280 · proposed
- Acoperire · 390 · proposed
- Contact · 1280 · proposed
- Contact · 390 · proposed
- Home · 390 · scrolled, call dock · proposed
- Runner-up A, Night road, lit · light 1280 (sketch)
- Runner-up A, Night road, lit · dark 390 (sketch)
