# presentation-sites

An **npm-workspaces monorepo** for presentation/marketing sites. Every site
lives under [`sites/`](sites/) as its own workspace; shared helpers live in
[`packages/`](packages/). [`churchix/`](churchix/) sits outside the workspace —
it is a separate project with workspaces of its own.

```
presentation-sites/
├── sites/          one workspace per deployable site
├── packages/       code shared by those sites (@sites/kit)
├── churchix/       the white-label platform — its own monorepo, not a workspace here
├── corpus/         repo-level knowledge
└── package.json    the workspace root + passthrough scripts
```

## Sites

- **[sites/saloon/](sites/saloon/)** — Ana Saloon, a boutique nail salon in Târgu-Jiu
  (Astro + React + Tailwind v4, static). Includes its own docs (`docs/`)
  and the `marketing/bots/` automation service. Deploy sub-path `/saloon`.
  See [sites/saloon/README.md](sites/saloon/README.md) and
  [sites/saloon/docs/STATUS.md](sites/saloon/docs/STATUS.md) to get oriented.
- **[sites/auto-service/](sites/auto-service/)** — BavAuto Gorj, a BMW-specialist auto
  service in Târgu-Jiu (Astro, static). Deploy sub-path `/auto-service`. See
  [sites/auto-service/README.md](sites/auto-service/README.md).
- **[sites/subcort/](sites/subcort/)** — Subcort, a demo event-tent rental site for
  Gorj/Oltenia (Astro + React + Tailwind v4, static). Deploy sub-path
  `/subcort`. See [sites/subcort/README.md](sites/subcort/README.md).
- **[sites/tractari/](sites/tractari/)** — AXA Tractări, a demo car-towing site for Oltenia
  (Astro + React + Tailwind v4, static). Minimalist, with a Three.js hero scene
  of a tow truck driving a night road. Deploy sub-path `/tractari`. See
  [sites/tractari/README.md](sites/tractari/README.md).
- **[churchix/](churchix/)** — Churchix, a white-label platform for Orthodox
  church sites plus a giving surface. Unlike the others it is a product, not a
  single site: its own npm-workspaces monorepo with shared `@churchix/*`
  packages and one independent Astro app per church. See
  [churchix/CLAUDE.md](churchix/CLAUDE.md).

> Each site owns its content, build and docs. What they share is deliberately
> small and explicit: the `@sites/kit` package. Nothing else crosses between them.

## Docs — one shape everywhere

Every project uses the same layout, so you always know where to look:

| Where | What |
|---|---|
| `sites/<site>/README.md` | how to run it, what it is, its sub-path |
| `sites/<site>/PRODUCT.md` | product truth — who it's for, what it must do |
| `sites/<site>/DESIGN.md` | the visual system |
| `sites/<site>/docs/` | everything else: STATUS, LEGAL, MARKETING, todo/ (mostly Romanian) |

`PRODUCT.md` and `DESIGN.md` are [impeccable](https://github.com/pbakaus/impeccable)
artifacts and keep those exact names at the project root — that is where the tool
reads them.

Monorepo-level knowledge — layout, cross-site conventions, locked decisions,
current state — lives in [`corpus/`](corpus/). Start at
[`corpus/index.md`](corpus/index.md); health check with `bash corpus/lint.sh`.
The word **corpus** means exactly one thing in this repo: that workspace. Per-site
knowledge is `docs/`, and churchix's wiki is `churchix/docs/wiki/`.

## Working on a site

Install **once, at the repo root** — npm resolves every workspace and hoists
dependencies into the root `node_modules/`. There are no per-site installs and
no per-site lockfiles.

```bash
npm install                  # once, at the root — covers every site + packages/

# From the repo root
npm run saloon:dev
npm run saloon:build
npm run saloon -- preview    # run any of saloon's own scripts
npm run build                # build every site

# Or from inside a site
cd sites/saloon && npm run dev
```

`churchix/` is **not** part of this workspace — it has its own lockfile and its
own `packages/*` workspaces. Install and run it separately (`npm run
churchix:install`, `npm run churchix:build`).

### Shared code

Anything genuinely identical across sites lives in
[`packages/site-kit`](packages/site-kit/) (`@sites/kit`) — currently `withBase()`
for sub-path URLs, the `createImages()` mock/real pipeline, and the
`SiteOverridesOf` type. It ships TypeScript source with no build step; Vite
compiles it as part of whichever site imports it.

The bar for putting something there is **identical logic, not similar logic**.
Anything a site configures stays in the site — see
[the package README](packages/site-kit/README.md) for what is deliberately
excluded and why.

### Deploy

Deployment is not part of this repo. Each site builds to a static `dist/` and is
served by **Caddy** under its own sub-path (e.g. `/saloon`) on the VPS; the
build + upload tooling lives outside this repo.

## Adding a new site

1. Create `sites/<name>/` with its own `package.json` — mirror
   [`sites/saloon/`](sites/saloon/). Depend on `"@sites/kit": "*"` and add
   `ssr: { noExternal: ["@sites/kit"] }` to its `vite` block in
   `astro.config.mjs`.
2. Run `npm install` at the root — the `sites/*` glob picks it up automatically.
3. Add `<site>:*` passthrough scripts to the root `package.json`, following the
   `saloon:*` pattern (`npm run <script> -w sites/<site>`).
4. Add a `<site>: dev server` entry to `.vscode/launch.json` running
   `npm run <site>:dev` from `${workspaceFolder}`.
5. Give it the doc shape above: `README.md`, `PRODUCT.md`, `DESIGN.md`, and a
   `docs/` directory if it needs one.
6. List it under **Sites** above.

The root `.gitignore` needs no edit — its rules for `site.local.ts` and
`public/images/real/` are site-agnostic `**/` patterns.
