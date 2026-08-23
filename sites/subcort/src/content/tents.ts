// Tent configurations shown on /corturi. Sizes/capacities are realistic
// placeholders modelled on what RO event-tent rentals typically offer
// (8×8 … 15×20m). Capacities are given as ranges because they depend on the
// layout (mese rotunde vs. bufet vs. scaune în rânduri).

export interface Tent {
  /** Display size, e.g. "10 × 15 m". */
  size: string;
  /** Footprint in m², for the spec line. */
  area: string;
  /** Seated capacity range (mese + scaune). */
  seated: string;
  /** Standing / reception capacity range. */
  standing: string;
  /** One short, neutral line about where this size fits. */
  note: string;
}

export const tents: Tent[] = [
  {
    size: "8 × 8 m",
    area: "64 m²",
    seated: "40 – 50 persoane",
    standing: "până la 80 persoane",
    note: "Potrivit pentru reuniuni de familie și evenimente restrânse, în curte.",
  },
  {
    size: "10 × 15 m",
    area: "150 m²",
    seated: "90 – 110 persoane",
    standing: "până la 160 persoane",
    note: "Cel mai cerut format, cu echilibru între spațiu pentru mese și ringul central.",
  },
  {
    size: "10 × 20 m",
    area: "200 m²",
    seated: "130 – 150 persoane",
    standing: "până la 220 persoane",
    note: "Pentru evenimente mai ample, cu zonă de servire și spațiu de mișcare.",
  },
  {
    size: "15 × 20 m",
    area: "300 m²",
    seated: "180 – 220 persoane",
    standing: "până la 320 persoane",
    note: "Formatul mare, pentru evenimentele cu mulți invitați și scenă dedicată.",
  },
];

// Dotări — what comes with the tent. Split into "incluse" (part of the mount)
// and "opționale" (configured per event). Neutral, occasion-agnostic.
export interface Amenity {
  title: string;
  description: string;
  /** "inclus" | "optional" — drives the small label on the card. */
  kind: "inclus" | "optional";
}

export const amenities: Amenity[] = [
  {
    title: "Pardoseală modulară",
    description:
      "Podea stabilă, nivelată, montată peste teren, confortabilă chiar și pe iarbă sau pământ.",
    kind: "inclus",
  },
  {
    title: "Iluminat interior",
    description:
      "Corpuri de iluminat calde, distribuite uniform, pentru o atmosferă plăcută seara.",
    kind: "inclus",
  },
  {
    title: "Pereți laterali",
    description:
      "Laterale care se pot deschide sau închide complet, în funcție de vreme și de cum vrei spațiul.",
    kind: "inclus",
  },
  {
    title: "Încălzire",
    description:
      "Surse de căldură dimensionate pentru cort, pentru evenimentele din sezonul rece.",
    kind: "optional",
  },
  {
    title: "Răcire / ventilație",
    description:
      "Climatizare și ventilație pentru zilele călduroase de vară, ca spațiul să rămână respirabil.",
    kind: "optional",
  },
  {
    title: "Mobilier",
    description:
      "Mese și scaune aranjate după planul tău: rotunde, dreptunghiulare sau în rânduri.",
    kind: "optional",
  },
];
