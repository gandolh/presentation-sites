# Task 04 — Opening hours: one source per client site

## Context

Audit 2026-09-27 (see [log](../../log.md)). Each client site writes its opening
hours once in `site.ts` for the visible table, then retypes them by hand
everywhere else:

| Site | Source of truth | Hand-written copies |
|---|---|---|
| auto-service | `src/content/site.ts:70-74` (`hours`) | `src/layouts/Base.astro:38-54` (JSON-LD `openingHours`), `src/components/Hero.astro:71` (status readout), `src/pages/contact.astro:23` (`readout` prop) |
| saloon | `src/content/site.ts:49-53` (`hours`) | `src/layouts/Base.astro:93-106` (JSON-LD) |

The comment at auto-service `Base.astro:38-39` says the JSON-LD is kept "in sync
with the single source of truth in site.ts without duplicating the strings".
That is false: the times are retyped.

**Failure:** the owner changes Saturday to 09:00–13:00 in `site.ts`. The contact
table and the footer update. The hero readout, the contact-page header and the
JSON-LD keep saying 14:00, and the JSON-LD is what Google shows in the business
panel. A customer who trusts the search result drives to a closed workshop.

tractari is out of scope. It is NON-STOP by definition, and its 00:00–23:59
JSON-LD states the brand promise rather than copying a table.

## Files you OWN

- auto-service: `src/content/site.ts`, `src/layouts/Base.astro`, `src/components/Hero.astro`, `src/pages/contact.astro`, `src/components/Contact.astro:59`, `src/components/Footer.astro:53`
- saloon: `src/content/site.ts`, `src/layouts/Base.astro`, `src/components/Contact.astro:59`

## Files you must NOT touch

- `site.local.ts`. It holds gitignored real data: never read it or paste from it.
  You may add a commented `hours` example to `site.local.example.ts`.
- `@sites/kit`. The two sites format hours differently (see below), so this is
  per-site data plus a per-site helper, not shared logic.

## What to do

1. Model the hours as structured data in each `site.ts`, e.g.
   `{ label: "Luni – Vineri", days: ["Monday", …, "Friday"], opens: "08:00", closes: "18:00" }`
   and `{ label: "Duminică", days: ["Sunday"], closed: true }`.
   `SiteOverridesOf` replaces arrays wholesale, so a local override replaces the
   whole schedule. That is the right behaviour here.
2. Derive every rendering from that data in the site's content module:
   - the visible table rows (the `value` string);
   - the JSON-LD `openingHoursSpecification` (skip closed days);
   - for auto-service, the compact readout `L–V 08:00–18:00 · Sâ 09:00–14:00`.
3. **Render byte-identical text to today.** Keep each site's punctuation:
   - saloon: `09:00 - 19:00` (spaced hyphen);
   - auto-service table: `08:00 – 18:00` (spaced en dash);
   - auto-service readout: `08:00–18:00` (unspaced).
4. Correct the misleading comment in auto-service `Base.astro`.

## Acceptance

- `grep -rn '0[89]:00\|1[0-9]:00' sites/{saloon,auto-service}/src --include=*.astro` → no matches. The times live only in `site.ts`.
- The built `dist/index.html` for both sites and `dist/contact/index.html` for
  auto-service show the same visible text and the same JSON-LD values as before.
  Diff the output before and after.
- Temporarily change one time in `site.ts` and rebuild: every rendering changes. Then revert.
- `npx astro check` → clean in both sites.
