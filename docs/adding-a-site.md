# Adding a new site

These steps moved here from the old root README. `sites/saloon/` is the model to copy.

1. Create `sites/<name>/` with its own `package.json`, mirroring [`sites/saloon/`](../sites/saloon/). Depend on `"@sites/kit": "*"` and add `ssr: { noExternal: ["@sites/kit"] }` to the `vite` block in its `astro.config.mjs`.
2. Run `npm install` at the root. The `sites/*` glob picks the new site up.
3. Add `<name>:*` passthrough scripts to the root `package.json`, following the `saloon:*` pattern. Select the workspace by its package name, as in `npm run <script> -w <package-name>`, never by path, because a path also selects the site's nested docs site.
4. Add a `<name>: dev server` entry to `.vscode/launch.json` that runs `npm run <name>:dev` from `${workspaceFolder}`.
5. Give it the doc shape from [architecture.md](architecture.md#where-each-kind-of-doc-lives): `README.md`, `PRODUCT.md`, `DESIGN.md`, and a `docs/` folder if it needs one.
6. Give it a docs site: copy `sites/saloon/docs-site/` to `sites/<name>/docs-site/`, rename the package to `@sites/<name>-docs`, set the base in its `astro.config.mjs` to `/<name>/docs/`, list the site's own pages in the `PAGES` array of `scripts/sync-corpus.mjs`, add `"docs-site"` to the site's `tsconfig.json` `exclude`, and add a root `"<name>:docs"` script.
7. List it in the site table in [docs/README.md](README.md), and add its first screen to the table at the top of the [main README](../README.md) once it is live. [images/shots.md](images/shots.md) says how the others were taken.

The root `.gitignore` needs no edit. Its rules for `site.local.ts` and `public/images/real/` are `**/` patterns that cover any site.

Deploy is a separate step in the deploy repo: the site needs a stack there before it appears at `https://gandolh.ro/<name>/`.
