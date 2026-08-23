---
title: Traditions — Orthodox vs evangelical
summary: The two Romanian church markets, how they converge and diverge, and what each needs.
status: stable
updated: 2026-05-29
related: [content-model, donations, design-system, overview]
---

# Two traditions, one platform

Churchix must serve **both** Romanian church markets. They converge on schedule / livestream / announcements and diverge on tone and giving maturity. **v1 is designed for Orthodox** (see [decisions](decisions.md) Q1); evangelical support is *designed-for*, not *delivered*, in v1.

| | Orthodox / Greek-Catholic | Protestant / Evangelical (Pentecostal, Baptist, Adventist) |
| --- | --- | --- |
| Tone | Formal, reverent, liturgical; Byzantine icons; gold/cream/burgundy | Warm, community-oriented, Scripture-heavy; dove/light motifs |
| Hierarchy | Foregrounded (Patriarch → Bishop → preot paroh → council) | Pastor(s) + lay leadership; statement of faith prominent |
| Giving maturity | Low — IBAN + cash baseline; often **no** online card giving | High — card giving is a first-class nav item |
| Signature features | **Pomelnice**, Orthodox calendar, sacrament arrangement | Ministries/small groups, prayer + testimony, weekly bulletin, reading plans |
| Capital campaigns | Rare/manual | Common need, but tooling is a market gap |

## Orthodox / Greek-Catholic add-ons

- **Pomelnice** — submit names of the living (`pomelnic de vii`) and departed (`pentru cei adormiți`) for prayer, usually with a small offering. First-class feature; no Protestant analog. See [donations](donations.md) and the form work item in [docs/todo/12-pomelnic-form.md](../todo/12-pomelnic-form.md).
- **Orthodox calendar** — saint of the day + fasting rules.
- **Sacrament arrangement** info — Botez, Cununie, Parastas, Spovedanie.
- **IBAN-first giving** — RON/EUR/USD accounts displayed; cash in person.

## Protestant / evangelical add-ons

- **Statement of faith** (`Mărturisire de credință`) — prominent, unlike Western norms.
- **Ministries / small groups** directory (Școala Duminicală, Awana, Tineret).
- **Prayer requests + testimonies** (`Mărturii`) forms.
- **Weekly bulletin** (`Buletin duminical`), **daily Bible reading plans**.
- **Card giving** as a primary nav item; designated funds routine (building, missions, humanitarian).
- (Diaspora) baby-dedication / baptism registration.

## Design implication

The design system ([design-system](design-system.md)) treats **tradition as a theme variant, not a fork**: v1 ships the Orthodox look (burgundy/gold/cream, serif headings, Byzantine restraint); the same components accept an evangelical variant later purely by swapping tokens + a `tradition` flag — no new components. The `tradition` field is on `siteSchema` ([packages/schemas/src/index.ts](../../packages/schemas/src/index.ts)).

The terminology each tradition uses (tithe vocabulary, service names) is governed by [i18n-and-glossary](i18n-and-glossary.md) — don't conflate `zeciuială` / `zecime` / `dar` / `jertfă`.
