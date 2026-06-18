---
target: apps/parohia-harlesti-bacau
total_score: 32
p0_count: 1
p1_count: 2
timestamp: 2026-06-03T06-55-46Z
slug: apps-parohia-harlesti-bacau
---
# Critique — Parohia Hârlești (apps/parohia-harlesti-bacau)

Register: brand · North Star "The Digital Iconostasis". Re-run after fixes (mobile overflow, giving trust band, side-stripe retirement, Cardo heading font). Reviewed live across home, /program, /anunturi (+detail), /donatii, /pomelnice, /despre, /contact, 404, desktop (1280px) + mobile (375px). Two independent assessments (design review + detector/browser).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form has sending/error states; no live campaign feedback beyond a static bar |
| 2 | Match System / Real World | 4 | Liturgical RO vocabulary exact and reverent |
| 3 | User Control and Freedom | 3 | Back-links + 404 home; no breadcrumb on deep pages |
| 4 | Consistency and Standards | 3 | Tokens consistent, side-stripe removed system-wide; heading weight tokens (500/600) don't map to a real Cardo file |
| 5 | Error Prevention | 3 | IBAN trust band is exemplary fraud prevention; pomelnic form has no validation (empty submit possible) |
| 6 | Recognition Rather Than Recall | 4 | Everything on-screen; gold active-nav underline; copy-IBAN button |
| 7 | Flexibility and Efficiency | 3 | Copy-IBAN + preset amounts; no language switcher despite mandated i18n |
| 8 | Aesthetic and Minimalist Design | 4 | Standout — reverent, tonal layers over shadows; North Star achieved. Cardo lifts it |
| 9 | Error Recovery | 3 | 404 excellent; leaked dev string at pomelnic submit is the opposite of graceful |
| 10 | Help and Documentation | 2 | Good inline microcopy; no FAQ / "how a pomelnic works" / sacrament guidance |
| **Total** | | **32/40** | **Good, approaching Strong (up from 30)** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** Deliberately art-directed liturgical site: disciplined burgundy/cream/gold (gold never readable text), fixed architectural type scale, Cardo headings that render (verified, not a fallback) with clean RO diacritics, and domain-true content. Residual smell: triple DONEAZĂ on one mobile screen and a slightly long centered /program intro (mild marketing cadence). Firmly on the craft side.

**Deterministic scan** (`detect.mjs`, exit 2, **1 finding**, down from 3):
- `em-dash-overuse` ×1 — `BaseLayout.astro` ("16 em-dashes"). **Confirmed false positive both runs**: the `--` hits are CSS custom-property syntax, frontmatter fences, and a JSDoc comment in the build-time block, never rendered prose.
- **`side-tab` no longer fires anywhere** — the side-stripe retirement is verified complete.

**Cardo font (verified by glyph-width metrics):** rendering correctly on all pages, not falling back; 400 + 700 faces load; diacritics ă â î ș ț clean; no overflow. On-brand and dignified. One real gap: Cardo ships only 400/700, but heading tokens spec 500/600 — those resolve to the 700 (or 400) face, so the medium-weight tier is nominal, not literal.

**Overflow:** scrollWidth ≤ innerWidth at 375px on every page (home/donatii/anunturi/program/pomelnice all 360 ≤ 375). The prior 428-vs-375 bug stays fixed.

**Console:** clean on all pages (0 errors / 0 warnings).

## Overall Impression
The fixes landed and the site is now genuinely good: the giving page reassures, the side-stripe cleanup is complete, and Cardo gives the headings real liturgical authority. The score moved modestly (30→32) because two new issues cap the ceiling: a developer string leaking at the end of the most sacred flow, and the gold focus ring failing the WCAG 2.2 AA bar this project just adopted. Both are concentrated, fixable, and high-leverage.

## What's Working
1. **The IBAN trust band on /donatii is best-in-class for the donor-fraud job** — "BENEFICIAR / Parohia Ortodoxă „Sfinții Trei Ierarhi" Hârlești", the shield-icon "verificați că beneficiarul… exact cum apare mai jos" reassurance, and a keyboard-reachable COPIAZĂ button directly answer "is this the real parish account?".
2. **Restraint executed at the system level** — gold side-stripe removal is complete and consistent; featured cards uniformly use the gold bottom border; the blockquote uses a 1px neutral rule + decorative gold quote glyph. Gold is confined to decoration everywhere (zero gold-as-text hits across all pages).
3. **Cardo + accessibility fundamentals** — Cardo renders as a dignified liturgical upgrade with clean diacritics; skip-to-content link, semantic hamburger with aria-label/aria-expanded, proper `<label for>` on inputs, no horizontal overflow anywhere.

## Priority Issues

- **[P0] Leaked developer text at the end of the pomelnic flow.** "Demo: niciun endpoint configurat — setați `giving.pomelniceEndpoint` în site.json" renders live whenever the endpoint is unset (`PomelnicForm.tsx` ~L286-291), and the submit is a no-op. The parishioner completes the most sacred, high-trust act (submitting names of the departed for prayer) and meets dev jargon + silence — the peak-end of the flow is a silent failure. **Fix:** gate the message behind `import.meta.env.DEV`; in production with no endpoint, disable submit with a warm RO fallback ("Momentan trimiterea online nu este disponibilă — vă rugăm sunați parohia") or fall back to mailto/phone; add a real success state ("Pomelnicul a fost trimis. Numele vor fi pomenite la Sfânta Liturghie."). → `$impeccable harden`
- **[P1] Gold focus ring fails WCAG 2.2 focus-appearance on light surfaces.** `focus-visible:ring-secondary` (gold, ~2.29:1 on cream) on every button/field/link over cream/white is below the 3:1 threshold — and the focus indicator is *information*, the one place gold must be legible. Affects the IBAN copy button, all form fields, footer/nav, cards. (On the burgundy hero, gold offset is 6.37:1 and fine.) Notable because the project just raised its bar to WCAG 2.2 AA. **Fix:** switch the on-light focus ring to burgundy `--primary` (14.6:1), or a 3px gold ring plus a burgundy outline; keep gold only where the offset is burgundy. → `$impeccable audit` (or `colorize` to retune the focus token)
- **[P1] No language switcher despite mandated i18n + an explicit diaspora audience.** The live site is RO-only; CLAUDE.md makes i18n mandatory and names US/CA/UK/IT/ES/DE diaspora as core. A second-generation diaspora donor hits a RO-only wall on the giving page. (Header has switcher logic gated on >1 locale; the parish ships one locale.) **Fix:** ship EN at minimum (liturgical terms may stay RO per glossary), surface the switcher. → `$impeccable adapt`
- **[P2] Pomelnic form has no validation and identical Vii/Adormiți placeholders.** Zero required fields (empty submit possible); both name textareas show the same placeholder, inviting mis-filed names on a flow where correctness is spiritually meaningful. **Fix:** require ≥1 name across the two boxes before enabling submit; differentiate placeholders. → `$impeccable harden`
- **[P2] Heading weight tokens don't match the font.** Tokens spec 500/600 weights Cardo can't produce (it ships 400/700 only), so the medium tier is a fiction. **Fix:** reconcile the type-scale weight tokens to Cardo's real 400/700, or document that 600→700 is intentional. → `$impeccable typeset`
- **[P3] Triple DONEAZĂ on one mobile screen + over-long centered /program intro.** Header + hero + mobile-menu each render DONEAZĂ; the /program intro is a 4-line centered paragraph. Mild redundancy/marketing cadence against the reverent register. **Fix:** drop the hero's secondary CTA when the header CTA is sticky; tighten the intro. → `$impeccable distill`

## Persona Red Flags

**Jordan (confused first-timer):** on /pomelnice, fills names, presses "Trimite pomelnicul", nothing happens + the cryptic "Demo: niciun endpoint…" line appears — assumes the site is broken and abandons. On /donatii, three giving channels at once with no "not sure? start here".

**Sam (screen-reader/keyboard):** focus is present everywhere but **visually near-invisible** — gold ring on cream (2.29:1) on the IBAN copy button, all pomelnic fields, footer/nav. Skip-link and labels are good, but Sam loses track of focus on the forms. The amount radios also lack a programmatic group label (`<fieldset>/<legend>`).

**Casey (distracted mobile):** well-served on overflow/tap-targets/sticky CTA, but sees DONEAZĂ 3× (header + hero + menu) and may second-guess which is "the" donate; identical Vii/Adormiți placeholders are a glance-and-go misfile risk.

## Minor Observations
- IBAN is placeholder ("RO00 XXXX…") — ship-blocker before launch; COPIAZĂ would copy junk.
- 404 home link is bare `/`; the app supports `BASE_PATH` — verify home links use Astro's base helper before deploying under a subpath.
- Campaign progress is static (24% / 12.000 of 50.000 RON) — fine for SSG; consider a "last updated" date so it doesn't read stale.
- `despre.astro` demo disclaimer must be stripped for production.

## Questions to Consider
1. If a grieving parishioner submits a departed loved one's name and gets a no-op + dev text, have you broken trust more than a generic SaaS form would? Should the pomelnic fall back to mailto/phone when no endpoint is configured?
2. You enforce "gold is decorative only" rigorously for text, yet use gold as the focus indicator — the one place the color must be functionally legible. Is the focus ring decoration or information? (It's information, and that's why it fails 2.2 AA.)
3. The type scale specs weights (500/600) the chosen font can't produce. Are the tokens describing the brand, or a font you no longer use?
4. i18n is "mandatory" per the brief and diaspora is a named audience, yet the live site is monolingual. Deferred, or quietly lapsed?
