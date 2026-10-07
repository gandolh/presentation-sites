# Churchix

A **white-label church website platform**: presentation websites plus a **giving** surface (donations + fundraising campaigns). Many churches share one **codebase and component/theme library** — but each church is an **independent, separately-deployed static site** with its own branding, content, and funds. **No central backend, no multi-tenant database, no shared runtime.**

Built for the **Romanian church market**, in Romania and the diaspora. **v1 targets the Orthodox tradition** (liturgical tone, IBAN-first giving, Form 230, pomelnice).

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | **Astro** (static-first) with **React** islands |
| Shared UI / theme | `@churchix/ui` package (Astro + React components, design tokens) |
| Content | Astro **Content Collections** with shared **Zod** schemas |
| Deploy | **Static-per-build** — each church is its own CDN-hosted site |
| Giving (v1) | Server-light: **IBAN** + **Form 230** + **SMS** + **pomelnice** form + optional hosted card link (Stripe Payment Link / Netopia) |
| Backend | *Optional, per-church only* — a single-tenant **Fastify** API a church can add later for recurring/webhooks/live totals |
| Monorepo | **npm workspaces** |

## Repository layout

```
packages/   # the shared "core library" — UI, theme tokens, schemas, config
apps/       # one independent Astro site per church (content + branding only)
services/   # optional, per-church backend template (not used in v1)
corpus/     # the wiki, the work briefs and the log (start here)
docs/       # design source (design/) and architecture decision records (adr/)
```

## Documentation

Docs live in an LLM-maintained corpus under [corpus/](corpus/index.md). Start at the [index](corpus/index.md). A good reading order:

1. [overview](corpus/wiki/overview.md) — what Churchix is.
2. [architecture](corpus/wiki/architecture.md) — monorepo, frontend, static-per-build; and [independence-model](corpus/wiki/independence-model.md).
3. [content-model](corpus/wiki/content-model.md) — page inventory + content schemas; with [traditions](corpus/wiki/traditions.md) and [i18n-and-glossary](corpus/wiki/i18n-and-glossary.md).
4. [donations](corpus/wiki/donations.md) — the v1 giving stack; [optional-backend](corpus/wiki/optional-backend.md) for the future API.
5. [design-system](corpus/wiki/design-system.md) — the Tailwind + Material-3 design system.
6. [decisions](corpus/wiki/decisions.md) — settled + open questions; [research-brief](corpus/wiki/research-brief.md) for the full rationale.

Decisions are recorded as ADRs in [docs/adr/](docs/adr/). Work is tracked as numbered briefs in [corpus/briefs/](corpus/wiki/status.md), with the state of each in [status](corpus/wiki/status.md). [CLAUDE.md](CLAUDE.md) is the working brief for AI assistants and new contributors.

## Status

Early. The shared packages (`@churchix/ui`, `@churchix/schemas`, `@churchix/config`) and one reference church app (`apps/parohia-harlesti-bacau`) exist and build. The [Ecclesia Digitalis design system](docs/design/DESIGN.md) is integrated; the audit follow-ups are still open. See [status](corpus/wiki/status.md).

## Getting started

```bash
nvm use                          # Node 22 LTS (Node 20.11+ works)
npm install                      # installs all workspaces
npm run dev -w apps/<church>     # run one church site
npm run build --workspaces --if-present
npm run typecheck --workspaces --if-present
```
