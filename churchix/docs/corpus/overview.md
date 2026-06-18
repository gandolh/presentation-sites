---
title: Churchix overview
summary: What Churchix is — white-label church websites + giving for the Romanian market, v1 Orthodox.
status: stable
updated: 2026-05-29
related: [architecture, independence-model, traditions, design-system]
---

# Churchix overview

Churchix is a **white-label platform** that delivers **presentation websites for churches** plus a **giving** surface (donations + fundraising campaigns). A shared codebase and component/theme library back many sites, but **each church is an independent, self-hosted deployment** with its own branding, content, languages, and funds. The only shared thing is *code* — the `@churchix/*` packages. There is **no central multi-tenant backend**. See [independence-model](independence-model.md).

## Market & focus

- **Target market:** Romanian churches in Romania **and** the diaspora (US, Canada, UK, Italy, Spain, Germany).
- **v1 design target: the Orthodox tradition** — formal/liturgical tone, IBAN-first giving, [Form 230](donations.md), and Orthodox-specific features (pomelnice, sacrament info). The architecture stays open to Greek-Catholic and Protestant/evangelical churches later, but Orthodox is the design target now. See [traditions](traditions.md).

## Pillars

- **Presentation site** — home, service schedule (the most-used page), announcements, about/history, livestream/sermons, gallery, events, contact. See [content-model](content-model.md).
- **Giving** — IBAN, Form 230, SMS, pomelnice, and optional hosted card link; an optional per-church backend for recurring/webhooks/live totals. See [donations](donations.md) and [optional-backend](optional-backend.md).
- **White-label branding** — per-church design tokens only; components never fork. The design system is [design-system](design-system.md).

## How it's built (one-paragraph version)

A **monorepo (npm workspaces)** of shared `@churchix/*` packages and one Astro app per church. Frontend is **Astro static-first with React islands**; content is **Astro Content Collections** validated by **shared Zod schemas** in `@churchix/schemas`. Each church builds to **static HTML on a CDN**, deployed independently. Full detail in [architecture](architecture.md).

## Where decisions live

- Settled product/architecture decisions and what's still open: [decisions](decisions.md).
- The research that grounds it all: [research-brief](research-brief.md).
- Working brief for contributors/agents: [CLAUDE.md](../../CLAUDE.md).
