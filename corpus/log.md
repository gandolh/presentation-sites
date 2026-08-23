# Log

## [2026-08-23] design | subcort reworked again — *Montaj*, the site as a drawing set

The *scoarța* rework shipped earlier the same day was rejected by the owner as
"too traditional" — a fair read: the rug reference carries heritage whether or
not the grammar is used structurally. Re-rolled the direction round (round 2 of
re-rolls), which eliminated every candidate shown so far, and derived a fresh
grounded list from contemporary angles.

Four were built as **rendered comps** rather than described, at the owner's
request, all drawing the *same* 15 × 10 m marquee so the comparison was fair:
A Tensiune (engineered wireframe, signal-orange load paths), B Semnal (Swiss
transit signage — the roll's assignment), C Montaj (exploded axonometric
assembly drawing), D Volum (architecture-studio minimalism). The owner picked
**C**.

Why it holds: Subcort's product is not a tent, it is an *erection* — somebody
arrives, puts a structure up to plan, and takes it away. The artifact that
already exists for that work is a drawing. So the site is the drawing set:
numbered plates, one shared model, exploded views, dimension lines, numbered
callouts, a title block.

`src/lib/draft.ts` is the core and replaced `weave.ts`. It owns the marquee
model in metres plus the projection and annotation primitives; the WebGL hero,
the exploded plate, the scale plan and the OG card all project from it, so no
two drawings can disagree about the tent. The colour system is one semantic
rule — **the object is ink, every annotation is orange** — which also means
section numbering is finally earned: a drawing set is a numbered register.

Fonts moved Onest → **IBM Plex Sans + Mono**, mono reserved strictly for
measurement and sheet codes. The hero's authored moment is now an *assembly*:
the layers start separated exactly as the plate draws them and settle into the
structure.

Four bugs found and fixed during the pass, all written into `DESIGN.md` so they
don't recur: Euler-order rotation put the roof slopes outside the tent (panels
are now explicit corner points); the exploded plate overflowed its hand-set
viewBox (now computed from geometry); the drawing's callout numbers disagreed
with the key printed beneath it; and the comp's brighter orange measured 4.12:1,
under AA, so the signal darkened to #C2481E.

Verified across six pages, desktop and mobile: zero horizontal overflow, zero
contrast failures, reduced-motion never downloads Three.js, no-JS renders full
content, keyboard focus visible, mobile menu traps focus. Detector 0 findings,
`astro check` clean, all four sites build.

## [2026-08-23] design | subcort reworked onto the *scoarța* visual system

The owner asked for a total UI/UX rework of `subcort`, keeping the business
idea. Ran the impeccable direction round: the roll dealt "Buletin" (a
meteorological observation sheet), the owner re-rolled, and from the second hand
picked **Scoarța oltenească** — the Gorj flat-weave rug — over the roll's
"Târgul" and the erection-drawing pick.

Why it holds: a tent is a woven cloth stretched on a frame, and so is a rug, so
the reference is structural rather than decorative. The rug's anatomy is also a
page — a pale field left alone, a woven border, horizontal registers, motifs on
a grid with no curves.

Two owner constraints were pinned before building and drove everything:
**light throughout** (the previous system's dark canopy hero, footer and page
headers are gone entirely) and **structural-only motif** (the weave draws rails,
dividers, icons and data bars; never wallpaper or flourish — that restraint is
the defence against the souvenir look). Dyes are ranked, not interchangeable:
indigo structures, madder emphasises, ochre warms.

The core of the build is `src/lib/weave.ts`, a weave engine: every graphic mark
is a character-grid chart rendered to crisp SVG rects at build time. It replaced
the icon set, the dividers, the border rails, the capacity bars, the favicon and
the OG card. There is no icon library.

Stack added on the owner's call: **Three.js** for a marquee built entirely from
primitives (no downloaded model — matching the precedent `tractari` set), driven
by **anime.js** through a raising sequence, plus **Motion** for the two React
islands. Fonts moved from Bitter/Mulish to **Onest**, which is Romanian-designed
and draws the comma-below diacritics correctly.

`PRODUCT.md` kept its product truth intact — the no-CTA decision was
re-confirmed with the owner and still holds — but its two visual design
principles and the forest-green anti-reference were rewritten, since they
described the replaced world. `DESIGN.md` was replaced outright.

Dropped as dead: `src/content/gallery.ts`, the six stock gallery JPGs, the five
illustrated SVG scenes, and `scripts/gen-placeholders.mjs` (replaced by
`gen-og.mjs`, which draws the OG card in the weave grammar). The site now ships
no photography at all.

Verified in the browser across six pages, desktop and mobile: zero horizontal
overflow, zero WCAG AA contrast failures, all tap targets ≥24px, reduced-motion
lands on the finished structure, no-JS still renders full content, keyboard
focus visible from the skip link, mobile menu traps focus. The impeccable
detector reports 0 findings. Two real defects were found and fixed during the
pass — Motion silently no-ops when animating SVG geometry through props (the
scale plan never drew), and `padding-block` does not lay out on inline elements
(nav links were 18px tall). Both are written into `DESIGN.md` so they don't
recur.

## [2026-08-23] bootstrap | corpus/ created

Bootstrapped the root `corpus/` workspace while adapting the repo to
`my-personal-skills` v0.29.0: `CLAUDE.md`, `index.md`, `routing.md`, `lint.sh`,
and the wiki spine (`overview`, `architecture`, `decisions`, `status`,
`open-questions`). Scope is the monorepo layer only — the per-site docs under
`sites/saloon/docs/`, `sites/auto-service/docs/` and `churchix/docs/corpus/` were left in
their existing shape (see `wiki/open-questions.md`).

Same pass pruned dead references and unused assets: the `showcase/*` scripts,
README section and launch config left behind when that site moved out
(`93eba5d`); the unreferenced root `hero-desktop.png`; `saloon` gallery
placeholders 07-09 and `subcort`'s `hero-tall.svg` + duplicate
`images/favicon.svg` (with their generators trimmed so they stay gone); the empty
`.playwright-mcp/` directory; and `churchix/skills-lock.json`, a stale pin to a
standalone impeccable install that the plugin now ships.

## [2026-08-23] cleanup | one doc shape, "corpus" freed, config de-coupled

Deeper pass over the repo layout. Root stays flat (five project directories) —
the grouping under `sites/` was considered and declined.

**Docs.** `sites/saloon/docs/` → `sites/saloon/docs/`, `sites/auto-service/docs/` →
`sites/auto-service/docs/`, `churchix/docs/corpus/` → `churchix/docs/wiki/`. "Corpus"
now names only this workspace. Files whose names collided were renamed for their
real job: `sites/saloon/docs/DESIGN.md` → `docs/tokens.md` (a token export, not the
impeccable design doc) and `sites/auto-service/docs/PRODUCT.md` → `docs/brief.md`.
`saloon/ADR.md` moved to `sites/saloon/docs/ADR.md`. ~30 files of references rewritten;
0 dead links across 98 markdown files. Wrote READMEs for `auto-service`,
`subcort` and `tractari`, which had none.

**Image-source bug.** `build` was mock everywhere while `dev` and `preview`
defaulted to real, so `npm run saloon:build` silently shipped placeholders.
`saloon` and `auto-service` now build real by default with `build:mock` as the
escape hatch. Verified both ways in the emitted HTML.

**Config de-coupling.** The root `.gitignore` hardcoded all four site names; its
rules are now site-agnostic `**/` patterns, so adding a site needs no edit there.
`.vscode/launch.json` went from 2 sites to all 5. Added the missing
`placeholders` script to `saloon` and `auto-service`.

**Stale docs pruned.** `churchix/CLAUDE.md` still documented `npm run deploy`,
`npm run pre-deploy`, `cp .env.example .env` and `scripts/deploy.ts` — all
removed with the deploy tooling in `6d2f237`. Replaced with the current commands.

Verified: 4 Astro builds, a sub-path build, churchix typecheck + build, 66 bots
tests, corpus lint.

Recorded two decisions (one doc shape; duplication between sites accepted) in
`wiki/decisions.md`.

## [2026-08-23] restructure | sites/ + npm workspaces + @sites/kit

Moved the four presentation sites into `sites/` and made the root an
**npm-workspaces** root (`sites/*`, `packages/*`). One lockfile, one hoisted
`node_modules`, one `npm install`. `churchix/` stays outside the workspace —
verified it keeps its own lockfile and appears nowhere in the root one.

Extracted `packages/site-kit` (`@sites/kit`) from code that was byte-identical
across sites: `withBase()`, the `createImages()` mock/real pipeline, and the
`SiteOverridesOf` type. Deleted the four copies of `src/content/url.ts` and
repointed 33 imports. Each site keeps a small `images.ts` supplying its own
`hasReal` data to shared logic.

The package ships TypeScript source with no build step, so each site declares
`vite.ssr.noExternal: ["@sites/kit"]` — without it the static build tries to
require raw TS from node_modules.

Fixed a real bug the extraction exposed: `SiteOverrides` mapped arrays through
`Partial<T[]>`, widening every element to `T | undefined`. That is wrong about
runtime (the spread merge replaces arrays wholesale) and produced 3 pre-existing
`astro check` errors in saloon and subcort. Confirmed the affected files were
byte-identical to HEAD before fixing, so the errors predated this work. The
corrected type lives in the kit; all four sites now typecheck clean.

Also dropped a dead ngrok `allowedHosts` entry from tractari's Vite config, and
fixed the VSCode launch configs, which pointed at a per-site
`./node_modules/.bin/astro` that workspaces no longer create.

This **revisits two decisions** recorded earlier the same day — "sites are
self-contained, no hoisting" and "duplication between sites is accepted".
Both are rewritten in `wiki/decisions.md` with what superseded them and why;
the second now carries the bar for what may enter the shared package
(identical logic, not similar logic) and what cannot (`import.meta.glob` for
`site.local.ts`, which resolves relative to its caller).

Verified from a clean `node_modules`: `npm install`, `npm run build` (4 sites),
`astro check` on all four, 66 bots tests, churchix install + typecheck + build,
0 dead links across 99 markdown files, corpus lint.

## [2026-08-23] deps | everything to latest stable, 0 vulnerabilities

Root workspace was reporting 4 vulnerabilities (3 high), churchix 13 (8 high).
Both are now **0**, on latest stable, with pin styles preserved per entry
(`saloon` keeps carets, the other three keep exact pins, churchix keeps carets).

**Sites: Astro 6.4.2 -> 7.2.4** (plus @astrojs/react 5->6, Vite 7->8, Tailwind
4.3.3, React 19.2.8, three 0.185.1). The vulnerabilities were all Astro and its
esbuild / sharp / vite subtree.

**churchix: Astro 5.7 -> 7.2.4**, zod 3 -> 4.4.3. Two breakages, both real:

- `ViewTransitions` was renamed `ClientRouter` in Astro 5 and removed in 6.
  churchix was still on the old name. Same component, one-line rename in
  `packages/ui/src/layouts/BaseLayout.astro`.
- `packages/config/tsconfig.json` extended `../../tsconfig.base.json`. npm
  symlinks that package into `node_modules/@churchix/config`, where `../../`
  escapes to `node_modules/` instead of the churchix root. Vite 8's oxc
  transform resolves tsconfig extends chains where esbuild did not, so the
  indirection started failing `astro sync`. The package is now self-contained
  and the root `tsconfig.base.json` is a thin alias pointing back at it.

**Two versions deliberately not latest:**

- `typescript` stays on 6.0.3. `@astrojs/check@0.9.10` peers on `^5 || ^6`; TS 7
  is not supported by the Astro checker yet.
- `@types/node` tracks the declared engines floor (22.x), not 26.x. Typing
  against a newer runtime than the package claims to support would allow APIs
  missing on the minimum supported Node.

**One package held back:** `@fontsource-variable/big-shoulders-display` stays at
5.2.5. Its 5.3.0 dropped the `"./*.css"` export entry, breaking
`import ".../wght.css"`; the extensionless form resolves but TypeScript then
cannot see it as CSS. Upstream renamed the font — the maintained package is
`@fontsource-variable/big-shoulders`, and switching means changing the
font-family in tractari's `global.css`. That is a visual decision, not a
dependency bump, so it is documented in `sites/tractari/README.md` and left for
a deliberate call.

Verified from clean installs on both workspaces: `npm audit` 0/0, 4 site builds
+ churchix build (10 pages, unchanged), `astro check` clean on all five, font
output byte-for-byte unchanged per site (14/6/10/6 woff2), real-vs-mock image
switching, sub-path builds, 66 bots tests.

## [2026-08-23] design | saloon — de-templated the page rhythm

Audit-and-fix pass over `sites/saloon` (via the `redesign-existing-projects`
skill) to remove the "generated" feel. The design *system* was not the problem —
tokens, Fraunces/Manrope pairing, contrast math and reduced-motion coverage are
all deliberate. The tells were all in repetition:

- **Eight sections opened with a byte-identical stamp** (`heading-lg` +
  `gold-divider` in a `max-w-2xl` div). Headings now vary in composition —
  stacked, or split with a supporting line right-aligned on the baseline.
- **The gold divider went from 8 uses to 2**, reserved for the two warm personal
  moments (Ana's intro, the loyalty panel).
- **Two 3-up equal-card grids** (Services, Sterilization) sharing the *same*
  circular icon badge. Services is now a salon price list — rows with hairline
  rules and the price right-aligned, which is both less generic and closer to
  how a printed salon menu actually reads. Sterilization is a numbered protocol
  with a sticky heading column.
- **One vertical drumbeat** across nine sections. Added `.section--airy` /
  `.section--tight` and applied them so the page breathes unevenly.
- **Everything mounted at once.** Reveals now cascade via the `--i` index-delay
  language the mobile menu already used.

Left alone on purpose: the Romanian copy (specific and in Ana's voice, not
slop), the palette and fonts, and the FAQ accordion — the skill flags accordions
as a cliché, but it carries FAQPage JSON-LD and progressive disclosure is right
for it on mobile.

**A recorded decision was respected, not flipped.** `saloon/DESIGN.md` bans
uppercase eyebrows above section titles ("the inconsistent per-section eyebrow
scaffold was removed"). A first pass added one to Sterilization; it was removed
and the variation achieved through composition instead. DESIGN.md's
section-cadence note was updated to describe what is now true.

Verified: `astro check` clean, all 4 sites build, 6 FAQ questions still in the
JSON-LD, all 6 gallery images + alt text intact, 4 WhatsApp links and both
booking-section links still present.

## [2026-08-23] design | saloon — browser pass, two above-the-fold bugs fixed

Verified the de-templating pass in a real browser (agent-browser MCP) at
1280x577 and, via an iframe, at 390px. Reading the code had missed two genuine
defects, both about what a visitor sees before scrolling:

- **Desktop:** the uncapped `4/5` hero image rendered 670px tall, made the hero
  894px, pushed the headline 321px down and put the WhatsApp CTA at y=591 in a
  577px viewport — **below the fold**. Capped the image
  (`md:h-[27rem] lg:h-[30rem]`), tightened the padding, made the columns
  `1.05fr/0.95fr`. Hero 894 -> 672px, CTA 591 -> 488px, headline 56 -> 64px.
- **Mobile:** the image was `order-1`, so a phone opened on a wordless photo
  with no headline and no booking button. Removed the order swap — text first
  in source order. Headline now at y=191, CTA at y=392, both above a 560px fold.

Also gave the FAQ its right-hand third a job: the accordion is capped at a
readable measure, which left ~430px of orphaned void, so the "Nu ai găsit
răspunsul?" WhatsApp prompt now lives there as a sticky aside (it stacks below
the accordion on mobile).

Both hero rules are recorded in `sites/saloon/DESIGN.md` with the measurements,
alongside the section-rhythm modifiers.

Verified: `astro check` clean, all 4 sites build, accordion still opens, 6
gallery images load at both widths, no horizontal overflow at 390px.

Note for future UI work: browser verification is now expected — reading source
and built HTML would not have caught either of these.

## [2026-08-23] design | saloon — three frontend skills run over the site

Ran the three skills that had been skipped, in order. Each found things the
previous pass had not.

**web-design-guidelines** (Vercel WIG, fetched fresh). Real gaps, all fixed:
no designed `:focus-visible` (the UA outline was doing the work, while
DESIGN.md already named gold as the focus colour); the skip link sat at
`top:16px` under the 33px fixed banner, so the first thing a keyboard user hits
collided with it; no `touch-action: manipulation`; desktop nav links were 52x18
against a 24x24 minimum; hero image not marked `fetchpriority="high"`; hours and
price columns not tabular. Verified live: gold ring `2px rgb(201,169,97)`, nav
target now 52x26. Corrected one false finding of my own along the way -- the
site *does* have a skip link, my grep just missed "Sari la continut".

**design-taste-frontend.** Mode: redesign-preserve, dials 6/5/3 matched to the
existing site. Two mechanical failures were **mine, from the previous pass**:
the split-header pattern (heading left, explainer right) I had added to Services
and Gallery is banned by that skill as a decorative device that splits a
section's single message -- reverted to stacked headers; and the hero's
`md:pt-28` exceeded the `pt-24` cap. Also fixed en-dashes in rendered Romanian
copy, and replaced both `window.addEventListener("scroll")` handlers (nav state,
mobile bar) with IntersectionObserver -- a hard ban in that skill and a genuine
improvement. Verified both still behave: nav `false->true->false`, bar
`hidden->shown->hidden`.

Fraunces is explicitly banned by that skill as an LLM-default serif. Kept, with
justification: it is the committed brand in DESIGN.md and this is preserve mode.

**high-end-visual-design.** Written for greenfield agency builds, so most of it
does not apply here. Selected the one compatible vibe archetype (Editorial
Luxury) and took three things: a fixed film-grain layer at 0.035, one motion
curve site-wide replacing bare `ease-out`, and slightly heavier reveal travel.
**Declined three of its directives on the record:** eyebrow pill badges
(DESIGN.md bans eyebrows and the taste skill caps them), Ethereal Glass / OLED
black (light-only brand), and Double-Bezel glass cards (DESIGN.md: "no
glassmorphism").

Left alone: two en-dashes in `confidentialitate.astro` (the EU-US DPF name and
the ANPC address range). Legal copy does not change without the owner saying so.
Also flagged but not changed: 8 components hand-roll SVG icon paths, which the
taste skill bans. Pulling a React icon library into `.astro` components would be
worse than the thing it fixes; raising it rather than "fixing" it.

All three skills' rules that now bind this site are written into
`sites/saloon/DESIGN.md` (Interaction & Motion, Texture, Punctuation), including
a correction: an earlier entry there described split headers as an approved
variation, which is no longer true.

Verified: `astro check` clean, all 4 sites build, nav + mobile-bar observers
behave, gallery loads at both widths, CTA still hit-testable through the grain.

## [2026-08-23] design | saloon — icons moved to one Phosphor family

Replaced every hand-rolled SVG icon path in saloon (8 components, 16 glyphs)
with Phosphor, after the taste skill flagged hand-rolled icons and the owner
cleared adding a library.

`astro-icon` + `@iconify-json/ph` for the `.astro` components: the SVG is
inlined at build, so there is no runtime and no sprite request. The one React
island (`MobileMenu.tsx`) uses `@phosphor-icons/react` named imports at
`weight="light"`, keeping the same family; the island bundle is 6.8 KB, so the
imports tree-shook as intended.

This also fixed the underlying defect the icons were hiding: stroke widths had
drifted to 1.5, 1.6 and 2.0 across components. One family, one weight.

Verified in the browser: all 16 icons inline into the HTML, 15 paint on desktop
and the 16th is correctly `md:hidden` (the mobile bar), the mobile menu still
opens, its X renders, and Escape still closes it with the focus trap intact.
`astro check` clean, all 4 sites build, 0 vulnerabilities after the install.

Corpus updated alongside: the decision and its measured cost in
`wiki/decisions.md`, the icon stack in `wiki/architecture.md`, saloon's row in
`wiki/status.md`, and the iconography rule in `sites/saloon/DESIGN.md`.
