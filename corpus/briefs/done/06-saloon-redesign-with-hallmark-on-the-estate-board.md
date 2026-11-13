# Task 06: A redesign of saloon with Hallmark, on the estate board

**Depends on:** brief 03, brief 04, and the skills library's brief 24 (Hallmark vendored, taste-skill 2.5's ideas adopted) and the estate redesign board, as in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). That brief holds the steps and the acceptance every site's redesign shares ("The steps all four redesigns share"). Read it first. The owner's answer of 2026-11-10 to Q39 replaces the bake-off.

**Runs before:** nothing. It needs 03 and 04, and runs in any order with 05, 07 and 08.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

Ana Saloon is a one-woman nail studio near Târgu-Jiu. The page exists to turn a stranger's first visit into a booked appointment, and booking here means **a pre-filled WhatsApp message**, not a form or a login (`sites/saloon/PRODUCT.md`). The page is built from that job: it shows the work, builds trust, and ends on the booking action.

### What saloon has (read 2026-11-10)

| Route | File | Notes |
|---|---|---|
| `/` | `sites/saloon/src/pages/index.astro` | one long page: `Hero`, `About`, `Services`, `Sterilization`, `Gallery`, `Loyalty`, `Faq`, `Booking`, `Contact`, then `Footer` and `MobileBookingBar`. `Testimonials` is parked in the file until real reviews exist. |
| `/confidentialitate`, `/cookie-uri`, `/termeni` | the same names | legal, through `layouts/LegalLayout.astro` |

Navigation is `Nav.astro` plus `MobileMenu.tsx` (a `Drawer` after brief 04); `WipBanner` sits above the header.

What its design docs fix today (`sites/saloon/DESIGN.md`, `PRODUCT.md`, `docs/ADR.md`):

- Light, warm, boutique: a blush-cream surface, one blush brand colour, gold as a thin accent under 10% of a surface, a serif display face. "Never sterile white, never dark" (`DESIGN.md`, "Theme"). The owner answered on 2026-11-10 that the client sites keep the one look designed for each, so this stays: no dark theme and no theme switch.
- **Imagery is the brand**: real photographs of Ana's work in `public/images/real/`, resolved by logical name through `src/content/images.ts` (`DESIGN.md`, "Iconography & Imagery").
- Romanian only. No e-commerce, no blog, no client accounts (`docs/ADR.md`).
- The booking message is pre-filled WhatsApp (`Booking.astro`, `MobileBookingBar.astro`); the built home page has 11 `wa.me` links and 4 `tel:` links.

## Owner decisions (defaults)

1. **Photographs.** Default: Ana's own photographs stay the imagery. Hallmark's licensed set fills only the mock-image mode (`PUBLIC_IMAGE_SOURCE` unset), never the real build.
2. **The parked testimonials stay parked.** Hallmark's "no invented facts" rule forbids inventing reviews.

## Files you OWN

- `sites/saloon/src/styles/global.css`, `src/components/*`, `src/layouts/*`, `src/pages/*`; copy in `src/content/*` only with the owner's approval.
- `sites/saloon/DESIGN.md` and the `docs/` pages that describe the look (`docs/tokens.md`).
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `sites/saloon/marketing/bots/`, the opening hours (`HOURS`), the phone and WhatsApp numbers, and every business fact.
- The legal pages' text beyond layout.
- Other sites and `churchix/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share" in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Then one commit for the token change, and one per screen: `/`, then the legal layout. Within `/`, the booking action stays reachable in one tap from every scroll position on a phone.

## Acceptance

- [ ] The common acceptance in [auto-service's brief](../done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md) (step 6 there).
- [ ] After `npm run saloon:build`, `grep -c 'wa.me' sites/saloon/dist/index.html` prints at least 2 (it prints 11 today), and every link carries the pre-filled `text=` parameter.
- [ ] `grep -rn "Testimonials" sites/saloon/src/pages/index.astro` still shows it commented out.

## Interplay

- Briefs 03 and 04 first. The redesign stays light and adds no theme switch.
- The Ana Saloon social-card and marketing assets in `sites/saloon/marketing` read the brand colours: check them after the token change.

## Outcome (2026-11-13)

Built on `main` as local commits: the approval log entry, `dc6f854` (tokens, fonts pinned at 5.3.0), `ef51916` (legal layout), `566febc` (home and `e2e/saloon.spec.ts`), `1e846ac` (footer WhatsApp link carries `text=`), `ef4d166` (DESIGN.md, tokens.md, decisions-ui), `4125fd0` (class rename), plus `abefbcb` (shared focus spec fix) and this closeout. Not deployed: owner step `node cli.ts saloon deploy` from the vps-deploy checkout (a static site).

- **Direction:** "Menu beside the work", approved on the board with every question as proposed. The Services menu card moved into the hero beside the photograph; the phone booking bar is docked from the first paint (WhatsApp pill and a round call button, no in-hero button on phones); sentence case and icon arrows; gold-ink focus ring; grain, banner dot, hero disc and loyalty motif gone. The four reopened lines are recorded in [decisions-ui.md](../../wiki/decisions-ui.md); `DESIGN.md` and `docs/tokens.md` are rewritten from what shipped. Fraunces and Manrope are pinned at exact 5.3.0. No token was dropped (knip does not flag them; `tertiary`, `error`, `surface-tint`, `inverse-primary`, `surface-variant`, `radius-md`, `cream` are kept for later forms).
- **Shared Floor focus spec:** the root `e2e/floor-focus.spec.ts` now reads the outermost 2 px shadow and skips iframes (commit `abefbcb`); auto-service's floor specs still pass.
- **Contrast minimums (scripted over the built pages, one light look):** text 4.91:1, icons 3.68:1; the focus spec passes at 3:1 on both projects. The focus spec stops at the first repeated label, so identical `tel:` links (Contact, footer) end its walk early; the dock and the footer's later stops are not all covered by it.
- **Saloon's own spec (`e2e/saloon.spec.ts`):** 1280x800 holds all three price rows whole; 390x844 and 360x800 show the first price row above the dock; a `wa.me` link is in view at every 200 px scroll step at 390 and the dock hides only beside Booking's or Contact's own button; the dock is visible without scripts and hides with the menu open; the clip check passes at 1280, 1024, 768, 390 and 360 on the home and a legal page.
- **Compared with the comps** (twins rendered with the fontsource files, photo slots masked, differing pixels at a 24/255 threshold): home 0.54% at 1280, 9.5% at 390; galerie landing 0.18% and 8.2%; programari landing 0.69% and 3.5%. At 1280 every difference is antialiasing. At 390 the build is 18 px shorter overall: About runs 6 px taller (the signature's line box), the footer keeps 5.5 rem of clearance for the dock, and the offsets shift every band below, so the percentage is mostly that shift. The servicii landing twin shows Hygiene directly after the menu card, while the home twin puts About there; the build follows the home twin, so servicii differs by design (27-35%, not comparable). Shots (outside git) are in the estate build folder, `board/impl/saloon/`, as `<screen>-light-<width>.png` at 1280, 390 and 360, with the twin and build renders used for the diff.
- **Undrawn screens restyled:** the three legal pages (raised card, plain header with an arrow link, text untouched), the phone Drawer (the direction sheet's drawing), the focus and reduced-motion states.
- **Acceptance:** `saloon:build:mock` exits 0; the built home page has 11 `wa.me` links, every one with `text=` (the footer icon had none and now does), and 5 `tel:` links; Testimonials stays commented out in `index.astro`.
- **Copy changes (all approved):** `Vezi serviciile →` removed; the `·` after `Răspund cel mai repede aici` and `Sună-mă` gone (label and number on separate lines); the footer legal strip is separate spans; `Telefon și WhatsApp` (the controller's answer); `Programează` rows carry an aria-label with the service. Also: the legal layout's duplicate `← Acasă` link was dropped (the header's `Înapoi la site` stays). The facts pair stays hidden (see DESIGN.md "Parked").
- **Deviations and findings:**
  - Fraunces's `opsz` file has no `SOFT` axis, so `"SOFT" 30` does nothing (true before the redesign too); the board's twins used Google Fonts with it.
  - A `.text-lead` class collided with the Tailwind utility generated from `--text-lead` and beat the phone rule; the class is `.copy-lead`.
  - `scripts/og-card.html` and the social card PNG still carry the old colours (follow-up). `sites/saloon/marketing` holds no brand colours outside `bots/`, which stays untouched.
  - The Floor "no invented facts" grep: every figure traces to `site.ts` and the components' old copy; none added.
