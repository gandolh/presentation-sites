# 17 — UI audit follow-ups (from the 2026-05-30 audit)

**Tier:** F · **Depends on:** 16 · **Parallel with:** —

## Goal

Close out the items flagged-but-not-fixed during the 2026-05-30 UI/UX audit (see [docs/ui-audit-2026-05-30.md](../ui-audit-2026-05-30.md)). The audit fixed the blocking bugs and the agreed DESIGN.md adherence gaps; the items below are the deliberate leftovers — mostly consistency and cleanup, plus one design-spec gap deferred until real assets land.

## Tasks

1. **Migrate the Announcements pages off the legacy container.** `apps/parohia-harlesti-bacau/src/pages/anunturi/index.astro` and `anunturi/[slug].astro` still use the legacy `.cx-container` (`--maxw: 64rem` = 1024px, `padding-inline: 1.25rem`) instead of the site standard `max-w-container-max` (1200px) + `px-sm md:px-gutter`. They render fine but are narrower and inconsistent with every other page. Bring them onto the standard container + responsive gutters.
2. **Retire the legacy `--maxw: 64rem` alias and the `.cx-*` class set** in `packages/ui/src/styles/tokens.css` once task 1 removes the last consumers. The 64rem value contradicts the 1200px container spec in [DESIGN.md](../design/DESIGN.md) §Layout.
3. **Remove the dead `--container-container-max` token** in `packages/ui/src/styles/theme.css` (unused — `max-w-container-max` resolves via the spacing scale, not the container scale).
4. **Consider a shared `<Container>` primitive** (or wrap `BaseLayout`'s `<main>`). Today the 1200px max-width + gutters are repeated per page, so consistency depends on each page author remembering to wrap. A primitive would enforce it. Optional / design-judgment call.
5. **Image "arch mask / sharp corners" for icons & murals** (DESIGN.md §Shapes, special elements) — not implemented anywhere. Revisit when real church photography/iconography lands; decide between an arch SVG mask vs. sharp corners per asset type.
6. **Codify the Tailwind v4 `max-w-*` collision as a lint/convention.** Bare `max-w-{sm,md,lg,xl}` silently bind to the spacing scale in this theme (they collapse layouts); only `max-w-{2xl,3xl,…}` or arbitrary `max-w-[NNrem]` are safe. The note lives in `theme.css`; consider an ESLint/grep guard so it can't regress.

## Notes (intentional, do NOT "fix")

- `on-primary-container` and `on-secondary-container` invert the DESIGN.md literal hex on purpose to clear WCAG AA on the tonal tints (documented in `tokens.css`). Leave as-is.
- The header "Donează" stays a `pill`; the gold left-bar (vs the default gold bottom border) is kept intentionally for AnnouncementList pinned items and the ServiceSchedule Sunday card.

## Acceptance criteria

- [ ] Announcements list + detail use the standard 1200px container and responsive gutters; visually consistent with the other pages (RO + EN, 3 viewports).
- [ ] Legacy `--maxw` / `.cx-*` removed (or a follow-up explicitly scoped if other consumers remain).
- [ ] Dead `--container-container-max` token removed.
- [ ] Decision recorded for the `<Container>` primitive and the arch-mask treatment (do, defer, or drop) in `docs/wiki/log.md`.
- [ ] `max-w-*` collision guard added or consciously declined, with rationale logged.
