# presentation-sites

A monorepo for presentation/marketing sites. Each site is a self-contained
project in its own top-level directory.

## Sites

- **[saloon/](saloon/)** — Ana Saloon, a boutique nail salon in Târgu-Jiu
  (Astro + React + Tailwind v4, static). Includes its own docs (`corpus/`)
  and the `marketing/bots/` automation service. Deployed at sub-path `/saloon`
  . See [saloon/README.md](saloon/README.md) and
  [saloon/corpus/STATUS.md](saloon/corpus/STATUS.md) to get oriented.
- **[auto-service/](auto-service/)** — BavAuto Gorj, a BMW-specialist auto
  service in Târgu-Jiu (Astro, static). Deploy sub-path `/auto-service`.
- **[subcort/](subcort/)** — Subcort, a demo event-tent rental site for
  Gorj/Oltenia (Astro + React + Tailwind v4, static). Deploy sub-path
  `/subcort`.
- **[tractari/](tractari/)** — AXA Tractări, a demo car-towing site for Oltenia
  (Astro + React + Tailwind v4, static). Minimalist, with a Three.js hero scene
  of a tow truck driving a night road. Deploy sub-path `/tractari`. See
  [tractari/PRODUCT.md](tractari/PRODUCT.md) and
  [tractari/DESIGN.md](tractari/DESIGN.md).
- **[showcase/](showcase/)** — gandolh, a look-don't-touch gallery of the sites
  above (Astro + Tailwind v4, static). The page is one running terminal session:
  `ls ./projects` "outputs" each site as a screenshot plate linking to its live
  deployment. Deploy sub-path `/showcase`; tile links use the build-time
  `PUBLIC_SITES_HOST`. See [showcase/README.md](showcase/README.md).

> Each site is self-contained in its own sibling directory; new sites get their
> own. The repo root only carries the passthrough scripts and shared config.

## Working on a site

Each site directory is its own project root (its own `package.json`,
`node_modules`, build, and deploy) — there is no dependency hoisting. Either
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
4. List it under **Sites** above, and prefix any of its repo-root-anchored
   `.gitignore` rules with `<site>/`.
