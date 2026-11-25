# Adding a new site

These steps moved here from the old root README. `sites/saloon/` is the model to copy.

1. Create `sites/<name>/` with its own `package.json`, mirroring [`sites/saloon/`](../sites/saloon/). Depend on `"@sites/kit": "*"` and add `ssr: { noExternal: ["@sites/kit"] }` to the `vite` block in its `astro.config.mjs`.
2. Run `npm install` at the root. The `sites/*` glob picks the new site up.
3. Add `<name>:*` passthrough scripts to the root `package.json`, following the `saloon:*` pattern. Select the workspace by its package name, as in `npm run <script> -w <package-name>`, never by path, because a path also selects the site's nested docs site.
4. Add a `<name>: dev server` entry to `.vscode/launch.json` that runs `npm run <name>:dev` from `${workspaceFolder}`.
5. Give it the doc shape from [architecture.md](architecture.md#where-each-kind-of-doc-lives): `README.md`, `PRODUCT.md`, `DESIGN.md`, and a `docs/` folder if it needs one.
6. Give it a docs site (it can follow the site, as tavi's did; until then its README, PRODUCT.md and DESIGN.md are its docs and the row in docs/README.md says "none yet"): copy `sites/saloon/docs-site/` to `sites/<name>/docs-site/`, rename the package to `@sites/<name>-docs`, set the base in its `docusaurus.config.ts` to `/<name>/docs/`, list the site's own pages in the `PAGES` array of `scripts/sync-corpus.mjs` and in `sidebars.ts`, pick its theme mode in `docusaurus.config.ts` and its tokens in `src/css/custom.css`, add `"docs-site"` to the site's `tsconfig.json` `exclude`, and add a root `"<name>:docs"` script.
7. Put it under the checks. Add `-w <package-name>` to the root `typecheck` script and its folder to the `workspaces` map in `scripts/check-fast.mjs`. For a business site, also add `sites/<name>/src` to the `web` lists in `eslint.config.mjs` and `scripts/conventions.json` and to the dependency-cruiser paths in the `check:conventions` script, and give it an entry with a free port in the `sites` list of `e2e/playwright.config.ts` and its phone menu's shape in the `menus` map of `e2e/mobile-menu.spec.ts`: the island's file name, the menu button's accessible name ("Deschide meniul" on the Romanian sites, "Chapters" on tavi), the panel's title, its X's name, and whether a tap outside the panel can close it. A study like design-study is typechecked only; [decisions-house-style.md](../corpus/wiki/decisions-house-style.md) says what stays outside. Run `npm run check`.
8. List it in the site table in [docs/README.md](README.md), and add its first screen to the table at the top of the [main README](../README.md) once it is live. [images/shots.md](images/shots.md) says how the others were taken.

The root `.gitignore` needs no edit. Its rules for `site.local.ts` and `public/images/real/` are `**/` patterns that cover any site.

Deploy is a separate step in the deploy repo: the site needs a stack there before it appears at `/<name>/`.
