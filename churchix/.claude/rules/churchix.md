---
paths:
  - "apps/**"
  - "packages/**"
---

# Churchix source (`apps/**`, `packages/**`)

- **White-label.** Nothing in `@churchix/*` names a church, a diocese or a colour.
  Branding reaches the UI only as design tokens read from the church's `site`
  content entry. A per-church value in a package is a bug.
- **Tokens only.** Style with the token utilities (`bg-primary`, `text-on-surface`,
  `gap-md`). No raw hex, no one-off pixel values, no second stylesheet.
- **No bare `max-w-sm|md|lg|xl`.** In this theme they bind to the spacing scale and
  collapse layouts. Use `max-w-2xl` and up, or `max-w-[NNrem]`. The lint's
  `check-max-w.mjs` guard fails on a bare one.
- **The copy is Romanian.** Don't run English prose or style skills over it, and
  keep the diacritics (ă, â, î, ș, ț) intact in the source, the fonts, slugs and
  anything that is printed or sent.
- **Money is integer minor units plus an explicit currency.** No floats, no
  formatted strings in the data.
- **Astro first.** A React island only for interactivity, hydrated through its
  default export (the one place a default export is allowed). `@churchix/ui`
  takes React as a peer dependency.
- **Apps never import each other.** A church app holds content and branding only.
- `npm run check:fast` type-checks what you changed and lints the changed files;
  `npm run check` is the whole gate.

The project's working brief is [CLAUDE.md](../../CLAUDE.md), and the rules a
brief follows are on [corpus/wiki/conventions.md](../../corpus/wiki/conventions.md).
