# presentation-sites

A monorepo for presentation/marketing sites. Each site is a self-contained
project in its own top-level directory.

## Sites

- **[saloon/](saloon/)** — Ana Saloon, a boutique nail salon in Târgu-Jiu
  (Astro + React + Tailwind v4, static). Includes its own docs (`docs/`)
  and the `marketing/bots/` automation service. Deploy sub-path `/saloon`.
  See [saloon/README.md](saloon/README.md) and
  [saloon/docs/STATUS.md](saloon/docs/STATUS.md) to get oriented.
- **[auto-service/](auto-service/)** — BavAuto Gorj, a BMW-specialist auto
  service in Târgu-Jiu (Astro, static). Deploy sub-path `/auto-service`. See
  [auto-service/README.md](auto-service/README.md).
- **[subcort/](subcort/)** — Subcort, a demo event-tent rental site for
  Gorj/Oltenia (Astro + React + Tailwind v4, static). Deploy sub-path
  `/subcort`. See [subcort/README.md](subcort/README.md).
- **[tractari/](tractari/)** — AXA Tractări, a demo car-towing site for Oltenia
  (Astro + React + Tailwind v4, static). Minimalist, with a Three.js hero scene
  of a tow truck driving a night road. Deploy sub-path `/tractari`. See
  [tractari/README.md](tractari/README.md).
- **[churchix/](churchix/)** — Churchix, a white-label platform for Orthodox
  church sites plus a giving surface. Unlike the others it is a product, not a
  single site: its own npm-workspaces monorepo with shared `@churchix/*`
  packages and one independent Astro app per church. See
  [churchix/CLAUDE.md](churchix/CLAUDE.md).

> Each site is self-contained in its own sibling directory; new sites get their
> own. The repo root only carries the passthrough scripts and shared config.

## Docs — one shape everywhere

Every project uses the same layout, so you always know where to look:

| Where | What |
|---|---|
| `<site>/README.md` | how to run it, what it is, its sub-path |
| `<site>/PRODUCT.md` | product truth — who it's for, what it must do |
| `<site>/DESIGN.md` | the visual system |
| `<site>/docs/` | everything else: STATUS, LEGAL, MARKETING, todo/ (mostly Romanian) |

`PRODUCT.md` and `DESIGN.md` are [impeccable](https://github.com/pbakaus/impeccable)
artifacts and keep those exact names at the project root — that is where the tool
reads them.

Monorepo-level knowledge — layout, cross-site conventions, locked decisions,
current state — lives in [`corpus/`](corpus/). Start at
[`corpus/index.md`](corpus/index.md); health check with `bash corpus/lint.sh`.
The word **corpus** means exactly one thing in this repo: that workspace. Per-site
knowledge is `docs/`, and churchix's wiki is `churchix/docs/wiki/`.

## Working on a site

Each site directory is its own project root (its own `package.json`,
`node_modules`, and build) — there is no dependency hoisting. Either
`cd` into the site, or use the root passthrough scripts.

```bash
# From the site directory
cd saloon && npm install && npm run dev

# Or from the repo root (passthrough scripts)
npm run saloon:install
npm run saloon:dev
npm run saloon:build
npm run saloon -- preview    # run any of saloon's own scripts
```

### Deploy

Deployment is not part of this repo. Each site builds to a static `dist/` and is
served by **Caddy** under its own sub-path (e.g. `/saloon`) on the VPS; the
build + upload tooling lives outside this repo.

## Adding a new site

Keep each site self-contained so the repo can hold many without coupling:

1. Create a sibling directory (e.g. `studio/`) with its own `package.json`,
   `node_modules`, and build — mirror `saloon/`'s layout.
2. Add `<site>:*` passthrough scripts to the root `package.json`, following the
   `saloon:*` pattern (`npm --prefix <site> run <script>`).
3. Add a `<site>: dev server` entry to `.vscode/launch.json` with
   `"cwd": "${workspaceFolder}/<site>"`.
4. Give it the doc shape above: `README.md`, `PRODUCT.md`, `DESIGN.md`, and a
   `docs/` directory if it needs one.
5. List it under **Sites** above.

The root `.gitignore` needs no edit — its rules for `site.local.ts` and
`public/images/real/` are site-agnostic `**/` patterns.
