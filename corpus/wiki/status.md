---
summary: Dated snapshot of where each site stands and what this root corpus does versus the per-site docs. The living dashboard — start here after a break.
updated: 2026-08-23
---

# Status — 2026-08-23

## Where things stand

All five projects build. The repo is in a **maintenance + demo** phase rather than
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

No open briefs. New work: capture in [`todos/`](../todos/), promote to
[`briefs/todo/`](../briefs/todo/).

## Note on the two doc layers

Every project now uses one shape: `README.md` + `PRODUCT.md` + `DESIGN.md` at its
root, everything else under `docs/`. This corpus owns the *monorepo* layer and
links down; it does not duplicate per-site content. See
[decisions.md](decisions.md) for why `corpus` names only this workspace.
