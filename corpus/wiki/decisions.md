---
summary: Locked structural choices for this monorepo — self-contained sites, deploy living elsewhere, env-driven base paths, the mock/real image split, and gitignored business data. Do not relitigate without a log entry.
updated: 2026-08-23
---

# Decisions

Settled calls. Each is hard to reverse, non-obvious, and had a real alternative.
Changing one needs an explicit revisit plus a [`log.md`](../log.md) entry.

## Sites live under `sites/`, as npm workspaces

**2026-08-23** (revisits the 2026-06 "self-contained, no hoisting" call) — The
four presentation sites moved into `sites/` and the root became an
**npm-workspaces** root (`sites/*`, `packages/*`). One lockfile, one
`node_modules`, one `npm install`. `churchix/` stays outside the workspace with
its own lockfile and its own `packages/*`.

*Superseded:* "every site owns its `package.json`, `node_modules` and build; the
root only proxies scripts", which rejected hoisting to keep sites independently
movable.
*Why the change:* the original reasoning held that the sites share no code. They
did — `url.ts` was byte-identical in all four and `images.ts` differed only in a
list — so the independence was buying isolation that nothing was using while a
bug fix had to be applied four times. Workspaces make the sharing explicit and
bounded (see below) and cost one lockfile.
*What is preserved:* a site is still a directory you can lift out. Its only
in-repo dependency is `@sites/kit`; moving it out means inlining one small
package. Deploy is still per-site and unchanged.

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
for the job they actually do (`sites/saloon/docs/DESIGN.md` → `docs/tokens.md`, a
token export, not the impeccable design doc; `sites/auto-service/docs/PRODUCT.md` →
`docs/brief.md`). `PRODUCT.md` and `DESIGN.md` keep their exact names at each
project root because impeccable reads them there.

## Shared code lives in `@sites/kit`, and the bar is "identical, not similar"

**2026-08-23** (same session, replaces the "duplication is accepted" call made
earlier that day) — `packages/site-kit` holds `withBase()`, the `createImages()`
mock/real pipeline, and the `SiteOverridesOf` type. Sites depend on it as
`"@sites/kit": "*"`.

*Rejected:* leaving `url.ts` and `images.ts` duplicated four times; and, at the
other extreme, a general "shared components" package.
*Why:* the duplication was real and already costing — the `SiteOverridesOf` array
bug existed identically in all four sites and produced type errors in two. Fixing
it once is the whole argument. The package ships **TypeScript source, no build
step**, so there is no build order to get wrong; Vite compiles it as part of the
consuming site, which is also why `import.meta.env.BASE_URL` correctly resolves
to that site's base.

*The bar, which matters more than the package:* only **identical logic** goes in.
Anything a site configures stays in the site. Two things are excluded on purpose
and documented in the package README —

- **`site.local.ts` loading.** `import.meta.glob` resolves relative to the
  calling file, so moving it into the package would glob the package directory.
  It *cannot* be shared, not merely shouldn't be.
- **Placeholder generators.** Each site draws different artwork; sharing them
  would produce a switch statement, not a library.

A site's `images.ts` therefore stays per-site — it supplies data (`hasReal`) to
shared logic.

## Icons come from one family, inlined at build time

**2026-08-23** — `astro-icon` + `@iconify-json/ph` (Phosphor) for `.astro`
files, `@phosphor-icons/react` for the single React island. Currently saloon
only; the other three sites still hand-roll SVGs.

*Rejected:* hand-rolled SVG paths (the status quo), Lucide, and a React-only
icon library for the whole site.
*Why:* the hand-rolled paths had drifted to three different stroke widths
(1.5 / 1.6 / 2.0) across eight components, which is exactly the inconsistency an
icon set exists to prevent. Lucide was offered and is fine, but Phosphor has a
`light` weight that suits the brand's thin gold linework and ships the brand
glyphs (WhatsApp, Instagram, Facebook) in the same family, so one package covers
everything. A React icon library alone was rejected because most components here
are `.astro`: `astro-icon` inlines the SVG at build with **no runtime and no
sprite request**, which a React library cannot do for static markup.

*The cost, measured:* the React island went to 6.8 KB, so the named imports
tree-shook; the whole library would have been hundreds of KB. If that ever
regresses, check the import style first.

*The rule this creates:* one family, no hand-rolled paths. Written into
`sites/saloon/DESIGN.md`.

## churchix governs itself

**2026-06** — `churchix/` keeps its own `CLAUDE.md`, its own `docs/corpus/`, and
its own npm-workspaces monorepo.

*Rejected:* folding churchix's docs into this corpus.
*Why:* it is a *product* with its own decision surface (giving, i18n, Orthodox
domain rules), not a marketing site. Its docs are far larger than every other
site's combined; merging them would blow this corpus's retrieval budget.
