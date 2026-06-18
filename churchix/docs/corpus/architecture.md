---
title: Architecture
summary: Monorepo, Astro static-first + React islands, content collections, and the independent static-per-build model.
status: stable
updated: 2026-05-29
related: [independence-model, design-system, content-model, optional-backend, research-brief]
---

# Architecture

How Churchix is structured. For the *why*, read [research-brief](research-brief.md). For decisions still open, see [decisions](decisions.md). The runtime-isolation rationale is in [independence-model](independence-model.md).

## Mental model

```
┌──────────────────────────────────────────────────────────────┐
│  packages/  — the shared "core library" (church-agnostic)      │
│   @churchix/ui       Astro + React components, layouts, tokens  │
│   @churchix/schemas  Zod content schemas                        │
│   @churchix/config   base tsconfig + shared config              │
└───────────────┬───────────────┬───────────────┬──────────────┘
        imported │       imported │       imported │
        ┌────────▼───────┐ ┌──────▼─────────┐ ┌────▼───────────┐
        │ apps/church-a  │ │ apps/church-b  │ │ apps/church-c  │
        │ static Astro   │ │ static Astro   │ │ static Astro   │
        │ own brand+     │ │ own brand+     │ │ own brand+     │
        │ content+deploy │ │ content+deploy │ │ content+deploy │
        └────────┬───────┘ └──────┬─────────┘ └────┬───────────┘
                 │                 │                │
            own CDN +         own CDN +        own CDN +
            hosted giving     hosted giving    hosted giving
```

**Each church is an independent platform.** A church app is thin (tokens + content + config) and shares only *code* with the others — never a runtime, a database, or a server. There is no central backend and no cross-church coupling. Reusable code lives in `packages/`; everything else is the church's own.

## Monorepo — npm workspaces

Root `package.json` declares `"workspaces": ["packages/*", "apps/*", "services/*"]`. One root `package-lock.json`. Internal deps are referenced as `"@churchix/ui": "*"` and symlinked.

```bash
npm install                            # all workspaces
npm run dev   -w apps/<church>         # one church
npm run dev   -w services/api          # the API
npm run build --workspaces --if-present
npm install <pkg> -w packages/ui       # scoped add
```

**Why npm workspaces:** no extra tooling, single lockfile, native to the installed toolchain. **Tradeoff:** npm workspaces has no built-in "build only changed packages" filter. If CI build time grows with the number of churches, add **Turborepo** (remote caching + affected-graph) — deferred until it actually hurts. **Changesets** is unnecessary while packages are consumed internally (`*`), not published.

## Frontend — Astro static-first + React islands

- **Default to static `.astro`.** Ship HTML; hydrate only interactive pieces.
- **React islands** via `@astrojs/react` and `client:*` directives — see the islands strategy in [research-brief §3](research-brief.md). Reserve React for genuinely interactive UI: nav, donation widget, event calendar, goal thermometer, donor portal.
- **`@churchix/ui` rules:**
  - `react` / `react-dom` are **peerDependencies** (never two React copies).
  - Each consuming app registers `@astrojs/react` (and `mdx`, etc.) itself — Astro integrations are per-app, not inherited from a shared package.
  - Components read **CSS custom properties** for brand; they contain no church-specific values.
  - A base `astro.config` is merged per app: `mergeConfig(base, { site, integrations, adapter })`.

### Per-church branding (design tokens)

Brand is a **token set** applied at build time as CSS custom properties, so a church re-skins without forking components. Churches set a small **seed** set (`primary`, `secondary`/gold, `surface`, optional `error`/fonts/radius); the rest of the Material-3 palette is derived. The full token contract, the seed→derived rule, and the "Ecclesia Digitalis" look live in [design-system](design-system.md); the styling decision (Tailwind + M3) is [ADR-0002](../adr/0002-tailwind-material3-design-system.md). Bespoke per-church layouts are a deliberate escape hatch, not the norm.

### Build/deploy — static-per-build (DECIDED)

Each church builds to **static HTML on a CDN**, deployed independently. There is deliberately **no single SSR multi-tenant app** — that was rejected in favor of independence (see [decisions](decisions.md) → Decided, and [independence-model](independence-model.md)). Consequences:

- A church's giving is **server-light**: IBAN / Form 230 / SMS info is static; card giving uses a hosted **Stripe Payment Link** or **Netopia** URL; the pomelnice form POSTs to a church-configured endpoint (a form service, or that church's own optional backend).
- If a specific church later needs server logic (live campaign totals, recurring giving, webhooks), it adds an Astro adapter + on-demand routes (`export const prerender = false`) **in its own app**, or deploys its own copy of the optional `services/api`. This never becomes a shared service.

## Content — Astro Content Collections

- Schemas are defined **once** in `@churchix/schemas` (Zod). Every church's `content.config.ts` imports them, so frontmatter is consistent across all sites. See [content-model](content-model.md) for the collections and their fields.
- Church content lives as Markdown/MDX + data files in each app's `src/content/`.
- For churches whose content comes from a headless CMS instead of files, implement a custom **Content Layer Loader** to sync at build time. Use **Live Collections** only for SSR routes needing per-request freshness.

## Backend & data model — optional, per-church

There is **no shared backend** and v1 churches need no database. If a church later needs live campaign totals, recurring giving, or webhooks, it deploys its **own** single-tenant Fastify API. That whole topic — API shape, the `PaymentGateway` abstraction, the relational data model, and webhook handling — lives in [optional-backend](optional-backend.md).

## Independence model (instead of multi-tenancy)

There is **no multi-tenancy** — isolation is total because nothing is shared at runtime. This is the load-bearing architectural decision and has its own page: [independence-model](independence-model.md).

## Environments & hosting

- **Sites (v1):** each church is static, hosted independently on a CDN (Cloudflare Pages / Netlify / Vercel). Custom domain per church.
- **Secrets:** per-church build/deploy env vars (payment-link URLs, form endpoints). No shared secret store.
- **Optional per-church API:** if a church adds the backend, it brings its own EU-region Fastify + PostgreSQL (+ Redis/BullMQ for receipts), single-tenant. Provider keys live in that church's secret manager, never in code.
