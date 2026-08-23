# Ana Saloon

Presentation site for **Ana Saloon** — a boutique nail salon in Târgu-Jiu, Gorj, România.

Built with **Astro + React + Tailwind v4**. Pure static output, hostable on any web server (nginx, Caddy, etc.).

## Stack

- **Astro 6** — static site generator
- **React 19** — interactive islands (mobile menu, mobile booking bar)
- **Tailwind CSS v4** — design tokens defined in `src/styles/global.css` via `@theme`
- **Fraunces** (variable display) + **Manrope** — self-hosted via `@fontsource` (no Google Fonts CDN, for GDPR)
- **WhatsApp deep-link** + **Formspree** backup — appointment booking

## Project structure

```
.
├── docs/                     # Project docs (RO business docs + specs)
│   ├── ADR.md                # Architecture decisions & spec
│   ├── tokens.md             # Design system (color, typography, tokens)
│   ├── STATUS.md             # Where the project stands
│   ├── LEGAL.md  MARKETING.md
│   └── todo/                 # ROADMAP.md + TODO.md
├── public/
│   ├── favicon.svg
│   └── images/               # SVG placeholders (to be replaced by photos)
├── scripts/
│   └── gen-placeholders.mjs  # Re-generate SVG placeholders
└── src/
    ├── components/           # Section components (.astro) + React islands (.tsx)
    ├── content/              # Hardcoded data (services, testimonials, site config)
    ├── layouts/Base.astro    # Document shell, fonts, SEO, JSON-LD
    ├── pages/index.astro     # Single-page site
    └── styles/global.css     # Tailwind import + design tokens + components
```

## Commands

| Command            | Action                                           |
| ------------------ | ------------------------------------------------ |
| `npm install`      | Install — run it at the **repo root** (workspaces) |
| `npm run dev`      | Dev server at http://localhost:4321              |
| `npm run build`    | Build to `./dist/`                               |
| `npm run preview`  | Preview the production build locally             |

## Deploy

The build produces a fully static `dist/` directory, served by **Caddy** under
the `/saloon` sub-path on a Hetzner VPS. There is no Node process on the server.
The build + upload tooling lives outside this repo.

## Real personal/business data (kept out of Git)

The real phone, address, CUI, social handles, Formspree ID, and salon
coordinates live in a **git-ignored** file so they never reach GitHub.
`src/content/site.ts` holds only public placeholders; the local file is
deep-merged on top of them at build time.

```bash
cp src/content/site.local.example.ts src/content/site.local.ts
# then edit src/content/site.local.ts with the real values
```

- `site.local.ts` is git-ignored — every field is optional, only override what you need.
- If it's absent (fresh clone / CI), the build still succeeds using the placeholders.
- `formspreeEndpoint` — create a free form at https://formspree.io and paste the URL.

> Note: these values are still baked into the published HTML — that's expected
> for a contact page. This setup keeps them out of the repo, not off the live site.

### Real photos (kept out of Git)

Real photos live in the **git-ignored** `public/images/real/` directory and are
never committed; the SVG placeholders in `public/images/` stay tracked as a
fallback. Which directory the site loads from is controlled by a single
constant — see [`src/content/images.ts`](src/content/images.ts). Default is the
mockups; set `IMAGE_SOURCE = "real"` (or the `PUBLIC_IMAGE_SOURCE` env var) once
real photos are in place. See [`public/images/real/README.md`](public/images/real/README.md).

## Design system

See [docs/tokens.md](docs/tokens.md) for tokens and [docs/ADR.md](docs/ADR.md) for decisions.
