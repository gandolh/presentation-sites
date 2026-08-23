// TEMPLATE — copy this file to `site.local.ts` (same folder) and fill in the
// REAL values. `site.local.ts` is git-ignored, so the real phone / address /
// CUI / social handles never reach GitHub.
//
//   cp src/content/site.local.example.ts src/content/site.local.ts
//
// Then edit `site.local.ts`. Every field is OPTIONAL — only include what you
// want to override; anything you omit keeps the public placeholder from
// `site.ts`. If `site.local.ts` is absent (fresh clone / CI), the build still
// succeeds using the placeholders.
//
// Reminder: these values ARE published in the static HTML. This setup keeps
// them out of the repo, not off the live page.

import type { SiteOverrides } from "./site";

export const siteOverrides: SiteOverrides = {
  // --- Contact -------------------------------------------------------------
  phone: "07XX XXX XXX",        // afișat: ex. "0723 456 789"
  phoneE164: "40700000000",     // pentru tel: — fără +, fără spații
  whatsappE164: "40700000000",  // pentru wa.me/ — fără +, fără spații
  email: "contact@anasaloon.ro",
  address: "Str. ... nr. ...",
  postalCode: "210000",

  // --- Legal / identificare firmă (Legea 365/2002) ------------------------
  legal: {
    form: "SRL",                       // "SRL" | "PFA" | "II"
    legalName: "Ana Saloon S.R.L.",    // exact din actul constitutiv
    cui: "RO00000000",                 // CUI / CIF de la ANAF
    regNumber: "J18/000/2024",         // J… (SRL) sau F… (PFA)
    shareCapital: "200 RON",           // doar SRL; "" pentru PFA
    dpoEmail: "contact@anasaloon.ro",
  },

  // --- Social --------------------------------------------------------------
  social: {
    instagram: "https://instagram.com/...",
    facebook: "https://facebook.com/...",
    tiktok: "https://tiktok.com/@...",
  },

  // --- Geo (coordonatele zonei, pentru date structurate) -----------------
  geo: {
    lat: 45.0357,
    lng: 23.2748,
  },
};
