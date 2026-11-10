# Task 04: Base UI by the conventions, with the Light / Dark / System switch

**Depends on:**

- In this repo: brief 02 (the exact pin) and brief 03 (the harness and the Astro layer).
- In the owner's skills library:
  - brief 02, *A Base UI skill, styled with Tailwind*: rules 1-13, the wrapper set, the `check-base-ui` checker;
  - brief 27 (the harness), for the commands.
- The owner's grilling of 2026-11-10: Q18 (a theme switch everywhere), Q40 (the swipeable `Drawer`), Q58 (form dialogs), and the technical calls Q15, Q16, Q41 and Q57.

**Runs before:** 05-08, the four redesigns. They build on the wrappers and the two-theme token layout this brief puts in.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

The four live sites use Base UI in one place each: the phone menu, a `Dialog`. The sites are already on Tailwind v4 (`@tailwindcss/vite` and one `@theme` in each `src/styles/global.css`), so this brief is the Base UI audit and the theme switch. There is no Tailwind migration brief for this repo: it is not plain CSS. What is left of the old CSS is under "Left alone" below, for the owner.

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

Theme state today (`grep -rniE "prefers-color-scheme|data-theme|localStorage" sites/{auto-service,saloon,subcort,tractari}/src`): no site has a dark variant, a `data-theme`, a `prefers-color-scheme` rule or any stored preference.

- **saloon** and **subcort** are light only (`sites/saloon/DESIGN.md`, "never dark"; `sites/subcort/DESIGN.md:150`, "Light throughout").
- **auto-service** and **tractari** are **dark-first**: their base surface tokens are the dark palette (`sites/tractari/DESIGN.md`, "Dark by default"; `sites/tractari/src/styles/global.css:19`; the `<meta name="theme-color">` is `#0d0e10` and `#07090c`).
- No `<html>` carries `color-scheme`.

Root font size: no `html` rule sets one, and the `16px` at `sites/saloon/src/styles/global.css:112` and `sites/tractari/src/styles/global.css:122` is on `body`. Q44 needs no change.

Cookie pages: saloon's `cookie-uri.astro:32` and subcort's `:35` say technical preferences need no consent. Auto-service has a `cookie-uri.astro` without that line. Tractari has no cookie page.

## Owner decisions

The owner's answers of 2026-11-10:

1. **A theme switch everywhere, light by default (Q18).** Each site gets a Light / Dark / System choice. A first visit shows the light theme, not the system's. The choice is kept on the device. Tailwind's `dark:` variant keys off a `data-theme` attribute through `@custom-variant`, not `prefers-color-scheme`.
2. **The phone menu is a swipeable `Drawer` (Q40).** It closes on a swipe, a tap outside, the X or Esc.

The owner's technical calls of 2026-11-10 (confirmed):

3. **Q15:** Base UI is imported only under `ui/` folders. **Q16:** native controls stay native. **Q41 and Q57:** a picker that saves on each choice uses a guarded `ToggleGroup`, so arrow keys move focus without saving and one item always stays pressed. The theme choice saves on each press, so it uses that.

Defaults (the skills library's open questions, and this repo's):

4. **Where the wrappers live.** Per site, in `sites/<site>/src/components/ui/`, not shared. Q5: shared tooling, no shared UI. Four near-identical `Drawer.tsx` files are accepted.
5. **The second palette.** Light-only sites need a dark palette and dark-first sites need a light one. The real palettes come from the redesigns (briefs 05-08). Here, each site gets a stopgap: the same hues with lightness flipped in OKLCH, checked for contrast. Briefs 05-08 replace it. If the owner would rather hold the visible switch until the redesign, the switch ships behind a `data-theme-switch` flag set to off.
6. **Subcort's Motion choreography.** `motion` stays for `TentScale.tsx`. In the menu, `Drawer`'s swipe variables replace `AnimatePresence`, and `motion` leaves the menu. If the swipe cannot reproduce the sheet-by-sheet entrance, the entrance becomes CSS keyed on `data-starting-style`.

*Repo question for the owner:* **auto-service and tractari are dark-first designs. Does the light-by-default rule apply to them, or are they exceptions, as the owner made Solstice (3D-sandbox) dark-first?** The default here follows the rule: a first visit is light. The setting is one constant in the theme script, so the answer is cheap either way. Auto-service's design also says it has no photography and tractari's hero is a dark WebGL night road, so the answer changes how much the stopgap palette must carry.

*Repo question for the owner:* **the sites' own docs say "never dark" (saloon) and "light throughout" (subcort). Do they now get a dark theme?** Q18 says every app does, so the default is yes.

## Left alone

The scoped `<style>` blocks in 39 `.astro` files (4 sites) are Astro's own mechanism, and the `global.css` class rules for non-Base-UI markup (54, 41, 72 and 75 selector lines in auto-service, saloon, subcort and tractari) stay. They are not what rule 4 audits. If the owner wants the sites on utilities only, that is a separate Tailwind brief; the numbers above are its starting point. *Repo question for the owner.*

## Files you OWN

- Per site: `src/components/ui/Drawer.tsx`, `src/components/ui/ThemeSwitch.tsx` (new), the `MobileMenu.tsx` rewrite, the theme script in `src/layouts/Base.astro`, and the dark or light tokens in `src/styles/global.css`.
- The CSS rules for markup this brief changes: `.mobile-menu*`, `.menu-btn*`, `.menu-panel*`. Their motion becomes utilities on the parts.
- Each site's cookie page, one sentence naming the stored theme key: `sites/auto-service/src/pages/cookie-uri.astro`, `sites/saloon/src/pages/cookie-uri.astro`, `sites/subcort/src/pages/cookie-uri.astro`.
- `conventions.json` (brief 03): exceptions, with reasons.
- Corpus: [wiki/site-patterns.md](../../wiki/site-patterns.md) (the phone-menu section), [wiki/decisions-ui.md](../../wiki/decisions-ui.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Page content, copy and images, and layouts beyond the theme script and the `ThemeSwitch` slot.
- `sites/design-study/` (a study, no Base UI).
- `churchix/`: its own corpus has this brief's equivalent.
- The redesign. Palettes here are stopgaps (decision 5).

## What to do

One commit per step, each with `npm run check` and `npm run <site>:build` green.

1. **Before.** Run `check-base-ui` strict and record the counts by rule. Take Playwright screenshots, kept out of git, at 1280 and 390 px, of every site's home page and of the phone menu open.
2. **The wrappers.** In each site, add `ui/Drawer.tsx` (new code, nothing to move), a wrapper over `@base-ui/react/drawer` with `open`, `onOpenChange`, a visually hidden `Drawer.Title` ("Meniu"), `initialFocus`, and the existing `finalFocus` rule (focus goes back to the button unless a link was followed). Q58 does not apply: the menu holds no form.
3. **The menus.** Rewrite each `MobileMenu.tsx` on the wrapper. Style the parts with Tailwind (`data-starting-style:`, `data-ending-style:`, the swipe variable `--drawer-swipe-movement-x`), wrapped in `motion-safe:`. Delete the `.mobile-menu*` rules from `global.css` (subcort: `.menu-btn*`, `.menu-panel*`). Keep the link-follows behaviour ([wiki/site-patterns.md](../../wiki/site-patterns.md)). Replace the 21, 95, 4 and 38 `[var(--color-…)]` classes in the files this step touches with the generated utilities.
4. **The theme mechanism.** In each site:
   - add `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` to `global.css`;
   - move the current palette's tokens under the site's default theme and add the stopgap palette under `[data-theme="dark"]` (or `"light"` for the dark-first sites), per decision 5;
   - add an inline `<script is:inline>` at the top of `<head>` in `Base.astro`: read `localStorage.theme` (`light`, `dark` or `system`), default `light`, resolve `system` with `matchMedia`, set `data-theme` on `<html>` before first paint, and set `color-scheme` and the `<meta name="theme-color">` to match. Guard `localStorage` with try/catch.
5. **The switch.** `ui/ThemeSwitch.tsx`: a guarded Base UI `ToggleGroup` with three items (Luminos, Întunecat, Sistem), one always pressed, arrow keys moving focus without saving. It writes `localStorage.theme` and updates `data-theme`, and in `system` mode follows `matchMedia` changes. Place it in the footer next to the legal links, and in the phone menu. It hydrates with `client:idle`.
6. **The cookie pages.** Add the sentence about the stored theme choice to the three cookie pages. Check the wording with the owner if the site's legal text is signed off (`sites/saloon/docs/LEGAL.md`).
7. **After.** Screenshots again, in both themes. List every difference in the light (for light sites) or dark (for dark-first sites) default theme with its reason: the owner's Q19 answer ("close enough") allows a few pixels of drift in spacing, not a change in layout or colour. Run `check-base-ui` strict. Update the corpus.

## Acceptance

- [ ] `grep -rn "@base-ui/react" sites/*/src --include=*.tsx --include=*.ts | grep -v "/ui/"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 8, 9 and 12 on `sites/{auto-service,saloon,subcort,tractari}`. The counts for rules 4-7 are in the outcome note.
- [ ] `grep -rn "mobile-menu\|menu-panel\|menu-btn" sites/*/src/styles` prints nothing.
- [ ] A Playwright test per site: first load with empty storage shows `data-theme="light"`; choosing Dark sets it and survives a reload; System follows an emulated `prefers-color-scheme: dark`; the control is reachable by keyboard, and arrow keys move focus without changing the theme.
- [ ] A Playwright test per site: the open menu closes on a swipe, on a tap outside, on the X and on Esc, and focus returns to the menu button.
- [ ] A contrast script over each site's token pairs (text on surface, text on primary, link on surface) reports at least 4.5:1 (3:1 for large text) in both themes.
- [ ] Both themes have no horizontal scroll at 390 px (a Playwright assertion on `scrollWidth`).
- [ ] `npm run check` and `bash corpus/lint.sh` end clean.

## Interplay

- Brief 03's `check:conventions` drops `--warn-only` for `check-base-ui` at the end of this brief.
- Briefs 05-08 replace the stopgap palettes. The theme script and the switch stay; the redesign changes tokens and layout only.
- Brief 02's pin comes first, so rule 1 reports 0 from the start.
