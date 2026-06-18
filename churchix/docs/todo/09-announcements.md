# 09 — Announcements list + detail with pinned/featured gold accent

**Tier:** C · **Depends on:** 05, 06 · **Parallel with:** 07, 08, 10–13

## Goal

Style the announcements **list** and **detail** pages to the design language, with the pinned/featured treatment seen on the home strip carried through.

## Reference

The "Anunțuri Recente" cards on the home screen (gold left-bar + "Fixat" badge for pinned, date + `line-clamp` summary for regular). Affects [AnnouncementList.astro](../../packages/ui/src/components/AnnouncementList.astro) and `apps/*/src/pages/anunturi/index.astro` + `apps/*/src/pages/anunturi/[slug].astro`.

## Context

- Data: `announcementSchema` — `title`, `date`, `summary?`, `pinned`. List already sorts pinned-first then date-desc; keep that.
- Existing list is a stack of plain cards; restyle to the design cards with the pinned accent and `event` date icon + `push_pin` "Fixat" badge.

## Tasks

1. **List page:** section heading with `campaign` icon; grid of `Card`s. Pinned items get the gold left-bar + "Fixat" badge and may span wider on desktop. Regular items show a dated `event` chip, title, and `line-clamp-2` summary linking to detail.
2. **Detail page:** clean prose layout under the global chrome — title in `font-headline-lg`, dateline, pinned badge if pinned, MDX/markdown body styled for readability (generous line-height for diacritics), back-link to the list. Define/extend a prose typography style (could be a small `.prose`-like layer using body tokens).
3. Empty state (no announcements) uses the `EmptyState` primitive.
4. Wire both apps' list + detail pages.

## Acceptance criteria

- [ ] List matches the card/pinned design; pinned-first ordering preserved.
- [ ] Detail page is readable, diacritic-safe, with pinned badge + back-link.
- [ ] Empty state renders when there are no announcements.
- [ ] Dates formatted `ro-RO` (and localized when locale differs).
- [ ] Re-skins by token; build + typecheck pass in both apps.
