# Task 07: A redesign of subcort with Hallmark, on the estate board

**Depends on:** brief 03, brief 04, and the skills library's brief 24 (Hallmark vendored, taste-skill 2.5's ideas adopted) and the estate redesign board, as in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). That brief holds the steps and the acceptance every site's redesign shares ("The steps all four redesigns share"). Read it first. The owner's answer of 2026-11-10 to Q39 replaces the bake-off.

**Runs before:** nothing. It needs 03 and 04, and runs in any order with 05, 06 and 08.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

Subcort is the multi-page site of an event-tent rental and setup service in Oltenia. The visitor's one question is whether the crew can bring a proper covered space to their own ground, set it up to plan, and handle the weather (`sites/subcort/PRODUCT.md`). It is a **demo**: the company and contact details are fictional, there is no booking outcome, and the page's job is to make the service legible and credible.

### What subcort has (read 2026-11-10)

| Route | File |
|---|---|
| `/` | `sites/subcort/src/pages/index.astro` |
| `/corturi`, `/servicii`, `/zona`, `/contact` | the same names under `src/pages/` |
| `/confidentialitate`, `/cookie-uri`, `/termeni` | legal, through `layouts/LegalLayout.astro` |

Pages share `Base.astro`, `DemoBanner`, `Nav` plus `MobileMenu.tsx`, `PageHeader` and `Footer`. The graphics are `HeroScene.astro` (a WebGL hero, with the off-screen pause in [wiki/site-patterns.md](../../wiki/site-patterns.md)), `ExplodedPlate.astro` and `TentScale.tsx` (a React island that uses `motion`).

What its design docs fix today (`sites/subcort/DESIGN.md`):

- **Montaj, the site as a drawing set.** Every page is a numbered sheet. Every graphic is a projection of one marquee model in `src/lib/draft.ts`: the WebGL hero, the exploded plate, the scale plan and the OG card must always agree (`DESIGN.md`, section 1).
- **The object is ink, every annotation is orange**, with no exceptions (the Annotation Rule).
- **No photography**: every graphic comes from the one model.
- Light throughout, a near-white sheet (`DESIGN.md:150`). The owner answered on 2026-11-10 that the client sites keep the one look designed for each, so it stays light, with no dark theme and no theme switch.
- Optional extras (catering, music, decor) go through local partners, at extra cost, never in-house (`PRODUCT.md`).

## Owner decisions (defaults)

1. **Montaj stays the world.** Default: Hallmark proposes inside it (the drawing-set system is the site's whole idea and the owner reworked it twice), and shows one alternative on the board.
2. **No photography.** Default: stays. Hallmark's licensed photographs are not proposed here unless the owner reopens it on the board.

## Files you OWN

- `sites/subcort/src/styles/global.css`, `src/components/*`, `src/layouts/*`, `src/pages/*`, and `src/lib/draft.ts` only for colour or style, never for the model's dimensions.
- `sites/subcort/DESIGN.md`, and `scripts/gen-og.mjs` (the OG card must follow the tokens).
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- The marquee model's dimensions and the facts in `src/content/`. A figure that is not there is not invented.
- The legal text beyond layout.
- Other sites and `churchix/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share" in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Then one commit for the token change, and one per screen in this order: `/`, `/corturi`, `/servicii`, `/zona`, `/contact`, the legal layout. Re-run `npm run subcort:og` in the last commit.

## Acceptance

- [ ] The common acceptance in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md) (step 6 there).
- [ ] The hero and the plate still read from one model: `grep -rn "from \"../lib/draft\|from '../lib/draft\|lib/draft" sites/subcort/src --include=*.astro --include=*.ts --include=*.tsx -l` lists both `HeroScene` and `ExplodedPlate` users, as it does today.
- [ ] The WebGL hero still pauses off-screen, and under `prefers-reduced-motion` it renders one still frame (a Playwright run with the media feature on).
- [ ] After `npm run subcort:build`, every page's built HTML links to `/subcort/contact/` (`dist/index.html` has 2 such links today).

## Interplay

- Briefs 03 and 04 first. Subcort's `motion` use leaves the menu in brief 04 and stays in `TentScale.tsx`.
- The OG card is a raster generated from the model: regenerate it after the token change, not by hand.

## Outcome (2026-11-13)

Built on `main` as local commits: the approval log entry, `f430e96` (tokens, Commissioner, drawing tones), `02ebf4c` (home and the shared header, footer, banner and phone menu), `55666ac` (corturi), `4eafcfc` (servicii), `19c2d64` (zona), `99391dc` (contact), `f266607` (legal layout and the regenerated OG card), `051f0f8` (`e2e/subcort.spec.ts`), `cfcd6c1` (docs), plus this closeout. Not deployed: owner step `node cli.ts subcort deploy` from the vps-deploy checkout (a static site).

- **Direction:** "On your ground", approved on the board with every question as proposed. The four reopened `DESIGN.md` lines and `PRODUCT.md` principle 5 are recorded as changed in [decisions-ui.md](../../wiki/decisions-ui.md); `DESIGN.md` is rewritten from what shipped. Fonts: Commissioner Variable `@fontsource-variable/commissioner` 5.3.0 replaces IBM Plex Sans (the site's `package.json` and the root lock; subcort's docs-site keeps its own Plex Sans dependency). No token was dropped. `draft.ts` changed colour only: its hex constants are the new token values, `tone()` now gives two tones (`membrane`, `membrane-shade`) and `toneVar()` gives the matching CSS variable for the SVGs; the hero's WebGL loop, observer pause, exploded state and reduced-motion path are untouched.
- **Shared Floor checks and subcort's own spec:** `SITES=subcort npx playwright test -c e2e --workers=2` gave 45 passed (the contrast spec over the built `dist`, focus, reduced motion, 390 overflow, the phone menu, and `subcort.spec.ts`: first screens, the reduced-motion still frame, the off-screen pause, the size picker, plan label sizes at 390 and 360, and the clip, text-in-column and label-gap checks at 1280, 1024, 768, 390 and 360). `SHOTS_DIR=<dir>` writes the screenshots.
- **Contrast minimums (one light look; computed from the token values, and the shared spec passes over every text node of the built pages):** text 4.60:1 (signal on the field) and 4.95 (signal on signal-soft), 5.07 on fill-2, 5.19 for ink-2 on the field, 5.66 for signal on paper, 5.86 for ink-2 on the sheet, 6.38 on paper; on-signal-soft on signal-soft 7.08; ink 11.17 to 13.75. UI: the picker border (line on paper) 5.35, the callout circles and the focus ring (signal) 4.60 on the field, 5.20 on the sheet, 5.66 on paper; the selected size, paper on ink, 13.75.
- **Compared with the comps** (the twins rendered with the fontsource files in place of Google Fonts, same viewport, pixels differing by more than 24/255 over the overlap): home 0.31% at 1280, 4.09% at 390; corturi 0.39% and 5.23%; servicii 0.19% and 0.33%; contact 0.29% and 0.52%. At 1280 every difference is antialiasing. At 390 home and corturi sit 1 and 2 px off from a rounding in the drawing's height and the table folds, which shifts everything below; contact's and servicii's rows line up. Shots (outside git) are in the estate build folder, `board/impl/subcort/`, as `<screen>-light-<width>.png` at 1280, 390 and 360 (the one look has no theme in the name), the twin renders as `twin-<screen>-<width>.png`, plus the open Drawer and Corturi with no script.
- **Rulings met (checked in `subcort.spec.ts`):** the `Zonă` cell above the fold at 1280 and the `Zonă` row first on the phone at 390x844 and 360x800; servicii's three services whole above 800 at 1280; the contact address row ends above the fold at 390x844 and 360x800 (it ends at 723 and 751); plan labels at 12 px or more for dimensions and 11 px or more for the car at both phone widths.
- **Acceptance:** `grep` of `lib/draft` lists `HeroScene`, `ExplodedPlate` and `hero/tent-scene.ts`; every built page links to `/subcort/contact/` (2 links on home, servicii, zona, corturi and contact, 1 on each legal page); the hero pauses off-screen (a count of WebGL draw calls stops) and stays on one still frame under reduced motion.
- **Undrawn screens restyled:** `/zona` (page head, process rows and localities on panels), the three legal pages (`LegalLayout`: the header like the site's, the text on a panel whose band carries the update date, the text untouched), the phone Drawer, the OG card (rebuilt with `npm run subcort:og`: the field and its grid, a paper card with the wordmark and region as separate parts, the title and the key figures, the tent in token colours), the plan before it runs and the picker with no script (disabled, dashed).
- **Floor "no invented facts":** every figure traces to `src/content` (`site.ts`, `tents.ts`, `zone.ts`) or to the comps' own strings; none added. Grep list: `grep -rn "8‒20\|64‒300\|40‒320\|15 × 10" sites/subcort/src`.
- **Deviations and findings:**
  - The dev toolbar is off (`devToolbar: { enabled: false }` in `astro.config.mjs`): the shared Floor focus check tabs into `astro-dev-toolbar` after the footer and reports it as focused but not visible. For the controller: the shared check could skip that element instead, which would let the config line go.
  - The Drawer has no head row with `SUBCORT` and a close button as the direction sheet draws it: the menu button stays visible above the panel and turns into the close X, which is the existing behaviour (and `mobile-menu.spec.ts` still passes). The numbers beside the old Drawer links are gone, as the sheet draws none. The nav header gets `contain: layout` so the fixed panel is placed by it now that the header has no backdrop filter.
  - The picker's no-script look is the buttons disabled until the island hydrates (`useSyncExternalStore`), as the sheet draws it; before, they looked live and did nothing.
  - The exploded drawing carries no text labels at any width; the circles and the key beside it name the parts (the comp draws none). The circles scale 1.7 times at 800 px and under, as the twin does.
  - Comp changes kept as the comp draws them, beyond the sheet's list: the ANPC link reads `ANPC, Soluționarea Alternativă a Litigiilor` (comma for the `·`); the footer's legal facts, the address line and the demo line are separate parts; the banner's `NOTĂ` is `Notă` in bold; the OG card drops the old `SUBCORT · GORJ — OLTENIA` line for the wordmark and `Gorj, Oltenia` as two parts. The car label in the plan keeps `mașină · 4,5 m` (the twin's string).
  - The zona page keeps `orientativă — ne deplasăm` (a dash the sheet does not list); the comps do not draw zona.
  - `--text-lede`, the type line heights and `--sheet-pad` carry phone values in a `max-width: 800px` override of `:root` (the map's clamps differ from the twin by up to 1 px at 1280, and the twin's phone side padding is 12 px where `4vw` gives 15.6 at 390).
  - `draft.ts` still exports `callout` and `hatchDef`, now unused by the site; `npm run check` (knip included) passes with them.
