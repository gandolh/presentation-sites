---
summary: Where each site stands (updated 2026-11-25: saloon, auto-service, subcort and tractari are redesigned and wait on deploys; tavi, a new English watch site, is being built through briefs 09-20: its workspace, page frame, checks, part table, the hero, the contents band and the footer exist, the rollout put them live, chapter 1 runs on the chapter engine with its Wind and Take apart, chapters 3 and 4 are drawn by a clock-driven frame loop, the 3D movement replaces the drawing on the hero and in chapter 5, chapter 5 takes it apart in seven steps with labels, a parts list on phones and turning, and chapter 6 draws Tavi's bench and tools from a tool table), the recent work per area, and what this root corpus does versus the per-site docs. The living dashboard: start here after a break.
updated: 2026-11-25
---

# Status — 2026-11-02

## Where things stand

tavi (Tavi Ceasornicaru) is planned (2026-11-24): an interactive watch movement on warm paper, English and light only, drawn not photographed. The owner approved the sketch's direction A, "The workshop explained", and the record is `design/tavi/`. Briefs 09-20 build it one at a time, on the board ([decisions-tavi.md](decisions-tavi.md)). Since brief 09 (2026-11-24) the workspace exists (`sites/tavi`, package `tavi-ceasornicaru`, root scripts `tavi:*`) with every sketch token in its stylesheet, the header with its seven chapter links, the Chapters drawer and the global Pause, the chapter sections with their heads, and its checks (`npm run check`, `e2e/tavi.spec.ts`, the Floor specs, the menu spec); `design/` is out of ESLint and knip, so `npm run check` is green again. Since brief 10 (2026-11-24) the movement is one part table and clock in `sites/tavi/src/movement/` (tested by `npm run tavi:test` inside `npm run check`), drawn as SVG at build time by `Movement.astro`; the hero shows it ticking in CSS. Since brief 11 (2026-11-24) the first screen has its words, the blue button and the drawing in one sized box (`.hero-stage`, where the 3D island will mount), with the contents band (two columns on a phone) and the footer (the repair line, Tavi's line as a dashed placeholder, no contact line) under it; the design-critic's fixes after it landed with brief 12. Since brief 12 (2026-11-24) chapter 1 runs on the chapter engine: prose steps beside a sticky figure whose state lives on the element (`lib/figure.ts`), a module script for the steps, the part names (focus by subtraction) and the current-chapter mark (`lib/chapters.ts`), and each figure's tray island (Base UI Pause and Speed). Since brief 13 (2026-11-24) chapter 1's tray has Wind (the mainspring coils, 0 to 41 h) and Take apart (the barrel's bridge, ratchet wheel, crown wheel and click lift off) on a Base UI `Slider`, every Pause is a toggle that shows pressed while paused, and the tray is two rows on a phone and one row from 50 to 64rem. Since brief 15 (2026-11-25) chapters 3 and 4 are close-ups drawn by the clock rather than by CSS: `lib/clockFigure.ts` runs one frame loop per figure that poses the escape wheel, the pallet fork, the balance and the hairspring from `stateAt(t)` (only while the page plays, the figure is on screen and the tab is visible); chapter 3 opens at 1/10 and each of its first four steps holds one phase of a beat (`data-hold`, the tray's Pause pressed until it is released); the pallet stones are cut from the clock's own motion (`movement/svg/escapement.ts`); chapter 4 shows the hairspring breathing, the lift window and the amplitude. The dev hook `window.taviPose` poses `escapement` and `balance`. Since brief 16 (2026-11-25) the 3D movement is one React island, `components/together/MovementFigure.tsx`, with the scene in `src/three/` (three.js 0.187.0, bundled, imported only by the island), mounted on the hero (`client:idle`) and on chapter 5 (`client:visible`, 200px early), each with its drawing as the poster it replaces in the same box on the fallback ladder: the first frame is the poster's flat view, aligned to the pixel, and the first drag or arrow key eases to the prototype's 34 degree tilt. A phone that opens chapter 5 before the hero has loaded three.js gets a "Turn it in 3D" button; without WebGL the poster stays (chapter 5 says so in one line); a lost context swaps the poster back. Since brief 17 (2026-11-25) chapter 5 takes the movement apart in seven steps, in the order a watchmaker does (the balance cock and balance, the pallet bridge and fork with the winding parts, the two big bridges, the wheels and the barrel, everything apart, put back), each step setting Take apart and, for steps 2 to 5, framing, lighting and labelling its own parts. Its tray (`components/together/TogetherTray.tsx`) has a Take apart / Put back button that runs the slider over the prototype's timing, Take apart, and Turn (shown only with the 3D view; a drag or the arrow keys write back to it). On a desktop the 3D view labels the parts in two columns, laid out by a pure function (`src/three/labels.ts`, tested in `labels.test.ts`) so no two leaders cross, each label a button and fading while its anchor is behind another part; a click lights a part and drops the rest to the ghost pair, in 3D as in the drawings. Phones get a parts list under the figure (`PartsList.tsx`): a press lights and frames the part, with its label alone. The figure keeps the choice as `data-pick` and the turn as `data-turn` (`lib/figure.ts`). Without the 3D view the `whole` poster comes apart too, through lift groups from the part table's windows, and the parts list lights its parts. `taviPose` poses `hero` and `together` (with `turn`). Since brief 18 (2026-11-25) chapter 6 draws Tavi's bench from above at real size, in millimetres on the mat: a typed tool table and its SVG builders in `sites/tavi/src/bench/` (tested in `bench.test.ts`: every tool on the mat, none on another, the movement at the NH35's 27.4 mm, the loupe's lens over the balance), with Bergeon's 4040 holder and the hero's drawing in it, standing still, a 2611 loupe, the 30081 set of five screwdrivers in their colour code, a Dumont No. 5 and a brass pair of tweezers, a 7013 oiler and an oil cup. Its six steps light the whole bench, then each tool, focus by subtraction; each tool's name in the prose lights it (`bench/ToolName.astro`); step 3 slides the loupe over the balance, the one thing that moves, so the figure has no tray. The coloured caps and the loupe's body brought ten `--color-tool-*` tokens. The pager goes on to the footer's chapter 7. vps-deploy has a `tavi` stack, and the owner's 2026-11-24 rollout deployed the site as brief 11 left it. Owner todo: Tavi's own line for the footer ([todos/tavi-own-line.md](../todos/tavi-own-line.md)).

saloon is redesigned as "Menu beside the work" (brief 06, 2026-11-13): a blush-cream ground with raised cards and bands, the Services menu card beside the photo on the first screen, a phone booking bar docked from the first paint (WhatsApp and call), a gold-ink focus ring; Fraunces and Manrope pinned at 5.3.0; saloon's own Playwright spec is `e2e/saloon.spec.ts`. Waits on a deploy.

subcort is redesigned as "On your ground" (brief 07, 2026-11-13): a sage plot with a 32 px grid behind the hero and page heads, white cards and panels with head bands on it, the tent large on the plot with the title block (the `Zonă` cell first on a phone), Commissioner with Plex Mono for figures, an ink-filled size picker; the hero's WebGL motion and reduced-motion still are unchanged; subcort's own Playwright spec is `e2e/subcort.spec.ts`. Waits on a deploy.

tractari is redesigned as "Lines first" (brief 08, 2026-11-13): the hero is type on cold asphalt with a board of three named phone lines, the 3D scene moved to a plate in Cum funcționează, the road spine and gsap are gone, near-black ink on every orange, and one observer on the dispatcher's plate drives the header call and the phone dock. Waits on `node cli.ts tractari deploy`.

auto-service is redesigned as "The job card" (brief 05, 2026-11-13): warm graphite, one pinned light card with the call, Encode Sans, no Bordcomputer; the root `e2e/` now holds the shared Floor checks (contrast over the built pages, focus ring, reduced motion, 390 overflow) that saloon, subcort, tractari and churchix reuse. Waits on a deploy.

The four phone menus are `Drawer`s through each site's `ui/Drawer.tsx` since 2026-11-12 (brief 04), `check-base-ui` is strict, and `npm run test:e2e` runs the menus' Playwright spec.

Base UI is pinned exactly at 1.9.0 in every site (saloon was the last on a range; brief 02, 2026-11-10).

The house style is checked since 2026-11-11 (brief 03): Prettier at width 120 with the Astro plugin, the house ESLint config with an Astro layer, `astro check` in every site, `npm run check` and `npm run check:fast` ([decisions-house-style.md](decisions-house-style.md)). Waits on a deploy of the four live sites and design-study.


All six projects build — the five sites under `sites/` and churchix. Since the
2026-08-23 snapshot, `design-study` joined the workspace and **every site gained a
docs site** at `sites/<site>/docs-site/` (`eda07a0`; Starlight, on Docusaurus since 2026-10-19), built with
`npm run <site>:docs` and deployed at `/<site>/docs/` — see
[architecture.md](architecture.md#docs-sites). The repo is in a **maintenance + demo** phase rather than
active feature work: the two real client sites (`saloon`, `auto-service`) are
code-complete and waiting on human/real-data steps, the two demos (`subcort`,
`tractari`) are finished showpieces, and `churchix` is the only one with an open
product roadmap.

This root corpus was bootstrapped on **2026-08-23** when the repo was adapted to
`my-personal-skills` v0.29.0. It is deliberately **thin**: it covers the monorepo
itself — layout, cross-site conventions, decisions. Per-site detail stays in the
per-site docs and is *not* duplicated here.

## Per-site

| Site | State | Its own docs |
|---|---|---|
| `saloon` | Code-complete; redesigned 2026-11-13 as *Menu beside the work* (see [decisions-ui.md](decisions-ui.md)). Blocked on real data + human actions (accounts, credentials). The `marketing/bots/` service runs fully in mock mode; live wiring pending. | [`sites/saloon/docs/STATUS.md`](../../sites/saloon/docs/STATUS.md), [`docs/ADR.md`](../../sites/saloon/docs/ADR.md) |
| `auto-service` | Code-complete, redesigned 2026-11-13 as *The job card* (a pinned light card carrying the call on warm graphite; the 2026-08-23 *Bordcomputer* world is retired, see [decisions-ui.md](decisions-ui.md)). Full page set, legal pages, JSON-LD, consent-gated map, verified sub-path build. **No photography by decision** — the workshop is drawn and the gallery was removed. | [`sites/auto-service/docs/STATUS.md`](../../sites/auto-service/docs/STATUS.md) |
| `subcort` | Demo, complete. Reworked twice on 2026-08-23 (a *scoarța* system, then **Montaj**, the site as a drawing set) and redesigned 2026-11-13 as *On your ground* (a sage plot with cards and panels on it; see [decisions-ui.md](decisions-ui.md)). One marquee model in `src/lib/draft.ts` drives every graphic (WebGL hero, exploded plate, scale plan, OG card); ink for the object, one orange for annotation; no photography. | [`subcort/PRODUCT.md`](../../sites/subcort/PRODUCT.md), [`DESIGN.md`](../../sites/subcort/DESIGN.md) |
| `tractari` | Demo, complete; redesigned 2026-11-13 as *Lines first* (type on asphalt, a board of three named phone lines, the Three.js night-road scene as a plate in Cum funcționează; see [decisions-ui.md](decisions-ui.md)). | [`tractari/PRODUCT.md`](../../sites/tractari/PRODUCT.md), [`DESIGN.md`](../../sites/tractari/DESIGN.md) |
| `tavi` | **Being built since 2026-11-24**: the workspace, page frame and checks (brief 09); the part table, the clock and the hero's drawing (brief 10); the hero, the contents band and the footer (brief 11), live since the 2026-11-24 rollout; the chapter engine on chapter 1 (brief 12) and its Wind and Take apart (brief 13), chapters 3 and 4 drawn by the clock (brief 15), the 3D movement on the hero and in chapter 5 (brief 16), chapter 5 taken apart with labels, a parts list and turning (brief 17), chapter 6's bench and tools drawn (brief 18), not deployed yet. An English watch site for a friend who mends wristwatches: a drawn movement you wind, slow down and take apart over seven chapters, with a three.js centrepiece in chapter 5. Briefs 09-20. | [`tavi/PRODUCT.md`](../../sites/tavi/PRODUCT.md), [`DESIGN.md`](../../sites/tavi/DESIGN.md), [`design/tavi/README.md`](../../design/tavi/README.md), [decisions-tavi.md](decisions-tavi.md) |
| `design-study` | **New, 2026-08-23.** Not a marketing site — a UI/UX study. One fictional blog (*Ratio*, 12 posts, 18 shared placeholders) rendered in 14 design languages, content held constant so only design varies. 183 static pages; each theme owns its markup, layout and CSS, and loads only its own fonts. No Tailwind. The written half is 14 per-style dossiers carrying image-treatment recipes and prompt descriptors — see [`design-styles.md`](design-styles.md). | [`design-study/PRODUCT.md`](../../sites/design-study/PRODUCT.md), [`DESIGN.md`](../../sites/design-study/DESIGN.md) |
| `churchix` | Active product. One church app (`apps/parohia-harlesti-bacau`) on the shared packages. Runs its own corpus since 2026-10-07. Docs site on Docusaurus 2026-10-21, phone menu on Base UI 2026-10-23; open: the brand seeds lose to the token defaults in built pages. | [`churchix/CLAUDE.md`](../../churchix/CLAUDE.md), [`churchix/corpus/index.md`](../../churchix/corpus/index.md), [`churchix/corpus/wiki/status.md`](../../churchix/corpus/wiki/status.md) |

## Recent work, by area

- **Security and workspace** (2026-10-01). Astro's RCE advisory and the
  js-yaml/svgo findings cleared at the root and in churchix; root scripts pick
  sites by package name so the nested docs-sites stop matching; dead per-site
  Vite overrides gone ([site-patterns.md](site-patterns.md)).
- **Head URLs and social cards** (2026-10-02). Canonicals, `og:*` and JSON-LD
  are absolute at the production origin plus `/<site>/`; saloon, subcort and
  tractari got PNG cards ([decisions.md](decisions.md),
  [site-patterns.md](site-patterns.md)).
- **Site fixes** (2026-10-01). tractari's hero pauses off-screen, opening
  hours come from one `HOURS` list, design-study's arrow keys stay on a
  focused carousel, and the saloon bots webhook caps bodies at 1 MiB.
- **Docs sites** (2026-10-19). All five on Docusaurus, links to source files
  going to GitHub ([architecture.md](architecture.md#docs-sites)).
- **Copy** (2026-10-19). tractari's hero lede no longer runs "sau" into the
  last county; the saloon and auto-service terms pages had the same wrap.
- **Phone menus** (2026-11-12). The four sites' menus on Base UI `Drawer` (swipe,
  tap outside, X, Esc), about +30 kB gzip a site over the hand-built ones
  ([decisions-ui.md](decisions-ui.md)). Waits on a deploy of the four sites.
- **churchix** got a corpus of its own on 2026-10-07.

Not known to be deployed yet: the copy fix
(tractari, saloon, auto-service), the five Docusaurus docs sites (vps-deploy
flipped their asset checks on 2026-10-19) and the phone menus. Brief 01,
[Hallmark against taste-skill on one site](../briefs/superseded/01-hallmark-against-taste-skill-on-one-site.md),
was filed on 2026-11-09 and waits on the owner's grilling of 2026-11-10; brief
numbering restarted at 01 on 2026-11-02 (see
[log.md](../log.md)). New work: capture in [`todos/`](../todos/), promote to
[`briefs/todo/`](../briefs/todo/).

## Note on the two doc layers

Every project now uses one shape: `README.md` + `PRODUCT.md` + `DESIGN.md` at its
root, everything else under `docs/`. This corpus owns the *monorepo* layer and
links down; it does not duplicate per-site content. See
[decisions.md](decisions.md) for why `corpus` names only this workspace.
