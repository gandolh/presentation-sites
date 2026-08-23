---
title: Research brief (archive)
summary: The original six-stream research brief — retained verbatim as rationale; read §2/§4/§5 through the decisions that superseded them.
status: archive
updated: 2026-05-29
related: [overview, architecture, independence-model, donations, optional-backend, decisions]
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

## 4. Fastify donations/campaigns API + payment provider pick

**Decision: Fastify (TypeScript) with autoload-based structure; Stripe as the primary processor + a Romanian local gateway (Netopia) as a parallel rail; SMS giving and IBAN/Form 230 as first-class non-card channels.**

### API structure
- `buildApp()` in `src/app.ts` (testable via `inject`), `listen()` separate in `server.ts`.
- `@fastify/autoload`: **plugins** loaded with `encapsulate: false` + wrapped in `fastify-plugin` (db/Prisma or pg pool, `@fastify/jwt`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/sensible`, `@fastify/swagger`, `@fastify/env`, payment clients, tenant resolver). **Routes** loaded **without** `fastify-plugin` so each folder is encapsulated and derives its prefix (`routes/v1/campaigns` → `/v1/campaigns`).
- **JSON-Schema + types from one source:** Ajv validation on body/query/params/headers + response serialization (prevents field leakage), with `json-schema-to-ts` / TypeBox type provider so one schema yields runtime validation **and** compile-time types. Shared `$ref` definitions for `Money {amountMinor:int, currency:enum}`, pagination, error envelopes.
- **Auth (multi-tenant), composed via `@fastify/auth`:** `@fastify/jwt` verified in an **`onRequest`** hook (not `preHandler` — so unauthenticated requests never parse a body, avoiding memory abuse); JWT carries `sub`, `tenantId`, `role`. Hashed per-tenant API keys for the embedded widget / M2M. A `fastify-plugin` sets `request.tenantId` from the verified claim or validated host, decorating a tenant-scoped DB accessor. Pair app-level `WHERE tenant_id` with `SET app.current_tenant` per transaction for RLS.
- **Webhook routes live OUTSIDE the JWT subtree** — they authenticate by provider signature.
- `pino` structured logging with `requestId` + `tenantId`; `@fastify/under-pressure` for load shedding.

### Donation flow (PaymentIntent/Checkout — never store card data)
1. `POST /api/v1/tenants/:tenant/donations` with `{amountMinor, currency, campaignId?, fundDesignation?, donor, isAnonymous, coverFees?}`.
2. Create `Donation` row `status='pending'`; create Stripe PaymentIntent/Checkout Session on the church's **connected account** with an **idempotency key (= donation id)** and metadata `{tenantId, donationId, campaignId, fundDesignation}`.
3. Return `client_secret` (Payment Element) or Checkout URL. **Card data never touches our servers** → PCI **SAQ A**.
4. **Source of truth = webhook**, not the browser redirect. `payment_intent.succeeded`/`checkout.session.completed` flips status to `succeeded`, records charge/fees/net, increments campaign progress, triggers receipt.

For **Netopia/local gateways**: hosted-redirect flow — server builds a signed/encrypted start request, redirects donor to gateway-hosted page, and reconciles state from the **asynchronous IPN** (authoritative), never the return URL (UI only).

### Recurring giving
- **Stripe Billing** (preferred, lowest effort): Customer + recurring Price + Subscription; Stripe handles renewals, SCA/off-session retries, **Smart Retries/dunning**, and a **hosted Customer Portal** for self-serve. Use `SetupIntent` to save a method off-session. **Caveat:** Checkout "pay-what-you-want" does **not** support recurring — for donor-chosen recurring amounts, create a per-donor Price via Billing. Each renewal inserts a child `Donation` row.
- **Romanian gateways** (Netopia v2 token-based, EuPlătesc, PayU, xMoney): you **own the scheduler, `next_charge_at`, dunning, and card-expiry handling** — capabilities Stripe Billing gives for free. This is a strong reason to keep Stripe primary for recurring.

### Webhooks (mandatory: signature verification + idempotency)
- **Raw body:** verify signatures against exact raw bytes — register `fastify-raw-body` or a buffer content-type parser **scoped to the webhook subtree only**.
- **Stripe:** `stripe.webhooks.constructEvent(rawBody, sig, secret)` (never hand-roll HMAC). At-least-once delivery + retries → **dedupe on `event.id` with a UNIQUE constraint** in `processed_webhook_events`, writing the idempotency record **and** the business mutation in the **same DB transaction**. Offload receipts/CRM sync to a background queue (BullMQ). Handle: `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`, `charge.dispute.created`.
- **Netopia IPN:** decrypt/verify per their protocol, ACK as required, idempotent. **EuPlătesc/PayU/xMoney:** recompute HMAC, compare with `crypto.timingSafeEqual`.

### Payment provider pick (opinionated)
**Primary: Stripe.** Best DX, PaymentIntents (SCA/3DS built in — mandatory in EU), Billing (recurring + dunning + portal), **Connect for per-tenant payouts** (low/zero cross-border payout fee within EEA — directly enables paying each church's own connected account), SEPA + cards + wallets, and a **nonprofit fee discount** for eligible orgs. Romania is fully supported (RON/EUR, RO IBAN payouts).

**Parallel local rail: Netopia mobilPay** (use v2 JSON/token API). Romania's largest processor; RON-native, local brand trust, broad local methods. Tradeoff: no Connect-style payout split (each church needs its own merchant account) and you self-manage recurring.

**Why both:** Stripe wins on engineering and recurring/Connect; Netopia wins on local-donor trust and RON-native flows. Romanian donors often trust local brands; diaspora donors trust Stripe/PayPal. Architect the `PaymentGateway` interface so a tenant can use Stripe, Netopia, or both.

**Supporting rails:** **PayPal** (diaspora trust, instant recognition — add as a method, not the primary RON acquirer); **SEPA Direct Debit** (cheap recurring/standing-order giving, but mandate capture + delayed-failure reconciliation); **SMS micro-donation** integration (Vodafone/Telekom/Orange — RO-expected, especially for big capital projects); **IBAN bank transfer** display (universal baseline, especially Orthodox/Greek-Catholic). EuPlătesc/PayU/xMoney are viable local alternates but don't displace the Stripe + Netopia pairing.

### Security & compliance
- **PCI:** stay **SAQ A** by using hosted/tokenizing fields everywhere (Stripe Elements/Checkout, gateway-hosted redirects). Store only tokens, last4, brand, expiry — **never PAN/CVV**. Self-hosting any card field drops you into SAQ A-EP (~191 controls) — avoid.
- **GDPR + Romanian Law 190/2018 (ANSPDCP):** each church = controller, Churchix = processor → **sign DPAs**. Lawful basis: consent (marketing), contract/legitimate interest (processing the gift), legal obligation (tax/accounting retention). Store timestamped consent; honor erasure **except** where accounting-retention law overrides; EU data residency where feasible; SCCs for any non-EU transfer (Stripe DPA). 72h breach notification.
- **Romanian tax:** ~5-year retention of financial records; **per-tenant sequential receipt numbering**; annual consolidated giving statements (PDF) generated only after the confirming webhook. Confirm **RO e-Factura / SAF-T** applicability per tenant (donations vs invoiced services differ — involve the tenant's accountant). Support **Form 230** (3.5% redirect) and **Form 107 sponsorship contracts** (corporate, up to 20%).

---

## 5. Donations & campaigns feature set + data model

### Feature set (consensus from giving-platform research)
**Donations:**
- One-time + recurring with flexible schedules (weekly, biweekly, twice-monthly, 1st/15th, monthly, quarterly, annual, custom).
- **Designated funds** — split a single gift across multiple funds; per-fund/per-project targeting (this is core, not optional, for evangelical churches).
- **Cover-the-fees** toggle so the church nets 100%.
- Saved payment methods / one-tap repeat giving; **text-to-give** (adapt to RO SMS giving).
- **Self-serve donor portal:** giving history, edit/pause/resume/cancel recurring, update payment info (key for reducing recurring churn).
- Anonymous gifts (still increment totals, hidden in public feeds); tribute/memorial gifts.
- Auto per-gift receipts + consolidated annual giving statements (email or mail, joint for households).
- **Offline/cash & check entry** by staff so all gifts roll into one donor record — essential for the cash-heavy Orthodox/Romania baseline.
- **RO-specific:** Form 230 generation, SMS micro-donation, IBAN display.
- **Orthodox-specific: pomelnice submission** (living/departed names + small offering) as a giving sub-flow.

**Campaigns:**
- Goal + optional start/end dates; **live goal thermometer**; status auto-transition on deadline.
- Pledges (commitment separate from immediate gifts; show given vs pledged vs goal).
- Per-campaign fund designation; recurring gifts tied to a campaign.
- **Peer-to-peer** (supporter pages with own photo/story/goal + team leaderboards) and **matching/challenge** multipliers — both are product gaps in the current RO market and strong differentiators.
- Campaign updates (photo/video/text), donor/recognition wall (with anonymous opt-out), shareable URLs + QR codes.
- Admin reporting/export: pledge fulfillment %, recurring vs one-time, donor contacts.

**Conversion best practices to bake into the widget:** pre-select recurring (monthly) as default with one-time clearly available (~35% lift); 4–5 suggested amounts + custom, with a highlighted default tier; concrete impact messaging ("X lei provides Y"); minimal required fields (~39% higher conversion); mobile-first single-column with digital wallets; immediate receipts.

### Data model (PostgreSQL, shared-schema + `tenant_id` everywhere + RLS)

Core tables (consensus of the Fastify and giving-platform models):

- **`tenants`** — id (uuid), name, slug/subdomain, status, country, default_currency, settings (jsonb). RLS anchor: `tenant_id = current_setting('app.current_tenant')`.
- **`tenant_payment_accounts`** — tenant_id, provider (`stripe|netopia|euplatesc|payu|xmoney|sepa`), provider_account_id (e.g. Stripe Connect `acct_`), credentials_ref (**pointer to secret manager, never raw keys**), status, is_default. Lets each church use its own merchant account for direct payout.
- **`users`/`admins`** — tenant_id, email, auth, role (`owner|admin|finance|viewer`). Platform super-admins kept separate.
- **`donors`** — tenant_id, email, name, phone, address (for receipts/e-Factura), gdpr_consent + consent_at, marketing_opt_in, external_provider_customer_ids (jsonb). PII minimized, erasable.
- **`funds`** — tenant_id, name, code, active. Per-tenant lookup for restricted giving.
- **`campaigns`** — tenant_id, slug, title, description, goal_amount_minor, currency, start_at, end_at, status (`draft|active|paused|completed|archived`), visibility (`public|unlisted|private`), fund_id, **denormalized `raised_amount_minor` + `donor_count`**, cover_image.
- **`donations`** (immutable ledger / source of truth) — tenant_id, donor_id, campaign_id?, fund_id?, subscription_id?, amount_minor, currency, fee_minor, net_minor, cover_fees, status (`pending|succeeded|failed|refunded|disputed`), provider, provider_payment_id, idempotency_key, is_anonymous, receipt_id?, created_at, succeeded_at. Indexes: `(tenant_id,campaign_id)`, `(tenant_id,donor_id)`, **UNIQUE `(provider, provider_payment_id)`**.
- **`donation_allocations`** — donation_id, fund_id, amount_minor. Supports splitting one gift across funds.
- **`subscriptions`** — tenant_id, donor_id, campaign_id?, fund_id?, provider, provider_subscription_id / token ref, amount_minor, currency, interval, status (`active|past_due|paused|canceled`), current_period_end, **`next_charge_at`** (for self-managed RO gateways), mandate_ref.
- **`pledges`** — tenant_id, donor_id, campaign_id, promised_amount_minor, schedule, fund_id, fulfillment_status. Donations pay it down.
- **`payment_methods`** — tenant_id, donor_id, provider, provider_token_id, brand, last4, exp_month/year. **No PAN ever.**
- **`receipts`** — tenant_id, donation_id (or aggregate for annual), **per-tenant sequential receipt_number**, issued_at, pdf_ref, total_minor, currency.
- **`processed_webhook_events`** — provider, **UNIQUE provider_event_id**, event_type, received_at, payload_hash. Insert in same txn as the state change.
- **`refunds`/`disputes`** — linked to donations, reverse campaign progress.
- **`audit_log`** — actor, tenant_id, action, entity, before/after, at. GDPR + financial audit.
- **(Peer-to-peer)** **`fundraisers`/`teams`** — under a campaign, own page/goal, donations attributed to them.

**Conventions:** UUIDs or ULIDs (sortable); **money always integer minor units + explicit currency**; campaign progress maintained by **transactional increment** on `succeeded` (decrement on refund/chargeback), never recomputed by scanning donations at read time, with optional nightly reconciliation against the immutable ledger.

---

## 6. Open questions for the product owner

These shape v1 scope and the central architecture fork. Tracked in [decisions](decisions.md).

1. **Target tradition priority** — lead with evangelical (donation-ready, easier monetization) or Orthodox/Greek-Catholic (larger TAM, bigger giving gap, pomelnice/liturgical features, slower adoption)?
2. **Static-per-build vs single SSR app (§3)** — expected church count in year 1, and do churches get **custom domains** (not just subdomains)?
3. **Who holds the funds?** — each church onboards its own Stripe Connect / Netopia merchant account (cleanest), or Churchix aggregates and disburses (heavier KYC / money-transmission exposure)? Strongly recommend the former.
4. **Stripe vs Netopia default rail per tenant** — default everyone to Stripe with Netopia opt-in, or choose at onboarding?
5. **Recurring on local gateways — build or defer?** — restrict v1 recurring to Stripe and treat local gateways as one-time only?
6. **Pomelnice scope** — v1 differentiator or later module?
7. **e-Factura / SAF-T obligations** — do tenant donation flows trigger reporting? Needs a tax advisor.
8. **Form 230 / Form 107 depth** — generate pre-filled PDFs/contracts in-platform, or just host/link them?
9. **i18n ownership** — platform base strings + per-church overrides, or fully church-managed? Confirm launch language set.
10. **ChMS scope boundary** — stay website-+-giving, or expand toward membership/small-groups/check-in (Tithe.ly / Planning Center / Subsplash territory)?
