---
summary: What presentation-sites is — a monorepo of independent Romanian marketing sites, who each one is for, and what lives at the top level.
updated: 2026-10-01
---

# Overview

`presentation-sites` is a **monorepo of presentation/marketing websites**, one
npm workspace per site under `sites/`. The root hoists every dependency into one
`node_modules` with one lockfile, and the sites share exactly one package,
`@sites/kit` (`packages/site-kit/`) — sub-path URLs, the mock/real image
pipeline and one type; nothing else crosses between them (see
[decisions.md](decisions.md)). The root carries passthrough npm scripts, shared
editor config and this corpus. Each site also has its own **documentation site**
— a Starlight project at `sites/<site>/docs-site/`, built with
`npm run <site>:docs` (see [architecture.md](architecture.md#docs-sites)).

Most sites are Romanian-language, for businesses in **Târgu-Jiu / Gorj / Oltenia**.

## The cast

| Site | What it is | Sub-path |
|---|---|---|
| [`saloon/`](../../sites/saloon/) | **Ana Saloon** — boutique nail salon, Târgu-Jiu. The most complete site; also carries `marketing/bots/`, an automation service. | `/saloon` |
| [`auto-service/`](../../sites/auto-service/) | **BavAuto Gorj** — independent BMW-specialist auto service, Târgu-Jiu. | `/auto-service` |
| [`subcort/`](../../sites/subcort/) | **Subcort** — demo event-tent rental site for Gorj/Oltenia. | `/subcort` |
| [`tractari/`](../../sites/tractari/) | **AXA Tractări** — demo car-towing site. Minimalist, with a Three.js night-road hero. | `/tractari` |
| [`design-study/`](../../sites/design-study/) | **Fourteen Renderings** — not a marketing site but a UI/UX study: one fictional blog rendered in 14 design languages, content held constant. `noindex` by decision. | `/design-study` |
| [`churchix/`](../../churchix/) | **Churchix** — a white-label *platform* for Orthodox church sites + giving. Its own npm-workspaces monorepo; the odd one out. | per-church |

`churchix/` is structurally different from the rest: it is a product with shared
`@churchix/*` packages and one independent Astro app per church, not a single
site. It keeps its own [`CLAUDE.md`](../../churchix/CLAUDE.md) and its own docs
under [`churchix/docs/`](../../churchix/docs/).

A `showcase/` gallery site used to live here and was moved out of the repo
(commit `93eba5d`, 2026-07-17). Nothing in this repo should reference it.

## Where to go next

- How it's put together → [architecture.md](architecture.md)
- Locked choices you shouldn't relitigate → [decisions.md](decisions.md)
- Current state of each site → [status.md](status.md)
