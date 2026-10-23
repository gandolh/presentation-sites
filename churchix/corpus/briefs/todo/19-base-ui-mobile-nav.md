# Task 19: Base UI for the phone menu

## Context

On 2026-10-23 the owner asked for Base UI (`@base-ui/react`) in the projects
that still hand-build their interactive widgets, to match their apps
(atrium, imbatranimOS, sports-app, trips, ro-housing, public-resource-map,
newspapper). Base UI is headless: it supplies the focus trap, Escape, scroll
lock and ARIA, and churchix keeps its Tailwind classes and M3 tokens. The
four sites under `../sites/` get the same change in presentation-sites'
brief 15.

Church sites are static Astro pages, and every island adds JS. So the scope
is the one island that hand-builds a dialog:
`packages/ui/src/islands/MobileNav.tsx` (199 lines). It is the phone
menu toggle and sheet, hydrated `client:load` from `Header.astro`, with its
own Escape handler, focus trap and focus return. It also holds the locale
links.

`CopyIban.tsx` (a copy button) and `PomelnicForm.tsx` (a form with native
inputs) have no overlay, so they stay.

## Files you OWN

```
packages/ui/src/islands/MobileNav.tsx  packages/ui/package.json (dependencies only)
packages/ui/src/styles/** (menu rules only)  package-lock.json
corpus/wiki/{decisions,status}.md
```

## Files you must NOT touch

`packages/ui/src/components/Header.astro` beyond the island's props,
`packages/schemas`, the other islands, every `.astro` page, `docs-site/`.

## What to do

1. **Baseline.** Build `apps/parohia-harlesti-bacau` and note the
   `MobileNav` island's JS size (raw and gzipped, from `dist/_astro/`).
2. Add `"@base-ui/react": "^1.9.0"` to `packages/ui` `dependencies` (the
   package uses ranges), then run `npm install` in `churchix/`.
3. **MobileNav → Base UI `Dialog`.** `Dialog.Trigger` is the toggle, with
   its changing `aria-label`. `Dialog.Popup` is the sheet, keeping its
   classes. `Dialog.Close` closes it. Nav and locale links close the menu
   (controlled `open`). Keep `aria-current` on the active page and locale,
   and keep every prop. Delete the hand-written Escape handler, focus trap
   and focus return, and rewrite the header comment to say what Base UI now
   provides.
4. **Rebuild** and record the new island size beside the baseline.
5. Add a `decisions.md` entry: Base UI for island dialogs, dated
   2026-10-23, the owner's call to match their apps. Give the measured size
   cost. Rejected: keeping the hand-built trap, and making `.astro` widgets
   into islands to use more of Base UI. Update `status.md`.

## Acceptance

- `npm run build`, `npm run typecheck`, `npm run lint` and `npm run test`
  pass in `churchix/`.
- Previewing the parish site at 390 px:
  - the menu opens, focus moves in, Tab stays inside, and Escape and the
    close button close it with focus back on the toggle;
  - a nav link and a locale link navigate;
  - the active page is marked;
  - the page behind doesn't scroll.
  Take before/after screenshots. They should match.
- The size cost is recorded in `decisions.md`.
- [conventions.md](../../wiki/conventions.md)'s definition of done holds:
  - no raw hex in the island;
  - the menu reads correctly under a second brand. Swap the `site.json`
    seeds for a throwaway build.
- `bash corpus/lint.sh` passes.
