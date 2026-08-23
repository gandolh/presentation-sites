---
summary: Locked structural choices for this monorepo — self-contained sites, deploy living elsewhere, env-driven base paths, the mock/real image split, and gitignored business data. Do not relitigate without a log entry.
updated: 2026-08-23
---

# Decisions

Settled calls. Each is hard to reverse, non-obvious, and had a real alternative.
Changing one needs an explicit revisit plus a [`log.md`](../log.md) entry.

## Sites are self-contained; the root is a passthrough

**2026-06** — Every site owns its `package.json`, `node_modules`, build and docs.
The root only proxies scripts.

*Rejected:* npm/pnpm workspaces with hoisting at the repo root.
*Why:* the sites share no code and no release cadence — they are separate client
deliverables that happen to live in one place. Hoisting would couple their
dependency versions and make "move one site out" a surgery instead of a `git mv`.
That bet already paid: `showcase/` left the repo cleanly in `93eba5d`.

## Deploy lives outside this repo

**2026-06-18** (commit `6d2f237`) — All `deploy/`, `deploy.ts`, `Caddyfile.example`
and `infrastructure/` content was removed. Sites build a static `dist/`; the
upload tooling and Caddy config are maintained elsewhere.

*Rejected:* keeping per-site `deploy.ts` + a shared `scripts/deploy.mjs`.
*Why:* the deploy targets one shared VPS whose Caddy config spans projects beyond
this repo. Five copies of a deploy script drifted against one server, and server
credentials kept wanting to live next to marketing copy.

## Sub-path hosting via an env-driven `base`

**2026-06** — `base: process.env.PUBLIC_BASE ?? '/'` plus a `withBase()` helper
that every internal URL passes through.

*Rejected:* hardcoding `/saloon` in `astro.config.mjs`; hosting each site on its
own domain.
*Why:* one VPS, one Caddy, many sub-paths — but dev must still run at `/`. The
helper makes the difference invisible to components; the cost is that a raw
`href="/x"` anywhere is a bug that only shows up in production.

## Images are addressed by logical name, mock and real are separate sources

**2026-06** — `img("gallery-01")` resolves through `src/content/images.ts`;
committed generated SVG placeholders in `public/images/`, gitignored real photos
in `public/images/real/`.

*Rejected:* committing real photos; editing component paths when photos arrive.
*Why:* these are client sites built before the client's photos exist, and the
photos are real business assets that shouldn't sit in a public git history.
Swapping a source must be a file drop plus an env var, not a diff.

## Real business data is gitignored, with a committed example

**2026-06** — `src/content/site.local.ts` is ignored; `site.local.example.ts` is
committed and documents every field.

*Rejected:* committing real contact details, or reading them from a CMS.
*Why:* these are static sites for small businesses — a CMS is overkill — but
addresses, phone numbers and IBANs shouldn't be in a public repo. The example
file keeps the shape reviewable without exposing the values.

## One doc shape per project; "corpus" names only this workspace

**2026-08-23** — Every project carries `README.md` + `PRODUCT.md` + `DESIGN.md`
at its root and everything else under `docs/`. The per-site `corpus/` directories
became `docs/`, and `churchix/docs/corpus/` became `churchix/docs/wiki/`.

*Rejected:* leaving each project's docs in the shape it grew into; renaming the
root workspace instead.
*Why:* "corpus" had come to mean three different things — the skill workspace at
the root, the Romanian business docs in two sites, and churchix's wiki. The
tooling reads `corpus/` as one specific shape, so the collision actively misled
it. Freeing the word cost only renames. Files whose names collided were renamed
for the job they actually do (`saloon/corpus/DESIGN.md` → `docs/tokens.md`, a
token export, not the impeccable design doc; `auto-service/corpus/PRODUCT.md` →
`docs/brief.md`). `PRODUCT.md` and `DESIGN.md` keep their exact names at each
project root because impeccable reads them there.

## Duplication between sites is accepted, not fixed

**2026-08-23** — `src/content/url.ts` is identical across all four sites modulo
comments, and `images.ts` differs only in its `HAS_REAL` list. This stays
duplicated.

*Rejected:* extracting a shared `@sites/helpers` package.
*Why:* it is roughly 70 lines per site, and a shared package would reintroduce
exactly the coupling the self-contained decision above buys out — a version to
bump, a build order, and a reason for one site's change to break another. The
duplication is the price of independence, and at this size it is the right price.
Revisit only if the shared surface grows well past a few small helpers.

## churchix governs itself

**2026-06** — `churchix/` keeps its own `CLAUDE.md`, its own `docs/corpus/`, and
its own npm-workspaces monorepo.

*Rejected:* folding churchix's docs into this corpus.
*Why:* it is a *product* with its own decision surface (giving, i18n, Orthodox
domain rules), not a marketing site. Its docs are far larger than every other
site's combined; merging them would blow this corpus's retrieval budget.
