// The "cum funcționează" flow shown on /zona, plus the coverage statement.
// Subcort is a logistics service: the value is that everything arrives and is
// set up at the client's own location.

export interface Step {
  /** Step number, shown large. */
  n: string;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    n: "01",
    title: "Solicitare & măsurători",
    description:
      "Ne spui data, locul și numărul de invitați. Stabilim împreună dimensiunea cortului și verificăm terenul unde se montează.",
  },
  {
    n: "02",
    title: "Livrare & montaj",
    description:
      "Aducem cortul la adresa ta și îl montăm complet: structură, pardoseală, pereți, iluminat și climatizare, exact cum am convenit.",
  },
  {
    n: "03",
    title: "Evenimentul tău",
    description:
      "În ziua evenimentului spațiul este pregătit și verificat. Eventualele servicii prin parteneri (catering, muzică, decor) sunt deja la locul lor.",
  },
  {
    n: "04",
    title: "Demontare",
    description:
      "După eveniment ne întoarcem și demontăm totul. Tu nu te ocupi de nimic din partea logistică, preluăm noi.",
  },
];

// Coverage — text only (no live map, by design). Gorj as the home county,
// extended across Oltenia. Localities are illustrative placeholders.
export const coverage = {
  primary: "Gorj",
  region: "Oltenia",
  localities: [
    "Târgu-Jiu",
    "Motru",
    "Rovinari",
    "Bumbești-Jiu",
    "Târgu Cărbunești",
    "Novaci",
  ],
  note: "Acoperim județul Gorj și ne deplasăm în toată Oltenia. Pentru localitățile mai îndepărtate, transportul se stabilește în funcție de distanță.",
};
