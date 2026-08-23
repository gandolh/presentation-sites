// Partner add-ons shown on /servicii. These are arranged THROUGH LOCAL PARTNERS
// at extra cost — Subcort coordinates them but doesn't provide them directly.
// No partner names are listed (this is a demo; none exist). The "prin parteneri"
// framing is stated once on the page, not repeated on every card.

export interface Service {
  /** Short title. */
  title: string;
  /** Neutral, occasion-agnostic description. */
  description: string;
  /** Inline SVG icon id (rendered by the page). */
  icon: "catering" | "music" | "decor";
}

export const services: Service[] = [
  {
    title: "Catering & servire",
    description:
      "Punem la punct meniul și servirea împreună cu firme de catering din zonă, de la mese festive la mese mai sobre. Tu alegi, noi coordonăm logistica în cort.",
    icon: "catering",
  },
  {
    title: "Muzică & DJ",
    description:
      "Recomandăm și coordonăm formații sau DJ locali, potriviți tonului evenimentului tău. Sonorizarea se montează din timp, înainte de sosirea invitaților.",
    icon: "music",
  },
  {
    title: "Decor & aranjamente",
    description:
      "Decoruri și aranjamente florale prin parteneri locali, adaptate temei și anotimpului. Cortul rămâne o bază neutră peste care se construiește atmosfera dorită.",
    icon: "decor",
  },
];
