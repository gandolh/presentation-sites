# churchix: the controller's rulings on the critique (2026-11-13)

They override the critic (`churchix.md`) where they differ. Everything else in the critique stands.

1. **Pomelnice says it first.** With no endpoint set, the page opens with the note that online sending is off, word for word, as the first card over the band. Add an Ask sticky: show the `Pomelnice indisponibile` state instead (already on the Direction sheet)?
2. **The name is never the margin.** On phones the parish name is 28 px (DESIGN.md's fixed mobile size) and the arch stays at the direction's phone floor. Win the room elsewhere: the IBAN on one line at 16/24 below 380 px. Nothing may sit under the bottom bar; the giving card may fall below the fold if it must. Test a 70-character parish name at 390 and 360 and report what moves.
3. **Text stays in its column.** `.when{flex-wrap:wrap}` so `17:00` never crosses the divider (960 to 1280). Add a check to your shoot: every text box sits inside its card or cell, and inside every `overflow: hidden|clip` ancestor, at 1280, 1024, 960, 768, 390 and 360. Report it.
4. **The phone heading cascade:** scope the phone block's `h2`/`h3` sizes so `Transfer bancar`, `Date de contact` and the footer headings keep their own sizes.
5. **Ruling 1 again (the band):** the giving buttons in one row at 960 px and up (equal-height cards); on screens 760 px tall or less the arch goes to 210 x 252; the name at 52/60 at 1280 so it fills the band and outranks the time (the time stays the loudest fact after the name).
6. **Tokens:** give the darker container mix its own name; keep `--on-primary-container` and `--surface-container-low` for the four components that use them. Say so in the map.
7. **The kickers** stay dropped on every page (Floor 9 is estate-wide); a note sticky says the `PageShell` prop goes for Despre, Contact and the disabled Pomelnice too.
8. **Seed 2's icons** must not read as disabled: icons take a role with at least 3:1 on their ground in both seed sets.
9. Re-run every Floor check from scratch, the new text check included, and report the first-screen checks at 1280x800, 1366x768, 390x844 and 360x800.
