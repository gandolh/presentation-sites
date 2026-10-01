---
summary: Dated snapshot of where each site stands and what this root corpus does versus the per-site docs. The living dashboard — start here after a break.
updated: 2026-10-01
---

# Status — 2026-10-01

## Where things stand

All six projects build — the five sites under `sites/` and churchix. Since the
2026-08-23 snapshot, `design-study` joined the workspace and **every site gained a
Starlight docs site** at `sites/<site>/docs-site/` (`eda07a0`), built with
`npm run <site>:docs` and deployed at `https://gandolh.ro/<site>/docs/` — see
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
| `saloon` | Code-complete and through a design + accessibility pass (2026-08-23). Blocked on real data + human actions (accounts, credentials). The `marketing/bots/` service runs fully in mock mode; live wiring pending. | [`sites/saloon/docs/STATUS.md`](../../sites/saloon/docs/STATUS.md), [`docs/todo/ROADMAP.md`](../../sites/saloon/docs/todo/ROADMAP.md), [`docs/ADR.md`](../../sites/saloon/docs/ADR.md) |
| `auto-service` | Code-complete, reworked 2026-08-23 into the *Bordcomputer* world (the page as the car's instrument cluster). Full page set, legal pages, JSON-LD, consent-gated map, verified sub-path build. **No photography by decision** — the workshop is drawn and the gallery was removed. | [`sites/auto-service/docs/STATUS.md`](../../sites/auto-service/docs/STATUS.md) |
| `subcort` | Demo, complete. Reworked twice on 2026-08-23: first onto a *scoarța* (Oltenian rug) system, then — the owner found that too traditional — onto **Montaj**, the site as a drawing set. One marquee model in `src/lib/draft.ts` drives every graphic (WebGL hero, exploded plate, scale plan, OG card); ink for the object, one orange for annotation; no photography. | [`subcort/PRODUCT.md`](../../sites/subcort/PRODUCT.md), [`DESIGN.md`](../../sites/subcort/DESIGN.md) |
| `tractari` | Demo, complete. Three.js night-road hero. | [`tractari/PRODUCT.md`](../../sites/tractari/PRODUCT.md), [`DESIGN.md`](../../sites/tractari/DESIGN.md) |
| `design-study` | **New, 2026-08-23.** Not a marketing site — a UI/UX study. One fictional blog (*Ratio*, 12 posts, 18 shared placeholders) rendered in 14 design languages, content held constant so only design varies. 183 static pages; each theme owns its markup, layout and CSS, and loads only its own fonts. No Tailwind. The written half is 14 per-style dossiers carrying image-treatment recipes and prompt descriptors — see [`design-styles.md`](design-styles.md). | [`design-study/PRODUCT.md`](../../sites/design-study/PRODUCT.md), [`DESIGN.md`](../../sites/design-study/DESIGN.md) |
| `churchix` | Active product. One church app scaffolded (`apps/parohia-harlesti-bacau`); shared packages + docs corpus in progress. | [`churchix/CLAUDE.md`](../../churchix/CLAUDE.md), [`churchix/docs/wiki/index.md`](../../churchix/docs/wiki/index.md) |

## Briefs

Eleven open, from the 2026-09-27 improvements audit (ranked; see
[`log.md`](../log.md)). New work: capture in [`todos/`](../todos/), promote to
[`briefs/todo/`](../briefs/todo/).

**Now**
- [01](../briefs/done/01-astro-security-advisories.md) — clear the Astro RCE advisory + js-yaml/svgo in both lockfiles
- [02](../briefs/done/02-isolate-nested-docs-sites.md) — root `<site>:*` scripts exit 1 since the docs-sites; `astro check` scans them
- [03](../briefs/todo/03-tractari-hero-offscreen-pause.md) — tractari WebGL hero never pauses off-screen
- [04](../briefs/todo/04-opening-hours-single-source.md) — opening hours retyped outside `site.ts` (saloon, auto-service)
- [05](../briefs/todo/05-mobile-menu-focus-return.md) — mobile menus drop focus on close (saloon, auto-service, tractari)
- [06](../briefs/todo/06-design-study-arrow-keys.md) — design-study arrow keys on a carousel jump to another theme
- [07](../briefs/done/07-remove-dead-vite-overrides.md) — dead per-site `vite` overrides (break a lifted-out site)
- [08](../briefs/done/08-corpus-readme-docs-drift.md) — corpus + README silent on docs-sites and design-study (after 02)

**Next**
- [09](../briefs/todo/09-absolute-head-urls.md) — relative `og:image`, wrong canonicals — needs an origin decision first
- [10](../briefs/todo/10-raster-social-cards.md) — PNG social cards for saloon, subcort, tractari (after 09)
- [11](../briefs/todo/11-bots-webhook-body-cap.md) — bots webhook buffers unbounded bodies — before live wiring

## Note on the two doc layers

Every project now uses one shape: `README.md` + `PRODUCT.md` + `DESIGN.md` at its
root, everything else under `docs/`. This corpus owns the *monorepo* layer and
links down; it does not duplicate per-site content. See
[decisions.md](decisions.md) for why `corpus` names only this workspace.
