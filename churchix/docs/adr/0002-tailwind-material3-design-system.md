# ADR 0002 — Adopt Tailwind + a Material-3 token palette ("Ecclesia Digitalis")

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** Product owner; engineering
- **Supersedes:** [ADR-0001](0001-design-system-foundation.md)
- **Context docs:** [corpus/architecture.md](../corpus/architecture.md), [corpus/content-model.md](../corpus/content-model.md), [corpus/donations.md](../corpus/donations.md), [design system](../design/DESIGN.md)

## Context

ADR-0001 was written as a **brief for Stitch** (Google's AI UI design tool). It proposed a deliberately *bounded* token set ("the safe set" — ~10 CSS variables) rendered with **plain CSS**, to avoid token sprawl across many white-label church sites.

Stitch returned the **"Ecclesia Digitalis"** design system ([docs/design/DESIGN.md](../design/DESIGN.md) + four reference screens). It is concretely:

- **Tailwind-class-based** (the screens ship a `tailwind.config` block + `cdn.tailwindcss.com`).
- A **full Material-3 token palette** — ~50 color roles (`primary`, `on-primary`, `primary-container`, `secondary`, `surface`, `surface-container-{lowest…highest}`, `outline`, `outline-variant`, the `*-fixed` set, `error`, …), an M3 type scale (`display-lg`, `headline-lg`, `body-md`, `label-md`, `caption`), named spacing (`base/xs/sm/md/lg/xl/gutter/container-max`), and a radius scale.
- **Material Symbols Outlined** iconography.
- Layouts richer than the safe-set sketch: full-bleed hero with overlay, "bento" grids, pinned-announcement cards with a gold accent bar, tonal-layer depth, a custom cross/Byzantine divider, copy-to-clipboard IBANs.

This is materially more than ADR-0001's bounded plain-CSS set. We must decide whether to (a) down-port the design back into the safe set, or (b) accept the richer system.

## Decision

**Accept the Ecclesia Digitalis system as delivered: adopt Tailwind CSS as a build-time dependency and the full Material-3 token palette as the styling contract.** ADR-0001 is superseded.

The white-label discipline is *preserved*, just relocated:

1. **Tailwind is build-time, not the CDN.** Components in `@churchix/ui` use Tailwind classes resolved against a **single shared theme** (a preset/`@theme` exported from the package). No `cdn.tailwindcss.com` in shipped sites. (See TODO item 01.)
2. **The M3 palette is expressed as CSS custom properties** wired into the Tailwind theme (`bg-primary` → `var(--primary)`). (TODO item 02.)
3. **Churches still set only a small seed set** — `primary`, `secondary` (gold), `surface` (and optional `error`/fonts/radius) — via their `site` content entry. The remaining M3 roles (containers, `on-*`, variants) are **derived** in the base layer (`color-mix()` or documented defaults), *not* hand-set per church. This keeps the anti-sprawl spirit of ADR-0001: the *church-facing* surface stays tiny even though the *system* uses the full palette. (TODO items 02, 03.)
4. **Components never fork per church.** Re-skin = swap seed tokens. Bespoke layouts remain a deliberate escape hatch.
5. Everything else from ADR-0001 stands: Astro static-first + React islands, tradition-as-variant (Orthodox now, evangelical later by token swap), the component/page inventory, money-as-minor-units, mandatory i18n + Romanian diacritics, and WCAG AA.

## Consequences

**Positive**
- 1:1 fidelity to the approved design; fast path from `docs/design/` screens to implemented Astro/React components (see [docs/todo/](../todo/README.md)).
- Material-3 gives a complete, internally-consistent role system (states, containers, on-colors) for free — fewer ad-hoc decisions than hand-rolling derived states in plain CSS.
- Tailwind utility classes + shared theme keep the library terse and consistent across churches.

**Negative / costs**
- New build dependency (Tailwind) and a larger token vocabulary to learn than the ADR-0001 safe set.
- Risk of class sprawl in markup; mitigated by primitive components (TODO item 05) that encapsulate the common patterns.
- Self-hosting Material Symbols + fonts adds asset weight; mitigated by an `<Icon>` abstraction and subsetting (TODO item 04).
- The "churches set only seeds, roles are derived" rule must be enforced or the per-church surface re-sprawls — call it out in code review and `corpus/SCHEMA.md`.

**Follow-ups**
- Choose Tailwind v3 (`@astrojs/tailwind`) vs v4 (`@tailwindcss/vite`, CSS-first) — TODO item 01.
- Verify Source Serif 4 + Inter subsets fully cover Romanian diacritics + German umlauts — TODO item 04.
- Confirm the default Orthodox palette passes AA across primary/surface/secondary text combos — TODO items 02, 15.
- Keep the two reference apps as the white-label sanity check (distinct brands) — TODO item 14.

## Alternatives considered

- **Down-port to the ADR-0001 plain-CSS safe set.** Preserves zero build deps and the smallest possible token surface, but discards the delivered design's depth (M3 role system, tonal layers) and means re-deriving in CSS what M3 already gives. Rejected — re-does approved design work for marginal benefit.
- **Hybrid: map M3 into an expanded-but-bounded CSS-variable layer, no Tailwind.** Captures the look without a Tailwind dependency, but means hand-maintaining ~50 roles in CSS and forgoing utility-class velocity; the reference screens would have to be manually translated rather than referenced. Considered close; rejected in favor of staying faithful to the Tailwind-based output.
- **Tailwind CDN as shipped.** Simplest, but unacceptable: runtime dependency, no purging, no offline/self-host guarantee for independent church deploys. Rejected.
