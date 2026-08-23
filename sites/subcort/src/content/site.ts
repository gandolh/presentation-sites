// Public defaults — safe to commit. Real values (phone, address, CUI, social
// handles, geo) would live in a git-ignored `site.local.ts`, deep-merged on top
// of these at build time. See `site.local.example.ts`.
//
// NOTE: Subcort is a DEMO / concept site. Everything here is an OBVIOUS
// placeholder ("07XX XXX XXX", "Str. Exemplu nr. X") — there is no real
// business behind it. The legal/identification scaffolding is included to show
// a complete, RO-compliant structure, but every value is fictional.
//
// Whatever ends up here is baked into the static HTML and is therefore PUBLIC
// on the deployed site.

import type { SiteOverridesOf } from "@sites/kit";

const defaults = {
  name: "Subcort",
  // Calm, occasion-agnostic tagline. The tent is a prepared space for whatever
  // the day asks for — never leaning festive (so it fits any event).
  tagline: "Corturi pentru evenimente, montate la tine acasă. Pentru orice ocazie.",
  description:
    "Subcort închiriază și montează corturi pentru evenimente în Gorj și Oltenia. Aducem cortul la tine, îl montăm exact cum vrei și asigurăm încălzire sau răcire, în funcție de sezon.",
  city: "Târgu-Jiu",
  county: "Gorj",
  region: "Oltenia",
  country: "România",

  // Contact (placeholders — display-only; the site has NO contact form and NO
  // call/WhatsApp CTAs by design). These appear on the Contact page + footer.
  phone: "07XX XXX XXX",
  phoneE164: "40700000000", // used only for the tel: link on the Contact page
  email: "contact@subcort.ro",
  address: "Str. Exemplu nr. X",
  postalCode: "210000",

  // Legal / business identification (Legea 365/2002 art. 5) — MOCK placeholders.
  // Structure shown for completeness; values are fictional (demo site).
  legal: {
    form: "SRL" as "SRL" | "PFA" | "II", // tip entitate
    legalName: "Subcort S.R.L.", // denumirea exactă din actul constitutiv
    cui: "RO00000000", // CUI / CIF de la ANAF
    regNumber: "J18/000/2024", // nr. Registrul Comerțului (J… pentru SRL, F… pentru PFA)
    shareCapital: "200 RON", // capital social (doar SRL; gol pentru PFA)
    dpoEmail: "contact@subcort.ro",
    documentsUpdated: "5 iunie 2026",
    dataRetention:
      "pe durata relației de prestare a serviciului + termenele fiscale legale; 30 de zile pentru solicitările care nu se finalizează",
  },

  // Demo banner — makes clear this is a concept site, not a live commercial
  // offering. Flip `show: false` (in site.local.ts) if ever made real.
  demo: {
    show: true,
    text: "Site demonstrativ. Datele de contact și firma sunt fictive (concept de prezentare).",
  },

  // Hours (placeholder — shown on the Contact page).
  hours: [
    { day: "Luni – Vineri", value: "09:00 – 18:00" },
    { day: "Sâmbătă", value: "09:00 – 14:00" },
    { day: "Duminică", value: "Doar pe bază de programare" },
  ],

  // Social (placeholders).
  social: {
    facebook: "https://facebook.com/subcort",
    instagram: "https://instagram.com/subcort",
  },

  // Geo (Târgu-Jiu center as placeholder) — used for structured data only.
  geo: {
    lat: 45.0357,
    lng: 23.2748,
  },
};

// The shape of the optional real-data file. Every field is optional, so the
// local file only needs to specify what it overrides.
export type SiteOverrides = SiteOverridesOf<typeof defaults>;

// Eagerly glob the optional local file. `import.meta.glob` resolves to {} when
// the file is absent, so a fresh clone / CI without it falls back cleanly to
// the placeholders above. The path is a literal so Vite can statically analyse it.
const localModules = import.meta.glob<{ siteOverrides: SiteOverrides }>(
  "./site.local.ts",
  { eager: true },
);
const overrides: SiteOverrides =
  Object.values(localModules)[0]?.siteOverrides ?? {};

// Shallow merge for top-level scalars/arrays, one level of nested merge for the
// object groups so a local file can override a single nested field.
export const site = {
  ...defaults,
  ...overrides,
  legal: { ...defaults.legal, ...overrides.legal },
  social: { ...defaults.social, ...overrides.social },
  geo: { ...defaults.geo, ...overrides.geo },
  demo: { ...defaults.demo, ...overrides.demo },
} as const;

// `tel:` deep-link — used ONLY on the Contact page where the phone number is
// shown. The rest of the site has no call-to-action by design.
export function telLink(): string {
  return `tel:+${site.phoneE164}`;
}
