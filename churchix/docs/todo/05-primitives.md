# 05 — System primitives: Button, Card, Badge, Input, Alert, EmptyState, Divider

**Tier:** B · **Depends on:** 02, 04 · **Parallel with:** —

## Goal

Build the white-labeled primitive components every page composes from, styled to the **Ecclesia Digitalis** spec. These are the foundation the page-level items (06–13) reuse — get the variants and states right here so nothing is re-invented downstream.

## Context

- Spec & states are in [DESIGN.md](../design/DESIGN.md) (§Components, §Shapes, §Elevation). Reference usage across all four screens.
- **Buttons:** primary = solid burgundy (`bg-primary-container`/`bg-primary` `text-on-primary`), secondary = gold (`secondary`) outline, ghost. Generous horizontal padding for long Romanian verbs. Hover = subtle ambient shadow; active = `scale-95`/`scale-[0.98]`. Pill (`rounded-full`) and `rounded-lg` variants both appear — support a `shape` prop.
- **Cards:** white (`surface-container-lowest`), `rounded-lg/xl`, 1px `outline-variant/30` border, soft shadow. **Featured** variant = gold accent (left bar `bg-secondary` or bottom border `border-b-2 border-secondary`).
- **Inputs/textarea:** light `outline-variant/50` border, transparent bg; **focus transitions border + ring to `secondary`** (a hard requirement from the spec). Label in `label-md`.
- **Badge/Chip:** category tags ("Liturgic", "Proiect Special", "Fixat") using muted/secondary tints + optional leading icon.
- **Alert:** info/success/error using M3 `error`/`error-container` etc.
- **Empty state:** icon + message + optional CTA.
- **Divider:** the spec calls for a custom SVG divider — a horizontal line with a small **cross / Byzantine node** in the center (see `bg-divider-pattern` in the program screen). Build this as a reusable component.

## Tasks

1. Create primitives in `packages/ui/src/components/` (`.astro` where static; only interactive ones need islands). Suggested: `Button.astro`, `Card.astro`, `Badge.astro`, `Field.astro` (input/textarea/select wrapper), `Alert.astro`, `EmptyState.astro`, `Divider.astro`.
2. Support the variants/states above via props (`variant`, `shape`, `featured`, `tone`). No raw hex — tokens only.
3. The `Divider` ships the cross/Byzantine-node SVG; ensure it scales and uses `currentColor`/`secondary` so it re-skins.
4. Document the prop API at the top of each file (short JSDoc-style comment) so page items can consume without re-reading internals.
5. Buttons/inputs must be keyboard-accessible with visible focus (focus→secondary ring).

## Acceptance criteria

- [ ] Each primitive renders all its variants/states from props; visually matches the screens.
- [ ] Focus state transitions border/ring to `secondary` on inputs.
- [ ] Everything re-skins via tokens (verify under a second brand).
- [ ] WCAG AA contrast holds for button text and badge text.
- [ ] Build + typecheck pass.

## Out of scope

- Composing these into pages — items 06–13.
- The pomelnice/campaign interactive logic — items 11, 12 (they *use* these primitives).
