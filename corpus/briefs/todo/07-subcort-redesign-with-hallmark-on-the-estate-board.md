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
