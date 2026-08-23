// Public defaults — safe to commit. Real values (phone, address, CUI, social
// handles, geo) live in the git-ignored `site.local.ts`, which is
// deep-merged on top of these at build time. See `site.local.example.ts`.
//
// Note: whatever ends up here is baked into the static HTML and is therefore
// PUBLIC on the deployed site. Git-ignoring `site.local.ts` only keeps the real
// values out of the repo/GitHub history — not off the live page.

import type { SiteOverridesOf } from "@sites/kit";

const defaults = {
  name: "Unghii by Ana",
  tagline: "Unghii care vorbesc despre tine",
  description:
    "Manichiură personalizată lângă Târgu-Jiu, dedicată fiecărei cliente în parte.",
  city: "Târgu-Jiu",
  county: "Gorj",
  country: "România",

  // Contact (placeholders — overridden in site.local.ts)
  phone: "07XX XXX XXX",
  phoneE164: "40700000000",
  whatsappE164: "40700000000",
  email: "contact@anasaloon.ro",
  address: "Str. Exemplu nr. X",
  postalCode: "210000",

  // Legal / business identification (Legea 365/2002 art. 5) — MOCK placeholders.
  // Owner provides real data in site.local.ts. For a PFA, set form: "PFA",
  // legalName e.g. "Ana Exemplu PFA", and regNumber to the ONRC F-number
  // (e.g. "F18/123/2024"). For an SRL, keep form: "SRL", set the J-number and
  // capital social.
  legal: {
    form: "SRL" as "SRL" | "PFA" | "II", // tip entitate
    legalName: "Ana Saloon S.R.L.", // denumirea exactă din actul constitutiv
    cui: "RO00000000", // CUI / CIF de la ANAF
    regNumber: "J18/000/2024", // nr. Registrul Comerțului (J… pentru SRL, F… pentru PFA)
    shareCapital: "200 RON", // capital social (doar SRL; gol pentru PFA)
    // Data Protection Officer / responsabil date — optional for a micro business.
    dpoEmail: "contact@anasaloon.ro",
    // Last review date of the legal documents (update when content changes).
    documentsUpdated: "29 mai 2026",
    // Retention chosen per the legal audit (see ana_saloon_legal memory).
    dataRetention:
      "12 luni de la ultima programare (30 de zile pentru solicitările care nu se finalizează)",
  },

  // Hours
  hours: [
    { day: "Luni - Vineri", value: "09:00 - 19:00" },
    { day: "Sâmbătă", value: "10:00 - 16:00" },
    { day: "Duminică", value: "Închis" },
  ],

  // Social (placeholders — overridden in site.local.ts)
  social: {
    instagram: "https://instagram.com/anasaloon",
    facebook: "https://facebook.com/anasaloon",
    tiktok: "https://tiktok.com/@anasaloon",
  },

  // Stats (placeholder)
  stats: {
    years: "3+",
  },

  // Map (Târgu-Jiu center coordinates as placeholder — overridden in site.local.ts)
  geo: {
    lat: 45.0357,
    lng: 23.2748,
  },
};

// Pre-filled WhatsApp deep-link. A booked message is the site's success metric,
// so every primary CTA opens WhatsApp with a friendly Romanian opener already
// typed — the client just hits send (PRODUCT.md: "booking is one tap away").
// Pass a service name to tailor the opener; omit for the generic greeting.
export function waLink(message?: string): string {
  const text =
    message ?? "Bună, Ana! Aș dori o programare. Când ai un loc liber?";
  return `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(text)}`;
}

// The shape of the real-data file. Every field is optional, so the local file
// only needs to specify what it overrides.
export type SiteOverrides = SiteOverridesOf<typeof defaults>;

// Eagerly glob the optional local file. `import.meta.glob` resolves to {} when
// the file is absent, so a fresh clone / CI without secrets falls back cleanly
// to the placeholders above. The path is a literal so Vite can statically
// analyse it.
const localModules = import.meta.glob<{ siteOverrides: SiteOverrides }>(
  "./site.local.ts",
  { eager: true },
);
const overrides: SiteOverrides =
  Object.values(localModules)[0]?.siteOverrides ?? {};

// Shallow merge for top-level scalars/arrays, one level of nested merge for the
// object groups (legal / social / stats / geo) so a local file can override a
// single nested field without restating the whole block.
export const site = {
  ...defaults,
  ...overrides,
  legal: { ...defaults.legal, ...overrides.legal },
  social: { ...defaults.social, ...overrides.social },
  stats: { ...defaults.stats, ...overrides.stats },
  geo: { ...defaults.geo, ...overrides.geo },
} as const;

// NOTE: the production data guard that previously lived here (failing the build
// when `site.local.ts` still held template placeholders) was removed by request
// to allow staging deploys with placeholder data. Remember to fill real values
// in `site.local.ts` before the real production deploy — nothing now blocks a
// fake phone / CUI from reaching the live site.
