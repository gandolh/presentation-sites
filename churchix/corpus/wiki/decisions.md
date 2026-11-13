---
summary: Settled product and architecture decisions (independent deployments, Orthodox first, static-per-build, Churchix never holds funds, Base UI under island dialogs, Cardo headings for the parish, the porch notice redesign of 2026-11-13) and the owner questions still open (Q4, Q6 to Q10).
updated: 2026-11-13
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

## Decided (2026-10-23)

- **Base UI for island dialogs.** The owner's call, to match their apps. The
  phone menu (`MobileNav`) is a Base UI `Dialog`
  (2026-10-23), a swipeable `Drawer` since 2026-11-12 (Q40; the wrapper is
  `packages/ui/src/primitives/Drawer.tsx`, the checker's `ui` root), which gives the focus
  trap, Esc, the scroll lock and focus return. It is styled by the M3 tokens
  as before. *Cost, measured:* the island goes from 1.6 to 21.2 kB gzip, and
  the parish site's JS from 72.8 to 93.1 kB gzip (+20.4 kB). *Rejected:*
  keeping the hand-built trap, and turning `.astro` widgets into islands to
  use more of Base UI, which would add JS to static pages. `CopyIban` and
  `PomelnicForm` have no overlay and stay as they are.

## Decided (2026-11-04)

- **The parish keeps Cardo headings.** Once the brand seeds won over the token
  defaults, the parish's leftover `fontHeading` (Source Serif 4) would have
  switched its headings away from the design's Cardo. The owner kept Cardo, so
  the field is removed from its `site.json` and the parish falls back to the
  default `--font-heading`.

## Decided (2026-11-11)

- **The house style and a quality gate, vendored.** Churchix keeps its own copy of `house-style` 1.1.0 in
  `vendor/house-style/` (the root's copy is separate), refreshed by `npm run house-style:sync`. Prettier at width 120
  with double quotes and semicolons, plus `prettier-plugin-astro`; ESLint with the house config and
  `eslint-plugin-astro`; `astro check` in the app and `tsc` in both packages; knip and dependency-cruiser; the two
  checkers. `npm run check` is the whole gate and `npm run check:fast` the quick one. *Why Churchix has its own:* it is
  its own npm project with its own lockfile, and the root harness leaves `churchix/` out. *Rejected:* a shared copy
  at the repo root, which would tie Churchix's lockfile to the sites'.
- **A default export is allowed in `*.config.*` and in `packages/ui/src/islands/*.tsx`**, which Astro imports by
  default. Nowhere else.
- **Markdown, the churches' content and the design source stay out of Prettier.**
- **`.claude/rules/` is committed**: the `.claude/` ignore line became `.claude/settings.local.json`.
- **`exactOptionalPropertyTypes` stays off** (1 error in ui, 5 in the app); the owner decides when it goes on.

## Changed (2026-11-13, brief 05: the porch notice)

The owner approved the redesign "The porch notice" on the estate redesign board, with every question standing as proposed.
Two recorded decisions changed; the old lines stay as history.

- **The phone menu (2026-10-23, Q40, above).** *Old:* "The phone menu (`MobileNav`) is a Base UI `Dialog` (2026-10-23), a
  swipeable `Drawer` since 2026-11-12." *Changed 2026-11-13:* the Drawer stays, behind `Meniu`, and a fixed 64 px bottom bar
  of five places (Acasă, Program, Pomelnice, Donează, Meniu, plus the safe-area inset) joins it as `BottomBar`, beside
  `MobileNav`. The page pads by the bar's height. The header holds the wordmark only on phones. Pomelnice and Donează in the
  bar follow `features.pomelnice` and `features.giving`.
- **The 2026-06-18 redesign ([design-system](design-system.md)).** *Old:* the Hero was "an asymmetric split" with a framed
  image above the week timeline, the liturgical Rail ran beside the content, Home ended on "a quiet burgundy despre band", and
  `PageShell` opened inner pages with an overline kicker. *Changed 2026-11-13:* the name and the arched picture sit in a
  full-width burgundy band, the program and the giving card rise out of its edge, the Rail is retired, Despre is plain text
  beside a facts card, and inner pages open on a slim band with the title and lede. The kickers are dropped on every page.
- **Kept:** the seed contract (four seeds, no new seed), Cardo headings and Inter body (2026-11-04), one look per parish (no
  theme switch, no dark palette; owner, 2026-11-10, Q18), the formal tone, the IBAN, Form 230, SMS and endpoint logic.
- **Owner's rulings on the build (2026-11-13):** the footer's `Termeni și Condiții` and `Politică de Confidențialitate` links
  stay as they are (they 404 today; adding the pages is content work, outside this brief). The Home giving card hides its
  account lines while the IBAN fails the mod-97 check, a display condition in `packages/ui` with no schema change; the
  footer and /donatii print the IBAN as before.
