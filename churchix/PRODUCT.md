# Product

## Register

brand

## Users

**Primary: the parishioner and the seeker.** Romanian Orthodox faithful — in Romania and across the diaspora (US, Canada, UK, Italy, Spain, Germany) — who reach for a parish site to do something concrete and time-bound: check when the next Liturgy or vigil is, read this week's announcement, submit a pomelnic (names of the living and the departed for prayer), or give. They skew older and less tech-fluent than a typical web audience; many arrive on a phone, in Romanian, sometimes on a slow connection abroad. A first-time visitor is often deciding whether *this* is a parish they can trust with their family's prayers and their offering.

**Secondary: the parish that owns the site.** A priest or a volunteer from the parish council who maintains content (announcements, schedule, staff, IBAN/Form 230 details) without touching code. They are not designers; the system has to make the right thing look right by default.

The job to be done, in their words: *"When is the service?"* · *"How do I send a pomelnic?"* · *"Where do I give, and is it the real parish account?"* · *"Is this parish faithful, alive, and mine?"*

## Product Purpose

Churchix gives every Romanian Orthodox parish a **dignified, trustworthy presentation site plus a giving surface**, from one shared codebase, with each parish deployed independently and re-skinned by token swap alone. The presentation *is* the product: the site's first job is to make a parishioner feel they have stepped into a place that honours the tradition, and only then to help them find the schedule, the pomelnic form, or the IBAN.

Success looks like: a parishioner finds the next service in seconds; a diaspora visitor trusts the giving details enough to send an offering; the priest never has to apologise for how the site looks; and a second, third, tenth parish goes live by editing content and brand seeds, never by forking a component.

## Brand Personality

**Reverent. Formal. Architectural.** The voice and surface are those of a *Digital Iconostasis* — a quiet, respectful frame around sacred content, not a stage that competes with it. Warmth comes from parchment-toned surfaces, serif authority, and the sparing glint of gold, never from breeziness or hype.

- **Voice:** formal Romanian liturgical register; calm, plain, never salesy. Liturgical and theological terms stay in Romanian even inside English pages ("Slujbele religioase", "pomelnic", "Sfânta Liturghie"). No marketing cadence, no exclamation, no "supercharge your faith."
- **Three words:** reverent, rooted, unhurried.
- **Emotional goal:** trust and quiet belonging. A parishioner should feel the parish is faithful, alive, and *theirs* — and that their offering and their prayers are in careful hands.

## Anti-references

This must NOT look like any of the following:

- **Generic SaaS / startup.** No gradient-drenched hero-metric templates, no rounded-everything card grids, no purple-blue tech palettes, no "transform your community" marketing voice. The cross-project AI monoculture is the enemy here.
- **Evangelical megachurch / Hillsong.** No full-bleed stock photos of crowds with hands raised, no concert-lighting glow, no casual all-sans friendliness, no upbeat brand energy. Orthodox v1 is liturgical and restrained; an evangelical variant may come later by token swap, but it is not the v1 design target.
- **Dated parish HTML / clip-art.** No 2000s table layouts, Comic Sans, gold-on-blue gradients, spinning crosses, or amateur clip-art. The bar is dignified and unmistakably modern.
- **Cold corporate / sterile fintech.** The opposite failure: a giving page so bank-cold it strips out all warmth and reverence. Trust on the giving surface must read as *the parish's* trust, not a payment processor's.

## Design Principles

1. **The frame serves the content.** The interface is the iconostasis, not the icon. Restraint over decoration — tonal layers and 1px outlines over heavy shadows, gold as a sparing accent, never the loud thing on the page.
2. **Reverence is earned through craft, not ornament.** Dignity comes from typographic authority, generous quiet space, and faithful detail (correct diacritics, formal Romanian, careful money) — not from added flourishes.
3. **Trust is the giving currency.** Every giving and pomelnic surface must read as the parish's own and visibly correct: explicit currency, the real IBAN, white-labelled to *this* parish, no third-party chrome bleeding through. A parishioner risks a real offering on what they see.
4. **Built for the faithful who actually visit.** Older, mobile-first, multilingual (RO + EN minimum, IT/ES/DE for diaspora), sometimes on slow connections. Legibility, large touch targets, fast static pages, and graceful empty states are first-class, not polish.
5. **One system, many parishes, never a fork.** Identity lives in a small brand-seed token set; components stay shared. If a design choice can only be expressed by forking a component or hardcoding a parish value, it is the wrong choice.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA**, held across the realistic brand-seed range. Verified with axe-core 4 on both reference apps — 0 critical/serious/moderate violations. Appropriate for an older, less tech-fluent, sometimes public-sector-adjacent diaspora audience.
- **Gold is decorative only** — never body or label text on a light surface (the realistic parish gold is ~2.2:1 on cream). Body text holds ≥4.5:1; large/heading text ≥3:1, verified per brand seed.
- **Romanian diacritics (ă, â, î, ș, ț) and German umlauts** render correctly end-to-end (fonts, slugs, search, receipts); layouts survive long RO/DE strings without clipping.
- **Reduced motion** is mandatory: every animation has a `prefers-reduced-motion: reduce` alternative (crossfade or instant). Motion is reverent and slow when present.
- **Keyboard and screen reader:** skip-to-content, one `<h1>` and one `<main>` per page, valid heading order, visible focus rings (burgundy on light surfaces — high contrast for older users; gold only on the dark hero), labelled fields with live error announcements, `aria-current` nav.
- **Elderly-user care** within AA: comfortable default text sizes and line-height (≥1.5 body), simple navigation, no reliance on hover-only affordances.
