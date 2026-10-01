// The keyboard half of the carousels' dot pickers.
//
// The dots are marked up as ARIA tabs ("Image 2, tab, 2 of 5"), and a role is a
// promise: a screen-reader user hears "tab" and presses an arrow. With no
// handler here, that arrow fell through to the switcher's page-wide keys and
// navigated to a different design style, away from the post being read.
//
// So the tabs pattern, as markup already promised it: a roving tabindex (only
// the selected dot is in the Tab order), ← / → to the previous / next image,
// Home / End to the first / last, focus following the selection, and
// `preventDefault()` on every key handled — which is also what tells the
// switcher to leave the key alone.
//
// Its own module rather than an export of Carousel.tsx so the spatial theme,
// which has no Embla, can use it without importing Embla.

import type { KeyboardEvent } from "react";

/** Only the selected dot is reachable with Tab. */
export const dotTabIndex = (selected: number, i: number) => (selected === i ? 0 : -1);

/**
 * Handle a key on dot `i` of `count`. Selects through `select`, then focuses the
 * newly selected dot. Returns without touching the event for any other key.
 */
export function onDotKey(
  event: KeyboardEvent<HTMLButtonElement>,
  i: number,
  count: number,
  select: (index: number) => void,
) {
  const last = count - 1;
  const to =
    event.key === "ArrowRight" ? Math.min(last, i + 1)
    : event.key === "ArrowLeft" ? Math.max(0, i - 1)
    : event.key === "Home" ? 0
    : event.key === "End" ? last
    : null;
  if (to === null) return;
  event.preventDefault();
  select(to);
  const dots = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  dots?.[to]?.focus();
}
