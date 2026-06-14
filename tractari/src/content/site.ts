// Public defaults — safe to commit. Real values (phones, address, CUI, geo)
// would live in a git-ignored `site.local.ts`, deep-merged on top of these at
// build time. See `site.local.example.ts`.
//
// NOTE: AXA Tractări is a DEMO / concept site. Everything here is an OBVIOUS
// placeholder ("07XX XXX XXX", "Str. Exemplu nr. X") — there is no real
// business behind it. The legal/identification scaffolding is included to show
// a complete, RO-compliant structure, but every value is fictional.
//
// Whatever ends up here is baked into the static HTML and is therefore PUBLIC
// on the deployed site.

export type Phone = { label: string; display: string; e164: string };

const defaults = {
  name: "AXA Tractări",
  shortName: "AXA",
  // Phone-first, urgency-led. The hook is availability — stranded drivers want
  // a number they can call now, day or night.
  tagline: "Tractări auto pe platformă, NON-STOP, în toată Oltenia.",
  description:
    "AXA Tractări asigură tractări auto pe platformă omologată, non-stop, în Gorj, Dolj, Vâlcea, Olt și Mehedinți. Intervenție rapidă, prețuri transparente. Sunați 24/7.",
  city: "Târgu-Jiu",
  county: "Gorj",
  region: "Oltenia",
  country: "România",
  // Counties covered (Oltenia). Used by the coverage section + structured data.
  counties: ["Gorj", "Dolj", "Vâlcea", "Olt", "Mehedinți"],

  // Response-time promise (display string + the number for the animated counter).
  responseMinutes: 30,

  // THREE mobile numbers — the three co-owners, all for towing. Click-to-call,
  // no forms by design. `label` is the owner's name (demo placeholders).
  // Typed as a non-empty tuple so `phones[0]` is always defined under strict mode.
  phones: [
    { label: "Ionuț P.", display: "07XX XXX XX1", e164: "40700000001" },
    { label: "Andrei M.", display: "07XX XXX XX2", e164: "40700000002" },
    { label: "Vasile T.", display: "07XX XXX XX3", e164: "40700000003" },
  ] as [Phone, ...Phone[]],

  email: "contact@axatractari.ro",
  address: "Str. Exemplu nr. X",
  postalCode: "210000",

  // Legal / business identification (Legea 365/2002 art. 5) — MOCK placeholders.
  legal: {
    form: "SRL" as "SRL" | "PFA" | "II",
    legalName: "AXA Tractări S.R.L.",
    cui: "RO00000000",
    regNumber: "J18/000/2026",
    shareCapital: "200 RON",
    dpoEmail: "contact@axatractari.ro",
    documentsUpdated: "14 iunie 2026",
    dataRetention:
      "pe durata relației de prestare a serviciului + termenele fiscale legale; 30 de zile pentru solicitările care nu se finalizează",
  },

  // Demo banner — makes clear this is a concept site, not a live offering.
  demo: {
    show: true,
    text: "Site demonstrativ. Firma și numerele de telefon sunt fictive (concept de prezentare).",
  },

  social: {
    facebook: "https://facebook.com/axatractari",
    instagram: "https://instagram.com/axatractari",
  },

  // Geo (Târgu-Jiu center as placeholder) — structured data only.
  geo: {
    lat: 45.0357,
    lng: 23.2748,
  },
};

export type SiteOverrides = {
  [K in keyof typeof defaults]?: (typeof defaults)[K] extends object
    ? Partial<(typeof defaults)[K]>
    : (typeof defaults)[K];
};

const localModules = import.meta.glob<{ siteOverrides: SiteOverrides }>(
  "./site.local.ts",
  { eager: true },
);
const overrides: SiteOverrides =
  Object.values(localModules)[0]?.siteOverrides ?? {};

export const site = {
  ...defaults,
  ...overrides,
  legal: { ...defaults.legal, ...overrides.legal },
  social: { ...defaults.social, ...overrides.social },
  geo: { ...defaults.geo, ...overrides.geo },
  demo: { ...defaults.demo, ...overrides.demo },
} as const;

// `tel:` deep-link for a given phone entry.
export function telLink(e164: string): string {
  return `tel:+${e164}`;
}

// Concretely-typed phone list for iteration. The `as const` merge above widens
// `site.phones` into a shape where TS treats indexed access as possibly
// undefined; re-exporting with an explicit `Phone[]` type keeps `.map((p) =>)`
// callbacks clean across components.
export const phones: Phone[] = site.phones as unknown as Phone[];

// The primary number (dispecerat) — used by the sticky CTA + nav. Derived from
// `defaults` (a non-empty tuple) so it is statically guaranteed to exist.
export const primaryPhone: Phone = defaults.phones[0];
