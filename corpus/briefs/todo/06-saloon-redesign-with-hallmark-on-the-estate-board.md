# Task 06: A redesign of saloon with Hallmark, on the estate board

**Depends on:** brief 03, brief 04, and the skills library's brief 24 (Hallmark vendored, taste-skill 2.5's ideas adopted) and the estate redesign board, as in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md). That brief holds the steps and the acceptance every site's redesign shares ("The steps all four redesigns share"). Read it first. The owner's answer of 2026-11-10 to Q39 replaces the bake-off.

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

- Light, warm, boutique: a blush-cream surface, one blush brand colour, gold as a thin accent under 10% of a surface, a serif display face. "Never sterile white, never dark" (`DESIGN.md`, "Theme"). Brief 04 gives it a dark theme under the owner's Q18 answer, so this line is reopened there.
- **Imagery is the brand**: real photographs of Ana's work in `public/images/real/`, resolved by logical name through `src/content/images.ts` (`DESIGN.md`, "Iconography & Imagery").
- Romanian only. No e-commerce, no blog, no client accounts (`docs/ADR.md`).
- The booking message is pre-filled WhatsApp (`Booking.astro`, `MobileBookingBar.astro`); the built home page has 11 `wa.me` links and 4 `tel:` links.

## Owner decisions (defaults)

1. **Photographs.** Default: Ana's own photographs stay the imagery. Hallmark's licensed set fills only the mock-image mode (`PUBLIC_IMAGE_SOURCE` unset), never the real build.
2. **The parked testimonials stay parked.** Hallmark's "no invented facts" rule forbids inventing reviews.
3. **Does "never dark" go?** Brief 04 adds the theme switch. Default: the dark palette is designed here, in the same blush and gold family, not inverted.

## Files you OWN

- `sites/saloon/src/styles/global.css`, `src/components/*`, `src/layouts/*`, `src/pages/*`; copy in `src/content/*` only with the owner's approval.
- `sites/saloon/DESIGN.md` and the `docs/` pages that describe the look (`docs/tokens.md`).
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `sites/saloon/marketing/bots/`, the opening hours (`HOURS`), the phone and WhatsApp numbers, and every business fact.
- The legal pages' text beyond layout, and the theme script.
- Other sites and `churchix/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share" in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Then one commit for the token change, and one per screen: `/`, then the legal layout. Within `/`, the booking action stays reachable in one tap from every scroll position on a phone.

## Acceptance

- [ ] The common acceptance in [auto-service's brief](05-auto-service-redesign-with-hallmark-on-the-estate-board.md) (step 6 there).
- [ ] After `npm run saloon:build`, `grep -c 'wa.me' sites/saloon/dist/index.html` prints at least 2 (it prints 11 today), and every link carries the pre-filled `text=` parameter.
- [ ] `grep -rn "Testimonials" sites/saloon/src/pages/index.astro` still shows it commented out.

## Interplay

- Briefs 03 and 04 first. The redesign replaces brief 04's stopgap dark palette.
- The Ana Saloon social-card and marketing assets in `sites/saloon/marketing` read the brand colours: check them after the token change.
