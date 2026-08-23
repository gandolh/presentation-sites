/**
 * Typed env/config loader + kill-switches + budget caps — FROZEN (Phase 1).
 *
 * Defines EVERY secret and flag the service uses. Mirror any change here into
 * .env.example. Throws on a missing REQUIRED secret at boot (fail fast).
 *
 * COMPLIANCE: per-bot kill-switches (#13/#5), spend kill-switch + budget
 * ceilings (#6-#8), EU region + retention windows (#9-#11).
 */

import type { BotName } from "./types.ts";
import type { LogLevel } from "./logger.ts";

export interface RetentionConfig {
  /** Days after last appointment before client data is purged. */
  appointmentDays: number;
  /** Days to keep an enquiry that never converted. */
  enquiryDays: number;
}

export interface BudgetCaps {
  /** Hard ceiling per campaign per day, in bani (RON minor units). */
  dailyMinor: number;
  /** Hard ceiling for a campaign's lifetime budget, in bani. */
  lifetimeMinor: number;
}

export interface Config {
  /** Mock mode: no real API calls. The scaffold ALWAYS runs in mock mode. */
  mockMode: boolean;
  logLevel: LogLevel;
  /** HTTP port for the webhook server. */
  port: number;
  /** Public base path behind nginx/Caddy (e.g. "/bots"). */
  basePath: string;

  /** Per-bot kill-switches. A disabled bot registers nothing. */
  enabled: Record<BotName, boolean>;
  /** Master spend kill-switch: false => campaign bot prepares nothing live. */
  adsSpendEnabled: boolean;

  budget: BudgetCaps;
  retention: RetentionConfig;

  /** SQLite file path on the VPS. */
  dbPath: string;

  /** Salon WhatsApp number (E.164 without '+'), the single booking path. */
  salonWhatsAppE164: string;

  /**
   * Minimum gap between two post publishes in one run (ms) — human-spaced
   * cadence (COMPLIANCE #5). Defaults to 0 in mock mode so tests run instantly;
   * a real value (e.g. 90000) is used in production via env.
   */
  publishSpacingMs: number;

  /** Secrets — only required when mockMode is false. */
  secrets: {
    metaAppSecret: string | undefined;
    metaVerifyToken: string | undefined;
    whatsappToken: string | undefined;
    whatsappPhoneNumberId: string | undefined;
    igPageToken: string | undefined;
    fbPageId: string | undefined;
    adsAccessToken: string | undefined;
    adsAccountId: string | undefined;
    tiktokAccessToken: string | undefined;
    /** Where human-approval notifications go (campaign drafts). */
    notifyTo: string | undefined;
  };
}

function bool(v: string | undefined, dflt: boolean): boolean {
  if (v === undefined) return dflt;
  return v === "1" || v.toLowerCase() === "true";
}

function int(v: string | undefined, dflt: number): number {
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) ? n : dflt;
}

/**
 * Load config from `env` (defaults to process.env). In mock mode no secret is
 * required; outside mock mode, required secrets are validated by
 * `assertSecretsForLive()` which the real-impl wiring (later) calls.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    mockMode: bool(env.BOTS_MOCK_MODE, true),
    logLevel: (env.LOG_LEVEL as LogLevel) ?? "info",
    port: int(env.PORT, 8787),
    basePath: env.BASE_PATH ?? "/bots",

    enabled: {
      whatsapp: bool(env.BOT_WHATSAPP_ENABLED, false),
      responses: bool(env.BOT_RESPONSES_ENABLED, false),
      scheduler: bool(env.BOT_SCHEDULER_ENABLED, false),
      campaigns: bool(env.BOT_CAMPAIGNS_ENABLED, false),
    },
    adsSpendEnabled: bool(env.ADS_SPEND_ENABLED, false),

    budget: {
      dailyMinor: int(env.ADS_DAILY_CAP_MINOR, 5000), // 50.00 RON
      lifetimeMinor: int(env.ADS_LIFETIME_CAP_MINOR, 150000), // 1500.00 RON
    },
    retention: {
      appointmentDays: int(env.RETENTION_APPOINTMENT_DAYS, 365),
      enquiryDays: int(env.RETENTION_ENQUIRY_DAYS, 30),
    },

    dbPath: env.DB_PATH ?? "./data/bots.sqlite",

    // Mirrors the site's whatsappE164; placeholder until the owner provides it.
    salonWhatsAppE164: env.SALON_WHATSAPP_E164 ?? "40700000000",

    // 0 in mock mode (instant tests); 90s default live. Override via env.
    publishSpacingMs: int(env.PUBLISH_SPACING_MS, bool(env.BOTS_MOCK_MODE, true) ? 0 : 90_000),

    secrets: {
      metaAppSecret: env.META_APP_SECRET,
      metaVerifyToken: env.META_VERIFY_TOKEN,
      whatsappToken: env.WHATSAPP_TOKEN,
      whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      igPageToken: env.IG_PAGE_TOKEN,
      fbPageId: env.FB_PAGE_ID,
      adsAccessToken: env.ADS_ACCESS_TOKEN,
      adsAccountId: env.ADS_ACCOUNT_ID,
      tiktokAccessToken: env.TIKTOK_ACCESS_TOKEN,
      notifyTo: env.NOTIFY_TO,
    },
  };
}

/**
 * Validate that secrets needed for live (non-mock) operation are present.
 * Called by the real-API wiring task (Phase: post-scaffold), NOT in mock mode.
 */
export function assertSecretsForLive(config: Config): void {
  if (config.mockMode) return;
  const required: (keyof Config["secrets"])[] = [
    "metaAppSecret",
    "metaVerifyToken",
  ];
  const missing = required.filter((k) => !config.secrets[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required secrets for live mode: ${missing.join(", ")}`);
  }
}
