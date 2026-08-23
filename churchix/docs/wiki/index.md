# Wiki index

The catalog for the Churchix wiki. One entry per page (link · summary · status). New to the repo? Start with [overview](overview.md), then [architecture](architecture.md). How this wiki works: [SCHEMA.md](SCHEMA.md). Chronological change log: [log.md](log.md).

## Orientation

| Page | Summary | Status |
| ---- | ------- | ------ |
| [overview](overview.md) | What Churchix is — white-label church websites + giving, v1 Orthodox. | stable |
| [SCHEMA.md](SCHEMA.md) | How this wiki is structured and maintained (conventions + workflows). | stable |

## Architecture & platform

| Page | Summary | Status |
| ---- | ------- | ------ |
| [architecture](architecture.md) | Monorepo, Astro static-first + React islands, content collections, static-per-build. | stable |
| [independence-model](independence-model.md) | Why each church is a fully independent deployment with nothing shared at runtime. | stable |
| [optional-backend](optional-backend.md) | The optional, single-tenant Fastify donations API a church can add later. | stable |

## Product surface

| Page | Summary | Status |
| ---- | ------- | ------ |
| [content-model](content-model.md) | The page inventory a church site needs and the Content Collections / Zod schemas. | stable |
| [traditions](traditions.md) | The two Romanian church markets, how they converge and diverge, what each needs. | stable |
| [i18n-and-glossary](i18n-and-glossary.md) | Mandatory languages, Romanian diacritic rules, and the domain vocabulary. | stable |
| [donations](donations.md) | The server-light v1 giving stack and Romania-specific giving rules. | stable |

## Design

| Page | Summary | Status |
| ---- | ------- | ------ |
| [design-system](design-system.md) | The Tailwind + Material-3 "Ecclesia Digitalis" system and how it re-skins per church. | living |

## Decisions & rationale

| Page | Summary | Status |
| ---- | ------- | ------ |
| [decisions](decisions.md) | Settled decisions (Decided) + open questions for the product owner. | living |
| [research-brief](research-brief.md) | The original six-stream research brief — retained verbatim as rationale. | archive |

## Related, outside the wiki

- **[docs/adr/](../adr/)** — Architecture Decision Records. [ADR-0001](../adr/0001-design-system-foundation.md) (the design brief, superseded) → [ADR-0002](../adr/0002-tailwind-material3-design-system.md) (Tailwind + M3, accepted).
- **[docs/todo/](../todo/README.md)** — active work items integrating the design system into `@churchix/ui` (15 atomic tasks).
- **[docs/design/](../design/)** — raw design source: `DESIGN.md` + the four Stitch reference screens.
- **[CLAUDE.md](../../CLAUDE.md)** — working brief for AI assistants and contributors.
