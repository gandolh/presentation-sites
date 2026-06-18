# 10 — Donate page: card CTA, copy-to-clipboard IBANs, Form 230, SMS

**Tier:** C · **Depends on:** 05, 06 · **Parallel with:** 07–09, 11–13

## Goal

Rebuild the **Susține parohia / Donează** landing to the reference design — the product differentiator. Two-column layout: primary giving (online card + IBAN transfer) on the left, secondary methods + a featured project on the right.

## Reference

`docs/design/stitch_churchix_white_label_design_system/sus_ine_parohia_doneaz/` (`code.html` + `screen.png`). Affects [GivingChannels.astro](../../packages/ui/src/components/GivingChannels.astro) and `apps/*/src/pages/donatii.astro`.

## Context

- Data: `site.giving` ([packages/schemas/src/index.ts](../../packages/schemas/src/index.ts)) — `currency`, `ibans[]` (label/iban/currency), `cardUrl?`, `form230` + `form230Url?`, `smsKeyword`/`smsNumber`/`smsAmount`. See [corpus](../corpus/index.md) giving notes.
- **PCI SAQ A:** card data never touches our code. The "Donează Online" button + amount presets link **out** to the hosted `cardUrl` (Stripe Payment Link / Netopia). Presets (50/100/200 + "Altă sumă") are UI affordances that pass an amount to the hosted page if its URL supports it, else just deep-link.
- **Money** always shows explicit currency; integer minor units internally.

## Tasks

1. **Online card block:** amount preset buttons (gold outline) + custom-amount input with currency prefix, and a "Donează Online →" button linking to `cardUrl` (hidden if unset). Never collect card data locally.
2. **IBAN transfer block:** `account_balance` icon, one row per IBAN with label (e.g. "Cont RON"), the IBAN in a `select-all` monospace-ish style, and a **copy-to-clipboard** button (`content_copy` icon). This needs a tiny interactive island for the clipboard write + "copied" feedback (keep it minimal, `client:visible`).
3. **Form 230 block:** "Redirecționează 3.5%" card with faint oversized `description` background icon, explainer, and a `download` "Descarcă Formularul" link (from `form230Url`). Only render when `giving.form230`.
4. **SMS block:** centered `sms` icon card showing keyword + number + amount, with the "billed monthly by your carrier" caption. Only render when SMS fields present.
5. **Featured project card:** right column, image header, "Proiect Special" badge, title, blurb, a **goal thermometer** + "Susține Proiectul" button — this consumes the campaign component from item 11 (coordinate; this item places it, item 11 builds it).
6. Wire `donatii.astro` in both apps; render only the channels each church configured.

## Acceptance criteria

- [ ] Layout matches the reference (left primary giving, right secondary + project).
- [ ] IBAN copy-to-clipboard works with visible "copied" feedback and is keyboard-accessible.
- [ ] Card giving is an outbound link only — no card fields locally (PCI SAQ A honored).
- [ ] Form 230 / SMS blocks render only when configured; amounts show explicit currency.
- [ ] Re-skins by token; build + typecheck pass in both apps.
