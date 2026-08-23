# STATUS — BavAuto Gorj

_Actualizat: 5 iunie 2026_

## Făcut
- [x] Scaffold Astro + React + Tailwind v4 (mirror după `saloon`).
- [x] Data pattern: `site.ts` defaults + `site.local.ts` (git-ignored) deep-merge + `site.local.example.ts`.
- [x] Helpers: `url.ts` (`withBase`), `images.ts` (`img()` mock/real).
- [x] Conținut: `services.ts` (BMW, mechanics-focused), `faq.ts`, `testimonials.ts` (gol intenționat), `gallery.ts`.
- [x] Docs: brief, LEGAL, MARKETING, STATUS, todo/.
- [x] Audit legal (LEGAL.md) — SAL link actualizat la `reclamatiisal.anpc.ro` (Ordin 270/2026), disclaimer independență BMW, garanție.

## Făcut (continuare)
- [x] Sistem vizual (albastru entuziast + dunga M, Archivo + Hanken Grotesk) în `global.css` (OKLCH). Fonturi auto-găzduite.
- [x] `Base.astro` (SEO + JSON-LD `AutoRepair` + reveal failsafe) + `LegalLayout.astro`.
- [x] Componente: Nav, MobileMenu, Hero, TrustBand, Services, WhyUs, Process, About, Gallery, Testimonials (ascuns), Faq (+FAQPage JSON-LD), MapConsent (hartă cu consimțământ), Contact (formular ofertă GDPR), MobileCallBar, Footer. + `index.astro`.
- [x] Pagini legale: `/confidentialitate/`, `/cookie-uri/`, `/termeni/`.
- [x] Deploy: `deploy.ts`, `Caddyfile.example`, `.env.example`, README (sub-path `/auto-service`).
- [x] Placeholders SVG (graphite + dunga M) + favicon + og-image.
- [x] Verificat: build mock OK, build `PUBLIC_BASE=/auto-service` OK (linkuri/asset-uri prefixate corect), `astro check` curat pe codul aplicației (erorile rămase sunt doar în `deploy.ts`/`astro.config.mjs` — `process`/`Buffer` fără `@types/node`, la fel ca în `saloon`). Verificat vizual (desktop + mobil): hartă NU încarcă Google până la click, zero cereri Google Fonts, diacritice corecte.

## Versiuni
Dependențe fixate exact (fără `^`). `vite` fixat la `7.3.3` (+ `overrides`): astro 6.4.4 trăgea vite 8/rolldown, incompatibil cu `@tailwindcss/vite` 4.3.0 → fixat astro `6.4.2` + vite `7.3.3`.

## De completat de proprietar (vezi brief.md / LEGAL.md)
Date reale firmă + RAR în `site.local.ts`, foto reale în `public/images/real/`,
endpoint Formspree + DPA.
