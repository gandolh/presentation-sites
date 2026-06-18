# 08 — Program Slujbe page: bento day-blocks + cadence notes + PDF download

**Tier:** C · **Depends on:** 05, 06 · **Parallel with:** 07, 09–13

## Goal

Rebuild the **Program Slujbe** page — the most-used page on a Romanian Orthodox parish site — to the reference design: a centered intro with a "Liturgic" chip and PDF download, a decorative divider, then a bento of per-day service blocks.

## Reference

`docs/design/stitch_churchix_white_label_design_system/program_slujbe/` (`code.html` + `screen.png`). Affects [ServiceSchedule.astro](../../packages/ui/src/components/ServiceSchedule.astro) and `apps/*/src/pages/program.astro`.

## Context

- Data: `serviceScheduleSchema` ([packages/schemas/src/index.ts](../../packages/schemas/src/index.ts)) — `label`, `weekday?`, `time`, `cadence`, `order`, `note?`. Cadence notes like "A 2-a și ultima duminică din lună" must render prominently (with a `calendar_month` icon), not be hidden.
- Existing `ServiceSchedule.astro` is a flat table; the design wants **day-grouped cards**.

## Tasks

1. Page header: centered, "Liturgic" pill badge, `font-display-lg` title "Programul Slujbelor", intro paragraph, and an outline **"Descarcă Programul (PDF)"** button with `download` icon. PDF path comes from content/site config (optional — hide button if absent).
2. Decorative **Divider** (item 05) between header and grid.
3. **Day blocks** (`lg:grid-cols-12`, primary column `col-span-8`): one card per day that has services, grouped from the schedule items by `weekday`. Sunday card emphasized (gold left bar `w-2 bg-secondary`, "Ziua Domnului" badge, `church` icon). Each service row: time in `secondary` (`w-16` fixed), label in `body-lg`, optional `note` as muted sub-text; cadence (`biweekly`/`monthly`/`special`) rendered as a small note line with `calendar_month` icon.
4. Optional secondary column (`col-span-4`) for special-rânduieli / contact-the-priest callouts if content provides them; otherwise the primary column can widen.
5. Sort/group deterministically (`order`, then weekday Mon→Sun). Update `ServiceSchedule.astro` to offer this grouped layout (keep or deprecate the table variant via a prop).
6. Wire `program.astro` in both apps.

## Acceptance criteria

- [ ] Page matches the reference: chip, title, intro, PDF button (when present), divider, day-block bento.
- [ ] Services group by day; Sunday emphasized; cadence/notes shown clearly with icons.
- [ ] Romanian diacritics in liturgical names render correctly.
- [ ] Collapses to single column on mobile; long service names don't clip.
- [ ] Re-skins by token; build + typecheck pass in both apps.
