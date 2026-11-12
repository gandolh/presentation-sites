---
summary: The calls about what the sites' React islands depend on - one icon family inlined at build time (Phosphor), and Base UI under the four phone menus (Dialog, then Drawer), with the measured JS each costs. Split out of decisions.md on 2026-10-23.
updated: 2026-11-12
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
