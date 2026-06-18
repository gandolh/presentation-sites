# 14 — Roll the new components through the reference church apps + visual QA

**Tier:** D · **Depends on:** 05–13 · **Parallel with:** —

## Goal

Bring both reference church apps fully onto the new design, confirm a real second-brand re-skin works, and do a screen-by-screen visual comparison against the Stitch reference screens.

## Context

- Reference apps: `apps/parohia-berinta-maramures`, `apps/parohia-harlesti-bacau`. Pages: `index`, `program`, `anunturi/` (list + `[slug]`), `donatii`, `pomelnice`, `contact`, `despre`.
- The two apps deliberately use **different brands** — they are the white-label sanity check. If only one brand was exercised during items 06–13, this is where the second brand gets proven.
- `contact.astro` and `despre.astro` weren't given dedicated items — restyle them here to the shared chrome + primitives (map/prayer-form for contact; leadership/istoric for despre), keeping them consistent with the system.

## Tasks

1. Audit each page in **both** apps; apply the new components everywhere; remove any leftover legacy plain-CSS classes (`cx-*`) that are no longer backed by styles.
2. Give the second app a **distinct brand** (different `primary`/`secondary`/`surface` seeds, logo) and confirm every page re-skins correctly with no hardcoded leakage.
3. Restyle `contact.astro` (address, map embed, phone/email, prayer-request form using the Field/Button primitives) and `despre.astro` (istoric prose + leadership ordered by `staff.order`).
4. Visual QA: compare each built page to the matching `screen.png`. Note intentional deviations in `corpus/log.md`.
5. Confirm `npm run build --workspaces` and `npm run typecheck --workspaces` are green for both apps.

## Acceptance criteria

- [ ] Every page in both apps uses the new design; no orphaned legacy styles.
- [ ] Second app renders in a clearly different brand with zero hardcoded Churchix/other-church values.
- [ ] `contact` and `despre` restyled and consistent.
- [ ] Visual diffs vs reference screens reviewed; deviations logged.
- [ ] Full workspace build + typecheck green.

## Out of scope

- The dedicated a11y/i18n hardening sweep — item 15.
