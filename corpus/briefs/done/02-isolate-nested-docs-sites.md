# Task 02 — Stop the nested docs-sites leaking into their parent site's commands

## Context

Audit 2026-09-27 (see [log](../../log.md)). Commit `eda07a0` added one Starlight
docs site per site under `sites/<site>/docs-site/`, plus the workspace glob
`"sites/*/docs-site"` (root `package.json:40`). Two things broke. Both happen
because a separate Astro project now lives *inside* a site directory.

**1. Every root passthrough exits 1.** The scripts at root `package.json:6-31`
select the workspace by *path* (`-w sites/tractari`). npm reads a path as "every
workspace at or under this directory", so it now selects the site **and** its
docs-site:

```
$ npm exec -w sites/tractari -c pwd
…/sites/tractari
…/sites/tractari/docs-site
```

`npm run tractari:build` builds the site, then fails on the docs-site with
"Missing script: build" and exits **1**. Anything chained after it
(`npm run tractari:build && …`) stops. `:dev` and `:preview` also go on to run
the docs-site's `predev`/`dev`/`preview` after the site's own. This breaks:

- the README's documented commands;
- `corpus/routing.md`'s "does it still build at its sub-path?" check;
- all five `.vscode/launch.json` entries.

vps-deploy is **not** affected, because it runs `npm run build` with `cwd` set
to the site.

**2. `astro check` type-checks the docs-site.** Each site's `tsconfig.json`
includes `**/*` and excludes only `dist`. So the site's `astro check` walks
`docs-site/`, including the built `docs-site/dist/pagefind/pagefind.js`, which
produces the bulk of the ~67 hints each site reports. A docs-site type error
would fail the *site's* check.

## Files you OWN

- root `package.json` (the `scripts` block only)
- `sites/{saloon,auto-service,subcort,tractari,design-study}/tsconfig.json`

## Files you must NOT touch

- The docs-sites themselves (`sites/*/docs-site/**`). Moving them out of the site
  directories is a larger, separate decision; this brief makes the current
  layout work.
- `.vscode/launch.json`. It calls the root scripts, so fixing the scripts fixes it.
- README and corpus prose. Task 08 documents the result.

## What to do

1. In root `package.json`, select workspaces by **package name** instead of by
   path. The names are `ana-saloon`, `bavauto-gorj`, `subcort`, `tractari` and
   `design-study`. Change every `-w sites/<x>` / `--workspace sites/<x>` script,
   including `:build:mock`, `:placeholders` and `subcort:og`. `saloon:bots` uses
   `--prefix` and needs no change.
2. Add one docs passthrough per site, e.g.
   `"saloon:docs": "npm run docs -w @sites/saloon-docs"`. The docs-site package
   names are `@sites/<site>-docs`.
3. In each site's `tsconfig.json`, add `"docs-site"` to `exclude`.

## Acceptance

- `npm exec -w <name> -c pwd` prints exactly one directory for each of the five names.
- `PUBLIC_BASE=/<site> npm run <site>:build; echo $?` → `0` for all five.
- `npx astro check` in each site → 0 errors, and no diagnostic path starts with `docs-site/`.
- `npm run build` (root, all workspaces) still exits 0.
- Do **not** run `:placeholders` or `subcort:og` to test this. They rewrite
  committed SVGs. Checking their workspace selection with `npm exec` is enough.
- Careful with `:dev`: Astro 7 detaches `astro dev` when stdout is not a TTY.
  Stop any server you start (`npx astro dev stop` in the site).

## Outcome — 2026-10-01

Root scripts now select workspaces **by package name** (`ana-saloon`,
`bavauto-gorj`, `subcort`, `tractari`, `design-study`), including `:build:mock`,
`:placeholders` and `subcort:og`. `saloon:bots` keeps its `--prefix`. There is
one new passthrough per site, `<site>:docs` → `npm run docs -w
@sites/<site>-docs`. Each site's `tsconfig.json` excludes `docs-site`, and
design-study's compact array style is kept. The `package.json` diff touches
only the scripts.

- `npm exec -w <name> -c pwd` → exactly one directory for each of the five.
- `PUBLIC_BASE=/<site> npm run <site>:build` → exit **0** for all five (4, 7, 8,
  1, 183 pages).
- `npx astro check` → 0 errors in each, and no diagnostic mentions
  `docs-site`. The hint counts collapsed (saloon 6, the rest 0, where each used
  to report ~67), most of which came from the built Pagefind bundle.
- Root `npm run build` → exit 0, all five sites built.
- `npm run saloon:docs` and `npm run tractari:docs` build, and the committed
  diagram HTML is unchanged.
- `:placeholders` and `subcort:og` were **not run** (they rewrite committed
  SVGs). Their selection is the same name-based `-w` checked above.
- `:dev` was not started.
