/**
 * Campaign presets — Phase 2 · Agent D.
 *
 * Each preset is a *recipe* the bot fills into a PAUSED `CampaignDraft`. Presets
 * carry the REQUESTED daily budget; the budget guard (see ./budget.ts) clamps it
 * to the configured ceiling before a draft is ever built — so a preset can never
 * smuggle in more spend than `config.budget` allows.
 *
 * COMPLIANCE: RO ad copy (#13), Meta Marketing API objectives only, prepared
 * PAUSED for human approval (#6). No real targeting params here — those are
 * filled at real-impl time (see `// TODO(impl):` in ./index.ts).
 *
 * Plan: ../../../campaigns/todo.md   Rules: ../../../COMPLIANCE.md
 */

import type { CampaignObjective } from "../../core/index.ts";

/** The salon runs one chair in Târgu-Jiu — geo + city are fixed per brand. */
export const SALON_CITY = "Târgu-Jiu";
/** A small radius keeps lead ads local to a one-chair salon. */
export const SALON_GEO_RADIUS_KM = 15;
export const SALON_MIN_AGE = 18;

/**
 * A preset recipe. `requestedDailyMinor` is the *ask*; the budget guard clamps
 * it to `config.budget.dailyMinor`. `leadGen` marks presets that the capacity
 * guardrail (auto-pause when the calendar is full) applies to.
 */
export interface CampaignPreset {
  /** Stable key, also used as the draft's `presetKey` + audit handle. */
  key: string;
  platform: "meta" | "tiktok";
  objective: CampaignObjective;
  /** Requested daily budget in bani (RON minor units) — may exceed the cap. */
  requestedDailyMinor: number;
  /** Reference to the creative asset the real impl resolves (e.g. top reel). */
  creativeRef: string;
  /** Romanian ad copy, on-voice (warm, blush/cream/gold) — never a chatbot. */
  copyRo: string;
  /** True => spends on getting bookings => subject to the capacity guardrail. */
  leadGen: boolean;
}

/**
 * The recurring presets the bot can prepare (see campaigns/todo.md §scope).
 * Budgets here are deliberately conservative; anything above the config ceiling
 * is clamped, and the over-cap case is exercised in the tests.
 *
 * TODO(impl): real audience targeting, creative resolution (pick top organic
 * post for the reel boost), and a deep link to Ads Manager belong in the real
 * MarketingClient wiring — these recipes only carry the human-facing intent.
 */
export const PRESETS: readonly CampaignPreset[] = [
  {
    key: "boost-best-reel",
    platform: "meta",
    objective: "OUTCOME_ENGAGEMENT",
    requestedDailyMinor: 3000, // 30.00 RON/zi
    creativeRef: "organic:top-reel-this-week",
    copyRo:
      "Cele mai iubite manichiuri de la Ana Saloon, Târgu-Jiu. " +
      "Vezi clipul săptămânii și inspiră-te pentru următoarea ta programare. " +
      "Scrie-ne pe WhatsApp pentru detalii.",
    leadGen: false,
  },
  {
    key: "click-to-whatsapp",
    platform: "meta",
    objective: "OUTCOME_LEADS",
    requestedDailyMinor: 4000, // 40.00 RON/zi
    creativeRef: "static:booking-card-ro",
    copyRo:
      "Vrei unghii care vorbesc despre tine? La Ana Saloon, în Târgu-Jiu, " +
      "te așteptăm cu drag. Apasă pe buton și scrie-ne pe WhatsApp ca să-ți " +
      "găsim împreună ora potrivită.",
    leadGen: true,
  },
];

/** Find a preset by key (used by tests + manual ops). */
export function getPreset(key: string): CampaignPreset | undefined {
  return PRESETS.find((p) => p.key === key);
}
