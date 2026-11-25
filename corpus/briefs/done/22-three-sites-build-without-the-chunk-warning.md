# Task 22: Three sites build without the chunk-size warning

**Depends on:** nothing.
**Builder:** Sonnet ([routing.md](../../routing.md)): one warning, the same cause in three sites.
**Before you start:** run `brief-board guide`, then `brief-board show 22`.

Filed 2026-11-25. The owner asked for the build warnings to be fixed in the most active repos (presentation-sites
had 47 commits outside the corpus in the two days before). `npm run build` exits 0, but three sites print a warning.

## Context

From `npm run build` on 2026-11-25: design-study, subcort and tractari each print Vite's "Some chunks are larger than
500 kB after minification", for a browser chunk that carries three.js (0.185.1):

- subcort: `_astro/tent-scene-*.js`, 519 kB, the hero's tent scene (`src/components/hero/tent-scene.ts`), which
  `HeroScene.astro` loads with `await import()`.
- tractari: `_astro/scene-*.js`, 531 kB, the hero scene (`src/components/hero/scene.ts`), which `HeroCanvas.tsx` loads
  with `await import()`; the island is `client:only="react"`.
- design-study: `_astro/Carousel-*.js`, 885 kB, the spatial theme's carousel (`src/themes/spatial/Carousel.tsx`,
  react-three-fiber 9.7.0 and three.js), a `client:only="react"` island.

All three already load on demand, after the page. auto-service, saloon and tavi build clean. churchix has its own
build and wasn't part of this run.

## Decisions

All settled. None of them is open.

- **Split by size first.** In each of the three sites' Astro `vite` config, add a rolldown `codeSplitting` group for
  `three` (and `@react-three` in design-study) with `maxSize: 500_000`. three.js ships as more than one module
  (`three.core.js` and `three.module.js`), so the scene chunk can split at module boundaries. The pieces still load
  only when the scene does.
- **If a single module stays over 500 kB**, keep that piece whole and set that site's `build.chunkSizeWarningLimit`
  to the next 100 kB above it, with a comment naming three.js, the size and that it loads only with the scene. Only
  that site's limit moves.
- Nothing about the scenes changes: same island directives, same lazy imports, same look.

## Files you OWN

- `sites/design-study/astro.config.*`, `sites/subcort/astro.config.*`, `sites/tractari/astro.config.*`
- `corpus/wiki/status.md`, `corpus/log.md`

## Files you must NOT touch

- The sites' source, the other sites, `churchix/`, the docs sites, other repos.

## Steps

1. Add the split to the three configs and rebuild.
2. Where a piece stays over 500 kB, set that site's limit as decided.
3. Rebuild all workspaces.

## Acceptance

- [ ] `npm run build` exits 0 and prints no warning for any site; the outcome lists each site's three.js chunks
      before and after.
- [ ] `npm run check` exits 0.
- [ ] In each site's preview: the scene renders and animates as before, with no failed chunk request and no console
      error (design-study in its spatial theme).
- [ ] `bash corpus/lint.sh` passes.

## Owner steps

- For each site whose built files changed (a split changes them; a limit alone doesn't): `node cli.ts <site> deploy`
  from vps-deploy, for design-study, subcort and tractari. The outcome says which.

## Owner decisions

- Settled 2026-11-25 (owner): "run build and fix all the warnings for the most active projects". Which repos count
  (more than 10 commits outside the corpus in two days) and how each warning is fixed are the controller's calls.

## Outcome (2026-11-25)

- **The split.** Each site's `astro.config.mjs` gains `vite.build.rolldownOptions.output.codeSplitting` with one group
  named `three` (`/node_modules[\\/]three[\\/]/`; design-study also matches `@react-three`) and `maxSize: 500_000`. three.js
  splits at its module boundary (`three.core.js`, `three.module.js`), so every piece is under 500 kB and no
  `chunkSizeWarningLimit` was needed in any site. The old comments saying "no manualChunks needed" went, since the
  config now says how the chunk is cut. Nothing in any site's source changed.
- **Tavi was added** (the controller's scope note): brief 16's 3D scene made `npm run tavi:build` print the same warning
  for `view.*.js` (621 kB, 154.5 kB gzip). The same rule fixed it, with no decision for the owner.
- **Chunks, before and after** (minified bytes):

  | Site | Before | After |
  |---|---|---|
  | design-study | `Carousel` 885,160 | `three` 373,472 + 356,293 + 148,638 (the scene code is under 60 kB) |
  | subcort | `tent-scene` 518,721 | `three` 343,716 + 172,651 |
  | tractari | `scene` 530,982 | `three` 343,714 + 182,639 |
  | tavi | `view` 621,375 | `three` 352,601 + 220,272 |

  The pieces are requested only with the scene (no `three.*.js` in any page's HTML). auto-service and saloon still build
  with no warning.
- **Previews.** design-study (`/spatial/`), subcort, tractari and tavi each loaded their `three.*` pieces with no failed
  or 4xx request and no console or page error; the screenshots render (design-study's carousel, tractari's page, the
  subcort and tavi canvases change between frames).
- **Tavi's e2e, whole suite** (`npm run tavi:build`, then `SITES=tavi npx playwright test -c e2e`): 155 passed, 1
  failed, 134 skipped, twice. The one failure is brief 19's `chapter 5's Wind` check: `up.spring` is
  0.9999999943766937, not 1, once the reserve has begun to fall. It fails the same way with this change stashed, so it
  isn't caused here. It is left for a follow-up (`toBeCloseTo` in `e2e/tavi.spec.ts:2798`).
- **Owner steps.** The built files of all four sites changed, so each needs `node cli.ts <site> deploy` from vps-deploy:
  design-study, subcort, tractari and tavi (tavi isn't deployed since brief 11 anyway). The board was not updated:
  brief-board was not available in this session.
