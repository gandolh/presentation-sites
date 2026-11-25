# Task 20: tavi, README, PRODUCT.md and DESIGN.md from what shipped, and the social card

**Depends on:** 09 to 19.

**Runs before:** nothing. The last tavi brief.

**Builder:** Sonnet ([routing.md](../../routing.md)): docs and one generated image.

**Before you start:** run `brief-board guide`, then `brief-board show 20`.

## Context

The site is built. This brief writes its docs to the repo's shape (`README.md`, `PRODUCT.md` and `DESIGN.md` at the
site's root; the impeccable skill reads the last two there), gives it the social card the other sites have, and lists
it in the repo's docs. There is no docs site in v1 ([decisions-tavi.md](../../wiki/decisions-tavi.md), "Where it
lives"), so `docs/adding-a-site.md`'s step 6 doesn't apply; its step 8 does.

subcort is the model for the card: `sites/subcort/scripts/gen-og.mjs` wraps its drawing in `scripts/og-card.html`
with the self-hosted faces, screenshots it in headless Chrome at 1200 x 630 and writes a palette PNG under 300 KB to
`public/images/og-image.png`. Tavi's card is the hero's drawing on paper with the wordmark and "Six beats every
second".

## Files you OWN

- `sites/tavi/README.md`, `PRODUCT.md`, `DESIGN.md`
- `sites/tavi/scripts/` (`og-card.html`, `gen-og.mjs`), `sites/tavi/public/images/og-image.png`,
  `sites/tavi/package.json` (`og` and the image tool subcort uses, at its pin), root `package.json` (`tavi:og`), the
  `og:image` and `twitter:` lines in `sites/tavi/src/layouts/Base.astro`
- `docs/README.md` (tavi's row), `docs/adding-a-site.md` (only if tavi taught it something), `docs/architecture.md`
  (if a line names every site)
- Corpus: `wiki/overview.md` and `wiki/status.md` (tavi from "planned" to built), `wiki/decisions-tavi.md` (only
  where what shipped differs), `log.md`

## Files you must NOT touch

- `design/`, the site's code beyond `Base.astro`'s head, other sites, the main README's picture table (it gets tavi's
  first screen once the site is live: an owner step).

## Steps

1. **`DESIGN.md`** rewritten from what shipped, not from the sketch: tokens by role, the part colours, type, spacing,
   motion and durations, the islands' play and speed contract, the fallback ladder, focus by subtraction, and where
   the site differs from `design/tavi/` and why.
2. **`PRODUCT.md`**: who it is for, the one thing, principles and anti-references, updated from brief 09's draft.
3. **`README.md`**, to the readme-docs skill's standard: what it is in two lines; run and build it at `/tavi`; how
   the drawings come from one part table at build time and the 3D island reads the same table; the tests
   (`npm run tavi:test`); the fallback ladder in five lines; why it is English; that it has no docs site.
4. **The social card**: `scripts/og-card.html` and `scripts/gen-og.mjs` after subcort's, a root `tavi:og`, the PNG at
   1200 x 630 under 300 KB, and absolute `og:image` and `twitter:image` through `absoluteUrl()`.
5. **The repo's docs**: tavi's row in `docs/README.md` ("Tavi Ceasornicaru, an interactive watch movement for a
   friend who mends wristwatches. English", live at `/tavi/`, no docs site); `docs/adding-a-site.md` if anything in it
   proved wrong. The corpus pages above.

## Acceptance

- [ ] `npm run tavi:og` writes `public/images/og-image.png`, 1200 x 630, under 300 KB.
- [ ] The built `index.html` carries absolute `og:image` and `twitter:image` URLs under `/tavi/`.
- [ ] Every link in the three site docs and `docs/README.md` resolves.
- [ ] `npm run check` exits 0; `bash corpus/lint.sh` passes.

## Owner steps

- Once the site is live: add its first screen to the main README's table (`docs/images/shots.md` says how the others
  were taken). End move: `done` while vps-deploy has no `tavi` stack; `ready_for_deploy` with
  `node cli.ts tavi deploy`, run from the vps-deploy checkout, once it has one. The controller says which.

## Owner decisions

- Settled 2026-11-24 (planner, the owner can change it): no docs site in v1.

## Outcome (2026-11-25)

- **The three docs** were rewritten from what shipped. `DESIGN.md` gained a chapters-and-figures table (chapter 2 as it
  is in the code: the train's ratios, then the figure turning over to the dial side), the Sound and reserve contracts,
  the ten `--color-tool-*` tokens, the ladder as built (hero island on `client:idle`, chapter 5 on `client:visible`) and
  a section on where the site differs from `design/tavi/` and why. `PRODUCT.md` gained the copy rule (true about
  watches, free about Tavi), the sound principle and the one shipped image. `README.md` was rewritten to the
  readme-docs standard: a hero picture (the card), run and build at `/tavi`, the part table and its two renderers, the
  five-rung ladder, the checks, the card, and why English with no docs site yet.
- **The card.** `scripts/gen-og.mjs` and `scripts/og-card.html` follow subcort's. The card draws the hero's movement
  with the page's own builder (`movementSvg`, pose `hero`, no callouts) and takes the colour tokens and the drawing's
  rules from `src/styles/global.css`, so a part colour change reaches it on the next run. Newsreader (opsz, roman and
  italic) and Plex Mono load from Fontsource. `npm run tavi:og` (root `tavi:og`) writes a 1200 x 630 palette PNG, 50 KB,
  and fails over 300 KB. `sharp` 0.35.5, subcort's pin, is a devDependency.
- **`Base.astro`** gained `og:image` (with width, height and alt) and `twitter:card`, `twitter:title`,
  `twitter:description` and `twitter:image`, through `absoluteUrl()`. The built page carries
  `https://<origin>/tavi/images/og-image.png` for both.
- **The repo's docs.** `docs/README.md` has tavi's row ("none yet" for the docs site, since brief 21 follows);
  `docs/architecture.md` says six sites; `docs/adding-a-site.md` step 6 says a docs site can follow the site. The
  corpus overview, status and decisions-tavi say built, not planned.
- **Brief 14** (chapter 2) is built on main but still sits in `todo/`; it was not closed here. Chapter 2 is described
  from the code.
- Not run: sloplint (the hallmark script is not in this container), left to the owner. The board was not updated:
  brief-board was not available in this session.
- **Owner steps.** Once the site is live, add its first screen to the main README's table. The site is not deployed
  since brief 11: `node cli.ts tavi deploy` from vps-deploy ships the rest.
