---
summary: How a site in this repo is put together — the shared Astro/Tailwind shape, the mock-vs-real image pipeline, the gitignored real-data split, and where deploy lives.
updated: 2026-08-23
---

# Architecture

## The repo shape

```
presentation-sites/
  package.json        passthrough scripts only: npm run <site>:<script>
  .vscode/            launch configs (one "<site>: dev server" per site)
  corpus/             this workspace
  <site>/             a fully self-contained project — own package.json,
                      node_modules, build, docs. No hoisting, no cross-imports.
```

Root scripts are pure passthrough: `"saloon:dev": "npm --prefix saloon run dev"`.
Adding a site means adding its directory, its `<site>:*` scripts, a
`.vscode/launch.json` entry, and a row in the README — nothing central changes.

## The standard site (saloon, auto-service, subcort, tractari)

All four share one shape:

- **Astro 6, static output**, with **React 19 islands** (`@astrojs/react`) only
  where interactivity is needed. Tailwind **v4** via `@tailwindcss/vite` — no
  `tailwind.config.js`; tokens live in the CSS.
- **`base` is env-driven**: `base: process.env.PUBLIC_BASE ?? '/'` in
  `astro.config.mjs`. Every internal URL goes through a `withBase()` helper in
  `src/content/url.ts` so the site works at `/` in dev and at `/<site>` on the VPS.
- **Content is typed TypeScript, not markdown collections** — `src/content/*.ts`
  exports (`site.ts`, `gallery.ts`, `faq.ts`, `images.ts`). Components import them.
- `tractari` adds **Three.js + GSAP** for its hero scene; the others have no
  animation runtime.

### The image pipeline (mock vs real)

Each site addresses images by **logical name**, never by path:

```
src/content/images.ts    img("hero") → a URL, resolved by source
public/images/<name>.svg          committed mock placeholders (generated)
public/images/real/<name>.jpeg    real photos — GITIGNORED
```

`img(name)` picks the source from `IMAGE_SOURCE` / `PUBLIC_IMAGE_SOURCE`, and
falls back to the mock when a logical name has no real photo (the `HAS_REAL` list
in `images.ts` says which names do). This is why swapping a real photo in is a
file drop, never a code edit — see [`saloon/docs/ADR.md`](../../saloon/docs/ADR.md).

Mock placeholders are **generated**, not hand-drawn:
`node <site>/scripts/gen-placeholders.mjs`. Keep the generator and the gallery
list in `src/content/gallery.ts` in sync — a generator that emits more images
than the gallery renders just leaves dead files in `public/`.

`subcort` is the exception: its gallery photos are committed under
`public/images/photos/` (neutral placeholders), and its `real/` directory is empty.

**The image source is per-command, and the defaults differ by site.** A site that
has real photos (`saloon`, `auto-service`) defaults `dev`, `preview` **and
`build`** to them, with `:mock` variants as the escape hatch. A site that has none
(`subcort`) defaults to mock with a `dev:real` variant. Before 2026-08-23 `build`
was mock everywhere, so `npm run saloon:build` silently shipped grey placeholders
while `npm run saloon:dev` showed the real photos — check this first if a deployed
site looks wrong.

### Real data stays out of git

Per-site business truth — phone numbers, addresses, IBANs, coordinates — lives in
`src/content/site.local.ts`, which is **gitignored**. A committed
`site.local.example.ts` documents the shape. Same rule for `public/images/real/*`,
where only `.gitkeep` and `README.md` are tracked.

## Where the docs live

One shape per project, so a fresh reader never has to guess:

```
<site>/
  README.md      how to run it, what it is, its sub-path
  PRODUCT.md     product truth       ┐ impeccable artifacts — these exact
  DESIGN.md      the visual system   ┘ names, at the project root
  docs/          STATUS, LEGAL, MARKETING, todo/ … (mostly Romanian)
```

`corpus/` means **only** the root workspace. Per-site knowledge is `docs/`;
churchix's wiki is `churchix/docs/wiki/`. See [decisions.md](decisions.md).

## churchix — the exception

`churchix/` is an **npm-workspaces monorepo** (`packages/*`, `apps/*`,
`services/*`) building a white-label church platform: shared `@churchix/ui`,
`@churchix/schemas`, `@churchix/config`, and one independent Astro app per church
under `apps/`. Apps never depend on each other; there is no shared runtime or
central backend. Read [`churchix/CLAUDE.md`](../../churchix/CLAUDE.md) before
touching it — it is the source of truth for that subtree, not this page.

## Deploy

**Deploy is not in this repo.** Each site builds to a static `dist/` and is served
by **Caddy** under its own sub-path on a shared VPS; the build+upload tooling was
moved out in commit `6d2f237` (2026-06-18). Don't re-add deploy scripts here
without revisiting [decisions.md](decisions.md).
