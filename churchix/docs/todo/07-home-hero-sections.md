# 07 — Home: Hero, pinned-announcements strip, Program+About bento

**Tier:** C · **Depends on:** 05, 06 · **Parallel with:** 06, 08–13

## Goal

Rebuild the home page composition to match the **Acasă** reference screen: a full-bleed hero, a "Anunțuri Recente" strip with a pinned/featured card, and a two-column bento joining a compact service-schedule with an "About" info card.

## Reference

`docs/design/stitch_churchix_white_label_design_system/acas_parohia_sf_ntul_ierarh_nicolae/` (`code.html` + `screen.png`). Affects [Hero.astro](../../packages/ui/src/components/Hero.astro), the home page in each app (`apps/*/src/pages/index.astro`), and reuses `AnnouncementList` + `ServiceSchedule`.

## Tasks

1. **Hero:** full-bleed background image with `bg-black/40` overlay, centered content: eyebrow label (`Biserica Ortodoxă Română`), church name in `font-display-lg` (drop shadow), a glass "Următoarea Slujbă: …" chip, and two CTAs (**Donează** solid + **Urmărește Livestream** outline with `live_tv` icon). Drive the "next service" text and livestream link from content (props), with graceful fallbacks when absent. Keep the existing `Hero.astro` prop contract or extend it; honor `features.giving`/sermons for the CTAs.
2. **Pinned announcements strip:** section heading "Anunțuri Recente" with `campaign` icon + "Vezi toate →" link. Grid where the **pinned** item spans 2 cols with a gold left-bar and "Fixat" badge (`push_pin`); regular items are standard cards with date + `line-clamp-2` summary. Use the `Card`/`Badge` primitives and feed from the announcements collection.
3. **Program + About bento:** `lg:grid-cols-12`; left (`col-span-7`) a compact current-week service card (reuse/adapt `ServiceSchedule` for the bento look — alternating row tints, Sunday highlighted in `secondary/5`); right (`col-span-5`) a burgundy "Despre Parohia Noastră" info card with a faint oversized background icon and a "Citește istoricul →" link.
4. Wire the home pages in **both** apps to the new composition; keep content sourced from collections, not hardcoded.

## Acceptance criteria

- [ ] Home matches the reference screen on desktop and collapses cleanly to single-column mobile.
- [ ] Hero "next service" + livestream are content-driven with sane fallbacks.
- [ ] Pinned announcement renders the gold bar + Fixat badge; regular items as cards.
- [ ] Service bento highlights Sunday; About card uses burgundy surface with readable contrast.
- [ ] Re-skins by token; build + typecheck pass in both apps.

## Out of scope

- The full Program Slujbe page (item 08) and the full announcements list/detail (item 09) — this is only the home-page summaries.
