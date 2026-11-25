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
