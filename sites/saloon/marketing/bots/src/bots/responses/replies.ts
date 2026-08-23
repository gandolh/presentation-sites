/**
 * Responses bot — RO copy, keyword map, ice-breaker menu, hours + away logic.
 * Phase 2 · Agent B. INBOUND-ONLY support data; no engagement, no outbound.
 *
 * Brand voice: warm, on-brand (blush/cream/gold), never a robotic chatbot, and
 * every path offers a route to a real human (Ana) + the single WhatsApp booking
 * path (COMPLIANCE #13/#14). RO-only strings.
 */

/**
 * Single booking path = the salon's WhatsApp link. Sourced from the
 * `SALON_WHATSAPP_E164` env var (same value as `config.salonWhatsAppE164` and
 * the site's `site.whatsappE164`), falling back to the placeholder. Read at
 * module load so the deployed service uses the real number without touching the
 * reply copy; the default keeps tests deterministic. E.164 without '+'.
 */
export const WHATSAPP_E164 =
  (typeof process !== "undefined" ? process.env.SALON_WHATSAPP_E164 : undefined) ?? "40700000000";

/** The one booking CTA every path funnels to (single booking path). */
export const WHATSAPP_BOOKING_URL = `https://wa.me/${WHATSAPP_E164}`;

/** Keyword intents the FAQ map recognises. */
export type ReplyIntent =
  | "greeting"
  | "servicii"
  | "preturi"
  | "programare"
  | "locatie"
  | "program"
  | "stop"
  | "fallback";

/**
 * Salon hours, in Europe/Bucharest, mirrored from the site (`site.hours`).
 * Key: 0 = Sunday … 6 = Saturday (JS getDay convention).
 * `open`/`close` are minutes-since-midnight; `null` days are closed.
 */
interface DayHours {
  open: number;
  close: number;
}
const hm = (h: number, m = 0) => h * 60 + m;
const HOURS: Record<number, DayHours | null> = {
  0: null, // Duminică — Închis
  1: { open: hm(9), close: hm(19) }, // Luni
  2: { open: hm(9), close: hm(19) }, // Marți
  3: { open: hm(9), close: hm(19) }, // Miercuri
  4: { open: hm(9), close: hm(19) }, // Joi
  5: { open: hm(9), close: hm(19) }, // Vineri
  6: { open: hm(10), close: hm(16) }, // Sâmbătă
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Is the salon open at `timestampMs` (Europe/Bucharest)?
 *
 * Romania is UTC+2 (EET) / UTC+3 (EEST) with DST. We resolve the local weekday
 * + minutes via Intl with the IANA zone, so DST is handled correctly without a
 * date library.
 */
export function isWithinBusinessHours(timestampMs: number): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestampMs));

  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  const weekdayName = get("weekday") ?? "";
  const hour = Number(get("hour") ?? "0");
  const minute = Number(get("minute") ?? "0");

  const day = WEEKDAY_INDEX[weekdayName];
  if (day === undefined) return false;

  const window = HOURS[day];
  if (!window) return false;
  const mins = hm(hour, minute);
  return mins >= window.open && mins < window.close;
}

/** Strip RO diacritics + lowercase so "Prețuri" and "preturi" both match. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ăâ]/g, "a")
    .replace(/î/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // any remaining combining marks
    .trim();
}

/**
 * STOP / opt-out detection. Matches the universal STOP keyword plus common RO
 * equivalents. Whole-word match so "stopping by" style text doesn't trip it.
 */
const STOP_WORDS = ["stop", "dezabonare", "renunt", "renunta", "nu ma mai contacta"];
export function isStopKeyword(text: string): boolean {
  const n = normalize(text);
  return STOP_WORDS.some((w) => n === w || new RegExp(`\\b${w}\\b`).test(n));
}

/**
 * Map free-text / quick-reply payload to an intent. Quick-reply taps arrive as
 * the payload string (e.g. "PROGRAMARE"); typed text is keyword-matched.
 */
const INTENT_KEYWORDS: { intent: ReplyIntent; words: string[] }[] = [
  { intent: "programare", words: ["programare", "programari", "rezervare", "rezerva", "booking", "vreau o programare"] },
  { intent: "preturi", words: ["pret", "preturi", "tarif", "tarife", "cat costa", "costa"] },
  { intent: "servicii", words: ["servicii", "serviciu", "ce faceti", "ce oferiti", "gel", "manichiura", "nail art"] },
  { intent: "locatie", words: ["locatie", "adresa", "unde sunteti", "unde va aflati", "harta"] },
  { intent: "program", words: ["program", "orar", "ore", "deschis", "inchis", "cand sunteti"] },
];

const GREETINGS = ["salut", "buna", "hello", "hey", "noroc", "buna ziua", "neata"];

export function detectIntent(rawText: string): ReplyIntent {
  const text = rawText.trim();
  if (!text) return "greeting";
  if (isStopKeyword(text)) return "stop";

  const payload = normalize(text);

  // Exact quick-reply payloads first (deterministic taps).
  const byPayload: Record<string, ReplyIntent> = {
    servicii: "servicii",
    preturi: "preturi",
    programare: "programare",
    locatie: "locatie",
    program: "program",
  };
  const tapped = byPayload[payload];
  if (tapped) return tapped;

  for (const { intent, words } of INTENT_KEYWORDS) {
    if (words.some((w) => payload.includes(normalize(w)))) return intent;
  }

  if (GREETINGS.some((g) => payload.includes(normalize(g)))) return "greeting";

  return "fallback";
}

const HUMAN_HANDOFF = "Dacă vrei să vorbești direct cu Ana, scrie-ne aici și revenim cu drag.";

/** Static RO replies per intent. Booking-routing replies append the WA link. */
const REPLIES: Record<Exclude<ReplyIntent, "stop">, string> = {
  greeting:
    "Bună și bine ai venit la Ana Saloon! 💅 Spune-mi cu ce te pot ajuta: " +
    "Servicii, Prețuri, Programare sau Locație. " +
    `Pentru o programare, scrie-mi pe WhatsApp: ${WHATSAPP_BOOKING_URL}`,
  servicii:
    "La Ana Saloon te răsfățăm cu: manichiură semipermanentă, construcție gel " +
    "și nail art — totul îngrijit, cu produse de calitate. " +
    `Vrei o programare? Hai pe WhatsApp: ${WHATSAPP_BOOKING_URL}`,
  preturi:
    "Prețurile diferă în funcție de serviciu și model. Îți pregătesc cu drag o " +
    "ofertă potrivită pentru tine — spune-mi ce îți dorești. " +
    `Pentru detalii și programare: ${WHATSAPP_BOOKING_URL}`,
  programare:
    "Ce bine, abia aștept să te văd! ✨ Programările le facem rapid pe WhatsApp, " +
    `într-un singur loc: ${WHATSAPP_BOOKING_URL} — îți confirm slotul acolo.`,
  locatie:
    "Ne găsești în Târgu-Jiu, Gorj. Îți trimit harta și detaliile exacte pe " +
    `WhatsApp când stabilim programarea: ${WHATSAPP_BOOKING_URL}`,
  program:
    "Program: Luni–Vineri 09:00–19:00, Sâmbătă 10:00–16:00, Duminică închis. " +
    `Pentru un slot liber, scrie-mi pe WhatsApp: ${WHATSAPP_BOOKING_URL}`,
  fallback:
    "Mulțumesc pentru mesaj! Te pot ajuta cu Servicii, Prețuri, Programare sau " +
    `Locație. ${HUMAN_HANDOFF} Pentru programare: ${WHATSAPP_BOOKING_URL}`,
};

/**
 * Away message for messages received outside business hours. Points to the site
 * info + the WhatsApp path so the lead never hits a dead end (COMPLIANCE #14).
 */
export const AWAY_MESSAGE =
  "Mulțumesc pentru mesaj! 🌙 Acum suntem în afara programului " +
  "(Luni–Vineri 09:00–19:00, Sâmbătă 10:00–16:00). Îți răspundem de îndată ce " +
  `deschidem. Între timp, poți lăsa o programare pe WhatsApp: ${WHATSAPP_BOOKING_URL}`;

/** Confirmation we acknowledge a STOP request (last message before going silent). */
export const STOP_ACK =
  "Am notat — nu îți mai trimitem mesaje automate. Dacă vrei o programare " +
  `oricând, suntem aici pe WhatsApp: ${WHATSAPP_BOOKING_URL}. O zi frumoasă! 🤍`;

/** Resolve the on-brand reply text for an intent (away message handled by caller). */
export function replyFor(intent: ReplyIntent): string {
  if (intent === "stop") return STOP_ACK;
  return REPLIES[intent];
}

/**
 * Ice-breaker / quick-reply MENU — configured as a reply menu only (for people
 * who already opened a chat), NOT an outbound growth tactic (todo.md note,
 * COMPLIANCE #2/#3). RO-only, on-brand. `payload` is what comes back as the
 * inbound text when a user taps the chip; it maps 1:1 to an intent.
 */
export const ICE_BREAKERS: { question: string; payload: string }[] = [
  { question: "Ce servicii oferiți?", payload: "SERVICII" },
  { question: "Care sunt prețurile?", payload: "PRETURI" },
  { question: "Vreau o programare", payload: "PROGRAMARE" },
  { question: "Unde vă găsesc?", payload: "LOCATIE" },
];
