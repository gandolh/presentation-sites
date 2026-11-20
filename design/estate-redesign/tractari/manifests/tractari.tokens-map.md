# AXA Tractări tokens: board role to site token

Mechanism kept: one `@theme` block in `src/styles/global.css`, OKLCH values, dark only (there is no theme switch, so no `[data-theme="dark"]` block). The site's Material-ish role names stay; most keep their name with a new value. The phone type overrides sit outside the block (`@theme` cannot hold a media query).

## Renamed or remapped (board role to site token)
- ground -> `background` and `surface` (the same value, as today; `surface-container-lowest` follows it)
- surface (raised) -> `surface-container`; surface-2 -> `surface-container-high` (`-low` and `-highest` kept as aliases)
- line -> `outline-variant`; line-strong -> `outline`
- ink -> `on-surface`; ink-muted -> `on-surface-variant`
- amber -> `primary` (and `primary-hover`, `primary-bright` set to the same value); on-amber -> `on-primary`. Amber is no longer text: the code brief drops `.eyebrow`, `.stop-label`, `.glow-word`, `.chip` colour and `.badge-nonstop` text uses
- call -> `accent`; call-hover -> `accent-hover`; on-call -> `on-accent` (was white at 3.02:1, now `#1a0b05` at 6.20:1). The orange `box-shadow` glow on `.btn-call` goes
- banner / on-banner -> `primary-container` / `on-primary-container`
- focus ring -> `primary` (unchanged mechanism, `:focus-visible`)
- radii: board role "control" -> `radius-md` (7 to 4 px); "well" -> `radius-lg` (10 to 8); "panel" -> `radius-xl` (15 to 12)
- headings: `.heading-xl|lg|md` lose `text-transform: uppercase` and take the new `--text-display|h2|h3`; the wordmark keeps its capitals

## New tokens (component that needs them)
- `plate-top|mid|beacon|moon|road`, `scrim`: the scene plate in Cum funcționează (today hardcoded in `Hero.astro`; the 3D canvas mounts over it). The plate's gradient and scrim end on `background`, so there is no `plate-low` or `scrim-edge` any more
- `mask-on`, `mask-half`: the lane's fade in the steps strip
- `shadow-board`: the board (the only raised object)
- `text-display|h2|h3|lede|body|label` with `--line-height` and `--font-weight`: the type scale (today's sizes are clamp() values in classes)

## App tokens the design no longer uses (keep or drop is the code brief's call)
- `primary-container` as a tile-icon fill, `accent-soft`, `on-accent-soft`, `accent-bright`, `headlight`, `inverse-*`, `success`, `error`, `on-error`
- `radius`, `radius-sm`'s uses, and the `.road__line` / `.stop__marker` spine (the design drops the spine; hero scene moves to Cum funcționează)
- `.grain`, `.reveal` hover lifts, `beacon-pulse` (Floor 10)

## Round 2 notes for the code brief
- The header call takes a filled state (`accent` ground, `on-accent` ink) once an IntersectionObserver on the dispatcher plate reports it out of view; the same observer shows the phone dock. The Servicii call is an outline at every width (`outline` edge, `on-surface` text, `accent` icon).
- Backup-line phone glyphs use `accent` on `surface-container-high` (4.55:1).
- Every phone number is `white-space: nowrap`.
- Anchors take `scroll-margin-top`: 101px (banner plus header) and 113px at 760px and below.
