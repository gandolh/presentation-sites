# ADR 0001 — Design-system foundation for white-label church sites

- **Status:** Superseded by [ADR-0002](0002-tailwind-material3-design-system.md) (2026-05-29)
- **Date:** 2026-05-29
- **Deciders:** Product owner; engineering
- **Context docs:** [wiki/architecture.md](../wiki/architecture.md), [wiki/content-model.md](../wiki/content-model.md), [wiki/donations.md](../wiki/donations.md)

> **Superseded:** This ADR was the *brief* given to Stitch (Google's AI UI tool). Stitch returned the **"Ecclesia Digitalis"** design system (`docs/design/`), which uses Tailwind + a full Material-3 token palette + Material Symbols — richer than the bounded plain-CSS "safe set" proposed here. [ADR-0002](0002-tailwind-material3-design-system.md) accepts that output and records the change. The intent below (token-driven, tradition-as-variant, the component/page inventory, a11y/i18n) still holds; only the *token surface* and *styling mechanism* changed.

> **Purpose of this ADR:** to be pasted into **Stitch** (Google's AI UI design tool) as the brief. It states what the design system must produce, the hard constraints it must honor, and what is explicitly out of scope — so the generated design comes back as a *system*, not a one-off page. Stitch should return a design that maps onto the token contract and component inventory below.

---

## Context

Churchix delivers **presentation websites + a giving surface** for Romanian Orthodox churches (v1), in Romania and the diaspora. Key facts that shape the UI:

- **White-label, not multi-tenant.** Each church is an independent static Astro build. The *only* thing shared is code (`@churchix/*`). The design system therefore lives in `@churchix/ui` and must look like *each church's* brand, never Churchix's.
- **Branding enters only as a bounded set of design tokens** (CSS custom properties) read from each church's `site` content entry at build time. Components never fork per church; bespoke layouts are a deliberate escape hatch, not the norm.
- **Astro static-first + React islands.** Most UI is static HTML. Only genuinely interactive bits hydrate (nav, donation widget, calendar, goal thermometer, pomelnice form).
- **v1 design target is the Orthodox tradition:** formal/liturgical tone, Byzantine restraint, gold/cream/burgundy palette, IBAN-first giving, Form 230, pomelnice. The system must stay *open* to evangelical churches later (warm, community tone) without a rewrite.
- **i18n + diacritics are mandatory.** RO + EN minimum (IT/ES/DE for diaspora). Full Romanian diacritics (ă, â, î, ș, ț) must render correctly; chosen fonts must support them.
- **Money = integer minor units + explicit currency.** Giving UI must always show currency explicitly (RON/EUR/USD).

The decision we need: **a single, token-driven design system that one component library can serve to many churches**, distinctive per brand yet disciplined enough to stay maintainable.

## Decision

Adopt a **token-driven, tradition-aware design system** with these properties:

### 1. Bounded token contract ("the safe set")

Branding is expressed *only* through these CSS custom properties. Stitch must design against these and introduce **no** church-specific hardcoded values. Token sprawl is the failure mode to avoid — keep this list short.

```css
:root {
  /* Color */
  --brand-primary:    #6b1f2a;   /* burgundy (Orthodox example) */
  --brand-accent:     #c8a24b;   /* gold */
  --brand-surface:    #faf7f2;   /* page background */
  --brand-on-primary: #ffffff;   /* text/icon on primary */
  --brand-ink:        #1d1a17;   /* default body text */
  --brand-muted:      #6f675d;   /* secondary text */

  /* Typography */
  --font-heading: "Source Serif 4", Georgia, serif;  /* must support RO diacritics */
  --font-body:    "Inter", system-ui, sans-serif;     /* must support RO diacritics */

  /* Shape & rhythm */
  --radius:  0.5rem;
  --space-unit: 0.25rem;  /* 4px base spacing scale */
}
```

- Logo, favicon, OG image come from the church's `site` content entry (paths), **not** tokens.
- Derived states (hover, disabled, focus ring, borders) are computed from these in the system — they are **not** new church-facing tokens.
- Anything a church can't express through this set is either (a) out of scope or (b) an explicit escape hatch sign-off, not a new token.

### 2. Tradition as a *theme variant*, not a fork

v1 ships the **Orthodox** theme (formal, gold/cream/burgundy, serif headings, generous whitespace, icon-respecting imagery). The same components must accept an **evangelical** variant later (warmer palette, sans headings, photography-forward, card-giving foregrounded) purely by swapping tokens + a `tradition` flag — no new components. Stitch should show the Orthodox look but keep layouts robust to this swap.

### 3. Component & page inventory Stitch must cover

Design these as a coherent set (states + responsive + RO/EN strings with diacritics):

**Global**
- Header / nav (multilingual, language switcher, prominent **Donează** CTA), mobile nav
- Footer (contact, IBANs, social, language)
- Section heading, breadcrumb, prose/MDX typography block

**Home**
- Hero (church name, next service time, livestream link, primary Donează CTA)
- Latest announcements strip
- Service-times summary card

**Core pages**
- **Program Slujbe** (service schedule) — the most-used page; weekly/monthly, cadence notes like "a 2-a și ultima duminică", downloadable monthly PDF/image
- Anunțuri (announcements list + detail; pinned state)
- Despre / Istoric + leadership (clergy hierarchy ordering)
- Livestream / Predici (embedded YouTube/Facebook player cards — never self-hosted)
- Galerie Foto (albums + lightbox)
- Evenimente / Calendar (list-first)
- Contact (address, map embed, phone/email, prayer-request form)

**Giving (the product differentiator — see [donations](../wiki/donations.md))**
- Donează landing: IBAN block (multi-currency, copy-to-clipboard), Form 230 info/CTA, SMS info, optional card button (hosted Stripe/Netopia link)
- Fund / campaign card with **goal thermometer** (live totals only when the optional API exists)
- Money always renders with explicit currency

**Orthodox add-ons**
- **Pomelnice form** — living (`pomelnic de vii`) and departed (`pentru cei adormiți`) name lists, optional offering, POSTs to a church-configured endpoint
- Orthodox calendar widget (saint of the day + fasting), sacrament info pages (Botez/Cununie/Parastas/Spovedanie)

**System primitives**
- Buttons (primary/secondary/ghost), inputs, form validation states, cards, badges/tags, alerts, empty states, 404/error pages — **all white-labeled to the church brand**

### 4. Accessibility & internationalization baked in

- WCAG AA contrast must hold across the realistic token range (dark burgundy primary on cream; gold accent is decorative, not a text color on light).
- Layouts must not break when strings get long (DE/RO are verbose) or when nav items stay in Romanian inside EN pages (e.g. "Slujbele religioase").
- Mobile-first; the schedule, livestream, and Donează flows must be excellent on phones (primary diaspora access pattern).

## Consequences

**Positive**
- One `@churchix/ui` serves every church; rebrand = change tokens, no redeploy of components.
- Stitch output maps directly onto the token contract → fast path from design to implemented Astro/React components.
- Discipline (bounded token set) keeps the white-label library maintainable as churches multiply.

**Negative / costs**
- Designs constrained to the safe set; a church wanting a truly bespoke look needs the escape hatch (explicit sign-off), not arbitrary token additions.
- Evangelical variant is *designed-for* but not *delivered* in v1 — risk it needs token additions; mitigated by reviewing both palettes during design.
- Stitch may propose flourishes that imply new tokens; those must be rejected or folded into derived states.

**Follow-ups**
- Verify chosen web fonts fully cover RO diacritics before locking typography tokens.
- Confirm the Orthodox palette passes AA across primary/surface/accent combinations.
- Translate the returned design into `@churchix/ui` components + the token CSS; keep one example church app as the reference render.

## Alternatives considered

- **Per-church bespoke designs (no shared system):** maximum flexibility, unmaintainable at scale, contradicts white-label. Rejected.
- **A single fixed theme for all churches:** simplest, but erases each church's identity and can't bridge Orthodox vs evangelical tone. Rejected.
- **Large, open-ended token set:** flexible but invites sprawl (12 → 200+ tokens) and inconsistency. Rejected in favor of the bounded safe set + escape hatch.

---

### Stitch prompt (copy/paste seed)

> Design a **white-label design system for Romanian Orthodox church websites**. Formal, reverent, liturgical tone; restrained Byzantine influence; palette of **burgundy primary (#6b1f2a), gold accent (#c8a24b), warm cream surface (#faf7f2)**, serif headings (Source Serif 4) + clean sans body (Inter), both supporting Romanian diacritics (ă â î ș ț). Mobile-first. All color/type/shape must derive from a small CSS-variable token set (primary, accent, surface, on-primary, ink, muted, font-heading, font-body, radius, spacing) so the same components can be re-skinned for other churches. Deliver: nav with language switcher + prominent "Donează" CTA, home hero with next service time + livestream link, **service schedule (Program Slujbe)**, announcements, donate landing (multi-currency IBAN block + Form 230 + SMS + optional card button), fund card with goal thermometer, **pomelnice form** (living + departed name lists), embedded-video cards, contact with map + prayer form, plus buttons/inputs/cards/alerts/empty/404 — all in their states and responsive. Always show money with an explicit currency. Keep layouts robust to long German/Romanian strings.
