# auto-service — BavAuto Gorj

Presentation site for an **independent BMW-specialist workshop** (family
business, Târgu-Jiu / Gorj). Romanian, multi-page, static.

Astro 6 · React 19 islands · Tailwind v4 · deployed under the sub-path
`/auto-service`.

## Run it

> This site is an **npm workspace**. Install once from the repo root
> (`npm install` there) — dependencies hoist to the root `node_modules/`, and
> the commands below work from this directory or via the root passthroughs
> (`npm run auto-service:dev`).

```bash
npm run dev              # real photos (public/images/real/, git-ignored)
npm run dev:mock         # SVG placeholders instead
npm run build            # production build — real photos
npm run build:mock       # production build — placeholders
npm run placeholders     # regenerate the SVG placeholders
```

Build for the sub-path the way the VPS serves it:

```bash
PUBLIC_BASE=/auto-service npm run build
```

## Before publishing

Real contact details, the company identifiers and the map coordinates live in
`src/content/site.local.ts`, which is **git-ignored**. Copy
[`src/content/site.local.example.ts`](src/content/site.local.example.ts) and
fill it in — `src/content/site.ts` holds only placeholder defaults.

Real photos go in `public/images/real/` (also git-ignored); see
[`public/images/real/README.md`](public/images/real/README.md). Images are
addressed by *logical name* through
[`src/content/images.ts`](src/content/images.ts), so dropping a file in is all
it takes — no code edit.

## Project structure

```
.
├── PRODUCT.md              # product truth (impeccable)
├── DESIGN.md               # visual system (impeccable)
├── .impeccable/            # impeccable sidecar (design.json)
├── docs/                   # project docs, in Romanian
│   ├── STATUS.md           # where the project stands
│   ├── brief.md            # the product brief
│   ├── LEGAL.md            # GDPR / ANPC / consumer-law audit
│   ├── MARKETING.md
│   └── todo/
├── public/images/          # generated SVG placeholders + real/ (ignored)
├── scripts/                # gen-placeholders.mjs
└── src/                    # components, content, layouts, pages, styles
```

Start at [`docs/STATUS.md`](docs/STATUS.md).

## Deploy

Not in this repo — the site builds a static `dist/` that Caddy serves under
`/auto-service` on the VPS. See the root [README](../../README.md).
