export type FaqItem = {
  q: string;
  a: string;
};

// RO-only FAQ. Answers reflect the salon's real posture (WhatsApp booking,
// premium products, cancellation policy mirrored from /termeni). Used both for
// the on-page accordion and the FAQPage JSON-LD (SEO).
export const faq: FaqItem[] = [
  {
    q: "Cum mă programez?",
    a: "Cel mai simplu pe WhatsApp: apasă butonul „Programează-te”, scrie-mi ziua și intervalul preferat, iar eu îți confirm un loc liber. Mă poți suna și la telefon.",
  },
  {
    q: "Cât rezistă manichiura semipermanentă?",
    a: "În medie 2–3 săptămâni, în funcție de ritmul de creștere al unghiilor și de activitatea zilnică. Pentru construcția cu gel, rezistența este de obicei mai mare.",
  },
  {
    q: "Ce produse folosești?",
    a: "Lucrez doar cu produse premium, profesionale, și pun accent pe igienă impecabilă: instrumentar sterilizat și consumabile de unică folosință acolo unde e cazul.",
  },
  {
    q: "Cât durează o programare?",
    a: "O manichiură semipermanentă durează în jur de o oră; construcția cu gel sau un nail art mai elaborat pot dura mai mult. Îți spun estimarea când stabilim programarea.",
  },
  {
    q: "Care este politica de anulare?",
    a: "Te rog să anunți o eventuală anulare sau reprogramare cu cel puțin 24 de ore înainte, ca să pot oferi locul altei cliente. Detalii în pagina de Termeni și condiții.",
  },
  {
    q: "Cum pot plăti?",
    a: "Plata se face la programare, în numerar sau prin transfer/aplicație, după preferință. Confirmăm detaliile când stabilim programarea.",
  },
];
