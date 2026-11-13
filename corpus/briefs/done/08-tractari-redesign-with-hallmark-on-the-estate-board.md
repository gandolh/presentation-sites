# Task 08: A redesign of tractari with Hallmark, on the estate board

**Depends on:** brief 03, brief 04, and the skills library's brief 24 (Hallmark vendored, taste-skill 2.5's ideas adopted) and the estate redesign board, as in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). That brief holds the steps and the acceptance every site's redesign shares ("The steps all four redesigns share"). Read it first. The owner's answer of 2026-11-10 to Q39 replaces the bake-off.

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

Steps 1 to 5 of "The steps all four redesigns share" in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Then one commit for the token change, then one per section in the order the page shows them: `Hero` with `CallDock`, `Services`, `Process`, `Coverage`, `Contact`, `Footer`.

## Acceptance

- [ ] The common acceptance in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md) (step 6 there).
- [ ] After `npm run tractari:build`, `grep -c 'href="tel:' sites/tractari/dist/index.html` prints at least as many as today (10).
- [ ] A Playwright run at 390 px scrolls to the bottom and finds the `CallDock` call link visible, at 4.5:1 contrast against what is behind it, with the WebGL scene on and with `prefers-reduced-motion` on.
- [ ] The call link is clickable before the scene has loaded (a Playwright run with the scene's chunk blocked).

## Interplay

- Briefs 03 and 04 first. `HeroCanvas.tsx:32, 36` and `scene.ts:122, 330` carry brief 03's lint fixes.
- The OG image, if any, follows the tokens.
- **gsap (added 2026-11-11).** `sites/tractari/package.json` depends on `gsap`, and the README, `PRODUCT.md` and the corpus name it for the hero, but no code imports it (knip ignores it for now). This brief settles it. If the redesigned hero animates with gsap, it imports it and the knip ignore goes. If not, the dependency, the ignore and every mention go in one commit.

## Outcome (2026-11-13)

Built on `main` as local commits: the approval log entry, the tokens, hero with the board and `CallDock` (header, banner and phone menu with it), servicii, acoperire, cum funcționează, footer, the gsap removal, the checks and docs, plus this closeout (hashes in the board's end move). Not deployed: owner step `node cli.ts tractari deploy` from the vps-deploy checkout (a static site).

- **Direction:** "Lines first", approved with every board question as proposed. The night road is gone (recorded in [decisions-ui.md](../../wiki/decisions-ui.md)); `DESIGN.md` is rewritten from what shipped and `PRODUCT.md` has a new structural move and principles. Fonts unchanged (Archivo 5.3.0, Big Shoulders Display 5.2.5). `gsap` is out (dependency, knip ignore, README and PRODUCT.md lines); only `package-lock.json` and the tractari `package.json` changed for it.
- **Dropped tokens:** `inverse-surface`, `inverse-surface-2`, `inverse-on-surface`, `inverse-on-surface-variant`, `accent-soft`, `on-accent-soft`, `accent-bright`, `headlight`, `success`, `error`, `on-error`, `--radius`. Dropped classes: `.road*`, `.stop*`, `.stop-label`, `.eyebrow`, `.glow-word`, `.grain`, `.badge-nonstop`, `.roadline`, `.timeline*`, `.svc-*`, `.card`, `.chip`, `.reveal` (and its script in `Base.astro`), `beacon-pulse`, `.section`.
- **Shared and own checks:** `SITES=tractari npx playwright test -c e2e --workers=2` after `npm run tractari:build`: the Floor specs (contrast, focus, motion, overflow), the phone menu spec and `e2e/tractari.spec.ts` (first screens at 1280x800, 768x1024, 390x844, 360x800 and 360x690 with Andrei whole, the observer states and one orange call per frame, the dock with and without script, the dock's contrast, the plate's call clickable with the scene chunk blocked, the scene never drawing under reduced motion and pausing off-screen, "no phone number wraps", clip, column and gap checks at 1280, 1024, 1000, 800, 768, 390, 360, and the shots).
- **Contrast minimums (scripted over the built page, both widths; one dark look):** text 6.20:1 (near-black on the orange), icons 4.55:1 (the orange glyph on the raised well). The orange call: `on-accent` on `accent` 6.20.
- **Compared with the comps** (the twins rendered with the fontsource files in place of Google Fonts, same viewport, reduced motion so the plate is the CSS backdrop, differing pixels at a 24/255 threshold): home 0.47% at 1280 and 1.09% at 390; section crops at 1280: board 0.14%, servicii 1.07%, acoperire 1.81%, steps strip 0.00%, footer 0.20%. At 390 the crops read 4.8-7.1% from a one pixel shift at the crop's left edge, with the same sizes everywhere (the full page matches at 1.09%). Every difference is text antialiasing. Not compared: the scene itself (the twins draw none), the dock and callouts (hidden in both), the scrolled twin's header fill (checked by the spec). Shots (outside git) are in the estate build folder, `board/impl/tractari/`, named `<screen>-dark-<width>.png`.
- **Acceptance:** `grep -o 'href="tel:' sites/tractari/dist/index.html | wc -l` prints 9 (header 1, board 3, Servicii 1, footer 3, dock 1; `grep -c` prints 2 because it counts lines).
- **Undrawn screens:** none; the phone Drawer (open) and the dock open were restyled from the direction sheet's patterns (rows with a 20 px orange glyph, no orange fills).
- **Deviations and findings:**
  - The sheet says the plate's number never drops below 40 px; the comp (and so the build) sets it at 32 px at 760 px and under (48 above). Owner's call whether a phone number of 40 px fits a 360 px row.
  - The twin draws the amber `Gorj` hub label 26 px above the node, the old map 14; labels follow the twin.
  - The scene's camera view is offset by a quarter of the plate's height (`scene.ts`, `resize`), since it was framed for a tall viewport and the strip would cover the truck.
  - The twin's scroll reveal and the map's drawing animations are gone (nothing in the comps animates); the lane's travelling glow went with the spine.
  - The scene's first frames draw before the observer's first callback; the loop stops straight after when the plate is off-screen (the spec checks it stays stopped, not that it never drew).
  - The `.mail` line sits under the board inside the hero, as the twin draws it.
  - Not changed (outside this brief): the OG card PNG, whose `scripts/og-card.html` names the old night-road look; a regenerated card is a follow-up. `responseMinutes` stays unused in `site.ts` (controller: a later cleanup).
