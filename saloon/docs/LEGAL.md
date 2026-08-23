# Audit legal & de conformitate — Ana Saloon

> Audit realizat la **29 mai 2026** pentru site-ul de prezentare al salonului
> Ana Saloon (Târgu-Jiu, Gorj). Site static (Astro), colectează **nume + telefon**
> printr-un formular de programare care deschide WhatsApp + backup pe email (Formspree).
> Entitate presupusă: PFA sau micro-SRL.
>
> Toate datele de identificare a firmei din site sunt **placeholder (mock)** și
> trebuie înlocuite cu cele reale înainte de publicare (vezi „De completat de proprietar").

## Rezumat: ce s-a implementat

| Cerință | Statut legal | Implementat |
|---|---|---|
| Identificare firmă în footer (denumire, CUI, Reg. Com., capital, sediu) | **OBLIGATORIU** (Legea 365/2002 art. 5) | ✅ footer + pagini legale (date mock) |
| Pictogramă/link ANPC SAL | **OBLIGATORIU** (Ordin ANPC 449/2022, **mod. 270/2026**) | ✅ footer → reclamatiisal.anpc.ro |
| Link ANPC SOL / platforma ODR UE | **A FOST ELIMINAT** | ✅ șters (platforma ODR închisă 20.07.2025) |
| Politică de confidențialitate (GDPR art. 13) | **OBLIGATORIU** | ✅ `/confidentialitate/` |
| Temei juridic corect pe formular: art. 6(1)(b), NU consimțământ | **OBLIGATORIU** (GDPR art. 6) | ✅ bifa de consimțământ obligatorie eliminată, înlocuită cu notă informativă |
| Mențiune ANSPDCP (autoritatea de plângere) | **OBLIGATORIU** (art. 13(2)(d)) | ✅ în Politica de confidențialitate |
| Formspree + WhatsApp/Meta ca destinatari + transfer SUA | **OBLIGATORIU** (art. 13(1)(e)+(f)) | ✅ în Politica de confidențialitate |
| Auto-găzduire fonturi (fără Google Fonts CDN) | **OBLIGATORIU** (GDPR; precedent LG München) | ✅ via @fontsource (latin + latin-ext) |
| Google Maps cu consimțământ (nu se încarcă automat) | **OBLIGATORIU dacă se încarcă la load** (Legea 506/2004) | ✅ încărcare doar la click |
| Politică de cookie-uri | Recomandat | ✅ `/cookie-uri/` |
| Termeni și condiții + politică de anulare/no-show | Recomandat | ✅ `/termeni/` |
| Conformitate EAA (accesibilitate) | **NU se aplică** (microîntreprindere, scutire) | bune practici aplicate oricum |

## Detaliere pe domenii

### 1. Identificarea firmei (Legea 365/2002, art. 5)
Orice site comercial / de „publicitate la servicii" trebuie să afișeze accesibil:
denumire, CUI/CIF, nr. Registrul Comerțului (J… pentru SRL, F… pentru PFA), sediu,
email și telefon. Se aplică **și** site-urilor de prezentare care nu vând online.
→ Implementat în footer (`src/components/Footer.astro`) și în paginile legale, cu
date din `src/content/site.ts › legal`.

### 2. ANPC — SAL obligatoriu, SOL eliminat
- **SAL** (Soluționarea Alternativă a Litigiilor) — obligatoriu prin Ordinul ANPC
  449/2022 pentru site-uri care prezintă servicii. **Actualizat prin Ordinul ANPC
  270/2026** (în vigoare 19 mai 2026): link-ul trimite acum la noua platformă
  națională https://reclamatiisal.anpc.ro/ (nu vechiul anpc.ro/ce-este-sal/).
- **SOL / ODR** — **eliminat**. Platforma europeană ODR (ec.europa.eu/consumers/odr)
  a fost **închisă definitiv la 20 iulie 2025** (Regulamentul UE 2024/3228). Păstrarea
  link-ului ar fi o practică potențial înșelătoare, de aceea a fost șters din footer.

  > Notă: cele două surse de research au fost în conflict pe acest punct — ghidurile
  > vechi de „builder de site" recomandau încă pictograma SOL; auditul legal a primat,
  > pe baza închiderii confirmate a platformei ODR în 2025.

### 3. GDPR (Reg. 2016/679 + Legea 190/2018)
- **Politică de confidențialitate** obligatorie (art. 13). Conține: operator, date
  colectate, scop, **temei juridic**, destinatari/împuterniciți, transfer SUA,
  perioadă de retenție, drepturi, dreptul de plângere la ANSPDCP.
- **Temei juridic = art. 6(1)(b)** (măsuri precontractuale la cererea persoanei),
  **NU consimțământ**. Bifa obligatorie „sunt de acord cu prelucrarea" a fost
  **eliminată** din formular (era mecanismul greșit) și înlocuită cu o **notă
  informativă** + link la politică. S-a adăugat o bifă **opțională, nebifată
  implicit**, doar pentru marketing (oferte/noutăți) — temei art. 6(1)(a).
- **Retenție aleasă:** 12 luni de la ultima programare; 30 de zile pentru solicitările
  care nu se finalizează. (Documentele fiscale, separat, conform termenelor legale.)
- **De făcut offline (nu ține de site):** semnarea unui **DPA cu Formspree** (art. 28).

### 4. Cookie-uri / ePrivacy (Legea 506/2004)
Abordare de conformitate minimă, ca să **nu fie nevoie de banner de cookie-uri**:
- **Fonturi auto-găzduite** (eliminat Google Fonts CDN) — evită transmiterea IP-ului
  vizitatorului către Google (precedent LG München 3 O 17493/20).
- **Google Maps cu poartă de consimțământ** — harta apare ca imagine; iframe-ul Google
  se încarcă **doar la click** pe „Încarcă harta". Până atunci, niciun cookie Google.
- **Fără analytics / pixeli / urmărire.** S-a adăugat totuși o pagină scurtă
  „Politică de cookie-uri".

### 5. Termeni și condiții
Nu sunt strict obligatorii pentru un site de prezentare, dar recomandați. Pagina
`/termeni/` include: identificare furnizor, descriere servicii, modul de confirmare a
programării, **politica de anulare/întârziere/no-show**, răspundere, lege aplicabilă,
trimitere la SAL.

### 6. Accesibilitate (EAA — Legea 232/2022, în vigoare din 28 iun. 2025)
Microîntreprinderile (<10 angajați **și** <2 mil. € cifră de afaceri) sunt **scutite**.
Un salon cu un singur angajat este clar scutit. Bune practici de accesibilitate
(contrast, dimensiuni text, alt-text) aplicate oricum.

## De completat de proprietar (înainte de publicare)
În `src/content/site.ts`:
- `legal.legalName`, `legal.cui`, `legal.regNumber`, `legal.shareCapital`, `legal.form`
- date reale de contact: `phone`, `phoneE164`, `whatsappE164`, `email`, `address`, `postalCode`
- `formspreeEndpoint` (ID real Formspree) și semnarea DPA cu Formspree
- `geo.lat` / `geo.lng` reale pentru hartă

## Surse principale
- Legea 365/2002 — https://legislatie.just.ro/Public/DetaliiDocument/37075
- Ordin ANPC 449/2022 — https://legislatie.just.ro/Public/DetaliiDocument/257649
- Închiderea platformei ODR (20.07.2025) — https://www.twobirds.com/en/insights/2025/global/the-end-of-the-european-online-dispute-resolution-platform
- GDPR art. 6(1)(b) — EDPB Guidelines 2/2019
- ANSPDCP — https://www.dataprotection.ro
- Google Fonts GDPR (LG München) — https://gdprhub.eu/index.php?title=LG_M%C3%BCnchen_-_3_O_17493/20
- Legea 506/2004 (cookies) — lege5.ro
- EAA / Legea 232/2022 — https://www.amcham.ro/business-intelligence/new-accessibility-obligations-how-law-no-2322022-will-affect-economic-operators-starting-june-28-2025
