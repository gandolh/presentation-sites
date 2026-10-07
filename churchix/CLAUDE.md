# CLAUDE.md — Churchix working brief

Operating notes for AI assistants and new contributors. Keep this file current as decisions land.

## What Churchix is

A **white-label** platform that delivers **presentation websites for churches** plus a **giving** surface (donations + fundraising campaigns). A shared codebase and component/theme library back many sites, but **each church is an independent, self-hosted deployment** that brings its own branding, content, languages, and funds. There is **no central multi-tenant backend** managing churches — the only thing shared is code (the `@churchix/*` packages).

Target market: **Romanian churches** in Romania **and** the diaspora (US, Canada, UK, Italy, Spain, Germany). **v1 focuses on the Orthodox tradition** — formal/liturgical tone, IBAN-first giving, Form 230, and Orthodox-specific features (pomelnice, sacrament info). The architecture stays open to Greek-Catholic and Protestant/evangelical churches later, but Orthodox is the design target now. See [corpus/wiki/content-model.md](corpus/wiki/content-model.md) and [corpus/wiki/traditions.md](corpus/wiki/traditions.md).

## Tech decisions (locked)

- **Monorepo: npm workspaces.** Not pnpm, not Yarn. Globs: `packages/*`, `apps/*`, `services/*`. Single root `package-lock.json`.
- **Frontend: Astro, static-first, with React islands.** Ship HTML; hydrate only interactive bits via `client:*` directives. React (`react` / `react-dom`) is a **peerDependency** of `@churchix/ui` — never bundle two copies.
- **Content: Astro Content Collections** with **shared Zod schemas** exported from `@churchix/schemas`. Every church's `content.config.ts` imports the same schemas → consistent frontmatter across all sites.
- **Branding: design tokens via CSS custom properties.** A small, bounded token set (colors, typography, logo, favicon, radii). Branding never forks components. Cap the override surface to a documented "safe set"; bespoke layouts go behind a deliberate escape hatch.
- **Independent per-church deployments.** Each church is its own Astro app, built and hosted separately, with its own config, env, branding, and content. **No shared runtime, no central backend, no multi-tenant database.** Sites diverge freely; the only thing in common is the `@churchix/*` packages.
- **Deploy: static-per-build.** Each church is a static SSG build on a CDN. Dynamic bits stay off the critical path (hosted payment pages, form services). Adopt an Astro adapter + on-demand routes only if a church later needs server logic.
- **Giving: server-light, per-church.** v1 uses **IBAN**, **Form 230**, **SMS** info (static) + a **pomelnice** form posting to a church-configured endpoint + optional card via a hosted **Stripe Payment Link / Netopia** URL. Card data never touches our code (PCI **SAQ A**). A full Fastify donations API (recurring, webhooks, live campaign totals) is an **optional per-church** add-on, never a shared service.
- **Money: integer minor units + explicit currency**, always. No floats.

See [corpus/wiki/architecture.md](corpus/wiki/architecture.md) for the full rationale.

## Repository layout

```
packages/
  ui/              @churchix/ui        Astro + React components, layouts, theme tokens CSS
  schemas/         @churchix/schemas   Zod content-collection schemas + shared types
  config/          @churchix/config    base tsconfig + shared config
apps/
  <church-slug>/   one independent Astro site per church (content + branding only)
services/
  api/             (optional, future) per-church Fastify donations API — NOT a shared service
corpus/            the LLM-maintained wiki + briefs (todo/done/superseded) + log
docs/              design source (design/) and the ADRs (adr/), linked from corpus/
```

Internal packages are referenced as `"@churchix/ui": "*"` and symlinked by npm workspaces. Apps depend on packages; **apps never depend on each other**, and there is no shared runtime between them.

## Conventions

- **TypeScript everywhere**, `strict` on (see `tsconfig.base.json`). `noUncheckedIndexedAccess` is on.
- **Romanian diacritics (ă, â, î, ș, ț) must work end-to-end** — UTF-8, fonts, slugs, search, PDFs/receipts.
- **i18n is mandatory.** RO + EN minimum; IT / ES / DE for diaspora regions. Liturgical/theological terms often stay in Romanian even inside English pages (e.g. an EN nav item may still read "Slujbele religioase"). Maintain the domain glossary in [corpus/wiki/i18n-and-glossary.md](corpus/wiki/i18n-and-glossary.md).
- **The shared `@churchix/*` packages contain no per-church values** — branding enters only as design tokens (CSS custom properties) read from each church's `site` content entry at build time.
- **Each church app is self-contained**: its own `astro.config`, content, branding, env/secrets, and (optional) backend. Adding a church = a new directory under `apps/`, not a config change anywhere central.
- **White-label every artifact**: pages, forms, receipts, error pages carry the *church's* brand, not Churchix's.

## Common commands

```bash
npm install                          # install all workspaces (Node >= 22, npm >= 10)
npm run dev -w apps/<church>         # run one church site
npm run dev:bac                      # shortcut for apps/parohia-harlesti-bacau
npm run build --workspaces --if-present
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
npm run format                       # prettier --write .
npm install <pkg> -w packages/ui     # add a dependency to a specific workspace
PUBLIC_SITE_WIP=1 npm run build -w apps/<church>   # build with the "Site în lucru" banner on
```

> **Deploy is not in this repo.** It was moved out in `6d2f237` (2026-06-18) along
> with every other site's deploy tooling. Each church app builds a static `dist/`
> that is served by Caddy on the VPS; the build+upload tooling and the server
> config live outside this repo.

> npm workspaces has no built-in "build only changed packages" filter. If CI build time becomes a problem as churches multiply, introduce Turborepo (deferred for now).

## Romania-specific things not to forget

- **Form 230** — individuals may redirect up to 3.5% of income tax to a church/NGO (deadline ~25 May, valid up to 2 years). First-class giving channel, not an afterthought.
- **Form 107 sponsorship** — companies, up to 20% of corporate income tax, requires a signed sponsorship contract.
- **SMS micro-donations** — 2 EUR via Vodafone / Telekom / Orange; expected for big capital projects.
- **IBAN bank transfer** — universal baseline, especially for Orthodox / Greek-Catholic parishes (often RON/EUR/USD accounts).
- **Pomelnice** (Orthodox) — submit names of living (`pomelnic de vii`) and departed (`pentru cei adormiți`) for prayer, usually with a small offering. A first-class Orthodox feature with no Protestant analog.
- **Tithe terminology**: `zeciuială` (Pentecostal/Baptist), `zecime` (Adventist), vs `dar` / `jertfă` / `donații` (freewill). Don't conflate.
- **Compliance**: GDPR + Romanian Law 190/2018; each church = data controller, Churchix = processor (sign DPAs). Per-tenant sequential receipt numbering; ~5-year financial-record retention. Confirm e-Factura / SAF-T applicability per tenant with their accountant.

## Where to look

Docs and work live in [corpus/](corpus/index.md), an LLM-maintained wiki with a briefs lifecycle. Its rules, including the retrieval budget, are in [corpus/CLAUDE.md](corpus/CLAUDE.md): read `corpus/index.md`, then at most 2 or 3 wiki pages. Work is a numbered brief in `corpus/briefs/todo/`, and every brief's state is one line in [status](corpus/wiki/status.md). When you land work, move the brief to `corpus/briefs/done/` with an outcome note, add a [log](corpus/log.md) entry, and fold what you learned into the wiki. Check it with `bash corpus/lint.sh`.

- Start here → [corpus/index.md](corpus/index.md) · [overview](corpus/wiki/overview.md)
- How it's built → [architecture](corpus/wiki/architecture.md) · [independence-model](corpus/wiki/independence-model.md)
- What a church site contains → [content-model](corpus/wiki/content-model.md) · [traditions](corpus/wiki/traditions.md) · [i18n-and-glossary](corpus/wiki/i18n-and-glossary.md)
- Giving design → [donations](corpus/wiki/donations.md) · [optional-backend](corpus/wiki/optional-backend.md)
- Design system → [design-system](corpus/wiki/design-system.md) (ADRs in [docs/adr/](docs/adr/); brief rules in [conventions](corpus/wiki/conventions.md))
- State of the work → [status](corpus/wiki/status.md)
- Decisions & rationale → [decisions](corpus/wiki/decisions.md) · [research-brief](corpus/wiki/research-brief.md) · [research-brief-giving](corpus/wiki/research-brief-giving.md)
