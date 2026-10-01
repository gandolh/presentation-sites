# Task 05 — Mobile menus: give focus back to the menu button on close

## Context

Audit 2026-09-27 (see [log](../../log.md)). Three of the four mobile menus are
modal dialogs. On open they move focus inside and trap Tab. On close they drop focus:

- `sites/saloon/src/components/MobileMenu.tsx:38-44, 85-92`
- `sites/auto-service/src/components/MobileMenu.tsx:40-46, 96-105`
- `sites/tractari/src/components/MobileMenu.tsx:30-36, 82-92`

Esc and the close button both call `setOpen(false)`. The dialog unmounts while
it holds focus, so focus falls to `<body>`. Nothing keeps a ref to the trigger
button.

**Failure:** a keyboard user opens the menu, presses Esc, and their next Tab
starts again from the top of the document. That includes anyone on a desktop
zoomed to 200% or more, because these sites switch to the mobile layout at that
zoom. Returning focus to the invoker is a hard rule of the dialog pattern, and
WCAG 2.4.3 requires it.

`sites/subcort/src/components/MobileMenu.tsx:16, 24-27` already does this on Esc
through a `buttonRef`; use it as the reference. subcort itself is out of scope.

## Files you OWN

- the three `MobileMenu.tsx` files listed above

## Files you must NOT touch

- `sites/subcort/**`, the Nav components, any CSS.
- `sites/saloon/src/components/MobileBookingBar.astro`. It hides itself while
  the menu is open by watching `document.body.style.overflow`. Keep the
  scroll-lock behaviour exactly as it is so that coupling keeps working.

## What to do

Add a ref to the open button.

- When the menu closes through **Esc or the close button**, move focus back to that button.
- When it closes because a **navigation link** was activated (saloon's
  `#section` links, the auto-service and tractari page links), do not pull focus
  back. Let the navigation move it.

Keep everything else unchanged: focus moving in on open, the Tab trap, the
scroll lock, and the staggered `--i` animation.

## Acceptance

In a real browser at 390px wide, for each of the three sites:

- Tab to the menu button and press Enter → focus is inside the dialog. Press Esc → `document.activeElement` is the menu button.
- The same result when closing with the close (X) button.
- saloon: choosing "Servicii" still closes the menu and lands on `#servicii`.
- The Tab trap still cycles inside the open dialog.
- `npx astro check` → clean in all three sites.
