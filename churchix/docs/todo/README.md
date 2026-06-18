# TODO — Integrate the "Ecclesia Digitalis" design system

This directory tracks the work to bring the **Stitch-generated design system** (`docs/design/stitch_churchix_white_label_design_system/`) into `@churchix/ui` and the church apps.

Each file below is an **atomic, independently-assignable work item**: it carries enough context for a fresh agent to pick it up cold, states its dependencies, and lists concrete acceptance criteria. Work the dependency order; items in the same tier are parallelizable.

## Source of truth

- **Design spec:** [docs/design/DESIGN.md](../design/DESIGN.md) — `Ecclesia Digitalis` tokens (colors, typography, spacing, radius) + brand/style narrative.
- **Reference screens** (Tailwind + Material Symbols HTML, generated from the screens' intent):
  - `docs/design/stitch_churchix_white_label_design_system/acas_parohia_sf_ntul_ierarh_nicolae/` — Home
  - `docs/design/stitch_churchix_white_label_design_system/program_slujbe/` — Program Slujbe (service schedule)
  - `docs/design/stitch_churchix_white_label_design_system/pomelnice_online/` — Pomelnice form
  - `docs/design/stitch_churchix_white_label_design_system/sus_ine_parohia_doneaz/` — Donate / Susține parohia
- **Decision:** [docs/adr/0002-tailwind-material3-design-system.md](../adr/0002-tailwind-material3-design-system.md) — supersedes ADR-0001; adopts Tailwind + the Material-3 token palette.

## Decision recap (read before starting)

- We **adopt Tailwind CSS** and the **full Material-3 token palette** from `DESIGN.md`, matching the Stitch output. This replaces the previous bounded "safe set" + plain-CSS approach (ADR-0001).
- Branding still enters **per-church as tokens** — but the token contract is now the M3 palette emitted as CSS custom properties, mapped into the Tailwind theme. A church re-skins by setting `--primary`, `--secondary`, `--surface`, etc. from its `site` content entry; components never fork.
- **Astro static-first + React islands** is unchanged. Tailwind ships at build time; only genuinely interactive bits hydrate.
- Romanian diacritics, i18n, money-as-minor-units, and white-labeling rules from [CLAUDE.md](../../CLAUDE.md) still bind every component.

## Work items

| # | File | Title | Depends on | Parallel tier |
| - | ---- | ----- | ---------- | ------------- |
| 01 | [01-tailwind-setup.md](01-tailwind-setup.md) | Add Tailwind to the monorepo + share the M3 config | — | A |
| 02 | [02-token-contract.md](02-token-contract.md) | M3 token contract: CSS vars + Tailwind theme + per-church brand mapping | 01 | A→B |
| 03 | [03-schema-brand-tokens.md](03-schema-brand-tokens.md) | Extend `@churchix/schemas` brand object for the M3 token set | — | A |
| 04 | [04-icons-fonts.md](04-icons-fonts.md) | Material Symbols + Source Serif 4 / Inter font loading (self-hosted, diacritic-safe) | 01 | A |
| 05 | [05-primitives.md](05-primitives.md) | System primitives: Button, Card, Badge, Input, Alert, EmptyState, Divider | 02, 04 | B |
| 06 | [06-header-footer.md](06-header-footer.md) | Restyle Header (lang switcher + Donează) and Footer to the design | 02, 04, 05 | C |
| 07 | [07-home-hero-sections.md](07-home-hero-sections.md) | Home: Hero, pinned-announcements strip, Program+About bento | 05, 06 | C |
| 08 | [08-service-schedule.md](08-service-schedule.md) | Program Slujbe page: bento day-blocks + cadence notes + PDF download | 05, 06 | C |
| 09 | [09-announcements.md](09-announcements.md) | Announcements list + detail with pinned/featured gold accent | 05, 06 | C |
| 10 | [10-giving-donate.md](10-giving-donate.md) | Donate page: card CTA, copy-to-clipboard IBANs, Form 230, SMS | 05, 06 | C |
| 11 | [11-campaign-thermometer.md](11-campaign-thermometer.md) | Campaign card with goal thermometer + project card variant | 05 | C |
| 12 | [12-pomelnic-form.md](12-pomelnic-form.md) | Pomelnice form island: vii/adormiți bento + offering presets | 05 | C |
| 13 | [13-error-empty-pages.md](13-error-empty-pages.md) | 404 / error / empty-state pages, white-labeled | 05, 06 | C |
| 14 | [14-reference-app-rollout.md](14-reference-app-rollout.md) | Roll the new components through the two reference church apps + visual QA | 05–13 | D |
| 15 | [15-a11y-i18n-pass.md](15-a11y-i18n-pass.md) | Accessibility (WCAG AA) + i18n/diacritics + long-string robustness pass | 14 | E |
| 16 | [16-ui-audit-pages.md](16-ui-audit-pages.md) | Holistic UI audit across all pages (consistency, fidelity, responsive, states) | 14, 15 | F |
| 17 | [17-audit-followups.md](17-audit-followups.md) | UI audit follow-ups: legacy container migration, dead-token cleanup, deferred shape work | 16 | F |

**Tiers** run roughly in order A → B → C → D → E → F. Within a tier, files can be taken by independent agents in parallel. Cross-cutting rules every item must honor are in [_conventions.md](_conventions.md).

To run these across many agents at once, see **[SWARM_PLAN.md](SWARM_PLAN.md)** — the gated fan-out schedule, file-ownership map, and failure handling.
