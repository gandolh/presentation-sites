---
summary: The house style, formatted and checked, with Astro (2026-11-11) - Prettier at width 120 with the Astro plugin, the vendored house-style ESLint config plus a local Astro layer, the tsconfig flags each site takes, the npm run check gate and its fast subset, what stays outside, and the exceptions with what removes each. Read before changing a lint, format or typecheck setting.
updated: 2026-11-12
---

# Decisions: the house style, formatted and checked, with Astro

The rest of the locked calls are in [decisions.md](decisions.md). The
commands are in the root [CLAUDE.md](../../CLAUDE.md).

## The house style is vendored, and this repo adds the Astro layer

**2026-11-11** — The estate's `house-style` configs are copied into
`vendor/house-style/` (1.1.0 at first) and refreshed with
`npm run house-style:sync -- <tag>`; nobody edits the copy. The tools are
pinned exactly at the root, and `.npmrc` saves exact versions. house-style 1.x
has no Astro preset, so this repo adds one:

- **Prettier** (`prettier.config.mjs`): the house format, width 120 with
  trailing commas, plus `prettier-plugin-astro` for `.astro` files. Markdown
  stays out.
- **ESLint** (`eslint.config.mjs`): `houseStyle()` with the sites' folders,
  then `eslint-plugin-astro`'s recommended set, then one block that applies the
  house shapes and the six typed rules to `.astro` files, taken by name from
  the blocks `houseStyle()` returns. `astro-eslint-parser` has no
  `projectService`, so `.astro` files find their site's tsconfig through
  `project: true`. The `<script>` blocks inside `.astro` files are linted
  without types.
- **Typecheck:** `astro check` in each site, `tsc --noEmit` in the kit. The
  sites keep extending Astro's strict preset, not the house base (which is
  `NodeNext`); they add `erasableSyntaxOnly` and `noImplicitOverride`, and
  saloon and auto-service add `noUncheckedIndexedAccess`.

*Why:* one estate style, and one place to change it. When house-style ships an
Astro preset, this repo switches to it.
*Rejected:* a git or tarball dependency (the deploy builds without git);
formatting Markdown; a width other than 120 (the churn barely moves with it
here: the gap is the hand-written `.astro` style, not the width).

## The gate

`npm run check` runs the typecheck, lint, format check, `check:conventions`
(knip, dependency-cruiser, `check-base-ui`, `check-structure`) and the saloon
bots' own check. `npm run check:fast` typechecks only the projects with a
changed file, then lints the changed files: the whole typecheck takes about
30 s alone, over the Stop hook's budget. The saloon bots are linted from the
root config as `node:test` code (2.7 s of the 28 s lint).

## What stays outside

Churchix (its own harness brief), the Docusaurus docs sites, and
`design-study`, which is typechecked but not linted or formatted unless the
owner asks. The social-card pages (`sites/*/scripts/og-card.html`) stay out of
Prettier: subcort's is generated, and a reformat of the others can't be
checked without rendering the cards again.

## Exceptions, each with what removes it

- `noUncheckedIndexedAccess` is off in subcort (86 errors) and tractari (5),
  and so is `@typescript-eslint/no-unnecessary-type-assertion` there. Both come
  on with the work that fixes those errors.
- `check-base-ui` is strict (no `--warn-only`) since brief 04 (2026-11-12): it reports 0.
- The bots' `responses/replies.ts` reads one setting from `process.env`, a
  warning until it moves into `core/config.ts`.
- knip ignores files kept on purpose with nothing importing them (two
  dormant `images.ts`, the parked saloon testimonials, the `site.local`
  templates) and two dependencies it can't see used (`@iconify-json/ph`,
  read by `astro-icon`; `gsap`, which nothing imports: an open question).
