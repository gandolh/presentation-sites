---
title: Wiki pages predate the 2026-05-30 audit and the 2026-06-18 redesign
created: 2026-10-07
status: open
---

# Wiki pages predate the audit and the redesign

Found while moving the wiki into the corpus on 2026-10-07. A few pages still
describe the system as it stood on 2026-05-29. The code wins; the pages need to
catch up.

- [design-system](../wiki/design-system.md) gives the Orthodox gold as `#785a02`.
  The seed has been `#c8a24b` since the 2026-05-30 audit (`--secondary` in
  `packages/ui/src/styles/tokens.css`).
- [design-system](../wiki/design-system.md) and
  [i18n-and-glossary](../wiki/i18n-and-glossary.md) say headings use Source
  Serif 4. They default to Cardo now (`--font-heading` in `tokens.css`), with
  Source Serif 4 as the fallback.
- [design-system](../wiki/design-system.md) describes "both reference apps" and
  the Berinta brand. Only `apps/parohia-harlesti-bacau` exists.
- [design-system](../wiki/design-system.md) says nothing of the `70999ff`
  redesign: `Rail.astro`, `PageShell.astro`, the asymmetric hero, and the
  `display-xl` and `overline` type tokens. Its page inventory still lists the
  home as hero, announcements strip and Program + About bento, which brief 07
  built and the redesign replaced.

## Acceptance

Those pages match the code, their `updated:` dates move, and
[log.md](../log.md) gets an entry.
