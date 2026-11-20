# saloon: the controller's rulings (2026-11-13)

## Before the critic (from the build report)

1. **Drop the `home` whole-page Today artboards** (no Proposed counterpart on the layout); keep the four screens' Today pairs (first screens).
2. **Fixture changes stand** with their stickies: `07xx xxx xxx` for the placeholder phone (gate 67), no `·` separators, the `3+` and `1 la 1` facts held back until the real number is set (ask sticky).
3. **The 1280 fold:** all three service rows are whole above 800 px, which is what ruling 2 asks; the card's foot line below the fold is fine.

## On the critique (round 2)

The critic (`saloon.md`) stands, with these calls:

4. **No clipped price, and a check that would have caught it.** Let the price line wrap (`/ unghie` drops to a second line); nothing truncated. Add a clip check to your shoot: for every text node, its box must sit inside every `overflow: hidden|clip` ancestor's box, at 1280, 1024, 768, 390 and 360. Report it.
5. **761-900 px:** the hero photo slot gets 240 px, and the header's WhatsApp pill shows from 761 px up so a booking action stays in reach; the docked bar stays at 760 and under (its range waits on ask 1).
6. **1280 spacing:** take the critic's desktop budget (header 68, h1 gap 16, rows 12/14, description +2). If row 3 can't stay whole above 800 with it, ruling 2 wins: the prices stay whole and the hero air gives way.
7. **Anchors:** `scroll-padding-top` = header height + 16; redraw servicii at 390/360 so they open on the card.
8. **FAQ:** the questions in one raised card with ruled rows; the help card gets the card shadow.
9. **The h1** gets `opsz` 96 on desktop; check the `e` crossbar at every size it's set.
10. **The dead field** beside the contact card at 1280: close it (balance the columns), no invented content.
11. Re-run every Floor check from scratch, the new clip check included, and report the first-screen checks at 1280x800, 390x844 and 360x800.
