---
summary: Dated snapshot of churchix. What is built, the state and dependencies of all 17 design-integration briefs in one line each, and what is still open. Start here after a break.
updated: 2026-10-07
---
# Status (2026-10-07)

## Where things stand

One church app, `apps/parohia-harlesti-bacau`, builds 10 static pages on the
shared `@churchix/*` packages, and `astro check` reports 0 errors (2026-10-07).
The second reference app, `parohia-berinta-maramures`, was removed before
2026-05-30. Deploy is not in this repo.

The *Ecclesia Digitalis* design system is integrated. Briefs 01 to 15 shipped on
2026-05-29 and the UI audit (brief 16) on 2026-05-30. The liturgical-rail
redesign (`70999ff`, 2026-06-18) then rebuilt the hero, the home page and the
inner-page headers around `Rail.astro` and `PageShell.astro`. That superseded
brief 07.

Open work:

- The arch-mask treatment for icons and murals, deferred from brief 17.
- The owner questions still open in [decisions](decisions.md): Q4 and Q6 to Q10.

## Briefs

The design-integration programme. Tiers run A to F, and a brief needs only the
ones it depends on. Every brief honors [conventions](conventions.md).

| # | Brief | Depends on | Tier | State |
|---|---|---|---|---|
| 01 | [Tailwind in the monorepo + shared M3 config](../briefs/done/01-tailwind-setup.md) | none | A | done |
| 02 | [M3 token contract: CSS vars, Tailwind theme, per-church brand](../briefs/done/02-token-contract.md) | 01 | A to B | done |
| 03 | [`@churchix/schemas` brand object for the M3 seeds](../briefs/done/03-schema-brand-tokens.md) | none | A | done |
| 04 | [Self-hosted fonts + icons, diacritic-safe](../briefs/done/04-icons-fonts.md) | 01 | A | done (headings now default to Cardo) |
| 05 | [Primitives: Button, Card, Badge, Field, Alert, EmptyState, Divider](../briefs/done/05-primitives.md) | 02, 04 | B | done |
| 06 | [Header (lang switcher + Donează) and Footer](../briefs/done/06-header-footer.md) | 02, 04, 05 | C | done |
| 07 | [Home: hero, pinned strip, Program + About bento](../briefs/superseded/07-home-hero-sections.md) | 05, 06 | C | superseded by `70999ff` |
| 08 | [Program Slujbe: day blocks, cadence notes, PDF](../briefs/done/08-service-schedule.md) | 05, 06 | C | done (header now `PageShell`) |
| 09 | [Announcements list + detail, pinned accent](../briefs/done/09-announcements.md) | 05, 06 | C | done |
| 10 | [Donate page: card CTA, copy IBANs, Form 230, SMS](../briefs/done/10-giving-donate.md) | 05, 06 | C | done |
| 11 | [Campaign card with goal thermometer](../briefs/done/11-campaign-thermometer.md) | 05 | C | done |
| 12 | [Pomelnice form island](../briefs/done/12-pomelnic-form.md) | 05 | C | done |
| 13 | [404 / error / empty-state pages](../briefs/done/13-error-empty-pages.md) | 05, 06 | C | done |
| 14 | [Reference-app rollout + second-brand proof](../briefs/done/14-reference-app-rollout.md) | 05 to 13 | D | done (Berinta since removed) |
| 15 | [a11y, i18n and long-string pass](../briefs/done/15-a11y-i18n-pass.md) | 14 | E | done |
| 16 | [UI audit across the pages](../briefs/done/16-ui-audit-pages.md) | 14, 15 | F | done (one app, two viewports, RO) |
| 17 | [UI audit follow-ups](../briefs/done/17-audit-followups.md) | 16 | F | done (arch mask deferred) |

**Brief 17** closed on 2026-10-07. Task 1 was already done by the redesign,
tasks 2, 3 and 6 shipped (legacy `.cx-*` and dead tokens removed, `max-w` guard in
`npm run lint`), task 4 was dropped as covered by `PageShell`, and task 5 (arch
mask) is deferred until real photography lands. See the 2026-10-07 log entry.

New work: capture it in [todos/](../todos/), then promote it to
`briefs/todo/` with the next free number (18).
