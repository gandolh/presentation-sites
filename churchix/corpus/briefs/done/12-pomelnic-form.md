# 12 — Pomelnice form island: vii/adormiți bento + offering presets

**Tier:** C · **Depends on:** 05 · **Parallel with:** 07–11, 13

## Goal

Rebuild the **Pomelnice** form — a first-class Orthodox feature with no Protestant analog — to the reference design, while keeping the existing submission logic and demo-mode behavior.

## Reference

`docs/design/stitch_churchix_white_label_design_system/pomelnice_online/` (`code.html` + `screen.png`). Affects [PomelnicForm.tsx](../../../packages/ui/src/islands/PomelnicForm.tsx) and `apps/*/src/pages/pomelnice.astro`.

## Context

- This is an interactive **React island** (POSTs to `giving.pomelniceEndpoint`; demo mode shows a confirmation when no endpoint is set). Keep that contract.
- The design splits into a **two-card bento**: "Pomelnic de Vii" (`person` icon, primary-tinted header) and "Pentru Adormiți" (`candle` icon, tertiary-tinted header) — each a names textarea ("un nume pe rând"). Then an **Ofrandă (Donație)** section with amount presets (20/50/100 RON + custom) and optional **contact details** (name, email — used for receipts). Submit is a primary "Trimite Pomelnicul" button with `send` icon.
- A subtle **parchment texture** background (`.bg-pattern` radial dots) sits behind the form — reproduce as a token-driven utility.
- The current island uses one `kind` radio (vii **or** adormiți). The design lets a user fill **both** lists at once — update the data model accordingly (submit both `nume_vii` and `nume_adormiti`).

## Tasks

1. Restyle `PomelnicForm.tsx` to the bento layout using the item-05 primitives (Card, Field, Button). Two name textareas (living + departed), each able to be filled independently.
2. Add the **Ofrandă** preset+custom amount control (money as minor units + explicit currency) and optional contact fields. Offering is optional; the form is valid with at least one name in either list.
3. Preserve submit/demo/error/success states and the `endpoint` prop behavior; update the POST payload to carry both lists + offering + contact.
4. Apply the parchment `bg-pattern` behind the form via a token-driven background (no raw hex).
5. Keep it accessible: labeled fields, focus→secondary, keyboard submit, error announced.
6. Wire `pomelnice.astro` in both apps; gate on `features.pomelnice`.

## Acceptance criteria

- [ ] Form matches the reference bento (vii + adormiți cards, offering presets, optional contact, send button).
- [ ] Both name lists submit together; offering optional; validates with ≥1 name.
- [ ] Demo mode (no endpoint) and real POST both behave; success/error states styled.
- [ ] Diacritics in names submit and display correctly; fully keyboard-accessible.
- [ ] Re-skins by token; build + typecheck pass; gated on `features.pomelnice`.

## Outcome (2026-10-07)

Built on 2026-05-29. `packages/ui/src/islands/PomelnicForm.tsx` posts `nume_vii` and `nume_adormiti` together, accepts one name in either list, sends the offering as integer minor units with a currency, and keeps demo mode when no `endpoint` is set. `apps/parohia-harlesti-bacau/src/pages/pomelnice.astro` gates on `features.pomelnice` and draws the parchment dots from tokens. Evidence: the item 12 entry in [log.md](../../log.md).
