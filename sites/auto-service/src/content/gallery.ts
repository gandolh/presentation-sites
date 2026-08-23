import { img } from "./images";

export type GalleryImage = {
  src: string;
  alt: string;
};

// Logical image names resolve to SVG mockups now and to real photos later (just
// drop files in public/images/real/ and list them in images.ts › HAS_REAL).
//
// MARQUE FIDELITY: an INDEPENDENT BMW SPECIALIST must never show another brand's
// car under a "real work, real cars" claim — it quietly contradicts "doar BMW,
// zi de zi". The current stand-ins were audited (see public/images/real/README.md):
//   gallery-03  red E30 M3, "BMW M Power" cover .......... BMW ✓ (leads)
//   gallery-04  Brembo brake disc ...................... marque-neutral ✓
//   gallery-05  engine-bay / alternator detail ......... marque-neutral ✓
//   gallery-01  Hyundai Kona N on the lift ............. WRONG MARQUE ✗ (dropped)
//   gallery-02  diagnosis laptop in a Peugeot interior . WRONG MARQUE ✗ (dropped)
//   gallery-06  foreign race-team pit crew ............. off-brand ✗ (dropped)
// So the gallery runs on the BMW-true tile plus two marque-neutral mechanical
// details until real BavAuto photos land. When they do, add the new logical
// names here with honest alt text and re-enable the wrong-marque slots only if
// the replacement is actually a BMW.
export const gallery: GalleryImage[] = [
  { src: img("gallery-03"), alt: "Motor BMW M deschis în atelier, capotă ridicată" },
  { src: img("gallery-04"), alt: "Disc și etrier de frână în reparație, detaliu mecanic" },
  { src: img("gallery-05"), alt: "Detaliu motor și alternator, componente mecanice în atelier" },
];
