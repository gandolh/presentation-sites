# Task 04: Base UI by the conventions

**Depends on:**

- In this repo: brief 02 (the exact pin) and brief 03 (the harness and the Astro layer).
- In the owner's skills library:
  - brief 02, *A Base UI skill, styled with Tailwind*: rules 1-13, the wrapper set, the `check-base-ui` checker;
  - brief 27 (the harness), for the commands.
- The owner's grilling of 2026-11-10: Q18 (the four client sites keep one look, with no theme switch), Q40 (the swipeable `Drawer`), Q58 (form dialogs), and the technical calls Q15, Q16 and Q44.

**Runs before:** 05-08, the four redesigns. They build on the wrappers this brief puts in.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

The four live sites use Base UI in one place each: the phone menu, a `Dialog`. The sites are already on Tailwind v4 (`@tailwindcss/vite` and one `@theme` in each `src/styles/global.css`), so this brief is the Base UI audit and the move of the four phone menus to `Drawer`. There is no Tailwind migration brief for this repo: it is not plain CSS. What is left of the old CSS is under "Left alone" below, for the owner.

### What the repo has today (read 2026-11-10)

Base UI is imported in 4 files, all `@base-ui/react/dialog` (`grep -rn "@base-ui" sites/*/src --include=*.tsx`):

- `sites/auto-service/src/components/MobileMenu.tsx` (116 lines)
- `sites/saloon/src/components/MobileMenu.tsx` (80)
- `sites/subcort/src/components/MobileMenu.tsx` (77)
- `sites/tractari/src/components/MobileMenu.tsx` (89)

The audit against the skills library's rules 1-13:

| Rule | Finding |
|---|---|
| 1, pin exactly | saloon's `^1.9.0` is brief 02's. 0 after it. |
| 2, subpath imports | 4 of 4 import `@base-ui/react/dialog`. 0 findings. |
| 3, wrappers under `ui/` | 4: each `MobileMenu.tsx` imports Base UI from `src/components/`, not from a `ui/` folder. |
| 4, style on the parts with Tailwind | The popup and the links are styled by global classes: `.mobile-menu` and `.mobile-menu__link` (`sites/saloon/src/styles/global.css:434-485`, `sites/auto-service/src/styles/global.css:531-551`, `sites/tractari/src/styles/global.css:569-585`), and subcort's `.menu-btn` and `.menu-panel` (`sites/subcort/src/styles/global.css:348-388`). |
| 5, one stylesheet | Each site has one `global.css` plus Astro-scoped `<style>` blocks (auto-service 16 of 25 `.astro` files, saloon 9 of 20, subcort 10 of 17, tractari 4 of 11). See "Left alone". |
| 6, semantic tokens only | 0 hex colours in class names. The sites write `text-[var(--color-on-surface)]` 95 times in saloon, 38 in tractari, 21 in auto-service and 4 in subcort. `@theme` already generates `text-on-surface`. |
| 7, motion on state attributes | The panels animate with keyframes (`mobile-menu-in`, `mobile-menu-link-in`) with a `prefers-reduced-motion` override, not `data-starting-style`. Subcort's panel uses Motion's `AnimatePresence` through the popup's `render` (`MobileMenu.tsx:45`). |
| 8, floating parts portalled | 4 of 4 use `Dialog.Portal`. |
| 9, `render` on wrapping triggers | 0 findings: no trigger wraps a component. |
| 12, dialogs | No `Dialog.Title` in any of the four: the popup carries an `aria-label` instead. `open` is controlled in 4 of 4. Each icon-only control has an `aria-label`. |
| 13, Base UI over hand-built widgets | 0 findings. The sites have no select, tabs or switch widgets. |

Theme state today (`grep -rniE "prefers-color-scheme|data-theme|localStorage" sites/{auto-service,saloon,subcort,tractari}/src`): no site has a dark variant, a `data-theme`, a `prefers-color-scheme` rule or any stored preference, and none will get one (decision 1).

- **saloon** and **subcort** are light (`sites/saloon/DESIGN.md`, "never dark"; `sites/subcort/DESIGN.md:150`, "Light throughout").
- **auto-service** and **tractari** are **dark** (`sites/tractari/DESIGN.md`, "Dark by default"; `sites/tractari/src/styles/global.css:19`; the `<meta name="theme-color">` is `#0d0e10` and `#07090c`).

Root font size: no `html` rule sets one, and the `16px` at `sites/saloon/src/styles/global.css:112` and `sites/tractari/src/styles/global.css:122` is on `body`. Q44 needs no change.

## Owner decisions

Decided 2026-11-10 (owner):

1. **No theme switch on the client sites (Q18).** The Light / Dark / System switch goes in the apps only. Auto-service, saloon, subcort and tractari each keep the one look designed for it (saloon and subcort light, auto-service and tractari dark). This brief adds no switch, no second palette, no `data-theme`, no stored theme and no `@custom-variant dark`. A site's own docs ("never dark", "light throughout", "dark by default") stay true.
2. **The phone menu is a swipeable `Drawer` (Q40).** It closes on a swipe, a tap outside, the X or Esc.

Decided 2026-11-10 (technical calls, confirmed):

3. **Q15:** Base UI is imported only under `ui/` folders. **Q16:** native controls stay native. **Q44:** no change (see the root font size above).
4. **Where the wrappers live.** Per site, in `sites/<site>/src/components/ui/`, not shared. Q5: shared tooling, no shared UI. Four near-identical `Drawer.tsx` files are accepted.
5. **Subcort's Motion choreography.** `motion` stays for `TentScale.tsx`. In the menu, `Drawer`'s swipe variables replace `AnimatePresence`, and `motion` leaves the menu. If the swipe cannot reproduce the sheet-by-sheet entrance, the entrance becomes CSS keyed on `data-starting-style`.

## Left alone

The scoped `<style>` blocks in 39 `.astro` files (4 sites) are Astro's own mechanism, and the `global.css` class rules for non-Base-UI markup (54, 41, 72 and 75 selector lines in auto-service, saloon, subcort and tractari) stay. They are not what rule 4 audits. If the owner wants the sites on utilities only, that is a separate Tailwind brief; the numbers above are its starting point. *Repo question for the owner.*

## Files you OWN

- Per site: `src/components/ui/Drawer.tsx` (new) and the `MobileMenu.tsx` rewrite.
- The CSS rules for markup this brief changes: `.mobile-menu*`, `.menu-btn*`, `.menu-panel*`. Their motion becomes utilities on the parts.
- `conventions.json` (brief 03): exceptions, with reasons.
- Corpus: [wiki/site-patterns.md](../../wiki/site-patterns.md) (the phone-menu section), [wiki/decisions-ui.md](../../wiki/decisions-ui.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Page content, copy and images, and layouts beyond the phone menu.
- Colours, tokens and each site's look: no second palette, no theme attribute.
- `sites/design-study/` (a study, no Base UI).
- `churchix/`: its own corpus has this brief's equivalent.
- The redesign (briefs 05-08).

## What to do

One commit per step, each with `npm run check` and `npm run <site>:build` green.

1. **Before.** Run `check-base-ui` strict and record the counts by rule. Take Playwright screenshots, kept out of git, at 1280 and 390 px, of every site's home page and of the phone menu open.
2. **The wrappers.** In each site, add `ui/Drawer.tsx` (new code, nothing to move), a wrapper over `@base-ui/react/drawer` with `open`, `onOpenChange`, a visually hidden `Drawer.Title` ("Meniu"), `initialFocus`, and the existing `finalFocus` rule (focus goes back to the button unless a link was followed). Q58 does not apply: the menu holds no form.
3. **The menus.** Rewrite each `MobileMenu.tsx` on the wrapper. Style the parts with Tailwind (`data-starting-style:`, `data-ending-style:`, the swipe variable `--drawer-swipe-movement-x`), wrapped in `motion-safe:`. Delete the `.mobile-menu*` rules from `global.css` (subcort: `.menu-btn*`, `.menu-panel*`). Keep the link-follows behaviour ([wiki/site-patterns.md](../../wiki/site-patterns.md)). Replace the 21, 95, 4 and 38 `[var(--color-…)]` classes in the files this step touches with the generated utilities.
4. **After.** Screenshots again. List every difference in layout or colour with its reason: the owner's Q19 answer ("close enough") allows a few pixels of drift in spacing, not a change in layout or colour. Run `check-base-ui` strict. Update the corpus.

## Acceptance

- [ ] `grep -rn "@base-ui/react" sites/*/src --include=*.tsx --include=*.ts | grep -v "/ui/"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 8, 9 and 12 on `sites/{auto-service,saloon,subcort,tractari}`. The counts for rules 4-7 are in the outcome note.
- [ ] `grep -rn "mobile-menu\|menu-panel\|menu-btn" sites/*/src/styles` prints nothing.
- [ ] A Playwright test per site: the open menu closes on a swipe, on a tap outside, on the X and on Esc, and focus returns to the menu button.
- [ ] Each site's screenshots at 1280 and 390 px show no visible change to layout or colour beyond the menu (Q19), and there is no horizontal scroll at 390 px (a Playwright assertion on `scrollWidth`).
- [ ] `npm run check` and `bash corpus/lint.sh` end clean.

## Interplay

- Brief 03's `check:conventions` drops `--warn-only` for `check-base-ui` at the end of this brief.
- Briefs 05-08 redesign each site inside its own look: each keeps its own palette, dark or light, with no theme switch (owner, 2026-11-10).
- Brief 02's pin comes first, so rule 1 reports 0 from the start.

## Outcome (2026-11-12)

Built on `main`, local commits `8b1c0cd` (wrappers and menus, steps 2-3) and `e11c3ca` (Playwright spec, strict `check-base-ui`), plus the closeout. Not deployed: owner steps `node cli.ts auto-service deploy`, `node cli.ts saloon deploy`, `node cli.ts subcort deploy` and `node cli.ts tractari deploy`, from the vps-deploy checkout (static client only).

- **check-base-ui:** before 4 errors (rule 3, one per site) and 1 warning (rule 9, saloon's icon inside `Dialog.Trigger`); after 0 and 0, and strict in `check:conventions`. Rules 4-7 are not counted by the checker (rule 6 flagged one arbitrary colour, auto-service's panel ground, now the token `--color-surface-menu`, same value). `conventions.json` needed no exception. `grep` for Base UI outside `ui/` and for the old class names prints nothing.
- **Tests:** `e2e/mobile-menu.spec.ts` (`npm run test:e2e`, one dev server per site, touch emulation, the swipe through CDP touch events): Esc, X, swipe up, a link, focus back on the menu button, no horizontal scroll at 390 (shut and open), and a tap outside. 21 passed, 3 skipped: the three full-screen panels (auto-service, saloon, tractari) have no page outside them to tap, so that case is subcort's only. `npm run check` exits 0.
- **Screenshots** (kept out of git), at 1280 and 390, from two `astro build` outputs (`before` at `eca821c`, `after` at HEAD), compared per pixel: home 1280 and 390, header 1280, closed menu 390 and open menu 390 are identical in all four sites, except the open menu in saloon (109 px) and auto-service (114 px), all in the X icon (x 340-355, y 30-45). Its computed colour is the same; the cause is anti-aliasing (the popup now carries a `transform` for the swipe, so it paints in its own layer); not proven.
- **Size** (gzip, `_astro/` concatenated): JS +8 to +10 kB a site (saloon 81.4 to 91.5, auto-service 96.0 to 106.0, subcort 267.0 to 275.0, tractari 214.5 to 224.5); CSS +0.4 to +0.6 kB. Table in [decisions-ui.md](../../wiki/decisions-ui.md).

Deviations and findings:

- **Tap outside on the full-screen panels:** the old menus were `fixed inset-0` and the look must not change (Q19), so there is nothing outside to tap; the Acceptance case is tested for subcort only.
- **subcort's panel stays mounted in the header** (as before), through a `container` prop on the wrapper, with a transparent `Drawer.Backdrop` below it. Without the backdrop a tap outside never closed it (it didn't before either: the old Dialog had the same gap). The viewport is clipped so a swipe doesn't paint over the header.
- **Wrapper shape:** four copies of one file, with `container` and `backdropClassName` props that three sites don't use; subcort's has no `DrawerClose` (its menu button is the X, and a press on it while the drawer is up is a press outside).
- **Focus on touch open:** Base UI puts it on the popup, not the X as the old Dialog did; keyboard open still lands on the X.
- **`[var(--color-…)]` classes** were replaced only in the files this brief touches (the four `MobileMenu.tsx`); the 95, 38, 21 and 4 in the `.astro` files stay, for the Tailwind brief the owner may want.
- **Playwright was added** (`@playwright/test` 1.63.0 at the root, `e2e/` with its own `package.json` and `tsconfig.json`, in `typecheck`). `astro dev` backgrounds itself under an agent shell: the config passes `--ignore-lock`.
