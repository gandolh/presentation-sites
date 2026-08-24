# STATUS — BavAuto Gorj

_Actualizat: 23 august 2026_

## Făcut
- [x] Scaffold Astro + React + Tailwind v4 (mirror după `saloon`).
- [x] Data pattern: `site.ts` defaults + `site.local.ts` (git-ignored) deep-merge + `site.local.example.ts`.
- [x] Helpers: `url.ts` (`withBase`), `images.ts` (`img()` mock/real).
- [x] Conținut: `services.ts` (BMW, mechanics-focused), `faq.ts`. `testimonials.ts` și `gallery.ts` au fost **eliminate** la rebrand (vezi mai jos).
- [x] Docs: brief, LEGAL, MARKETING, STATUS, todo/.
- [x] Audit legal (LEGAL.md) — SAL link actualizat la `reclamatiisal.anpc.ro` (Ordin 270/2026), disclaimer independență BMW, garanție.

## Făcut (continuare)
- [x] Sistem vizual (albastru entuziast + dunga M, Archivo + Hanken Grotesk) în `global.css` (OKLCH). Fonturi auto-găzduite.
- [x] `Base.astro` (SEO + JSON-LD `AutoRepair` + reveal failsafe) + `LegalLayout.astro`.
- [x] Componente: Nav, MobileMenu, Hero, TrustBand, Services, WhyUs, Process, About, Faq (+FAQPage JSON-LD), MapConsent (hartă cu consimțământ), Contact, MobileCallBar, Footer. + `index.astro`.
- [x] Pagini legale: `/confidentialitate/`, `/cookie-uri/`, `/termeni/`.
- [x] Deploy: `deploy.ts`, `Caddyfile.example`, `.env.example`, README (sub-path `/auto-service`).
- [x] Placeholders SVG (graphite + dunga M) + favicon + og-image.
- [x] Verificat: build mock OK, build `PUBLIC_BASE=/auto-service` OK (linkuri/asset-uri prefixate corect), `astro check` curat pe codul aplicației (erorile rămase sunt doar în `deploy.ts`/`astro.config.mjs` — `process`/`Buffer` fără `@types/node`, la fel ca în `saloon`). Verificat vizual (desktop + mobil): hartă NU încarcă Google până la click, zero cereri Google Fonts, diacritice corecte.

## Versiuni
Dependențe fixate exact (fără `^`). `vite` fixat la `7.3.3` (+ `overrides`): astro 6.4.4 trăgea vite 8/rolldown, incompatibil cu `@tailwindcss/vite` 4.3.0 → fixat astro `6.4.2` + vite `7.3.3`.

## De completat de proprietar (vezi brief.md / LEGAL.md)
Date reale firmă + RAR în `site.local.ts`, foto reale în `public/images/real/`,
endpoint Formspree + DPA.

## Rebrand „Bordcomputer" (23 august 2026)

Rework total de UI/UX, cu ideea de business neschimbată. Lumea vizuală veche
(„Pit Wall / Garage Floor" — albastru + dunga M pe gri-grafit) a fost
**înlocuită**, nu ajustată.

- **Lumea:** pagina *este* bordul mașinii, noaptea. Fond grafit aproape negru,
  trepte de oțel, legende argintii imprimate, **o singură iluminare chihlimbar
  care aprinde doar ce e viu acum**, tricolorul M ca segmente LED codate, și o
  singură suprafață deschisă: banda de aluminiu șlefuit a bordului (Contact +
  paginile legale). Regulile poartă nume și sunt scrise în `global.css`.
- **Fonturi:** Archivo pe axa de **lățime** (legende ștanțate), Hanken Grotesk
  pentru text, **Azeret Mono** pentru citiri (numere, coduri, program, telefon).
  Toate auto-găzduite, latin-ext pentru diacritice.
- **Componente noi:** `Gauge.astro` (ceasul, SVG randat pe server),
  `BayScene.astro` (elevația desenată a atelierului), `Icon.astro` (**un
  singur set închis** de pictograme, 1.75px, singura iconografie de pe site).
- **Mișcare:** `animejs` v4 — un singur moment: **baleiajul de contact** la
  încărcare (acele mătură scala și revin). Totul e lizibil înainte de JS;
  suprimat sub `prefers-reduced-motion`.
- **Fără fotografie.** Proprietarul a confirmat că nu vin poze reale, deci
  galeria foto a fost **ștearsă** (nu umplută cu stoc) și atelierul e **desenat**.
  `images.ts` are `hasReal: []`; dacă apar poze, se adaugă numele logice înapoi.
- **Testimoniale** eliminate: componentă goală ascunsă = cod mort.
- `og-image.svg` și `favicon.svg` regenerate în lumea nouă
  (`node scripts/gen-placeholders.mjs`); placeholderele hero/galerie, șterse.
- Verificat: build mock + `PUBLIC_BASE=/auto-service`, `astro check` curat,
  zero overflow orizontal la 390px, fără cereri Google până la consimțământ.
