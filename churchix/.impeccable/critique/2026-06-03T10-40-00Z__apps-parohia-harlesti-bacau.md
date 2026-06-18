---
target: apps/parohia-harlesti-bacau
total_score: 35
p0_count: 0
p1_count: 1
timestamp: 2026-06-03T10-40-00Z
slug: apps-parohia-harlesti-bacau
---
# Critique — Parohia Hârlești (apps/parohia-harlesti-bacau) — Re-run after fixes

Register: brand · North Star "The Digital Iconostasis". Re-run after: P0 dev leak gated behind `import.meta.env.DEV`; triple-DONEAZĂ mobile fix in Hero; pomelnic form validation live; heading weight tokens reconciled. Reviewed across home, /program, /anunturi (+detail), /donatii, /pomelnice, /despre, /contact, 404, desktop (1280px) + mobile (375px).

## Design Health Score

| # | Heuristic | Score | Key Change / Status |
|---|-----------|-------|---------------------|
| 1 | Visibility of System Status | 4 | Form states (sending/done/error) clear; no dev leaks in production. **+1 from 3** |
| 2 | Match System / Real World | 4 | Liturgical RO vocabulary exact and reverent. No change. |
| 3 | User Control and Freedom | 3 | Back-links present; no breadcrumbs on deep pages. No change. |
| 4 | Consistency and Standards | 4 | Tokens consistent; heading weight story resolved (Cardo 400/700 is intentional). **+1 from 3** |
| 5 | Error Prevention | 4 | Pomelnic `hasName` validation live; IBAN trust band; form hints. **+1 from 3** |
| 6 | Recognition Rather Than Recall | 4 | Everything on-screen; gold active-nav underline; copy-IBAN button. No change. |
| 7 | Flexibility and Efficiency | 3 | Copy-IBAN + preset amounts; language switcher deferred by design. No change. |
| 8 | Aesthetic and Minimalist Design | 4 | Reverent, tonal, North Star achieved. Cardo headings dignified. No change. |
| 9 | Error Recovery | 4 | 404 excellent; no dev jargon in production; warm fallback when no endpoint. **+1 from 3** |
| 10 | Help and Documentation | 2 | Inline microcopy good; no FAQ or pomelnic spiritual guidance. No change. |
| **Total** | | **35/40** | **Strong** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** Deliberately art-directed liturgical site: disciplined burgundy/cream/gold, Cardo headings with clean RO diacritics, no banned patterns introduced. Mobile hero is now restrained (one CTA per screen).

**Deterministic scan** (`detect.mjs`, exit 2, **2 findings** — both confirmed false positives):
- `em-dash-overuse` ×1 — `BaseLayout.astro`: hits are CSS custom-property syntax (`--`), frontmatter fences, and JSDoc comments, not rendered prose.
- `overused-font` ×2 — Inter in `fonts.css`: documented identity choice (DESIGN.md: "Inter is a committed, shipped identity choice paired on a real contrast axis with the serif").

**Console:** clean on all pages (0 errors / 0 warnings).

## What Was Fixed

### P0: Dev String Leak at Pomelnic Submit (FIXED ✓)
PomelnicForm.tsx now gates the dev note behind `import.meta.env.DEV`. In production with no endpoint configured: submit is disabled, and a warm RO fallback renders — "Trimiterea pomelnicului online nu este încă disponibilă pe acest site. Vă rugăm să aduceți pomelnicul la biserică sau să sunați la parohie, iar numele vor fi pomenite la Sfânta Liturghie." No dev jargon, no silent failure.

### P3a: Triple DONEAZĂ on Mobile (FIXED ✓)
Hero primary giving CTA is now `hidden sm:inline-flex`. On mobile the hero shows only "Vezi programul"; Donează is accessible via the hamburger menu. On sm+ both hero CTAs show alongside the header pill.

### P2: Pomelnic Form Validation (VERIFIED ✓)
`hasName` check prevents empty submit. Validation error announces via `aria-live="assertive"`. Placeholders differentiated: "ex: Ioan, Maria, pr. Vasile" (Vii) vs. "ex: Vasile, Elena, Gheorghe" (Adormiți).

### P2: Heading Weight Tokens (VERIFIED ✓)
All heading tokens use `font-weight: 700`. Cardo is a static 400/700 font; `font-weight: 600 700` in fonts.css maps both to the 700 file. The system is coherent.

### P1: Gold Focus Ring (RE-ASSESSED — NOT AN ISSUE)
Hero CTAs use `ring-secondary` with `ring-offset-primary` (burgundy offset on dark hero = ~6.4:1). All elements on light surfaces use `ring-primary` (burgundy, ~14.6:1). Full codebase scan confirms compliance. Previous critique overstated scope.

## Remaining Gaps

- **[P1] Language switcher deferred.** Header gates on `locales.length > 1`; live site is RO-only. If diaspora (EN/IT/ES/DE) is a real audience per CLAUDE.md, shipping a second locale is the unlock — no code change required.
- **[P2] No FAQ or spiritual guidance on /pomelnice.** The form is solid; older parishioners may not know what a pomelnic is. A collapsible "Cum funcționează?" or a `<details>` callout would close the gap.
- **[P3] No breadcrumbs on /anunturi/[slug].** Back-links are present; low priority.

## Persona Check-In

**Jordan (confused first-timer on /pomelnice):** Submits names, hits "Trimite Pomelnicul". No endpoint = submit disabled + warm fallback message. No dev text, no silent failure. ✓

**Sam (keyboard/screen-reader):** Burgundy focus rings on light surfaces throughout. Validation error via `aria-live`. MobileNav focus trap + Esc. ✓

**Casey (distracted mobile):** Hero shows one CTA on mobile; Donează is one tap via menu. No redundant buttons. ✓

## Minor Observations
- IBAN is still placeholder ("RO00 XXXX…") — ship-blocker before launch; needs real parish values in site.json.
- Campaign progress is static (24% / 12.000 of 50.000 RON) — acceptable for SSG; consider a "last updated" date.
- `despre.astro` demo disclaimer should be stripped before production.
