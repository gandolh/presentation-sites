# Task 01: Hallmark against taste-skill 2.5 on one site

## Context

On 2026-11-09 the owner had the skills library review popular repos for
ideas that help their apps. Two of them are design skills aimed squarely at
what this repo makes: websites for small businesses.

- **nutlope/hallmark** (`407fa68`, 2026-11-05, MIT, Together AI): "a design
  skill that refuses to look AI-generated".
  - It has fifty themes, each "a material, not a plan" of at most 8 KB with
    a picture of a finished page.
  - The page is built from the job: a booking page books, a shop sells, and
    the page ends on that action.
  - It uses 755 openly licensed photographs, credited on the page.
  - A browser lint checks for machine-made tells, in tiers: the **Floor**
    never ships (contrast, focus, reduced motion, invented facts, a broken
    phone layout), **Reflex** gates can be overruled on the record, and
    **Finish** checks are craft.
  - `redesign` and `audit` work by path.
  - The skill folder is 7.2 MB.
- **leonxlnx/taste-skill 2.5.1** (`f6b7657`, 2026-11-07, MIT): a rebuild of
  `design-taste-frontend` around professional company websites.
  - One page system, palettes and type dealt by trade
    (`--trade "cafe"`), licensed stand-in photographs, a copy layer and
    motion.
  - A browser checker with over 100 checks at four widths, and a finish
    gate.
  - The folder is 40 MB.

  The owner's skills library vendors an older taste-skill (2.1-era,
  `72e2995`). Its brief 24 holds that copy on purpose until this bake-off
  picks a winner.

This repo builds each site by hand with impeccable's design artifacts
(`PRODUCT.md` and `DESIGN.md` per site; see `architecture.md`). Each site
has its own style dossier from `sites/design-study/docs/styles/`
([design-styles.md](../../wiki/design-styles.md)), and Base UI is used
under the phone menus ([decisions-ui.md](../../wiki/decisions-ui.md)).
Sites are static Astro under the shared VPS.

## Owner decisions (defaults)

1. **The test page.** Default: the **auto-service** home page (BavAuto
   Gorj, a BMW repair garage in Târgu-Jiu). It has a real business, real
   content in Romanian, a booking action (call or WhatsApp) and a clear
   trade. The current page is the baseline.
2. **The rules of the bake-off.**
   - Both skills get the same brief: auto-service's `PRODUCT.md` and its
     real content.
   - Each builds into a throwaway Astro page under
     `sites/design-study/bakeoff-<date>/`, never in the live site.
   - Each runs its own checker to green.
   - Then both, and the current page, are judged on the same sheet:
     - the action placement and the phone layout at 390 px;
     - copy in Romanian that reads native;
     - whether anything looks generated;
     - Lighthouse performance and accessibility;
     - the bytes shipped;
     - how much of the result survives being moved into the Astro site's
       components.
3. **What the result decides.** Default: the winner becomes the
   company-site skill in the owner's library (brief 24 vendors it), and the
   next new site in this repo is built with it. The loser isn't vendored.
   The owner judges. The agent prepares the sheet and the screenshots, and
   doesn't pick.

## Files you OWN

- `sites/design-study/bakeoff-<YYYY-MM-DD>/` (new): the two builds, the
  screenshots (gitignored, or WebP under 300 KB each) and `RESULT.md` with
  the sheet.
- `corpus/wiki/design-styles.md` (a short section linking the result),
  `status.md`, `log.md`.

## Files you must NOT touch

- `sites/auto-service/`, and every other live site.
- `churchix/`.

## What to do

1. Install both skills for this session only: Hallmark from its repo at
   `407fa68`, and taste-skill 2.5.1 with its `install.sh` at `f6b7657`. Note
   the exact commands in `RESULT.md`.
2. Run each with auto-service's brief, and let each finish its own gate.
   Record the time taken and anything it got wrong about the business.
3. Take screenshots of the current page, Hallmark's and taste's at 1440 and
   390 px. Run Lighthouse on all three.
4. Fill in the sheet. Then try moving the better parts of each into an Astro
   component, and note what broke: dependencies, the kit's runtime JS,
   fonts.
5. Hand the owner the sheet and stop.

## Acceptance

- `RESULT.md` has the filled sheet, the commands, the timings and links to
  the screenshots for all three pages.
- No live site changed (`git diff --stat` touches only `design-study/` and
  `corpus/`).
- `log.md` has the entry, and the skills library's brief 24 can read the
  result from this repo.
