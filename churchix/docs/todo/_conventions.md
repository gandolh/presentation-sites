# Conventions every TODO item must honor

Cross-cutting rules. If a work item contradicts these, the rule wins — note the conflict in `docs/wiki/log.md` rather than silently diverging.

## Architecture (from [CLAUDE.md](../../CLAUDE.md) + [wiki](../wiki/index.md))

- **White-label, not multi-tenant.** Shared code only (`@churchix/*`). Components must look like *each church's* brand, never Churchix's. No church name, color, or copy hardcoded in `packages/*`.
- **Branding enters only as tokens.** Per-church values arrive as CSS custom properties emitted by `BaseLayout` from the church's `site` content entry. Never read church data inside a shared component except via props/tokens.
- **Astro static-first + React islands.** Default to `.astro` (zero JS). Hydrate only genuinely interactive bits (mobile nav, pomelnice form, copy-to-clipboard, goal thermometer with live totals) via `client:*`. React is a `peerDependency` of `@churchix/ui` — never bundle two copies.
- **Independent per-church deploys.** Nothing central. A change in `@churchix/ui` must work for every church by token swap alone.

## Styling (from [ADR-0002](../adr/0002-tailwind-material3-design-system.md))

- **Tailwind + Material-3 tokens.** Use the M3 palette/typography/spacing from [DESIGN.md](../design/DESIGN.md). Reference the reference screens for class usage, but **do not** copy `cdn.tailwindcss.com` — Tailwind is a build-time dependency (see item 01).
- Brand-driven colors come from CSS variables (`--primary`, `--secondary`, `--surface`, …) wired into `tailwind.config`. **No raw hex in components** — always go through a token.
- Radius / spacing / type scales use the named tokens (`rounded-lg`, `px-gutter`, `text-headline-lg`, `font-display-lg`). No magic numbers where a token exists.
- Keep the **"Digital Iconostasis"** restraint: tonal layers + 1px outlines over heavy shadows; gold (`secondary`) is a *sparing accent*, never body text on light.

## Content & i18n

- **Romanian diacritics (ă â î ș ț) end-to-end.** UTF-8 sources, diacritic-complete fonts, correct in slugs/search/PDF.
- **i18n mandatory** (RO + EN min; IT/ES/DE for diaspora). No user-facing string hardcoded in a way that blocks translation. Liturgical terms may stay in Romanian inside EN pages (e.g. "Slujbele religioase") — that's expected, not a bug.
- **Layouts must survive long strings** (DE/RO are verbose). No fixed-width text containers that clip.

## Giving

- **Money = integer minor units + explicit currency**, always. Render with `Intl.NumberFormat` and an explicit RON/EUR/USD.
- **Card data never touches our code** (PCI SAQ A). Card giving is an outbound link to a hosted Stripe Payment Link / Netopia page.
- Live campaign totals only render when the optional per-church API exists; otherwise show static/last-known with no implication of real-time.

## Accessibility

- **WCAG AA contrast** across the realistic token range (dark burgundy on cream passes; gold accent is decorative).
- Keyboard-operable nav, forms, copy buttons; visible focus states (focus transitions border to `secondary` per the spec).
- Mobile-first; schedule, livestream, and Donează flows must be excellent on phones (primary diaspora pattern).

## Definition of done (every item)

1. `npm run typecheck --workspaces --if-present` passes.
2. `npm run build --workspaces --if-present` passes (both reference apps build).
3. No raw hex / hardcoded church values in `packages/*`.
4. Component works under a *second* brand by token swap (sanity-check against both reference apps).
5. Append a one-line entry to [docs/wiki/log.md](../wiki/log.md) describing what changed.
