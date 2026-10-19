# Task 14 — Move the five sites' docs from Starlight to Docusaurus

## Context

On 2026-10-18 the owner decided to move every project's docs site from Astro
Starlight to Docusaurus. In this monorepo that means the five docs sites under
`sites/<site>/docs-site/` (`@sites/<site>-docs`, served at `/<site>/docs/`).
**The five marketing sites stay on Astro.** churchix has its own docs site and
its own brief (`churchix/corpus/briefs/todo/18-…`).

The recipe is written and verified. The `corpus-docs-site` skill
(personal-skills v0.31.0, source in
`~/projects/my-personal-skills/skills/corpus-docs-site/`) now scaffolds
Docusaurus 3.10, and `references/migrating-from-starlight.md` beside it holds
the file, config and content maps plus ten gotchas, each hit during a real
port. **Read that guide first.** The files this brief tells you to copy are in
the same folder. If the installed plugin is older than v0.31.0, read them from
the source path.

What the five have today (2026-10-18). All share one shape: one authored
`index.mdx` with a raw `<dl class="doc-facts">`, a `scripts/sync-corpus.mjs`
that renders **the site's own Markdown** (its `README.md`, `PRODUCT.md`,
`DESIGN.md`, and some `docs/*.md`) from a hand-kept `PAGES` list, an empty
archify setup, no TypeDoc, a `src/styles/theme.css` of 196–243 lines, and
`cookie` + `sharp` from the Starlight scaffold.

| Site | Base | Theme | Faces (`@fontsource`) | Pages synced | Sidebar links |
|---|---|---|---|---|---|
| saloon | `/saloon/docs/` | light only (overrides) | Fraunces, Manrope | 8 | 9 |
| auto-service | `/auto-service/docs/` | dark only (same palette both ways, toggle shown) | Archivo | 7 | 8 |
| subcort | `/subcort/docs/` | light only (overrides) | IBM Plex Sans | 3 | 4 |
| tractari | `/tractari/docs/` | dark only (same palette both ways, toggle shown) | Archivo, Big Shoulders Display | 3 | 4 |
| design-study | `/design-study/docs/` | dark only (same palette both ways, toggle shown) | Inter | 18 | 19 |

**Built through Docusaurus on 2026-10-18.** Each site's pages were rendered by
its current sync script (output directory and frontmatter key changed only) and
built with `markdown.format: 'detect'`. All five **failed on broken links**, and
each of those links is dead on the live site today. The sync scripts leave a
relative link that has no `../` and no `.md` untouched, so `src/content/images.ts`
on the README page resolves to `/<site>/docs/wiki/src/content/images.ts/`:
- saloon: 2, including `src/content/images.ts` and `src/styles/global.css`;
- auto-service: 2, including `src/content/site.local.example.ts`;
- subcort: 3, including `scripts/gen-og.mjs` and `src/lib/draft.ts`;
- tractari: 5, including `src/components/hero/HeroCanvas.tsx` and
  `src/content/site.ts`;
- design-study: 1, `docs/styles/`.

## What to do

Do the five in one pass. They are one pattern, and the root `package-lock.json`
changes once. For each `sites/<site>/docs-site/`:

1. **Baseline.** `npm run <site>:docs`, then save
   `(cd sites/<site>/docs-site/dist && find . -name index.html | sort) > /tmp/<site>-routes-before.txt`.
2. **Config.** Write `docusaurus.config.ts` from the skill's reference. Set
   baseUrl `process.env.DOCS_BASE ?? '/<site>/docs/'`, `trailingSlash: true`,
   `routeBasePath: '/'`, `markdown.format: 'detect'`, local search, and the
   GitHub navbar item. Set `colorMode` from the table: light only →
   `{ defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }`,
   dark only → `{ defaultMode: 'dark', disableSwitch: true, respectPrefersColorScheme: false }`.
   The dark sites lose their do-nothing toggle. Port the sidebar to
   `sidebars.ts`. Delete `astro.config.mjs`, `src/content.config.ts`, and the
   `Theme*.astro` overrides where they exist.
3. **package.json** per the guide: no `"type": "module"`, keep the
   `browserslist`, and add `start`/`docs` (`… && docusaurus build --out-dir dist`)
   and `typecheck`. Keep the `@fontsource` deps. Drop `astro`,
   `@astrojs/starlight`, `cookie` and `sharp`. Pin `react`/`react-dom` to the
   version the sites already use (19.2.8 today), so npm keeps one copy. Match
   the site's pinning style (exact where the site pins exactly).
4. **Content.** `src/content/docs/index.mdx` → `docs/index.mdx`, with
   `slug: /` and `hide_table_of_contents: true`. The `<dl class="doc-facts">`
   keeps working.
5. **Sync.** Keep each site's `PAGES` list and its slugs, which are the URLs.
   Port only the output: write to `docs/wiki/`, use the frontmatter key
   `toc_max_heading_level: 3`, and take the link handling from the skill's
   `references/sync-corpus.mjs`. That means resolving each relative link
   against the source file's directory inside the site:
   - a page in `PAGES` becomes a relative file link (`./design.md#…`);
   - anything else in the repo becomes
     `https://github.com/gandolh/presentation-sites/blob/main/sites/<site>/<path>`
     (`tree/` for a directory, `raw/` for an image);
   - fenced code is skipped, and link text that wraps across lines still
     counts as one link.
   This fixes the dead links listed above. `build-diagrams.mjs` writes to
   `static/diagrams/` (all five have no diagrams yet).
6. **Theme.** Port `theme.css` to `src/css/custom.css` with the guide's token
   and selector maps (the skill's `references/custom.css` header). Dark-only
   sites put their palette on `:root, :root[data-theme='dark'],
   :root[data-theme='light']`. Keep each site's comments on why it has one
   theme.
7. **Per-site `.gitignore`.** `.astro/` → `.docusaurus/`, and
   `src/content/docs/wiki/` → `docs/wiki/`.

Then, once for the repo:

8. **`sharp`.** `sites/subcort/scripts/gen-og.mjs` imports `sharp`, but no
   `package.json` above it declares it. Today it resolves through the
   docs-sites' copies (and Astro's). Declare `sharp` in
   `sites/subcort/package.json` at the version in the lockfile (0.35.4) before
   the docs-sites drop theirs.
9. **Keep the isolation from brief 02.** The root `<site>:docs` scripts select
   by package name and stay as they are. Each site's `tsconfig.json` keeps
   `"docs-site"` in `exclude`, which stops `astro check` from reading the
   docs-site's `.tsx` files.
10. **Mentions.** Update these to say Docusaurus and `docusaurus.config.ts`:
    - `README.md` line 48 ("a Starlight `docs-site/`");
    - `docs/adding-a-site.md` line 10 (copy `docs-site/`, set the base in
      `docusaurus.config.ts`);
    - `docs/getting-started.md` lines 69–77;
    - `docs/architecture.md` lines 8 and 19;
    - `corpus/wiki/architecture.md` (lines 16 and 149–157);
    - `corpus/wiki/overview.md` (line 15);
    - `corpus/wiki/status.md` (line 12);
    - the wording of `corpus/wiki/decisions.md` "Each site's docs site lives
      inside the site" (line 189). The decision stands; only the framework
      named in it changes.

## Files you OWN

- `sites/*/docs-site/` (all five, entirely)
- `sites/subcort/package.json` (the `sharp` line only)
- `package-lock.json`
- the mentions listed in step 10

## Files you must NOT touch

- The marketing sites' own code, config and `astro` dependency
  (`sites/<site>/src`, `astro.config.mjs`, `tsconfig.json`).
- The sites' `README.md`/`PRODUCT.md`/`DESIGN.md`/`docs/` link text. Fix the
  renderer.
- `churchix/` (its own brief), and vps-deploy. vps-deploy's brief 11 switches
  the five docs stacks' check from `_astro/` to `assets/`.
- Real business data (`src/content/site.local.ts`) and real photos, which are
  gitignored. Nothing in this brief reads them.

## Acceptance

- `npm run <site>:docs` exits 0 for all five, with `onBrokenLinks: 'throw'`.
- Route parity, per site: the new route list equals
  `/tmp/<site>-routes-before.txt` plus `./search/index.html`.
- `grep -c '/<site>/docs/assets/' sites/<site>/docs-site/dist/index.html` is
  non-zero for each, and `grep -rl '_astro' sites/*/docs-site/dist` finds
  nothing.
- `npm ls react` shows one React version across the workspace.
- `npm run subcort:og` still works.
- Every marketing site still builds: `npm run build`, and
  `npm run <site>:build` for each.
- Browser check, with each `dist/` served at its base by a plain static server
  (not `docusaurus serve`):
  - each landing page and one synced page render in the site's look;
  - saloon and subcort are light with no toggle, and the other three are dark
    with no toggle;
  - the faces load with no 404s;
  - a link to a source file opens it on GitHub.
  Screenshot each landing page.
- `bash corpus/lint.sh` passes.

## Out of scope

- Deploying. The owner deploys after vps-deploy brief 11 flips the five docs
  stacks.
- Moving any marketing site off Astro.

## Outcome (2026-10-19)

Done, one commit per site: saloon `22194b7` (with the lockfile and subcort's `sharp` 0.35.4 line), auto-service `aa1dbc3`, subcort `fe3639c`, tractari `17abb94`, design-study `f17663d`, and the mentions in `9dfb1aa`. Docusaurus 3.10.2, with React pinned at 19.2.8 (exact in the four sites that pin exactly, `^` in saloon). Checks: `npm run <site>:docs` exits 0 for all five with `onBrokenLinks: 'throw'` and no sync warnings. Each route list equals `/tmp/<site>-routes-before.txt` plus `./search/index.html` (9, 8, 4, 4 and 19 pages). `<base>assets/` is in each `index.html`, and `grep -rl _astro sites/*/docs-site/dist` finds nothing. `npm ls react` shows only 19.2.8. `npm run typecheck` is clean in each docs package, `npx astro check` has 0 errors in each site, and `npm run build` and the five `<site>:build` pass. `npm run subcort:og` still writes a byte-identical card. In the browser, each `dist/` was served at its base by `python3 -m http.server`: each landing page and one synced page render in the site's faces and colours, saloon and subcort are light and the other three dark, none shows a toggle, the faces load with no 404s, a search on saloon returns results, and the README's `HeroCanvas.tsx` link opens the file on GitHub in a new tab. Every rewritten GitHub link that was checked answers 200.

Three things the guide did not cover, each hit here:
- Docusaurus serves a file named `readme.md` at its folder's URL (`/wiki/`), so the sync writes `slug:` on every page to keep `/wiki/readme/`.
- In a `.md` page (CommonMark under `format: 'detect'`) the `:::note[Title]` form is not rendered: the title comes out as an unknown `<mdxadmonitiontitle>` element. The banner's title is the note's first line instead. The skill's `references/sync-corpus.mjs` has the same banner.
- `@docusaurus/tsconfig` sets `baseUrl`, which TypeScript 6.0.3 rejects (TS5101), so each docs `tsconfig.json` sets `"ignoreDeprecations": "6.0"`. And the Prism theme paints a code block's background inline, so each `custom.css` overrides it with `!important`.

Also changed: `build-diagrams.mjs` no longer fails when `diagrams/` is missing (git keeps no empty folder, so a fresh clone has none). `url` stays the production origin, as `site` was in the Starlight configs and is in each site's `astro.config.mjs`, so the sitemap keeps absolute URLs. The screenshots are not in the repo. Not done here: the deploy, which waits on vps-deploy brief 11 switching the five docs stacks' asset check to `assets/`.
