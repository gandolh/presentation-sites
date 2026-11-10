---
summary: Dated snapshot (2026-11-02) of where each site stands, the recent work per area, what waits on a deploy, and what this root corpus does versus the per-site docs. The living dashboard — start here after a break.
updated: 2026-11-09
---

# Status — 2026-11-02

## Where things stand

All six projects build — the five sites under `sites/` and churchix. Since the
2026-08-23 snapshot, `design-study` joined the workspace and **every site gained a
docs site** at `sites/<site>/docs-site/` (`eda07a0`; Starlight, on Docusaurus since 2026-10-19), built with
`npm run <site>:docs` and deployed at `/<site>/docs/` — see
[architecture.md](architecture.md#docs-sites). The repo is in a **maintenance + demo** phase rather than
active feature work: the two real client sites (`saloon`, `auto-service`) are
code-complete and waiting on human/real-data steps, the two demos (`subcort`,
`tractari`) are finished showpieces, and `churchix` is the only one with an open
product roadmap.

This root corpus was bootstrapped on **2026-08-23** when the repo was adapted to
`my-personal-skills` v0.29.0. It is deliberately **thin**: it covers the monorepo
itself — layout, cross-site conventions, decisions. Per-site detail stays in the
per-site docs and is *not* duplicated here.

## Per-site

| Site | State | Its own docs |
|---|---|---|
| `saloon` | Code-complete and through a design + accessibility pass (2026-08-23). Blocked on real data + human actions (accounts, credentials). The `marketing/bots/` service runs fully in mock mode; live wiring pending. | [`sites/saloon/docs/STATUS.md`](../../sites/saloon/docs/STATUS.md), [`docs/ADR.md`](../../sites/saloon/docs/ADR.md) |
| `auto-service` | Code-complete, reworked 2026-08-23 into the *Bordcomputer* world (the page as the car's instrument cluster). Full page set, legal pages, JSON-LD, consent-gated map, verified sub-path build. **No photography by decision** — the workshop is drawn and the gallery was removed. | [`sites/auto-service/docs/STATUS.md`](../../sites/auto-service/docs/STATUS.md) |
| `subcort` | Demo, complete. Reworked twice on 2026-08-23: first onto a *scoarța* (Oltenian rug) system, then — the owner found that too traditional — onto **Montaj**, the site as a drawing set. One marquee model in `src/lib/draft.ts` drives every graphic (WebGL hero, exploded plate, scale plan, OG card); ink for the object, one orange for annotation; no photography. | [`subcort/PRODUCT.md`](../../sites/subcort/PRODUCT.md), [`DESIGN.md`](../../sites/subcort/DESIGN.md) |
| `tractari` | Demo, complete. Three.js night-road hero. | [`tractari/PRODUCT.md`](../../sites/tractari/PRODUCT.md), [`DESIGN.md`](../../sites/tractari/DESIGN.md) |
| `design-study` | **New, 2026-08-23.** Not a marketing site — a UI/UX study. One fictional blog (*Ratio*, 12 posts, 18 shared placeholders) rendered in 14 design languages, content held constant so only design varies. 183 static pages; each theme owns its markup, layout and CSS, and loads only its own fonts. No Tailwind. The written half is 14 per-style dossiers carrying image-treatment recipes and prompt descriptors — see [`design-styles.md`](design-styles.md). | [`design-study/PRODUCT.md`](../../sites/design-study/PRODUCT.md), [`DESIGN.md`](../../sites/design-study/DESIGN.md) |
| `churchix` | Active product. One church app (`apps/parohia-harlesti-bacau`) on the shared packages. Runs its own corpus since 2026-10-07. Docs site on Docusaurus 2026-10-21, phone menu on Base UI 2026-10-23; open: the brand seeds lose to the token defaults in built pages. | [`churchix/CLAUDE.md`](../../churchix/CLAUDE.md), [`churchix/corpus/index.md`](../../churchix/corpus/index.md), [`churchix/corpus/wiki/status.md`](../../churchix/corpus/wiki/status.md) |

## Recent work, by area

- **Security and workspace** (2026-10-01). Astro's RCE advisory and the
  js-yaml/svgo findings cleared at the root and in churchix; root scripts pick
  sites by package name so the nested docs-sites stop matching; dead per-site
  Vite overrides gone ([site-patterns.md](site-patterns.md)).
- **Head URLs and social cards** (2026-10-02). Canonicals, `og:*` and JSON-LD
  are absolute at the production origin plus `/<site>/`; saloon, subcort and
  tractari got PNG cards ([decisions.md](decisions.md),
  [site-patterns.md](site-patterns.md)).
- **Site fixes** (2026-10-01). tractari's hero pauses off-screen, opening
  hours come from one `HOURS` list, design-study's arrow keys stay on a
  focused carousel, and the saloon bots webhook caps bodies at 1 MiB.
- **Docs sites** (2026-10-19). All five on Docusaurus, links to source files
  going to GitHub ([architecture.md](architecture.md#docs-sites)).
- **Copy** (2026-10-19). tractari's hero lede no longer runs "sau" into the
  last county; the saloon and auto-service terms pages had the same wrap.
- **Phone menus** (2026-10-23). The four sites' menus on Base UI `Dialog`,
  about +20 kB gzip a site ([decisions-ui.md](decisions-ui.md)).
- **churchix** got a corpus of its own on 2026-10-07.

Not known to be deployed yet: the copy fix
(tractari, saloon, auto-service), the five Docusaurus docs sites (vps-deploy
flipped their asset checks on 2026-10-19) and the phone menus. Brief 01,
[Hallmark against taste-skill on one site](../briefs/superseded/01-hallmark-against-taste-skill-on-one-site.md),
was filed on 2026-11-09 and waits on the owner's grilling of 2026-11-10; brief
numbering restarted at 01 on 2026-11-02 (see
[log.md](../log.md)). New work: capture in [`todos/`](../todos/), promote to
[`briefs/todo/`](../briefs/todo/).

## Note on the two doc layers

Every project now uses one shape: `README.md` + `PRODUCT.md` + `DESIGN.md` at its
root, everything else under `docs/`. This corpus owns the *monorepo* layer and
links down; it does not duplicate per-site content. See
[decisions.md](decisions.md) for why `corpus` names only this workspace.
