# 15 — Accessibility (WCAG AA) + i18n/diacritics + long-string robustness pass

**Tier:** E · **Depends on:** 14 · **Parallel with:** —

## Goal

A dedicated hardening sweep across the now-restyled system: accessibility, internationalization, Romanian diacritics, and resilience to long DE/RO strings — the non-negotiables from [CLAUDE.md](../../CLAUDE.md) and ADR-0002.

## Tasks

1. **Contrast (WCAG AA):** audit every text/background token pairing in the realistic brand range. Confirm burgundy-on-cream and on-surface-variant pass; confirm **gold is never used as body text on light**. Fix violations by adjusting derived tokens, not by per-component hacks.
2. **Keyboard & focus:** every interactive element (nav, mobile nav, language switcher, copy-IBAN, amount presets, pomelnice form, CTAs) is reachable and operable by keyboard with a visible focus ring (focus→secondary). Logical tab order; no traps in the mobile nav island.
3. **Semantics & ARIA:** landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, progressbar roles on thermometers, form labels/`aria-describedby` for errors, `aria-current` on active nav.
4. **i18n:** confirm no user-facing string is hardcoded in a non-translatable way. Verify RO + EN render; spot-check that liturgical terms can stay Romanian inside EN pages. Dates/money localize correctly per locale.
5. **Diacritics end-to-end:** ă â î ș ț correct in headings, body, nav, form input/echo, slugs, and any generated PDF/receipt path. German umlauts too.
6. **Long-string robustness:** stress nav, buttons, badges, and cards with verbose DE/RO labels; nothing clips or overflows.
7. **Mobile excellence:** schedule, livestream, and Donează flows reviewed on small viewports (primary diaspora pattern).

## Acceptance criteria

- [ ] AA contrast holds across the default palette and a second test brand; documented.
- [ ] Full keyboard pass on every interactive surface; visible focus everywhere.
- [ ] Axe/Lighthouse (or equivalent) run on key pages with no critical a11y violations.
- [ ] Diacritics + umlauts verified across the listed surfaces.
- [ ] Long-string stress test passes with no clipping/overflow.
- [ ] Findings + fixes logged in `docs/wiki/log.md`.
