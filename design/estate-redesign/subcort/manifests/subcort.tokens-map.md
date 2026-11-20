# Subcort tokens map (direction "On your ground")

The site keeps its mechanism (one `@theme` block in `src/styles/global.css`, one light look, no dark block). The board's roles already carry the site's names, so almost nothing is renamed.

## Renamed or remapped (board role to site token)
- Page ground: `--color-sheet` (value moves from #fbfaf9 to #f0f4f0).
- Cards, header, panels: `--color-paper` (from pure white to #fcfdfc, Hallmark 7b).
- Panel head band and footer: `--color-fill-2` (from #f2f4f5 to #eef1ee).
- Rules inside a card: `--color-hair` (from #dce0e3 to #dde1dd).
- Language face: `--font-sans` (from IBM Plex Sans Variable to Commissioner Variable; fontsource `@fontsource-variable/commissioner` 5.3.0, latin-ext carries the comma-below ș and ț). Plex Mono stays for figures.
- Container padding: `--sheet-pad` (from clamp(1.15rem, 4vw, 3.75rem) to clamp(0.75rem, 4vw, 1.5rem)).
- Ink, ink-2, line, line-soft, signal, signal-hover, signal-soft, on-signal-soft, radius-sm, radius-md: unchanged values (the stylesheet's hex comments, `#22303A` and `#C2481E`, are stale; the oklch values give #1d2e37 and #af4316).

## New tokens (and the component that needs them)
- `--color-field`: the plot band of the hero and of every page head.
- `--color-grid`: the 32 px grid drawn on the field (and on the phone plate under the tent).
- `--color-edge`: the 1 px edge of cards, panels, the menu button and the footer's social buttons.
- `--color-deck`, `--color-membrane`, `--color-membrane-shade`: the tent drawing (HeroScene, ExplodedPlate), replacing their hex literals.
- `--radius-full`: the numbered callout circles (`.callout-no`).
- `--text-display`, `--text-h2`, `--text-title`, `--text-lede`, `--text-body`, `--text-label`, `--text-figure` (with `--line-height`, `--font-weight`, `--letter-spacing`): the site has no `--text-*` tokens today; `.heading-xl`, `.heading-lg`, `.heading-md`, `.lede` and the datum classes move onto them.

## Site tokens the design no longer uses (keep or drop is the code brief's call)
- `--color-fill` (#eaedef, never used by the board).
- `--color-sheet` as the card paper (its old job): cards use `--color-paper`.
- `--color-success`, `--color-error`: kept, unused (the site has no form).
- The uppercase, tracked label styles (`.datum-key`, `.plate-no`, the `.titleblock dt`): the board sets labels in sentence case with `--text-label`.
- Radius and shadow: no shadow token exists or is added.

## Layout notes the code brief needs
- The hero is a full-bleed `--color-field` band with a 32 px grid (two linear-gradients of `--color-grid`); on phones the tent sits on its own small gridded plate at the head of the spec card, and the `Zonă` row leads the spec list.
- The selected size in the Corturi picker is ink-filled (`--color-ink` on `--color-paper`), not orange, so the "never fill a surface with orange" rule (DESIGN.md) holds.

## Round 2 additions
- `--color-signal-soft` and `--color-on-signal-soft` also tint the "Opționale" band in Dotări (7.08:1), besides the note banner.
- Ranges in copy use U+2012 (the figure dash), set in the figure face where they carry units.
- Panels and cards keep a 24 px side gutter (`calc(100% - 48px)`, 12 px on phones); the page-head card spans the container with the title in 5 columns and the lede in 7.
- Footer links are underlined in `--color-line-soft`, 1 px, offset 4 px.
- Home's step numbers (01 to 04) use `--font-mono` 600 15/20 in `--color-signal`, no ring.
