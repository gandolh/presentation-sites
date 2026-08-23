export type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

// Mechanics-focused, BMW-specialist taxonomy. Authentic Romanian terminology,
// with the BMW-specific angle (coding, INPA/ISTA-style diagnosis, common BMW
// jobs like distribuție N47, VANOS, racire) woven into the copy.
export const services: Service[] = [
  {
    id: "diagnoza",
    title: "Diagnoză computerizată BMW",
    subtitle: "Citire & ștergere erori, codări",
    description:
      "Diagnoză dedicată BMW: citim toate modulele, interpretăm corect erorile și facem codări/adaptări (retrofit, înregistrare baterie, resetări service).",
  },
  {
    id: "revizii",
    title: "Revizii & schimb ulei",
    subtitle: "Ulei + filtre, conform fișei BMW",
    description:
      "Revizie completă cu ulei și filtre potrivite motorului tău (ulei, aer, polen, combustibil), cu resetarea corectă a indicatorului de service.",
  },
  {
    id: "distributie",
    title: "Distribuție & lanț",
    subtitle: "Curea/lanț + pompă apă",
    description:
      "Înlocuire kit distribuție (curea sau lanț, inclusiv lanțuri N47/N57) și pompă de apă, cu piese de calitate și montaj la cuplul corect.",
  },
  {
    id: "franare",
    title: "Sistem de frânare",
    subtitle: "Plăcuțe, discuri, lichid",
    description:
      "Plăcuțe și discuri față/spate, purjare și schimb lichid de frână, resetarea senzorilor de uzură și a martorilor din bord.",
  },
  {
    id: "suspensie",
    title: "Suspensie & direcție",
    subtitle: "Amortizoare, brațe, rulmenți",
    description:
      "Amortizoare, arcuri, brațe și bucși, rulmenți de roată, capete de direcție, pentru ținuta de drum specifică unui BMW.",
  },
  {
    id: "racire-vanos",
    title: "Răcire & VANOS",
    subtitle: "Termostat, pompă, garnituri",
    description:
      "Reparații sistem de răcire (termostat, pompă apă, vas expansiune) și intervenții specifice BMW: garnituri VANOS, capac valve, scurgeri de ulei.",
  },
  {
    id: "electrica",
    title: "Electrică & electronică auto",
    subtitle: "Baterie, alternator, instalație",
    description:
      "Baterie (cu înregistrare în sistem), alternator, electromotor, instalație electrică, iluminat și senzori — diagnoză și reparație.",
  },
  {
    id: "climatizare",
    title: "Climatizare / AC",
    subtitle: "Freon, etanșeitate, igienizare",
    description:
      "Încărcare freon (R134a / R1234yf), verificarea etanșeității sistemului, reparații compresor/condensator și igienizarea habitaclului.",
  },
  {
    id: "pre-itp",
    title: "Pre-ITP & remediere",
    subtitle: "Verificare înainte de inspecție",
    description:
      "Verificăm mașina înainte de ITP și remediem deficiențele, ca să treci inspecția din prima, fără drumuri în plus.",
  },
];
