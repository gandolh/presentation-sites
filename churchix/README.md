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
docs/       # architecture & product documentation (start here)
```

## Documentation

Docs live as an LLM-maintained wiki under [docs/corpus/](docs/corpus/index.md) — start at the [index](docs/corpus/index.md). A good reading order:

1. [overview](docs/corpus/overview.md) — what Churchix is.
2. [architecture](docs/corpus/architecture.md) — monorepo, frontend, static-per-build; and [independence-model](docs/corpus/independence-model.md).
3. [content-model](docs/corpus/content-model.md) — page inventory + content schemas; with [traditions](docs/corpus/traditions.md) and [i18n-and-glossary](docs/corpus/i18n-and-glossary.md).
4. [donations](docs/corpus/donations.md) — the v1 giving stack; [optional-backend](docs/corpus/optional-backend.md) for the future API.
5. [design-system](docs/corpus/design-system.md) — the Tailwind + Material-3 design system.
6. [decisions](docs/corpus/decisions.md) — settled + open questions; [research-brief](docs/corpus/research-brief.md) for the full rationale.

Decisions are recorded as ADRs in [docs/adr/](docs/adr/). Active design-integration work is tracked in [docs/todo/](docs/todo/README.md). [CLAUDE.md](CLAUDE.md) is the working brief for AI assistants and new contributors.

## Status

Early. The shared packages (`@churchix/ui`, `@churchix/schemas`, `@churchix/config`) and two reference church apps exist and build. The [Ecclesia Digitalis design system](docs/design/DESIGN.md) is being integrated next — tracked in [docs/todo/](docs/todo/README.md).

## Getting started

```bash
nvm use                          # Node 22 LTS (Node 20.11+ works)
npm install                      # installs all workspaces
npm run dev -w apps/<church>     # run one church site
npm run build --workspaces --if-present
npm run typecheck --workspaces --if-present
```
