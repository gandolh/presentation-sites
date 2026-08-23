/**
 * WhatsApp bot — inbound intent detection (pure, side-effect-free).
 * Phase 2 · Agent A. Maps an RO message to a menu intent so the handler can
 * pick the right on-brand reply. Diacritic- and case-insensitive.
 */

/** What the user seems to want. `unknown` -> fallback reply (always offers a human). */
export type Intent =
  | "stop"
  | "start"
  | "services"
  | "prices"
  | "booking"
  | "location"
  | "greeting"
  | "unknown";

/** Lowercase + strip RO diacritics so "Programări" matches "programari". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining marks (ă/â/î/ș/ț -> a/a/i/s/t)
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .trim();
}

/** Opt-out keywords (RO + the universal STOP). */
const STOP_WORDS = ["stop", "nu", "dezabonare", "renunt", "renunta"];
/** Re-subscribe keywords. */
const START_WORDS = ["start", "da", "abonare", "revin"];

/**
 * Detect intent from raw inbound text. Numeric menu choices (1-4) and keywords
 * both work. STOP takes priority so an opt-out is never misread as a booking.
 */
export function detectIntent(rawText: string): Intent {
  const t = normalize(rawText);
  if (t.length === 0) return "greeting";

  // Whole-word match so "nuante" doesn't trigger the "nu" opt-out.
  const words = t.split(/[^a-z0-9]+/).filter(Boolean);
  const hasWord = (list: string[]) => words.some((w) => list.includes(w));

  if (hasWord(STOP_WORDS)) return "stop";
  if (hasWord(START_WORDS)) return "start";

  if (t === "1" || /\bservic/.test(t)) return "services";
  if (t === "2" || /\bpret/.test(t) || /\btarif/.test(t) || /\bcost/.test(t)) return "prices";
  if (t === "3" || /\bprogram(are|ari)?\b/.test(t) || /\brezerv/.test(t)) return "booking";
  if (t === "4" || /\blocat/.test(t) || /\badres/.test(t) || /\bunde\b/.test(t) || /\bharta/.test(t))
    return "location";

  if (/\bbun[aă]?\b/.test(t) || /\bsalut\b/.test(t) || /\bbuna ziua\b/.test(t)) return "greeting";

  return "unknown";
}

/** True if `text` is an opt-out request. Convenience wrapper used by the handler. */
export function isStop(text: string): boolean {
  return detectIntent(text) === "stop";
}
