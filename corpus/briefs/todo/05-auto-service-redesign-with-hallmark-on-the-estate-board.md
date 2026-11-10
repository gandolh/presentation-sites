# Task 05: A redesign of auto-service with Hallmark, on the estate board

**Depends on:**

- In this repo: brief 03 (the harness) and brief 04 (Base UI by the conventions, with the theme switch).
- In the owner's skills library:
  - brief 24, now "vendor Hallmark as the design skill, and adopt taste-skill 2.5's ideas": palettes and type dealt by trade, and its copy layer;
  - the estate redesign board: one artifact with a page per app, owned by the skills library.
- The owner's answer of 2026-11-10 to Q39: no bake-off, Hallmark redesigns every web UI. This replaces brief 01.

**Runs before:** nothing in order. Briefs 06, 07 and 08 link here for the steps all four redesigns share, and run in any order after 03 and 04.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

BavAuto Gorj is the site of an independent family BMW specialist workshop in Târgu-Jiu. It exists to make a worried owner **phone the workshop today** (`sites/auto-service/PRODUCT.md`). The page is built from that job: a click-to-call comes first, then WhatsApp with a photo of the warning light. `PRODUCT.md` also names a quote form as a secondary action, but the code has none (`grep -rn '<form' sites/auto-service/src` prints nothing, read 2026-11-10).

### The steps all four redesigns share (briefs 05-08)

1. **Today's screens.** Take screenshots of every screen at 1280 and 390 px, in both themes once brief 04 is in. Keep them out of git. Put the files where the board takes them.
2. **A proposal per screen with Hallmark.** Use its page built from the job, the tiered browser lint, and taste-skill 2.5's trade palette, type pairing and copy layer where they help. Work inside the site's recorded decisions (`DESIGN.md`, `PRODUCT.md`, [wiki/decisions-ui.md](../../wiki/decisions-ui.md), the site's own `docs/`) unless the owner reopens one on the board. Photographs come only from Hallmark's openly licensed set, credited on the page, and only where the site has no decision against photography.
3. **The board.** Put the proposal on the site's page of the estate redesign board, beside today's screenshots.
4. **Approval.** The owner approves it on the board. Nothing below starts before that.
5. **Build.** First a token change (colours, type, radii, both themes), then one screen per commit. The theme switch from brief 04 and its script stay as they are.
6. **Acceptance for every site's redesign.**
   - The owner's approval on the board, recorded in [log.md](../../log.md) with the date.
   - Hallmark's **Floor** checks as commands or tests, in both themes, at 1280 and 390 px:
     - text contrast of at least 4.5:1 (3:1 for large text), from a script over the built page;
     - a visible focus ring on every interactive element (a Playwright keyboard pass);
     - a `prefers-reduced-motion` path with no looping or large motion (a Playwright run with the media feature on);
     - no invented facts or numbers: every figure, name, price and claim traces to the site's `src/content` or `PRODUCT.md` (a grep list in the outcome note);
     - no horizontal scroll at 390 px (`document.documentElement.scrollWidth <= innerWidth`).
   - `npm run check` and `npm run <site>:build` pass, and `bash corpus/lint.sh` ends clean.
7. **Interplay for every site's redesign.** Briefs 03 and 04 come first. The theme switch (Q18) must work in both themes after the redesign. The site's docs (`DESIGN.md`, `docs/`) are updated to the new system in the last commit.

### What auto-service has (read 2026-11-10)

Screens, from `sites/auto-service/src/pages/`:

| Route | File | Notes |
|---|---|---|
| `/` | `index.astro` | one long page: `Hero`, `TrustBand`, `Services`, `WhyUs`, `Process`, `About`, `Contact`, then `Footer` and `MobileCallBar` |
| `/servicii` | `servicii.astro` | |
| `/despre` | `despre.astro` | |
| `/contact` | `contact.astro` | uses `MapConsent.tsx`, a consent-gated map |
| `/confidentialitate`, `/cookie-uri`, `/termeni` | the same names | legal, through `layouts/LegalLayout.astro` |

The layout is `layouts/Base.astro`; the page head carries `WipBanner`, and `Nav` plus `MobileMenu.tsx` (a `Drawer` after brief 04) give navigation.

What its design docs fix today:

- **The world:** the *Bordcomputer*, the page as a car's instrument cluster: a gauge, a service-interval LED band and a check-control legend board (`sites/auto-service/DESIGN.md`, "Components").
- **No photography, by decision.** The owner confirmed none is coming, so the gallery was deleted and the workshop is drawn (`BayScene.astro`; `DESIGN.md:260, 269, 441`). A redesign proposes none, unless the owner reopens this on the board.
- **No BMW roundel**, and a standing independence disclaimer. The BMW blue and M tri-colour are used nominatively.
- **The services surface is a legend board of hairlines and lamps, not a card grid.** It is a stated anti-reference.
- **Dark-first** (brief 04's open question on whether the light-by-default rule applies to it).
- Romanian only; a phone call is the measured outcome.

## Owner decisions (defaults)

1. **Keep the no-photography decision.** Default: yes, until the owner reopens it on the board.
2. **Keep the independence rules** (no roundel, the disclaimer). Default: yes, they are legal, not taste.
3. **The quote form.** `PRODUCT.md` lists it, the code has none. Default: the redesign does not add one, and the owner is asked on the board whether `PRODUCT.md` should drop it. *Repo question for the owner.*
4. **Does the Bordcomputer world stay?** Default: Hallmark proposes inside it first, and one alternative world on the board. The owner picks.

## Files you OWN

- `sites/auto-service/src/styles/global.css`, `src/components/*`, `src/layouts/*`, `src/pages/*`, `src/content/*` (copy only, with the owner's approval).
- `sites/auto-service/DESIGN.md`, and `docs/` pages that describe the look.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- The legal pages' text (`confidentialitate`, `cookie-uri`, `termeni`) beyond layout.
- The phone number, address, hours and every business fact. They come from `src/content/site.ts` and are placeholders until the owner has real ones (`07XX XXX XXX`, `sites/auto-service/src/content/site.ts:59`).
- Other sites, `churchix/`, and the theme script.

## What to do

Steps 1 to 5 of "The steps all four redesigns share", then:

1. Proposal specifics: the home page's order puts the call action first on a phone and in the header, WhatsApp second; every screen has its action visible without scrolling at 390 px.
2. One commit for the token change, then one per screen in this order: `/`, `/servicii`, `/contact`, `/despre`, the legal layout.

## Acceptance

- [ ] The common acceptance (step 6 above).
- [ ] After `npm run auto-service:build`, `grep -c 'href="tel:' sites/auto-service/dist/index.html sites/auto-service/dist/contact/index.html` prints at least 2 for each (the header and `MobileCallBar`), and so does `grep -c 'wa.me'`. Today `dist/index.html` has 7 and 8.
- [ ] No `<img>` or CSS `url()` photograph in `sites/auto-service/dist` unless the owner reopened the decision on the board.

## Interplay

- Briefs 03 and 04 first. Brief 04's stopgap palettes are replaced here.
- Briefs 06-08 reuse this brief's common section.
