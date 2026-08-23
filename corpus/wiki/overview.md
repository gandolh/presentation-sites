---
summary: What presentation-sites is — a monorepo of independent Romanian marketing sites, who each one is for, and what lives at the top level.
updated: 2026-08-23
---

# Overview

`presentation-sites` is a **monorepo of presentation/marketing websites**, each a
self-contained project in its own top-level directory. There is no dependency
hoisting, no shared runtime, and no cross-site imports — the repo is a container,
not a framework. The root only carries passthrough npm scripts, shared editor
config, and this corpus.

Most sites are Romanian-language, for businesses in **Târgu-Jiu / Gorj / Oltenia**.

## The cast

| Site | What it is | Sub-path |
|---|---|---|
| [`saloon/`](../../saloon/) | **Ana Saloon** — boutique nail salon, Târgu-Jiu. The most complete site; also carries `marketing/bots/`, an automation service. | `/saloon` |
| [`auto-service/`](../../auto-service/) | **BavAuto Gorj** — independent BMW-specialist auto service, Târgu-Jiu. | `/auto-service` |
| [`subcort/`](../../subcort/) | **Subcort** — demo event-tent rental site for Gorj/Oltenia. | `/subcort` |
| [`tractari/`](../../tractari/) | **AXA Tractări** — demo car-towing site. Minimalist, with a Three.js night-road hero. | `/tractari` |
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
