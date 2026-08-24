# PRODUCT — design-study

## What it is

A UI/UX study, shipped as a working site. One blog is rendered fourteen times,
once per design language, with the content held constant so that everything
that changes between renderings is design.

It is not a marketing site and has no business behind it. The publication —
*Ratio*, a studio journal about making things — is fictional, and deliberately
unremarkable: a blog *about design* would put its thumb on the scale.

## Who it is for

1. **Someone choosing a direction.** Fourteen styles applied to identical
   content, switchable in one keystroke, with position preserved — so the same
   post can be compared across all of them rather than judged from a mood board.
2. **Someone building in one of them.** Every theme is a complete, working
   implementation with its rules stated in the CSS, and every style has a
   dossier in `docs/styles/`.
3. **Later: image generation.** The dossiers are written so their **image
   treatment** and **prompt descriptors** sections can drive generation of
   Instagram-ratio imagery in a given style. That reuse is the reason the
   written half exists in this form.

## What it must do

- Render the **same twelve posts and the same eighteen photographs** in all
  fourteen themes. If the content diverges, the study stops meaning anything.
- Let a reader move between themes **without losing their place**.
- Keep each theme's cost to itself — one theme's fonts must not load on
  another's page.
- Stay honest about accessibility. Where a style is structurally inaccessible
  (neumorphism, ethereal), the theme states the compromise in its own CSS and
  the dossier explains it, rather than quietly shipping a page nobody can read.

## What it deliberately does not do

- **No on-page commentary.** No critique drawer, no "about this style" panel.
  The site is a skin gallery; the analysis lives in `docs/styles/`. This was an
  explicit decision, not an omission.
- **No real content.** Fictional posts, generated placeholders, `noindex` on
  every page. Fourteen duplicates of the same twelve articles is exactly what a
  search engine treats as spam.
- **No theme-neutral "best practice" flattening.** Where a style's own rules
  produce a bad interface — brutalism's full-window measure, neumorphism's
  invisible edges — the theme keeps the rule and the dossier records the cost.

## The control variables

Three things are identical across all fourteen renderings, and changing any of
them would invalidate the comparison:

1. The posts — text, order, dates, authors, tags.
2. The photographs — the same eighteen source files, addressed by logical name.
   Themes may *treat* them (duotone, halftone, sepia, bloom); they may not
   substitute them.
3. The post page structure — carousel first, body second.

Everything else is a theme's own business, including layout, grid, markup and
whether it ships any JavaScript at all.
