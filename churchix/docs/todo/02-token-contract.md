# 02 — M3 token contract: CSS vars + Tailwind theme + per-church brand mapping

**Tier:** A→B · **Depends on:** 01 · **Parallel with:** —

## Goal

Define the **Material-3 token contract** as CSS custom properties, map it into the Tailwind theme, and wire **per-church brand overrides** so a church re-skins by editing its `site` content entry — never by touching code. This is the heart of the white-label promise under the new (Tailwind + M3) approach.

## Context

- [DESIGN.md](../design/DESIGN.md) frontmatter is the full token source: `colors` (M3 roles: `primary`, `on-primary`, `primary-container`, `secondary`, `surface`, `surface-container-*`, `outline`, `outline-variant`, `error`, the `*-fixed` set, etc.), `typography`, `rounded`, `spacing`.
- Reference screens consume these as Tailwind classes (`bg-surface-container-lowest`, `text-on-surface-variant`, `border-outline-variant/30`, `text-headline-lg`, `px-gutter`).
- Current `packages/ui/src/styles/tokens.css` defines a **small** legacy set (`--brand-primary`, `--brand-accent`, …) and `BaseLayout.astro` emits per-church overrides from `site.brand`. We are **expanding** this to the M3 set while keeping the same "emit from content" mechanism.
- ADR-0002 decided the M3 palette *is* the contract now. The anti-sprawl spirit of ADR-0001 survives as: churches set a **small handful of seed colors** (primary, secondary/gold, surface, optionally error) and the rest of the M3 roles are **derived** in the base layer, not hand-set per church.

## Tasks

1. In `tokens.css`, declare the **full M3 palette** as CSS variables under `:root`, using the DESIGN.md defaults (Orthodox burgundy/gold/cream) as the baseline.
2. Map every variable into the Tailwind theme (from item 01) so `bg-primary`, `text-on-surface-variant`, etc. resolve to `var(--primary)` etc. Keep names identical to the reference screens.
3. Define the **seed → derived** rule: a church sets `primary`, `secondary`, `surface` (and optionally `error`); the base layer computes container/on-/variant roles via `color-mix()` (or documents fixed defaults if `color-mix` support is a concern). Document exactly which roles are church-settable vs derived.
4. Update `BaseLayout.astro` to emit the church's seed tokens as a `:root{ … }` style block (extend the existing `brandVars` logic). Keep it minimal — only the seeds, never the full palette per church.
5. Keep typography tokens (`--font-display-lg` etc.) and the named `spacing`/`rounded` scales wired so `font-display-lg`, `px-gutter`, `rounded-lg` work.
6. Verify **WCAG AA**: dark burgundy primary on cream surface; gold is decorative only (flag if any reference usage puts gold text on light as body copy).

## Acceptance criteria

- [ ] All M3 color roles from DESIGN.md are available as Tailwind utilities backed by CSS vars.
- [ ] Setting only `primary` + `secondary` + `surface` in a church's `site` entry visibly re-skins a sample page; derived roles update sensibly.
- [ ] Typography, spacing (`base/xs/sm/md/lg/xl/gutter/container-max`), and radius (`sm/DEFAULT/md/lg/xl/full`) tokens resolve.
- [ ] A short table in the file (or in `docs/wiki/`) lists **church-settable** vs **derived** tokens.
- [ ] AA contrast verified for the default Orthodox palette across primary/surface/secondary text combos.

## Out of scope

- Schema fields that carry these values — item 03.
- Restyling components — tier B+.
