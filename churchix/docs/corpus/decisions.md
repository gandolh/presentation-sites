---
title: Decisions & open questions
summary: Settled product/architecture decisions (Decided section) and the questions still open for the product owner.
status: living
updated: 2026-05-29
related: [overview, architecture, independence-model, donations]
---
# Open Questions — decisions needed from the product owner

These shape v1 scope and the central architecture fork. Each notes the recommendation and why it matters. Update this file as decisions land (move resolved items to a "Decided" section with the date).

| # | Question | Why it matters | Recommendation |
| --- | --- | --- | --- |
| 1 | **Target tradition priority** — lead with evangelical or Orthodox/Greek-Catholic? | Sets v1 feature ordering and giving emphasis. Evangelical = donation-ready, easier monetization. Orthodox = larger TAM + bigger giving gap, but needs pomelnice/liturgical calendar and adopts slower. | Decide explicitly; it reorders the roadmap. |
| 2 | **Static-per-build vs single SSR app** | The central frontend architecture fork. Depends on year-1 church count and whether churches get **custom domains** (not just subdomains). | Start static-per-build (A); migrate to SSR (B) only if onboarding volume demands it. |
| 3 | **Who holds the funds?** | Each church's own Stripe Connect / Netopia merchant account (clean payouts, minimal regulatory burden) vs Churchix aggregating and disbursing (heavy KYC, money-transmission exposure). | Each church onboards its **own** merchant account. |
| 4 | **Default payment rail per tenant** | Stripe-default with Netopia opt-in, or choose at onboarding? | Default Stripe; offer Netopia opt-in (local trust). |
| 5 | **Recurring on local gateways — build or defer?** | Self-managed recurring on Netopia/EuPlătesc (own scheduler + dunning + expiry) is real engineering Stripe Billing gives for free. | v1: recurring on Stripe only; local gateways one-time. |
| 6 | **Pomelnice scope** | The clearest Orthodox differentiator (form + small offering + priest's admin list), but no Protestant analog. | v1 if Orthodox is a launch target (Q1); else a later module. |
| 7 | **e-Factura / SAF-T obligations** | Whether tenant donation flows trigger Romanian e-invoicing/reporting (donations vs invoiced services differ). | Confirm per tenant with a tax advisor before modeling receipts/invoices. |
| 8 | **Form 230 / Form 107 depth** | Generate pre-filled Form 230 PDFs and Form 107 sponsorship contracts in-platform, or just host/link them? | In-platform generation is a strong RO selling point — scope for v1.x. |
| 9 | **i18n ownership** | Platform-provided base strings + per-church overrides vs fully church-managed. Also confirm launch language set. | Platform base + per-church overrides; launch RO + EN, add IT/ES/DE per region. |
| 10 | **ChMS scope boundary** | Stay a website-+-giving platform, or expand toward membership / small-groups / check-in (Tithe.ly / Planning Center / Subsplash territory)? | Stay website-+-giving for v1; keep the data model open to expand. |

## Also to confirm

- **Brand name & domain** for the platform itself (working name: *Churchix*).
- **Hosting/region** choices (EU data residency assumed) — see [architecture](architecture.md).
- **Node version policy** — repo targets Node 22 LTS (`.nvmrc`), engines `>=20.11.0`; dev environment is Node 24.

## Decided (2026-05-29)

- **Architecture model: independent per-church platforms.** No central/multi-tenant backend, no shared database, no shared runtime. Each church is its own static Astro app, deployed and owned separately; the only shared thing is the `@churchix/*` packages. (Supersedes the multi-tenant shared-schema recommendation in the brief.)
- **Q1 — lead tradition: Orthodox.** v1 is designed for Orthodox parishes (liturgical tone, IBAN-first giving, Form 230, pomelnice). Greek-Catholic / Protestant stay possible later but are not the design target now.
- **Q2 — static-per-build.** Confirmed. No single SSR app.
- **Q3 (implied) — Churchix never holds funds.** Each church uses its own hosted payment URLs / accounts. Consistent with the independence model.
- **Q5 — recurring/server features deferred.** v1 giving is server-light (IBAN, Form 230, SMS, pomelnice form, optional hosted card link). A per-church Fastify backend is optional/future.

### Still open
Q4 (default rail per church), Q6 (pomelnice depth — basic form included in v1 scaffold; offering integration later), Q7 (e-Factura/SAF-T), Q8 (Form 230/107 PDF generation), Q9 (i18n ownership — currently per-church content), Q10 (ChMS scope).
