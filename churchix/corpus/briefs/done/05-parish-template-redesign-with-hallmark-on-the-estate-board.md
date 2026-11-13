# Task 05: A redesign of the parish template with Hallmark, on the estate board

**Depends on:**

- In Churchix: brief 03 (the harness) and brief 04 (Base UI by the conventions).
- In the root corpus of this repo: its brief 05, [A redesign of auto-service with Hallmark, on the estate board](../../../../corpus/briefs/done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Its section "The steps all four redesigns share" holds the steps and the acceptance every redesign shares: screenshots, a proposal on the board, the owner's approval, a token change first, then one screen per commit, and the Floor checks. They are not repeated here.
- In the owner's skills library: brief 24, now "vendor Hallmark as the design skill, and adopt taste-skill 2.5's ideas" (palettes and type dealt by trade, and its copy layer), and the estate redesign board, one artifact with a page per app.
- The owner's answer of 2026-11-10 to Q39: no bake-off, Hallmark redesigns every web UI.

**Runs before:** nothing.

**Before you start:** run `brief-board guide`, passing `--project churchix` to its commands ([corpus/CLAUDE.md](../../CLAUDE.md), "brief-board").

## Context

Churchix is a white-label platform that delivers presentation websites and a giving surface for Romanian Orthodox parishes. What gets redesigned is the **parish template**: the screens in `packages/ui` that every church site renders, shown with the one real parish, `apps/parohia-harlesti-bacau`. A parish site's job is to let a parishioner find the service times and the news, and to let someone give: IBAN first, Form 230, an SMS number, an optional hosted card link, and the pomelnice (a memorial-names form). The page is built from that job.

### What the template has (read 2026-11-10)

Screens, from `apps/parohia-harlesti-bacau/src/pages/`:

| Route | File | Notes |
|---|---|---|
| `/` | `index.astro` | `Hero` with the next service, `Rail`, pinned and recent announcements, a giving band |
| `/despre` | `despre.astro` | |
| `/program` | `program.astro` | the service schedule |
| `/anunturi`, `/anunturi/<slug>` | `anunturi/index.astro`, `anunturi/[slug].astro` | announcements |
| `/donatii` | `donatii.astro` | IBANs, Form 230, SMS, campaigns, optional card link |
| `/pomelnice` | `pomelnice.astro` | the `PomelnicForm.tsx` island posts to a church-configured endpoint |
| `/contact` | `contact.astro` | |
| 404 | `404.astro` | `layouts/ErrorLayout.astro` |

The shared parts are `packages/ui/src/layouts/BaseLayout.astro`, the `components/` (`Header`, `Footer`, `Hero`, `Rail`, `PageShell`, `Card`, `Button`, `Badge`, `Alert`, `GivingChannels`, `ServiceSchedule`, `CampaignCard`, `AnnouncementList`, `Field`, `SectionHeading`), and the islands `MobileNav`, `CopyIban` and `PomelnicForm`.

What its design docs fix today:

- **Ecclesia Digitalis**, a Material-3 system: burgundy, gold and cream, "reverent, formal, architectural" (`DESIGN.md`; [wiki/design-system.md](../../wiki/design-system.md)). The liturgical rail, the asymmetric hero and `PageShell` came from the redesign of 2026-06-18.
- **White-label by tokens.** A church re-skins from about four seed colours in its `site.json` `brand`, with every other role derived by `color-mix()` (`tokens.css`). Branding never forks components, and the shared packages hold no per-church value (`CLAUDE.md`, "Conventions"). A redesign is therefore **a new token set and layout**, never a per-church fork.
- **The parish keeps Cardo headings** (owner, 2026-11-04, [wiki/decisions.md](../../wiki/decisions.md)).
- Orthodox tone first; Romanian copy, with RO and EN at minimum; diacritics end to end; money in integer minor units; card data never touches the code (PCI SAQ A) ([CLAUDE.md](../../../CLAUDE.md), [wiki/conventions.md](../../wiki/conventions.md)).
- Bare `max-w-sm|md|lg|xl` collapse layouts in this theme (`packages/ui/scripts/check-max-w.mjs`).

## Owner decisions (defaults)

1. **The seed contract stays.** Default: the redesign changes the default seeds, the derived roles and the layout. A church still re-skins from the same four seeds. If Hallmark's trade palettes need more inputs, the proposal says which seed is added and why.
2. **Cardo stays for headings.** Default: yes, until the owner reopens it on the board.
3. **Tone.** Default: formal and liturgical. Hallmark's copy layer is used for structure and rhythm only. Every parish fact, time, name and IBAN comes from the church's content, and nothing is invented.
4. **Photographs.** Default: a parish supplies its own. The template ships none, and Hallmark's licensed set appears only in the board's mock-ups, labelled as such.

## Files you OWN

- `packages/ui/src/styles/tokens.css`, `theme.css`, `fonts.css`; `packages/ui/src/components/*`, `layouts/*`, `islands/*` (for look and layout).
- `apps/parohia-harlesti-bacau/src/pages/*` and `src/styles/app.css`; the church's `site.json` `brand` seeds only if the owner approves a change on the board.
- `DESIGN.md` and `docs/design/`, rewritten to the new system in the last commit; [wiki/design-system.md](../../wiki/design-system.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- The church content under `apps/*/src/content/`, `packages/schemas` (unless decision 1 adds a seed), and the giving logic (the IBAN, Form 230, SMS and endpoint behaviour).
- The root corpus and the sites under `sites/`.

## What to do

Steps 1 to 5 of "The steps all four redesigns share" in the root corpus's brief 05, with these specifics:

1. Screenshots of the nine routes above, at 1280 and 390 px, with the parish's seeds **and** with a second set of seeds (a different brand), kept out of git. A template redesign must hold for any church.
2. The proposal goes on Churchix's page of the estate redesign board.
3. After approval, one commit for the token change (`tokens.css`, `theme.css`, fonts), then one per screen in this order: `/`, `/donatii`, `/pomelnice`, `/program`, `/anunturi` and its entry, `/despre`, `/contact`, 404.

## Acceptance

- [ ] The common acceptance in the root corpus's brief 05 (step 6 there), for every route and with both seed sets.
- [ ] `npm run check` and `npm run build` pass, and `node packages/ui/scripts/check-max-w.mjs` prints `check-max-w: ok`.
- [ ] `/donatii` shows every IBAN, the Form 230 note and the SMS line the content holds, and the copy-IBAN control works from the keyboard (a Playwright test on the built page).
- [ ] The pomelnice form's labels, errors and success state are reachable by keyboard and a screen reader name (a Playwright accessibility-tree assertion).
- [ ] `grep -rn "harlesti" packages/ui/src` still prints only the one comment in `lib/base.ts:5`.
- [ ] The owner's approval on the board is recorded in [log.md](../../log.md) with the date, and `bash corpus/lint.sh` ends clean.

## Interplay

- Briefs 03 and 04 first. The parish sites keep the one look designed for each church (owner, 2026-11-10, Q18): the redesign adds no theme switch and no dark palette.
- The docs site renders selected corpus pages (`docs-site/scripts/sync-corpus.mjs`): update its page list if a wiki page is renamed.

## Outcome (2026-11-13)

Built on `main` as local commits: the approval log entry (`58f116d`), tokens and fonts (`f9bf80e`), Home (`1bbb365`), the Floor
checks (`7c71d49`), Donații (`15d6b51`), Pomelnice (`dcdd24d`), Program (`0101e6b`), the heading-font fix (`d8d8b06`), Anunțuri
(`b0b94ca`), the announcement page (`a7e761d`), Despre (`3d4833f`), Contact (`7d9bce7`), the 404 (`87b111c`), the Rail and its
tokens retired (`18a0bf3`), the layout and giving specs (`b3811a0`), page heads and arrows (`0fc5cc4`), docs (`85b0d05`), and this
closeout. Not deployed: owner step `node cli.ts churchix deploy` from the vps-deploy checkout (a static site).

- **Direction:** "The porch notice" (B; runner-up A, "Iconostasis, restored"). The two reopened decisions (the phone menu of
  2026-10-23, the 2026-06-18 redesign) are recorded as changed in [decisions](../../wiki/decisions.md); `DESIGN.md` and the
  [design-system](../../wiki/design-system.md) page are rewritten from what shipped. `docs/design/DESIGN.md` (the Stitch spec) got a
  "superseded" note and is otherwise untouched: it is a raw source.
- **Fonts:** Cardo, Inter and Source Serif 4 on `@fontsource` at exactly 5.3.0 (were `^5.3.0`).
- **Tokens:** new `primary-strong`, `secondary-strong`, `on-primary-variant`, `surface-highlight`, `--shadow-sm`, `--shadow-board`,
  `--text-display-md`, `--text-display-sm`, `--text-time(-mobile)`, `--text-wordmark(-mobile)`; re-derived `on-surface`,
  `on-surface-variant`, `surface-container`, `secondary-container`; `label-md` without tracking, weight 600. `--shadow-sm` also replaces
  Tailwind's default. Dropped, because nothing read them: `--text-overline`, `--font-overline`, `--text-display-xl`, `--font-display-xl`,
  `--text-display-lg`, `--font-display-lg`, the aliases `--brand-*`, `--ink`, `--ink-soft`, `--line`, `--bg`, `--space`, and BaseLayout's
  `--brand-*` emission. Left in the contract though no screen reads them: the `*-fixed` family, `surface-tint`, `inverse-primary`,
  `surface-dim`, `surface-bright`, `surface-variant`, `surface-container-highest`, the tertiary set, `inverse-surface`.
- **Rail** deleted (nothing else used it). Heading serif utility: `font-heading` was never generated by Tailwind (the theme only maps
  `font-headline-md` and friends), so `p`/`span` headings fell back to Inter; all uses are now `font-headline-md`.
- **Floor checks** (`churchix/e2e/`, own config, phone project `churchix` 390x844 and `churchix-desktop` 1280x800): `floor-contrast`
  (over the built `dist`, once with the parish's seeds and once with the second parish's laid over them, 404 included),
  `floor-focus` (copied from the root sites' check, which reads the first box-shadow and so reads a Tailwind ring's offset: it now reads
  the outermost 2 px shadow, once it has settled; it skips an embedded map iframe), `floor-motion`, `floor-overflow`; `layout.spec`
  (every route, both seed sets, the 69-character name on Home, at 1280, 1024, 960, 768, 390 and 360: no sideways scroll, every text
  line inside its nearest card or cell and inside every clipping ancestor, no control holding more than it shows; plus Home's first
  screen at 1280x800, 1366x768, 390x844 and 360x800: the name whole and above the fold, the time above the fold on desktops);
  `giving.spec` (every IBAN, the Form 230 note and the SMS line on /donatii, Copiază from the keyboard with the clipboard read back,
  Pomelnice's field names and Tab order, the error and the sent state by role and name); `mobile-menu.spec` (now the bar and the
  sheet that rises from it, plus the sheet's own close button); `shots.spec` (`SHOTS_DIR=<folder> npx playwright test -c e2e shots`).
  Run: `npx playwright test -c e2e` from `churchix/` (build the app first for the contrast spec). Last run: 25 passed, 9 skipped (the
  phone-only specs on the desktop project); the layout spec 31 passed.
- **Contrast minimums** (from the scripted run over the built pages, both seed sets; the board's table said 6.12 / 5.93 and 3.76 / 3.43,
  and the build matches it): text 6.12:1 (parish) and 5.93:1 (second parish), both `on-surface-variant` on the footer; icons 3.76:1 and
  3.43:1, `secondary-strong` on the Sunday row. The comp's table of 47 pairs holds for the tokens (same derivations).
- **First screens, no cut name** (name lines, time's bottom edge): 1280x800 2 lines / 618 px; 1366x768 2 / 556; 390x844 3 / 376;
  360x800 5 / 444. A 69-character name: 3 / 618, 3 / 556, 4 / 410, 6 / 478. At 390 and 360 the name takes the room and the giving card
  falls below the fold; the arch stays 96 x 116.
- **Compared with the comps** (the twins rendered with the fontsource files, same viewport, differing pixels at a 24/255 threshold,
  after hiding the board callouts; the twin shows the placeholder IBAN, so for Home and Donații the diff runs ran with a valid sample IBAN
  in a throwaway edit of `site.json`, reverted and never committed): Home 1.0% at 1280 and 6.3% at 390; Donații 2.3% and 10.6%; Program 1.7%
  and 10.8%; Pomelnice 15.8% and 18.6%. At 1280 every difference is antialiasing, the icon set (the comps draw their own strokes, the build
  uses the template's Material glyphs: church, bank, clock, download) and 1 to 4 px of vertical drift in single rows (the twin's
  `.cx ul{margin:0}` beats its own `.rows{margin-top}`; the build matches the twin's rendered result, not its CSS). At 390 the twin draws
  the bottom bar inline in the page (+64 px, and one more footer padding) where the build fixes it and pads the footer, so every page is
  16 to 46 px shorter and everything below the bar's row is offset. Pomelnice also differs by the dev server's demo submit, its hint and its
  dev caption (about 150 px), which the build, a production build, does not show; the note, the name cards and the chips match.
  The Home giving card shows no account lines in the build (the placeholder IBAN), where the comp shows them: the approved ruling.
  Shots (outside git): the estate build folder, `board/impl/churchix/`, as `<screen>-<seed>-<width>.png` for home, donatii, pomelnice,
  program, anunturi, anunt, despre, contact and 404, with `parish` and `seed2` seeds (and `long` for the 69-character name on Home) at
  1280, 1366, 390 and 360; Home also as `-fold.png`; and `pomelnice-error-*`, `pomelnice-sent-*`, `menu-open-parish-390` and
  `donatii-copied-parish-390`.
- **Undrawn screens restyled** (tokens and the direction's patterns, no new layout): /despre (history on a raised card, staff as plain
  cards), /anunturi and /anunturi/<slug>, /contact (details beside the map, the prayer-request form, its sent notice), the 404
  (`ErrorLayout`: the band holds the heading, a raised card the way home), the Home "no announcements" state (drawn on the direction
  sheet; Home used to hide the section), the optional card-payment block, the SMS card and the campaign cover and completed states of
  Donații (no content sets them; seen only in code), `Alert`, `Field` with its error state, `SectionHeading`, the phone Drawer (a
  titled sheet with its own close button) and the language switcher (header menu and Drawer list; the parish ships one locale, so it
  was restyled but never rendered).
- **Copy changes:** dropped `Rânduiala liturgică`, `Pomenire la Sfânta Liturghie`, `Pomenire`, `Dania ta`, `Istoric și hram`, `Vino la
  biserică` and `Vezi programul`, as the sheet says, and with them the same kind of eyebrow where the old code had one: `Din viața
  parohiei` on the /anunturi page head (it stays under `Anunțuri` on Home), `Coordonate` and `Scrie-ne` on Contact; `Slujitorii parohiei` on
  Despre is a plain line under `Conducerea parohiei`. `hram` is still on /despre (the `Hramul` heading). Middle-dot strings: Home's next
  service is split into name, day and time. The one `·` left is `<title>`'s `${title} · ${site.name}` in `BaseLayout`, which cannot
  be spans. No `·` string lives under `apps/*/src/content/`. Em dashes in the content and in the Form 230 and `Obiectiv atins — mulțumim!`
  strings stay (the sheet names no dash rule). The Title Case strings stay verbatim.
- **Floor "no invented facts":** the build adds no figure, name or claim. Every fact traces to `apps/parohia-harlesti-bacau/src/content/`
  (`site.json`, `schedule.json`, the announcements, campaign and staff entries) or to the old pages' copy; the Home facts card (hram,
  eparhie, Sfânta Liturghie) is the old page's hard-coded block. Grep: `grep -rn "30 ianuarie\|09:30\|Arhiepiscopia" apps/*/src`.
- **Deviations and findings for the controller:**
  - The validation error under Pomelnice's form is unreachable from the UI (the submit is disabled with no name, and the error is only
    set with no name); the spec drives it with `requestSubmit()`. The send-error state needs an endpoint, which the dev server never
    has, so it is not shot or tested. Form logic untouched.
  - In the dev server the Pomelnice note shows too (the comps' order), above a demo submit and a dev caption; a production build shows
    the note and no submit.
  - The header and footer still carry `transition:persist` in `BaseLayout`, so under the client router the header's current place can
    go stale after a soft navigation (it did before). The bottom bar does not persist, so its `aria-current` is right. Left as built.
  - `/termeni` and `/confidentialitate` (footer links) still 404, as the controller ruled; listed for the owner as an app bug.
  - The second parish's render keeps the burgundy logo disc, because `logo.svg` is an image with its own colours.
  - `PomelnicForm.tsx` is 501 lines (463 before); `check-structure` warns at 400 (rule 11), as it did before. Not split.
  - `CopyIban` and the `Button` hover use `primary-strong`; `hover:bg-primary-container` is gone everywhere except `Badge` and `Alert`.
  - `Divider` (a Byzantine cross rule) is unused by any page and left as it is.
  - Astro's dev toolbar shows in the dev-server shots.
