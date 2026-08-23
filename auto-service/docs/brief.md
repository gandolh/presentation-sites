# PRODUCT — BavAuto Gorj

> Site de prezentare pentru un **atelier independent specializat BMW**, afacere
> de familie (3–5 persoane) din **Târgu-Jiu, jud. Gorj**. Static (Astro),
> România-only. Numele, datele de contact și identificarea firmei sunt
> **placeholder** și se completează în `src/content/site.local.ts` înainte de
> publicare.

## Cine este clientul
Proprietar de BMW din zona Târgu-Jiu / Gorj care caută un atelier de încredere,
mai personal și mai apropiat decât un dealer, dar cu pricepere reală pe marca
BMW (diagnoză dedicată, codări, lucrări specifice). Vine de obicei de pe telefon,
adesea cu o problemă concretă („mi-a apărut un martor”, „trebuie distribuția”).

## Ce vinde site-ul
Încredere + un contact ușor. Nu există programare online; **conversia = un apel
telefonic** (CTA principal), cu WhatsApp și un formular de cerere de ofertă ca
alternative. Succesul = un client care sună sau scrie.

## Principii
- **Telefonul e la un tap distanță.** Butonul „Sună acum” domină fiecare ecran;
  pe mobil există o bară fixă jos (Sună / WhatsApp).
- **Specialist, nu generalist.** Tot conținutul respiră „oameni de BMW”:
  terminologie corectă, lucrări specifice (VANOS, distribuție N47, codări).
- **Afacere de familie.** Ton cald, personal, transparent — opusul unui dealer
  rece. Devize clare, fără surprize, garanție scrisă.
- **Independent, nu dealer.** Fără logo BMW (roundel); disclaimer clar de
  neafiliere cu BMW AG. „BMW”/„M” folosite doar nominativ (vezi LEGAL.md).
- **Onestitate.** Fără recenzii inventate (vezi `testimonials.ts`), fără prețuri
  care induc în eroare — prețul final după diagnoză.

## Scope servicii (mechanics-focused)
Diagnoză & codări · revizii/ulei · distribuție/lanț · frânare · suspensie &
direcție · ambreiaj/cutie · răcire & VANOS · electrică · climatizare (AC) ·
pre-ITP. **Fără** vulcanizare/anvelope și **fără** tinichigerie/vopsitorie.

## Secțiuni (one-page)
Hero → bandă de încredere (RAR, garanție, devize, specialiști BMW) → Servicii →
De ce noi → Procesul în 5 pași → Despre (familia) → Galerie → (Testimoniale —
ascuns până există reale) → Întrebări frecvente → Contact (hartă + program +
formular) → Footer (identificare firmă + SAL + disclaimer BMW).

## De completat de proprietar înainte de publicare
`src/content/site.local.ts`: denumire, CUI, Reg. Com., capital, **autorizație
RAR**, telefon/WhatsApp, adresă, email, geo, social. Foto reale în
`public/images/real/`. Endpoint Formspree real + DPA semnat (vezi LEGAL.md).
