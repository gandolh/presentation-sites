# Task 08 — Bring the corpus and README up to date with the docs-sites and design-study

## Context

Audit 2026-09-27 (see [log](../../log.md)). The monorepo-level docs stopped
tracking the repo after two changes: `design-study` (2026-08-23) and the
per-site Starlight docs sites (`eda07a0`). An agent that follows the retrieval
budget reads exactly the pages that are now wrong:

- `corpus/wiki/overview.md:9-10` says "There is no dependency hoisting, no
  shared runtime, and no cross-site imports". The workspaces decision
  ([decisions.md](../../wiki/decisions.md), 2026-08-23) replaced that: the root
  now hoists, and every site imports `@sites/kit`. The cast table also has no
  `design-study` row.
- `corpus/wiki/architecture.md` lists the workspace globs as
  `["sites/*", "packages/*"]`, but the root `package.json` also has
  `"sites/*/docs-site"`. The docs-sites are not mentioned anywhere in the corpus.
- `corpus/wiki/status.md` is still the 2026-08-23 snapshot and does not mention the docs-sites.
- `README.md` never mentions the docs-sites or how to build one, and its
  "Adding a new site" checklist has no docs-site step.
- **Every rendered docs page carries a wrong banner.**
  `sites/*/docs-site/scripts/sync-corpus.mjs` emits
  `:::note[Rendered from \`corpus/<src>\` …]` and "Edit the source in `corpus/`,
  not here". The real source is `sites/<site>/<src>`, and `decisions.md`
  reserves the word "corpus" for the root workspace.

Facts to record. Verify each one before writing it down:

- Each docs-site is a Starlight project at `sites/<site>/docs-site/`; churchix
  has its own at `churchix/docs-site/`.
- `npm run docs` runs sync-corpus, then build-diagrams, then `astro build`.
- sync-corpus renders the site's `README.md`, `PRODUCT.md`, `DESIGN.md` and
  `docs/*` into `src/content/docs/wiki/`, which is gitignored.
- Diagrams are archify JSON under `diagrams/`. The rendered HTML under
  `public/diagrams/` is **committed**, because archify is a per-machine agent
  skill, not an npm dependency.
- The base `/<site>/docs/` is baked into `astro.config.mjs` (override with
  `DOCS_BASE`), and the site deploys to `https://gandolh.ro/<site>/docs/`.

## Files you OWN

- `corpus/wiki/overview.md`, `corpus/wiki/architecture.md`, `corpus/wiki/status.md`
- `corpus/index.md` — only through `bash corpus/lint.sh --index`
- `corpus/log.md` — one entry
- `README.md`
- the banner lines in the five `sites/*/docs-site/scripts/sync-corpus.mjs` (text only)

## Files you must NOT touch

- `corpus/wiki/decisions.md`, except to add one entry recording where the
  docs-sites live and why. It is a structural choice with a real alternative
  (a separate docs tree or repo).
- `churchix/**` (it governs itself), and the per-site `docs/` content.

## What to do

- Rewrite the stale claims as synthesis, not as a changelog.
- Add the `design-study` row to the overview's cast table.
- Add a short "Docs sites" section to `architecture.md` and to `README.md`.
  Take the commands from Task 02 (`npm run <site>:docs`).
- Add a docs-site step to the README's "Adding a new site" checklist.
- Change the banner so it names the real source path (`sites/<site>/<src>`).
- Bump `updated:` on every wiki page you touch, add the `log.md` entry, and run
  `bash corpus/lint.sh --index`.

Depends on Task 02, for the `:docs` commands this documents.

## Acceptance

- `bash corpus/lint.sh` → OK.
- `grep -n 'no dependency' corpus/wiki/overview.md` → nothing.
- `grep -rn 'Rendered from \`corpus/' sites/*/docs-site/scripts` → nothing.
- A fresh reader who follows `index.md` → `overview.md` → `status.md` learns
  that design-study and the docs-sites exist, and how to build a docs-site.
