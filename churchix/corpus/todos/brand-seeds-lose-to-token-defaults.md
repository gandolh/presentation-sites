---
title: The brand seeds lose to tokens.css's defaults in the built pages
created: 2026-10-23
status: open
tags: [theming, white-label]
---

# The brand seeds lose to tokens.css's defaults in the built pages

`packages/ui/src/layouts/BaseLayout.astro` writes the church's seeds as an
inline `<style>:root{--primary:…;--secondary:…}</style>` in the head. In the
built page that style comes **before** the `<link>` to the layout's
stylesheet, which carries `tokens.css`'s own `:root{--primary:#4e0816; …}`.
Both rules have the same specificity, so the later one wins and every church
renders with the default palette. The parish shows `#4e0816`, not its
`#6b1f2a`. A second brand's seeds change nothing either.

Found during brief 19's second-brand check (2026-10-23). It undercuts the
white-label rule that a church re-skins by token swap alone.

## Acceptance

- In a built page, `getComputedStyle(document.documentElement).getPropertyValue('--primary')`
  is the church's `brand.primary`.
- A throwaway second brand in `site.json` re-skins the header, the menu and
  the buttons without a browser-side override.
- Probably either the seeds move to a selector that outranks `:root` (for
  example `html:root`), or the defaults in `tokens.css` move to
  `:where(:root)`. Check that the derived `color-mix()` roles still follow.
