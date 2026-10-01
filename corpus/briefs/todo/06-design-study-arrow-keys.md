# Task 06 — design-study: arrow keys on a focused carousel must not change the theme

## Context

Audit 2026-09-27 (see [log](../../log.md)). The neutral switcher binds page-wide
keys in `sites/design-study/src/components/Switcher.astro:318-338`. ← and → (and
`[` / `]`) jump to the previous or next *theme*, which is a full page
navigation. The only exception is focus inside an `input`, `textarea`, `select`
or `[contenteditable]`.

All three carousels mark up their dot pickers as ARIA tabs but implement none of
the keyboard behaviour that the tabs pattern requires:

- `src/components/Carousel.tsx:105-117`
- `src/themes/spatial/Carousel.tsx:149-160`
- `src/themes/liquid-glass/Carousel.tsx:159-170`

**Failure:** a screen-reader user tabs to a dot and hears "Image 2, tab, 2 of 5".
They press → because the announced role tells them to, and they are navigated
to a different design style, away from the post they were reading. Any
keyboard user who presses an arrow on a focused carousel control hits the same
jump.

## Files you OWN

- `sites/design-study/src/components/Switcher.astro` (the `<script>` only)
- the three `Carousel.tsx` files listed above

## Files you must NOT touch

- Any `theme.css`. Fourteen themes style the selected dot through
  `[aria-selected="true"]`. Keep the tab roles, `aria-selected`, every class name
  and the DOM shape, so no stylesheet needs to change.
- `Pager.astro`, the route files, `styles.ts`.

## What to do

1. **Carousels:** implement the tabs keyboard model the markup already promises.
   - Roving tabindex: only the selected dot is in the Tab order
     (`tabIndex={selected === i ? 0 : -1}`).
   - ← / → select the previous or next dot, scroll the carousel to it and move focus to it.
   - Home / End go to the first and last dot.
   - Call `event.preventDefault()` on every key you handle.
2. **Switcher:** only step themes when the key is not aimed at something
   interactive. Return early if `event.defaultPrevented` is set, or if the
   target is inside `a, button, summary, [role="tab"], .ds-carousel`. Keep the
   existing form-field check. `G` and Esc keep their current behaviour.

## Acceptance

- On a post page (e.g. `/swiss/<post>/`): focus a carousel dot and press →.
  The URL does not change, and the next dot is selected and focused.
- Focus the carousel's "Next image" button and press →: the URL does not change.
- With nothing focused (click plain body text first), → still goes to the next
  theme and keeps the post. `G` opens the picker and Esc closes it.
- The dots render and switch images correctly in minimalism, spatial and
  liquid-glass, which cover the three carousel implementations.
- `npm run build` (which runs `check:routes`) → 183 pages. `npx astro check` → clean.
