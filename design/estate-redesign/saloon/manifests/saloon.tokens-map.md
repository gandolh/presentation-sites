# Saloon tokens: board to site

Source: `src/styles/global.css` (one `@theme` block, Material-style roles). The look is light only: the site has no dark block and gets none (Q18, `decisions-ui.md`).

## Renamed or remapped (board role to site token)

| Board role | Site token | Change |
|---|---|---|
| ground | `--color-surface`, `--color-background`, `--color-surface-bright` | `#fff8f6` to `#f5e8e2` |
| band | `--color-surface-container-low` | `#fff1ec` to `#efdcd4` |
| card | `--color-surface-container-lowest` | `#ffffff` to `#fffcfb`, now always with a 1 px `outline-variant` edge and `--shadow-card` |
| well | `--color-surface-container-high` | `#fae4db` to `#f3ddd5` |
| line | `--color-outline-variant` | `#d3c3c0` to `#dcc3ba` |
| control edge | `--color-outline` | `#817472` to `#86726e` |
| menu head, loyalty panel | `--color-primary-container` and `--color-blush` | unchanged `#f4d6d0` |
| subtitles | `--color-secondary` | `#745b1b` to `#6f561a` |
| notice | `--color-secondary-container` and `--color-on-secondary-container` | `#ffdc8e` / `#795f1f` to `#f6e4bd` / `#5a4512` (the loud yellow becomes a pale gold) |
| prices, numerals, focus ring | `--color-gold-ink` | `#806619` to `#7a6118` |
| ink, muted ink, rose-brown, gold, blush-deep, WhatsApp greens | `--color-on-surface`, `--color-on-surface-variant`, `--color-primary`, `--color-gold`, `--color-blush-deep`, `--color-whatsapp`, `--color-whatsapp-deep` | unchanged |
| white on primary | `--color-on-primary` | `#ffffff` to `#fffcfb` (Hallmark 7b) |
| softer container steps | `--color-surface-container`, `--color-surface-container-highest`, `--color-surface-dim` | retuned to sit with the new ground; used by the FAQ and spare |

Code changes that are not tokens, for the brief:
- the base focus rule moves from `var(--color-gold)` to `var(--color-gold-ink)`, 2 px at a 3 px offset;
- `.btn` and `.label-md` lose `text-transform: uppercase` and the 0.05em tracking (sentence case, Floor 9 and gate 67);
- the `→` glued to `Vezi serviciile`/`Programează` becomes an arrow icon 6 px after the text, and `Întreabă-mă →` too;
- the banner dot, the hero's gold disc and the film grain go.

## New tokens (and the component that needs them)

| Token | Component |
|---|---|
| `--color-on-whatsapp` | `.btn-whatsapp`, the booking card and the dock (today a literal `#ffffff`) |
| `--color-on-whatsapp-wash` | the glyph disc on the Booking section's WhatsApp card (today `bg-white/15`) |
| `--color-inverse-on-surface-variant` | footer headings, legal strip and blurb (today opacity 60 to 80) |
| `--color-inverse-wash`, `--color-inverse-line` | footer social hover, the ANPC chip, the legal hairline (today `white/10`) |
| `--shadow-card`, `--shadow-glow` | the menu card, islands, FAQ rows, header pill and dock; the green booking buttons |
| `--text-display`, `--text-heading`, `--text-title`, `--text-lead`, `--text-label` (+ line height, weight) | replace the `heading-xl/lg/md` clamps and `label-md`; six sizes with body 16/24 |
| `--z-index-header`, `--z-index-dock` | sticky header and the phone dock (the base-ui skill's rule 5 asks for named layers) |

## Site tokens the design no longer uses (keep or drop is the code brief's call)

- `--color-surface-tint`, `--color-inverse-primary`, `--color-tertiary*`, `--color-error*` and `--color-surface-variant`: not drawn (no form and no error state on this site); keep `error` for later forms.
- `--color-cream`: kept, now only the end stop of the hero picture's gradient.
- `--radius-md` (0.75rem): not drawn; radii are 8, 16, 24 and full.
- `.btn-secondary`'s blush border and `.btn-on-blush`'s hover to `inverse-surface`: replaced by the outlined `outline` edge and the primary button; `.page-grain` and `.loyalty-gold-motif`: dropped.
