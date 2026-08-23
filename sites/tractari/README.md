# tractari — AXA Tractări

**Demo** single-page site for a vehicle towing + roadside-assistance service
covering Oltenia (Gorj, Dolj, Vâlcea, Olt, Mehedinți). Romanian, static.

One job, per [`PRODUCT.md`](PRODUCT.md): make a stranded driver **call
instantly**, from any scroll position, at any hour. The cinematic hero is
enrichment that must never gate that.

Astro 7 · React 19 islands · Tailwind v4 · **Three.js + GSAP** for the night-road
hero scene · deployed under the sub-path `/tractari`.

## Run it

> This site is an **npm workspace**. Install once from the repo root
> (`npm install` there) — dependencies hoist to the root `node_modules/`, and
> the commands below work from this directory or via the root passthroughs
> (`npm run tractari:dev`).

```bash
npm run dev
npm run build
npm run preview
```

Build for the sub-path the way the VPS serves it:

```bash
PUBLIC_BASE=/tractari npm run build
```

## Notes

The company, phone numbers and legal identifiers are deliberate placeholders —
there is no real business behind it. Values live in
[`src/content/site.ts`](src/content/site.ts); a git-ignored
`src/content/site.local.ts` can override them (see
[`site.local.example.ts`](src/content/site.local.example.ts)).

This site has **no image pipeline** — no `public/images/`, no placeholder
generator. The hero is rendered, not photographed:
[`src/components/hero/scene.ts`](src/components/hero/scene.ts) and
[`HeroCanvas.tsx`](src/components/hero/HeroCanvas.tsx).

## A pinned dependency

`@fontsource-variable/big-shoulders-display` is held at **5.2.5** while
everything else tracks latest. Version 5.3.0 dropped the `"./*.css"` entry from
its package `exports`, so `import ".../wght.css"` no longer resolves and the
build fails. The extensionless form resolves but then TypeScript cannot see it
as CSS, so that is not a fix either.

Upstream renamed the font: the maintained package is
`@fontsource-variable/big-shoulders`, which still ships the export. Switching to
it means changing the family name in
[`src/styles/global.css`](src/styles/global.css) from
`"Big Shoulders Display Variable"` to the new one — a visual change, so it was
left alone. Do that swap deliberately, not as part of a dependency bump.

## Project structure

```
.
├── PRODUCT.md              # product truth (impeccable)
├── DESIGN.md               # visual system (impeccable)
└── src/
    ├── components/hero/    # Three.js scene + React canvas island
    ├── content/            # site.ts, url.ts
    ├── layouts/Base.astro
    ├── pages/index.astro
    └── styles/global.css
```

## Deploy

Not in this repo — the site builds a static `dist/` that Caddy serves under
`/tractari` on the VPS. See the root [README](../../README.md).
