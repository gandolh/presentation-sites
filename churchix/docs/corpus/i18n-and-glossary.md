---
title: i18n, diacritics & domain glossary
summary: Mandatory languages, Romanian diacritic rules, and the domain vocabulary the platform must handle.
status: stable
updated: 2026-05-29
related: [content-model, traditions, design-system]
---

# i18n, diacritics & domain glossary

i18n is **mandatory, not optional**, and Romanian diacritics must work end-to-end. These rules bind every component and content surface.

## Languages

- **RO + EN minimum.** Add **IT / ES / DE** for diaspora regions (Italy, Spain, Germany). Romania-based parishes are often RO-only; diaspora is bilingual (RO + host language).
- **Launch set:** RO + EN, adding IT/ES/DE per region (see [decisions](decisions.md) Q9; i18n ownership — platform base + per-church overrides — is still open, currently per-church content).

## Two nuances that trip people up

1. **Liturgical/theological terms stay in Romanian even inside English pages** — e.g. an EN nav item may still read "Slujbele religioase". Don't force-translate domain vocabulary. This is expected, not a bug.
2. **Full Romanian diacritics (ă, â, î, ș, ț) must work everywhere:** UTF-8 storage, web fonts, URL slugs, search, and generated PDFs/receipts. Validate end-to-end — the chosen fonts (Source Serif 4 + Inter) must cover Latin Extended-A; German umlauts too. See the fonts work item [docs/todo/04-icons-fonts.md](../todo/04-icons-fonts.md) and the a11y/i18n pass [docs/todo/15-a11y-i18n-pass.md](../todo/15-a11y-i18n-pass.md).

Layouts must also **survive long strings** — DE and RO are verbose; nothing should clip.

## Domain glossary (i18n + search must handle)

| Term | Meaning |
| --- | --- |
| Slujbă / Slujbe | (Church) service(s) |
| Sfânta Liturghie | The Divine Liturgy (Orthodox) |
| Vecernie / Utrenie | Vespers / Matins |
| Predică / Predici | Sermon(s) |
| Anunțuri | Announcements |
| Pomelnic / Pomelnice | List(s) of names submitted for prayer |
| Parastas | Memorial service for the departed |
| Botez / Cununie / Spovedanie | Baptism / Wedding (crowning) / Confession |
| Hram | Patron-saint feast of a parish |
| Preot paroh | Parish priest |
| Donează / Donații | Donate / Donations |
| Zeciuială / Zecime | Tithe (Pentecostal-Baptist / Adventist) — don't conflate |
| Dar / Jertfă | Freewill offering / sacrificial gift |
| Misiune | Mission(s) |
| Fond construcție | Building fund |
| Mărturisire de credință | Statement of faith |
| Mărturii | Testimonies |
| Formular 230 | Tax form to redirect 3.5% of income tax to a church/NGO — see [donations](donations.md) |

The tithe terminology splits by tradition (see [traditions](traditions.md)): `zeciuială` (Pentecostal/Baptist), `zecime` (Adventist), vs `dar` / `jertfă` / `donații` (freewill).
