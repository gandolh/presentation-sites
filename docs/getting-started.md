# Getting started

## Prerequisites

- Node 22.12 or later, which Astro 7 requires. Tested on Node 24.
- npm, which comes with Node.

Nothing else. The sites need no database, no accounts and no env file to build.

## Install

Install once, at the repo root:

```bash
npm install
```

npm resolves every workspace in `sites/*`, `sites/*/docs-site` and `packages/*`, and hoists the dependencies into the root `node_modules/`. There are no per-site installs and no per-site lockfiles. `churchix/` is the exception, see [churchix](#churchix) below.

## Run one site

The root `package.json` has the same set of scripts for each site:

| Script | What it runs |
|---|---|
| `npm run <site>:dev` | Astro dev server, <http://localhost:4321/> by default |
| `npm run <site>:build` | Static build into `sites/<site>/dist/` |
| `npm run <site>:preview` | Serves the last build |
| `npm run <site>:docs` | Builds the site's docs site, see [Docs sites](#docs-sites) |
| `npm run <site> -- <script>` | Any other script of that site, for example `npm run saloon -- dev:mock` |

`<site>` is one of `saloon`, `auto-service`, `subcort`, `tractari`, `design-study`. The scripts select each workspace by its package name, never by path, because a path would also select the site's nested docs site. The package names are `ana-saloon`, `bavauto-gorj`, `subcort`, `tractari` and `design-study`.

You can also run a site's own scripts from inside it: `cd sites/saloon && npm run dev`.

VS Code users get a "dev server" launch entry per site in `.vscode/launch.json`.

### Another port

Pass the flag through both npm layers, hence the two `--`:

```bash
npm run tractari:dev -- -- --port 5321
```

When its output is not a terminal, as in a script or a background job, Astro 7's `astro dev` detaches and prints its pid. Stop it with `npx astro dev stop` from the site's folder, or kill that pid.

## Real data and placeholders

Real business details such as the phone, address, company ID and map coordinates live in `src/content/site.local.ts` inside each site. That file is gitignored. The committed `site.local.example.ts` shows its shape, and the build merges it over the placeholders in `site.ts` when it exists. Without it the site builds with placeholders.

Real photos live in `public/images/real/`, also gitignored. Each site addresses images by a logical name, and `@sites/kit` picks the real photo or the committed SVG placeholder:

- **saloon** asks for real photos in `dev`, `build` and `preview`. On a clone without them, use the mock variants: `npm run saloon -- dev:mock`, `npm run saloon:build:mock`.
- **auto-service** asks for real photos too, but lists none, so it looks the same either way. It draws its workshop instead.
- **subcort**, **tractari** and **design-study** use placeholders or drawings by default.

`npm run saloon:placeholders` regenerates the salon's SVG placeholders, and the same script exists for `auto-service` and `design-study`. `npm run subcort:og` redraws subcort's social card.

## Build

```bash
npm run build            # every site; docs sites are built separately
npm run tractari:build   # one site
```

Each site builds to `sites/<site>/dist/`, which git ignores. The base path comes from `PUBLIC_BASE`, so a site works at `/` locally and at `/<site>/` when deployed.

## Docs sites

Each site has a Starlight docs site at `sites/<site>/docs-site/`, a workspace of its own named `@sites/<site>-docs`:

```bash
npm run saloon:docs      # → sites/saloon/docs-site/dist/, base /saloon/docs/
```

The script renders the site's own `README.md`, `PRODUCT.md`, `DESIGN.md` and selected `docs/` files into `src/content/docs/wiki/`, compiles any diagrams, then runs `astro build`. Edit the site's own files, never the generated pages under `src/content/docs/wiki/`: every build rewrites them. The base `/<site>/docs/` is set in the docs site's `astro.config.mjs` and `DOCS_BASE` overrides it. The live copy is at `https://gandolh.ro/<site>/docs/`.

churchix has its own docs site at `churchix/docs-site/`.

## churchix

`churchix/` is not part of this workspace. It has its own lockfile and its own `packages/*` and `apps/*` workspaces. From the root:

```bash
npm run churchix:install          # npm install inside churchix/
npm run churchix:build            # builds every churchix workspace
npm run churchix -- dev:bac       # dev server for the one parish app
```

That dev script sits one npm layer deeper, so a port flag needs three `--`: `npm run churchix -- dev:bac -- -- --port 5323`.

Read [churchix/README.md](../churchix/README.md) and [churchix/CLAUDE.md](../churchix/CLAUDE.md) before changing it.

## Checks

```bash
npm run saloon:bots      # typecheck and tests for saloon's marketing/bots service
bash corpus/lint.sh      # health check for the project wiki
```

## Deploy

Not in this repo. Each site's `dist/` is served by Caddy under its own path on the VPS, and the build and upload tooling lives in a separate deploy repo. See [corpus/wiki/decisions.md](../corpus/wiki/decisions.md) before adding deploy scripts here.
