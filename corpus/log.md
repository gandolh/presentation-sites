# Log

## [2026-08-23] bootstrap | corpus/ created

Bootstrapped the root `corpus/` workspace while adapting the repo to
`my-personal-skills` v0.29.0: `CLAUDE.md`, `index.md`, `routing.md`, `lint.sh`,
and the wiki spine (`overview`, `architecture`, `decisions`, `status`,
`open-questions`). Scope is the monorepo layer only — the per-site docs under
`sites/saloon/docs/`, `sites/auto-service/docs/` and `churchix/docs/corpus/` were left in
their existing shape (see `wiki/open-questions.md`).

Same pass pruned dead references and unused assets: the `showcase/*` scripts,
README section and launch config left behind when that site moved out
(`93eba5d`); the unreferenced root `hero-desktop.png`; `saloon` gallery
placeholders 07-09 and `subcort`'s `hero-tall.svg` + duplicate
`images/favicon.svg` (with their generators trimmed so they stay gone); the empty
`.playwright-mcp/` directory; and `churchix/skills-lock.json`, a stale pin to a
standalone impeccable install that the plugin now ships.

## [2026-08-23] cleanup | one doc shape, "corpus" freed, config de-coupled

Deeper pass over the repo layout. Root stays flat (five project directories) —
the grouping under `sites/` was considered and declined.

**Docs.** `sites/saloon/docs/` → `sites/saloon/docs/`, `sites/auto-service/docs/` →
`sites/auto-service/docs/`, `churchix/docs/corpus/` → `churchix/docs/wiki/`. "Corpus"
now names only this workspace. Files whose names collided were renamed for their
real job: `sites/saloon/docs/DESIGN.md` → `docs/tokens.md` (a token export, not the
impeccable design doc) and `sites/auto-service/docs/PRODUCT.md` → `docs/brief.md`.
`saloon/ADR.md` moved to `sites/saloon/docs/ADR.md`. ~30 files of references rewritten;
0 dead links across 98 markdown files. Wrote READMEs for `auto-service`,
`subcort` and `tractari`, which had none.

**Image-source bug.** `build` was mock everywhere while `dev` and `preview`
defaulted to real, so `npm run saloon:build` silently shipped placeholders.
`saloon` and `auto-service` now build real by default with `build:mock` as the
escape hatch. Verified both ways in the emitted HTML.

**Config de-coupling.** The root `.gitignore` hardcoded all four site names; its
rules are now site-agnostic `**/` patterns, so adding a site needs no edit there.
`.vscode/launch.json` went from 2 sites to all 5. Added the missing
`placeholders` script to `saloon` and `auto-service`.

**Stale docs pruned.** `churchix/CLAUDE.md` still documented `npm run deploy`,
`npm run pre-deploy`, `cp .env.example .env` and `scripts/deploy.ts` — all
removed with the deploy tooling in `6d2f237`. Replaced with the current commands.

Verified: 4 Astro builds, a sub-path build, churchix typecheck + build, 66 bots
tests, corpus lint.

Recorded two decisions (one doc shape; duplication between sites accepted) in
`wiki/decisions.md`.

## [2026-08-23] restructure | sites/ + npm workspaces + @sites/kit

Moved the four presentation sites into `sites/` and made the root an
**npm-workspaces** root (`sites/*`, `packages/*`). One lockfile, one hoisted
`node_modules`, one `npm install`. `churchix/` stays outside the workspace —
verified it keeps its own lockfile and appears nowhere in the root one.

Extracted `packages/site-kit` (`@sites/kit`) from code that was byte-identical
across sites: `withBase()`, the `createImages()` mock/real pipeline, and the
`SiteOverridesOf` type. Deleted the four copies of `src/content/url.ts` and
repointed 33 imports. Each site keeps a small `images.ts` supplying its own
`hasReal` data to shared logic.

The package ships TypeScript source with no build step, so each site declares
`vite.ssr.noExternal: ["@sites/kit"]` — without it the static build tries to
require raw TS from node_modules.

Fixed a real bug the extraction exposed: `SiteOverrides` mapped arrays through
`Partial<T[]>`, widening every element to `T | undefined`. That is wrong about
runtime (the spread merge replaces arrays wholesale) and produced 3 pre-existing
`astro check` errors in saloon and subcort. Confirmed the affected files were
byte-identical to HEAD before fixing, so the errors predated this work. The
corrected type lives in the kit; all four sites now typecheck clean.

Also dropped a dead ngrok `allowedHosts` entry from tractari's Vite config, and
fixed the VSCode launch configs, which pointed at a per-site
`./node_modules/.bin/astro` that workspaces no longer create.

This **revisits two decisions** recorded earlier the same day — "sites are
self-contained, no hoisting" and "duplication between sites is accepted".
Both are rewritten in `wiki/decisions.md` with what superseded them and why;
the second now carries the bar for what may enter the shared package
(identical logic, not similar logic) and what cannot (`import.meta.glob` for
`site.local.ts`, which resolves relative to its caller).

Verified from a clean `node_modules`: `npm install`, `npm run build` (4 sites),
`astro check` on all four, 66 bots tests, churchix install + typecheck + build,
0 dead links across 99 markdown files, corpus lint.
