/**
 * WhatsApp bot — RO-only user-facing copy + template definitions.
 * Phase 2 · Agent A. On-brand for Ana Saloon (warm, blush/cream/gold tone),
 * salon de manichiură în Târgu-Jiu. NO English in anything a client sees.
 *
 * Template names mirror marketing/bots/whatsapp/todo.md:
 *  - confirmare_programare (utility, art. 6(1)(b) contract)
 *  - reminder_programare    (utility, art. 6(1)(b) contract)
 *  - multumire_recenzie     (marketing, opt-in only — art. 6(1)(a))
 */

import type { ServiceKind } from "../../core/index.ts";

/** WhatsApp Cloud API message-template categories. */
export type TemplateCategory = "utility" | "marketing";

/** Names of the approved templates this bot can send. Frozen to the todo list. */
export const TEMPLATES = {
  /** Sent after Ana confirms a slot. Contract basis — no marketing consent needed. */
  confirmation: "confirmare_programare",
  /** Sent before the appointment. Contract basis — no marketing consent needed. */
  reminder: "reminder_programare",
  /** Post-visit thank-you + review nudge. MARKETING — opt-in required. */
  review: "multumire_recenzie",
} as const;

export type TemplateName = (typeof TEMPLATES)[keyof typeof TEMPLATES];

/** GDPR category per template, so callers gate marketing ones on opt-in. */
export const TEMPLATE_CATEGORY: Record<TemplateName, TemplateCategory> = {
  [TEMPLATES.confirmation]: "utility",
  [TEMPLATES.reminder]: "utility",
  [TEMPLATES.review]: "marketing",
};

/** Human-readable RO names for the 3 site services, keyed by domain `ServiceKind`. */
export const SERVICE_LABELS: Record<ServiceKind, string> = {
  manichiura_semipermanenta: "Manichiură semipermanentă",
  gel_constructie: "Unghii cu gel (construcție)",
  nail_art: "Nail Art",
};

/**
 * Body copy used to seed WhatsApp template approval, with {{n}} placeholders in
 * the order params are supplied. The real Cloud API only needs the template
 * NAME + ordered params; this keeps the approved RO text next to the code.
 */
export const TEMPLATE_BODIES: Record<TemplateName, string> = {
  // params: { nume, data, ora, serviciu }
  [TEMPLATES.confirmation]:
    "Bună, {{nume}}! 💅 Programarea ta la Ana Saloon pentru {{serviciu}} " +
    "pe {{data}} la ora {{ora}} este confirmată. Te așteptăm cu drag! " +
    "Dacă vrei să schimbi ceva, scrie-ne aici.",
  // params: { nume, ora }
  [TEMPLATES.reminder]:
    "Bună, {{nume}}! Îți reamintim cu drag că mâine te așteptăm la Ana Saloon " +
    "la ora {{ora}}. 💖 Dacă nu mai poți ajunge, anunță-ne aici, te rugăm.",
  // params: { nume, link }
  [TEMPLATES.review]:
    "Mulțumim că ai trecut pe la Ana Saloon, {{nume}}! 🌸 Sperăm că ți-au " +
    "plăcut unghiile noi. Dacă ai un minut, ne-ai bucura enorm cu o părere: " +
    "{{link}} . Te așteptăm și data viitoare!",
};

/** The opening greeting + menu sent inside the 24h window on a first message. */
export function greeting(): string {
  return [
    "Bună și bine ai venit la Ana Saloon! 💅",
    "",
    "Suntem salonul tău de manichiură din Târgu-Jiu. Cu ce te putem ajuta?",
    "",
    "1️⃣ Servicii",
    "2️⃣ Prețuri",
    "3️⃣ Programare",
    "4️⃣ Locație & program",
    "",
    "Scrie cuvântul (de ex. „Programare”) sau cifra. Oricând poți vorbi direct cu Ana. 🌸",
  ].join("\n");
}

/** Servicii — the 3 services from the site, on-brand. */
export function servicesReply(): string {
  return [
    "Iată ce îți pregătim cu drag la Ana Saloon: 💖",
    "",
    "• Manichiură (clasică & semipermanentă) — îngrijită, rezistentă până la 3 săptămâni.",
    "• Unghii cu gel — construcție pe tipsuri sau șablon, aspect impecabil.",
    "• Nail Art — French, babyboomer, ombre, pictură manuală, adaptate stilului tău.",
    "",
    "Vrei să te programezi? Scrie „Programare”. 🌸",
  ].join("\n");
}

/** Prețuri — kept in sync with src/content/services.ts. */
export function pricesReply(): string {
  return [
    "Prețurile noastre orientative: 🌸",
    "",
    "• Manichiură — de la 80 lei",
    "• Unghii cu gel — de la 150 lei",
    "• Nail Art — de la 20 lei / unghie",
    "",
    "Prețul final depinde de design și lungime. Spune-ne ce îți dorești și îți zicem exact. 💅",
  ].join("\n");
}

/** Programare — collect day/time, then a human (Ana) confirms. */
export function bookingReply(): string {
  return [
    "Ce frumos, abia așteptăm să te răsfățăm! 💅",
    "",
    "Spune-ne, te rugăm:",
    "• ce serviciu îți dorești,",
    "• ziua și ora care ți-ar conveni.",
    "",
    "Ana verifică disponibilitatea și îți confirmă imediat aici. 🌸",
  ].join("\n");
}

/** Locație & program. */
export function locationReply(): string {
  return [
    "Ne găsești în Târgu-Jiu, județul Gorj. 📍",
    "",
    "Program:",
    "• Luni – Vineri: 09:00 – 19:00",
    "• Sâmbătă: 10:00 – 16:00",
    "• Duminică: închis",
    "",
    "Pentru adresa exactă și hartă, intră pe site-ul nostru. Te așteptăm cu drag! 💖",
  ].join("\n");
}

/** Away message outside working hours. */
export function awayReply(): string {
  return [
    "Mulțumim pentru mesaj! 🌙 Momentan suntem închiși, dar revenim cât de curând.",
    "",
    "Program: Luni–Vineri 09:00–19:00, Sâmbătă 10:00–16:00.",
    "Lasă-ne aici ziua și ora dorite, iar Ana îți răspunde de îndată ce deschidem. 💅",
  ].join("\n");
}

/** Confirmation that we've passed the request to Ana (human hand-off). */
export function handoffReply(): string {
  return "Am notat și i-am transmis Anei. Îți răspunde personal cât de repede poate. 💖";
}

/** Fallback when we don't understand — always offer a human. */
export function fallbackReply(): string {
  return [
    "Hmm, nu sunt sigură că am înțeles. 🌸",
    "",
    "Poți scrie: Servicii, Prețuri, Programare sau Locație.",
    "Sau, dacă preferi, Ana îți răspunde personal — spune-ne doar cu ce te putem ajuta.",
  ].join("\n");
}

/** Acknowledge a STOP / opt-out request, warmly. */
export function optOutReply(): string {
  return [
    "Am înțeles, nu îți mai trimitem mesaje. 🌸",
    "Dacă te răzgândești, ne poți scrie oricând „START”. Toate cele bune de la Ana Saloon! 💖",
  ].join("\n");
}
