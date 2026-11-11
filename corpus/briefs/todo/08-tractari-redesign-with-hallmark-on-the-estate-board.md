# Task 08: A redesign of tractari with Hallmark, on the estate board

**Depends on:** brief 03, brief 04, and the skills library's brief 24 (Hallmark vendored, taste-skill 2.5's ideas adopted) and the estate redesign board, as in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md). That brief holds the steps and the acceptance every site's redesign shares ("The steps all four redesigns share"). Read it first. The owner's answer of 2026-11-10 to Q39 replaces the bake-off.

**Runs before:** nothing. It needs 03 and 04, and runs in any order with 05, 06 and 07.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

AXA Tractări is a vehicle towing and roadside-assistance service for Oltenia. It is a **demo**: the company, numbers and legal identifiers are placeholders. The page has one job: make a stranded driver **call, instantly**, at any hour (`sites/tractari/PRODUCT.md`, "The one thing"). Every decision serves a phone number that is unmissable and one tap away from any scroll position, and the cinematic hero must never gate or delay it.

### What tractari has (read 2026-11-10)

One route: `/`, `sites/tractari/src/pages/index.astro`. It renders `DemoBanner`, `Nav` (with `MobileMenu.tsx`), `Hero` (the 3D scene in `src/components/hero/`: `HeroCanvas.tsx`, `scene.ts`), `Services`, `Process`, `Coverage`, `Contact`, `Footer`, and `CallDock.tsx`, a React island that keeps the call button on screen. There is no legal or cookie page, and no `<form>`.

What its design docs fix today (`sites/tractari/DESIGN.md`, `PRODUCT.md`):

- "Headlights on a wet road at 3am": **dark by default**, asphalt at night. Amber is the identity, one hotter safety-orange is reserved for the call action. The owner answered on 2026-11-10 that the client sites keep the one look designed for each, so it stays dark, with no light theme and no theme switch.
- The 3D scene is the main accent. The page is otherwise minimalist.
- Anti-references: the Romanian "tractari auto" market (red on white, stock tow-truck photo, four icon boxes), and the generic AI landing page (centred hero stack, equal-box grids, an eyebrow on every section).
- Motion and performance rules: `DESIGN.md`, "Motion & accessibility" and "Performance". Hero pause off-screen: [wiki/site-patterns.md](../../wiki/site-patterns.md).

## Owner decisions (defaults)

1. **The world stays.** Default: Hallmark proposes inside the night road, with one alternative on the board.
2. **Photographs.** Default: none. The anti-reference names the stock tow-truck photo, and the scene is the visual.

## Files you OWN

- `sites/tractari/src/styles/global.css`, `src/components/*` (including `hero/`, for colour and layout only), `src/layouts/*`, `src/pages/index.astro`.
- `sites/tractari/DESIGN.md`.
- For the gsap step in Interplay only: `sites/tractari/package.json`, the root `package-lock.json`, the `sites/tractari` entry in `knip.config.js`, and the gsap lines in `sites/tractari/README.md` and `PRODUCT.md`.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md), and the corpus lines that name gsap.

## Files you must NOT touch

- The numbers, the coverage list and every business fact in `src/content/`.
- Other sites and `churchix/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share" in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Then one commit for the token change, then one per section in the order the page shows them: `Hero` with `CallDock`, `Services`, `Process`, `Coverage`, `Contact`, `Footer`.

## Acceptance

- [ ] The common acceptance in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md) (step 6 there).
- [ ] After `npm run tractari:build`, `grep -c 'href="tel:' sites/tractari/dist/index.html` prints at least as many as today (10).
- [ ] A Playwright run at 390 px scrolls to the bottom and finds the `CallDock` call link visible, at 4.5:1 contrast against what is behind it, with the WebGL scene on and with `prefers-reduced-motion` on.
- [ ] The call link is clickable before the scene has loaded (a Playwright run with the scene's chunk blocked).

## Interplay

- Briefs 03 and 04 first. `HeroCanvas.tsx:32, 36` and `scene.ts:122, 330` carry brief 03's lint fixes.
- The OG image, if any, follows the tokens.
- **gsap (added 2026-11-11).** `sites/tractari/package.json` depends on `gsap`, and the README, `PRODUCT.md` and the corpus name it for the hero, but no code imports it (knip ignores it for now). This brief settles it. If the redesigned hero animates with gsap, it imports it and the knip ignore goes. If not, the dependency, the ignore and every mention go in one commit.
