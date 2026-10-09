# presentation-sites docs

Start with the [main README](../README.md). This folder holds what it links to.

| File | What it covers |
|---|---|
| [getting-started.md](getting-started.md) | Install, run one site, real vs placeholder photos, builds, docs sites, churchix |
| [architecture.md](architecture.md) | How the workspaces fit together, what `@sites/kit` shares, where each kind of doc lives |
| [adding-a-site.md](adding-a-site.md) | The steps for adding a new site to the workspace |
| [images/](images/shots.md) | The screenshots in the README, and how each was made |

## The sites

Each project keeps its own README, PRODUCT.md and DESIGN.md at its root and its other notes in its own `docs/`. Its docs site renders those files.

| Site | What it is | Live | Docs site | Source |
|---|---|---|---|---|
| saloon | Ana Saloon, a nail salon in Târgu-Jiu. Client site; also holds `marketing/bots/`, an automation service | [gandolh.ro/saloon](https://gandolh.ro/saloon/) | [/saloon/docs](https://gandolh.ro/saloon/docs/) | [README](../sites/saloon/README.md), [STATUS](../sites/saloon/docs/STATUS.md) |
| auto-service | BavAuto Gorj, a BMW repair garage in Târgu-Jiu. Client site | [gandolh.ro/auto-service](https://gandolh.ro/auto-service/) | [/auto-service/docs](https://gandolh.ro/auto-service/docs/) | [README](../sites/auto-service/README.md), [STATUS](../sites/auto-service/docs/STATUS.md) |
| tractari | AXA Tractări, a car-towing firm in Oltenia. Demo with a made-up firm | [gandolh.ro/tractari](https://gandolh.ro/tractari/) | [/tractari/docs](https://gandolh.ro/tractari/docs/) | [README](../sites/tractari/README.md) |
| subcort | Subcort, event tent rental in Gorj. Demo with a made-up firm | [gandolh.ro/subcort](https://gandolh.ro/subcort/) | [/subcort/docs](https://gandolh.ro/subcort/docs/) | [README](../sites/subcort/README.md) |
| design-study | Fourteen Renderings, one made-up blog drawn in 14 design styles. A UI study, not a marketing site | [gandolh.ro/design-study](https://gandolh.ro/design-study/) | [/design-study/docs](https://gandolh.ro/design-study/docs/) | [README](../sites/design-study/README.md), [style dossiers](../sites/design-study/docs/styles/README.md) |
| churchix | Churchix, a white-label platform for Orthodox parish sites, with one parish app so far | [gandolh.ro/churchix](https://gandolh.ro/churchix/) | [/churchix/docs](https://gandolh.ro/churchix/docs/) | [README](../churchix/README.md), [wiki](../churchix/corpus/index.md) |

Going deeper: the [project wiki](../corpus/index.md) covers the monorepo itself: its layout, the decisions behind it and the current status of each site.
