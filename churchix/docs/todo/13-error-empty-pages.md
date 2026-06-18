# 13 — 404 / error / empty-state pages, white-labeled

**Tier:** C · **Depends on:** 05, 06 · **Parallel with:** 07–12

## Goal

Provide white-labeled **404**, generic **error**, and reusable **empty-state** pages so every church site degrades gracefully in its own brand — never Churchix's.

## Context

- ADR-0001/0002 inventory calls for "404/error pages — all white-labeled to the church brand."
- These share the global Header/Footer chrome (item 06) and the `EmptyState`/`Alert` primitives (item 05).
- Astro 404: a `src/pages/404.astro` per app (or a shared layout in `@churchix/ui` the apps re-export). Keep per-church wiring trivial.

## Tasks

1. Build a shared `ErrorLayout`/`NotFound` composition in `@churchix/ui` (uses BaseLayout chrome + EmptyState): reverent, on-brand copy ("Pagina nu a fost găsită"), an `church`/`diversity_1` style illustration via the divider/icon set, and a "Înapoi la pagina principală" button.
2. Add `404.astro` (and a generic error page if the host/adapter supports it) to **both** apps, importing the shared composition. Keep church-specific text in content where reasonable, defaults in the component.
3. Ensure the `EmptyState` primitive (item 05) is used consistently anywhere a list can be empty (announcements, campaigns, schedule) — document the pattern so other items reuse it.

## Acceptance criteria

- [ ] 404 renders with the church's brand chrome + tokens, reverent copy, home CTA.
- [ ] Generic error path (if available for the deploy target) is covered or explicitly noted as N/A for static-only.
- [ ] Empty-state pattern documented and reused by list pages.
- [ ] Re-skins by token; build + typecheck pass in both apps.
