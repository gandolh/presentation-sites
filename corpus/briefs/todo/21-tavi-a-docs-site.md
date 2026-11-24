# Task 21: tavi, a docs site

**Depends on:** 20 (the README, PRODUCT.md and DESIGN.md as shipped). The last of the tavi briefs.

**Builder:** Sonnet ([routing.md](../../routing.md)): the same docs site the other four sites have.

**Owner step at the end.** A `tavi-docs` stack in vps-deploy (the controller files that brief when this one is
done), then the deploy.

## Context

The planner left the docs site out of v1; the owner asked for one on 2026-11-24, "later", after the site is built
([decisions-tavi.md](../../wiki/decisions-tavi.md), Where it lives). The other sites' docs sites follow
`docs/adding-a-site.md` step 6: a Docusaurus site under `sites/<name>/docs-site/`, base `/<name>/docs/`. For tavi it
renders what a reader of the code needs: what the site is, the part table and the two renderers, the chapter engine
and its islands, the fallback ladder, the copy rule (invented people, real watches), and the design record.

## Files you OWN

- `sites/tavi/docs-site/` (new), its package and its entry in the root workspaces and scripts
- The site's `README.md` docs link; `corpus/wiki/status.md`'s tavi line; `corpus/log.md`; the outcome

## Files you must NOT touch

- `sites/tavi/src/` (the site itself), the other sites' docs sites, vps-deploy.

## Steps

1. Follow `docs/adding-a-site.md` step 6 for `tavi`: copy saloon's docs site, rename the package, set the base to
   `/tavi/docs/`, wire the root scripts.
2. Pages, in English, from what shipped (never from the plan): overview, the part table and renderers, the chapter
   engine, the 3D island and its fallback ladder, the copy rule, the design (link `design/tavi/` and DESIGN.md).
3. Build it; check the links and that every asset URL starts with `/tavi/docs/`.

## Acceptance

- [ ] `npm run build` of the docs site exits 0; no broken link; every asset under `/tavi/docs/`.
- [ ] No domain, machine path or account name in the new files.
- [ ] `npm run check` exits 0; `bash corpus/lint.sh` passes.

## Owner steps

- After the controller's vps-deploy brief adds `DocsStack(estate, "tavi", …)`: `node cli.ts tavi-docs deploy`.

## Owner decisions

- 2026-11-24 (owner): a docs site, later, after the site is built.
