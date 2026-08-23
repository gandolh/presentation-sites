# tractari — AXA Tractări

**Demo** single-page site for a vehicle towing + roadside-assistance service
covering Oltenia (Gorj, Dolj, Vâlcea, Olt, Mehedinți). Romanian, static.

One job, per [`PRODUCT.md`](PRODUCT.md): make a stranded driver **call
instantly**, from any scroll position, at any hour. The cinematic hero is
enrichment that must never gate that.

Astro 6 · React 19 islands · Tailwind v4 · **Three.js + GSAP** for the night-road
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
