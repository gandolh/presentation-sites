---
summary: Archive, part two of the original research brief, kept verbatim. The Fastify donations API and payment-provider pick (§4), the giving feature set and PostgreSQL data model (§5), and the ten owner questions (§6). Read §4 and §5 as the optional single-tenant backend, with tenant_id dropped.
updated: 2026-10-07
---
# Churchix research brief, part two: giving

Part two of the original research brief, kept verbatim. Part one, with the note on the decisions taken since, is [research-brief](research-brief.md). Since then the backend became an optional, single-tenant, per-church add-on: read §4 and §5 with `tenant_id` dropped, as [optional-backend](optional-backend.md) does.

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
