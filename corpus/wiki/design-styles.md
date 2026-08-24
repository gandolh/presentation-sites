---
summary: Where the repo's design-language reference lives and how to reuse it — fourteen per-style dossiers under sites/design-study/docs/styles/, each carrying a CSS image-treatment recipe and prompt descriptors for generating imagery in that style.
updated: 2026-08-23
---

# Design-language reference

This repo now carries a worked reference for fourteen interface design
languages, built as `sites/design-study` — one fictional blog rendered fourteen
times with the content held constant.

The **site** is a skin gallery and carries no commentary, by decision. The
**written study** is the reusable artefact and lives with the code it describes:

**[`sites/design-study/docs/styles/`](../../sites/design-study/docs/styles/README.md)**
— one dossier per style.

## Why the dossiers are not in this corpus

Fourteen pages here would blow the retrieval budget in
[CLAUDE.md](../CLAUDE.md) (2–3 wiki pages), swamp the generated catalog in
[index.md](../index.md), and duplicate per-site content, which this corpus is
not supposed to do. So the corpus keeps one pointer — this page — and the
detail stays next to the themes it documents, where it is maintained alongside
them.

## What a dossier contains

Eleven sections. Nine are analysis: origin, defining traits, palette,
typography, surface and depth, layout, motion, accessibility, and how the theme
is built. Two are the **reuse payload**:

- **Image treatment** — the copy-pasteable CSS (and inline SVG, where the style
  needs it) applied to photography in that language. Ranges from Swiss's
  `grayscale(1)` through Brutalism's `feComponentTransfer` threshold plus dot
  screen to Liquid Glass's four-layer refraction stack.
- **Prompt descriptors** — a compact bag of concrete visual terms for an image
  model: subject, lighting, palette, texture, framing.

Those two sections exist because the intended second use of this work is
**generating Instagram-ratio post imagery in a chosen style**, not only styling
web pages. Treat a dossier as an image brief, not just a CSS reference.

## The fourteen

Minimalism · Swiss Design · Brutalism · NeoBrutalism · Maximalism · Surrealism ·
Bohemian · Ethereal · Skeuomorphism · Neumorphism · Claymorphism ·
Glassmorphism · Liquid Glass · Spatial UI.

Canonical order and slugs live in
`sites/design-study/src/content/styles.ts`, which is also the routing source of
truth — the build fails if a declared style has no theme directory.

## Relation to the other design docs

This is a **reference library**, not a house style. Each marketing site keeps
its own `DESIGN.md` and none of them inherits from here. Use the dossiers to
pick and argue about a direction; use the site's own `DESIGN.md` to record what
it actually committed to. See [decisions.md](decisions.md) for the monorepo
choices that do bind every site.
