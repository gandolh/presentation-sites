# Roadmap — ce a mai rămas de făcut

> Pentru o orientare rapidă la reluarea lucrului, citește întâi
> [../STATUS.md](../STATUS.md). **Partea A (cod de agent) e DONE** — vezi marcajele
> de mai jos. Mai rămân: **Partea C** (cablarea finală live, blocată pe acțiunile
> de om) și **Partea B** (acțiuni pur de om).

Listă unificată a lucrurilor deschise pe tot proiectul (site + serviciul de
bots), la **29 mai 2026**. Împărțită în trei:

- **Partea A — poate fi făcută de un agent**: cod / conținut / config pe care un
  agent îl poate scrie și **verifica local** (typecheck, teste, build) fără
  secrete reale, fără bani, fără decizii din lumea reală.
- **Partea C — cablarea finală live**: cod mic, dar care se poate scrie/testa
  corect **doar după** ce omul creează conturile (B1–B5), pentru că trebuie rulat
  pe ceva real. Fiecare item e „pereche" cu un pas B.
- **Partea B — trebuie făcută de un om**: orice cere credențiale, cheltuială,
  semnături legale, date reale ale firmei, deținerea conturilor sau judecată de
  business. Un agent **nu** poate (și nu trebuie să) facă aceste lucruri.

Fluxul de activare a unui bot e mereu: **B (omul creează contul/credențialul) →
C (agentul finalizează codul dependent de cont și îl testează) → pornire live**.

> Referințe: deciziile în [../MARKETING.md](../MARKETING.md) și [../LEGAL.md](../LEGAL.md);
> regulile boților în `marketing/bots/COMPLIANCE.md`; planurile detaliate în
> `marketing/`. Markerele din cod: caută `TODO(impl)` în `marketing/bots/src`.

---

## Partea A — poate fi făcută de un agent

### A1. Site (Astro) — conținut & conversie
- [ ] **Prețuri pe serviciu** („de la X lei") în `src/content/services.ts` + UI.
  (Valorile reale le dă omul — B7; agentul pregătește structura + afișarea.)
> **Status A1: DONE** (în afară de prețuri/IG, care erau deja prezente). Vezi
> commit-ul „site conversion + trust content (Part A1)".
- [x] **Secțiune igienizare/sterilizare** — `src/components/Sterilization.astro`
  (#igiena: autoclav, consumabile unică folosință, dezinfecție).
- [x] **FAQ** — `src/components/Faq.astro` + `src/content/faq.ts` (6 întrebări,
  accordion `<details>`, `FAQPage` JSON-LD validat în build).
- [x] **Galerie înainte/după** — `beforeAfter` în `src/content/gallery.ts` +
  subsecțiune în `Gallery.astro` (placeholder-e până vin pozele reale — B7).
- [x] **Voucher cadou** — mențiune adăugată în `Loyalty.astro`.
- [~] **Prețuri pe serviciu** — DEJA prezente în `Services.astro` (nimic de făcut).
- [~] **Link Instagram** — DEJA prezent (CTA în galerie + iconițe footer).
- [ ] **Feed/embed Instagram** — rămâne link (un embed ar aduce cookie-uri terțe;
  contra posturii din `LEGAL.md`). Lăsat intenționat needeschis.

### A2. Serviciul de bots — cod care duce scaffold-ul spre „gata de producție"
Impl real **în spatele acelorași interfețe înghețate**; mock mode rămâne
default-ul, căile reale se construiesc doar la `BOTS_MOCK_MODE=false`.

> **Status A2: DONE.** Vezi commit-ul „bots real-impl behind frozen interfaces
> (Part A2)". `npm run check` verde (66 teste). Pornirea live rămâne B1–B5.
- [x] **db pe SQLite** — `core/db-sqlite.ts` (`node:sqlite`, zero deps), schemă +
  `purgeExpired`; teste în `db-sqlite.test.ts`.
- [x] **`isCalendarFull` real** — programări confirmate vs. capacitatea unui scaun.
- [x] **Server HTTP / webhook** — `core/webhook-http.ts` (GET handshake + POST cu
  semnătură verificată + parser inbound); pornit din `server.ts` în live.
- [x] **Sender real WhatsApp Cloud API** — `core/senders-live.ts`. (pereche cu B1)
- [x] **Sender real Meta Messaging** — `sendReply` + `setIceBreakers`. (cu B2)
- [x] **ContentPublisher real** — IG create→poll→publish, FB Page, TikTok. (cu B3)
- [x] **MarketingClient real** — campanie `PAUSED`, `special_ad_categories: []`;
  refuză orice non-PAUSED. (cu B4) *(ad set/creative rămân TODO la wiring live)*
- [x] **Notifier real** — schelet; transportul (email/WhatsApp) e alegere B5/om.
- [x] **Idempotență** — `reminderSentAt`/`confirmationSentAt` (câmpuri opționale
  pe `Appointment`); nu se retrimit.
- [x] **Linkul WhatsApp din config** — `SALON_WHATSAPP_E164` / `config`.
- [x] **Scheduler pe timere reale** — `SchedulerControl.start()` (interval/job).
- [x] **`.env.example` ↔ `config.ts`** — sincronizat (`SALON_WHATSAPP_E164`,
  `PUBLISH_SPACING_MS`).
- [ ] **CI** (opțional) — NEdeschis intenționat: repo-ul nu are încă `.github/`
  workflows; adăugarea CI e o decizie de infra (mai degrabă B8). Gate-ul local
  e `npm run check`.

### A3. Documentație & igienă
- [ ] **Actualizează `/confidentialitate`** când un bot intră live cu un nou
  flux/împuternicit (Meta/TikTok), conform `LEGAL.md` + `COMPLIANCE.md #11`.
  *(Amânat corect: boții NU sunt live — mock mode. Pagina deja menționează
  WhatsApp/Meta ca împuternicit + transfer SUA. A adăuga acum „răspunsuri
  automate" sau TikTok ar descrie o prelucrare care nu are loc încă — inexact
  pentru o pagină GDPR. Se face la pornirea live, pereche cu B1/B2/B3.)*
- [ ] La fiecare bot care ajunge live, **bifează** elementele din
  `marketing/bots/<bot>/todo.md` și mută în `docs/` ce devine „decizie".

---

## Partea C — cablarea finală live (cod, dar blocat pe acțiunile de om)

Cod mic, marcat în sursă cu `// TODO(impl):` (caută șirul în
`marketing/bots/src`). NU se poate scrie/testa corect fără contul real aferent —
se face **după** pasul B din pereche, ca parte a activării fiecărui bot.

- [ ] **C1 — WhatsApp (pereche B1):** în `whatsapp/handler.ts` persistă programarea
  „requested" + notifică Ana pentru confirmare; trimite template utility/away în
  afara ferestrei de 24h. Testabil după ce există numărul + template-urile aprobate.
- [ ] **C2 — Responses (pereche B2):** validează pe contul real fluxul
  `sendReply` / `setIceBreakers` (codul există în `senders-live.ts`; necesită
  Pagina + permisiuni Messaging).
- [ ] **C3 — Scheduler (pereche B3):** alertă la eșec de publicare + retry
  (`scheduler/index.ts`); validează pipeline-ul real de publicare IG/FB/TikTok.
- [ ] **C4 — Campaigns (pereche B4):** în `senders-live.ts` `createPausedCampaign`,
  partea de **ad set + creative + ad** (geo/buget/optimizare + ID creativ); +
  deep-link Ads Manager în notificare. Necesită cont de reclame real.
- [ ] **C5 — Notifier (pereche B5):** alege canalul (email/WhatsApp către Ana) și
  trimite efectiv (acum doar loghează). Decizia de canal e a omului.
- [ ] **C6 — Confidențialitate (pereche B1/B2/B3):** actualizează
  `/confidentialitate` cu fluxurile/împuterniciții reali când boții devin live
  (vezi A3 — amânat intenționat cât timp e mock).

---

## Partea B — trebuie făcută de un om

### B0. Pre-publicare site (din `LEGAL.md` → „De completat de proprietar")
- [ ] **Date reale ale firmei** în `src/content/site.ts › legal`: `legalName`,
  `cui`, `regNumber`, `shareCapital`, `form`. (Date oficiale ANAF/ONRC.)
- [ ] **Date reale de contact**: `phone`, `phoneE164`, `whatsappE164`, `email`,
  `address`, `postalCode`. (Acum sunt placeholder „07XX…", `REPLACE_ME`.)
- [ ] **`geo.lat` / `geo.lng`** reale pentru hartă.
- [ ] **Formspree**: creează formularul, pune `formspreeEndpoint` real, și
  **semnează DPA cu Formspree** (GDPR art. 28) — acțiune offline.

### B1–B5. Conturi, credențiale & app review (necesare pentru orice bot live)
- [ ] **B1 — WhatsApp**: număr WhatsApp Business + Meta app + WhatsApp product;
  token permanent + phone number ID; **submit template-uri** spre aprobare
  (`confirmare_programare`, `reminder_programare`, `multumire_recenzie`).
- [ ] **B2 — Instagram/Facebook**: cont IG **Business/Creator** legat de o
  **Pagină** Facebook; permisiuni Messaging pe Meta app (eventual app review).
- [ ] **B3 — publicare**: permisiuni Content Publishing (IG/FB) + cont **TikTok
  for Developers** cu acces Content Posting API (necesită aprobare TikTok).
- [ ] **B4 — reclame**: Business Manager + cont de reclame + permisiune
  `ads_management`; **metodă de plată** atașată.
- [ ] **B5 — secrete în `.env`** pe VPS (niciodată în git): app secret, token-uri,
  phone/ad-account IDs, `NOTIFY_TO`. Apoi `BOTS_MOCK_MODE=false` + flag-urile
  `BOT_*_ENABLED` / `ADS_SPEND_ENABLED` pornite controlat.

### B6. Operare reclame (judecată de business + bani)
- [ ] **Aprobă fiecare campanie** pregătită de bot (PAUSED → live în Ads Manager).
  Boții nu pornesc niciodată singuri cheltuiala (decizie de proprietar).
- [ ] **Plafon de buget lunar** + radius real al zonei de acoperire + oferta de
  primă vizită (intră în `config` / presets, dar **decizia** e a omului).
- [ ] **Review săptămânal**: cost pe programare, ce creativ/ofertă a mers,
  oprește campaniile de lead când agenda e plină.

### B7. Conținut & date reale
- [ ] **Prețurile reale** pe serviciu (pentru A1).
- [~] **Fotografii reale** ale lucrărilor + ale Anei. *Mecanismul e gata*: switch
  `IMAGE_SOURCE`/`PUBLIC_IMAGE_SOURCE` în `src/content/images.ts`; fotografiile
  reale stau git-ignored în `public/images/real/` (deja există hero, portret Ana,
  gallery-01..06). Rămâne să se completeze restul (galerie, înainte/după) și să se
  ruleze cu `PUBLIC_IMAGE_SOURCE=real`.
- [ ] **Recenzii reale** (acum sunt mostre hardcodate în `testimonials.ts`).
- [ ] **Clipuri/Reels** pentru motorul organic + creative pentru reclame.

### B8. Infrastructură & legal de operare
- [ ] **VPS + domeniu** (`anasaloon.ro`), TLS. *Tooling-ul de deploy e gata*
  (`deploy/deploy.ts`: build local cu sub-path `/saloon` + `rsync` pe VPS Hetzner
  servit de **Caddy**; vezi `deploy/README.md`). Rămâne acțiunea de om: aprovizionarea
  serverului real + `deploy/.env` (host, `REMOTE_DIR`, domeniu) + procesul de bots pe subpath `/bots`.
- [ ] **Google Business Profile** creat & verificat (cel mai bun ROI local) —
  cere acces la afacere și verificare.
- [ ] **Deținerea conturilor** (Ana vs Cristian) pentru Meta Business + TikTok.

---

## Notă de prioritizare (sugerată)

1. **B0** (date reale) + **A1** (prețuri/FAQ/sterilizare) → site gata de publicat.
2. **A2 WhatsApp sender + SQLite + server** ⟂ **B1** → primul bot util (remindere
   = cel mai mare câștig: mai puține no-show-uri).
3. **A2 responses** ⟂ **B2** → auto-reply IG/FB pe lead-urile din reclame.
4. **A2 scheduler** ⟂ **B3**, apoi **campaigns** ⟂ **B4 + B6**.

Ordinea respectă fazarea din `marketing/README.md` (ads/organic → WhatsApp →
orchestrator → responses → scheduler → campaigns).
