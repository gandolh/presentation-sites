---
summary: Archive, part one of the original research brief, kept verbatim. The Romanian church-site landscape (§1), the multi-tenancy recommendation later rejected (§2), and the Astro monorepo and content architecture (§3). Read it for the why behind architecture.md.
updated: 2026-10-07
---
# Churchix — Engineering Decision Brief

A white-label, multi-tenant church website + giving platform (Astro + React frontend, Fastify backend) targeting Romanian churches in Romania and the diaspora. This brief consolidates six research streams into decisions for the repo.

> Source: web research (May 2026) across Romanian Orthodox/Catholic sites, Romanian Protestant/diaspora sites, white-label/multi-tenant architecture, Astro + React monorepo patterns, Fastify donations APIs, and church giving platforms.
>
> **⚠ Decisions taken since this brief was written (see [decisions](decisions.md) → Decided):** monorepo uses **npm workspaces** (not pnpm); **each church is an independent static deployment** — the **multi-tenant shared-schema backend in §2 was rejected** in favor of no shared backend; **v1 targets Orthodox**; giving is **server-light** (the §4 Fastify API / §5 data model now describe an *optional, single-tenant, per-church* add-on, with `tenant_id` dropped). The research below is retained as the rationale and reference, but read §2/§4/§5 through that lens.

---

## 1. Romanian church website landscape — pages, tone, must-haves

Two distinct markets exist, and **the product must serve both, not one or the other**: Romanian **Orthodox/Greek-Catholic** parishes and Romanian **Protestant/evangelical** (Pentecostal, Baptist, Adventist, Brethren) churches. They diverge most on giving maturity and tone, and converge on schedule/livestream/announcements.

### Shared core page inventory (both traditions)

| Page | RO label | Notes |
|---|---|---|
| Home | Acasă | Hero, service times, livestream link, prominent donate/give CTA, latest announcements |
| Service schedule | Program / Program Slujbe | **The single most-used page.** Weekly/monthly schedule; diaspora often "2nd & last Sunday" because clergy are shared; downloadable monthly PDF/image is common |
| News / announcements | Anunțuri / Actualitate / Știri | Dated posts; frequently mirrored from Facebook |
| About / history | Despre / Prezentare / Istoric | Identity + leadership |
| Livestream | LIVE / Transmisiune LIVE | Embedded YouTube/Facebook — **nobody self-hosts video** |
| Sermon/media archive | Predici / Arhivă / Video | YouTube-backed, embedded |
| Photo gallery | Galerie Foto | Feasts, baptisms, festivals |
| Events / calendar | Evenimente / Calendar | Often just a list, not interactive |
| Contact | Contact | Address, map, phone, email, leadership directory; often a prayer-request form |
| Donations | Donații / Donează | See §5; the biggest product gap |

### Orthodox / Greek-Catholic specifics
- **Tone & design:** formal, reverent, liturgical. Byzantine icons, church-building photos, gold/cream/burgundy over light backgrounds. Institutional hierarchy is foregrounded (Patriarch → Metropolitan/Bishop → preot paroh → parish council), each with photo + title.
- **Distinctive features:** **Pomelnice** (submit names of the living `pomelnic de vii` and departed `pentru cei adormiți` to be prayed for, usually tied to a small offering) — a first-class Orthodox feature with no Protestant equivalent; **Orthodox calendar** with saint-of-the-day + fasting rules; **sacrament arrangement** info (Botez, Cununie, Parastas, Spovedanie).
- **Giving maturity:** low. Baseline is IBAN bank transfer (often RON/EUR/USD accounts) + in-person cash. Greek-Catholic (BRU) sites frequently have **no online giving at all** — the clearest greenfield.

### Protestant / evangelical specifics
- **Tone & design:** warm, community-oriented, Scripture-heavy. **Doctrinal statements are unusually prominent** (`Mărturisire de credință` / statement of faith front-and-center) versus Western norms. Dove/light branding common in Pentecostal sites. The larger RO Pentecostal sites (Filadelfia, Poarta Cerului) are genuinely modern.
- **Distinctive features:** ministries/small-groups directory (Școala Duminicală, Awana, Tineret), prayer-request + testimony (`Mărturii`) forms, weekly bulletin (`Buletin duminical`), daily Bible reading plans, baby-dedication/baptism registration (diaspora).
- **Giving maturity:** high and donation-forward. Card giving is a first-class nav item. Terminology matters: **Zeciuială** (Pentecostal/Baptist tithe), **Zecime** (Adventist tithe), vs. **Dar/Jertfă/Donații** (freewill offerings). Designated funds are routine (building, Sunday school, instruments, missions, humanitarian e.g. Ukraine).

### Cross-cutting must-haves
- **Romania-only giving mechanics** that any RO-aware product must support natively: **Form 230** (individuals redirect up to 3.5% of income tax to a church/NGO; deadline ~25 May, valid up to 2 years) and **SMS micro-donations** (2 EUR via Vodafone/Telekom/Orange — used by the National Cathedral). For companies, **Form 107 sponsorship** (up to 20% of corporate income tax, needs a signed sponsorship contract).
- **i18n is mandatory, not optional.** Romania-based sites are RO-only; diaspora is bilingual (RO/EN US/Canada/UK, RO/DE Germany, RO/IT Italy). Two nuances: (a) **liturgical/theological vocabulary stays in Romanian even inside English pages** (e.g. an EN nav item still reads "Slujbele religioase"); (b) **full Romanian diacritics** (ă, â, î, ș, ț) must be supported everywhere. Minimum language set: RO + EN, plus IT/ES/DE for diaspora regions.
- **Domain glossary the CMS/i18n layer must handle:** slujbe, Sfânta Liturghie, Vecernie/Utrenie, predică, anunțuri, pomelnic/pomelnice, parastas, botez, cununie, spovedanie, hram, preot paroh; donează/donații, zeciuială/zecime, dar/jertfă, misiune, fond construcție, Mărturisire de credință, mărturii, Formular 230.

**The opportunity:** a unified, Romanian-aware giving stack (IBAN + card + recurring + Form 230 + SMS + pomelnice) in RO and host-country languages. Nobody offers this; Orthodox/Greek-Catholic sites are years behind on giving, and evangelical sites lack capital-campaign tooling.

---

## 2. White-label / multi-tenancy recommendation

**Decision: pooled shared-database, shared-schema as the default, in a hybrid/tiered model.** Every tenant-owned row carries `tenant_id` (church_id). This is the consensus across the multi-tenancy and Fastify research, and it matches the wide church size range (tiny diaspora parish → large multi-campus Pentecostal church).

**Tiering (sell isolation as a feature):**
- **Default (all churches):** pooled shared schema + Postgres RLS.
- **Premium (multi-campus orgs, denominations/unions, compliance-sensitive):** schema-per-tenant.
- **Enterprise / data-residency:** database-per-tenant.
- **Avoid as the default:** per-site builds / single-tenant forks (the WordPress-agency model). This is the exact pattern that destroys white-label economics — linear maintenance growth, site-by-site patching, theme drift. Reserve only for a tiny number of bespoke flagship sites.

**Isolation = defense-in-depth, never RLS alone.** Documented failure modes (connection-pool contamination, cache poisoning, async request-context reuse, PostgreSQL RLS subquery/optimizer bypass) mean you layer:
1. Postgres RLS (`tenant_id = current_setting('app.current_tenant')`),
2. a repository/data-access layer that **refuses any tenant-scoped query without an injected tenant context**,
3. tenant-prefixed cache keys and tenant-prefixed storage paths with signed URLs,
4. **automated cross-tenant access tests in CI** asserting one tenant can never read another's rows.

**Tenant resolution:** server-side only — from a verified JWT claim or the request hostname/custom domain in middleware, validated against the `tenants` table for existence/active status **before any data access**. Never trust a client-supplied `X-Tenant` header (acceptable only for the public donation widget, and only after server-side validation). Use non-guessable tenant/resource IDs.

**Branding = design tokens, strict base + override.** Model brand as a small bounded token set (primary/accent colors, typography, logo, favicon). Cap the override surface to that documented "safe set"; everything else (custom layouts, bespoke CSS) goes behind a deliberate, documented escape hatch. This directly prevents the most-cited white-label failure: token sprawl from ~12 to 200+. Apply tokens at runtime via CSS custom properties so churches rebrand without a redeploy; keep the shared component library free of any per-church values.

**White-label every system artifact:** transactional emails, donation receipts/giving statements (PDF), SMS, and error/maintenance pages must be per-tenant templated and carry the church's brand — not Churchix's.

**Operational guardrails:** per-tenant rate limiting + resource quotas (noisy-neighbor containment — a viral sermon shouldn't degrade other tenants); per-tenant usage monitoring; documented **onboarding** (automated provisioning of config + theme + content models) and **offboarding** (immediate access revocation + scheduled data purge — critical given the sensitive member/financial data churches hold).

Domain reference: **Subsplash** for the multi-campus/multi-site model (per-campus pages, location-specific service times, per-campus giving funds under one umbrella).

---

## 3. Astro + React monorepo & content architecture

**Decision: npm workspaces monorepo, Astro static-first with React islands, shared `@churchix/ui` package consumed via `"@churchix/ui": "*"`.**

### Layout
```
apps/        # one deployable Astro site per tenant (or one SSR app for runtime multi-tenancy — see below)
packages/    # shared internal libs (@churchix/ui, @churchix/schemas, @churchix/config)
services/    # the Fastify API
package.json # root: "workspaces": ["packages/*", "apps/*", "services/*"]
```
Root holds a single `package-lock.json`, a pinned Node version (`.nvmrc`), and a base `tsconfig` + base `astro.config`. Drive tasks with workspace flags: `npm run dev -w apps/church-a`, `npm run build --workspaces --if-present`.

**Turborepo: defer.** With a handful of mostly-independent sites, npm workspace scripts are sufficient — adopt Turborepo only once CI is slow or you have many packages and want cached incremental builds. (npm workspaces has **no** built-in "changed packages" filter; that is the main reason you would reach for Turborepo or `nx` later.) **Changesets: skip** unless you publish shared packages to a registry (internal `*` consumption doesn't need it).

### Shared `@churchix/ui` package
Exports both `.astro` (static) and `.tsx` (React) components, shared layouts, theme tokens CSS, and a base `astro.config`. Shared **Zod schemas** live in `@churchix/schemas`. Critical caveats:
- Keep `react`/`react-dom` as **peerDependencies** in `@churchix/ui` — duplicate React copies break hydration/hooks.
- Every consuming app must itself register `@astrojs/react` (the integration is per-app, not inherited) and any integrations the shared `.astro` components rely on (mdx, etc.), since shared `.astro` compiles in the consumer's build.
- Brand differences via **CSS variables**, never by forking components.
- A shared `astro.config.base.ts` merged per app via `mergeConfig(base, { site, integrations, adapter })`.

### Islands strategy (performance contract)
Static Astro by default — ship HTML, hydrate only interactive bits:
- **Static `.astro`:** layouts, headers/footers, sermon lists, marketing/content pages.
- **`client:load`:** above-the-fold interactivity (nav menu, primary donate CTA).
- **`client:idle`:** secondary widgets (newsletter signup).
- **`client:visible`:** below-the-fold (event calendar, map, goal thermometer).
- **`client:only="react"`:** browser-only APIs.
- **`server:defer`** (server islands): per-request fragments (logged-in greeting) on otherwise static pages.

### Content architecture (Astro 5 Content Layer)
- **One source of truth for schemas:** export Zod-based `defineCollection` schemas from `@churchix/schemas`; every tenant's `content.config.ts` imports the same schemas → consistent frontmatter (Sermon, Event, Staff, Ministry, Page, plus a `site` collection for branding/config) across all sites.
- **For headless/remote CMS content,** implement custom **Loaders** (the `Loader` interface with `load(context)`, `store`, `meta` for incremental sync, `parseData`) to pull each tenant's content at build time. Use **Live Collections** (`src/live.config.ts`) only on SSR routes needing fresh per-request data.

### Build & deploy — the key architectural fork
Two viable models; **pick based on whether custom-domain-per-church at scale is core**:
- **(A) Static per-tenant build (default, simplest):** each church is its own SSG build, CDN-hosted (Cloudflare Pages is cheapest at scale for many low-traffic sites; Netlify/Vercel also fine). Opt individual routes into on-demand rendering (`export const prerender = false`) only for dynamic bits (donation checkout, contact form handler, member portal). In CI, build only changed apps so adding tenants doesn't linearly grow build time (requires a changed-package filter — Turborepo/`nx`/a git-diff script, since npm workspaces lacks one).
- **(B) Single SSR app, runtime multi-tenancy:** `output: 'server'` + middleware resolving the tenant from `Astro.request` host, selecting theme/config per request. Choose this if per-build static output isn't viable (hundreds of churches, frequent content changes, true white-label custom-domain routing under one deployment).

**Recommendation:** start with **(A) static-first** for the marketing/content surface (it's the bulk of every church site and the cheapest, fastest, most cacheable), and treat the giving widget + donor portal as on-demand routes calling the Fastify API. Migrate the content shell to **(B)** only if onboarding volume makes per-build static impractical. This is the one place researchers leave a genuine tradeoff — flag it for the product owner (see §6).

---

Sections 4 to 6 (the donations API, the giving feature set and data model, and the open questions) continue in [research-brief-giving](research-brief-giving.md).
