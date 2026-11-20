# The board's notes: BavAuto Gorj

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. The quote form: PRODUCT.md lists one, the code has none (read 2026-11-10). Drop it from PRODUCT.md (the default), or write a form brief? 2. Service descriptions on home: all nine (about 200 words) as drawn, or titles and subtitles on home and the descriptions only on Servicii? 3. Approve B, The job card, as BavAuto Gorj's direction? (A, Bordcomputer serviced, was the runner-up.) (beside `auto-service-direction`)

## Decisions

- The job card stays pinned at the right from the hero to the end of the services (sticky, top 24) and goes inline under the lede on the phone. It is the one light material: the call is the only red button on the page and sits on the card or on the ground, never on a panel. [ruling 6] (beside `auto-service-proposed-home-1280`)
- The one cue from the instrument cluster, and the one live fact: the open-now status sits in today's on-board computer window (Gauge.astro, where it read ULEI 3.400 km), a near-black window with a 1 px edge inside the light card. Line 1: the green dot, Deschis acum, the town. Line 2: the hours in the window's amber, no glow. Encode Sans, sentence case. The dot and the words are added by a few lines of script only inside the hours; out of hours and with scripts off, line 1 keeps the town and the amber hours stay. On the phone the window is the card head, above the call. [rulings 1-3, 4] (beside `auto-service-proposed-home-1280`)
- Desktop call reachability: the header is sticky (64 px band, line foot) so its phone link is on screen at every scroll position, and the pinned card sits 88 px from the top (it ends at y 606, so it fits 800 and 768 px tall). The trust table has a 160 px label column at 1280 so no row wraps; under 1200 px the label sits over the title. Cum lucrăm keeps its sequence: a node at the start of each step rule and a hairline over each short result, in grey. [rulings 5-7] (beside `auto-service-proposed-home-1280`)
- One call on the phone's first screen: the sticky call bar is not drawn there. It shows only once the card's call has left the view (a few lines of script in the build), as in this frame, and it hides again while a page's own call (the contact block) is in view, so no screen shows two red calls. The Contact page at 390 therefore has no bar in its comp. [ruling 4] (beside `auto-service-proposed-home-scrolled-390`)
- Symptoms are full-width rows, one per row, equal height (52 px at 1280, 48 at 390), the WhatsApp mark at the end; each opens WhatsApp with its message already written. [ruling 5] (beside `auto-service-proposed-home-390`)
- Subpages: Servicii keeps the pinned card at 1280 (and has only the call bar on the phone); Despre and Contact have no card, so the header phone, the call bar and the contact block carry the call, one red call per first screen. Contact's call sits on the ground, with the address, email and hours on a panel and the map placeholder beside it. (beside `auto-service-proposed-servicii-1280`)
- The workshop drawing (BayScene, today's authored asset) stays, recoloured to ink and line with its amber lamp gone, because the site has no photography by decision (DESIGN.md, brief 05 default 1). The record line (5 ani numai pe BMW, 3 oameni, Autorizat RAR) becomes three cells, with no dots. (beside `auto-service-proposed-despre-1280`)

## Reopened rules

- DESIGN.md names the Bordcomputer world (the page as an instrument cluster: gauge, service-interval LED band, check-control legend board) and brief 05 owner decision 4 says 'Hallmark proposes inside it first, and one alternative world on the board'. B is that alternative: a workshop job card, warm graphite, M red call. Only the LED band survives, as the rail. (beside `auto-service-direction`)
- DESIGN.md's THE TRIM RULE (the brushed-aluminium trim is the one light material and carries the conversion moment), THE LIVE-AMBER RULE (amber lights only what is live) and THE PRINTED-LEGEND RULE (mono capitals for legends). B moves the light material to the job card and lights the call in M red. Amber returns in one place only, the hours in the readout window (it is what is live); Azeret Mono is dropped, so nav, legends, subtitles and the call are sentence-case Encode Sans. (beside `auto-service-direction`)

## Open questions

- Copy edits for Floor 19 (no dashes in copy). Ranges use the figure dash U+2012: L‒V 08:00‒18:00, Sâ 09:00‒14:00, Luni‒Vineri, 08:00‒18:00, 1‒2 ore. Em dashes in sentences, old to new: cât costă — și abia to cât costă, și abia; sună-ne — probabil to sună-ne, probabil; senzori — diagnoză to senzori: diagnoză; bolile de model — lanț N47, VANOS, răcire — și știm to bolile de model (lanț N47, VANOS, răcire) și știm; ani buni — pentru că to ani buni, pentru că; pe BMW — acolo to pe BMW: acolo; WhatsApp — poți to WhatsApp, poți; sună-ne — îți răspundem to sună-ne, îți răspundem; atelierului — nu to atelierului, nu. The aria-label BavAuto Gorj — acasă is untouched. (beside `auto-service-proposed-home-1280`)
- Services and the trust table show every word (about 200 on home). If the owner answers question 2 with titles only on home, the index rows lose their description column and the page is about 1,100 px shorter. (beside `auto-service-proposed-home-1280`)

## The Floor

- Contrast is scripted over 38 pairs of the one palette: text min 5.36 (card-ink-muted on the card's hover row), the call label 5.58, the window's amber hours on its black 10.9, edges and icons min 3.17, the call fill 3.23 on the ground and 4.73 on the card, focus rings 10.91 or better. Surfaces: panel on ground 1.16 with a 1.70 edge, wells 1.17, the card 15.28. No page overflow at 1280, 1024, 768, 390 or 360, and no control spills its box. First screens: at 390x844 the status window (y 411-481), the call, WhatsApp and all three symptom rows (last bottom 816) are whole; at 360x800 the same, last row bottom 722; at 1280x800 the call, WhatsApp, the symptoms, the window (to 663) and all four trust rows (bottom 765) are whole. Phone targets are 44 to 72 px. The header stays on screen at every scroll position at 1280. Sloplint --scope app --render: exit 0 on all four Proposed twins, 0 FAIL, 0 WARN; waivers and dismissals are stamped with reasons. (beside `auto-service-direction`)

## Other notes

- Not drawn because the site has none: an input, a toast, a form error, a loading or an empty state (static pages, no data). Today's shots are light-* by the capture script but dark; there is no today shot at 360, so the 360 first-screen check is build-only. The fonts are Encode Sans from Google Fonts here; the build self-hosts @fontsource-variable/encode-sans.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| ink on ground | None | 16.26 | 4.5 |
| ink on surface | None | 14.07 | 4.5 |
| ink on surface-2 | None | 12 | 4.5 |
| ink-muted on ground | None | 9.26 | 4.5 |
| ink-muted on surface | None | 8.02 | 4.5 |
| ink-muted on surface-2 | None | 6.84 | 4.5 |
| card-ink on card | None | 13.98 | 4.5 |
| card-ink-muted on card | None | 6.17 | 4.5 |
| card-ink on card-row (hover) | None | 12.14 | 4.5 |
| card-ink-muted on card-row (hover) | None | 5.36 | 4.5 |
| on-signal on signal | None | 5.58 | 4.5 |
| on-signal on signal-hover | None | 6.86 | 4.5 |
| error on surface (text) | None | 6.02 | 4.5 |
| error on ground (text) | None | 6.95 | 4.5 |
| focus ring on ground | None | 12.61 | 3 |
| focus ring on surface | None | 10.91 | 3 |
| focus ring on card (card-ink) | None | 13.98 | 3 |
| card-ink-muted edge on card (outline button) | None | 6.17 | 3 |
| line-strong edge on ground | None | 3.66 | 3 |
| line-strong edge on surface | None | 3.17 | 3 |
| signal call fill on ground (UI) | None | 3.23 | 3 |
| signal call fill on card (UI) | None | 4.73 | 3 |
| ink on window (Deschis acum) | None | 17.04 | 4.5 |
| ink-muted on window (town) | None | 9.71 | 4.5 |
| window-amber on window (the hours) | None | 10.89 | 4.5 |
| success dot on window | None | 8.81 | 3 |
| SURFACE window on card | None | 16.02 | 1.09 |
| success dot on ground | None | 8.4 | 3 |
| success dot on surface | None | 7.27 | 3 |
| whatsapp mark on surface-2 | None | 5.47 | 3 |
| whatsapp mark on ground | None | 7.41 | 3 |
| whatsapp-on-card mark on card | None | 4.68 | 3 |
| SURFACE surface on ground (panels, header) | None | 1.16 | 1.09 |
| SURFACE surface-2 on surface (wells, steel buttons) | None | 1.17 | 1.09 |
| SURFACE card on ground (the job card) | None | 15.28 | 1.09 |
| EDGE line on ground (panel edge) | None | 1.7 | 1.3 |
| EDGE line on surface (row hairline) | None | 1.47 | 1.3 |
| EDGE card-line on card (hairline in the card) | None | 1.39 | 1.3 |

## The runner-up

**Runner-up: A, Bordcomputer, serviced (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today's instrument cluster, B the job card) and two judges compared every pair against today, in both orders, at 1280 and 390 in the site's one dark look. 11 of 12 verdicts agreed: B won 3, A 2, today 0, and the judges split on A against B on the phone. Today lost on structure (the nav floats on the hero, the hours are a hairline row) and on the phone cut its gauge numerals and a symptom chip. B won at 1280 on hierarchy: the call on the brightest surface and all four trust proofs above the fold. Both judges said B could be any garage, so the build carries today's readout window from the gauge. Say so here if you'd rather keep the full instrument cluster (A).

## The artboards on the board

- Direction · The job card
- Home · 1280 · today (first screen)
- Home · 390 · today (first screen)
- Servicii · 1280 · today
- Servicii · 390 · today
- Despre · 1280 · today
- Despre · 390 · today
- Contact · 1280 · today
- Contact · 390 · today
- Home · 1280 · proposed (one dark look)
- Home · 390 · proposed (one dark look)
- Servicii · 1280 · proposed (one dark look)
- Servicii · 390 · proposed (one dark look)
- Despre · 1280 · proposed (one dark look)
- Despre · 390 · proposed (one dark look)
- Contact · 1280 · proposed (one dark look)
- Contact · 390 · proposed (one dark look)
- Home · 390 · scrolled past the card · call bar shown · proposed (fixed 390 x 844 frame, not a fluid page)
- Runner-up A, Bordcomputer, serviced · light 1280 (sketch)
- Runner-up A, Bordcomputer, serviced · dark 390 (sketch)
