# Task 15: Base UI for the four phone menus

## Context

On 2026-10-23 the owner asked for Base UI (`@base-ui/react`) in the projects
that still hand-build their interactive widgets, to match their apps
(atrium, imbatranimOS, sports-app, trips, ro-housing, public-resource-map,
newspapper). Base UI is headless: it supplies the focus trap, Escape, scroll
lock and ARIA, and each site keeps its Tailwind classes and tokens.

The sites are static Astro pages. Base UI can only live in a React island,
and every island adds JS to a marketing page, so the scope is the islands
that already exist and already hand-build a dialog. There are four, one per
site, each a full-screen phone menu (`client:load` from the site's
`Nav.astro`) with its own focus trap, Escape handler, body scroll lock and
focus return:

- `sites/saloon/src/components/MobileMenu.tsx` (Phosphor icons)
- `sites/subcort/src/components/MobileMenu.tsx` (Motion enter/exit
  choreography, reduced motion respected)
- `sites/auto-service/src/components/MobileMenu.tsx`
- `sites/tractari/src/components/MobileMenu.tsx`

churchix governs itself (see `decisions.md`). Its `MobileNav` island has its
own brief in `churchix/corpus/`.

## Files you OWN

```
sites/{saloon,subcort,auto-service,tractari}/src/components/MobileMenu.tsx
the CSS those menus use (each site's global stylesheet, menu rules only)
sites/{saloon,subcort,auto-service,tractari}/package.json (dependencies only)
package-lock.json  corpus/wiki/{decisions,status}.md
```

## Files you must NOT touch

`churchix/**`, `sites/design-study/**`, every `.astro` component (the FAQ
`<details>` and the nav stay zero-JS), `CallDock.tsx`, `packages/kit`, each
site's `docs-site/`.

## What to do

1. **Baseline.** Build the four sites and note each menu island's JS size
   (raw and gzipped, from `dist/_astro/`).
2. Add `@base-ui/react` 1.9.0 to each of the four sites' `package.json`.
   Follow the file's own pinning: `^1.9.0` in saloon (its deps use ranges)
   and `1.9.0` exactly elsewhere. Then run `npm install` from the root.
3. **Each menu → Base UI `Dialog`.** `Dialog.Trigger` is the hamburger
   button. `Dialog.Popup` is the full-screen panel, keeping its classes and
   the staggered `--i` link animation. `Dialog.Title` is a visually hidden
   name, or `aria-label` on the popup, matching today's label.
   `Dialog.Close` is the close button. A nav link closes the menu (controlled
   `open`) and focus goes where the link goes, as today. Delete the
   hand-written focus trap, Escape handler, `body.style.overflow` effect and
   `buttonRef` focus return.
4. **subcort's Motion.** Keep the enter/exit choreography and the
   reduced-motion branch. Base UI's documented pattern for Motion is the
   `render` prop on `Dialog.Popup` with `AnimatePresence` and a controlled
   `open`. If the exit animation can't run under Base UI, say so in the
   outcome note rather than dropping it silently.
5. **Rebuild** and record each island's new size beside the baseline.
6. Add a `decisions.md` entry: Base UI for island dialogs, dated
   2026-10-23, the owner's call to match their apps. Give the measured size
   cost per site, as the icon decision does. Rejected: keeping the hand-built
   traps, and turning `.astro` widgets into islands to use more of Base UI
   (that adds JS to static pages). Update `status.md`.

## Acceptance

- `npm run build` (all workspaces) passes.
- For each of the four sites, `npm run <site>:preview` at 390 px:
  - the menu opens, focus moves in, Tab stays inside, and Escape and the
    close button close it with focus back on the button;
  - a link closes it and scrolls to its section;
  - the page behind doesn't scroll while it is open;
  - on subcort the Motion animation plays, and with reduced motion it
    doesn't.
  Take before/after screenshots. They should match.
- No hand-written focus trap or scroll lock is left in the four files.
- The size cost is recorded in `decisions.md`.
- `bash corpus/lint.sh` passes.
