# 06 — Restyle Header (lang switcher + Donează) and Footer

**Tier:** C · **Depends on:** 02, 04, 05 · **Parallel with:** 07–13

## Goal

Restyle the global [Header.astro](../../packages/ui/src/components/Header.astro) and [Footer.astro](../../packages/ui/src/components/Footer.astro) (and the [MobileNav.tsx](../../packages/ui/src/islands/MobileNav.tsx) island) to the design — present on every page, so it sets the tone.

## Context (from the reference screens — all four share this chrome)

- **Header:** sticky, `bg-surface/95 backdrop-blur-md`, bottom `border-outline-variant/30`. Brand wordmark in `font-display-lg text-primary`. Desktop nav uppercase `label-md`, active item gets `border-b-2 border-secondary font-bold text-primary`; inactive hover → `text-primary` + `bg-surface-container-low`. A **language switcher** (`language` icon button) and a prominent **Donează** CTA (pill or `rounded-lg`, `bg-primary-container text-on-primary`). Mobile: hamburger toggles the nav island.
- **Footer:** `bg-surface-container-high`, top `border-secondary/20`, 4-col grid: brand column + links (Termeni, Confidențialitate, IBAN Donații, Contact Preot) + copyright. Keep the existing footer's richer content (address, IBANs, social) but restyle to the design.
- Existing components already pull `site.nav`, `site.features.giving`, `site.contact`, `site.giving.ibans` — keep that data flow; only restyle + add the language switcher.

## Tasks

1. Restyle `Header.astro` to the spec; keep `isActive` logic, add the language-switcher control. Wire the switcher to the church's `site.locales` / `defaultLocale` (a real locale menu if multiple locales, else hide). Keep **Donează** gated on `site.features.giving`.
2. Update `MobileNav.tsx` to match (same nav items + Donează + language options), preserving the island boundary (`client:load`).
3. Restyle `Footer.astro` to the 4-column design while retaining contact/IBAN/social content and the `© year name` line.
4. Use `<Icon>` (item 04) for `language`, `menu`, social glyphs.
5. Long-string robustness: nav must not overflow with verbose DE/RO labels; wraps/collapses gracefully.

## Acceptance criteria

- [ ] Header matches the screens (sticky, blur, active underline in gold, Donează CTA, lang switcher) and re-skins by token.
- [ ] Mobile nav island opens/closes, is keyboard-accessible, and lists the same items.
- [ ] Footer matches the design and still surfaces address, IBANs, social, copyright.
- [ ] Donează CTA only shows when `features.giving` is true; lang switcher only when >1 locale.
- [ ] Build + typecheck pass; verified in both reference apps.
