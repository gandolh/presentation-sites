# auto-service tokens: board "The job card" to the site's names

Mechanism: one `@theme` block in `sites/auto-service/src/styles/global.css`, dark values only, no `[data-theme]` block (the site keeps one look, brief 05 Q18). `auto-service.tokens.css` is a drop-in for the colour, font, radius and shadow part of that block.

## Renamed or remapped (board role to app token)

- ground to `background` (and `surface`, kept equal); value moves from oklch 13.5% to #161310 (warm, not cold graphite)
- surface to `surface-container-lowest` (the default panel); `surface-container-low` takes the same value
- surface-2 to `surface-container`; `-high` and `-highest` take the same value
- ink to `on-surface`; ink-muted to `on-surface-variant`
- line-strong to `outline`; line to `outline-variant`
- card to `inverse-surface`; card-ink to `inverse-on-surface`; card-ink-muted to `inverse-on-surface-variant` (the light card replaces the aluminium trim; the trim's 87% and 93% steps are gone)
- signal to `primary` (amber becomes M red, #c52525, on the card or the ground only); signal-hover to `primary-hover`; on-signal to `on-primary`
- focus to `primary-bright` (a pale red tint, #fdc9c2; the ring on dark; the card uses `inverse-on-surface`)
- m-blue, m-indigo, m-red keep their names with the sketch's hexes (#2fa7f3, #7e74e1, #ed413b); success keeps its name (#4fc47f); whatsapp keeps its name (#42b970); error keeps its name (#e97ab2)
- `--radius-lg` changes from 0.375rem to 0.5rem and `--font-display` and `--font-body` both become Encode Sans Variable

## New tokens (and the component that needs each)

- `inverse-outline-variant` #cbc7c0: hairlines between the card's rows (JobCard)
- `inverse-surface-container` #dddad5: row and button hover on the card only (JobCard)
- `whatsapp-on-inverse` #00773d: the WhatsApp mark on the card (JobCard buttons and rows; never text)
- `--shadow-card`: the job card's one shadow
- `--text-display`, `--text-heading`, `--text-number`, `--text-title`, `--text-body`, `--text-label` with line height, weight and tracking: the heading, legend and body classes use them instead of literal sizes (the app had no `--text-*` tokens)

## App tokens the design no longer uses (keep or drop is the code brief's call)

- `primary-container`, `on-primary-container`, `primary-edge`: the amber wells and hover edges
- `warning`, `on-error`: no check-control amber, and error text uses `error` on the dark panels
- `surface-menu`: the phone menu sits on `background` (a darker-than-ground well is gone)
- `inverse-surface-2`, `link-on-trim`: the trim is gone; the card links are underlined card ink
- `--font-mono` and Azeret Mono: no figure is set in mono (Floor 64); the `.legend`, `.reading` classes go with it
- `--color-whatsapp-hover`: the WhatsApp control is an outline or steel button; hover is a tone step, not a colour
- the amber bloom, the gauge and its `BayScene` amber lamp: the bay drawing stays (today's asset) but recolours to ink and line
