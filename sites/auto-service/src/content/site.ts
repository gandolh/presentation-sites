// Public defaults — safe to commit. Real values (phone, address, CUI, social
// handles, geo, RAR authorisation) live in the git-ignored `site.local.ts`,
// which is deep-merged on top of these at build time. See `site.local.example.ts`.
//
// Note: whatever ends up here is baked into the static HTML and is therefore
// PUBLIC on the deployed site. Git-ignoring `site.local.ts` only keeps the real
// values out of the repo/GitHub history — not off the live page.
//
// BavAuto Gorj is an INDEPENDENT BMW specialist — a small family workshop. It is
// NOT a BMW dealer and is not affiliated with BMW AG. The brand uses an
// enthusiast blue / M-stripe visual language but never the BMW roundel, and the
// site carries an explicit independence disclaimer (see `independence` below and
// LEGAL.md).

import type { SiteOverridesOf } from "@sites/kit";

const defaults = {
  name: "BavAuto Gorj",
  // Short, enthusiast-flavoured tagline. "bavarez" = the cars' Bavarian origin.
  tagline: "Specialiști BMW. Atelier de familie în Târgu-Jiu.",
  description:
    "Atelier independent specializat BMW în Târgu-Jiu — afacere de familie. Diagnoză, mecanică, revizii și codări, cu devize clare și termene respectate.",
  city: "Târgu-Jiu",
  county: "Gorj",
  country: "România",

  // Independence / trademark disclaimer. Shown in the footer (and referenced in
  // the legal pages). We are not affiliated with BMW AG; we don't use the BMW
  // logo; "BMW", "M" and model names are trademarks of BMW AG used here only
  // nominatively to describe the cars we service.
  independence:
    "BavAuto Gorj este un atelier independent. Nu suntem dealer autorizat și nu avem nicio afiliere cu BMW AG. „BMW”, „M” și denumirile de modele sunt mărci înregistrate ale BMW AG, folosite aici doar pentru a descrie mașinile pe care le reparăm.",

  // Contact (placeholders — overridden in site.local.ts).
  // Phone is the PRIMARY call-to-action for an auto service (see PRODUCT.md):
  // most customers call. WhatsApp + the quote form are secondary.
  phone: "07XX XXX XXX",
  phoneE164: "40700000000",
  whatsappE164: "40700000000",
  email: "contact@bavauto.ro",
  address: "Str. Exemplu nr. X",
  postalCode: "210000",

  // Legal / business identification (Legea 365/2002 art. 5) — MOCK placeholders.
  // Owner provides real data in site.local.ts. For a PFA, set form: "PFA",
  // legalName e.g. "Popescu Ion PFA", and regNumber to the ONRC F-number
  // (e.g. "F18/123/2024"). For an SRL, keep form: "SRL", set the J-number and
  // capital social.
  legal: {
    form: "SRL" as "SRL" | "PFA" | "II", // tip entitate
    legalName: "BavAuto Gorj S.R.L.", // denumirea exactă din actul constitutiv
    cui: "RO00000000", // CUI / CIF de la ANAF
    regNumber: "J18/000/2024", // nr. Registrul Comerțului (J… pentru SRL, F… pentru PFA)
    shareCapital: "200 RON", // capital social (doar SRL; gol pentru PFA)
    // Autorizație RAR (Registrul Auto Român) — un atelier care execută operațiuni
    // de întreținere/reparații supuse certificării RAR trebuie autorizat. Afișarea
    // numărului de autorizație pe site este un puternic semnal de încredere.
    // Lăsați gol dacă nu se aplică tipului de operațiuni efectuate.
    rarAuth: "Autorizație RAR nr. 0000/AAAA",
    // Data Protection Officer / responsabil date — optional for a micro business.
    dpoEmail: "contact@bavauto.ro",
    // Last review date of the legal documents (update when content changes).
    documentsUpdated: "5 iunie 2026",
    // Retention chosen per the legal audit (see LEGAL.md).
    dataRetention:
      "pe durata relației de prestare a serviciului + termenele fiscale legale pentru documentele de reparație; 30 de zile pentru solicitările de ofertă care nu se finalizează",
  },

  // Hours
  hours: [
    { day: "Luni – Vineri", value: "08:00 – 18:00" },
    { day: "Sâmbătă", value: "09:00 – 14:00" },
    { day: "Duminică", value: "Închis" },
  ],

  // Social (placeholders — overridden in site.local.ts)
  social: {
    facebook: "https://facebook.com/bavauto",
    instagram: "https://instagram.com/bavauto",
  },

  // Stats — humble and honest for a young family BMW specialist (~5 ani). We do
  // NOT advertise a cars-repaired count: an invented figure would undercut the
  // "trust is shown, not claimed" promise. Years + the family framing carry it.
  stats: {
    years: "5", // ani de experiență pe BMW
    family: "3", // membri ai familiei în atelier
  },

  // Map (Târgu-Jiu center coordinates as placeholder — overridden in site.local.ts)
  geo: {
    lat: 45.0357,
    lng: 23.2748,
  },

  // Work-in-progress banner. While the site is a soft launch with placeholder
  // data/photos, a thin top banner invites visitors to call/WhatsApp instead.
  // Flip `wip.show` to false in site.local.ts once the real content is live.
  wip: {
    show: true,
    text: "Site în lucru. Pentru programări și oferte, sună-ne sau scrie-ne pe WhatsApp.",
  },
};

// Pre-filled WhatsApp deep-link. For an auto service the phone call is the
// primary CTA, but WhatsApp is a strong secondary — a customer can send a photo
// of the warning light / damaged part and the model. Pass a service name to
// tailor the opener; omit for the generic greeting.
export function waLink(message?: string): string {
  const text =
    message ??
    "Bună ziua! Aș dori o programare / un deviz pentru BMW-ul meu. Model și an: ___. Problema: ___.";
  return `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(text)}`;
}

// `tel:` deep-link for the primary click-to-call CTA.
export function telLink(): string {
  return `tel:+${site.phoneE164}`;
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
  wip: { ...defaults.wip, ...overrides.wip },
} as const;

// NOTE: there is no production data guard here — a fake phone / CUI can reach
// the live site. Fill real values in `site.local.ts` before the production
// deploy (denumire, CUI, Reg. Com., autorizație RAR, telefon, adresă, geo).
