fix

# subcort: design critique of "On your ground" (2026-11-13)

Read: today's shots plus today's built site (`sites/subcort/dist`, rendered headless with full pages and a 3 s wait so its reveal-on-scroll sections show), the four twins at 1280, 1024, 768, 390 and 360, the canvas comps, the direction, RESULT.md with its rulings, subcort-controller.md, and the manifest's screens and stickies (read last). Below, "RESULT n" is a ruling in RESULT.md and "controller n" a ruling in subcort-controller.md. The dark circles in the 1280 left margin are board pins. I left them out.

## First screens, today against the build (y of the element's bottom edge; fold at 800 / 844 / 800)

| Home | Region named | Drawing | Specs (5) | Next step |
|---|---|---|---|---|
| Today 1280x800 | eyebrow 196, Zonă cell 667 | 543x404 box, the tent fills about half | all 5, 667 | no (link at 1913) |
| Build 1280x800 | Zonă cell 556 | 460x345, 480 | all 5, 556 | yes, 538 |
| Today 390x844 | eyebrow 164 | 719, tent small in blank | 2 (values end 830) | no (2175) |
| Build 390x844 | Zonă row 715 | 200x150 on the spec card, 666 | 3 (to Suprafață 812; Capacitate cut at 860) | yes, 470 |
| Today 360x800 | eyebrow 164 | 723 | 0 (values end 832) | no |
| Build 360x800 | Zonă row 715 | 666 | 2 (Zonă, Deschidere 764) | yes, 470 |

Home wins every first screen, as RESULT 1, 2 and 4 asked.

The other pages:
- **Corturi** does its job: the plan, then a 2 × 2 picker of 48 px targets, then the readout. At 390 the plan, picker and readout fit one phone screen (y 680–1215). It is level with today: the plan starts at y 638 at 1280 (today 661) and at 680 at 390 (today 689).
- **Servicii** got worse above the fold. At 1280 today shows all three services whole (descriptions end at 727, 727 and 751). The build cuts all three (816, 816 and 842). At 390 today's first service ends at 779; the build's ends at 846, just under the fold. See P4.
- **Contact** does its job: phone, mail and address end by 456 at 1280 (today's address ends at 740). At 390 it is level. At 360 it is one line worse: the address ends at 813 (today 798). See P2 and P6.

## Regressions against today

1. **Corturi, phone (768 and below): the format notes pair with the wrong size.** Today puts each label beside its note. In the build, each label box is 88 px tall: `.notes b{flex:0 0 88px}` turns into a height once the ≤768 rule makes `.notes li` a column. Each note then sits 64 px below its own label and 12 px above the next one, so "Cel mai cerut format…" reads as belonging to 10 × 20 m. Fix: `.notes b{flex:none}` in the phone rule, 4 px between label and note, and 16 px plus a `hair` rule between pairs.
2. **Contact, phone: the values are right-aligned under left-aligned labels.** Today stacks the label over the value, both left. In the build, the phone media's global `dd{margin:0;text-align:right}` (meant for the spec card) also catches contact's `dl`. The phone number and mail sit on the right edge, the address wraps ragged-left with "Gorj" alone on its line, and Duminică's "Doar pe bază de programare" wraps right-aligned too. Fix: scope the rule to `.tb dd` and set `.crow dd{text-align:start}`. In the hours, keep the two time ranges on the right and put Duminică's value under its day, left-aligned.
3. **Servicii's first screen** (see above): the three services no longer fit above the fold at 1280. Fixed by P4.
4. **Footer: the links lost their underline.** Today underlines the five places, the three documents, the phone and the mail. The build sets `.fc ul a{text-decoration:none}` (underline on hover only, and an Android phone has no hover), so links and plain text, such as the street, differ only by ink against ink-2. Fix: underline in `line-soft`, 1 px, offset 4 px, the same treatment as `.crow a.big`.
5. **Home only: the Plate 02 steps took the callout circles.** Today numbers the steps in mono "01"–"04" over ink rules, so the circled 1–4 on the same page always mean parts of the tent. The build gives the steps the same 32 px orange circles, so home now shows two look-alike 1–4 sets. Fix on home only: step numbers in Plex Mono 600 15/20 in `signal` with no ring. Servicii's 1–3 and Dotări's 1–6 circles are today's own and stay.
6. **Corturi, phone: the plan's labels got smaller.** "15 m" and "10 m" render at 11.2 px at 390 and 10.1 px at 360 (today 12.1 and 11.0). "mașină · 4,5 m" renders at 9.2 and 8.3 px (today 10.0 and 9.1). The frame's padding plus the panel's padding shrink the plan to 306 px wide (today 332). Fix: under 600 px, cut the frame padding to 4 px, and enlarge the SVG text with a narrow-screen rule so the dimensions render at 12 px or more and the car label at 11 px or more.
7. **Corturi, Dotări: "Opționale" lost its tint.** Today's tag sits on `signal-soft`, so the paid extras read apart from what's included. In the build both boxes carry the same neutral band. Fix: the "Opționale" band on `signal-soft` with `on-signal-soft` text (7.08:1). That is the banner's tint, so it's no orange fill.

Nothing else regressed. The header now sits on its own white band with an ink rule. The plates part as panels. The tent no longer floats in blank space. The phone callouts are 13.1 px at 390 (today's in-drawing labels were 4.8 px). Today's phone table overflowed into a sideways scroller; the build folds it into one block per size.

Open question for the builder (one line): today's hero tent animates (HeroScene: rAF, IntersectionObserver, an exploded state, a reduced-motion path), and the comps are static. Does the motion stay?

## Priority issues (by cost to the visitor)

1. **Corturi phone notes mis-paired** (regression 1). A visitor choosing a size reads the wrong note.
2. **Contact phone alignment** (regression 2). P6 also brings the 360 address back above the fold.
3. **Panels lose their side gutter between the phone and desktop layouts.** `.panel{max-width:1152px;margin:32px auto 0}` has no side margin, so at 900, 1024 and 1100 px every panel runs from x 0 to the right edge, while the field's cards keep 24 px. A 1024 laptop or tablet loses the "sheets on a table" read. Fix: `width:calc(100% - 48px)`, the same gutter as the field's `.wrap`.
4. **Corturi and servicii at 1280: half the field is bare grid, and it costs servicii its fold.** The page-head card spans x 64–722. To its right, about 495 x 265 px (corturi) and 495 x 320 px (servicii) of graph paper hold nothing. After home has shown the tent there, it reads as a missing picture. Fix: widen `.head--page` to the container (64–1216), with the h1 in 5 columns and the lede in 7 on the same row, the layout every panel head already uses. That recovers about 100 px, so servicii's three services end above 800 again and corturi's plan rises with them. The band and the white card stay (RESULT 7). Contact's two cards already fill the field.
5. **Footer links without an underline** (regression 4).
6. **Phone page-head card: its band is inset, and it is padded differently from the panels.** On corturi, servicii and contact at 390 and 360, the "Planșa 0x" band sits 16 px inside the card's edges, and the card's text has 32 px of padding. Every panel's band runs edge to edge over 16 px of padding. At 360, "Date de identificare" wraps the band to two lines. Fix: bleed the band to the card's edges (`margin:0 -16px`) and use 16 px padding, as the panels do.
7. **At 1024 the spec card wraps 3 + 2 and leaves a hole.** The sixth slot is empty, and the Capacitate cell has no bottom hairline. Fix: a 6-column grid with the top three cells spanning 2 each and the bottom two spanning 3, all split by `hair`.

Already ruled, not re-raised: the comps still carry ASCII hyphens in ranges, and the copy sticky still says "hyphen". Controller 1 covers both.

## Strengths to keep

- The hero at 1280: the tent stands 460 x 345 px on its plot, the five facts sit in a card in its corner, and the link to Corturi is there. Region, drawing, specs and next step all fit above y 560.
- The phone hero: the tent's plate is the head of the spec card, Zonă leads the list, and the link is full width at 48 px. It is a real phone layout, not a squeezed desktop.
- Plate 01: the exploded drawing beside its parts list, with the same numbers in both and numbered circles only on the phone. Each panel's head band (number, name, scale) gives the sheet a clear start.
- The one palette separates without a single shadow: cards on the field at 1.23:1 plus a 1.53:1 edge and the ink top rule; panels on the ground at 1.09:1 plus a 1.73:1 edge; head bands at 1.12:1 on paper. The grid sits at 1.10:1 on the field (RESULT 3) and never competes with the linework. The footer's `fill-2` is 1.02:1 on the ground, so only its ink rule marks it. That is acceptable and needs no fix.

## Heuristic scores (0–4)

1. Visibility of system status: 3. The current place is underlined in orange and the selected size is ink-filled.
2. Match with the real world: 4. Measured drawings, units in mono, Romanian sentence case.
3. User control and freedom: 3. Conventional nav and the Drawer.
4. Consistency and standards: 2. Two band treatments, the gutter breaking between layouts, two look-alike circle sets on home, and contact values right-aligned.
5. Error prevention: 3. No forms. The only risk is the mis-paired notes.
6. Recognition rather than recall: 4. The key sits next to the drawing, and the labels are plain.
7. Flexibility and efficiency: 3. Title block, the table with scale bars, size chips.
8. Aesthetic and minimalist design: 3. Calm and grounded, docked one point for the bare half-field.
9. Error recovery: 3. Not applicable (no input). Scored neutral.
10. Help and documentation: 3. Capacity caveats, the distance note, the partner conditions.
Total 31/40.

**Clipped text:** I walked every text node of the twins on 4 pages at 5 widths (1280, 1024, 768, 390, 360) against every `overflow: hidden|clip` ancestor, `body`'s `overflow-x:clip` included. Result: 0 clipped, no ellipsis or line clamp, no page overflow. The canvas comps have no other clipping: their only `hidden|clip` rules are `html,body{overflow-x:clip}` and screen-reader-only headings, and each artboard's `h` equals the twin's measured page height (2419, 4177, 3112, 5334, 1754, 2966, 1334, 2397), so no wrapper cuts content. The only hit was on today's phone table, which scrolls sideways and isn't clipped.

**Detector** (with parsers, not degraded): home 5, corturi 3, servicii 2, contact 3, direction sheet 3. Dismissed:
- `cramped-padding` on `.look` (the full-bleed bands), `.card.tb` (the cells carry their own padding), `li` (14–20 px padding) and the plan `svg` (inside its 12 px frame): all false positives.
- `shape-assembled-illustration`: the site's own marquee model (waivers 80 and 47c).
- `codex-grid-background`, advisory: this is the winner's measured plot, kept by RESULT 7. Note that on servicii and contact it is decoration only.
- On the direction sheet, `cramped-padding` on a specimen card (an expected false positive) and `em-dash-overuse` (30, in the sheet's own prose, not on a screen).

**Rulings against this critique:** no clash. No fix above undoes what won, and P4 and P6 keep the field band, the white head card and its band (RESULT 7).

Don't dilute: the tent large on its gridded plot with the facts card in its corner, and on the phone the drawing seated on the spec card with Zonă first.
