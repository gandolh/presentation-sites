# PRODUCT.md — AXA Tractări

## Register

**Brand.** This is a marketing/landing surface for a (fictional, demo) roadside-recovery business. The design IS the product: a visitor's impression in the first three seconds is the thing being made. It is a showpiece DEMO meant to look like a 2025-class studio site, not a typical Romanian "tractari auto" template.

## Product / purpose

A single-page site for **AXA Tractări**, a vehicle towing + roadside-assistance service covering the Oltenia region of Romania (Gorj, Dolj, Vâlcea, Olt, Mehedinți). One job: make a stranded driver **call, instantly**, at any hour.

It is a concept/demo — the company, phone numbers, and legal identifiers are obvious placeholders (`07XX XXX XXX`, fictional CUI). No real business behind it.

## Target users

A driver who has just broken down or crashed, somewhere in Oltenia, possibly at night, possibly stressed. Context: on the shoulder of a road, on a phone, wanting a number they can tap *now*. Secondary: someone researching a tow service in advance (price/coverage curiosity).

## The one thing

**Call.** Every decision serves making the phone number unmissable and reachable in one tap from any scroll position. The 3D scene is enrichment that must never gate or delay that action.

## Brand personality

Heavy · nocturnal · dependable. The feeling of headlights cutting through the dark toward you when you're stuck: relief, competence, "they've got this." Not playful, not corporate-safe, not cheap-urgent (no flashing red banners).

## Anti-references (what to NOT look like)

- The entire existing RO "tractari auto" market: red-or-yellow on white, stock tow-truck photo, four icon boxes, a Romania map screenshot, a Google-reviews widget. Uniformly poor.
- Generic AI landing template: centered hero stack, equal-box card grids, eyebrow-on-every-section, `01/02/03` scaffolding, decoration over structure.
- Editorial-typographic lane (display-serif + italic + mono labels + ruled columns). Wrong register entirely; this is a plain, heavy road sign, not a magazine.

## The one structural move (reopened 2026-11-13)

The opening screen is **type on the ground with one board of three named phone lines**: the dispatcher's number large on an orange plate, the two other owners beside it. The 3D truck and night road moved to "Cum funcționează" as a plate, with the three steps on a strip over its foot. The phone stays tappable the whole way: the header call fills and, on a phone, a bottom dock shows once the plate has left the screen.

## Strategic design principles

1. **The phone is load-bearing.** The board is the first thing after the headline; one orange call per frame; one tap from every scroll position (header on desktop, dock on a phone).
2. **Lines, not boxes.** Named lines, rules and rows carry the structure; the board is the only raised object.
3. **A real subject, in its place.** The stylized 3D truck and night road is the page's one picture, as the plate in "Cum funcționează".
4. **The narrative never gates the action.** The scene is enrichment; reduced-motion / low-GPU / no-JS all deliver the full content vertically with the phone reachable.

## Accessibility

Romanian (`lang="ro"`), full diacritics. Dark only: warm-off-white body ≥4.5:1 on asphalt, near-black ink on every orange ≥4.5:1, amber only for marks. Reduced-motion path mandatory (the scene never runs, nothing loops). Keyboard + screen-reader paths for the pinned call action and mobile menu. Touch targets ≥44px; the call dock is thumb-reachable.

## Stack

Astro 7 (static) + React 19 islands + Tailwind v4 (`@tailwindcss/vite`). Self-hosted fonts (`@fontsource`). Three.js for the 3D scene in "Cum funcționează", loaded only inside a `client:only` island. Served under sub-path `/tractari` on a shared VPS behind Caddy (`PUBLIC_BASE`, `withBase()` helper). Pinned exact dependency versions (no caret ranges).
