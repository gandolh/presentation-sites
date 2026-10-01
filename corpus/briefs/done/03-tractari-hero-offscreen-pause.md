# Task 03 — tractari: actually pause the WebGL hero when it scrolls off-screen

## Context

Audit 2026-09-27 (see [log](../../log.md)).
`sites/tractari/src/components/hero/HeroCanvas.tsx:53` says "Pause when
off-screen or tab hidden (battery)", but only the tab-hidden half is implemented:

- The IntersectionObserver callback (`:55-61`) sets `visible` and *restarts* the
  loop when the hero comes back. It never cancels the loop when the hero leaves.
- `loop()` (`:74-81`) checks `disposed` but not `visible`, and always schedules
  the next frame.

**Failure:** once a visitor scrolls past the hero, the Three.js night-road scene
keeps rendering at the display's refresh rate for the rest of the visit. On a
phone that is continuous GPU load, draining battery while the visitor reads the
services section or reaches for the call dock. The `visibilitychange` path
(`:63-71`) is correct.

`sites/subcort/src/components/HeroScene.astro:112-116` is a working version of
the same pattern: it cancels the frame when the hero is no longer intersecting.

## Files you OWN

- `sites/tractari/src/components/hero/HeroCanvas.tsx`

## Files you must NOT touch

- `sites/tractari/src/components/hero/scene.ts` (the scene itself is fine)
- Everything outside `sites/tractari/`

## What to do

When the observer reports that the host is not intersecting, cancel the pending
frame and set `raf = 0`, the same way the `document.hidden` branch does. Keep
the restart logic as it is: it already resets `last`, so `dt` does not jump.
Also make `loop()` return without rescheduling when `!visible || document.hidden`,
so a frame that is already in flight cannot re-arm the loop.

## Acceptance

- In a real browser (agent-browser or Playwright) at 390×844 and 1280×800:
  - With the hero in view, the scene animates.
  - After scrolling it fully out of view, no further frames render. One way to
    check: temporarily count `scene.render` calls on a `window.__frames`
    counter, sample it twice 2 s apart, and confirm the two values are equal.
    Remove the counter before finishing.
  - Scrolling back resumes the animation without a jump.
- Reduced motion still never downloads the scene chunk. Switching tabs still pauses and resumes.
- `npx astro check` in `sites/tractari` → 0 errors. The site builds with `PUBLIC_BASE=/tractari`.

## Outcome — 2026-10-01

The observer now cancels the pending frame and sets `raf = 0` when the host
stops intersecting, and restarts (resetting `last`) only when it comes back and
the tab is visible. `loop()` returns without rescheduling when `!visible ||
document.hidden`, so a frame already in flight cannot re-arm it. The
`visibilitychange` handler is unchanged.

**Measured** with a temporary `window.__frames` counter (removed before
commit), in Playwright with SwiftShader WebGL, against the built site served
at `/tractari/`:

| | in view | scrolled away | back in view |
|---|---|---|---|
| 390×844, fixed | +35 / 2 s | **+0** / 2 s | +37 / 2 s |
| 1280×800, fixed | +25 / 2 s | **+0** / 2 s | +26 / 2 s |
| 390×844, old code (control) | +35 | +34 | +41 |
| 1280×800, old code (control) | +23 | +52 | +26 |

Reduced motion: 0 frames, and no request for the `scene.<hash>.js` chunk.

**Tab switching could not be observed headless.** Opening a second page in
front leaves the first page's `visibilityState` at "visible", so the result
(+2 frames, then +26 back) proves nothing. That path's logic is untouched
apart from the new guard in `loop()`, which only adds a stop condition.

`npx astro check` → 0 errors; `PUBLIC_BASE=/tractari npm run build` → 1 page.
