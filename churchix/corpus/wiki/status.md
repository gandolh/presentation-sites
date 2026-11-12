---
summary: Dated snapshot of churchix as of 2026-11-04, per area. The one church app and its build, the Ecclesia Digitalis design system (integrated 2026-05-29, liturgical-rail redesign 2026-06-18), the docs site on Docusaurus, the phone menu on Base UI, the brand seeds winning over the token defaults, what waits on a deploy, and what is still open. Start here after a break.
updated: 2026-11-11
---
# Status (2026-11-04)

Base UI is pinned exactly at 1.9.0 in `@churchix/ui` (brief 02, 2026-11-10).

The house style and the quality gate are in (brief 03, 2026-11-11): Prettier, ESLint with the Astro layer, a typecheck in
every workspace, knip, dependency-cruiser and the two checkers, and `.claude/rules`. `npm run check` takes 25.7 s warm
and `check:fast` 8.7 s. `check-base-ui` runs `--warn-only` (4 warnings) until brief 04. Built locally, not pushed, and
the owner deploys.

One church app, `apps/parohia-harlesti-bacau`, builds 10 static pages on the
shared `@churchix/*` packages, and `astro check` reports 0 errors (2026-11-04).
The second reference app, `parohia-berinta-maramures`, was removed before
2026-05-30. Deploy is not in this repo. Brief 01 is done (2026-11-04) and no
brief is open; brief numbering restarted at 01 on 2026-11-02 (see
[log.md](../log.md)), and the next free number is 02.

## By area

- **Design system** (2026-05-29). *Ecclesia Digitalis* on Tailwind v4 and the
  M3 token contract, self-hosted fonts and icons, the primitives, header and
  footer, the service schedule, announcements, giving, the campaign
  thermometer, the pomelnice form and the error pages
  ([design-system.md](design-system.md)). The 2026-05-30 UI audit fixed three
  rendering bugs; its follow-ups closed 2026-10-07 (dead `.cx-*` rules gone, a
  `max-w` guard in `npm run lint`).
- **Brand seeds** (2026-11-04). `tokens.css` keeps its defaults in
  `:where(:root)`, so a church's `site.json` seeds win and it re-skins by
  token swap alone. The parish now renders its own `#6b1f2a`, and keeps the
  system's Cardo headings ([design-system.md](design-system.md)).
- **Home and inner pages** (2026-06-18). The liturgical-rail redesign
  (`70999ff`) rebuilt the hero, the home page and the inner-page headers
  around `Rail.astro` and `PageShell.astro`.
- **Accessibility and i18n** (2026-05-29). Skip link, AA contrast across the
  brand range, one `h1` a page; axe found no critical, serious or moderate
  violations.
- **Docs site** (2026-10-21). Docusaurus at the same `/churchix/docs/` URLs
  plus `/search/` ([architecture.md](architecture.md#docs-site)).
- **Phone menu** (2026-11-12). `MobileNav` on Base UI `Drawer` through `primitives/Drawer.tsx`:
  closes on a swipe up, a tap outside, the X or Esc. The island goes from 21.2 to 31.1 kB gzip
  ([decisions.md](decisions.md)). `check-base-ui` is strict and reports 0; Playwright spec in `e2e/`
  (`npm run test:e2e`).

## Waiting on a deploy

The docs site, the Drawer phone menu and the brand-seed fix are not known to be
deployed. vps-deploy flipped the churchix docs stack to its Docusaurus asset
check on 2026-10-21, so the docs deploy can go ahead.

## Open

- The arch-mask treatment for icons and murals, deferred until real
  photography lands.
- The owner questions still open in [decisions](decisions.md): Q4 and Q6 to
  Q10.

New work: capture it in [todos/](../todos/), then promote it to
`briefs/todo/` with the next free number (02).
