# 04 — Material Symbols + Source Serif 4 / Inter font loading (self-hosted, diacritic-safe)

**Tier:** A · **Depends on:** 01 · **Parallel with:** 02, 03

## Goal

Provide the design's iconography (**Material Symbols Outlined**) and typography (**Source Serif 4** headings, **Inter** body) to all church sites, **self-hosted** (no runtime Google Fonts dependency), with full Romanian diacritic coverage.

## Context

- Reference screens load fonts + icons from `fonts.googleapis.com` and use `<span class="material-symbols-outlined">church</span>` etc. with `font-variation-settings` for fill/weight.
- CLAUDE.md requires **Romanian diacritics (ă â î ș ț)** to render correctly; we must verify the chosen weights/subsets include Latin Extended-A.
- White-label: fonts are part of the system, not per-church — but `brand.fontHeading` / `brand.fontBody` tokens may override the family (keep that override path working).
- Per-church independent static builds: each app needs the assets, but the *mechanism* should live in `@churchix/ui` so it's not re-implemented per church.

## Tasks

1. Self-host **Source Serif 4** (opsz 8..60, weights 400/600/700) and **Inter** (400/500) with Romanian-covering subsets (`latin` + `latin-ext`). Use `@fontsource/...` packages or vendored woff2 — pick one and document.
2. Set up **Material Symbols Outlined**. Options: variable icon font (matches reference exactly, heavier) vs inline SVG icon set (lighter, tree-shakeable, no FOUT). Recommend an **`<Icon>` component** in `@churchix/ui` that renders the right glyph either way, so screens reference `<Icon name="church" />` rather than raw font spans. Pick the implementation and document the icon inventory used by the screens (`church`, `schedule`, `campaign`, `push_pin`, `event`, `live_tv`, `language`, `menu`, `account_balance`, `content_copy`, `description`, `download`, `sms`, `payments`, `person`, `candle`, `send`, `arrow_forward`, `diversity_1`, `calendar_month`).
3. Wire `font-display: swap`, preconnect/preload as needed, and the `font-variation-settings` fill/weight behavior for icons (the `.icon-fill` variant in the screens).
4. Ensure the families resolve through the typography tokens from item 02 and still honor per-church `brand.fontHeading`/`brand.fontBody` overrides.

## Acceptance criteria

- [ ] Headings render in Source Serif 4, body in Inter, in a built app — **no** request to `fonts.googleapis.com` at runtime.
- [ ] Romanian diacritics (ă â î ș ț) and German umlauts render correctly in both fonts.
- [ ] `<Icon name="…" />` (or chosen mechanism) renders every icon the screens use, with fill/weight control.
- [ ] Per-church font override via `brand.fontHeading`/`brand.fontBody` still works.
- [ ] Build passes; no layout shift from late-loading fonts on the schedule/home pages.

## Out of scope

- Using the icons/fonts inside specific components — that happens in each component item.
