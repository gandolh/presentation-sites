# Architecture

The repo is an npm-workspaces root with three kinds of workspace: the sites, their docs sites, and one shared package. churchix sits beside them as a separate monorepo. Every site and docs site builds to static files that Caddy serves under a path on the production domain. The only server code is saloon's `marketing/bots/` automation service, which runs in mock mode and is not live yet.

```mermaid
flowchart LR
  root["root package.json<br/>passthrough scripts"] --> sites["sites/*<br/>Astro 7, static"]
  root --> docs["sites/*/docs-site<br/>Docusaurus"]
  kit["packages/site-kit<br/>@sites/kit"] -.->|withBase, createImages| sites
  sites -->|README, PRODUCT, DESIGN, docs| docs
  local["site.local.ts and public/images/real<br/>gitignored"] -.->|merged at build| sites
  sites -->|dist| caddy["Caddy on the VPS<br/>/site/"]
  docs -->|dist| caddy
  churchix["churchix/<br/>own monorepo"] -->|apps/church/dist| caddy
```

- **sites/** holds six sites, each its own workspace. saloon, auto-service, subcort and tractari share one shape: Astro 7 with static output, React 19 islands where something has to be interactive, Tailwind v4 with its tokens in CSS, and content as typed TypeScript in `src/content/*.ts`. subcort draws its hero tent in Three.js. tractari has a Three.js night-road scene too, which since its 2026-11-13 redesign sits as a plate in the "Cum funcționează" section, below a hero of type and phone lines. tavi is the English one: Astro, Tailwind 4 and Base UI controls, with the watch movement as one typed part table drawn as SVG at build time and as 3D by a three.js island. design-study is Astro with React islands and no Tailwind; each of its 14 themes owns its markup, CSS and fonts.
- **packages/site-kit** is `@sites/kit`. It holds the code that was byte-identical across sites: `withBase()` for sub-path URLs, `createImages()` for the placeholder/real photo switch, and the `SiteOverridesOf` type. It ships TypeScript source with no build step, so each site lists it under `vite.ssr.noExternal` and Vite compiles it per site. The bar for adding to it is identical logic, not similar logic; [its README](../packages/site-kit/README.md) lists what was kept out and why.
- **`sites/<site>/docs-site`** is a Docusaurus site that renders the site's own Markdown into pages at `/<site>/docs/`.
- **e2e/** holds the Playwright specs for saloon, auto-service, subcort and tractari. `playwright.config.ts` starts one dev server per site on its own port (4701 to 4704) and runs each spec at 390×844 with touch and at 1280×800 with a mouse. The shared Floor checks (`floor-*.spec.ts`) cover contrast, the focus ring, reduced motion and overflow at 390 px; the contrast spec reads the built `dist/`, so build the site first. `mobile-menu.spec.ts` covers the four phone menus, and each site has a spec of its own (auto-service's is `auto-service-job-card.spec.ts`). saloon's, subcort's and tractari's specs also hold a `shots` test that writes screenshots when `SHOTS_DIR` is set.
- **vendor/house-style/** is a generated copy of the estate's house style. `eslint.config.mjs`, `prettier.config.mjs`, `.dependency-cruiser.cjs` and `knip.config.js` at the root extend it; `npm run house-style:sync` refreshes it. churchix, the docs sites and design-study stay outside lint and format.
- **churchix/** is a white-label platform: shared `@churchix/*` packages and one independent Astro app per parish. It is not a workspace here because one workspace root cannot nest inside another. [churchix/CLAUDE.md](../churchix/CLAUDE.md) governs it.

## Where each kind of doc lives

Every project uses the same layout:

| Where | What |
|---|---|
| `sites/<site>/README.md` | What the site is, how to run it, its sub-path |
| `sites/<site>/PRODUCT.md` | Who it is for and what it must do |
| `sites/<site>/DESIGN.md` | The visual system |
| `sites/<site>/docs/` | Everything else: status, legal, marketing, todo lists, mostly in Romanian |
| `corpus/` | The monorepo layer: layout, cross-site conventions, decisions, status |

`PRODUCT.md` and `DESIGN.md` are [impeccable](https://github.com/pbakaus/impeccable) files and keep those exact names at the project root, because that is where the tool reads them. churchix keeps its own wiki in [churchix/corpus/](../churchix/corpus/index.md).

## A content change, start to finish

1. Edit the typed content in `sites/<site>/src/content/`. Real contact details go in the gitignored `site.local.ts`.
2. `npm run <site>:dev` shows it locally at `/`.
3. `npm run <site>:build` writes `dist/`. Deploy builds with `PUBLIC_BASE=/<site>` so every link goes through `withBase()` to the right path.
4. The deploy repo uploads `dist/` and Caddy serves it at `/<site>/`.

## Going deeper

- [corpus/wiki/architecture.md](../corpus/wiki/architecture.md): the full as-built description, including the image pipeline and the docs-site scripts
- [corpus/wiki/decisions.md](../corpus/wiki/decisions.md): why the sites share so little, why deploy lives elsewhere, why real data is gitignored
- [corpus/wiki/design-styles.md](../corpus/wiki/design-styles.md): the 14 design-style dossiers from design-study and how to reuse them
- [corpus/wiki/decisions-ui.md](../corpus/wiki/decisions-ui.md): what the React islands depend on, and the visual calls reopened by the 2026-11-13 redesigns
- [corpus/wiki/decisions-house-style.md](../corpus/wiki/decisions-house-style.md): the format, lint and typecheck setup, what `npm run check` runs and what stays outside it
