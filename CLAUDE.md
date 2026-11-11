# presentation-sites

Romanian marketing sites on Astro, one npm workspace each: four live sites
(saloon, auto-service, subcort, tractari) and a design study under `sites/`,
with shared helpers in `packages/site-kit`. Read [corpus/index.md](corpus/index.md)
first.

## Commands

- `npm run <site>:dev`: the site's dev server (`saloon`, `auto-service`,
  `subcort`, `tractari`, `design-study`).
- `npm run check`: typecheck (`astro check` in every site, `tsc` in the kit),
  lint, format check, conventions, and the saloon bots' tests. Run it before
  every hand-back.
- `npm run check:fast`: `astro check` in the sites with a changed file, then
  ESLint on the changed files. The Stop hook runs it.
- `npm run <site>:build`: the static build into `sites/<site>/dist/`.
- Image modes: saloon and auto-service ask for the real photos in `dev`,
  `build` and `preview`; `npm run saloon -- dev:mock` and
  `npm run saloon:build:mock` (the same for auto-service) use the committed
  SVG mocks. The other sites build the mocks unless `PUBLIC_IMAGE_SOURCE=real`.
- `npm run format`: Prettier writes every file it covers (Markdown stays out).
- `npm run saloon:bots`: the bots' typecheck and `node:test` suite.
- `npm run house-style:sync -- <tag>`: refresh `vendor/house-style/`.

## Places that mislead

- The `dev` scripts of saloon and auto-service set `PUBLIC_IMAGE_SOURCE=real`,
  and real photos aren't in git: on a fresh clone use the mock scripts.
- `churchix/` is its own npm project, with its own lockfile, corpus and
  `CLAUDE.md`. Root commands leave it alone except `npm run churchix -- <script>`.
- `sites/saloon/marketing/bots` is outside the workspaces, with its own
  lockfile (`npm --prefix sites/saloon/marketing/bots install`). It has only a
  `.env.example`: never create a `.env` there.
- `sites/*/docs-site/` are Docusaurus sites with their own build
  (`npm run <site>:docs`), outside lint, format and `check`.
- `sites/design-study/` is a study: typechecked, but not linted or formatted.
- Images resolve by logical name through each site's `src/content/images.ts`,
  so a grep for a file name reports a used image as unused.
- `vendor/house-style/` is a generated copy. Never edit it.

## Hard rules

- **No real business data in git.** `src/content/site.local.ts` and
  `public/images/real/` are gitignored. Never paste their contents into the
  repo or the corpus, and never write a secret's value anywhere.
- **The copy is Romanian.** Don't run English prose or style skills over it.
- **No CI.** Don't add GitHub Actions, runners or other GitHub automation.
- **No pushes.** Commit locally; the owner pushes.
- **Deploys and git settings are owner steps.** A site deploys with
  `node cli.ts <site> deploy` from the vps-deploy checkout.

## brief-board

Brief progress goes on brief-board. Run `brief-board guide` before you
start or resume a brief, and follow it.
