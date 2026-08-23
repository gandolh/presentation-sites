export type FaqItem = {
  q: string;
  a: string;
};

// RO-only FAQ. Answers reflect the workshop's posture (phone-first contact,
// quote-before-repair, warranty, family business). Used both for the on-page
// accordion and the FAQPage JSON-LD (SEO).
export const faq: FaqItem[] = [
  {
    q: "Reparați doar BMW?",
    a: "Suntem specializați pe BMW — acolo avem experiența, sculele și diagnoza dedicată. Pentru alte mărci ne poți întreba, însă punctul nostru forte rămâne BMW.",
  },
  {
    q: "Primesc un deviz înainte de reparație?",
    a: "Da, mereu. Facem întâi diagnoza, îți explicăm ce am găsit și primești un deviz clar. Nu începem nicio lucrare neaprobată de tine.",
  },
  {
    q: "Oferiți garanție la lucrări?",
    a: "Da. Piesele montate au garanție conform legii (minim 2 ani la piesele care nu sunt consumabile), iar manopera este garantată conform politicii atelierului. Primești factură și certificat de garanție la fiecare lucrare.",
  },
  {
    q: "Cât durează o revizie?",
    a: "O revizie obișnuită durează în jur de 1–2 ore. Lucrările mai complexe (distribuție, suspensie) le programăm și îți spunem estimarea la confirmare.",
  },
  {
    q: "Pot aduce piesele mele?",
    a: "Da, putem monta piese aduse de tine, însă în acest caz garanția acoperă doar manopera, nu și piesa. Îți recomandăm ce e potrivit modelului tău dacă preferi să cumpărăm noi.",
  },
  {
    q: "Lucrați și sâmbăta?",
    a: "Da, sâmbăta dimineața suntem deschiși (vezi programul din pagină). Pentru urgențe, sună-ne și găsim o soluție.",
  },
  {
    q: "Faceți codări și retrofit?",
    a: "Da. Avem diagnoză dedicată BMW pentru codări, adaptări și retrofit (de exemplu activări de funcții, înregistrare baterie, resetări de service).",
  },
];
