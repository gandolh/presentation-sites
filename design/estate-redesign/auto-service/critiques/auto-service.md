fix

# auto-service (BavAuto Gorj), B "The job card": design critique, 2026-11-13

Inputs: today's shots (named light, the site is dark), the build's twins and shots, the direction, RESULT.md and the controller's rulings. I measured first screens headless with Playwright. The build came from its twins. Today came from the site's built `dist` (2026-11-12 15:18), served through route interception with no server. That is how I got today at 360x800, which has no shot. Its 1280 and 390 numbers match today's shots within a few px.

## First screens, today against the build (y ranges in px; ✓ = whole on the first screen)

| Item | Today 1280x800 | Build 1280x800 | Today 390x844 | Build 390x844 | Today 360x800 | Build 360x800 |
|---|---|---|---|---|---|---|
| Call | 593-650 ✓ | 193-265 ✓ | 723-781 ✓, sticky bar right under it | 480-544 ✓ | 715-773, half under the bar (738-790) | 416-472 ✓ |
| WhatsApp | 593-650 ✓ | 277-325 ✓ | 793-843, under the bar | 556-604 ✓ | 785-835, cut | 480-528 ✓ |
| Three symptoms | 145-186 ✓ | 394-552 ✓ | 163-204, 3rd chip cut at 390 | 657-803 ✓ | 3rd chip cut | 567-713 ✓ |
| Open now + hours | 677-713 ✓ | 593-669 ✓ | 870-954, below | 411-455 ✓ | 862, below | 355-399 ✓ |
| Trust proofs | 756-918, legends only | 4 rows 500-765 ✓ | 991+, below | 860+, 16 px below | 983+, below | 766+, 34 px peek |

The build wins every cell. Home height drops from 5,483 to 5,150 at 1280 and from 9,404 to 8,702 at 390, and nothing was cut to get there. All nine descriptions and every trust note are still on the page.

## Ruling 1: the instrument-cluster cue fails the swap test

The rail is four 4 px bars (M blue, M indigo, M red, ink) standing outside the trust panel. Rename the page to any garage, or to a dentist, and the rail still works unchanged. It reads as a colour key, or as the M stripe at the top of the page a second time. It doesn't read as a lamp:
- It has none of what made today's LED band read as instruments: no unlit segments, no glow, no row of lamps. The fourth bar, in white, looks like a missing fourth colour.
- It sits off the panel, in the gutter: x 34-38 against a panel edge at 57 (1280), and x 8-12 at 390, 8 px from the screen edge, where it looks like a scroll indicator.
- It is misregistered at 1280. The rail has four equal tracks, but the rows are 59/60/60/86 px tall, so segments 2 and 3 straddle the row hairlines at y 619 and 679.
- It never reaches the phone's first screen. It starts at y 871 at 390 (fold 844), and only 23 px shows at 360.

**The fix: one cue, today's on-board computer window from `Gauge.astro`, carrying the open-now status.** Today that window shows "ULEI 3.400 km" over "TÂRGU-JIU · GORJ" in a near-black box inside the tach. Drop the rail. Set the card's status block (y 411-455 at 390, 593-669 at 1280, in its current place at each width) as that window: fill #0f0d0b, a 1 px #201c18 edge, radius 4, padding 10 px 12 px.
- Line 1 has the green dot (#4fc47f, 8.8:1, as ruling 2 requires) and "Deschis acum" at 16/22 700 in ink #f2f0ec on the left. "Târgu-Jiu, Gorj" sits on the right at 14/20 600 #bbb7b0, where the 390 card head already puts it.
- Line 2 is the two hour values at 14/20 600 in the window's own amber #fcb368 (10.9:1), tabular, with no glow. That is the window's lit reading, the way "ULEI 3.400 km" was.
- Out of hours, and with scripts off, ruling 2 removes the dot and "Deschis acum". Line 1 then keeps only the town, and the amber hours stay, so the window always shows a lit reading.

It uses Encode Sans in sentence case, no mono and no capitals. It replaces the 12 + 1 + 12 px hairline spacing it sits in. I estimate it adds 8 px or less on the phone, against 41 px of headroom at 390: the third symptom's bottom moves from 803 to about 811 of 844, and from 713 to about 721 of 800 at 360. Why it passes: a black window with an amber reading is the dashboard display every BMW driver looks at, and it shows the one live fact on the page. **Three things for the controller:** it brings back one amber, today's, in this one place. It puts a small dark inset inside the light card, though it adds no second light material and no new image. And it has no glow, so it needs no Hallmark 38iii waiver.

## Regressions against today

1. **On desktop, the call scrolls away (home, servicii, despre at 1280).** Today's header is `position: sticky`, so its phone link is on screen at every scroll position. The build's `.hdr` scrolls away, and once the card unpins no `tel:` link is visible for long stretches: home 2,300-3,400, despre 200-1,000, servicii 1,900-2,500 (100 px scroll steps, 1280x800). Fix: `.hdr{position:sticky;top:0;z-index:10}`. Keep its 64 px surface band and line foot, and move the card's sticky `top` from 24 to 88 px. The 550 px card plus 88 is 638, which fits 800 and 768.
2. **The look stopped being BMW (every screen).** Today's tach, lit word and LED band made the page a BMW cluster. B dropped them, which the judging accepted, and the rail doesn't put any of it back. The fix is the window above, nothing more.
3. **"Cum lucrăm" lost its sequence (home and servicii, both widths).** Today each step has its own rule with a node at its start, coded blue, blue, indigo, red, red, so the row warms from the call to the keys. Each readout ("0 LEI", "CAUZA"…) sits under its own hairline. The build keeps a 2 px grey rule per step but drops the nodes, the colour progression and the hairlines, so "0 lei", "cauza", "aprobat" float as bare bold lowercase words under the copy. Fix: put an 8 px ink node at the start of each existing rule, and a 1 px #413c38 hairline 12 px above each readout. Leave the rules grey. The M progression is the controller's call, since ruling 1 allows one cue.
4. **The phone readouts lost their separators (servicii, despre and contact at 390 and 360).** At 480 px and below the CSS removes the dividers. "9 lucrări deviz în avans garanție 12 luni" and "3 oameni 5 ani numai BMW" now read as one phrase, and today's dots at least kept the values apart. Fix: keep the 1 px #736e67 dividers at phone width with 12 px padding and `white-space:nowrap` on each value. On contact, put "Deschis" on its own line above the two hour values, the way the card head does it, so the line fits 350 px.

Nothing else regressed. Symptoms, hours, trust and the call are all easier to reach than today at every width measured.

## Priority issues (by cost to the user)

1. **The cue fails the swap test** (above). Drop the rail and use the window for the status. The judges named this as B's only weakness in every A-vs-B pair.
2. **Desktop call reachability** (regression 1). Make the header sticky and set the card's top to 88.
3. **The trust table's columns, at 1280 and at 1024.** At 1280 the legend column is about 190 px and mostly empty, while the note column gets about 227 px. So "Diagnoză dedicată, nu generalistă" wraps, and row 4 is 86 px against 60 for the others. Fix: make the legend column 160 px (the longest legend, "Înainte de lucrare", is about 125 px at 14/600). The note then gets about 260 px and all four rows hold one line. At 1024 the three columns squeeze into 504 px: "Autorizat / RAR" and "Garanție 12 / luni" break, the notes run three lines, the rows grow to 112 px, and only two proofs fit in 768. Fix: below 1200 px, stack the legend over the title in a 200 px first column and put the note beside it. Never shorten a note.
4. **The process sequence** (regression 3).
5. **The phone readout separators** (regression 4).
6. **One state, two labels.** Contact says "Deschis" next to the green live dot, and the card says "Deschis acum" for the same state. Fix: use "Deschis acum" on contact too. It is existing copy and the same script gates it.

## Strengths to keep

- The job card: call, WhatsApp, three symptom rows and status in one light card, 15.28:1 off the ground. It stays pinned from the hero to the end of the services (measured: top 24 at scroll 1,600, gone by 2,600). A worried driver gets every way in from one glance.
- A real phone first screen. At 390 and 360 the status, call, WhatsApp and all three 48 px symptom rows are whole, there is one red call per screen, and the sticky bar appears only once the card's call is gone.
- All four trust proofs sit above the fold at 1280 as a row-headed table. Today only their legends showed.
- The services index on one raised panel with every description, and legible sentence-case labels instead of tracked mono capitals.

## The one dark palette

Surfaces separate. Ground #161310 to surface #24211e is a 1.16 step, carried by a 1.70 #413c38 edge, and the card at 15.28 can't be missed. The edge does the work. On a dim Android OLED the 1.16 step alone would merge, so never drop the panel edges. Adding direction A's machined top lip (`inset 0 1px 0 rgb(255 255 255 / .055)`) to the panels would help further. Red appears only on the card or the ground, as checked on home, contact and the bar. Minor: below the services every section is the same surface panel (same radius, same edge), so once the card unpins nothing leads until the contact block. The card's green status dot also sits beside four green WhatsApp marks. Both are low cost and need no change for this round.

## Heuristic scores and detector

1 Visibility of status 3: the open-now line is true and live; the current place has an ink underline. · 2 Match with the real world 4: the symptoms use the driver's words, and WhatsApp opens with the message written. · 3 Control and freedom 3: WhatsApp text is editable; the map is opt-in. · 4 Consistency 3: "Deschis" against "Deschis acum", and phone readouts without separators. · 5 Error prevention 3: message templates with blanks. · 6 Recognition over recall 3: the number is always in view on the phone, not on desktop. · 7 Flexibility 3: call, WhatsApp, symptom shortcuts and the header phone. · 8 Aesthetic and minimalist 3: clear and structured, but generic until the cue lands. · 9 Error recovery n/a: no forms. · 10 Help 3: FAQ rows and full service descriptions. **Total 28/36, one n/a.** Cognitive load is low, with one failure: the card shows five options (call, WhatsApp, three symptoms), offset by the "Spune-ne ce are mașina" sub-head.

Detector (impeccable `detect.mjs`, run with its parsers, script copied beside presentation-sites' node_modules):
- home 5, servicii 4, despre 2, contact 2, home-scrolled 6: all `cramped-padding` (li border-top on index and step rows; div.panel on the trust and index panels) plus one `codex-grid-background` each. I dismissed all of them. The padding lives on the rows and cells (a 28 px inset is visible), and the grid is the map placeholder, a map surface carried over from today.
- Direction sheet 15: 9 `low-contrast` on swatch specimens (line, surface, signal and success-on-card samples), 3 `cramped-padding`, 2 `repeated-container-text` (the three call states in the States strip) and 1 `codex-grid-background` (the map). I dismissed all of them after checking that no twin sets signal, success-on-card or line-strong as a text colour.

## Status, not findings

The rulings in `auto-service-controller.md` (07:36), which came after the 07:35 build, are not in yet. The twins have 0 figure dashes (U+2012) and still read `L-V 08:00-18:00` with hyphen-minus. The manifest's "open" sticky still says ranges became hyphens, which contradicts that file's ruling 1 (the figure dash, not RESULT.md's cue ruling). The `home-full` Today artboards are still on the canvas. None of my fixes truncate content or undo what won the judging: the window keeps Encode Sans, the green dot and the one light card.

Keep the job card intact while fixing: one light card, call first, symptoms as full rows, a true status. The cluster cue goes inside it as one live reading, not around it as decoration.
