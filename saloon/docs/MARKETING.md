# Marketing & automatizare — Ana Saloon

> Referință a deciziilor luate pentru promovarea salonului și pentru serviciul
> de automatizare „bots". Acest fișier consemnează **ce s-a decis și ce s-a
> construit** (ca `LEGAL.md`); planurile vii (cu casete de bifat) rămân în
> `marketing/` și `todo/`. Stadiu la **29 mai 2026**.
>
> Context: salon cu un singur scaun, Târgu-Jiu. Public RO. Programare prin
> WhatsApp (deep-link) + backup Formspree. Stack gratuit / self-host pe VPS.

## 1. Strategia de promovare (rezumat)

| Decizie | Stadiu |
|---|---|
| Pâlnia se termină în **WhatsApp** (mesaj/formular = conversia, nu vânzare online) | ✅ plan |
| Metrica nord: **cost pe programare**, nu CPM / like-uri | ✅ plan |
| Motor **organic** (3–5 Reels/TikTok/săpt.: transformări, sterilizare, Ana) duce brandul; plătit doar amplifică | ✅ plan |
| Buget local mic, **always-on** (~30–50 RON/zi): 1 campanie awareness + 1 Click-to-WhatsApp, geo 10–15 km | ✅ plan |
| Plafon de capacitate: pui pe pauză campaniile de lead când agenda e plină | ✅ plan + cod (vezi §3) |
| Calendar sezonier RO (8 Martie, Paște, nunți mai–sept, Crăciun) + vârf CPM Q4 | ✅ plan |
| **Nu** se cumpără urmăritori/like-uri; **nu** se depășește capacitatea unui scaun | ✅ regulă |

Detaliul complet (pillars de conținut, structura campaniilor, oferte): `marketing/ads/todo.md`.

## 2. Decizia-cheie: „bots" = automatizare conformă, NU engagement

Briful inițial cerea „bots care automatizează engagementul". S-a decis ferm
**împotriva** automatizării de tip engagement (auto-like / follow / comment /
mass-DM / scraping). Motive:

- **Interzis** de Meta și TikTok (2026): shadowban → ștergerea contului. Pentru
  un salon al cărui Instagram **este** vitrina, pierderea contului e un risc
  existențial care depășește orice creștere.
- Proprietarul a confirmat explicit: boții fac doar **(1) pregătesc campanii,
  (2) răspund automat la mesaje primite, (3) programează postări**.

Boții folosesc **doar API-uri oficiale** și acționează **doar la inițiativa
utilizatorului** (un mesaj/comentariu/formular venit de la el). Regulile dure:
`marketing/bots/COMPLIANCE.md`.

## 3. Arhitectura serviciului de automatizare (construit)

Pachet separat de site-ul static (`marketing/bots/`, `ana-saloon-bots`): server
Node de lungă durată, **în afara** `astro build`. Node ≥22, ESM, TypeScript 6
strict, fără pas de build (rulează `.ts` cu `--experimental-strip-types`).

**Construit prin 3 faze (1 agent fundație → 5 agenți paraleli → 1 integrare),**
**apoi o trecere de impl real în spatele acelorași interfețe înghețate:**

- `src/core/` — **contracte înghețate**: `config` (env, kill-switches per-bot,
  `ADS_SPEND_ENABLED`, plafoane buget, retenție), `types`, `logger` (+ `redact`
  PII), `db` (interfață + impl in-memory + purge retenție), `senders`
  (interfețe WhatsApp/Meta-messaging/ContentPublisher/Marketing/Notifier +
  `createMockSenders`), `webhook` (verificare semnătură Meta + router DOAR mesaje
  inbound), `scheduler` (registru de job-uri determinist), contractul `BotModule`.
- `src/bots/` — 4 boți + harness de teste:
  - **whatsapp** — confirmări + remindere (template-uri utility) + auto-reply la
    mesaj de programare + STOP + purge. Semantică opt-out: răspunde totuși la un
    mesaj **ulterior inițiat de utilizator** (nu re-mesagează proactiv).
  - **responses** — auto-reply inbound pe IG + FB, meniu FAQ RO, ice-breakers
    ca **meniu de răspuns**, rută „Programare" → WhatsApp. Opt-out = tăcere
    totală la mesajele următoare. **Fără** cod de comentarii/engagement.
  - **scheduler** — publish-runner peste coada de postări, cu plafoane per
    platformă (IG ≤100/24h, TikTok ≤25/zi) și cadență „umană".
  - **campaigns** — preset → `CampaignDraft` mereu **PAUSED**, clamp pe buget,
    kill-switch de cheltuială, notificare către om pentru aprobare, auto-pauză
    când agenda e plină. **Niciodată** nu creează campanie ACTIVE.
  - **shared-tests** — fixtures + fake clock + generator de evenimente + smoke.

**Stratul de impl real (construit, în afara mock mode):** `db-sqlite.ts` (Db pe
`node:sqlite`, zero deps, + `isCalendarFull` real), `senders-live.ts` (clienți
reali WhatsApp Cloud / Meta Messaging / Content Publishing IG+FB+TikTok /
Marketing API / Notifier, în spatele acelorași interfețe), `webhook-http.ts`
(server HTTP: handshake GET + POST cu semnătură verificată + parser inbound).
`server.ts` comută pe SQLite + sender-e reale când `BOTS_MOCK_MODE=false` și
pornește serverul webhook + scheduler pe timere reale, cu oprire grațioasă.

**Siguranța banilor (vizibilă în cod):** statusul e hard-codat „PAUSED" +
`assertPaused`; bugetul peste plafon e **clamp-uit și logat** (niciodată trimis
silențios); `enabled()` la campaigns cere ȘI flagul de bot ȘI `adsSpendEnabled`;
`MarketingClient` real refuză orice campanie non-PAUSED.

**Verificat:** `npm run check` (typecheck strict + **66 teste, 0 fail**); boot
fără credențiale (implicit toți boții OFF, mock mode); garda `assertSecretsForLive`
dă eroare rapidă dacă mock mode e oprit fără secrete. Teste de integrare conduc
graful real `buildApp` (router + scheduler) + teste pentru SQLite și parserul
webhook.

## 4. Ce mai rămas (stadiu live)

Serviciul rulează **end-to-end în mock mode**; **nu e activat live** (niciun apel
real / token / cheltuială până la `BOTS_MOCK_MODE=false` cu secrete reale).

Mai rămâne o **trecere finală de cablare live**, posibilă doar **după** ce omul
creează conturile (se testează pe ceva real). Marcată în cod cu `// TODO(impl):`:
- în `senders-live.ts` `createPausedCampaign`: ad set + creative + ad (necesită
  cont de reclame + ID creativ real);
- `Notifier`: alegerea canalului (email/WhatsApp) + trimiterea efectivă;
- `whatsapp/handler.ts`: persistă programarea „requested" + notifică Ana;
  template utility/away în afara ferestrei de 24h;
- `scheduler/index.ts`: alertă la eșec de publicare + retry.

Plus acțiunile pur de om (conturi, token-uri, aprobare template-uri/buget, DPA).
Lista completă, împărțită pe **agent vs om**: `todo/ROADMAP.md`. Punct de
reluare rapid: `STATUS.md`.

## 5. Costuri (cadru)

API-urile au nivel gratuit suficient pentru un salon: WhatsApp Cloud (inbound +
răspuns în fereastra de 24h gratis; template-uri utility ieftine, ~1000
conversații/lună gratis), Meta Marketing/Messaging/Publishing gratis (plătești
doar reclama, gata-gard de aprobare umană), TikTok gratis (≤25 postări/zi). Cost
real = **găzduire + timp de dev**, nu taxe API. Rulează pe VPS-ul existent.

## Surse principale
- ToS automatizare Meta/IG 2026 (engagement interzis, API oficial OK) — storrito.com, spurnow.com, creatorflow.so
- TikTok Content Posting API + reguli — developers.tiktok.com, tokportal.com
- WhatsApp Cloud API (fereastra 24h, template-uri utility) — chatarmin.com, respond.io
- Meta Marketing API (campanie PAUSED, special_ad_categories) — developers.facebook.com
- Benchmark CPM România — adligator.com, xyzlab.com
- Strategie social salon unghii 2026 — zoca.com, booksy.com
