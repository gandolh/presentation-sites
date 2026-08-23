# TODO

## Legal & Compliance — DONE (29 mai 2026)

Audit complet + implementare: vezi [LEGAL.md](../LEGAL.md).

- [x] **Business info in footer** — denumire, CUI, Reg. Com., capital social, sediu
  (Legea 365/2002 art. 5). Date mock în `src/content/site.ts › legal`.
- [x] **`/confidentialitate` page** — Politică de confidențialitate GDPR (art. 13):
  date colectate (nume, telefon), scop, temei juridic, destinatari (WhatsApp/Meta,
  Formspree), transfer SUA, retenție, drepturi, ANSPDCP.
- [x] **Booking form legal basis fixed** — bifa de consimțământ obligatorie ELIMINATĂ
  (temeiul corect e art. 6(1)(b), nu consimțământ). Înlocuită cu notă informativă +
  link la politică. Adăugată bifă opțională de marketing.
- [x] **Data retention decided** — 12 luni de la ultima programare (30 zile pentru
  solicitări nefinalizate). Documentat în Politica de confidențialitate.
- [x] **`/termeni`** — Termeni și condiții + politică de anulare/no-show.
- [x] **`/cookie-uri`** — Politică de cookie-uri.
- [x] **ANPC SAL** păstrat; **SOL/ODR eliminat** (platforma ODR închisă 20.07.2025).
- [x] **Fonturi auto-găzduite** (fără Google Fonts CDN) — `@fontsource`.
- [x] **Google Maps cu consimțământ** — se încarcă doar la click.

## De completat de proprietar (date reale)

- [ ] Înlocuiește datele mock din `src/content/site.ts`: `legal.*`, contact, `geo`,
  `formspreeEndpoint`.
- [ ] Semnează un **DPA cu Formspree** (GDPR art. 28) — acțiune offline.

## Marketing & automatizare — DONE (29 mai 2026)

Strategie de promovare + serviciu de „bots" (campanii / răspunsuri / programare
postări). Referința deciziilor: [MARKETING.md](../MARKETING.md).

- [x] **Strategie de reclame** (Meta + TikTok, buget local, pâlnie spre WhatsApp,
  calendar sezonier RO) — plan în `marketing/ads/todo.md`.
- [x] **Decizie de scop**: boții fac doar campanii / răspunsuri inbound /
  programare postări. **Fără** engagement (interzis ToS + decizie proprietar).
  Reguli: `marketing/bots/COMPLIANCE.md`.
- [x] **Scaffold serviciu bots construit** (Faza 1–3, multi-agent): `core/`
  înghețat, 4 boți (whatsapp/responses/scheduler/campaigns) + harness teste,
  siguranța banilor în cod.
- [x] **Impl real în spatele interfețelor** (Part A2): SQLite (`db-sqlite.ts`),
  sender-e reale (`senders-live.ts`), server HTTP webhook (`webhook-http.ts`),
  idempotență remindere/confirmări, scheduler pe timere reale, link WhatsApp din
  config. `npm run check` verde (typecheck strict + **66 teste, 0 fail**).
- [x] **Verificat fără credențiale**: boot mock (boții OFF implicit), kill-switches,
  gardă fail-fast pe secrete, teste de integrare pe graful real + SQLite + webhook.

> Serviciul rulează **end-to-end în mock mode**; **NU e activat live**. Ce mai
> rămâne (trecerea finală de cablare live + acțiunile de om) și punctul de
> reluare sunt în [STATUS.md](../STATUS.md) și
> [todo/ROADMAP.md](./ROADMAP.md).

## Site — conținut & conversie — DONE (29 mai 2026, Part A1)

- [x] **Secțiune igienizare/sterilizare** (`Sterilization.astro`, #igiena).
- [x] **FAQ** + `FAQPage` JSON-LD (`Faq.astro` + `content/faq.ts`).
- [x] **Galerie înainte/după** (`beforeAfter` în `content/gallery.ts` + `Gallery.astro`).
- [x] **Voucher cadou** (mențiune în `Loyalty.astro`).
- [x] **Prețuri pe serviciu** — erau deja prezente (`Services.astro`).
- [x] **Link Instagram** — era deja prezent (CTA galerie + footer).
- [ ] *Needeschis intenționat:* embed feed Instagram (ar aduce cookie-uri terțe,
  contra posturii din `LEGAL.md`); profil echipă (salon cu o singură persoană).
