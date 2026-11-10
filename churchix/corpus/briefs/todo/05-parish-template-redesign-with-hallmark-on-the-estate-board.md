# Task 05: A redesign of the parish template with Hallmark, on the estate board

**Depends on:**

- In Churchix: brief 03 (the harness) and brief 04 (Base UI by the conventions).
- In the root corpus of this repo: its brief 05, [A redesign of auto-service with Hallmark, on the estate board](../../../../corpus/briefs/todo/05-auto-service-redesign-with-hallmark-on-the-estate-board.md). Its section "The steps all four redesigns share" holds the steps and the acceptance every redesign shares: screenshots, a proposal on the board, the owner's approval, a token change first, then one screen per commit, and the Floor checks. They are not repeated here.
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
