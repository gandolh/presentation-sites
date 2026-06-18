---
target: apps/parohia-harlesti-bacau
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-06-02T22-15-34Z
slug: apps-parohia-harlesti-bacau
---
# Critique — Parohia Hârlești (apps/parohia-harlesti-bacau)

Register: brand · North Star "The Digital Iconostasis". Reference parish app on the Ecclesia Digitalis (Material-3) white-label system. Reviewed live at localhost (Astro dev) across home, /program, /anunturi, /donatii, /pomelnice, /despre, /contact, 404, at desktop (1280px) and mobile (375–390px).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Strong copy/IBAN states; no on-page success state for the mailto contact form |
| 2 | Match System / Real World | 4 | Liturgical Romanian vocabulary is exactly right (pomelnic vii/adormiți, Form 230, hram) |
| 3 | User Control and Freedom | 3 | Good resets (pomelnic, 404); thin breadcrumbing on announcement detail |
| 4 | Consistency and Standards | 3 | Excellent token consistency; pinned-card gold side-stripe breaks the system's own bottom-border convention |
| 5 | Error Prevention | 3 | Pomelnic + contact validate well; giving surface does nothing to prevent wrong-account sends |
| 6 | Recognition Rather Than Recall | 3 | Presets + copy IBAN; verifying account legitimacy is offloaded to user memory |
| 7 | Flexibility and Efficiency | 3 | Presets, copy, next-service shortcut; appropriate for the audience |
| 8 | Aesthetic and Minimalist Design | 3 | Reverent and uncluttered; two decorative giant-icon watermarks + the gold stripe nudge it off a 4 |
| 9 | Error Recovery | 3 | Pomelnic role="alert" errors are specific & Romanian; contact mailto dead-ends with no confirmation |
| 10 | Help and Documentation | 2 | Good inline hints; no FAQ, no "how to verify this is us" on the giving page |
| **Total** | | **30/40** | **Good — fixable trust + responsive gaps** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** It escapes the slop label on conviction and domain fidelity: a committed burgundy-dominant liturgical system, verified gold-as-decoration-only discipline, and domain-correct Orthodox content. The closest house-style tic is two opacity-10 giant-icon watermarks (About card, Form 230). Not slop.

**Deterministic scan** (`detect.mjs`, exit 2, 3 findings):
- `side-tab` ×2 — `Card.astro:78` (`border-l-4 border-l-secondary`) and `anunturi/[slug].astro:91` (blockquote `border-left: 3px solid var(--secondary)`).
- `em-dash-overuse` ×1 — `BaseLayout.astro` ("16 em-dashes", reported at line 0 / via importedBy).

**Detector vs review reconciliation:**
- The `Card.astro` `accent="bar"` side-stripe is a documented, sanctioned 4px gold left bar — BUT it is actively used on the home pinned card, where it both violates the brand's own side-stripe ban and breaks internal consistency (rest of system uses bottom borders). Real issue, not a pure false positive.
- The `[slug].astro` blockquote gold left border is a typographic convention; low severity but still the side-stripe pattern.
- `em-dash-overuse` in BaseLayout is a likely false positive (JSDoc/comments/fixtures in a structural shell, not rendered AI prose) — worth one human glance.

**Browser console:** clean across all pages (0 errors, 0 warnings; only the benign React DevTools dev-mode info line). No broken images, no failed assets, no hydration errors.

## Overall Impression
A genuinely reverent, on-brand parish site that gets the hard things right (gold discipline verified under measurement, an excellent accessible pomelnic island, liturgical copy that lands). It is held back by one mechanical responsive defect and one strategic trust gap, both concentrated where it hurts most for this audience. Biggest single opportunity: make the mobile experience and the giving surface feel as finished and trustworthy as the pomelnic flow already does.

## What's Working
1. **Verified gold discipline.** Gold (#c8a24b, ~2.3:1 on cream) is never used as text on a light surface anywhere — only borders, icons, progress fills, and as light `secondary-fixed` on the dark hero. The brand's single hardest rule holds up under contrast measurement on every page.
2. **The pomelnic island.** Proper fieldset/legend, sr-only labels, role="alert"/aria-live errors, validation that needs only one name, focus-within feedback, and a confirmation ("Numele vor fi pomenite la Sfânta Liturghie. Dumnezeu să vă ajute!") that nails the liturgical emotion.
3. **The hero answers the primary job at a glance** — burgundy field, serif name, glass "Următoarea Slujbă" chip — and wraps the very long church name without overflow even at 375px.

## Priority Issues

- **[P1] Mobile horizontal overflow site-wide (Header).** Body scrollWidth 428px vs 375px viewport on every page; the wordmark (227px) + Donează `<a>` + hamburger in the right `shrink-0` cluster don't fit the 360px content box (right cluster lands at 428px), so the hamburger is scrolled partly offscreen and a horizontal scrollbar appears on every page. For a mobile-first, non-technical, older audience a sideways-sliding page reads as broken and corrodes institutional trust. **Fix:** hide the header Donează below `md` (MobileNav already carries it), shrink the mobile wordmark, add `min-w-0`/truncation so the row fits. Confirmed independently by design review and the deterministic DOM measurement. → `$impeccable adapt`
- **[P1] Giving page does not establish account legitimacy.** `/donatii` shows the IBAN + copy button but no "this is the official parish account" reassurance, no prominent account-holder name, no verification cue — at the exact moment the user's job is "is this the real parish account?" Verification is offloaded to working memory (a cognitive-load failure). **Fix:** add a trust band — labeled holder name, a "Verificați că beneficiarul este 'Parohia…'" note, optional BIC + payment-reference hint; keep the footer IBAN echo. → `$impeccable harden`
- **[P2] Gold side-stripe on the home pinned card violates the side-stripe ban + internal consistency.** `Card accent="bar"` → `border-l-4 border-l-secondary` while the rest of the system signals featured with a bottom border. Also flagged by the detector. **Fix:** switch the pinned card to the bottom-border accent (it already has a "Fixat" Badge); consider retiring `accent="bar"` from the component so the banned pattern is un-expressible. → `$impeccable polish`
- **[P2] Heading hierarchy structurally muddled.** `/donatii` runs H1→H2→H3→H3 with footer "Navigare"/"Contact" H2s competing; the campaign H3 has no parent H2 in its column. Screen-reader users navigate by level. **Fix:** add a visually-hidden H2 for the right-column section with H3 children; demote/scope footer headings to the footer landmark. → `$impeccable audit`
- **[P2] Contact form has no success state.** Prayer-request submits via `mailto:`; on a static host this opens the mail client with no on-page acknowledgment, so low-tech users can't tell it worked. **Fix:** add a pre-submit "se va deschide aplicația de email…" hint and/or a post-submit confirmation; longer term wire the optional endpoint. → `$impeccable clarify`
- **[P3] Empty campaign image is a raw gray block on `/donatii`.** A content-light parish with no campaign photo shows an unstyled rectangle that reads as "unfinished demo." **Fix:** token-driven placeholder (church glyph on `surface-container`). → `$impeccable shape`

## Persona Red Flags

**Jordan (confused first-timer):** lands fine (hero answers "when is the service?"), then hits the giving valley — no signal the IBAN is the real parish account, and it's placeholder "RO00 XXXX…"; submits the contact form and is dumped into email with no confirmation. Failing elements: IBAN block on `/donatii`, prayer-request submit on `/contact`.

**Sam (screen-reader / keyboard):** well-served by the pomelnic (fieldsets/labels/alerts) and the IBAN copy button's accessible name; MobileNav traps and restores focus. Red flags: the muddled H2/H3 outline on `/donatii` (campaign H3 with no parent; footer H2s competing) and the hamburger scrolled offscreen by the overflow (reachable in tab order, visually clipped — hurts low-vision keyboard users).

**Casey (distracted mobile):** the horizontal scrollbar + sideways drift on every page is the headline failure; the header Donază crowding the hamburger at 375px is the exact cause. Otherwise single-column stacking, large tap targets, and presets are good one-handed.

## Minor Observations
- `[slug].astro:91` blockquote uses a 3px gold left border — defensible as quote styling, but it is the side-stripe pattern again; consider `outline-variant` or a quote glyph.
- Two opacity-10 giant-icon watermarks (About card, Form 230) — one is plenty; two starts to feel like a tic.
- `despre.astro` carries a visible demo disclaimer and footer IBAN is placeholder "RO00 XXXX…" — correct for a demo; ensure real data lands and disclaimers strip for production.
- Footer "DONAȚII PRIN TRANSFER" IBAN echo is good trust redundancy; keep it once real data lands.

## Questions to Consider
1. On the one surface where trust is everything (the IBAN), why does the design do *less* reassurance than the pomelnic confirmation does?
2. Has "mobile-first" actually been tested on a real 360–390px device, given the horizontal scrollbar on every page?
3. Should the *system* make the banned side-stripe pattern un-expressible (retire `accent="bar"`), rather than relying on each page author to avoid it?
4. Is "Trimite mesajul" honest about what a static mailto form can guarantee to a non-technical user?
5. Is the gray campaign placeholder a state you designed, or one you left to chance?
