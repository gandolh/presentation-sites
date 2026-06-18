---
target: apps/parohia-harlesti-bacau
total_score: 29
p0_count: 0
p1_count: 4
timestamp: 2026-06-03T08-35-09Z
slug: apps-parohia-harlesti-bacau
---
# Critique — Parohia Hârlești (apps/parohia-harlesti-bacau) — run 3

Register: brand · North Star "The Digital Iconostasis". Third scored run after full audit + typeset pass. Reviewed at desktop (1280px) + mobile (375px) across all pages.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hero next-service badge answers the #1 job; pomelnice submit validation is live |
| 2 | Match System / Real World | 4 | Liturgical RO vocabulary exact; Orthodox-specific structure throughout |
| 3 | User Control and Freedom | 3 | Good back-links; /pomelnice and /donatii have no escape path from external deep-link |
| 4 | Consistency and Standards | 3 | Nav gold underline consistent; hero UPPERCASE CTAs vs pill Donează creates minor visual tension |
| 5 | Error Prevention | 3 | Pomelnice validates before submit; demo disclaimer on /despre undermines content trust |
| 6 | Recognition Rather Than Recall | 3 | Schedule "Săptămâna curentă" but no today-highlight; primary actions visible |
| 7 | Flexibility and Efficiency | 2 | No iCal, no WhatsApp share, no IBAN deep-link — recurring-user and diaspora gaps |
| 8 | Aesthetic and Minimalist Design | 3 | Homepage clean; campaign card on /donatii reads SaaS; sparse announcement list leaves dead space |
| 9 | Error Recovery | 3 | Branded 404; contact success state properly wired; pomelnice warm fallback in prod |
| 10 | Help and Documentation | 2 | No first-time pomelnic explainer; demo notice on /despre visible to parishioners |
| **Total** | | **29/40** | **Acceptable — production-readiness gating items remain** |

## Anti-Patterns Verdict

**Does not read as AI-generated.** Cardo + burgundy/cream/gold system, liturgical terminology, Orthodox-specific flows (pomelnice, Form 230, hramul) all signal deliberate craft. The one residual SaaS smell is the campaign progress bar on /donatii which has no distinctive Orthodox character.

**Deterministic scan** (`detect.mjs`, exit 2, **1 finding**): `em-dash-overuse` in BaseLayout.astro — confirmed false positive (CSS `--var` syntax in frontmatter JS, not rendered prose). `side-tab` does not fire. Console clean across all tested pages. No overflow at 375px on any page.

**Typography changes verified live:** `font-optical-sizing: auto` active on html; `text-wrap: balance` on all h1s; label letter-spacing confirmed `0.7px` (= 0.05em at 14px); no `tracking-wide` co-occurring with `text-label-md` anywhere; Cardo 700 loaded and rendering (not Georgia fallback); placeholder contrast raised to `/75` active.

## Overall Impression

Typographically this is now the strongest it has been: Cardo headings with optical sizing, balanced wrapping, and correctly-spaced uppercase labels. The hero is genuinely liturgical. The product-readiness ceiling is a demo notice on /despre that ships to production, desktop nav links at 28px, and a footer IBAN rendered at 12px in a `<code>` tag. These are quick fixes; the design itself is sound.

## What's Working

1. **Hero typography is genuinely liturgical.** Cardo 700 at 48px with `text-wrap: balance`, optical sizing, and the gold eyebrow at `tracking-widest` on the burgundy field achieves the "Digital Iconostasis" North Star. The pairing is confident and distinct.
2. **IBAN trust architecture on /donatii is exemplary** — holder name in bold, shield-icon verify band, tabular-nums tracked IBAN, accessible copy button. Directly addresses diaspora fraud anxiety.
3. **Zero horizontal overflow, diacritics correct everywhere.** Romanian ă/â/î/ș/ț render from Cardo's latin-ext faces on headings, Inter on body. No layout breaks at 375px across all pages.

## Priority Issues

- **[P1] Demo notice on /despre visible to parishioners.** `(Conținut orientativ pentru demonstrație. Datele de contact și IBAN-ul urmează să fie completate de parohie.)` at `despre.astro:67` ships in every production build. A visitor researching the parish reads "this is placeholder content" — undermines every claim on the page. Fix: gate with `import.meta.env.DEV` or replace with real content. → `$impeccable harden`
- **[P1] Desktop nav links 28px hit area (py-1 = 4+20+4 = 28px).** Six nav links in `Header.astro` use `navLinkBase: ...py-1...` giving 28px total height. Primary audience is older parishioners — misclicks on desktop nav are high-impact. Fix: raise to `py-2` (36px) or `py-2.5` (44px). → `$impeccable adapt`
- **[P1] Button sm variant 36px (py-2 = 8+20+8 = 36px).** Header Donează pill uses `size="sm"` = `py-2`. Fix: raise sm to `py-2.5` (min 44px) in Button.astro. → `$impeccable adapt`
- **[P1] Footer IBAN at 12px in `<code>`.** IBAN renders via `font-caption text-caption` (12px) in a `<code>` element — `Footer.astro:87`. The most security-critical piece of data is the least legible. Fix: raise to `text-label-md` (14px) with `tabular-nums tracking-wider`, and change `<code>` to `<span>` or `<data>` semantically. → `$impeccable polish`
- **[P2] No first-time pomelnic explainer.** No preamble explaining what a pomelnic is, what happens to it, or what the offering is for. First-time diaspora users. Fix: 2–3 sentence lead before the two name fields. → `$impeccable clarify`
- **[P2] Campaign card has no Orthodox character.** Progress bar widget reads as a generic GoFundMe/SaaS fundraiser. Fix: liturgical framing in the campaign header. → `$impeccable delight`
- **[P3] Footer IBAN `<code>` semantic mismatch.** IBAN is account data, not code. Use `<span>` or `<data value="...">`. → `$impeccable polish`

## Persona Red Flags

**Jordan (first-timer):** Navigates to /pomelnice with no context for what a pomelnic is; no explainer before the form. On /despre reads "(Conținut orientativ...)" and questions all parish data.

**Sam (keyboard/screen reader):** Nav links are focusable with visible `focus-visible:ring-primary` rings — technically reachable. The 28px click area doesn't affect keyboard nav directly. The `role="dialog"` on MobileNav is now in place. Positive: contact form `role="status"` + `aria-live="polite"` is correctly wired.

**Casey (mobile):** No overflow, hero CTAs 46px tall, IBAN copy button 44px — all good at mobile. Footer IBAN at 12px on mobile: Casey cannot verify the account number without pinching to zoom.

## Minor Observations
- `/despre` italic demo notice is the most urgent content fix before any real parish deployment.
- The campaign thermometer is static (24% forever until a redeploy) — consider noting "última actualizare" date.
- "Sprijinește parohia" (hero CTA) vs "Donează" (header pill) introduces subtle friction in the giving journey; the verb mismatch may cause hesitation for older users who expect the same word in both places.
- `<code>` wrapping the footer IBAN is semantically wrong; IBAN is financial account data, not source code.
