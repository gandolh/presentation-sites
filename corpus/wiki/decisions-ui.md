---
summary: The calls about what the sites' React islands depend on (one icon family inlined at build time, Base UI under the four phone menus) and the visual world calls the owner reopened on the redesign board, starting with auto-service's move from the Bordcomputer to the job card on 2026-11-13. Split out of decisions.md on 2026-10-23.
updated: 2026-11-13
---

# Decisions: the islands' UI dependencies

The rest of the locked calls are in [decisions.md](decisions.md).

## Icons come from one family, inlined at build time

**2026-08-23** — `astro-icon` + `@iconify-json/ph` (Phosphor) for `.astro`
files, `@phosphor-icons/react` for the single React island. Currently saloon
only; the other three sites still hand-roll SVGs.

*Rejected:* hand-rolled SVG paths (the status quo), Lucide, and a React-only
icon library for the whole site.
*Why:* the hand-rolled paths had drifted to three different stroke widths
(1.5 / 1.6 / 2.0) across eight components, which is exactly the inconsistency an
icon set exists to prevent. Lucide was offered and is fine, but Phosphor has a
`light` weight that suits the brand's thin gold linework and ships the brand
glyphs (WhatsApp, Instagram, Facebook) in the same family, so one package covers
everything. A React icon library alone was rejected because most components here
are `.astro`: `astro-icon` inlines the SVG at build with **no runtime and no
sprite request**, which a React library cannot do for static markup.

*The cost, measured:* the React island went to 6.8 KB, so the named imports
tree-shook; the whole library would have been hundreds of KB. If that ever
regresses, check the import style first.

*The rule this creates:* one family, no hand-rolled paths. Written into
`sites/saloon/DESIGN.md`.

## Base UI under the phone menus

**2026-10-23**, the owner's call, to match their apps (atrium, imbatranimOS,
sports-app, trips and others). The four phone menus (saloon, auto-service,
subcort, tractari) are Base UI `Dialog`s
([site-patterns.md](site-patterns.md)). Base UI does the focus
trap, Esc, the scroll lock and focus return, and each site keeps its Tailwind
classes and tokens. subcort kept its Motion choreography through the popup's
`render` (replaced by CSS on the `Drawer`, below).

*Rejected:* keeping the hand-built traps (four copies of the same focus,
Escape and scroll-lock code), and turning `.astro` widgets (the FAQ
`<details>`, the nav) into islands to use more of Base UI, which would add JS
to static pages.

*The cost, measured* (all the site's JS, gzip, before → after):

| Site | Before | After | Cost |
|---|---|---|---|
| saloon | 62.6 kB | 82.3 kB | +19.7 kB |
| auto-service | 77.6 kB | 98.0 kB | +20.4 kB |
| subcort | 249.8 kB | 269.7 kB | +19.9 kB |
| tractari | 196.2 kB | 216.6 kB | +20.3 kB |

Raw, it is about 59 kB a site. The menu islands load with `client:load`, so
every page pays it. If that matters for a site, a later change can try
`client:idle` or `client:visible` for the menu island.

*The rule this creates:* a dialog in an island is Base UI's, not hand-built.
`.astro` widgets stay zero-JS.

## The phone menus on Drawer (2026-11-12)

The owner's call of 2026-11-10 (Q40): the four phone menus are a swipeable
`Drawer`, closed by a swipe, a tap outside, the X or Esc, each with a title
("Meniu", visually hidden). No theme switch (Q18): auto-service and tractari
stay dark, saloon and subcort light. The wrappers live per site in
`src/components/ui/Drawer.tsx` (Q5, Q15). `check-base-ui` is strict in
`check:conventions` since this change (it reports 0).

The cost, measured (the site's JS and CSS, gzip, concatenated `_astro/` files,
before → after): Drawer is heavier than Dialog.

| Site | JS before | JS after | CSS before | CSS after |
|---|---|---|---|---|
| saloon | 81.4 kB | 91.5 kB | 8.0 kB | 8.4 kB |
| auto-service | 96.0 kB | 106.0 kB | 12.2 kB | 12.6 kB |
| subcort | 267.0 kB | 275.0 kB | 6.8 kB | 7.3 kB |
| tractari | 214.5 kB | 224.5 kB | 9.1 kB | 9.7 kB |

*Left alone:* the Astro-scoped `<style>` blocks and the `global.css` rules for
markup that isn't Base UI, and the `text-[var(--color-…)]` classes in the
`.astro` files (a separate Tailwind brief, for the owner).

## auto-service: the Bordcomputer world gives way to the job card (2026-11-13)

**Changed, 2026-11-13.** On the estate redesign board the owner approved the direction "The job card" for auto-service and
with it reopened the world calls recorded in `sites/auto-service/DESIGN.md` (brief 05, owner decision 4). The site's own
[DESIGN.md](../../sites/auto-service/DESIGN.md) is rewritten from what shipped; the old lines are kept here as history.

| Old line (2026-08-23) | Now |
|---|---|
| North Star "The Bordcomputer": the page is the instrument binnacle of a BMW at night | "The job card": a workshop job card on warm graphite |
| The Trim Rule: brushed anodised console trim is the one light material and carries the conversion moment and the legal pages | The One-Card Rule: the light job card is the one light material (call, WhatsApp, symptoms, readout window); the legal pages read on it too |
| The Live-Amber Rule: one amber lights what is live (the call, the focused field, the active step) | The One-Red Rule (M red fills the call only, on the card or the ground) and the One-Amber Rule (amber only for the hours in the readout window, no glow); "Deschis acum" is a green dot, not amber |
| The Printed-Legend Rule: Azeret Mono for measurements and tracked capitals for legends | One face, Encode Sans Variable, in sentence case; no mono |
| The Segment-Coding Rule: M tri-colour as LED segments; Archivo's width axis; the gauge, the LED band and the "rail" | The M tri-colour is a 4px stripe only; the width axis is used once, for the wordmark; the gauge and the LED band are gone. The reopened sticky's "only the LED band survives, as the rail" is dropped: the one cue is the readout window from the old gauge |

**Kept:** no photography (the workshop drawing stays, in ink and line, its amber lamp gone); no roundel and the independence
disclaimer; one dark look with no theme switch (Q18); the services as hairline index rows, never a card grid; the closed
pictogram set.

**Also decided on the board:** the quote form leaves `PRODUCT.md` and no form is built; all nine service descriptions stay
on home; ranges take the figure dash U+2012 with no spaces and em dashes leave the copy.

**What this costs.** Fonts: Encode Sans Variable replaces three families. `animejs` leaves the site, because the gauge's
ignition sweep is gone. Two small inline scripts in `Base.astro` (the open-now dot, the phone call bar) replace the
reveal-on-scroll script, and nothing animates under `prefers-reduced-motion` beyond the drawer.


## saloon: the booking bar, type and focus ring reopened (2026-11-13)

**Changed, 2026-11-13.** On the estate redesign board the owner approved the direction "Menu beside the work" for saloon
and with it reopened four lines in `sites/saloon/DESIGN.md` (brief 06). The site's own
[DESIGN.md](../../sites/saloon/DESIGN.md) and [tokens.md](../../sites/saloon/docs/tokens.md) are rewritten from what
shipped; the old lines are kept here as history.

| Old line | Now |
|---|---|
| `MobileBookingBar`: a sticky bottom WhatsApp CTA that slides in once the user scrolls past the hero; it hides while Booking, Contact or the menu is on screen | Docked from the first paint at 760 px and under: the WhatsApp pill and a round `tel:` call button, and no in-hero button on phones. It hides only while the Booking card's or Contact's own button, or the menu, is on screen; the no-JS default stays visible. From 761 px the header's Programează-te pill shows |
| `.btn` pill, uppercase, `letter-spacing: 0.05em`; `.label-md` uppercase; a glued `→` | Sentence case, untracked; the arrow is an icon 6 px after the words |
| Focus ring `2px solid var(--color-gold)` at 3 px | `gold-ink`, 2 px at a 3 px offset (4.9:1 on the ground; gold was 2.14:1) |
| Texture: `.page-grain`, the banner dot, the hero's gold disc, `.loyalty-gold-motif` | All gone. The notice band is in flow, pale gold, no dot, and the header is sticky |

**Kept:** the one light look with no theme switch (Q18); Ana's photographs; Testimonials parked; Fraunces and Manrope;
WhatsApp green on every booking action.

**Also decided on the board:** the Services menu moved into the hero beside the photograph (the real-element exception),
each row with its own pre-filled Programează; Vezi serviciile is gone; the facts pair (`3+ ani de experiență`, `1 la 1`)
stays hidden until Ana's number is real; the contact label reads `Telefon și WhatsApp`.

## subcort: "Montaj" gives way to "On your ground" (2026-11-13)

**Changed, 2026-11-13.** On the estate redesign board the owner approved the direction "On your ground" for subcort (runner-up
"Montaj, mounted") and with it reopened four lines in `sites/subcort/DESIGN.md` and one in `PRODUCT.md` (brief 07, owner
decision 1, "Montaj stays the world"). The site's own [DESIGN.md](../../sites/subcort/DESIGN.md) is rewritten from what
shipped; the old lines are kept here as history.

| Old line | Now |
|---|---|
| The Light-Sheet Rule (`DESIGN.md` section 2): "The sheet is near-white and stays that way"; `PRODUCT.md` principle 5, "A near-white sheet" | A pale sage ground `#f0f4f0`; the hero and every page head sit on a darker sage field `#dfe8de` with a quiet 32 px grid; cards and panels stay near-white `#fcfdfc`. Still light, with no switch |
| Section 3: IBM Plex Sans for language | Commissioner Variable (its latin-ext file maps ș and ț to the comma-below glyphs); IBM Plex Mono stays for figures and sheet numbers |
| Section 4: the plate-head spine, an 11rem column for the number and note and one asymmetric rule | A head band across each panel (number, name, scale, in sentence case) and cards on a plot; the numbered register stays (`01`, `02`, `01.1`) |
| Section 2 and the Don'ts: the orange selected size (`scale__btn[data-on]` filled with signal) | The selected size is ink-filled with paper text; orange stays on numbers, leaders and the current place |
| Uppercase tracked labels (`.datum-key`, `.plate-no`, the title block's `dt`) | Sentence-case labels at 14/20 500, untracked |

**Kept:** one model in `src/lib/draft.ts` for the hero, the plate, the scale plan and the OG card; the Annotation Rule; no
photography; light with no theme switch (Q18); no calls to action (`PRODUCT.md` principle 3); the hero tent's motion, its
IntersectionObserver pause and its reduced-motion still.

**Also decided on the board:** the hero keeps `Vezi dimensiunile și dotările` as a neutral link-button; both lede sentences
stay word for word; ranges take the figure dash U+2012 with no spaces; the `·` joins became separate parts; the hero eyebrow
is gone and its job moved to the `Zonă` cell (above the fold at 1280, the first row on a phone).

**What this costs.** Fonts: Commissioner Variable `5.3.0` replaces IBM Plex Sans Variable. The hero's tent keeps its WebGL
loop; its two panel tones are now the `membrane` and `membrane-shade` tokens (two tones, where the old shading had four).

