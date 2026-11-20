fix

# saloon (Unghii by Ana), B "Menu beside the work": design critique, 2026-11-13

I read today's shots (1280, 390) and the builder's twins at 1280, 1024, 768, 390 and 360, then measured the twins headless in Chrome. The judges' result and the controller's rulings win where we clash. The facts pair, `Vezi serviciile`, the card foot below the fold, the dock from first paint and `07xx xxx xxx` are ruled, so I don't raise them.

## First screens, measured (today against the build)

| Viewport | Today | Build |
|---|---|---|
| 1280x800 | No price on screen. The first price is at y ≈1,760, two screens down. Booking: header pill 50-92, green WhatsApp 472-520. | All three prices at y 444, 543 and 666. The last row ends at 778, whole. Booking: pill 51-99, green 266-318. |
| 390x844 | No price. The first is at y ≈2,535, three screens down. Green WhatsApp 392-440, no bar at first paint. | The `Manichiură` row runs 591-753 (729 in my render; the description's wrap varies by renderer), price at 599, `Programează` 627-671. Dock top 771, clear by 18 px. Dock pill 782-834 plus call. |
| 360x800 | Not captured. | Row 549-711, dock 727, clear by 16 px. Dock pill 738-790. |

The build answers "what does it cost, and how do I book" on the first screen at every width. Today answers it two or three screens down. The 16-18 px margin on phones is thin. Android's larger font-size settings may push the first row under the dock. I did not measure that, so check it once; it is not a fix.

## Regressions against today

1. **Services read worse at 1280.** Today each row had about 200 px: name, subtitle and description on the left, the price over the link on the right, with air. The build's rows are 98-123 px with 10/12 padding. The description starts 2 px under the subtitle line and runs under `Programează`, whose underline sits about 4 px above the first description line in row 1. Fix: priority 3.
2. **The headline lost its salon voice.** Today's hero h1 (`Hero.astro`, class `heading-xl`) forces Fraunces `"opsz" 144`. The twin sets no opsz, so `auto` picks 64 at 1280 and 40 on phones. The cut is sturdier and lower in contrast, and reads like any Fraunces site. Both judges preferred today's face, and one also failed it on the `e` crossbar. Fix: priority 6, a middle value.
3. **The FAQ was calmer.** Today: flat white rows on cream. The build has six separately shadowed pills and puts the one help card at 1.03:1 on its band. Fix: priority 5.
4. **The phone hero photo** went from 4:5 (about 350x440) to 179 px at 390 and 144 at 360. Ruling 3 asked for that, so I leave it. Between 761 and 900 px it collapses to a 34 px strip, which no ruling asked for (priority 2).

Nothing else is lost. Every section, fact and action from today is still there apart from the ruled items.

## Priority issues (by cost to the visitor)

1. **The Nail Art price is cut off on the most common Android width.** `.price{white-space:nowrap}` sits inside `.menu{overflow:hidden}`. At 360 the price box ends at x 359 against a card edge at 344, so the card clips it to "de la 20 lei / unghi". At 320 it loses about 55 px. At 390 it spills 18 px past the row's content edge, 3 px from the card edge. The Floor sticky claims no overflow at 390 or 360, which is wrong. Fix: let `.top` wrap (`flex-wrap:wrap; column-gap:16px`) and give `.price` `margin-left:auto`. Make "de la 20 lei" and "/ unghie" two nowrap spans so the unit can drop to a second line, right-aligned. Only row 3 grows (about 30 px, below the fold), so ruling 3 is untouched. Re-measure at 320, 360 and 390. Never ellipsize or shorten the price.
2. **The hero photo is a 34 px label strip from 761 to 900 px.** That covers iPad portrait (768/810/820), Android tablets and open foldables. `.slot-hero{min-height:0}` applies at 900 and below, but the phone height only starts at 760. In the same range the header pill is hidden (900 and below) and the dock is off (it starts at 760). Once the hero scrolls away, no booking action stays in reach; only the per-row links remain. Fix: give the slot `height:240px` (or `aspect-ratio:3/1`) from 761 to 900. Running the dock up to 900 would close the booking gap, but it widens the dock question the owner hasn't answered (ask sticky 1), so it waits on that answer.
3. **The menu card is the tightest block on a page that otherwise breathes (80 px sections, 48 px islands), and the hero gap is 8 px.** This is where rulings 1 and 2 clash. Ruling 1 asks for air between the headline, the sentence and the button. Ruling 2 asks for three whole rows above 800. Only 22 px of slack remains under row 3. Spend it in the desktop layout only (above 900 px, where the pair sits side by side), so the phones keep their dock margin:
   - header 76 to 68 px (+8 slack, and the 48 px pill still fits);
   - h1 to sentence 8 to 16 px (-8);
   - row padding 10/12 to 12/14 (-12);
   - `.desc` margin-top 2 to 4 px (-6).

   Row 3 then ends near 796. Re-measure. If it busts, the desc margin goes first, then the row padding. Ruling 2 wins, because it won B the judging.
4. **Anchor jumps hide their own headings (twin only, but the build must carry the fix).** The twins have no scroll offset, so a `#servicii` jump lands the card's head band under the sticky header: h2 at y 15-53 under a 77 px header at 1280, and at 13-47 under 65 px at 390. On phones `#galerie` and `#programari` start their h2 at y 48 under the 65 px header. Today has `scroll-padding-top: calc(var(--wip-banner-h) + 5rem)`. Fix: `html{scroll-padding-top:calc(<header height> + 16px)}`, which is 93 px on desktop (85 if priority 3 takes the header to 68) and 81 on phones. Drop the banner term, since the notice no longer sticks. Also redraw `servicii-390/360`: the comp opens on the placeholder photo (178 px), but the id sits on the card. Landing on the card puts the head and all three prices above the dock, which is better than the comp shows.
5. **FAQ surfaces are upside down.** The six question rows each carry the card shadow (the detector counts 13 border-plus-wide-shadow pairs on the page, six of them here). Meanwhile `Nu ai găsit răspunsul?`, the section's one action, is blush `#f4d6d0` on the band `#efdcd4` at 1.03:1, with only a 1.26 edge and no shadow. It reads as an outline, not an island. `contrast.json` doesn't test this pair. Fix: set the questions as one raised card with ruled rows, as in the menu and hygiene cards (radius 24, edge, the shadow once). Give `.ask` the card shadow, or a white body under a blush head like the menu card.
6. **The h1 optical size.** Set `"opsz" 96` on the h1 at 56 px and up, and keep `auto` on phones. Keep SOFT 30 and weight 440. Check the `e` crossbar at 64 px, which is the judge's G3 concern with 144. Check the one-line fit at 1280 too: a higher opsz sets narrower, so it should hold.
7. **A dead field in `Unde mă găsești` at 1280.** The right column (sentence plus two buttons, about 130 px) sits at the top beside a 580 px info card, which leaves about 360 px of empty ground. The direction lists dead fields as a fault. Fix: `align-self:center` on that column, as today, or set the two actions in the card's foot row.

## The pages other than home (now anchors)

- **servicii** does its job: the three services, prices, pre-filled `Programează` per row, and the "Întreabă-mă pe WhatsApp" foot, all on one screen at 1280. On phones it needs the scroll offset and the redraw from priority 4, plus the price fix from priority 1. The 360 comp itself shows the clipped "unghi".
- **galerie** does its job: heading, sentence, three 4:5 tiles at 1280 and four at 390, and Instagram after the grid. The uniform grid replacing today's masonry costs nothing.
- **programari** does its job: heading, sentence, `Bun de știut`, the green WhatsApp card and `Sună-mă`, with the dock hidden. The static `home.html` twin still shows the dock over this section. The build must keep today's observer that hides it.

## The one palette and its surfaces

The site has one light look and no dark theme, so there is no dark check. Ground `#f5e8e2`, band `#efdcd4` (1.11), card `#fffcfb` (1.17 on ground, 1.30 on band), with a `#dcc3ba` edge (1.40 and 1.26) and the card shadow. In every shot the bands read as bands and the cards lift. Today's one flat sheet at 1.05 is gone. The ground is a dustier pink than today's `#fff8f6`, so the white menu card is the brightest thing on the first screen, which is right for B. Green appears only on WhatsApp actions. Gold-ink stays on card and ground. The one weak pair is blush on band (priority 5).

## The phone

It is a real phone design. One column, the dock at the thumb with 52 px targets, the Drawer behind a 48 px button (Q40), text before the picture. One small cost: `Programează` shares the subtitle line, so "Clasică & semipermanentă" wraps onto two lines at 390 and 360. I would keep that rather than spend the height above the dock.

## Strengths to keep

- The menu card beside the picture: blush head band, ruled rows, gold-ink tabular prices and a pre-filled `Programează` per row, all on the first desktop screen.
- The dock: green WhatsApp pill plus a round call button on a card with a top edge. It hides near booking.
- The islands: Ana's signed letter raised off its band, hygiene as one numbered card, the hours inside the contact card. The page groups clearly and never goes flat.
- One loud colour: green for WhatsApp and nothing else. Gold only for prices, the rule and focus.

## Heuristics (0-4)

1. Visibility of status, 3: FAQ open and closed states are clear, but nav doesn't mark the current section.
2. Match with the real world, 4: salon menu language, "de la 80 lei", Romanian throughout, WhatsApp the way clients already book.
3. User control, 3: anchors and Back work, and the pre-filled message stays editable in WhatsApp.
4. Consistency, 3: green always means WhatsApp, but three "Programează-te" looks (blush pill, green, rose-brown loyalty button).
5. Error prevention, 3: `Bun de știut` sits before the booking buttons, and the pre-fill names the service.
6. Recognition over recall, 4: the price sits next to its booking link.
7. Flexibility, 3: per-row booking, plus a call for clients who don't use WhatsApp.
8. Minimalist design, 3: calm overall, held back by the tight menu rows and the shadowed FAQ stack.
9. Error recovery, 3: a failed picture keeps its well and label, and the call button is there if WhatsApp isn't.
10. Help, 4: FAQ, the "Nu ai găsit răspunsul?" route and the terms note.

Total 33/40.

## Detector (run in full)

`NODE_PATH` left `detect.mjs` degraded: its parser imports are ESM, which ignores `NODE_PATH`. I copied the scripts to my scratch folder and linked presentation-sites' `node_modules` beside them.
- **Twins, all five:**
  - `overused-font` (Fraunces): today's face, kept by ruling 5. Dismissed.
  - `dark-glow` (#118040): the green button's glow is today's, and "dark page" misreads the footer. Dismissed.
  - `cramped-padding`: on `.slot` picture wells and the twin's `.look` wrapper. False positive.
  - `gpt-thin-border-wide-shadow` (13 on home): the designed elevation on the islands and the menu card is fine (negative spread, 22%). On the six FAQ rows it is a real finding, priority 5.
- **Direction sheet:**
  - `low-contrast` x9, green on band at 3.8:1: the green "pass" cells on the contrast table's nine tinted SURFACE and EDGE rows. Sheet chrome, not site copy.
  - Hover 1.7:1: the `Disabled` specimen. False positive.
  - `em-dash-overuse` x28: the source has zero em or en dashes. The rule also counts `--` before a non-space, so it is counting the sheet's printed token names (`--color-surface` and the rest). False positive.

Keep the menu card with all three prices beside the picture on the first screen, and the green dock. Every fix above makes room or wraps a line. None of them cuts content.
