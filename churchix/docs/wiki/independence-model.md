---
title: Independence model (not multi-tenancy)
summary: Why each church is a fully independent deployment with nothing shared at runtime.
status: stable
updated: 2026-05-29
related: [architecture, overview, optional-backend, decisions]
---

# Independence model (instead of multi-tenancy)

There is **no multi-tenancy** in Churchix — that's the defining decision (see [decisions](decisions.md) → Decided 2026-05-29). The research brief originally recommended a pooled shared-schema multi-tenant backend ([research-brief §2](research-brief.md)); that was **rejected** in favor of total independence. Isolation is absolute because nothing is shared at runtime.

## What "independent" means

- **One app, one deployment, one owner per church.** No `tenant_id`, no Row-Level Security, no shared database, no tenant resolution. A church cannot leak into another because they don't share a process or a datastore.
- **The only shared thing is code** — the `@churchix/*` packages, consumed as `"@churchix/ui": "*"` workspace links. A change there must work for every church by token swap alone.
- **Branding stays church-local:** tokens live in each app's `site` content entry, emitted as CSS custom properties at build time. `@churchix/*` packages hold **no** church values. See [design-system](design-system.md).
- **Secrets are per-app:** each church's env holds its own payment URLs / form endpoints / keys. Nothing central knows them.
- **Adding a church** = a new directory under `apps/` (copy an existing one). **Removing a church** = delete the directory and its deployment.

## Consequences

- Giving is **server-light** by default — no backend required for v1 (see [donations](donations.md)).
- If a church needs server logic (live totals, recurring, webhooks), it adds its **own** single-tenant backend; this never becomes a shared service (see [optional-backend](optional-backend.md)).
- Cross-church operations tooling, if ever needed, would be a *separate* product reading each church's public data — it would not change this model.

## Tradeoff vs. the rejected multi-tenant model

The brief's case for multi-tenancy was white-label economics at scale (one deployment, central patching). We accept the opposite tradeoff: **maximum isolation and per-church autonomy** at the cost of per-app deploys. The maintainability risk (theme drift, site-by-site patching) is contained by keeping *all* real structure in `@churchix/*` and apps thin (tokens + content + config only). If per-build CI cost grows with church count, introduce Turborepo (deferred) — see [architecture](architecture.md).
