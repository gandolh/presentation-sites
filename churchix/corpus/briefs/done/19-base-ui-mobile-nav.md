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

## Outcome (2026-10-23)

Done. `MobileNav` is a Base UI `Dialog`:

- the toggle is `Dialog.Trigger`, keeping its changing `aria-label`;
- the sheet is `Dialog.Popup`, rendered as the `<nav>` with its classes.

There is no separate `Dialog.Close`: as before, the toggle (now an X) closes
it, along with Esc and a press outside. The sheet is portalled into the
island's own `relative` wrapper, so it still hangs under the toggle. Nav and
locale links close it through a `leftByLink` ref, so `finalFocus` doesn't send
focus back to the toggle. Every prop stays, and so do both `aria-current`
marks. The Escape handler, the trap and the focus return are deleted, and
the header comment says what Base UI provides. `@base-ui/react` is `^1.9.0`
in `packages/ui`.

**Size:** the `MobileNav` chunk goes from 4,051 B (1,648 gzip) to 63,342 B
(21,249 gzip). The parish site's JS goes from 227.6 kB (72.8 gzip) to
287.5 kB (93.1 gzip). This is recorded in
[decisions.md](../../wiki/decisions.md).

Checked: `npm run typecheck`, `lint`, `test` and `build` in `churchix/`. No
workspace has a `test` script, so `test` runs nothing. In the parish site's
preview at 390 px, before and after:

- the menu opens with focus on Acasă;
- 16 Tabs stay inside;
- Esc and the toggle close it with focus back on the toggle;
- Despre navigates (through the `ClientRouter`) and is marked active when the
  menu reopens;
- the page no longer scrolls behind the open sheet. Before it did, since
  there was no scroll lock; the brief asked for one.

The screenshots match, with only gradient noise of 10 levels or less.

The definition of done holds:

- no raw hex in the island;
- under a throwaway second brand (`#1f4e6b` / `#7aa35b` / `#f2f6f8`, with
  `en` added so the locale list shows), the menu's active link, underline,
  Donează button and sheet tint follow the seeds, Română carries
  `aria-current`, and English navigates to `/en/`. `site.json` was restored
  afterwards.

**One finding outside this brief.** The seeds in `site.json` don't reach the
built pages. `BaseLayout.astro` emits `:root{--primary:…}` before the
stylesheet holding `tokens.css`, whose own `:root` defaults then win. So the
parish renders `#4e0816`, not its `#6b1f2a`, and the second-brand check had to
apply the seeds after the stylesheet in the browser. This is filed as
[brand-seeds-lose-to-token-defaults.md](../../todos/brand-seeds-lose-to-token-defaults.md).

brief-board is down, so nothing was posted there.
