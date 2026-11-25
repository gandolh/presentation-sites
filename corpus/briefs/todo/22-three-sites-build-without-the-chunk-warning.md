# Task 22: Three sites build without the chunk-size warning

**Depends on:** nothing.
**Builder:** Sonnet ([routing.md](../../routing.md)): one warning, the same in three sites.
**Before you start:** run `brief-board guide`, then `brief-board show 22`.

Filed 2026-11-25. The owner asked for the build warnings to be fixed in the most active repos (presentation-sites
had 47 commits outside the corpus in the two days before). `npm run build` exits 0, but three sites print a warning.

## Context

From `npm run build` on 2026-11-25: design-study, subcort and tractari each print Vite's "Some chunks are larger than
500 kB after minification". In each, the warning comes right after the first Vite pass of `astro build` ("Building
static entrypoints", the prerender pass) and before the client pass. That pass renders the pages at build time; the
browser never loads its output. auto-service, saloon and tavi build clean, as does churchix.

## Decisions

All settled. None of them is open.

- **Find the chunk first.** Keep the prerender output of one site (a debug build or a reporter plugin, in a scratch
  copy) and name the chunk and what fills it, then check the other two have the same cause.
- **If the size comes from importing a whole library where the site uses a piece** (an icon set, a data file, a
  utility library), import the piece. That fixes the cause in both passes.
- **If it is a build-time-only dependency the site needs whole**, raise the limit for the prerender pass only (the
  SSR environment's `build.chunkSizeWarningLimit` through the site's Astro `vite` config), with a comment naming the
  chunk, its size and that it never ships. The client pass keeps the default 500 kB.
- **If any of it reaches the browser**, split it with a dynamic `import()` instead.

## Files you OWN

- `sites/design-study/`, `sites/subcort/`, `sites/tractari/`: their Astro configs, and source files only where an
  import changes
- `corpus/wiki/status.md`, `corpus/log.md`

## Files you must NOT touch

- The other sites, `churchix/`, the docs sites, other repos.

## Steps

1. Find and name the chunk in each site.
2. Apply the decision that fits the cause.
3. Rebuild all workspaces.

## Acceptance

- [ ] `npm run build` exits 0 and prints no warning for any site.
- [ ] `npm run check` exits 0.
- [ ] Each changed site's pages render the same as before: its built HTML is unchanged, or the outcome lists every
      difference and why.
- [ ] `bash corpus/lint.sh` passes.

## Owner steps

- If a site's built files changed: `node cli.ts <site> deploy` from vps-deploy for design-study, subcort and tractari.
  The outcome says which. A change to the prerender pass's limit alone needs no deploy.

## Owner decisions

- Settled 2026-11-25 (owner): "run build and fix all the warnings for the most active projects". Which repos count
  (more than 10 commits outside the corpus in two days) and how each warning is fixed are the controller's calls.
