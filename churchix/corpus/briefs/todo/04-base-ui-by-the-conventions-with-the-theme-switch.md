# Task 04: Base UI by the conventions, with the Light / Dark / System switch

**Depends on:**

- In Churchix: brief 02 (the exact pin) and brief 03 (the harness).
- In the root corpus of this repo: its brief 04, *Base UI by the conventions, with the Light / Dark / System switch*. It audits the four sites' phone menus the same way. This brief says only where Churchix differs.
- In the owner's skills library: brief 02, *A Base UI skill, styled with Tailwind* (rules 1-13, the wrapper set, the `check-base-ui` checker).
- The owner's grilling of 2026-11-10: Q18 (a theme switch everywhere, light by default), Q40 (the swipeable `Drawer`), and the technical calls Q15, Q16, Q41 and Q57.

**Runs before:** 05, the parish redesign.

**Before you start:** run `brief-board guide`, passing `--project churchix` to its commands ([corpus/CLAUDE.md](../../CLAUDE.md), "brief-board").

## Context

Churchix uses Base UI in one file, the phone menu. It is already on Tailwind v4 (`packages/ui/src/styles/theme.css` maps every utility to a CSS variable, and the app's `src/styles/app.css` imports Tailwind and that theme), so there is no migration brief. This brief is the Base UI audit and the theme switch.

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

Theme state: `grep -rniE "prefers-color-scheme|data-theme|localStorage|color-scheme" apps/*/src packages/ui/src` finds nothing. Churchix has no dark theme. Its tokens are a seed-and-derive contract: a church sets about four seed colours in its `site.json` `brand`, `BaseLayout.astro` writes them as an inline `:root{…}` block (`:80`), and `tokens.css` derives the other roles with 28 `color-mix()` calls. The shared packages hold no per-church value. The layout runs Astro's `ClientRouter` (`BaseLayout.astro:75`), and the header and footer are `transition:persist`.

The parish site has no cookie or legal page (`ls apps/*/src/pages`), so no cookie wording changes. A stored theme choice goes in the `docs/` and the privacy notes a church adds, and brief 05 tells the owner.

## Owner decisions

The owner's answers of 2026-11-10:

1. **A theme switch everywhere, light by default (Q18).** Light / Dark / System, a first visit shows light, the choice is kept on the device, and `dark:` keys off `data-theme` through `@custom-variant`.
2. **The phone menu is a swipeable `Drawer` (Q40).** It closes on a swipe, a tap outside, the X or Esc.

The owner's technical calls (confirmed): Q15 (Base UI only under `ui/`), Q16 (native controls stay native), Q41 and Q57 (a picker that saves on each choice is a guarded `ToggleGroup`).

Defaults:

3. **Where the wrapper lives.** Default: `packages/ui/src/primitives/Drawer.tsx` and `ThemeSwitch.tsx`, and `conventions.json` names `packages/ui/src/primitives` as the checker's `ui` root, so rule 3 means something here.
4. **The dark palette follows the seeds.** A church must not hand-set a dark set (`CLAUDE.md`, "Conventions"). Default: `tokens.css` gets a `[data-theme="dark"]` block that re-derives the surface, outline and container roles from the same seeds by `color-mix()` toward black instead of white, and keeps the seeds for `primary` and `secondary` with a lightened `primary` for text. A church that wants an exact dark palette can override a seed under `[data-theme="dark"]` in its `brand` (a new optional field, in the safe set the schema documents). Brief 05 replaces the derived dark palette if it designs a better one.
5. **`ClientRouter` and the theme.** Default: the theme script runs in `<head>` before paint, and re-applies on `astro:after-swap`, so a page change never flashes the other theme. The switch island is in the persisted header, so it keeps its state.

*Repo question for the owner:* **liturgical sites in dark mode.** The design is a formal burgundy, gold and cream (`DESIGN.md`). Is a dark theme wanted on parish sites at all, or only the switch's mechanism, with Light as the one shipped theme per church? Q18 says every app, so the default ships it.

## Files you OWN

- `packages/ui/src/primitives/Drawer.tsx`, `ThemeSwitch.tsx` (new), and the rewrite of `packages/ui/src/islands/MobileNav.tsx`.
- `packages/ui/src/layouts/BaseLayout.astro` (the theme script, `color-scheme` and `theme-color`), `packages/ui/src/styles/tokens.css` and `theme.css` (the dark block and the `@custom-variant`), `packages/ui/src/components/Header.astro` and `Footer.astro` (the switch's slot).
- `packages/schemas/src/index.ts`: the optional dark seed overrides, if decision 4's override is taken.
- `conventions.json` (brief 03).
- Corpus: [wiki/design-system.md](../../wiki/design-system.md) ("Phone menu" and a "Themes" section), [wiki/decisions.md](../../wiki/decisions.md) ("Base UI under island dialogs"), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Per-church content and values in `apps/*/src/content/` (the seeds stay as they are).
- Layout, copy and the page set. The redesign is brief 05.
- The root corpus and the sites under `sites/`.

## What to do

One commit per step, each with `npm run check` and `npm run build` green.

1. **Before.** Run `check-base-ui` strict, record the counts by rule, and take Playwright screenshots (kept out of git) of the home page and the open phone menu at 1280 and 390 px.
2. **The `Drawer` wrapper and the menu.** Add `primitives/Drawer.tsx` over `@base-ui/react/drawer`: controlled `open`, a hidden `Drawer.Title` ("Meniu"), `initialFocus`, and the existing `finalFocus` rule (focus goes back to the toggle unless a link was followed). Rewrite `MobileNav.tsx` on it, keeping the portal into the island's wrapper, the changing toggle label and the link-follows behaviour. Style with state attributes and the swipe variable, under `motion-safe:`.
3. **The dark tokens and the script.** Add `@custom-variant dark` to `theme.css`, the `[data-theme="dark"]` block to `tokens.css` (decision 4), and an inline script to `BaseLayout.astro`: read `localStorage.theme` (guarded), default `light`, resolve `system` with `matchMedia`, set `data-theme`, `color-scheme` and `<meta name="theme-color">`, and run again on `astro:after-swap`.
4. **The switch.** `primitives/ThemeSwitch.tsx`: a guarded `ToggleGroup` (Luminos, Întunecat, Sistem), one always pressed, arrow keys moving focus without saving, following `matchMedia` in `system`. It sits in the footer and in the phone menu, hydrated `client:idle`. Labels are Romanian, from the i18n glossary ([wiki/i18n-and-glossary.md](../../wiki/i18n-and-glossary.md)).
5. **After.** Screenshots in both themes. In the light theme, list every difference from step 1 with its reason (Q19: a few pixels of drift in spacing are fine, a change in layout or colour is not). Run `check-base-ui` strict. Update the corpus.

## Acceptance

- [ ] `grep -rn "@base-ui/react" apps packages --include=*.tsx --include=*.ts | grep -v "/primitives/"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 8, 9 and 12. The counts for rules 4-7 are in the outcome note.
- [ ] A Playwright test: first load with empty storage shows `data-theme="light"`; choosing Dark sets it and survives a reload and a client-side page change; System follows an emulated `prefers-color-scheme: dark`; arrow keys on the switch move focus without changing the theme.
- [ ] A Playwright test: the open menu closes on a swipe, a tap outside, the X and Esc, and focus returns to the toggle, or goes where a followed link went.
- [ ] A contrast script over the token pairs (text on surface, text on primary, text on each container, gold text on dark) reports at least 4.5:1 (3:1 for large text) in both themes, with the default seeds and with the parish's own seeds.
- [ ] No horizontal scroll at 390 px in both themes (`scrollWidth <= innerWidth`).
- [ ] `grep -rn "prefers-color-scheme" packages apps --include=*.css --include=*.astro` prints nothing: the choice is `data-theme` only, and the script is the one place that reads the media query.
- [ ] `npm run check` and `bash corpus/lint.sh` end clean.

## Interplay

- Brief 03's `check:conventions` drops `--warn-only` for `check-base-ui` at the end of this brief.
- Brief 05 may replace the derived dark palette. The script and the switch stay.
- The white-label rule holds: `grep -rn "harlesti" packages/ui/src` still prints only the one comment in `lib/base.ts:5`.
