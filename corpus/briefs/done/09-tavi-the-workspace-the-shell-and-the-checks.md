# Task 09: tavi, the workspace, the page shell and the checks

**Depends on:** nothing. The first of the tavi briefs (09 to 20).

**Runs before:** every other tavi brief.

**Builder:** Opus ([routing.md](../../routing.md)): a new workspace and the repo's check wiring.

**Before you start:** run `brief-board guide`, then `brief-board show 09`.

## Context

Tavi Ceasornicaru is a new site in this repo: an interactive wristwatch movement on warm paper that the visitor winds,
slows down and takes apart, chapter by chapter, for a friend who mends wristwatches. The owner approved the sketch on
2026-11-24. Read, in this order:

1. [decisions-tavi.md](../../wiki/decisions-tavi.md): every settled call, including the ones that bend repo rules.
2. [design/tavi/README.md](../../../design/tavi/README.md): what each design file is, which wins, what is out of date.
3. `design/tavi/direction.md` (the tokens, type, chapters, motion and fallback ladder) and `design/tavi/sketch.html`
   with its source `design/tavi/gen/sketch.src.html` (the `:root` tokens and the header's markup and CSS).
4. [docs/adding-a-site.md](../../../docs/adding-a-site.md): the repo's checklist. This brief does steps 1 to 5 and 7;
   step 6 (a docs site) is not in v1 (decisions-tavi), step 8 is brief 20's.

This brief lays down the workspace, the stylesheet with every token, the layout, the header with its chapter links,
the Chapters drawer and the global Pause, empty chapter sections so every link lands, and the checks. The later
briefs only add drawings and chapters. tractari is the nearest site to copy patterns from (its `ui/Drawer.tsx`,
`MobileMenu.tsx`, `Base.astro`); copy patterns, not its look.

### The repo's check is red when you start

Commit `02c3a96` copied the sketch's generator (`design/tavi/gen/*.mjs`) into the repo. ESLint lints those files and
knip reports them as unused, so `npm run lint` and `npm run check:conventions` fail. Step 1 fixes that first.

### Pins

The repo's, exact: `astro` 7.3.5, `@astrojs/react` 6.0.4, `react` and `react-dom` 19.2.8, `@types/react` 19.2.18,
`@types/react-dom` 19.2.4, `tailwindcss` and `@tailwindcss/vite` 4.3.3, `@base-ui/react` 1.9.0, `@sites/kit` `*`;
dev `@astrojs/check` 0.9.10, `@types/node` 22.20.1, `typescript` 6.0.3. Fonts: `@fontsource-variable/newsreader`
5.3.0 (`opsz.css` and `opsz-italic.css` carry the optical-size axis; the family is "Newsreader Variable") and
`@fontsource/ibm-plex-mono` 5.3.0 (`400.css`, subcort's pin). `three` and `@types/three` 0.187.0 arrive with brief
16, so knip has nothing unused here.

### Where this brief differs from a skill, a repo rule or the sketch

- **English copy.** The root `CLAUDE.md` and `.claude/rules/sites.md` say the copy is Romanian. Add the exception:
  tavi is English, and English prose skills may run over its copy.
- **Light only**, against the base-ui skill's rule 14: no theme switch, `color-scheme: light`, one `theme-color`.
  The repo's other sites bend the rule the same way (one look per site). `DESIGN.md` says why.
- **The Chapters menu is a Base UI `Drawer`**, not the sketch's `<details>`: rule 15 and the repo's four phone menus
  ([site-patterns.md](../../wiki/site-patterns.md), "Phone menus"). Hydrate it with `client:media` for widths under
  64rem, so a desktop loads no React for it. Without scripting its trigger is hidden, and the contents band (brief 11)
  carries every chapter link, as the fallback ladder's rung 5 asks.
- **Fonts through Fontsource**, not the sketch's Google Fonts link: no third-party request.
- **The origin falls back to `https://example.com`**, not the real origin the other sites' configs carry: repo text
  never names the domain. vps-deploy passes `PUBLIC_SITE` at deploy (its own brief).
- **`noUncheckedIndexedAccess` is on from the first commit.** subcort and tractari keep it off for now; tavi has no
  code to fix, so ESLint's `unchecked-index-off` block doesn't list it.

## Files you OWN

- `sites/tavi/` (new): `package.json` (name `tavi-ceasornicaru`), `astro.config.mjs`, `tsconfig.json`, `README.md`,
  `PRODUCT.md`, `DESIGN.md`, `public/favicon.svg`, `src/layouts/Base.astro`, `src/pages/index.astro`,
  `src/styles/global.css`, `src/components/` (`Header.astro`, `ChaptersMenu.tsx`, `ui/Drawer.tsx`),
  `src/lib/playback.ts`
- Root: `package.json` (scripts), `package-lock.json`, `eslint.config.mjs`, `knip.config.js`,
  `scripts/check-fast.mjs`, `scripts/conventions.json`, `.vscode/launch.json`, `CLAUDE.md` (the opening paragraph,
  Commands' site list, the copy rule), `.claude/rules/sites.md` (the copy line), `docs/adding-a-site.md` (step 7's
  menu sentence, if step 3 below changes the menu spec's shape)
- `e2e/playwright.config.ts`, `e2e/mobile-menu.spec.ts`, `e2e/tavi.spec.ts` (new)
- Corpus: `wiki/status.md`, `wiki/architecture.md`, `log.md`

## Files you must NOT touch

- `design/` (read it; never edit it), the other sites, `churchix/`, `vendor/house-style/`.

## Steps

1. **Green first.** Add `design/**` to ESLint's `ignores` in `eslint.config.mjs` and to knip's `ignore` in
   `knip.config.js`, each with a comment matching `.prettierignore`'s ("approved design records, kept as exported").
   Run `npm run check`: it must pass on the repo as it is. Commit this alone.
2. **The workspace.** `sites/tavi/package.json` with the pins (scripts `dev`, `build`, `preview`, `astro`,
   `typecheck`: `astro check`; Node `>=22.12.0`). `astro.config.mjs` as the other sites' (base from `PUBLIC_BASE`,
   `@sites/kit` in `vite.ssr.noExternal`, React, Tailwind), with `site: process.env.PUBLIC_SITE ??
   "https://example.com"`. `tsconfig.json`: Astro's strict preset, the house flags the other sites set,
   `noUncheckedIndexedAccess`, and `allowImportingTsExtensions` (brief 10's `node:test` files import `.ts` paths).
   `npm install` at the root.
3. **The wiring**, per `docs/adding-a-site.md` steps 3, 4 and 7: root scripts `tavi`, `tavi:dev`, `tavi:build`,
   `tavi:preview` selecting `-w tavi-ceasornicaru`; `-w tavi-ceasornicaru` in the root `typecheck`; the folder in
   `scripts/check-fast.mjs`'s map; `sites/tavi/src` in ESLint's `web` list, in `scripts/conventions.json`'s `web` and
   in `check:conventions`' dependency-cruiser paths; a launch entry; `tavi` on port 4705 in
   `e2e/playwright.config.ts`. `e2e/mobile-menu.spec.ts` finds the menu button by the Romanian name "Deschide meniul";
   give its `menus` map a trigger name per site, "Chapters" for tavi, and say so in step 7 of `adding-a-site.md`.
4. **The stylesheet**, `src/styles/global.css` (the repo's one stylesheet name): `@import "tailwindcss"`; `@theme`
   with every token in `gen/sketch.src.html`'s `:root`, values copied exactly: the UI colours, every part's fill, line,
   prose shade and the ghost pair, the type scale (display at optical size 72, body 17px, step prose 19px, the two
   `clamp()` heads), spacing 2 to 144px, radii 6, 8 and 14px, the 1360px container, durations 120, 220 and 420ms and
   the `cubic-bezier(0.16, 1, 0.3, 1)` ease. Emit the part colours with `@theme static`, so the 3D island can read them
   at runtime (decisions-tavi, "Colours"). `@layer base`: the paper ground, ink, the 2px focus ring, `::selection`,
   `.fig` in Plex Mono with `tabular-nums`. Import the fonts in `Base.astro`'s frontmatter, as subcort does.
5. **The layout**, `Base.astro`: `<html lang="en">`, the title "Tavi Ceasornicaru" and the sketch's description,
   canonical and `og:` URLs through `absoluteUrl()` from `@sites/kit`, a small drawn favicon (a wheel or a balance in
   the part tokens). A small `is:inline` head script sets the `js` class on `<html>` and `data-playing` (`"false"`
   under `prefers-reduced-motion: reduce`, else `"true"`) before the first paint.
6. **The play state**, `src/lib/playback.ts`: `isPlaying()`, `setPlaying(on)` and `subscribe(listener)` over
   `data-playing` on `<html>` and one `tavi:playing` event. Every Pause on the page goes through it; later islands
   read it with `useSyncExternalStore`.
7. **The header**, as the sketch draws it: the skip link to `#energy`, the italic wordmark linking to `#top`, seven
   numbered chapter links (1 Energy, 2 Wheels, 3 Escapement, 4 Balance, 5 Together, 6 The bench, 7 Repairs), and the
   global Pause: a plain `<button>` whose label flips between Pause and Play and whose `aria-label` says what it does
   to every moving drawing, wired by a module script through `playback.ts`, hidden without scripting. Below 64rem the
   links fold into `ChaptersMenu.tsx`: a `Drawer` through `src/components/ui/Drawer.tsx` copied from tractari's, its
   look from the tavi tokens, a `Drawer.Title` of "Chapters", closing on a swipe up, a tap outside, the X or Esc, and
   a link closing it the way tractari's does. Sticky as the sketch makes it. The current-chapter mark comes in brief 12.
8. **The page**, `index.astro`: the header, `<main id="top">`, an empty hero section, then one section per chapter
   with its id and head only: `energy` "1. Energy, wound into a spring", `wheels` "2. Wheels, hours into seconds",
   `escapement` "3. Escapement, let out tooth by tooth", `balance` "4. Balance, six swings a second", `together`
   "5. Together, apart and back again", `bench` "6. The bench, Tavi's tools", and a footer stub with `id="repairs"`.
   Every header link lands. The chapter briefs may reword their heads.
9. **The site's docs.** `DESIGN.md` from `direction.md` and decisions-tavi, in the shape the hallmark skill's
   design-md reference gives: palette and part colours, type, spacing, radii, motion, the islands' play and speed
   contract, the fallback ladder. It is the locked system the later briefs read. `PRODUCT.md`: who it is for (Tavi,
   his friends, anyone curious how a watch keeps time), the one thing (understand a watch by playing with one),
   principles (drawn not photographed; the repair line stays quiet; English; light; everything can stop),
   anti-references (a ciechanow.ski clone, a luxury-watch template, a SaaS landing page). `README.md`: what it is, how
   to run and build it at `/tavi`, that brief 20 finishes it.
10. **`e2e/tavi.spec.ts`**, the site's own checks, which later briefs extend: each header link lands on an element
    with that id; the global Pause flips `data-playing` and its label; with reduced motion the page loads with
    `data-playing="false"`; with JavaScript off the Pause is not visible.
11. **The repo's own text**: root `CLAUDE.md` (tavi in the opening paragraph and the Commands list; the copy rule
    with tavi's exception), `.claude/rules/sites.md` (the same exception). Corpus: `status.md` (tavi's line: the
    workspace exists), `architecture.md` if the shape differs from the standard site, a `log.md` entry.

## Acceptance

- [ ] Step 1's commit stands alone, and `npm run check` passes at it.
- [ ] `npm run check` exits 0 with tavi in every step: `astro check`, ESLint, Prettier, knip, dependency-cruiser,
      `check-base-ui` strict, `check-structure`.
- [ ] `PUBLIC_BASE=/tavi npm run tavi:build` builds. Every `src` and `href` in `sites/tavi/dist/index.html` that loads
      a file starts with `/tavi/`; the canonical reads `https://example.com/tavi/` when `PUBLIC_SITE` is unset.
- [ ] A `git grep` over `sites/tavi` for the real domain, a machine path and a username finds nothing (type the
      patterns at the prompt; never write them into the repo).
- [ ] In the dev server's network log, the only fonts are Newsreader and IBM Plex Mono, and no request leaves the
      origin.
- [ ] `SITES=tavi npx playwright test -c e2e` passes: the Floor specs (contrast, focus, motion, overflow), the menu
      spec at 390 px with "Chapters", and `tavi.spec.ts`.
- [ ] At 1280 x 800 and 390 x 844 the header reads as the sketch's (shots beside `design/tavi/sketch-*.png`, kept
      out of git; differences listed in the outcome).
- [ ] `bash corpus/lint.sh` passes.

## Owner steps

- None. End move: `done` while vps-deploy has no `tavi` stack (the first `node cli.ts tavi deploy` then ships every
  tavi brief built so far); `ready_for_deploy` with `node cli.ts tavi deploy`, run from the vps-deploy checkout, once
  it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (owner): English only, light only, drawn only, no contact details, a path like the other sites.
- Settled 2026-11-24 (planner): no docs site in v1; the origin from `PUBLIC_SITE` with the `example.com` fallback.

## Outcome (2026-11-24)

Built on `main` as local commits: `a16ab3d` (design/ out of ESLint and knip, alone, with `npm run check` green at it),
`761d57a` (the workspace), `20a7e82` (the wiring), `b0a4138` (the stylesheet), `65f30d0` (the layout and favicon),
`3be7583` (`playback.ts`), `4f9e826` (the header and the Chapters drawer), `47388fe` (the page), `dca0fd5` and
`521e2ab` (DESIGN.md, PRODUCT.md, README.md), `af9f5c2` (`e2e/tavi.spec.ts`), `5399dfc` (the repo's own text), plus
this closeout. Not deployed: vps-deploy has no `tavi` stack yet, so the board move is `done`; its first
`node cli.ts tavi deploy` ships every tavi brief built by then.

- **What later briefs build on.** `src/styles/global.css` holds every sketch token and the rules for `.wrap`,
  `.skip`, the header (`.site-head`, `.site-head-row`, `.wordmark`, `.chapters`, `.chapters-menu`), `.quiet`, `.hero`,
  `.chapter`, `.chapter-head` and a `.site-foot` stub. `src/lib/playback.ts` exports `isPlaying()`,
  `setPlaying(on)` and `subscribe(listener)` over `data-playing` on `<html>` and one `tavi:playing` event on
  `document`. The `no-js:` variant hides a control without scripting; `.if-playing` and `.if-paused` show what a play
  control says from the first paint. The header's seven links live in `Header.astro`'s frontmatter and are passed to
  `ChaptersMenu.tsx`.
- **Token names.** Most are the sketch's. Renamed into Tailwind's namespaces: `--part-*` became `--color-part-*`, the
  ghost pair `--color-ghost-fill` and `--color-ghost-line`, `--container` became `--container-page`, and the font
  family is "Newsreader Variable". Spacing keeps `--space-*`: as `--spacing-*`, Tailwind 4 also sizes `max-w-lg` and
  the like from it (checked against the compiler). Tailwind's own palette, type scale and radii are reset. The part
  colours are `@theme static`; the other tokens reach the built CSS once something uses them. The full table is in
  `sites/tavi/DESIGN.md`, "Tokens".
- **The header against the sketch** (shots at 1280 x 800 and 390 x 844, kept out of git, compared by eye with
  `design/tavi/sketch-*.png`): the wordmark, the numbered links, the Pause and the phone's Chapters button and
  icon-only Pause match. Differences: the open menu is a full-width panel under the header with a "Chapters" title row
  and an X (the sketch's is an 18rem dropdown from a `<details>`); the fold is `width < 64rem`, so at exactly 1024 px
  the links show where the sketch shows the menu; the hero holds only its head until brief 11.
- **Deviations.**
  - The Chapters drawer hangs under the header, mounted in it (`contain: layout` on `.site-head`, subcort's
    pattern), so it sits right under the header whether the header sticks (above 40rem) or scrolls away (at 40rem and
    under). A transparent backdrop below it catches the tap outside.
  - `ui/Drawer.tsx` is tractari's wrapper with an optional `titleClassName` (the title shows in the panel) and the
    `--dur-long` duration in place of 300ms.
  - `e2e/mobile-menu.spec.ts`'s map names each menu's island, button, title and X (the brief asked for the button's
    name only): tavi's island is `ChaptersMenu`, and its X is "Close the chapters". The button is found by its exact
    name.
  - The Pause's visible label and icon follow `data-playing` in CSS; the module script sets only its `aria-label`
    ("Pause every moving drawing" or "Play every moving drawing").
  - The hero has its `<h1>` ("Six beats every second") and the footer stub its `<h2>` ("Tavi repairs wristwatches"),
    so the page has a heading outline; the hero and footer briefs fill them in.
  - The dev toolbar is off in `astro.config.mjs`, as in subcort's: it is a tab stop the Floor focus check would report.
  - `tavi.spec.ts` also checks that every request stays on the origin and that the only fonts are Newsreader and Plex
    Mono, so the network acceptance runs on every pass.
- **Checks.** `npm run check` passed at `a16ab3d` and after the last code change. `PUBLIC_BASE=/tavi npm run
  tavi:build`: every file-loading `src` and `href` starts with `/tavi/`, the CSS's font URLs too, and the canonical is
  `https://example.com/tavi/`. `SITES=tavi npx playwright test -c e2e` (after `npm run tavi:build` at `/`): 25 passed,
  the Floor specs (lowest text contrast 6.90:1 at 1280, 13.98:1 at 390), the menu spec at 390 and `tavi.spec.ts`. The
  menu spec also passed on subcort and tractari after its map changed. The dev server's network log: every request on
  the origin, Newsreader roman and italic the only faces loaded, no React chunk for the menu at 1280 (only the dev
  server's own `@react-refresh`).
- **For later.** `wiki/site-patterns.md` still says the repo has four phone menus; tavi's is the fifth, placed like
  subcort's. `wiki/overview.md` still calls tavi "not built".
