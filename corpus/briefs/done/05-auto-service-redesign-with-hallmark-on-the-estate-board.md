# Task 05: A redesign of auto-service with Hallmark, on the estate board

**Depends on:**

- In this repo: brief 03 (the harness) and brief 04 (Base UI by the conventions).
- In the owner's skills library:
  - brief 24, now "vendor Hallmark as the design skill, and adopt taste-skill 2.5's ideas": palettes and type dealt by trade, and its copy layer;
  - the estate redesign board: one artifact with a page per app, owned by the skills library.
- The owner's answer of 2026-11-10 to Q39: no bake-off, Hallmark redesigns every web UI. This replaces brief 01.

**Runs before:** nothing in order. Briefs 06, 07 and 08 link here for the steps all four redesigns share, and run in any order after 03 and 04.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

BavAuto Gorj is the site of an independent family BMW specialist workshop in Târgu-Jiu. It exists to make a worried owner **phone the workshop today** (`sites/auto-service/PRODUCT.md`). The page is built from that job: a click-to-call comes first, then WhatsApp with a photo of the warning light. `PRODUCT.md` also names a quote form as a secondary action, but the code has none (`grep -rn '<form' sites/auto-service/src` prints nothing, read 2026-11-10).

### The steps all four redesigns share (briefs 05-08)

1. **Today's screens.** Take screenshots of every screen at 1280 and 390 px. Keep them out of git. Put the files where the board takes them.
2. **A proposal per screen with Hallmark.** Use its page built from the job, the tiered browser lint, and taste-skill 2.5's trade palette, type pairing and copy layer where they help. Work inside the site's recorded decisions (`DESIGN.md`, `PRODUCT.md`, [wiki/decisions-ui.md](../../wiki/decisions-ui.md), the site's own `docs/`) unless the owner reopens one on the board. Photographs come only from Hallmark's openly licensed set, credited on the page, and only where the site has no decision against photography.
3. **The board.** Put the proposal on the site's page of the estate redesign board, beside today's screenshots.
4. **Approval.** The owner approves it on the board. Nothing below starts before that.
5. **Build.** First a token change (colours, type, radii), then one screen per commit. The site keeps its one dark look: no theme switch is added (owner, 2026-11-10, Q18).
6. **Acceptance for every site's redesign.**
   - The owner's approval on the board, recorded in [log.md](../../log.md) with the date.
   - Hallmark's **Floor** checks as commands or tests, at 1280 and 390 px:
     - text contrast of at least 4.5:1 (3:1 for large text), from a script over the built page;
     - a visible focus ring on every interactive element (a Playwright keyboard pass);
     - a `prefers-reduced-motion` path with no looping or large motion (a Playwright run with the media feature on);
     - no invented facts or numbers: every figure, name, price and claim traces to the site's `src/content` or `PRODUCT.md` (a grep list in the outcome note);
     - no horizontal scroll at 390 px (`document.documentElement.scrollWidth <= innerWidth`).
   - `npm run check` and `npm run <site>:build` pass, and `bash corpus/lint.sh` ends clean.
7. **Interplay for every site's redesign.** Briefs 03 and 04 come first. Each site keeps the one look designed for it, dark or light, and none gets a theme switch (owner, 2026-11-10, Q18). The site's docs (`DESIGN.md`, `docs/`) are updated to the new system in the last commit.

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
- **Dark**, with no light theme and no theme switch (owner, 2026-11-10: the client sites keep the one look designed for each).
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
- Other sites and `churchix/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share", then:

1. Proposal specifics: the home page's order puts the call action first on a phone and in the header, WhatsApp second; every screen has its action visible without scrolling at 390 px.
2. One commit for the token change, then one per screen in this order: `/`, `/servicii`, `/contact`, `/despre`, the legal layout.

## Acceptance

- [ ] The common acceptance (step 6 above).
- [ ] After `npm run auto-service:build`, `grep -c 'href="tel:' sites/auto-service/dist/index.html sites/auto-service/dist/contact/index.html` prints at least 2 for each (the header and `MobileCallBar`), and so does `grep -c 'wa.me'`. Today `dist/index.html` has 7 and 8.
- [ ] No `<img>` or CSS `url()` photograph in `sites/auto-service/dist` unless the owner reopened the decision on the board.

## Interplay

- Briefs 03 and 04 first. Brief 04's phone menu (`Drawer`) is what this brief styles, inside the site's dark look.
- Briefs 06-08 reuse this brief's common section.

## Outcome (2026-11-13)

Built on `main` as local commits: the approval log entry, `ff1a2d2` (tokens and Encode Sans), `070b3bc` (home and the shared components), `80f0040` (servicii), `884daf3` (contact), `655d33c` (despre), `62ed35d` (legal layout), `0405133` (shared Floor checks) and `d9542cf` (docs), plus this closeout. Not deployed: owner step `node cli.ts auto-service deploy` from the vps-deploy checkout (a static site).

- **Direction:** "The job card", approved on the board with every question as proposed. The Bordcomputer world is gone (decision recorded in [decisions-ui.md](../../wiki/decisions-ui.md)); `DESIGN.md` is rewritten from what shipped; `PRODUCT.md` lost the quote form (two lines). Fonts: Encode Sans Variable `@fontsource-variable/encode-sans` 5.3.0 replaces Archivo, Hanken Grotesk and Azeret Mono; `animejs` left with the gauge. Dropped tokens: `surface-menu`, `inverse-surface-2`, `link-on-trim`, `primary-container`, `on-primary-container`, `primary-edge`, `warning`, `on-error`, `whatsapp-hover`, `--font-mono`, `--radius-sm`, `--radius`, `--radius-xl` (nothing used them after the screens moved).
- **Shared Floor checks, in the root `e2e/` (saloon, subcort, tractari and churchix reuse them):** run `SITES=<site> npx playwright test -c e2e`. Every site has a phone project (`<site>`, 390x844, touch) and a `<site>-desktop` project (1280x800). `floor.ts` (project metadata `site` and `device`, crawl of the pages the home links to, page-side colour maths), `floor-contrast.spec.ts` (text 4.5:1, large text 3:1, icons 3:1, over the BUILT `sites/<site>/dist`, which the spec serves itself: build first, `npm run <site>:build` or `:build:mock`), `floor-focus.spec.ts` (keyboard Tab pass, 2px ring, ring against its backdrop 3:1), `floor-motion.spec.ts` (reduced motion: no looping or long animation, no smooth scroll), `floor-overflow.spec.ts` (390 px, phone project). `mobile-menu.spec.ts` now reads the site from the project metadata and skips on desktop. `auto-service-job-card.spec.ts` is auto-service's own (window states with a frozen clock, no-JS, bar appears and hides, first screens at 390x844 and 360x800). The config takes `SITES=a,b` to start only those dev servers.
- **Contrast minimums (both from the scripted run over the built pages; one dark look):** text 5.36:1 (card ink muted on the card's hover row; 6.17 on the card), icons 4.68:1 (the WhatsApp mark on the card), call label on the call 5.58 (6.86 hovered), amber hours on the window 10.89, muted ink on the panel 8.02 and on the well 6.84, focus ring 12.61 on the ground, 10.91 on a panel, 9.30 on a well, 13.98 on the card (card ink). The call fill is 3.23:1 against the ground.
- **Compared with the comps** (the twins rendered with the fontsource files in place of Google Fonts, same viewport, differing pixels at a 24/255 threshold): home 0.07% at 1280, 0.86% at 390; servicii 0.08% and 0.15%; despre 0.07% and 0.17%; contact 0.07% and 2.10%. At 1280 every difference is antialiasing. At 390 the build is 64 px taller on home and contact because the footer keeps clearance for the fixed call bar (the twin draws the bar inline); contact's 2.1% is that tail, the rest is antialiasing. Shots (outside git) are in the estate build folder, `board/impl/auto-service/`, as `<screen>-dark-<width>.png` (one look, so no theme in the name), at 1280, 390 and 360, plus the window open, closed and without scripts, the Drawer, the call bar and the map after consent.
- **Undrawn screens restyled:** the three legal pages (on the light card, text untouched), the map after consent (an iframe in the `.map` panel), the phone Drawer (full screen, from the direction sheet's pattern), the 404-less static pages have no other states.
- **Acceptance:** `npm run auto-service:build` exits 0; `href="tel:` appears 7 times on `dist/index.html` and 5 on `dist/contact/index.html`, `wa.me` 8 and 4 (counted per link with `grep -o`; the brief's `grep -c` prints 1 for each file because it counts lines); no `<img>` and no CSS `url()` except the font files. No dashes remain in rendered copy except the legal pages' text, the meta titles and descriptions and the `BavAuto Gorj — acasă` aria-label, which the sheet leaves alone.
- **Floor "no invented facts":** every figure on the page traces to `src/content/site.ts` (`07XX XXX XXX`, hours, `5` years and `3` people in `stats`, `12 luni`) or to `PRODUCT.md` and the old components' copy (`Autorizat RAR`, `deviz în avans`, `garanție 12 luni`, the process steps); the redesign added none. Grep list: `grep -n "12 luni\|5 ani\|3 oameni\|RAR" sites/auto-service/src`.
- **Deviations and findings:**
  - The sheet puts the readout window "in the card head"; the approved comp draws it last at 1280 and first on a phone (the sticky says "on the phone the window is the card head"). The build follows the comp.
  - The map iframe's title was `Hartă — <name>` and is now `Hartă: <name>` (one em dash less; only seen after consent).
  - The twin's `·` between the phone and WhatsApp in the banner is gone with the comp's draw; the old Drawer's `01..04` numerals went too (not drawn).
  - **Pre-existing, left alone (legal text is out of scope):** in `cookie-uri` and `confidentialitate` a space between a text line and an inline `<strong>` or `<a>` is lost at a line break ("conformLegii", "consultăPolitica"), because Astro trims it. A `{" "}` at each break fixes it; owner's call to open the legal text.
  - `scripts/og-card.html` (the hand-run script that rebuilds the social card) still names the old fonts; the card PNG itself is unchanged and a regenerated card in the new look is a follow-up.
  - The twin's "Hallmark" lint waivers stay on the board; the build ships no Hallmark files.
  - The call bar's no-script default was broken by a later CSS rule while building (it hid the bar on phones); the spec caught it and it is fixed.
