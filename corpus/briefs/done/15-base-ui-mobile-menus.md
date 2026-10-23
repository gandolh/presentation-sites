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

## Outcome (2026-10-23)

Done. The four `MobileMenu.tsx` islands are Base UI `Dialog`s:

- the burger is `Dialog.Trigger`;
- the panel is `Dialog.Popup`, with its classes, its `aria-label` and the
  staggered `--i` links;
- the X is `Dialog.Close`.

The hand-written focus traps, Esc handlers, `body.style.overflow` effects
and `buttonRef` focus returns are gone. A link closes the menu through a
`leftByLink` ref, so `finalFocus` doesn't send focus back to the burger, and
focus goes where the link went. `@base-ui/react` is `^1.9.0` in saloon and
`1.9.0` elsewhere. `use-sync-external-store` moved from 1.6.0 to 1.7.0 with
it.

**subcort.** Motion stays, in Base UI's documented pattern:

- `AnimatePresence` around a `keepMounted` `Dialog.Portal`;
- the popup rendered as a `motion.div`, so Base UI waits for its opacity and
  the exit plays;
- the reduced-motion branch only fades, unchanged.

Its panel is portalled into the header, not `<body>`. The header's
`backdrop-filter` makes it the panel's containing block, and `inset:
var(--nav-h) …` relied on that to hang the panel under it. Portalled to
`<body>`, the panel covered the header. Opening now moves focus to the first
link, where before it stayed on the burger. The header's X still closes it.

**The other three portal to `<body>`,** out of the header's stacking context,
so the open menu covers the whole page. That fixed two things visible in the
before shots:

- tractari's demo banner sat over the menu's top row and its close button;
- auto-service's call dock showed over the bottom of the menu.

saloon's shots match exactly.

**Sizes** (all the site's JS, gzip, before → after; the `MobileMenu` chunk
grows from 3-7 kB to about 63-66 kB raw):

| Site | Before | After |
|---|---|---|
| saloon | 62.6 kB | 82.3 kB |
| auto-service | 77.6 kB | 98.0 kB |
| subcort | 249.8 kB | 269.7 kB |
| tractari | 196.2 kB | 216.6 kB |

That is about +20 kB gzip a site. The cost is recorded in
[decisions-ui.md](../../wiki/decisions-ui.md), which takes the icon decision
with it, because `decisions.md` was at its 200-line limit.

Checked: `npm run build` for all workspaces, and `tsc` on the four sites. In
each site's preview at 390 px, before and after:

- the menu opens and focus moves in;
- 14 Tabs stay inside;
- Esc and the X return focus to the burger;
- a link closes it: saloon's `#despre` lands at 961 px and tractari's
  `#cum-functioneaza` at 2110 px, as before, and the page links navigate;
- the body is `overflow: hidden` while it is open;
- subcort's panel slides and fades in and out, and with reduced motion only
  fades.

brief-board is down, so nothing was posted there.
