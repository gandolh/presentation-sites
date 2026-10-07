# 11 — Campaign card with goal thermometer + project card variant

**Tier:** C · **Depends on:** 05 · **Parallel with:** 07–10, 12, 13

## Goal

Restyle the [CampaignCard.astro](../../../packages/ui/src/components/CampaignCard.astro) to the design and add the "Proiect Special" variant used on the donate page's right column — both featuring a **goal thermometer**.

## Reference

The "Pictură Biserică" project card in the donate screen (image header, "Proiect Special" badge, gold progress bar at 65%, "Obiectiv: 50.000 EUR", "Susține Proiectul" outline button) and the campaign treatment described in [DESIGN.md](../../../docs/design/DESIGN.md).

## Context

- Data: `campaignSchema` — `title`, `summary?`, `goalAmountMinor`, `raisedAmountMinor`, `currency`, `deadline?`, `status`, `cardUrl?`, `cover?`, `order`. Existing card already computes `pct` and formats money with `Intl.NumberFormat` + explicit currency — preserve that.
- **Live totals caveat:** real-time `raisedAmountMinor` only exists when the optional per-church API is present. The static build shows the last-known value with **no** real-time implication. If item 01/architecture introduces a client fetch for live totals, gate it behind a flag and keep a static fallback.
- **Money:** integer minor units + explicit currency, always.

## Tasks

1. Restyle `CampaignCard.astro`: card with optional `cover` image header, category badge, title in `font-headline-md text-primary`, summary, the **thermometer** (gold `bg-secondary` fill on a `surface-variant` track, rounded-full), a "X% / Obiectiv: …" line, optional deadline, and a status-aware CTA ("Contribuie" / "Susține Proiectul" linking to `cardUrl`; "Obiectiv atins — mulțumim!" when completed).
2. Support a `variant` prop: `card` (list/grid use) vs `project` (the donate-page featured layout with image header + outline CTA).
3. Keep `aria-valuenow/min/max` on the progress bar; ensure the percentage is also conveyed as text (not color-only).
4. If a live-totals fetch is added, make it an opt-in island with a static SSG fallback; never block render on it.

## Acceptance criteria

- [ ] Both variants render to the design; thermometer fill is gold on a muted track.
- [ ] Money shows explicit currency; percentage is text + bar (not color-only).
- [ ] Completed campaigns show the thank-you state; active ones link to `cardUrl`.
- [ ] No real-time claim without the optional API; static fallback always works.
- [ ] Re-skins by token; build + typecheck pass.

## Outcome (2026-10-07)

Built on 2026-05-29. `packages/ui/src/components/CampaignCard.astro` has `card` and `project` variants. Its thermometer is a gold bar on a muted track with `role="progressbar"` and the percentage as text. Money goes through `Intl.NumberFormat` with an explicit currency, and the CTA follows `status`. It does no live fetch. Evidence: the item 11 entry in [log.md](../../log.md).
