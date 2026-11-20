fix

# tractari (AXA Tractări), "Lines first": design critique, 2026-11-13

Read from the shots in `work/tractari/shots/`, today's in `shots/tractari/`, the winning sketch in `sketches/tractari/B/`, my own headless renders of the six twins (system Chrome, files dated 08:09) and the site's `PRODUCT.md` and `DESIGN.md`. The rulings in `judge/tractari/RESULT.md` stand. Where a fix touches a ruling's wording, I flag it under "Clashes" at the end.

## First screens (y in CSS px; today's read off its screenshots, the build's measured)

| Viewport | Today | Build |
|---|---|---|
| 1280x800 | ~210 px of empty glow, then the tracked-caps kicker at 315; counties in the lede 540-620. Two orange calls to one number (header 46-84, hero 658-712). No backup line until Contact, around y 2750 | status "Non-stop 24/7, Oltenia" 129-155, h1 159-239, lede with the counties 251-311, Ce facem 315-359. Plate 554-650 with both backups beside it, mail 699-725. One orange (the plate). Header call outlined |
| 390x844 | ~200 px void, kicker at 361. Hero call 634-688 plus the dock 777-834, so two oranges. Backups only behind the dock toggle | status 129-151, h1 153-245, lede 253-353, Ce facem 353-393. Plate 538-610, Andrei 618-674, Vasile 682-738, mail 771-823. One orange, and no dock while the board is on screen |
| 360x800 | not captured | plate 560-632, Andrei 640-696, Vasile 704-760; the mail line (793-845) is cut by the fold. One orange |
| scrolled 390 | the dock is always there (orange pill and a dark toggle) | header 0-56, the Servicii outline call near the top, orange dock 772-844 (72 px). One orange |

My own extra viewport, not one of the named three: at 360x690 (about Chrome's visible area on a 360x800 Android with the URL bar showing) the plate is in view, Andrei is cut and Vasile is under the fold. The three-lines promise holds on the named frames and is tight on a real phone.

## Regressions against today

- **R1. Desktop, every screen past the board.** Today's fixed header carried a filled orange call at every scroll position, as `PRODUCT.md` asks ("Pinned, brightest, one-tap, every scroll position. Desktop: nav-right"). The build's header call is an outline everywhere, so acoperire-1280, Cum funcționează and the footer have no orange call at all. Fix in issue 2.
- **R2. 761 to 1000 px.** Today showed the header call from 640 px up and the dock below 1024, so a tablet always had one. The build hides `.hcall` at 1000 px and below and shows the dock only at 760 and below, so this band has no persistent call. Fix in issue 1.
- **R3. Backup lines, Contact and home board.** Today each backup cell had a phone glyph in a disc (contact-1280, contact-390). The build's Andrei and Vasile cells show a name and a number and nothing that says "tap to call". Fix in issue 5.
- **R4. Cum funcționează.** Today it was a compact band, the head 32 px above three steps on a road line. With the scene off, the build leaves about 270 px of black between the h2 and its steps (170 px at 390). Fix in issue 4.
- Nothing else regressed. Coverage keeps copy and list beside the map, and the phone map labels grow from about 10 px caps to 22 px. The services lead keeps its asymmetry, and the footer phone rows read better than today's stacked labels.

## Priority issues (ranked by cost to a stranded driver)

1. **No call in reach from 761 to 1000 px** (tablets, foldables, phones held sideways). This breaks `PRODUCT.md`'s "every scroll position". Keep `.hcall` in the header down to 761, between the wordmark and the burger (at 768, about 170 + 175 + 44 px, which fits), at 44 px tall, under the same fill rule as issue 2. Don't stretch the dock to 1000 instead, because ruling 2 puts the dock on the phone.
2. **Desktop loses the orange call once the board scrolls away.** Fill the header call (`call` ground, `on-call` ink, 6.20:1) when the dispatcher plate leaves the viewport, as ruling 5 allows. One IntersectionObserver on `.line--main` should drive both this and the phone dock. Watching the plate rather than the whole card closes a window where only Vasile's row is on screen and no orange call shows. That is a small departure from ruling 2's "once the dispatch card scrolls out of view" (see Clashes). To keep exactly one orange per screen, make the Servicii call an outline at every width, as it already is on the phone. That gives the plate while it's visible and the header otherwise.
3. **Board numbers break from 761 to about 872 px.** From 768 to 800 all three numbers wrap ("07XX XXX / XX1") and the plate number spills the orange plate by 4 px. Up to 872 the two backup numbers wrap. The builder's check passed because wrapping isn't overflow. At 1000 px and below, give the plate all 12 columns (number at 48) with Andrei and Vasile 6 + 6 under it, and set `white-space: nowrap` on `.num` and `.n2`. Don't shrink a number below 40 px, and never cut one.
4. **Cum funcționează: the head is cut off from its steps.** With the scene off, the void between the h2 and the strip samples #030509 to #0b0d0c (1.05:1), which is darker than the ground (#090e12), and the h2 floats 270 px from the steps it heads. Ruling 6 keeps the scene here, and the direction binds the plate to today's backdrop CSS, so add no new picture. Set the h2 at the plate's lower left, 24 px above the strip, so head and steps group and the plate above them is the scene's sky. That applies with the scene on too, and it departs from the direction's "h2 over its upper-left". Optionally end the plate's gradient and scrim on `ground` rather than below it, so the band stops reading as a hole. Keep the plate at 440 / 300 px, where the WebGL canvas mounts.
5. **The backup lines don't look callable.** Put a 20 px phone glyph in `call` on each backup cell (4.55:1 on `surface-2`, above the 3:1 icon floor): left of the name on the phone rows, before the number in the desktop cells. Today had one. Do the same for the open dock's two rows.
6. **The nav order fights the page order.** The page runs board (Contact), Servicii, Acoperire, Cum funcționează. The nav reads Servicii, Cum funcționează, Acoperire, Contact, so the second link jumps to the page's end. Use Servicii, Acoperire, Cum funcționează, Contact, in the Drawer too. With today's fixed banner and nav, give each anchor a `scroll-margin-top` equal to the banner plus the header at that width, so heads don't land under them.

## The builder's four choices

- **The dock bar painted orange edge to edge.** Keep it. `PRODUCT.md` records "Mobile: full-width bottom dock", `DESIGN.md` a "persistent full-width `.call-dock`", and ruling 2 asks for a "dark-on-orange call bar". The build meets all three, and on a phone the loudest thing at the thumb should be the call. The winning sketch framed an orange pill in a dark bar, and the direction's off-Manifesto line says "never a full-width coloured band", but the recorded call outranks both, and the judges never saw a dock (the sketch's first screen hid it).
- **The header call outlined on every screen.** Right while the plate is on screen (ruling 5), wrong after it. See issue 2.
- **The board without a foot row.** Keep it this way. Ruling 4 moved hours and area above the h1, so a foot would repeat them and push Vasile 40 px further down on the phone.
- **"Ce facem" above the board on the phone.** It follows ruling 3's words ("under the paragraph"), but the winning sketch had it under the board at 390, and ruling 3 targeted the stray button at the 1280 edge. It costs 40 px (353-393) before the board. Setting "Ce facem ↓" inline after "La orice oră." at the lede's end, padded to a 44 px target, gets the 40 px back without a clash. At 360x690 that brings Andrei fully in (600-656), though Vasile stays below the fold (664-720). Moving it under the mail line clashes with ruling 3's wording, so that one is the controller's call.

## Strengths to keep

1. The board. Three named lines, the dispatcher's number at 48 px (32 on the phone) in ink on orange at 6.20:1, and the backups as quieter cells. Every named first screen holds hours, area, all three numbers and the mail fallback with exactly one orange.
2. The header is its own band (`surface` #181f25 and a `line` hairline), which fixes today's G1 failure. The dock stays hidden while the board is on screen.
3. Sentence-case Big Shoulders heads with no glow, the h1 on one line at 1280, Archivo for body, and the copy kept word for word without the em dashes and centre dots.
4. Services lead with the platform job as a full-width row, and each of the four tiles has its own pictogram instead of today's four identical arrows.

## Palette and surfaces (one dark look, no switch)

Ground #090e12, `surface` #181f25 (1.16 on ground, with a 1.59 `line` edge) and `surface-2` #252c34 (1.18 on surface). In the shots the header band, board, tiles, coverage panel and steps strip all read as raised, and the backup cells read as cells inside the board. The board's shadow (0 24px 48px -24px, black at 70 %) barely shows on near-black, so the edge does the lifting. Everything raised sits on one level. That's fine, because the board is alone on its screen. The one surface that fails is the scene plate, which is darker than the ground (issue 4). The banner (#3b2b0d with #fbc865, 8.81:1) reads as a notice, not as content. Orange also marks the tile pictograms. I'd move them to `ink-muted`, but the winning sketch drew them orange, so they stay unless the controller reopens it.

## Heuristics (0-4)

1. Visibility of system status, 3. "Non-stop 24/7, Oltenia" comes before the h1, and the dock toggle carries `aria-expanded`.
2. Match with the real world, 4. Named people and their numbers, plain Romanian, and road-sign sentence case.
3. User control and freedom, 3. The toggle, the Drawer and the anchors all reverse, but 761 to 1000 px has no call (issue 1).
4. Consistency and standards, 2. The Servicii call is filled on desktop and outlined on the phone, the backups lack the plate's glyph, and the nav order differs from the page.
5. Error prevention, 3. Numbers split across lines from 761 to about 872 px, which invites misreading.
6. Recognition rather than recall, 3. All three numbers are on the first screen. After scrolling, only the main line stays out and the others sit behind the toggle.
7. Flexibility and efficiency, 4. One tap from every first screen, and `tel:` links on every number.
8. Aesthetic and minimalist design, 3. The first screen is lean (about 80 words), but with the scene off the steps plate is 270 px of nothing.
9. Error recovery, n/a. There's no form and no error state.
10. Help and documentation, 3. Cum funcționează spells out the three steps, and prices are quoted by phone.

Total 28 / 36 over nine scored heuristics. Cognitive load passes 7 of 8. The one failure is grouping, in the steps section (issue 4). No decision point shows more than four options. Design specificity: grounded. The board is built from this firm's real fact, three owners answering the phone. The lane line is the only road cue above the fold, so keep it.

## Detector and checks

Detector (impeccable `detect.mjs`, copied to my scratch, run against presentation-sites' parser modules, so not degraded): home 10, servicii 9, acoperire 4, contact 5, scrolled 11, direction 4.
- `icon-tile-stack` x5 (home, servicii, scrolled). Real, and waived by the builder (Hallmark waive 3). Accept the waiver. On the phone all five tiles stack as cards and Servicii runs 1,358 px at 390. Rows with the 40 px well beside the title would shorten it, but that's optional.
- Dismissed: `clipped-overflow-container` (html, body, .page, .frame) are `overflow-x: clip` guards whose positioned children are the board callouts and the dock, and no text clips. `gpt-thin-border-wide-shadow` is the direction's one shadow on the one raised object. `repeating-stripes-gradient` is the dashed lane on the steps strip. On the direction sheet, `cramped-padding` on `mini-plate` is the expected specimen false positive. `em-dash-overuse` (23) is wrong: my scan found no dash character in the sheet's text, so the detector is counting the `--color-*` token names.

Clip and overrun: I checked every text node against its card or cell and against every `overflow: hidden|clip` ancestor at 1280, 1024, 960, 768, 390 and 360, on home, servicii, acoperire and contact, plus the scrolled frame. All clean except home and contact at 768 (issue 3). There's no ellipsis or line clamp anywhere, and no sideways scroll at any width. Dismissed: the wordmark's text box is 3 px taller than its 28 px line box, with no clipping ancestor and no ink cut. On the direction sheet at 1440, the h1, h2 and h3 type specimens sit in `overflow: hidden` rows that their text boxes overrun by 8, 4 and 2 px. The render shows every descender and diacritic intact, but the specimens would cut a breve or comma at a slightly larger size, so `overflow: visible` there costs nothing.

U+2012: nothing to check. No numeric range appears on any screen, and the visible text of the 6 twins and 10 comps holds no dash character of any kind.

wf.py (`board/tools/wf.py`, identical to the builder's copy): on disk, all 18 canvas comps pass, and they close `<use></use>` explicitly. It flags 6 files, the 6 plain twins, and only for self-closed SVG children inside `<svg>` (path, circle, line, use, stop). HTML parses those correctly as foreign content, and there are no mismatched or unclosed tags. Its "unquoted attribute" hit is `initial-scale=1` inside the quoted viewport value, a false positive. I find 6 flagged files, not the 10 reported.

## Clashes

- Issue 2 watches the dispatcher plate where ruling 2 says "once the dispatch card scrolls out of view". Same intent, tighter trigger.
- Moving "Ce facem" under the board at 390 would clash with ruling 3's wording. The inline fix doesn't.
- The orange dock clashes with the direction's off-Manifesto line, but `PRODUCT.md` and ruling 2 back it, so it stays.
- Issue 4's h2 move departs from the direction's "upper-left". No ruling covers it.

Don't dilute the board while fixing: three named lines on the first screen at every named viewport, one orange call per screen, dark ink on every orange.
