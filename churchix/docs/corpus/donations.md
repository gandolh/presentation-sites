---
title: Donations & campaigns
summary: The server-light v1 giving stack (IBAN, Form 230, SMS, pomelnice, hosted card) and Romania-specific rules.
status: stable
updated: 2026-05-29
related: [optional-backend, content-model, traditions, research-brief]
---
# Donations & Campaigns

The giving stack. For rationale see [research-brief §4–5](research-brief.md); for how it fits see [architecture](architecture.md).

> **Model: per-church and server-light.** Each church is an independent static site, so v1 giving needs **no backend**: IBAN + Form 230 + SMS info is static; card giving is an optional hosted **Stripe Payment Link / Netopia** URL the church configures; the **pomelnice** form POSTs to a church-chosen endpoint. Everything below about a Fastify API, webhooks, recurring billing, and the relational data model describes an **optional, per-church, single-tenant** backend a church can add later — it is **not** a shared service and **not** required for v1.

## Principles

- **Webhooks / IPN are the source of truth** for payment state — never the browser redirect.
- **Card data never touches our servers.** Use hosted/tokenizing fields everywhere → stay PCI **SAQ A**.
- **Money is always integer minor units + explicit currency.** No floats, ever.
- **Every gift rolls into one donor record** — including staff-entered cash/check, so totals and statements are complete.
- **Each church gets paid into its own merchant account** (recommended) — Churchix orchestrates, doesn't hold funds. See [decisions](decisions.md) Q3.

## Channels (rails)

| Rail | Use | Notes |
| --- | --- | --- |
| **Stripe** (primary) | Card, wallets, SEPA; recurring via Billing; Connect for per-tenant payout | SCA/3DS built in (mandatory in EU); best DX; nonprofit fee discount where eligible |
| **Netopia mobilPay** (secondary) | RON-native card giving, local trust | v2 token API; hosted-redirect + IPN; each church needs its own merchant account; self-managed recurring |
| **PayPal** | Diaspora donors | Add as a method, not the primary RON acquirer |
| **SEPA Direct Debit** | Cheap recurring / standing orders | Mandate capture + delayed-failure reconciliation |
| **SMS micro-donation** | 2 EUR via Vodafone/Telekom/Orange | RO-expected for big capital projects |
| **IBAN bank transfer** | Universal baseline | Especially Orthodox/Greek-Catholic; display RON/EUR/USD accounts |

All providers sit behind the `PaymentGateway` interface (see [architecture](architecture.md)) so a tenant can use Stripe, Netopia, or both.

## Donation feature set

- One-time + **recurring** (weekly, biweekly, twice-monthly, 1st/15th, monthly, quarterly, annual, custom).
- **Designated funds** — split one gift across multiple funds; target a fund or project.
- **Cover-the-fees** toggle so the church nets 100%.
- Saved payment methods / one-tap repeat; **text-to-give** (RO SMS).
- **Self-serve donor portal** — history, edit/pause/resume/cancel recurring, update payment info (reduces churn).
- **Anonymous** gifts (count toward totals, hidden from public feeds); tribute/memorial gifts.
- Auto per-gift receipts + consolidated **annual giving statements** (PDF).
- **Offline/cash & check entry** by staff into the donor record.
- **RO-specific:** Form 230 generation, SMS micro-donation, IBAN display.
- **Orthodox-specific:** **pomelnice** submission (living/departed names + small offering) as a giving sub-flow.

## Campaign feature set

- Goal + optional start/end; **live goal thermometer**; auto status transition on deadline.
- **Pledges** (commitment vs immediate gift; show given / pledged / goal).
- Per-campaign fund designation; recurring gifts tied to a campaign.
- **Peer-to-peer** (supporter pages + team leaderboards) and **matching/challenge** multipliers — both are RO market gaps and strong differentiators.
- Campaign updates (photo/video/text), donor/recognition wall (anonymous opt-out), shareable URLs + QR codes.
- Admin reporting/export: pledge fulfillment %, recurring vs one-time, donor contacts.

## Conversion practices to bake into the widget

- Pre-select **recurring (monthly)** as default, one-time clearly available (~35% lift).
- 4–5 suggested amounts + custom, with a highlighted default tier.
- Concrete impact messaging ("X lei provides Y").
- Minimal required fields (~39% higher conversion); mobile-first single column; digital wallets; immediate receipt.

## One-time donation flow (card)

1. `POST /api/v1/tenants/:tenant/donations` → `{ amountMinor, currency, campaignId?, fundDesignation?, donor, isAnonymous, coverFees? }`.
2. Insert `donations` row `status='pending'`; create the provider intent on the church's **connected account** with an **idempotency key = donation id** and metadata `{ tenantId, donationId, campaignId, fundDesignation }`.
3. Return `client_secret` (Stripe Payment Element) or a hosted Checkout/redirect URL.
4. Donor pays on hosted/tokenized UI (card data never reaches us).
5. **Webhook / IPN** flips status to `succeeded`, records fee/net, **transactionally increments** campaign progress, enqueues the receipt.

Netopia/local: build a signed start request → redirect to gateway-hosted page → reconcile from the **asynchronous IPN** (authoritative; the return URL is UI only).

## Recurring giving

- **Stripe Billing** (preferred): Customer + recurring Price + Subscription; Stripe handles renewals, SCA off-session retries, **Smart Retries/dunning**, hosted **Customer Portal**. Donor-chosen amounts → create a per-donor Price (Checkout "pay-what-you-want" does **not** support recurring). Each renewal inserts a child `donations` row.
- **Local gateways:** you own the **scheduler**, `next_charge_at`, dunning, and card-expiry handling. Strong reason to keep Stripe primary for recurring; consider restricting v1 recurring to Stripe (Q5).

## Webhooks (mandatory)

- Verify against the **raw body** — register a raw-body parser **scoped to the webhook subtree only**; routes live **outside** the JWT subtree.
- **Stripe:** `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Dedupe on `event.id` via a **UNIQUE** row in `processed_webhook_events`; write the idempotency record **and** the business mutation in the **same transaction**. Offload receipts/CRM sync to BullMQ.
  - Handle: `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`, `charge.dispute.created`.
- **Netopia IPN:** verify/decrypt per protocol, ACK as required, idempotent. **EuPlătesc/PayU/xMoney:** recompute HMAC, compare with `crypto.timingSafeEqual`.

## Data model (optional per-church backend only)

v1 churches are static and store nothing — campaign goal/raised are content fields (manually updated), and donations happen on hosted payment pages. The relational data model, the `PaymentGateway` abstraction, and webhook handling apply **only** to a church that deploys the optional, single-tenant backend, and they live on their own page: [optional-backend](optional-backend.md). Conventions still hold: **money = integer minor units + explicit currency**; webhooks are the source of truth.

## Romania-specific giving

- **Form 230** — individuals redirect up to **3.5%** of income tax to a church/NGO. Deadline ~**25 May**, valid up to 2 years. First-class channel; consider in-platform pre-filled PDF generation (Q8).
- **Form 107 sponsorship** — companies, up to **20%** of corporate income tax; requires a signed sponsorship contract.
- **SMS micro-donations** — 2 EUR via Vodafone/Telekom/Orange.
- **IBAN** — display RON/EUR/USD accounts; universal baseline.
- **Pomelnice** — submit living/departed names with a small offering; Orthodox-only.

## Compliance

- **PCI SAQ A** — hosted/tokenized fields only; store tokens/last4/brand/expiry, **never PAN/CVV**.
- **GDPR + Romanian Law 190/2018** — each church = controller, Churchix = processor → **sign DPAs**. Lawful bases: consent (marketing), contract/legitimate interest (the gift), legal obligation (tax retention). Timestamped consent; honor erasure except where accounting retention overrides; EU data residency; SCCs for non-EU transfers (Stripe DPA); 72h breach notification.
- **Romanian tax/accounting** — ~5-year financial-record retention; **per-tenant sequential receipt numbering**; annual statements generated only after the confirming webhook. Confirm **e-Factura / SAF-T** applicability per tenant with their accountant (Q7).
