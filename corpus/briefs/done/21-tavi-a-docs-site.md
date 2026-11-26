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

## Outcome (2026-11-25)

- **`sites/tavi/docs-site/`** follows `docs/adding-a-site.md` step 6: package `@sites/tavi-docs`, base `/tavi/docs/`
  (`DOCS_BASE` overrides), root script `tavi:docs`, light only on the site's paper with Newsreader and IBM Plex Mono.
  `tsconfig.json` already excluded `docs-site`. `package-lock.json` gained the two workspace entries by hand, because
  this container's npm strips the `libc` fields from every other entry.
- **Pages.** Rendered from the site's own files: README, PRODUCT, DESIGN. Written for the docs, from the code: the part
  table and its two renderers, the chapter engine and the islands, the 3D island and its five-rung ladder, the copy
  rule. The landing page is `docs/index.mdx`.
- **Differences from saloon's docs site.** No diagrams script (nothing to draw). `sync-corpus.mjs` copies the README's
  social card into the docs and turns a link to any other repo file into its label, so no page names the host or
  account (the others link to GitHub, and set `url` to the real origin; tavi's `url` is `https://example.com`, the
  site's own fallback, since it is only used for the sitemap). The navbar has no GitHub link.
- **Checked.** `npm run tavi:docs` exits 0 with `onBrokenLinks: 'throw'`. Served from a folder mapped to `/tavi/docs/`
  and walked in Chromium: 8 pages, every internal link resolves, no 4xx, every asset under `/tavi/docs/`, no external
  link. `docusaurus serve` itself 302s font files when `trailingSlash` is on; the files are in `dist/`. No domain,
  machine path or account name in the new files.
- The README's last section and `docs/README.md`'s row now point at the docs site; `docs/adding-a-site.md` says tavi's
  "did" follow the site. Brief 14 (chapter 2) was left in `todo/`.
- Not run: sloplint (the hallmark script is not in this container), left to the owner. The board was not updated:
  brief-board was not available in this session.
- **Owner steps.** Once the controller's vps-deploy brief adds `DocsStack(estate, "tavi", ...)`:
  `node cli.ts tavi-docs deploy`.
