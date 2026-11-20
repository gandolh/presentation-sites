# The board's notes: Churchix

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Approve The porch notice as the parish template's direction, or keep Iconostasis restored (A: today's frame with its rail, a split hero and a large framed photo)? 2. Parish phones get a bottom bar of five places (Acasă, Program, Pomelnice, Donează, Meniu) with the Drawer behind Meniu: yes, or the Drawer alone as today? 3. The footer links Termeni și Condiții and Politică de Confidențialitate lead to pages the parish app does not have (they 404 today): should the template add those pages, or drop the links? (beside `churchix-direction`)
- 4. With no endpoint set, Pomelnice opens on today's note (sending is off) and still shows the fields under it, as built. Should it instead show the Pomelnice indisponibile state (drawn on the Direction sheet, with Contactați parohia), so nobody types names that cannot be sent? That changes behaviour, so it is yours to call. (beside `churchix-proposed-pomelnice-1280`)

## Decisions

- Today's strengths are kept: the schedule is the hero's subject, the header is the familiar white band with Donează the one filled pill, giving and the schedule each have a visible action on the first screen, raised white cards with the pinned announcement leading (wider, Fixat, gold bottom edge), a full-strength surface change (the burgundy band and the news tray), and the IBAN repeated in the footer. What changed: the name runs 2 lines at 52 px, not 5 at 72, and on a phone it is whole, never cut to Parohia ... (beside `churchix-proposed-home-1280`)
- The parish's picture gets room (ruling 1, after both judges): the arch grows from 200 x 240 to 246 x 298 and sits over the giving card in the band's open middle. On screens 780 px tall or less (1366 x 768) it goes to 210 x 252 and the band shortens, so the board and the giving card show whole; I used 780 rather than 760 so the 768 laptop gets it and 1280 x 800 does not. On phones it is 96 x 116, the direction's floor, at 390 and at 360. No-photo state: the strong primary fill with the church glyph in light gold; a photo fills the 5:6 arch with cover. The gold line 8 px out carries the boundary (the fill is 1.19 on the band). (beside `churchix-proposed-home-1280`)
- The name is the loudest thing, then the time (rulings 2 and 5): the name is Cardo at 52/60 from 960 px, 2 lines at 1280 and filling the band's middle; 17:00 is Inter 600 at 48/52 with the day wrapping above it when the column is narrow, so it never crosses the board's divider (the new text check covers 960 to 1280). On phones the name is 28/34, DESIGN.md's fixed mobile size, and the time is 40/44. Room on a phone comes from the IBAN on one line at 16/24 below 380 px, never from the name or the arch. (beside `churchix-proposed-home-1280`)
- The comps show today's placeholder account (RO00 XXXX 0000 0000 0000 0000) as the fixture has it. The build hides the account lines of the giving card, not its Sprijinește parohia route, until the parish sets a real IBAN in its seeds. The empty state is on the Direction sheet. Source: ruling 3. (beside `churchix-proposed-home-1280`)
- One route to /program on the first screen: Programul complet in the week list (Vezi programul is dropped), and one filled action beside it: Sprijinește parohia. Copiază is the outlined one. Source: ruling 4. (beside `churchix-proposed-home-1280`)
- The bottom bar is 64 px with five labelled places and sits after the footer in the comps (sticky). In the code it is fixed and the page pads by its height, so it never covers the last content; the Home first-screen board shows it pinned. Source: ruling 5. Meniu keeps the Drawer for Despre, Anunțuri and Contact. (beside `churchix-proposed-home-first-screen-390`)
- The news tray is a full-width tinted surface with white cards over it, so the lead card still reads as raised and the second card sizes to its content instead of stretching. Today's gold left stripe, the 30-40 % card edges, the radial washes and the tracked capitals are gone. (beside `churchix-proposed-home-1280`)
- Inner pages carry the skeleton: a slim burgundy band with the page title and its sentence, and the first cards raised over its edge. Program shows one card per day with the time at 32 px and Sunday on the highlight row; Pomelnice opens on today's note, then keeps the two name cards with tinted heads, then the offering and contact cards, and has no submit button (no endpoint is set, as built); Donații puts the transfer card beside the project card, with Copiază as its one filled action, and Form 230 below as a wide card. The nested grey boxes of today's Donații and the sunk rows of Program are flattened to hairline rows. (beside `churchix-proposed-program-1280`)
- Second parish: the Home page again with blue and silver seeds (#1f3f66, #a8b0b8, #f5f6f4, #ffffff) and no other change, so a blue parish gets a blue door and silver arch line. Contrast and surfaces pass on both sets (the table on the Direction sheet). (beside `churchix-proposed-home-seed2-1280`)
- Fonts: Cardo 700 and Inter 400, 600 (Google Fonts links; the parish self-hosts both, so no substitute is needed). ș and ț render as comma-below glyphs from Cardo and Inter in Hârlești, Sfinții, Bacăului and Sâmbătă. Label weight 600, no tracking, nothing under 14 px; the smallest size, 12, is unused. (beside `churchix-direction`)
- Pomelnice says it first (ruling 1 of round 2): the note that online sending is off, word for word, is the first card raised over the band's edge, with the form under it, before anyone types a name. Today it came last, after about 1,700 px on a phone. (beside `churchix-proposed-pomelnice-1280`)
- The beneficiary line comes back as a callout: secondary-container, radius 8, 16 px padding, the shield in primary, inside the transfer card. It is the page's anti-fraud line and today it was a tinted box; a callout in a card is not a nested card. (beside `churchix-proposed-donatii-1280`)
- Despre has one name: Despre parohia noastră is the section's h2 at 32/40, top left like Anunțuri, with Un spațiu al păcii și al regăsirii as an h3 beside the facts card, which no longer carries a title. Every word is kept. (beside `churchix-proposed-home-1280`)
- The second parish's icons must not read as disabled: icons and marks on light surfaces take secondary-strong (secondary 55 % with primary): bronze for Hârlești, pewter blue for the blue seeds, at least 3:1 on white and on the Sunday row for both. Pure gold or silver stays for rules, the arch line and the logo cross on the primary. The Sunday row tint comes from secondary-strong, so a grey seed still gets a hue. A 69-character name was tested at 390 and 360 and is reported in the Floor sticky. (beside `churchix-proposed-home-seed2-1280`)

## Reopened rules

- Recorded (churchix wiki/decisions.md, 2026-10-23, Q40): "The phone menu (MobileNav) is a Base UI Dialog (2026-10-23), a swipeable Drawer since 2026-11-12." Proposed: the Drawer stays, behind Meniu, and a bottom bar of five labelled places joins it, so Program, Pomelnice and Donează are a thumb away (the 390 comps; the last item opens the Drawer). (beside `churchix-proposed-home-390`)
- Recorded (churchix wiki/design-system.md, the 2026-06-18 redesign): the Hero is "an asymmetric split" with the identity left and a framed image above the week timeline right; the liturgical Rail runs beside the content; Home ends on "a quiet burgundy despre band"; PageShell opens inner pages with an overline kicker. Proposed: the name and the picture sit in a full-width burgundy band, the program and the giving card rise out of its edge, the Rail is retired, Despre is plain text beside a facts card on the page ground, and inner pages open on a slim band with title and lede. The kickers (Rânduiala liturgică, Dania ta, Pomenire la Sfânta Liturghie) are dropped: Floor 9 bans eyebrows and the lede already says it. (beside `churchix-proposed-home-1280`)

## Open questions

- The handoff is two parts, not a bare @theme block: tokens.css (the color-mix roles under :where(:root)) and theme.css (new names, shadows, type). primary-container, on-primary-container and surface-container-low are kept as today for Badge, Alert, the form note and the Drawer ring. New names, no new seed: primary-strong (hover, pressed, the arch), secondary-strong (icons and marks on light surfaces), on-primary-variant and surface-highlight. on-surface, on-surface-variant, surface-container and secondary-container change derivation; see the map. (beside `churchix-direction`)

## The Floor

- Round 2, everything re-run from scratch. Contrast: 47 pairs for both seed sets, exit 0: text min 6.12 / 5.93, UI parts, icons and focus rings 3.32 / 3.29 and up. Icons on light surfaces now take secondary-strong (3.45 / 3.1 or more on white and on the Sunday row), so none is exempt. Surfaces: card on page 1.08, so every card carries a 1 px edge of 1.40 / 1.37; tray 1.13, footer 1.26, card on tray 1.22, Sunday row on card 1.16 / 1.14. Headless checks at 1280, 1366, 1024, 960, 768, 390 and 360 on the four pages, the second parish and a 69-character name: no page overflow, no control spilling its box or its card's padding, phone targets 44 px and up (footer links 28), and a new check that every text box sits inside its cell, its card's content box and every clipping ancestor: all exit 0. Sloplint --scope app --render: 0 FAIL, 0 REFLEX, 0 WARN on the five twins. First screens: 1280 x 800 name y 185-305, 17:00 y 566-618, week rows to y 618, giving button y 614-662; 1366 x 768 (arch 210 x 252) name y 154-274, 17:00 y 504-556, giving button y 552-600; 390 x 844 (bar top 780) name 3 lines y 81-183, 17:00 y 332-376, rows to y 549, buttons y 707-755; 360 x 800 (bar top 736) name 5 lines at 28/34, 17:00 y 396-440, buttons y 739-787, below the bar's line. A 69-character name at 390: 4 lines, buttons y 741-789, 9 px under the bar; at 360: 6 lines, buttons y 773-821. The name is never shrunk to buy room: when it grows, the giving card moves below the fold and the bar's Donează is the always-visible route. The Direction sheet draws the states (static site: no loading state). (beside `churchix-direction`)

## Other notes

- Stand-ins: the arch shows the template's no-photo glyph because the parish supplies no picture and the template ships none. No phone or email is drawn (both are empty in the content), no card-payment or SMS block (no cardUrl or SMS number is set), and the project card's Susține Proiectul button is absent for the same reason.
- Kickers stay dropped on every page (Floor 9 is estate-wide): Program Rânduiala liturgică, Pomelnice Pomenire la Sfânta Liturghie (and the disabled state's Pomenire), Donații Dania ta, Despre Istoric și hram, Contact Vino la biserică. The PageShell kicker prop goes with them; check that hram on Despre is still carried by its title or lede.
- Title Case strings kept verbatim from the content and flagged against the sentence-case ruling: Proiect Special, Descarcă Formularul, Pomelnic de Vii, Pentru Adormiți, Termeni și Condiții, Politică de Confidențialitate, IBAN Donații, Contact Preot. Also declared: Copiază and Descarcă Formularul use the grey outline edge (3.3:1) where DESIGN.md's secondary button has a gold outline, which fails 3:1; and the bottom bar adds the gesture inset (env safe-area) to its 64 px.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| on-surface on surface (body on the page) |  |  | 4.5 |
| on-surface on card (body, names, IBAN) |  |  | 4.5 |
| on-surface on footer |  |  | 4.5 |
| on-surface-variant on card (labels, notes) |  |  | 4.5 |
| on-surface-variant on surface (lede, Despre text) |  |  | 4.5 |
| on-surface-variant on tray (news dates, nav on header is on card) |  |  | 4.5 |
| on-surface-variant on footer |  |  | 4.5 |
| on-surface-variant on highlight (Sunday weekday) |  |  | 4.5 |
| on-surface on highlight (Sunday service) |  |  | 4.5 |
| primary on card (links, headings, 17:00) |  |  | 4.5 |
| primary on surface (links on the page) |  |  | 4.5 |
| primary on tray (links on the news tray) |  |  | 4.5 |
| primary on highlight (Sunday time) |  |  | 4.5 |
| primary on footer (wordmark) |  |  | 4.5 |
| on-primary on primary (name band, Donează, filled buttons) |  |  | 4.5 |
| on-primary-variant on primary (Biserica Ortodoxă Română, band lede) |  |  | 4.5 |
| on-primary on primary-strong (hover, pressed) |  |  | 4.5 |
| secondary-fixed on primary-strong (arch glyph) |  |  | 4.5 |
| on-secondary-container on secondary-container (badges) |  |  | 4.5 |
| on-surface on tray (Pomelnice name-card heads) |  |  | 4.5 |
| on-error-container on error-container (alert) |  |  | 4.5 |
| on-error-container on card (error under a field) |  |  | 4.5 |
| inverse-on-surface on inverse-surface (callout number) |  |  | 4.5 |
| on-surface-variant on card (bottom bar labels) |  |  | 4.5 |
| outline on card (input, chip and ghost-button edge) |  |  | 3 |
| outline on surface |  |  | 3 |
| error on card (field error edge) |  |  | 3 |
| secondary on primary (arch line, gold rule on the band) |  |  | 3 |
| primary on track (progress fill) |  |  | 3 |
| focus ring primary on card |  |  | 3 |
| focus ring primary on surface |  |  | 3 |
| focus ring primary on tray |  |  | 3 |
| focus ring primary on footer |  |  | 3 |
| focus ring primary on highlight |  |  | 3 |
| focus ring on-primary on primary (band, pill) |  |  | 3 |
| secondary-strong on card (bank, church, download icons, the current-place underline) |  |  | 3 |
| secondary-strong on highlight (Sunday church mark) |  |  | 3 |
| primary on secondary-container (the shield in the beneficiary callout) |  |  | 3 |
| on-surface-variant on secondary-container |  |  | 4.5 |
| card on surface (edge required below 1.09) |  |  | 1 |
| outline-variant edge on surface (needs 1.3) |  |  | 1.3 |
| outline-variant edge on tray (card on the news tray) |  |  | 1.15 |
| card on tray |  |  | 1.15 |
| tray on surface (needs 1.09) |  |  | 1.09 |
| footer on surface (needs 1.09) |  |  | 1.09 |
| highlight on card (Sunday row, needs 1.09) |  |  | 1.09 |
| primary-strong on primary (the arch; the gold line carries the boundary) |  |  | 1 |

## The runner-up

**Runner-up: A, Iconostasis, restored (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today, B the porch notice) and two judges compared every pair against today, in both orders, at 1280 and 390 in the template's one light look. All 12 verdicts agreed: B won 4, A 2, today 0. Today lost on structure (one sheet down to the photo), a five-line title that pushed the next service to one line, small tracked capitals and, on the phone, a cut parish name. B won on grouping for the job: the burgundy band holds the name, one card over its edge carries the next service with the time at display size and the week, giving sits beside it, and the phone gets a labelled bottom bar. What A did better: a large framed photo slot (a parish's own church is its identity) and display type with more ceremony. Say so here if you'd rather keep today's split hero (A).

## The artboards on the board

- Direction · The porch notice
- Home · 1280 · today
- Home · 390 · today
- Program · 1280 · today
- Program · 390 · today
- Pomelnice · 1280 · today
- Pomelnice · 390 · today
- Donații · 1280 · today
- Donații · 390 · today
- Home · 1280 · proposed
- Home · 390 · proposed
- Program · 1280 · proposed
- Program · 390 · proposed
- Pomelnice · 1280 · proposed
- Pomelnice · 390 · proposed
- Donații · 1280 · proposed
- Donații · 390 · proposed
- Home · 390 · first screen, bar pinned · proposed
- Home · 1280 · second parish (More states) · proposed
- Runner-up A, Iconostasis, restored · light 1280 (sketch)
- Runner-up A, Iconostasis, restored · dark 390 (sketch)
