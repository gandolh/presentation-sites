# Log

Chronological, newest last. Entry format: `## [YYYY-MM-DD] kind | title`, then a
few lines on what changed and why, linking the pages it touched. Entries up to
2026-05-29 come from the old `docs/wiki/log.md`; see the 2026-10-07 entry.

## [2026-05-29] restructure | docs/ rebuilt as an llm-wiki

Restructured `docs/` around the [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) model under `docs/wiki/`. Added [SCHEMA.md](CLAUDE.md) (conventions/workflows), [index.md](index.md) (catalog), and this log.

`git mv`'d the five monolithic docs into kebab-case wiki pages and added frontmatter + fixed cross-links:
- `ARCHITECTURE.md` → [architecture](wiki/architecture.md)
- `CONTENT_MODEL.md` → [content-model](wiki/content-model.md)
- `DONATIONS.md` → [donations](wiki/donations.md)
- `ENGINEERING_BRIEF.md` → [research-brief](wiki/research-brief.md) (marked `archive`)
- `OPEN_QUESTIONS.md` → [decisions](wiki/decisions.md)

Split out new atomic pages to keep one-concept-per-page: [overview](wiki/overview.md), [independence-model](wiki/independence-model.md) (was a section of architecture), [traditions](wiki/traditions.md) + [i18n-and-glossary](wiki/i18n-and-glossary.md) (were sections of content-model), [optional-backend](wiki/optional-backend.md) (the Fastify API/data model, pulled out of architecture + donations), and [design-system](wiki/design-system.md) (new — interprets the Stitch design). De-duplicated: content-model no longer inlines the (stale) Zod schema — it links [packages/schemas/src/index.ts](../packages/schemas/src/index.ts); donations no longer inlines the data model — it links optional-backend.

## [2026-05-29] decision | Adopt Tailwind + Material-3 design system (ADR-0002)

Accepted the Stitch-generated "Ecclesia Digitalis" design system as delivered: Tailwind (build-time) + the full Material-3 token palette + Material Symbols. [ADR-0002](../docs/adr/0002-tailwind-material3-design-system.md) supersedes [ADR-0001](../docs/adr/0001-design-system-foundation.md) (which proposed a bounded plain-CSS "safe set" and was the brief given to Stitch). Churches still set only a small seed-token set; the rest of the palette is derived. Captured in [design-system](wiki/design-system.md).

## [2026-05-29] ingest | Created the design-integration TODO set

Added [docs/todo/](wiki/status.md): a README index, `_conventions.md`, and 15 atomic, independently-assignable work items (tiers A–E) to integrate the design system into `@churchix/ui` and the two reference apps — Tailwind setup, token contract, schema brand tokens, icons/fonts, primitives, header/footer, home, schedule, announcements, donate, campaign, pomelnice, error/empty pages, app rollout, and an a11y/i18n pass.

## [2026-05-29] plan | Swarm plan for items 01 to 15

`docs/todo/SWARM_PLAN.md` planned the run as a controller-driven, gated fan-out.
Wave 0 ran 01, 03 and 04 in parallel, then 02; gate G0 was a throwaway component
using `bg-primary text-on-primary rounded-lg` and an `<Icon>` building in both
apps. Wave 1 ran 05 alone so the primitive APIs stayed coherent. Wave 2 fanned 06
to 13 out to up to eight workers in isolated worktrees, each with exclusive
ownership of its component and page files, and built 10 against 11's agreed
`CampaignCard` props. Waves 3 and 4 ran 14 and 15 alone. Every gate was
`npm install`, typecheck and build across the workspaces. The plan ran to the
end on 2026-05-29 (the build entries below), so it is history, not a live plan.
Items 16 and 17 came later and were never part of it. Full text:
`git show d96d7c7:churchix/docs/todo/SWARM_PLAN.md`.

## [2026-05-29] build | Item 01 — Tailwind v4 wired into the monorepo

Chose **Tailwind v4 + `@tailwindcss/vite`** (over v3 `@astrojs/tailwind`) for CSS-variable-native theming that matches the white-label token model. Shared M3 theme lives in `packages/ui/src/styles/theme.css` (a `@theme` block whose color/radius/spacing/font/type utilities map to `var(--token)`, plus stub `:root` Ecclesia Digitalis defaults so the build is green — item 02 owns the real var contract). Apps import it via `apps/*/src/styles/app.css` (`@import "tailwindcss"; @import "@churchix/ui/styles/theme.css";`), injected globally through a tiny `injectScript('page-ssr', …)` integration in each `astro.config.mjs`. Library classes are kept from purge via `@source "../../**/*.{astro,ts,tsx,…}"` in theme.css (resolved relative to that file → all of `packages/ui/src`). Verified `bg-primary text-on-primary rounded-lg px-gutter` and library-only classes survive in both apps' real Tailwind output (no CDN). `tailwindcss` is a peerDep of `@churchix/ui`; react/react-dom stay peerDeps (no duplicate copy).

## [2026-05-29] decision | Schema brand → M3 seed tokens (item 03)

Migrated `@churchix/schemas` `brand` to M3 seed naming: `accent` → `secondary` (gold seed, required), added optional `error`. Migration: clean-renamed both reference apps' `site.json` to `secondary` AND kept `accent` as a deprecated optional alias with a refine+transform that mirrors the two fields, so old JSON keeps validating and `BaseLayout`'s existing `b.accent` read (owned by item 02) still resolves until item 02 switches to `b.secondary`.

## [2026-05-29] work | Self-hosted fonts + inline-SVG Icon component (item 04)

Added self-hosted typography and iconography to `@churchix/ui`, no `fonts.googleapis.com` at runtime. Fonts: `@fontsource-variable/source-serif-4` (opsz axis, headings) + `@fontsource-variable/inter` (wght axis, body), vendored as woff2 via `packages/ui/src/styles/fonts.css` — `@font-face` declared under the plain family names `"Source Serif 4"` / `"Inter"` so the `--font-heading`/`--font-body` tokens and per-church `brand.font*` overrides keep working untouched; `latin` + `latin-ext` subsets cover RO diacritics (ă ș ț) + DE umlauts; `font-display: swap`. Icons: chose **inline SVG** over the Material Symbols webfont (tree-shakeable, no FOUT, no Google request) — `packages/ui/src/components/Icon.astro` renders the 20-glyph inventory from a build-time path map `packages/ui/src/components/icons.ts` (extracted from `@material-symbols/svg-400`, Apache-2.0; `push_pin`→`keep`), with `fill`/`weight`/`size`/`label` props and `currentColor` tinting. Wiring of `fonts.css` is left to items 02/14 (import `@churchix/ui/styles/fonts.css` from tokens.css or BaseLayout) — verified in a throwaway app build (4 woff2 emitted, all 20 icons rendered, zero googleapis refs) then removed.

## [2026-05-29] build | Item 02 — M3 token contract: seeds + color-mix-derived roles (item 02)

Made `packages/ui/src/styles/tokens.css` the **canonical M3 token contract** and removed the stub `:root` palette from `theme.css` (theme.css now carries only the `@theme`→`var()` mapping + the `@source` anti-purge glob — single source of values, no drift). tokens.css declares the full DESIGN.md palette as a small **seed set** (`--primary`, `--secondary`, `--surface`, `--error`, `--on-primary`) plus all ~40 **derived** roles computed from the seeds via `color-mix()` (containers, on-*, variants, surface tints, outlines, fixed dims). A church re-skins from ≤4 seeds; the derived roles recompute automatically because they reference `var(--primary)`/`var(--surface)`. Switched `BaseLayout` to read `b.secondary` (not the deprecated `b.accent`) and emit the M3 seeds (`--primary/--secondary/--surface/--error/--on-primary` + font/radius) as the per-church `:root{…}` block; legacy `--brand-*` aliases + the `.cx-*` class set are kept (mapped onto M3 tokens) so unmigrated tier-B components/pages render unchanged. Wired self-hosted fonts via `@import './fonts.css'` at the top of tokens.css. Added the church-settable-vs-derived table to tokens.css (comment) + [design-system](wiki/design-system.md). Verified: both reference apps typecheck + build green; a throwaway seed swap (Berinta → forest green) re-emits the seed `:root` and shifts the derived palette; all M3 utilities resolve in real Tailwind output (`bg-surface-container-lowest`, `text-on-surface-variant`, `border-outline-variant/30`, `text-headline-lg`, `font-display-lg`, `px-gutter`, `rounded-lg`, `max-w-container-max`); 4 woff2 emitted per app, zero googleapis. AA verified for the default Orthodox palette; flagged that the realistic church gold (`#c8a24b`) is 2.2:1 on cream → decorative only, never body text.

## [2026-05-29] build | Item 05 — System primitives (Button, Card, Badge, Field, Alert, EmptyState, Divider)

Added the 7 white-label primitive components to `@churchix/ui` (`Button/Card/Badge/Field/Alert/EmptyState/Divider.astro`), all M3-token-driven (no raw hex) with JSDoc prop-API headers for Wave 2 to consume: Button (primary solid burgundy / secondary gold-OUTLINE-with-burgundy-label / ghost; pill|rounded; sm|md|lg; a-or-button; leading/trailing Icon; focus-visible ring→secondary; active:scale-[0.98]); Card (slot panel, featured gold left-bar|bottom-border, interactive/href); Badge (neutral|secondary|primary tones, all AA-safe — gold only as fill/border behind dark on-secondary-container text); Field (input|textarea|select wrapper, label↔control via for/id, focus border+ring→secondary per spec, hint/error states); Alert (info|success|error, M3 error-container, role=alert/status); EmptyState (icon+title+message+cta slot); Divider (inline SVG Byzantine cross-in-gold-ring node on a currentColor hairline, re-skins via var(--secondary)). Honored the item-02 AA warning: NO gold text on light anywhere. Verified both reference apps typecheck (0 errors) + build green via a throwaway smoke page rendering every variant (confirmed border-secondary, focus:ring-secondary on 3 fields, var(--secondary) divider, role=alert, featured left-bar in rendered HTML) then removed.

## [2026-05-29] build | Item 06 — Restyle Header (lang switcher + Donează) + Footer (item 06)

Restyled the global chrome in `@churchix/ui` to the design, token-only (no raw hex, no per-church values). **Header.astro**: sticky `bg-surface/95 backdrop-blur-md` with a `border-outline-variant/30` hairline, wordmark in `font-display-lg text-primary`, desktop nav uppercase `label-md` where the active item (kept the original `isActive` prefix logic) gets `border-b-2 border-secondary font-bold text-primary` and idle items hover to `text-primary`+`bg-surface-container-low`; gold used only as the underline, never as text (AA). Added a **language switcher** (`<Icon name="language"/>` button + token-styled dropdown menu, dismissed on outside-click/Esc via a small `is:inline` script) that renders **only when `site.locales.length > 1`** — both reference apps are single-locale `["ro"]`, so it is correctly absent in their builds. **Donează** uses the item-05 `<Button variant="primary" shape="pill">` and stays gated on `site.features.giving`. **MobileNav.tsx**: kept the `client:load` island boundary; rewrote to Tailwind/M3 classes; menu/close use inline Material `menu`/`close` glyph paths (no font); `aria-expanded`+`aria-haspopup` on the toggle, **Esc closes and restores focus to the toggle**, focus moves into the panel on open and **Tab is trapped** (cycles first↔last); lists the same nav items (with active underline), the Donează pill, and a language group (only when >1 locale). **Footer.astro**: `bg-surface-container-high` with a `border-secondary/20` top border, responsive 4-col grid (brand+`© year name` · quick links · contact+IBANs · social) retaining address/phone/email/IBANs/social; social/IBAN glyphs via `<Icon>` (`diversity_1`/`live_tv`/`account_balance`). Long-string robust: nav uses `flex-wrap gap-x/gap-y` and the wordmark/CTA `shrink-0`, so verbose DE/RO labels wrap instead of clipping. Verified: typecheck + build green for both reference apps; rendered output confirms blur header, gold active underline, Donează present (giving on), lang switcher absent (single locale), `bg-surface-container-high`/`border-secondary/20` footer; zero raw hex in the three files. Note for item 14 rollout: the locale menu links assume a path-prefix convention (`/` for `defaultLocale`, `/{loc}/` otherwise) — wire to the real i18n routing when locales land; social icons reuse inventory glyphs (`diversity_1`/`live_tv`) since brand marks aren't in the 20-glyph set.

## [2026-05-29] build | Item 07 — Home: Hero + pinned-announcements strip + Program/About bento (item 07)

Rebuilt `packages/ui/src/components/Hero.astro` and both apps`/index.astro` to the Acasă reference. Hero migrated off the legacy `.cx-hero` CSS to M3 Tailwind utilities: full-bleed `<img>` + `bg-black/40` scrim, `secondary-fixed` eyebrow, `font-display-lg` church name with drop shadow, glass `Următoarea Slujbă:` chip, Donăză (solid `<Button variant="primary">`) + outline livestream CTA (`live_tv` icon). Prop contract EXTENDED (back-compatible — old `title/subtitle/image/ctaLabel/ctaHref/secondaryLabel/secondaryHref` kept): added `eyebrow`, `imageAlt`, `nextService`, `nextServiceLabel`, `giving` (gates Donăză + needs `ctaHref`), `sermons` + `livestreamHref` (livestream CTA renders only when BOTH set), `livestreamLabel`. Falls back to `bg-primary` burgundy when no `image`; chip/CTAs hidden when their data is absent. Home composes ENTIRELY from collections + item-05 primitives (Card/Badge/Icon/Button) INLINE in index.astro — did NOT import or edit the sibling-owned `AnnouncementList` (item 09) / `ServiceSchedule` (item 08). Pinned strip: pinned announcement = `<Card featured accent="bar">` (gold left-bar) + `<Badge tone="secondary" icon="push_pin">Fixat</Badge>` spanning `lg:col-span-2`, regular items = Cards with `event` date + `line-clamp-2`. Bento: `lg:grid-cols-12`, left `col-span-7` compact current-week schedule built inline (grouped by weekday Mon→Sun, alternating `bg-surface/50` row tints, Sunday `bg-secondary/5` + `text-primary`, specials row appended), right `col-span-5` burgundy `bg-primary` About card with faint oversized `diversity_1` bg icon + `Citește istoricul →`; About copy uses `text-on-primary`/`text-on-primary/90` for AA on burgundy. Hero next-service is content-driven from the schedule collection (soonest weekly service from today). Dates `ro-RO`. No raw hex in any owned file. Both apps: typecheck 0 errors, build 9 pages each green. NOTE item 14: no church has a hero image or `features.sermons`/`youtube` set yet — hero shows the burgundy fallback + no livestream CTA; wire `brand.ogImage` (or a dedicated hero field) + sermons/livestream content to light those up.

## [2026-05-29] build | Item 08 — Program Slujbe page: bento day-blocks + cadence + PDF

Rebuilt `ServiceSchedule.astro` with a `variant` prop (`grouped` default; `table` legacy retained for the home/inline caller in item 07). The `grouped` layout buckets services by `weekday` (sorted by `order`, then Mon→Sun) into one `<Card>` per day on a `lg:grid-cols-12` grid; Sunday is emphasized via `<Card featured>` (gold left bar `border-l-secondary`) + a `church` fill icon + a "Ziua Domnului" `<Badge tone="secondary">`. Each row shows the time as AA-safe `text-primary` (not gold — per the contrast warning gold stays decorative on the bar/badge only) in a fixed `w-16`, the label in `body-lg`, an optional muted `note`, and for non-weekly cadences a `calendar_month` cadence line. Services with no `weekday` (movable feasts, `special` cadence) collect into a trailing "Sărbători și rânduieli speciale" card. Optional `col-span-4` secondary column exposed via an `aside` slot (primary widens to `col-span-12` when absent). Rewrote `program.astro` in both apps: centered header with "Liturgic" `<Badge>`, `font-display-lg` "Programul Slujbelor" title, intro paragraph, decorative `<Divider>`, then the grouped schedule. PDF download button: the shared schema carries no programme-PDF field and I did NOT change the schema; the button renders only when an optional `programPdfUrl` is present — neither reference church publishes one, so it is hidden in both. NOTE for item 14: if a per-church programme PDF is wanted, add an optional `schedulePdf`/`programPdfUrl` to `siteSchema` (or a known public path convention) and wire it into both `program.astro`. Gates green: typecheck 0/0/0 both apps; build 9 pages both apps; diacritics (Sâmbătă, Sfânta Liturghie, rânduieli) intact in rendered HTML; no raw hex (token-only).

## [2026-05-29] build | Item 09 — Announcements list + detail with pinned gold accent

Restyled `packages/ui/src/components/AnnouncementList.astro` from a plain card stack to the "Anunțuri Recente" design grid (`grid-cols-1 lg:grid-cols-2`, M3 tokens only): pinned items use `Card featured accent="bar"` (gold left-bar) + a `Badge tone="primary" icon="push_pin"` "Fixat" chip, span `lg:col-span-2`, and show an `arrow_forward` read-more affordance; regular items show an `event` date chip, title, and `line-clamp-2` summary; the whole card links to detail. Preserved pinned-first then date-desc sort; added `locale` prop (dates via `Intl.DateTimeFormat`, defaults `ro-RO`) and `readMoreLabel`; empty `items` renders nothing (caller owns the empty state). Both apps' `anunturi/index.astro` now render a `campaign`-icon section heading + `EmptyState` (icon="campaign") when there are no announcements; both `anunturi/[slug].astro` render a clean prose layout — `← Înapoi la anunțuri` back-link (`arrow_forward` rotated 180), `event` dateline + conditional "Fixat" Badge, `font-headline-lg` title, and a scoped `.cx-prose` style (line-height 1.75 for diacritic safety, body tokens, gold blockquote rule) wrapping the rendered markdown. No raw hex; re-skins by token. Both reference apps typecheck + build green; verified rendered HTML carries `border-l-secondary`, `Fixat`, `lg:col-span-2`, `line-clamp-2`, `font-headline-lg`, and diacritic-correct copy.

## [2026-05-29] build | Item 11 — CampaignCard goal thermometer + project variant (item 11)

Restyled `packages/ui/src/components/CampaignCard.astro` to the design using the item-05 primitives (Card/Badge/Button/Icon). API: `campaign` (campaignSchema inferred type) + `variant: 'card' | 'project'` (default `card`) — the exact shared contract item 10's donate page imports. `card` = compact list/grid; `project` = donate-page featured (optional `cover` image header / `campaign` icon fallback, gold bottom-border featured Card, "Proiect Special" Badge, full-width gold OUTLINE CTA "Susține Proiectul"). Goal thermometer = gold `bg-secondary` FILL on a muted `bg-surface-variant` rounded-full track; progress conveyed three ways (text "X%" in burgundy `text-primary`, the bar, and `role=progressbar` aria-valuenow/min/max + aria-label) — never color-only, never gold text on cream (overrode the reference's gold "65%" per the AA warning). Money preserved from the prior card: `Intl.NumberFormat('ro-RO', currency)` on minor/100, explicit currency always, "<raised> strâns · Obiectiv: <goal>". Status-aware CTA: `active`+`cardUrl` → Button link (target=_blank rel=noopener); `completed` → "Obiectiv atins — mulțumim!" thank-you; `archived` → quiet (no CTA/thank-you). Static SSG only — no live fetch (live totals stay the optional per-church API's gated island). Verified: both reference apps typecheck (0 errors) + build green; `/donatii` renders the card (pct 23%, aria-valuenow=23, bar width:23%, "Obiectiv: 150.000 RON", diacritics intact). No raw hex; re-skins by token.

## [2026-05-29] build | Item 10 — Donate page: card CTA, copy IBANs, Form 230, SMS

Rebuilt `packages/ui/src/components/GivingChannels.astro` to the reference Donează layout: token-driven two-column grid (`lg:grid-cols-3`, left `lg:col-span-2`). LEFT = primary giving: online-card block (gold-OUTLINE `secondary` amount presets 50/100/200 + custom-amount `Field` with currency prefix + primary "Donează Online →" `Button`, all OUTBOUND to hosted `cardUrl` with `?amount=` deep-link — PCI SAQ A, no local card fields; whole block hidden when `cardUrl` unset) and IBAN transfer block (`account_balance` icon, one row per IBAN, `select-all` value + new `CopyIban` island). RIGHT = featured project (`<CampaignCard campaign={c} variant="project" />` — item 11's component), Form 230 card (faint oversized `description` bg icon, `download` link, only when `giving.form230`), SMS card (only when keyword+number set). New island `packages/ui/src/islands/CopyIban.tsx` (`client:visible`): keyboard-accessible button, `navigator.clipboard.writeText` + execCommand fallback, transient "Copiat!" via `aria-live`. Wired `donatii.astro` in both apps — pass `site.giving` + first active campaign + `showCampaign = features.campaigns && campaign exists`. Money explicit currency from `giving.currency`/campaign. No raw hex. CONTRACT NOTE: called CampaignCard with the item-11 props (`campaign`, `variant="project"`); the CampaignCard in this branch is still the pre-11 signature (`campaign` only, `cx-*` markup, no `variant`) — Astro ignores the extra `variant` prop so typecheck/build stay green, and item 11 (integrated before 10) supplies the M3 project card. Both apps: typecheck 0 errors, build green; berinta `donatii/index.html` shows IBAN + Form 230 only (card/SMS correctly hidden, unconfigured), CopyIban island hydrated.

## [2026-05-29] build | Item 12 — Pomelnice form island: vii/adormiți bento + offering presets

Rebuilt `packages/ui/src/islands/PomelnicForm.tsx` to the reference two-card bento — "Pomelnic de Vii" (person icon, primary-tinted header) + "Pentru Adormiți" (candle icon, tertiary-fixed header), both name textareas fillable at once ("un nume pe rând") — plus an optional **Ofrandă** section (presets 20/50/100 + custom, money carried as integer **minor units + explicit `currency`** via `Math.round(major*100)`) and optional contact (name/email for receipts); kept the `endpoint` prop + demo/sending/done/error contract, but replaced the single `kind` radio with BOTH lists in the POST payload `{ nume_vii, nume_adormiti, offering: {amountMinor,currency}|null, contact:{name,email} }`; valid with ≥1 name in either list. Primitives are .astro (cannot import into a React island) so Field/Card/Button looks were **replicated** with the same M3 Tailwind classes (`bg-surface-container-lowest`, `border-outline-variant/30|50`, `focus:border-secondary focus:ring-secondary`, `rounded-full bg-primary text-on-primary`); the 5 glyphs used are inlined SVG (currentColor) since `<Icon>` is .astro. Both `apps/*/pages/pomelnice.astro` gated on `features.pomelnice` (EmptyState + contact CTA when off), pass `currency`, and render the parchment `.bg-pattern` as token-driven radial dots (`color-mix(var(--outline-variant))` over `var(--surface)` — no raw hex). a11y: labeled fields, focus→secondary, keyboard submit, `role=alert`/`aria-live=assertive` errors; gold stays decorative (header text uses on-* roles). Verified: both apps typecheck + build green; rendered HTML shows the bento + diacritics; single React client bundle (peerDep, no second copy).

## [2026-05-29] build | Item 13 — white-label 404 / error / empty-state pages (item 13)

Added a shared `packages/ui/src/layouts/ErrorLayout.astro` that wraps `BaseLayout` chrome (per-church Header/Footer + brand tokens) around the `EmptyState` primitive — reverent Romanian defaults ("Pagina nu a fost găsită" + supporting copy), a `church`/`diversity_1` illustration, a quiet gold status-code eyebrow, and a primary "Înapoi la pagina principală" Button (href `/`); props `site` (req) + `code`/`title`/`message`/`icon`/`homeLabel`/`homeHref`/`path` let apps override copy with defaults in the component. Wired `src/pages/404.astro` into **both** reference apps (load `site` via `getEntry('site','config')`, render `<ErrorLayout site={site} />`) — Astro emits it as static `404.html` (verified in both `dist/`), carrying each church's chrome + tokens (Berinta re-skins via `--primary:#1e3a5f`, no Churchix branding, no raw hex in the shared component). Documented the EmptyState reuse pattern for list pages (announcements/campaigns/schedule/events) in [design-system](wiki/design-system.md) so other items branch empty-vs-populated consistently. Generic 500 page noted **N/A for static SSG** (no server route without an adapter; host/CDN handles 5xx) — the composition already supports `code="500"` if a church later adopts on-demand routes. Gate: `npm install` + `typecheck` (0 errors both apps) + `build` (10 pages each, `/404.html` emitted) all green.

## [2026-05-29] build | Item 14 — Reference-app rollout + second-brand re-skin + visual QA

Brought both reference apps fully onto the M3 design and proved the white-label re-skin end-to-end. **SectionHeading** migrated off `.cx-heading` to pure M3 utilities (serif `headline-lg` in `text-primary` + gold `border-b border-secondary/20` rule echoing the home dividers, muted `body-lg` subtitle, `text-balance`, kept the `title/subtitle/as` API + added `as: 'h1'` and a `class` passthrough) — improves all four consumers (donatii, pomelnice, contact, despre) without churning them. **contact.astro** (both apps) rewritten to the shared chrome: `SectionHeading`, a `Card` with `church`-icon "Datele parohiei" `<dl>` (address/tel/mailto links through `text-primary`), a `Card`-framed `mapEmbedUrl` iframe (titled per-church for a11y), and a `candle`-icon prayer-request form built from `Field` (Nume/Email/Mesaj textarea + safety hint) + a primary `Button trailingIcon="send"`; static + server-light — submits via `mailto:` when the church email is set, else a plain `method=post` (no backend assumed). **despre.astro** (both apps) rewritten to diacritic-safe prose (the same `.cx-prose` line-height:1.75 + token-colored `h2` as the announcement detail) **plus** an optional **leadership** grid ordered by `staff.order`. Added a new optional **`staff` content collection** (shared `staffSchema`) registered in BOTH apps' `content.config.ts` with two seed entries each (Preot paroh, Consiliul parohial); empty/absent → page renders prose only (graceful). Removed all owned legacy `.cx-*` (`.cx-section/.cx-container/.cx-contact/.cx-note/.cx-heading`); left the still-needed `.cx-section/.cx-container` token aliases in place (donatii/pomelnice/anunturi pages — owned by other items — still consume them). **Brand re-skin proof:** built HTML shows distinct per-church `:root` seeds (Berinta `--primary:#1e3a5f` blue / Harlesti `--primary:#6b1f2a` burgundy), compiled utilities resolve through the token chain (`text-primary`→`--color-primary`→`--primary`→seed), zero literal hex in page markup beyond the seed block, zero raw hex in `packages/*`, and zero church values in shared components. Playwright screenshots of contact+despre in both apps confirm identical layout rendered blue (Berinta) vs burgundy (Harlesti). **Visual-QA deviations** (logged in design-system.md): prayer-form submit uses a *trailing* send icon (reference pomelnice uses leading) — kept consistent with our Button convention; despre has no Stitch reference screen so it follows the donate/announcement card+prose language; leadership uses a `person`-glyph avatar placeholder (no photo in seed data). Gate: `npm install` + `typecheck --workspaces` (0 errors both apps) + `build --workspaces` (10 pages each) all green.

## [2026-05-29] build | Item 15 — a11y (WCAG AA) + i18n/diacritics + long-string hardening pass

Cross-cutting hardening sweep across the now-complete restyled system; minimal surgical fixes only (no component restyling). **Contrast** (computed for BOTH brands — Berinta `--primary:#1e3a5f`, Harlesti `--primary:#6b1f2a`): primary-on-surface ≈10.5:1, on-surface-variant-on-surface ≈8.7:1, on-primary-on-primary ≈11.3:1, Hero gold eyebrow (`secondary-fixed`) on primary ≈9.3:1 — all pass AA. Found + fixed three classes of gold/derived-token contrast failures: (1) **gold-as-text on light** (2.2:1) — `despre` leadership role label, `GivingChannels` SMS amount, `ErrorLayout` code eyebrow swapped `text-secondary`→`text-primary`/`text-on-surface` (gold now only fills/borders/icons); (2) **`--on-secondary-container`** was a gold tint (~2.0:1 on its pale-gold container) → re-derived as `color-mix(secondary 30%, #000000)` (~9.6:1) — fixes Badge `secondary`, Alert, PomelnicForm chip at the token level; (3) **`--on-primary-container`** was a light primary tint (1.2:1 on Alert `/30`, 3.2:1 on Badge) → re-derived as `color-mix(primary 30%, #000000)` (dark, ~9.6–11.3:1) and Badge `primary` fill softened from full `primary-container` to `/40` tonal tint to match. **Semantics:** every page now has exactly **one `h1`** (was missing on despre/donatii/pomelnice/contact/anunturi-index/404 — SectionHeading defaulted to h2 and EmptyState hard-coded h3); added `as` prop to `EmptyState` (default h3) and routed page-title headings to `as="h1"`; `AnnouncementList` card title h3→h2; `Footer` section headings h3→h2 (IBAN sub-heading stays h3) to fix heading-order skips; removed a nested `<main>` in `program.astro` (BaseLayout already provides the `main` landmark). **Keyboard/focus:** added a token-driven **skip-to-content** link in BaseLayout (`#main`, visible on focus, externalizable `skipToContentLabel` RO default) and `focus-visible:ring-secondary` rings to desktop nav, wordmark, language-menu items, MobileNav panel links/CTA/locale links, and Footer `mutedLink` (CopyIban, PomelnicForm, Button already had them); MobileNav focus-trap + Esc-restore confirmed. **Long-string:** added `min-w-0` to the desktop nav so the wrapping flex row never forces a horizontal scrollbar; realistic verbose RO/DE labels wrap cleanly. **AXE (axe-core 4 via Playwright on the built sites, no-cache http-server):** Berinta `/`, `/program`, `/donatii`, `/pomelnice`, `/anunturi`, `/anunturi/<detail>`, `/contact`, `/despre`, `/404` and Harlesti (burgundy) `/`, `/donatii`, `/anunturi` — **0 critical/serious/moderate violations** after fixes (the only `incomplete` is Hero text over a background image, which axe cannot auto-evaluate; manual calc confirms it passes). **Diacritics:** ă â î ș ț + German ü ö render with correct glyph widths (self-hosted latin-ext fonts) in headings/body/nav/form echo/titles; money via `Intl.NumberFormat` + explicit currency from integer minor units, dates via `Intl.DateTimeFormat`. Gate: `npm install` + `typecheck` (0 errors both apps) + `build` (10 pages each) green; no raw hex in `packages/*` components.

## [2026-05-30] audit | UI/UX audit + fixes on parohia-harlesti-bacau (brief 16)

This was `docs/ui-audit-2026-05-30.md`, moved here on 2026-10-07. It is the evidence for [brief 16](briefs/done/16-ui-audit-pages.md). Brief 17 covers every finding it left open, so it is history.

**Date:** 2026-05-30
**App:** `parohia-harlesti-bacau` (the only church kept; `parohia-berinta-maramures` removed earlier).
**Method:** Playwright sweep of every route at desktop (1366×900) and mobile (390×844) + computed-style probes, plus a codebase audit against [docs/design/DESIGN.md](../docs/design/DESIGN.md) ("Ecclesia Digitalis"). `astro check` passes (0 errors).

> The dark floating pill centred in full-page screenshots is the **Astro dev toolbar**, not a UI element.

---

### Part A — Critical rendering bugs (fixed)

#### A1. Headings & link-buttons invisible on dark surfaces — FIXED
**Symptom:** hero H1, both hero CTAs, the header/mobile "Donează", and the home "Despre" card heading+link all rendered burgundy-on-burgundy (invisible).
**Cause:** [tokens.css](../packages/ui/src/styles/tokens.css) declared `h1–h4 { color: var(--primary) }` and `a { color: var(--primary) }` **outside any cascade layer**. Tailwind v4 utilities live in the `utilities` layer, and an unlayered rule beats any layered rule — so `text-on-primary` (white) never won.
**Fix:** wrapped the element baseline (`*`, `html`, `body`, `h1–h4`, `a`, `img`) in `@layer base { … }` ([tokens.css:150](../packages/ui/src/styles/tokens.css#L150)). Verified: hero H1 = `rgb(255,255,255)`, buttons white-on-burgundy.

#### A2. 404 page collapsed to one word per line — FIXED
**Cause:** `max-w-xl` generated as `max-width: var(--spacing-xl)` = **4rem (64px)**. In Tailwind v4, `max-w-<key>` resolves against a namespace where the **spacing** scale wins for any key that also exists in spacing — and this theme defines `--spacing-{sm,md,lg,xl}`. So `max-w-{sm,md,lg,xl}` are all unsafe; `max-w-{2xl,3xl,4xl…}` (no spacing twin) are fine. Adding `--container-xl` does **not** override the spacing precedence.
**Fix:** replaced the two colliding usages with arbitrary values — [ErrorLayout.astro](../packages/ui/src/layouts/ErrorLayout.astro) `max-w-xl`→`max-w-[36rem]`, [EmptyState.astro](../packages/ui/src/components/EmptyState.astro) `max-w-md`→`max-w-[28rem]` — and documented the collision rule in [theme.css](../packages/ui/src/styles/theme.css). 404 container now 576px. **Rule of thumb: avoid bare `max-w-{sm,md,lg,xl}`; use `max-w-[NNrem]` or `max-w-{2xl,3xl…}`.**

#### A3. Hero primary CTA had no visible fill — FIXED
**Cause:** the giving CTA was `variant="primary"` (`bg-primary`) on the `bg-primary` hero fallback (no church hero image) → maroon button on maroon = invisible fill.
**Fix:** [Hero.astro](../packages/ui/src/components/Hero.astro) giving CTA is now an explicit **light (cream) fill with burgundy text** (`bg-surface-container-lowest text-primary`) — the M3 "inverse on dark" pattern. High contrast on the burgundy hero.

---

### Part B — DESIGN.md adherence audit (fixes applied)

Audited all 7 DESIGN.md areas. Faithful out of the box: **typography scale & font wiring** (exact match, body 1.5+ line-height for diacritics), **focus-to-gold on inputs**, **Divider** central cross node, **spacing scale**, surface/error/outline color derivations, and **white-label discipline** (zero hardcoded hex in components). Gaps found and fixed:

#### B1. Brand "gold" rendered as muddy tan — FIXED (high impact)
DESIGN.md's prose says gold = `#c8a24b`, but the YAML seed was `--secondary: #785a02` (a dark olive). Mixed toward white, every derived gold tint (`secondary-container`, `secondary-fixed-dim`) came out **khaki/tan** — affecting Badges, the campaign progress bar, the hero outline button, dividers, and form focus.
**Fix:** set the seed to the prose gold `#c8a24b` in both [tokens.css](../packages/ui/src/styles/tokens.css#L59) and [DESIGN.md](../docs/design/DESIGN.md). Re-checked the AA-override on-colors: `on-secondary-container` (#3c3117) vs `secondary-container` (#ecdec0) = **9.6:1**, and **11.0–11.4:1** on the /30–/40 badge tints — all pass AA. Verified: `--secondary` now `rgb(200,162,75)`.

#### B2. Liturgical schedule had no alternating row tints — FIXED
DESIGN.md §Lists requires zebra striping for calendars. [ServiceSchedule.astro](../packages/ui/src/components/ServiceSchedule.astro) rows used dividers only.
**Fix:** added `odd:bg-surface-container-low/50` to the grouped-list rows (and `nth-child(odd)` tint to the legacy table). Verified on `/program`.

#### B3. Card "featured" default was a left bar, not a gold bottom border — FIXED
DESIGN.md §Components: featured cards use a gold **bottom** border. [Card.astro](../packages/ui/src/components/Card.astro) defaulted to `accent="bar"`.
**Fix:** default `accent` is now `'border'` (gold bottom). Components that intentionally want the left-bar emphasis (AnnouncementList pinned item, ServiceSchedule Sunday card) still opt into `accent="bar"` explicitly.

#### B4. Component default radii exceeded the 0.5rem "standard" — FIXED
DESIGN.md §Shapes: buttons, inputs, and cards use the base 0.5rem (`rounded`). Defaults were Button=pill, Card=`rounded-xl` (1.5rem), Field=`rounded-lg` (1rem).
**Fix:** Card radius scale remapped so `sm`=`rounded` (0.5rem) is the default; [Button.astro](../packages/ui/src/components/Button.astro) default `shape='rounded'` (0.5rem) with `rounded` variant now = `rounded` not `rounded-lg`; [Field.astro](../packages/ui/src/components/Field.astro) and the [PomelnicForm](../packages/ui/src/islands/PomelnicForm.tsx) input controls → `rounded`. The **header "Donează" stays a pill** (explicit `shape="pill"`) as the signature chip CTA.

#### B5. Hero CTA over-shadowed + mobile gutters too wide — FIXED
DESIGN.md §Elevation wants subtle ambient shadows; §Layout says mobile margins reduce to 1rem.
**Fix:** hero CTA `shadow-lg/xl`→`shadow-md/lg`; `px-gutter` (1.5rem) → `px-sm md:px-gutter` (1rem mobile, 1.5rem ≥md) across Header, Footer, Hero, ErrorLayout, and the four app page sections. Verified at 390px.

---

### Part C — Notes / not changed (out of approved scope)

- **`bg-black/40` scrim & `border-white/20`, `bg-white/10` in Hero** — *verified OK.* Tailwind v4 keeps `black`/`white` as keywords even under `--color-*: initial`; the real rendered chip border is `rgb(255,255,255)`. (The earlier "verify" concern was a false alarm from injected-probe testing.)
- **Legacy container on `/anunturi` + `/anunturi/[slug]`** — these two pages use the legacy `.cx-container` (`--maxw: 64rem` = 1024px, `padding-inline: 1.25rem`) instead of the shared `max-w-container-max` (1200px) + `px-sm md:px-gutter` used everywhere else. They render fine but are **narrower and inconsistent**. Recommend migrating them to the standard container in a follow-up. The `--maxw: 64rem` legacy alias also contradicts the 1200px spec.
- **`--container-container-max` token** ([theme.css](../packages/ui/src/styles/theme.css)) is dead (unused; `max-w-container-max` resolves via the spacing scale). Harmless; clean up when convenient.
- **No shared 1200px container in `BaseLayout` `<main>`** — per-page consistency depends on each page wrapping its own container. Consider an optional `<Container>` primitive.
- **Image "arch mask / sharp corners" for icons & murals** (DESIGN.md §Shapes special elements) — not implemented anywhere. Low priority; revisit when real photography lands.
- **Intentional, documented token deviations:** `on-primary-container` and `on-secondary-container` invert the DESIGN.md literals on purpose for AA contrast on the tonal tints (commented in tokens.css). Not defects.

### Files changed
- `packages/ui/src/styles/tokens.css` — `@layer base`; gold seed `#c8a24b`.
- `packages/ui/src/styles/theme.css` — container-collision note.
- `packages/ui/src/layouts/ErrorLayout.astro` — `max-w-[36rem]`; mobile gutter.
- `packages/ui/src/components/EmptyState.astro` — `max-w-[28rem]`.
- `packages/ui/src/components/Hero.astro` — light CTA fill; softer shadow; `rounded`; mobile gutter.
- `packages/ui/src/components/Card.astro` — default `accent="border"`, `radius="sm"`=0.5rem.
- `packages/ui/src/components/Button.astro` — default `shape="rounded"` (0.5rem).
- `packages/ui/src/components/Field.astro` — input radius `rounded`.
- `packages/ui/src/components/ServiceSchedule.astro` — zebra rows (grouped + table).
- `packages/ui/src/components/Header.astro`, `Footer.astro` — mobile gutter.
- `packages/ui/src/islands/PomelnicForm.tsx` — input radii `rounded`.
- `apps/parohia-harlesti-bacau/src/pages/{index,despre,contact,program}.astro` — mobile gutter.
- `docs/design/DESIGN.md` — gold seed `#c8a24b`.
- `.gitignore` — ignore `.playwright-mcp/`.

Screenshots (gitignored): `.playwright-mcp/shots/`.

## [2026-06-18] migrate | churchix joins presentation-sites

Backfilled on 2026-10-07 from git history. `b41a6e5` brought churchix into this
repo with its wiki at `docs/corpus/` and its work items at `docs/todo/`. Only
`apps/parohia-harlesti-bacau` came along; `parohia-berinta-maramures` had been
removed before the 2026-05-30 audit. `6d2f237` moved deploy out of the repo.

## [2026-06-18] design | Liturgical-rail redesign

Backfilled on 2026-10-07 from `70999ff`. The redesign kept the M3 token contract
and rebuilt the layout around the liturgical week as a vertical spine. New
`Rail.astro` draws a gold rule with day markers down the left margin of every
page. New `PageShell.astro` gives every inner page the same left-aligned header
(overline kicker, display title, lede, gold rule). `Hero.astro` became an
asymmetric split: identity and next service on the left, a framed image over a
"this week" timeline on the right. The home page swapped the pinned strip and the
Program + About bento for a lead-plus-stacked announcements block and a burgundy
"despre" band. `theme.css` gained the `display-xl` and `overline` type tokens.
Build: 10 pages, `astro check` 0 errors. This superseded
[brief 07](briefs/superseded/07-home-hero-sections.md).

## [2026-08-23] restructure | docs/corpus/ renamed docs/wiki/

Backfilled on 2026-10-07 from `a647437`. The monorepo bootstrapped its own
`corpus/` and renamed churchix's `docs/corpus/` to `docs/wiki/`, so the word
named only the root workspace. The 2026-10-07 entry below reverses that for
churchix, by the owner's 2026-10-06 decision.

## [2026-10-07] migrate | The wiki and the work items become corpus/

Root brief 12. churchix adopts the corpus-flow lifecycle, as the owner decided on
2026-10-06. `docs/wiki/*` moved to `corpus/wiki/` and `docs/todo/*` to
`corpus/briefs/`, all with `git mv`. `SCHEMA.md` folded into
[CLAUDE.md](CLAUDE.md), and this log absorbed `docs/wiki/log.md`. Its entries are
now in date order, newest last, and the restructure entry got back the heading it
had lost. New: [routing.md](routing.md), [lint.sh](lint.sh) with a
brief-placement check, and [wiki/status.md](wiki/status.md). Every wiki page now
carries exactly `summary:` and `updated:`. `research-brief.md` had 229 body
lines, so it split at §4 into [research-brief](wiki/research-brief.md) and
[research-brief-giving](wiki/research-brief-giving.md) with the text unchanged.

The 17 work items were checked against the code; `astro check` reported 0 errors
and the app built 10 pages. 15 are done, 07 is superseded by `70999ff`, and 17
stays in `briefs/todo/`. Each moved brief got an outcome or superseded note naming
its evidence. Only relative link targets in the brief bodies changed.

The loose files: the README's dependency table became the brief table in
[wiki/status.md](wiki/status.md). `_conventions.md` became
[wiki/conventions.md](wiki/conventions.md), together with the README's design
sources. `SWARM_PLAN.md` is history, the 2026-05-29 plan entry above.
`ui-audit-2026-05-30.md` is history too, the 2026-05-30 entry above, because brief
17 covers every finding it left open.

The docs site now reads `corpus/` and resolves each link from its page's own
folder. The UI audit page left the sidebar; the audit renders inside the change
log. Left alone because this migration may not touch them: both ADRs still link
`../wiki/` and `../todo/` (the docs site maps those links to the new pages), and a
comment in `apps/parohia-harlesti-bacau/src/pages/program.astro` still names the
old log path.

## [2026-10-07] done | Brief 17 — UI audit follow-ups

Task 1 was already done by the 2026-06-18 redesign (`70999ff`): the announcement list uses `PageShell` and the detail page uses `max-w-container-max` with the responsive gutters. Tasks 2 and 3 shipped. `--maxw` and the unused `.cx-container`, `.cx-section`, `.cx-section--surface`, `.cx-btn`, `.cx-btn--outline` and `.cx-card` left `tokens.css`, and `--container-container-max` left `theme.css`, after a grep of the whole tree found no consumers. The component-scoped `.cx-prose`, `.cx-schedule` and `.cx-pomelnice-pattern` are live and stay.

Decisions. Task 4, the shared `<Container>` primitive, is dropped as covered: `PageShell.astro` already wraps `max-w-container-max mx-auto px-sm md:px-gutter` for every inner page, and the home page and announcement detail set the container themselves. Task 5, the arch mask and sharp corners for icons and murals, is deferred until real church photography and iconography land; nothing is built.

Task 6, the `max-w-*` guard, was added rather than declined. In this theme bare `max-w-sm|md|lg|xl` bind to `--spacing-*` and collapse layouts, and the regression had already happened once (`Hero.astro` put `max-w-xl`, 4rem, on the subtitle). `packages/ui/scripts/check-max-w.mjs` is a dependency-free Node script that scans `.astro`, `.tsx` and `.ts` under `apps/` and `packages/`. It runs from the `@churchix/ui` `lint` script, which the root `npm run lint` already fans out to. Variants, `max-w-2xl` and up, and `max-w-[NNrem]` pass. The Hero offender became `max-w-[36rem]`, the value `xl` was meant to carry. No CI or git hook was added. The brief moved to `briefs/done/` with an outcome note; `npm run typecheck`, `npm run lint` and the app build pass.

## [2026-10-07] maintenance | Wiki drift after the audit and the redesign

[design-system](wiki/design-system.md) now matches the code: gold seed `#c8a24b`, Cardo headings with Source Serif 4 as the fallback, one app, and a new section on the `70999ff` redesign (`Rail`, `PageShell`, the asymmetric `Hero`, the `display-xl` and `overline` tokens). Its page inventory describes the current home page, and it records the `max-w` guard. [i18n-and-glossary](wiki/i18n-and-glossary.md) got the same font fix. The todo `wiki-drift-after-redesign` is deleted.
