// TEMPLATE — copy this file to `site.local.ts` (same folder) to override the
// public placeholders with real values. `site.local.ts` is git-ignored.
//
//   cp src/content/site.local.example.ts src/content/site.local.ts
//
// Every field is OPTIONAL — only include what you want to override. If
// `site.local.ts` is absent (the normal case for this demo), the build uses the
// placeholders from `site.ts`.
//
// Reminder: these values ARE published in the static HTML. This setup keeps
// them out of the repo, not off the live page.

import type { SiteOverrides } from "./site";

export const siteOverrides: SiteOverrides = {
  // --- Contact -------------------------------------------------------------
  phone: "07XX XXX XXX", // afișat: ex. "0723 456 789"
  phoneE164: "40700000000", // pentru tel: — fără +, fără spații
  email: "contact@subcort.ro",
  address: "Str. ... nr. ...",
  postalCode: "210000",

  // --- Legal / identificare firmă (Legea 365/2002) ------------------------
  legal: {
    form: "SRL", // "SRL" | "PFA" | "II"
    legalName: "Subcort S.R.L.", // exact din actul constitutiv
    cui: "RO00000000", // CUI / CIF de la ANAF
    regNumber: "J18/000/2024", // J… (SRL) sau F… (PFA)
    shareCapital: "200 RON", // doar SRL; "" pentru PFA
    dpoEmail: "contact@subcort.ro",
  },

  // --- Social --------------------------------------------------------------
  social: {
    facebook: "https://facebook.com/...",
    instagram: "https://instagram.com/...",
  },

  // --- Banner „site demonstrativ" -----------------------------------------
  // Pune `show: false` dacă site-ul devine o ofertă reală (cu date reale).
  demo: {
    show: true,
    text: "Site demonstrativ. Datele de contact și firma sunt fictive (concept de prezentare).",
  },
};
