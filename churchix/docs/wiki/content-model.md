---
title: Content model
summary: The page inventory a church site needs and the Astro Content Collections / Zod schemas that encode them.
status: stable
updated: 2026-05-29
related: [traditions, i18n-and-glossary, donations, design-system]
---

# Content Model — what a church site contains

This is the product surface: the pages a Romanian church website needs and the **Astro Content Collection schemas** that encode them. Schemas live once in `@churchix/schemas`; every church imports them. For how the two markets differ in tone/features see [traditions](traditions.md); for language rules and the domain glossary see [i18n-and-glossary](i18n-and-glossary.md).

## Page inventory (shared core)

| Page | RO label(s) | Notes |
| --- | --- | --- |
| Home | Acasă | Hero, service times, livestream link, prominent **Donează** CTA, latest announcements |
| Service schedule | Program / Program Slujbe | **Most-used page.** Weekly/monthly; diaspora often "2nd & last Sunday" (shared clergy); downloadable monthly PDF/image common |
| News / announcements | Anunțuri / Actualitate / Știri | Dated posts; often mirrored from Facebook |
| About / history | Despre / Prezentare / Istoric | Identity + leadership |
| Livestream | LIVE / Transmisiune LIVE | **Embedded** YouTube/Facebook — never self-hosted video |
| Sermons / media | Predici / Arhivă / Video | YouTube-backed, embedded |
| Photo gallery | Galerie Foto | Feasts, baptisms, festivals |
| Events / calendar | Evenimente / Calendar | Often a list, not interactive |
| Contact | Contact | Address, map, phone, email, leadership; prayer-request form common |
| Donations | Donații / Donează | The biggest product gap — see [donations](donations.md) |

The **per-tradition add-ons** (Orthodox pomelnice / calendar / sacraments; evangelical statement-of-faith / ministries / bulletin) are listed in [traditions](traditions.md). **i18n, diacritics, and the domain glossary** are in [i18n-and-glossary](i18n-and-glossary.md).

## Content Collections (schemas)

Defined once in `@churchix/schemas` and imported by each church's `content.config.ts`. These are the canonical collections.

| Collection | Purpose |
| --- | --- |
| `site` | Single entry: church identity, branding token overrides, locales, enabled features, nav, social, contact, giving config |
| `pages` | Free-form MDX pages (About, Statement of Faith, sacrament info) |
| `announcements` | Dated posts (Anunțuri) |
| `events` | Events / calendar entries |
| `serviceSchedule` | Recurring + special service times (Program Slujbe) |
| `sermons` | Sermon/media entries (embedded YouTube/Facebook + metadata) |
| `staff` | Clergy / pastors / leadership (with hierarchy ordering) |
| `ministries` | Ministries / small groups (evangelical) |
| `gallery` | Photo gallery albums |
| `funds` | Display metadata for giving funds (authoritative fund records live in the API/DB) |
| `campaigns` | Display metadata for fundraising campaigns (live totals come from the API) |

### Schema definitions live in code, not here

The authoritative Zod schemas are in **[packages/schemas/src/index.ts](../../packages/schemas/src/index.ts)** — `siteSchema` (identity + `brand` tokens + `tradition` + `features` + `contact` + `giving`), `sermonSchema`, `eventSchema`, `staffSchema` (with `order` for hierarchy), `announcementSchema` (`pinned`), `serviceScheduleSchema` (`weekday`/`cadence`/`note`), and `campaignSchema` (money in minor units + `goalAmountMinor`/`raisedAmountMinor` + `status`). Read the file rather than a copy — this page intentionally doesn't duplicate it. The `brand` object's token set is governed by [design-system](design-system.md) and [ADR-0002](../adr/0002-tailwind-material3-design-system.md); the [docs/todo/03-schema-brand-tokens.md](../todo/03-schema-brand-tokens.md) work item tracks aligning `brand` with the Material-3 seed tokens (e.g. `accent` → `secondary`).

### Example: a church's `content.config.ts`

```ts
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import {
  siteSchema, sermonSchema, eventSchema, staffSchema,
  announcementSchema, serviceScheduleSchema,
} from "@churchix/schemas";

export const collections = {
  site: defineCollection({ loader: file("src/content/site.json"), schema: siteSchema }),
  sermons: defineCollection({ loader: glob({ pattern: "**/*.md", base: "src/content/sermons" }), schema: sermonSchema }),
  events: defineCollection({ loader: glob({ pattern: "**/*.md", base: "src/content/events" }), schema: eventSchema }),
  staff: defineCollection({ loader: glob({ pattern: "**/*.md", base: "src/content/staff" }), schema: staffSchema }),
  announcements: defineCollection({ loader: glob({ pattern: "**/*.md", base: "src/content/announcements" }), schema: announcementSchema }),
  serviceSchedule: defineCollection({ loader: file("src/content/schedule.json"), schema: serviceScheduleSchema }),
};
```

This keeps all real structure in the shared library: a church directory holds only data + a thin config that wires the shared schemas to its own files.
