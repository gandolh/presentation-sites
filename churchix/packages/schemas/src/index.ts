import { z } from 'zod';

/**
 * Shared content-collection schemas for every Churchix church app.
 * Defined once here, imported by each church's `content.config.ts`,
 * so frontmatter stays consistent across independent sites.
 *
 * Plain `zod` (not `astro:content`'s re-export) so the package is usable
 * outside an Astro context. Image/file paths are strings under `public/`.
 */

export const Locale = z.enum(['ro', 'en', 'it', 'es', 'de']);
export type Locale = z.infer<typeof Locale>;

// Churches routinely leave optional fields blank ("") in JSON. Treat empty
// strings as "unset" so an empty email/URL doesn't fail validation.
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

export const Tradition = z.enum([
  'orthodox',
  'greek-catholic',
  'pentecostal',
  'baptist',
  'adventist',
  'other',
]);

const NavItem = z.object({
  label: z.string(),
  href: z.string(),
});

const Iban = z.object({
  label: z.string(),
  iban: z.string(),
  currency: z.string().default('RON'),
  // Account holder, exactly as it appears at the bank — shown prominently on the
  // giving page so a donor can verify the beneficiary before sending (the highest-
  // stakes "is this the real parish account?" moment). Optional; when present the
  // giving surface renders a verification band.
  holder: z.string().optional(),
  bic: z.string().optional(), // BIC/SWIFT, for diaspora transfers from abroad.
});

/** Single entry (`site` collection, id `config`): identity + branding + features. */
export const siteSchema = z.object({
  name: z.string(),
  shortName: z.string().optional(),
  tradition: Tradition.default('orthodox'),
  tagline: z.string().optional(),
  locales: z.array(Locale).min(1).default(['ro']),
  defaultLocale: Locale.default('ro'),
  url: optionalUrl,

  // Material-3 seed tokens. A church sets the *seeds* (primary, secondary,
  // optionally surface/error); BaseLayout (item 02) derives the full M3 role
  // set as CSS custom properties. `accent` is the legacy name for `secondary`
  // (the gold) — kept as a deprecated optional alias so older `site.json`
  // files keep validating and `BaseLayout`'s existing `b.accent` read still
  // resolves. The refine below backfills whichever of the two is missing, so
  // both `brand.secondary` and `brand.accent` are always present together.
  brand: z
    .object({
      primary: z.string(), // burgundy seed (required)
      /** Gold seed (required). Was `accent`. */
      secondary: z.string().optional(),
      /** @deprecated Legacy alias of `secondary`. Use `secondary`. */
      accent: z.string().optional(),
      surface: z.string().optional(), // cream page background
      error: z.string().optional(), // optional override; defaults to M3 error
      onPrimary: z.string().optional(),
      fontHeading: z.string().optional(),
      fontBody: z.string().optional(),
      radius: z.string().optional(),
      logo: z.string(),
      favicon: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .refine((b) => b.secondary != null || b.accent != null, {
      message: 'brand requires `secondary` (or the deprecated `accent` alias)',
      path: ['secondary'],
    })
    .transform((b) => {
      // Keep `secondary` and `accent` mirrored so both old and new readers work.
      const secondary = b.secondary ?? b.accent;
      const accent = b.accent ?? b.secondary;
      return { ...b, secondary, accent } as typeof b & {
        secondary: string;
        accent: string;
      };
    }),

  nav: z.array(NavItem).default([]),

  features: z
    .object({
      sermons: z.boolean().default(false),
      pomelnice: z.boolean().default(true),
      orthodoxCalendar: z.boolean().default(false),
      ministries: z.boolean().default(false),
      prayerRequests: z.boolean().default(false),
      giving: z.boolean().default(true),
      campaigns: z.boolean().default(true),
    })
    .default({}),

  contact: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    phone: z.string().optional(),
    email: optionalEmail,
    mapEmbedUrl: optionalUrl,
    facebook: optionalUrl,
    youtube: optionalUrl,
  }),

  giving: z
    .object({
      currency: z.string().default('RON'),
      ibans: z.array(Iban).default([]),
      cardUrl: optionalUrl, // hosted Stripe Payment Link / Netopia page
      form230: z.boolean().default(false),
      form230Url: z.string().optional(),
      smsKeyword: z.string().optional(),
      smsNumber: z.string().optional(),
      smsAmount: z.string().optional(),
      pomelniceEndpoint: z.string().optional(), // where the pomelnice form POSTs
    })
    .default({}),
});
export type SiteConfig = z.infer<typeof siteSchema>;

export const sermonSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  speaker: z.string().optional(),
  embedUrl: z.string().url(),
  series: z.string().optional(),
  scripture: z.string().optional(),
  language: Locale.optional(),
});

export const eventSchema = z.object({
  title: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const staffSchema = z.object({
  name: z.string(),
  role: z.string(),
  order: z.number().default(0),
  photo: z.string().optional(),
  bio: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string().optional(),
  pinned: z.boolean().default(false),
});

export const serviceScheduleSchema = z.object({
  label: z.string(),
  weekday: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']).optional(),
  time: z.string(),
  cadence: z.enum(['weekly', 'biweekly', 'monthly', 'special']).default('weekly'),
  order: z.number().default(0),
  note: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  goalAmountMinor: z.number().int().nonnegative(),
  raisedAmountMinor: z.number().int().nonnegative().default(0),
  currency: z.string().default('RON'),
  deadline: z.coerce.date().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  cardUrl: z.string().url().optional(),
  cover: z.string().optional(),
  order: z.number().default(0),
});
