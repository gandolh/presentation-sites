# 16 — UI audit across the pages

**Tier:** F · **Depends on:** 14, 15 · **Parallel with:** —

## Goal

A holistic visual/UX audit of every page now that the "Ecclesia Digitalis" design system (items 01–15) has been integrated through both reference church apps. The earlier items shipped components and a hardening pass; this item steps back and judges the *result as a whole* — does each page look polished, consistent, and on-brand, and does it hold up against the design spec and the Stitch reference screens.

## Scope — pages to audit

Audit in both reference apps and across RO + EN locales:

- Home (hero, pinned-announcements strip, Program + About bento)
- Program Slujbe (service schedule)
- Announcements (list + detail)
- Donate / Susține parohia (card CTA, IBANs, Form 230, SMS)
- Campaign / project pages (goal thermometer)
- Pomelnice form (vii / adormiți)
- Contact / Despre
- 404 / error / empty-state pages

## Tasks

1. **Consistency:** spacing scale, radii, typographic rhythm, color-token usage, and component variants are applied uniformly across pages — no one-off deviations.
2. **Fidelity to the spec:** compare each page against [docs/design/DESIGN.md](../../../docs/design/DESIGN.md) and the Stitch reference screens; flag drift in layout, hierarchy, or brand feel.
3. **Visual hierarchy:** clear primary action per page (e.g. Donează), correct heading levels, sensible content density and whitespace.
4. **Responsive:** small / medium / large viewports — diaspora-mobile flows (schedule, livestream, Donează) get extra scrutiny.
5. **States:** hover/focus/active, loading, empty, and error states look intentional and consistent.
6. **Brand resilience:** re-skin with a second test brand and confirm pages still look coherent (no hardcoded values, no broken contrast or layout).
7. **Diacritics & long strings:** spot-check ă â î ș ț and verbose DE/RO labels don't degrade the look (cross-ref [15-a11y-i18n-pass.md](15-a11y-i18n-pass.md)).

## Acceptance criteria

- [ ] Every page in scope reviewed in both reference apps, RO + EN, at 3 viewport sizes.
- [ ] Screenshots captured for each page/viewport as a visual record.
- [ ] Findings catalogued by severity (blocking / polish / nice-to-have) with the offending `file:line` and a proposed fix.
- [ ] Cross-page inconsistencies called out explicitly (not just per-page nits).
- [ ] Fixes applied or filed as follow-up items; results logged in `docs/wiki/log.md`.

## Outcome (2026-10-07)

Done by the 2026-05-30 UI/UX audit, kept as the 2026-05-30 entry in [log.md](../../log.md). It swept every route of the one remaining app with Playwright at 1366x900 and 390x844, fixed three rendering bugs and five DESIGN.md gaps, and filed the leftovers as brief 17. The fixes are still in the code: `@layer base` in `tokens.css`, the `#c8a24b` gold seed, `max-w-[36rem]` in `ErrorLayout.astro`, and zebra rows in `ServiceSchedule.astro`. It falls short of the acceptance list in three ways. It covered one app, because Berinta was gone. It used two viewports, not three. It checked RO only, because the app has one locale. The screenshots were gitignored. The `70999ff` redesign came after it, so the audit describes the earlier home page and page headers.
