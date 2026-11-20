# tractari: the controller's rulings (2026-11-13)

## After the critic (critiques/tractari.md, fix): round 2

Do the critic's priority issues 1-6 and regressions R1-R4 as written there, with these rulings:

1. **One observer on the dispatcher plate** (`.line--main`) drives both the phone dock and the desktop header fill. This is a tighter trigger than RESULT ruling 2's "the card", with the same intent; the Decision sticky says so. The header call fills (`call` ground, `on-call` ink) once the plate leaves the viewport, which ruling 5 allows. The Servicii call is an outline at every width. On the board, draw each artboard's header call as it would be in that frame: an outline wherever the plate is in view, filled wherever it isn't (servicii, acoperire and the scrolled frames). Exactly one orange call per frame.
2. **761-1000 px keeps the header call** between the wordmark and the burger, 44 px tall, under the same fill rule. The dock stays phone-only (≤760).
3. **Numbers never wrap.** At 1000 px and below, the plate takes the full row with the two backups 6 + 6 under it, and `.num`/`.n2` get `white-space: nowrap`. No number below 40 px on the plate. Add a "no phone number wraps" check to your Floor (one line box per number) at every width you shoot, 768 and 800 included.
4. **"Ce facem ↓" goes inline at the end of the lede on the phone,** padded to a 44 px target. That keeps ruling 3 and wins back 40 px. Report Andrei and Vasile at 360x690 too.
5. **Cum funcționează:** the h2 sits at the plate's lower left, 24 px above the strip, with the scene on or off. End the plate's gradient and scrim on `ground`. No new picture.
6. **Backup lines get a 20 px phone glyph** in `call`, left of the name on phone rows and before the number in desktop cells, and in the open dock's two rows.
7. **Nav order** follows the page: Servicii, Acoperire, Cum funcționează, Contact, in the Drawer too, with `scroll-margin-top` equal to the banner plus the header at each width.
8. **The tile pictograms stay orange** (the winning sketch's, seen by the judges). The direction sheet's type specimens get `overflow: visible`.
9. **wf.py:** the self-closed SVG children in the plain twins are valid foreign content. No change is needed; the canvas comps already pass.
10. **Re-run the Floor from scratch,** with the clip, text-in-column, gap and the new number-wrap checks. Report the first screens at 1280x800, 768x1024, 390x844, 360x800 and 360x690, plus the scrolled frames. The ask sticky about 9 vs 10 `tel:` links still stands; recount after the glyph change.
