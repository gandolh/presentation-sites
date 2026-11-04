# Brief 01 — The brand seeds win over the token defaults

## Context

`packages/ui/src/layouts/BaseLayout.astro` writes the church's seeds as an
inline `<style>:root{--primary:…;--secondary:…}</style>` in the head. In the
built page that style comes **before** the `<link>` to the layout's
stylesheet, which carries `packages/ui/src/styles/tokens.css`'s own
`:root{--primary:#4e0816; …}`. Both rules have the same specificity, so the
later one wins and every church renders with the default palette: the
parish shows `#4e0816`, not its `#6b1f2a`, and a second brand's seeds change
nothing.

Found during the phone menu's second-brand check (2026-10-23). It undercuts
the white-label rule that a church re-skins by token swap alone
([design-system.md](../../wiki/design-system.md)). Promoted from the todo
`brand-seeds-lose-to-token-defaults` in a grill with the owner on
2026-11-03.

## Files you OWN

- `packages/ui/src/layouts/BaseLayout.astro` (the seed block)
- `packages/ui/src/styles/tokens.css` (the defaults' selector)
- `corpus/wiki/design-system.md` (the "Open" note becomes how it works)

## Files you must NOT touch

- The church's `site.json`: the throwaway second brand is for the check
  only and is not committed.

## What to do

1. Make the seeds outrank the defaults without depending on order: either
   the seeds move to a selector that outranks `:root` (for example
   `html:root`), or the defaults in `tokens.css` move to `:where(:root)`.
   Pick one and say why in `design-system.md`.
2. Check that the roles derived with `color-mix()` from the seeds still
   follow them.
3. Build the app and check the parish's colours.

## Acceptance

- In a built page,
  `getComputedStyle(document.documentElement).getPropertyValue('--primary')`
  is the church's `brand.primary` (`#6b1f2a` for the parish).
- A throwaway second brand in `site.json` re-skins the header, the menu and
  the buttons without a browser-side override; revert it afterwards.
- `astro check` reports 0 errors and the build passes.

## Outcome (2026-11-04)

Built. `packages/ui/src/styles/tokens.css` keeps its defaults in
`:where(:root)` (zero specificity), so `BaseLayout.astro`'s plain `:root` seed
block wins whatever the order; the why is in
[design-system.md](../../wiki/design-system.md), "How the seeds win". In the
built parish site `--primary` reads `#6b1f2a` and the derived roles follow it
(`--primary-container` is `color-mix(in srgb, #6b1f2a 80%, #fff)`); the header
CTA and hero buttons render `rgb(107, 31, 42)`. A throwaway second brand
(`#1e3a5f` / `#2e8b57`) re-skinned the header, the phone menu and the buttons,
then `site.json` was reverted. `astro check`: 0 errors; the build passes (10
pages). The parish's headings are now its own `fontHeading`, Source Serif 4:
see [open-questions](../../wiki/open-questions.md). Log entry
`[2026-11-04] done | Brief 01`.
