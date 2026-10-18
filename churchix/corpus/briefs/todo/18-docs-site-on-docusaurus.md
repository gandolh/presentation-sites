# 18 — Move the docs site from Starlight to Docusaurus

## Context

On 2026-10-18 the owner decided to move every project's docs site from Astro
Starlight to Docusaurus. This brief covers `docs-site/` (`@churchix/docs-site`,
served at `/churchix/docs/`): it should build with Docusaurus, publish the same
URLs from the same `dist/`, and look the same. The church sites stay Astro,
which is a locked decision in `../CLAUDE.md`; only the docs site changes. The
five other sites in this monorepo have their own brief, task 14 in the
presentation-sites corpus (`corpus/briefs/todo/14-…` at the monorepo root).

The recipe is written and verified. The `corpus-docs-site` skill
(personal-skills v0.31.0, source in
`~/projects/my-personal-skills/skills/corpus-docs-site/`) now scaffolds
Docusaurus 3.10, and `references/migrating-from-starlight.md` beside it holds
the file, config and content maps plus ten gotchas, each hit during a real
port. **Read that guide first.** If the installed plugin is older than v0.31.0,
read the files from the source path.

What the site has today (2026-10-18):
- base `/churchix/docs/` (`DOCS_BASE ??`), light only (both `Theme*.astro`
  overrides; "a dark parish site is not a thing"), 13 sidebar links;
- one authored page, `src/content/docs/index.mdx` (a raw `<dl class="doc-facts">`);
- `src/styles/theme.css` (234 lines, 38 `--sl-*` tokens; Cardo and Source
  Serif 4 via `@fontsource`);
- `scripts/sync-corpus.mjs` with its own 12-entry `PAGES` list:
  `corpus/index.md` as `index-wiki`, eight `corpus/wiki/` pages,
  `corpus/CLAUDE.md` as `schema`, `corpus/log.md`, and the two ADRs in
  `docs/adr/`. It has a `MOVED` table for the ADRs' pre-2026-10-07 paths and a
  GitHub base under `presentation-sites/…/churchix`;
- `scripts/build-diagrams.mjs`, no diagrams yet;
- deps `sharp` and `cookie`, from the Starlight scaffold.

**Built through Docusaurus on 2026-10-18.** The 12 pages, rendered by this
site's own sync script with only the output directory and frontmatter key
changed, built with `markdown.format: 'detect'` and no broken links or anchors.
This script already sends unrendered paths to GitHub, so it does not have the
dead-link problem the five other sites have.

## Files you OWN

- `docs-site/` (all of it, including its `.gitignore`)
- `package-lock.json` (churchix's own)
- `corpus/routing.md` (line 52: `astro.config.mjs`, `src/content/docs/wiki/`)
  and `corpus/index.md` (line 52, "the Starlight site")

## Files you must NOT touch

- `apps/`, `packages/`, `services/`. The church apps, `@churchix/ui` and
  `@churchix/schemas` keep Astro and their content collections. The docs site
  moving to React does not make the sites React apps.
- `docs/adr/`. The ADRs are frozen records; their old links are handled by
  `MOVED`, not by editing them.
- vps-deploy. Its brief 11 switches the `churchix` docs stack's check from
  `_astro/` to `assets/`.

## What to do

1. **Baseline.** `npm run docs -w docs-site` (from `churchix/`), then save
   `(cd docs-site/dist && find . -name index.html | sort) > /tmp/churchix-routes-before.txt`.
2. **Config.** Write `docs-site/docusaurus.config.ts` from the skill's
   reference. Set baseUrl `process.env.DOCS_BASE ?? '/churchix/docs/'`,
   `trailingSlash: true`, `routeBasePath: '/'`, `markdown.format: 'detect'`,
   light-only `colorMode`, local search, and the GitHub navbar item. Port the
   13-link sidebar to `sidebars.ts`. Delete `astro.config.mjs`,
   `src/content.config.ts` and both `Theme*.astro`.
3. **package.json** per the guide: no `"type": "module"`, keep the
   `browserslist`, and add `start`/`docs`/`typecheck`. Keep the two
   `@fontsource` deps. Drop `astro`, `@astrojs/starlight`, `cookie` and
   `sharp`. **One React:** pin `react`/`react-dom` to the version the church
   app uses (19.2.8 today). `@churchix/ui` takes React as a peer and must never
   see two copies.
4. **Content.** `src/content/docs/index.mdx` → `docs/index.mdx` with
   `slug: /` and `hide_table_of_contents: true`.
5. **Sync.** Keep this script's `PAGES`, `MOVED` and GitHub base; they are
   right, and `corpus/CLAUDE.md`'s note that the script lists pages by path
   stays true. Change only the output: write to `docs/wiki/`, and use the
   frontmatter key `toc_max_heading_level: 3` instead of `tableOfContents`.
   Its links to rendered pages may stay `/wiki/<slug>/`, since Docusaurus adds
   the base. Relative file links are better, because the build then checks
   them; switch to them if it is a small change. `build-diagrams.mjs` writes to
   `static/diagrams/`.
6. **Theme.** Port `theme.css` to `src/css/custom.css` with the guide's token
   and selector maps (the skill's `references/custom.css` header). Keep the
   light-only comment and the parish palette, whose names stay and whose values
   a church swaps.
7. **Wiring.** `docs-site/.gitignore`: `.astro/` → `.docusaurus/`,
   `src/content/docs/wiki/` → `docs/wiki/`, and move the archify note to
   `static/diagrams/`. Update the two corpus mentions listed under Files you
   OWN.

## Acceptance

- `npm run docs -w docs-site` exits 0 with `onBrokenLinks: 'throw'`.
- Route parity: the new route list equals
  `/tmp/churchix-routes-before.txt` plus `./search/index.html`.
- `grep -c '/churchix/docs/assets/' docs-site/dist/index.html` is non-zero, and
  `grep -rl '_astro' docs-site/dist` finds nothing.
- `npm ls react` (in `churchix/`) shows one version.
- `npm run build --workspaces --if-present` and
  `npm run typecheck --workspaces --if-present` pass.
- Browser check, with `docs-site/dist` served at `/churchix/docs/` by a plain
  static server (not `docusaurus serve`):
  - the landing page and `/wiki/design-system/` render in the parish palette;
  - Cardo and Source Serif load with no 404s;
  - there is no theme toggle;
  - the ADR pages' links go where `MOVED` sends them;
  - search returns results.
  Screenshot the landing page.
- `bash corpus/lint.sh` passes.

## Out of scope

Deploying. The owner deploys after vps-deploy brief 11 flips the `churchix`
docs stack.
