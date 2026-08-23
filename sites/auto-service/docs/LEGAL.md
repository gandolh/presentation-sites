# Audit legal & de conformitate — BavAuto Gorj

> Audit realizat la **5 iunie 2026** pentru site-ul de prezentare al atelierului
> **BavAuto Gorj** — atelier independent specializat BMW, afacere de familie
> (Târgu-Jiu, Gorj). Site static (Astro), colectează **nume + telefon + model/an
> + mesaj** printr-un formular de cerere de ofertă care deschide WhatsApp +
> backup pe email (Formspree). Entitate presupusă: PFA sau micro-SRL.
>
> Toate datele de identificare a firmei din site sunt **placeholder (mock)** și
> trebuie înlocuite cu cele reale înainte de publicare (vezi „De completat de
> proprietar”). Validat la zi pentru **iunie 2026**.

## Rezumat: ce s-a implementat

| Cerință | Statut legal | Implementat |
|---|---|---|
| Identificare firmă în footer (denumire, CUI, Reg. Com., capital, sediu) | **OBLIGATORIU** (Legea 365/2002 art. 5) | ✅ footer + pagini legale (date mock) |
| Pictogramă/link ANPC SAL → **`reclamatiisal.anpc.ro`** | **OBLIGATORIU** (Ordin ANPC 449/2022, **mod. 270/2026**) | ✅ footer + termeni, link nou |
| Link ANPC SOL / platforma ODR UE | **A FOST ELIMINAT** | ✅ niciodată inclus (platforma ODR închisă 20.07.2025) |
| Politică de confidențialitate (GDPR art. 13) | **OBLIGATORIU** | ✅ `/confidentialitate/` |
| Temei juridic corect pe formular: art. 6(1)(b), NU consimțământ | **OBLIGATORIU** (GDPR art. 6) | ✅ notă informativă, fără bifă obligatorie |
| Mențiune ANSPDCP (autoritatea de plângere) | **OBLIGATORIU** (art. 13(2)(d)) | ✅ în Politica de confidențialitate |
| Formspree + WhatsApp/Meta ca destinatari + transfer SUA | **OBLIGATORIU** (art. 13(1)(e)+(f)) | ✅ în Politica de confidențialitate |
| Auto-găzduire fonturi (fără Google Fonts CDN) | **OBLIGATORIU** (GDPR; precedent LG München) | ✅ via @fontsource (latin + latin-ext) |
| Google Maps cu consimțământ (nu se încarcă automat) | **OBLIGATORIU dacă se încarcă la load** (Legea 506/2004) | ✅ încărcare doar la click |
| Politică de cookie-uri | Recomandat | ✅ `/cookie-uri/` |
| Termeni și condiții + politică ofertare/garanție | Recomandat | ✅ `/termeni/` |
| **Garanție la reparații** (piese non-consumabile min. 2 ani) | **OBLIGATORIU** (Legea 449/2003, OUG 140/2021) | ✅ menționat în FAQ + Termeni |
| **Disclaimer independență BMW** (neafiliere cu BMW AG, fără roundel) | **Recomandat** (drept mărci / practici comerciale) | ✅ footer + termeni |
| **Autorizație RAR** | Obligatorie **la sediu** (RNTR-9); pe site recomandat | ✅ câmp opțional în footer (trust signal) |
| Conformitate EAA (accesibilitate) | **NU se aplică** (microîntreprindere, scutire) | bune practici aplicate oricum |

## Detaliere pe domenii

### 1. Identificarea firmei (Legea 365/2002, art. 5)
Orice site comercial / de „publicitate la servicii” trebuie să afișeze accesibil,
permanent și gratuit: denumire, CUI/CIF, nr. Registrul Comerțului (J… pentru SRL,
F… pentru PFA), sediu, email și telefon. Se aplică **și** site-urilor de
prezentare care nu vând online. → Footer (`src/components/Footer.astro`) + pagini
legale, din `src/content/site.ts › legal`.

### 2. ANPC — SAL obligatoriu (link ACTUALIZAT 2026), SOL eliminat
- **SAL** (Soluționarea Alternativă a Litigiilor) — obligatoriu prin Ordinul ANPC
  449/2022. **MODIFICAT prin Ordinul ANPC 270/2026** (în vigoare 19 mai 2026):
  toate referințele la SOL/ODR au fost eliminate, iar pictograma SAL trimite acum
  la noua platformă națională **`https://reclamatiisal.anpc.ro/`** (NU vechiul
  `anpc.ro/ce-este-sal/`). Pictogramă 250×50 px, pe homepage și în footer.
- **SOL / ODR** — **nu se afișează**. Platforma europeană ODR a fost **închisă
  definitiv la 20 iulie 2025** (Regulamentul UE 2024/3228). Un link mort ar fi o
  practică potențial înșelătoare.

  > ⚠️ Notă pentru întreținere: site-ul-soră `saloon` încă folosește vechiul link
  > `anpc.ro/ce-este-sal/` — ar trebui actualizat la `reclamatiisal.anpc.ro`
  > conform Ordinului 270/2026 (în afara scope-ului acestui proiect).

### 3. GDPR (Reg. 2016/679 + Legea 190/2018)
- **Politică de confidențialitate** obligatorie (art. 13): operator, date
  colectate (**nume, telefon, model/an BMW, mesaj**), scop, **temei juridic**,
  destinatari/împuterniciți, transfer SUA, retenție, drepturi, plângere ANSPDCP.
- **Temei juridic = art. 6(1)(b)** (măsuri precontractuale la cererea persoanei),
  **NU consimțământ**. Formularul de cerere de ofertă nu are bifă obligatorie de
  consimțământ; are o **notă informativă** + link la politică, plus o bifă
  **opțională, nebifată** doar pentru marketing (art. 6(1)(a)).
- **De făcut offline:** semnarea unui **DPA cu Formspree** (art. 28).

### 4. Cookie-uri / ePrivacy (Legea 506/2004)
Abordare de conformitate minimă, ca să **nu fie nevoie de banner de cookie-uri**:
- **Fonturi auto-găzduite** (fără Google Fonts CDN) — evită transmiterea IP-ului
  către Google (precedent LG München 3 O 17493/20).
- **Google Maps cu poartă de consimțământ** — harta apare ca imagine; iframe-ul
  Google se încarcă **doar la click**. Până atunci, niciun cookie Google.
- **Fără analytics / pixeli / urmărire.**

### 5. Termeni, garanție și ofertare
Pagina `/termeni/` include: identificare furnizor, descriere servicii, **modul de
ofertare** (devizul după diagnoză, nicio lucrare neaprobată), **garanție**
(piese non-consumabile min. 2 ani — Legea 449/2003 / OUG 140/2021; manopera
conform politicii atelierului), **documente la predare** (factură + certificat de
garanție), răspundere, lege aplicabilă, trimitere la SAL.

### 6. Disclaimer de independență BMW (mărci înregistrate)
Atelierul este **independent**, nu dealer, fără afiliere cu BMW AG. Pe site:
- **NU** se folosește logoul BMW (roundel) sau emblema „M” ca logo propriu;
  identitatea vizuală evocă paleta entuziaștilor (albastru + dunga M) fără a
  prelua mărcile figurative.
- „BMW”, „M” și denumirile de modele sunt folosite **nominativ** (doar pentru a
  descrie mașinile reparate) — utilizare permisă, însoțită de un **disclaimer**
  explicit în footer (`site.independence`) și în Termeni.

### 7. Autorizație RAR (RNTR-9)
Un atelier care execută reparații supuse certificării trebuie autorizat RAR;
autorizația se afișează **obligatoriu la sediu**. Pe site nu e strict obligatoriu,
dar afișarea numărului e un puternic semnal de încredere → câmp opțional
`legal.rarAuth`. Verificare publică: `portal.rarom.ro/rar-public/registry-search`.

### 8. Accesibilitate (EAA — Legea 232/2022, în vigoare 28 iun. 2025)
Microîntreprinderile care prestează servicii sunt **scutite**. Un atelier de 3–5
persoane se califică. Bune practici (contrast, alt-text, navigare la tastatură,
skip link) aplicate oricum.

## De completat de proprietar (înainte de publicare)
În `src/content/site.local.ts`:
- `legal.legalName`, `legal.cui`, `legal.regNumber`, `legal.shareCapital`,
  `legal.form`, **`legal.rarAuth`**
- contact real: `phone`, `phoneE164`, `whatsappE164`, `email`, `address`, `postalCode`
- `geo.lat` / `geo.lng` reale pentru hartă
- endpoint real Formspree (în componenta de formular) + semnarea DPA cu Formspree

## Surse principale
- Legea 365/2002 — https://legislatie.just.ro/Public/DetaliiDocument/37075
- Ordin ANPC 449/2022 — https://legislatie.just.ro/Public/DetaliiDocument/257649
- ANPC SAL (platforma nouă) — https://reclamatiisal.anpc.ro/ · https://anpc.ro/ce-este-sal/
- Ordin ANPC 270/2026 (modificare SAL, eliminare SOL) — https://www.juridice.ro/824963/anpc-dezvolta-sistemul-sal-potrivit-cadrului-european-actual.html
- Închiderea platformei ODR (20.07.2025) — Regulamentul UE 2024/3228
- GDPR art. 6(1)(b) — EDPB Guidelines 2/2019
- ANSPDCP — https://www.dataprotection.ro
- Google Fonts GDPR (LG München) — https://gdprhub.eu/index.php?title=LG_M%C3%BCnchen_-_3_O_17493/20
- Legea 506/2004 (cookies) — lege5.ro
- Garanție: Legea 449/2003 — https://anpc.ro/galerie/file/alege/lege_449_2003_garantii_2016.pdf ; OUG 140/2021
- RAR / RNTR-9 — https://www.rarom.ro/?page_id=883
- EAA / Legea 232/2022 — https://legislatie.just.ro/public/DetaliiDocument/257778
