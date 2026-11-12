# Task 04: Base UI by the conventions

**Depends on:**

- In Churchix: brief 02 (the exact pin) and brief 03 (the harness).
- In the root corpus of this repo: its brief 04, *Base UI by the conventions*. It audits the four sites' phone menus the same way. This brief says only where Churchix differs.
- In the owner's skills library: brief 02, *A Base UI skill, styled with Tailwind* (rules 1-13, the wrapper set, the `check-base-ui` checker).
- The owner's grilling of 2026-11-10: Q18 (the parish sites keep one look, with no theme switch), Q40 (the swipeable `Drawer`), and the technical calls Q15 and Q16.

**Runs before:** 05, the parish redesign.

**Before you start:** run `brief-board guide`, passing `--project churchix` to its commands ([corpus/CLAUDE.md](../../CLAUDE.md), "brief-board").

## Context

Churchix uses Base UI in one file, the phone menu. It is already on Tailwind v4 (`packages/ui/src/styles/theme.css` maps every utility to a CSS variable, and the app's `src/styles/app.css` imports Tailwind and that theme), so there is no migration brief. This brief is the Base UI audit and the move of the phone menu to `Drawer`.

### What Churchix has today (read 2026-11-10)

`grep -rn "@base-ui" apps packages --include=*.tsx --include=*.ts` finds one import: `packages/ui/src/islands/MobileNav.tsx:3`, `@base-ui/react/dialog` (168 lines). The menu is a sheet that hangs under the header toggle: the popup renders as the `<nav>` and is portalled into the island's own `relative` wrapper (`MobileNav.tsx:101-103`), not full-screen ([wiki/design-system.md](../../wiki/design-system.md), "Phone menu").

The audit against rules 1-13:

| Rule | Finding |
|---|---|
| 1, pin exactly | brief 02's. 0 after it. |
| 2, subpath imports | 0 findings. |
| 3, wrappers under `ui/` | 1: the import sits in `packages/ui/src/islands/`, with no wrapper. The path does contain a `ui/` folder (the package is named `ui`), so a path check alone would pass. Decision 3 below sets the checker's root. |
| 4, style on the parts with Tailwind | 0 findings: the sheet and its links are utility classes (`linkBase`, `MobileNav.tsx:68`). |
| 5, one stylesheet | `packages/ui/src/styles/` has `fonts.css`, `theme.css` and `tokens.css`, and the app has `app.css`. These are the token layers by design ([wiki/design-system.md](../../wiki/design-system.md)). Astro-scoped `<style>` blocks exist in 6 `.astro` files (`grep -l "<style" -r packages/ui/src apps/*/src`). |
| 6, semantic tokens only | The classes use the generated token utilities (`ring-primary`, `font-label-md`). |
| 7, motion on state attributes | To check in step 2: the sheet's enter and exit. |
| 8, floating parts portalled | 1 of 1 uses `Dialog.Portal`, into a container. |
| 9, `render` on wrapping triggers | `Dialog.Popup render={<nav />}` (`:103`). 0 findings. |
| 12, dialogs | No `Dialog.Title`: the popup has `aria-label="Meniu navigare"` (`:104`). Controlled `open`, `finalFocus` keeps the `leftByLink` rule. The toggle's `aria-label` changes with state (`:82`). |
| 13, Base UI over hand-built widgets | `CopyIban.tsx` and `PomelnicForm.tsx` are plain React and use native inputs, which Q16 keeps native. |

Theme state: `grep -rniE "prefers-color-scheme|data-theme|localStorage|color-scheme" apps/*/src packages/ui/src` finds nothing, and the parish sites keep it that way: one look, no dark theme (decision 1). Their tokens are a seed-and-derive contract: a church sets about four seed colours in its `site.json` `brand`, `BaseLayout.astro` writes them as an inline `:root{…}` block (`:80`), and `tokens.css` derives the other roles with 28 `color-mix()` calls. The shared packages hold no per-church value. The layout runs Astro's `ClientRouter` (`BaseLayout.astro:75`), and the header and footer are `transition:persist`.

## Owner decisions

Decided 2026-11-10 (owner):

1. **No theme switch on the parish sites (Q18).** The Light / Dark / System switch goes in the apps only. Churchix's parish sites keep the one look designed for each church, from its seed colours (the formal burgundy, gold and cream of `DESIGN.md`). This brief adds no switch, no dark palette, no `data-theme`, no stored theme and no `@custom-variant dark`.
2. **The phone menu is a swipeable `Drawer` (Q40).** It closes on a swipe, a tap outside, the X or Esc.

Decided 2026-11-10 (technical calls, confirmed): Q15 (Base UI only under `ui/`), Q16 (native controls stay native).

Default (no question covers it):

3. **Where the wrapper lives.** `packages/ui/src/primitives/Drawer.tsx`, and `conventions.json` names `packages/ui/src/primitives` as the checker's `ui` root, so rule 3 means something here.

## Files you OWN

- `packages/ui/src/primitives/Drawer.tsx` (new), and the rewrite of `packages/ui/src/islands/MobileNav.tsx`.
- `conventions.json` (brief 03).
- Corpus: [wiki/design-system.md](../../wiki/design-system.md) ("Phone menu"), [wiki/decisions.md](../../wiki/decisions.md) ("Base UI under island dialogs"), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Per-church content and values in `apps/*/src/content/` (the seeds stay as they are).
- Layout, copy and the page set. The redesign is brief 05.
- The root corpus and the sites under `sites/`.

## What to do

One commit per step, each with `npm run check` and `npm run build` green.

1. **Before.** Run `check-base-ui` strict, record the counts by rule, and take Playwright screenshots (kept out of git) of the home page and the open phone menu at 1280 and 390 px.
2. **The `Drawer` wrapper and the menu.** Add `primitives/Drawer.tsx` over `@base-ui/react/drawer`: controlled `open`, a hidden `Drawer.Title` ("Meniu"), `initialFocus`, and the existing `finalFocus` rule (focus goes back to the toggle unless a link was followed). Rewrite `MobileNav.tsx` on it, keeping the portal into the island's wrapper, the changing toggle label and the link-follows behaviour. Style with state attributes and the swipe variable, under `motion-safe:`.
3. **After.** Screenshots again. List every difference from step 1 with its reason (Q19: a few pixels of drift in spacing are fine, a change in layout or colour is not). Run `check-base-ui` strict. Update the corpus.

## Acceptance

- [ ] `grep -rn "@base-ui/react" apps packages --include=*.tsx --include=*.ts | grep -v "/primitives/"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 8, 9 and 12. The counts for rules 4-7 are in the outcome note.
- [ ] A Playwright test: the open menu closes on a swipe, a tap outside, the X and Esc, and focus returns to the toggle, or goes where a followed link went.
- [ ] The screenshots at 1280 and 390 px show no visible change to layout or colour beyond the menu (Q19), and there is no horizontal scroll at 390 px (`scrollWidth <= innerWidth`).
- [ ] `npm run check` and `bash corpus/lint.sh` end clean.

## Interplay

- Brief 03's `check:conventions` drops `--warn-only` for `check-base-ui` at the end of this brief.
- Brief 05 redesigns the parish template inside its one look: no theme switch and no dark palette are added there either.
- The white-label rule holds: `grep -rn "harlesti" packages/ui/src` still prints only the one comment in `lib/base.ts:5`.

## Outcome (2026-11-12)

Built on `main`, local commits `5ace88c` (wrapper and menu, step 2) and `290a893` (Playwright spec, strict `check-base-ui`), plus the closeout. Not deployed: owner step `node cli.ts churchix deploy` from the vps-deploy checkout (static client only).

- **check-base-ui:** before 4 errors (rule 3 once, rule 5 three times: the `styles/` token files), after 0 and 0, and strict in `check:conventions`. The rule 5 findings are three `exceptions` entries in `scripts/conventions.json` (the token layers by design). Rules 4-7 are not counted by the checker; by hand: the sheet and links are utilities (4), tokens only (6), motion is state attributes under `motion-safe:` (7). `grep` for Base UI outside `/primitives/` prints nothing. The conventions file is `scripts/conventions.json`, where brief 03 put it.
- **Tests:** `e2e/mobile-menu.spec.ts` (`npm run test:e2e`, its own dev server on port 4731, touch emulation; the swipe goes through CDP touch events): Esc, X, tap outside, swipe up, a link, focus back on the toggle (not after a link), no horizontal scroll at 390 shut and open. 6 passed. `npm run check` exits 0 (typecheck now includes `tsc -p e2e`), `bash corpus/lint.sh` clean.
- **Screenshots** (kept out of git), from the dev server before and after: home at 1280 and 390 and the open menu at 390 are pixel-identical (pixelmatch, 0 pixels), `scrollWidth - innerWidth` is 0 in all three.
- **Size** (gzip): the `MobileNav` island 21.2 to 31.1 kB.

Deviations: the X is the toggle itself (as in presentation-sites 04), so a press on it while open is a press outside; the test clicks it with `force`. The sheet's links sit in a `<nav>` (`Drawer.Content`) inside the popup, which is the dialog. A fade and 8 px drift were added (the old sheet had no motion), under `motion-safe:`.
