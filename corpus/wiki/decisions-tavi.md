---
summary: The calls behind Tavi Ceasornicaru (sites/tavi, planned 2026-11-24) - an interactive watch movement on warm paper, English and light only, drawn not photographed; the stack (Astro, Base UI controls, vanilla three.js in one island), the one part table and its two renderers, the fallback ladder, the islands' shared play contract, and the defaults the owner can change. Read before any tavi brief.
updated: 2026-11-24
---

# Decisions: Tavi Ceasornicaru

The other locked calls are in [decisions.md](decisions.md). The approved design is `design/tavi/`
([its README](../../design/tavi/README.md) says which file wins). The briefs that build it are 09 to 20.

## What the site is

**2026-11-24** (the owner's grill) — A presentation site for Tavi Ceasornicaru, a friend who loves clocks and watches
and mends wristwatches. Personal, not a business: less marketing, more an interactive watch experience. A movement the
visitor winds, watches tick and takes apart, chapter by chapter, framed by Tavi's story and his bench, with a quiet
repair line. The owner approved direction A, "The workshop explained", the same day; B and C were never sketched.

The sketch's tokens, type, chapters, motion rules and fallback ladder (`design/tavi/direction.md`) are the approved
design. Chapters: 1 Energy, 2 Wheels, 3 Escapement, 4 Balance, 5 Together, 6 The bench, 7 Repairs (the footer).

## English only

**2026-11-24** (owner) — The site's copy is English, unlike every other site here, which is Romanian. The repo's
"the copy is Romanian" rule gets a tavi exception (brief 09 writes it into the root `CLAUDE.md` and
`.claude/rules/sites.md`). English prose skills may run over tavi's copy.

## Light only, drawn only, no contact yet

**2026-11-24** (owner) — One theme, warm paper, with no theme switch: the base-ui skill's rule 14 is bent here as the
other sites bend it, one look designed for the site. Nothing is photographed: the movement, the bench and the tools
are drawn or modelled in the site's style. No contact details until the owner gives one.

## Where it lives

**2026-11-24** — The workspace is `sites/tavi`, package `tavi-ceasornicaru`, root scripts `tavi:*`. It is served at
`/tavi/` by a vps-deploy stack named `tavi`, like the other sites. The canonical origin comes from `PUBLIC_SITE`, with
the `https://example.com` fallback that [decisions.md](decisions.md) records. The other sites' configs fall back to
the real origin, which repo text doesn't name, so the vps-deploy brief passes `PUBLIC_SITE` to every presentation
site's build.

*A docs site, later* (owner, 2026-11-24, revising the planner's "not in v1"): brief 21 adds it after the site is
built, by `docs/adding-a-site.md` step 6, with a `tavi-docs` stack in vps-deploy.

## The stack

**2026-11-24** — Astro 7.3.5 static, Tailwind 4.3.3, React 19.2.8 and Base UI 1.9.0: the repo's pins. Vanilla three.js
0.187.0 inside one React island, imported dynamically. Fonts self-hosted through Fontsource (Newsreader variable with
its optical-size axis, IBM Plex Mono 400), not the sketch's Google Fonts link: the site makes no third-party request.

*Rejected:* react-three-fiber (about 100 KB gzip more than hand-picked three for one scene, measured in the research);
an animation library (Motion, GSAP, anime.js, Lenis): CSS transitions on transform and opacity and the island's own
frame loop cover the motion rules. Of the libraries the owner listed, three.js and Base UI are used. motion-primitives,
smoothui, magicui and animejs were idea sources only; haikei reads as SaaS decoration; unlumen-ui and canvasui carry
licences that bar redistributing their components from a public repo, and canvasui's effects keep Android on a
fallback; Effect is a TypeScript runtime library, not a visual one.

## One part table, two renderers

**2026-11-24** — The movement is one typed part table in `sites/tavi/src/movement/`: positions, tooth counts, pitch
radii and the clock (`stateAt(t)`, one pure function of time, 21,600 vph: a beat is 1/6 s, the escape wheel steps 12°,
every other wheel follows by its tooth ratio). Astro components draw it as SVG at build time; the three.js island
builds it in 3D. Both import the same modules, so nothing is copied, and swapping the calibre is a table change.
`node:test` checks the table (every meshing pair at the sum of its pitch radii, at an equal module) and the clock
(escape wheel 72° at 1 s and 360° at 5 s, fourth wheel 360° at 60 s, 21,600 beats at 3,600 s) inside `npm run check`.
subcort's `src/lib/draft.ts` is the in-repo precedent: one model drives every graphic.

## The fallback ladder, and where the 3D lives

**2026-11-24** — The SVG drawing is always the first paint. **Revised by the owner the same day: the 3D lives in the
hero too**, not only in chapter 5 (Together). The hero's drawing paints first, ticking in CSS; the island loads after
that first paint and replaces it in the same box, opening on the drawing's flat view; chapter 5 reuses the same
scene and chunk. Rungs 1 and 2 below read with that: the hero's island loads on its own after first paint on any
device with WebGL 2 (phones included); chapter 5's "Turn it in 3D" button stays for phones that scrolled past an
unloaded hero.

1. Desktop with WebGL 2: the island loads as chapter 5 nears and replaces the poster. It opens on the poster's flat
   top view, pixel-aligned, and tilts only on the first drag, so the swap doesn't jump.
2. Phones (narrow and a coarse pointer): the drawing stays; a "Turn it in 3D" button loads the island on demand.
3. No WebGL, or a lost context: the drawing, taken apart through its lift groups.
4. Reduced motion: whichever figure shows starts paused on a still frame until Play. Play still runs it.
5. No scripting: the still drawing, all the prose, and every chapter link.

## The islands and their shared contract

**2026-11-24** — The page is Astro HTML. React islands: the Chapters drawer (phones only, `client:media`), each
moving figure's control tray (`client:visible`) and the 3D movement. Astro loads React once for all of them. The
header's Pause and the steps observer are plain module scripts, so they work before React arrives.

- **Play** is one state for the page: `data-playing` on `<html>`, set by an inline head script before the first
  paint (`false` under reduced motion), changed through `src/lib/playback.ts`, which every Pause uses. Motion runs only
  under `.js` and `data-playing="true"`.
- **Speed** belongs to each figure: `--slow` (1, 10 or 100) on the figure. Chapter 3 opens at 1/10.
- **A hold** is a figure's own still frame, asked for by a step (chapter 3 shows one phase of a beat): `data-hold` on
  the figure, released by its tray's Play. It never changes the page's `data-playing`.
- **One dev hook**, `window.taviPose(figure, pose)`, keyed by the figure's id, in development builds only, for stills
  and tests.
- **Colours** reach three.js by reading the part tokens from the stylesheet at runtime (a 1×1 canvas probe turns each
  token into sRGB, as `prototype.html` does), never as colour literals in code. The tokens are emitted with
  `@theme static` so the island can read them.

## Defaults the owner can change

Each recorded 2026-11-24 by the planner; the owner confirmed all of them the same evening (small seconds at 8
o'clock included).

- **The repair line stays quiet**: in the footer and the contents band's chapter 7, not on the first screen.
- **The movement stays the generic 21,600 vph NH35-class train**, swappable through the part table if the owner names
  Tavi's favourite calibre.
- **Tavi's own line** stays a visible placeholder in the footer until the owner sends it (an owner todo,
  [todos/tavi-own-line.md](../todos/tavi-own-line.md)).
- **Small seconds sits over the fourth wheel, where the table puts it**: about 8 o'clock seen from the dial. The
  direction says "at 6 o'clock", which would mean re-laying the whole train and redrawing the approved sketch.
- **The ticking sound** is synthesised (no recording of a watch exists), off by default, behind a speaker toggle.

## Copy: invented people, real watches

**2026-11-24 (owner)** — "invent freely fictive data. But use real facts for real mechanisms. Like brands,
mechanism, pieces names, matrices, etc. PII should be fictive, real informations and verified informations for
wiki/trivia." So builders write every chapter's prose themselves, with no review step: anything about Tavi as a
person (story, years at the bench, habits, quotes) may be invented and must never be a real person's data; anything
about watches (calibres, brands, part names, tooth counts and ratios, beat rates, history and trivia) must be true
and checked against a source, which the brief's outcome names.
