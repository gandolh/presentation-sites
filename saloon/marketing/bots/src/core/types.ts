/**
 * Shared domain types — FROZEN (Phase 1).
 *
 * Phase 2 bots import from here and must NOT change these. If a bot needs a new
 * field/type, flag it for the Phase 1/3 owner — do not fork the contract.
 *
 * See marketing/bots/SCAFFOLD_PLAN.md and marketing/bots/COMPLIANCE.md.
 */

/** Every platform this service can touch. */
export type Platform = "whatsapp" | "instagram" | "facebook" | "tiktok";

/** Names of the bot modules. Used for kill-switch flags and logging. */
export type BotName =
  | "whatsapp"
  | "responses"
  | "scheduler"
  | "campaigns";

/**
 * GDPR posture (see docs/LEGAL.md). Booking flows rely on art. 6(1)(b)
 * (contract); marketing flows require explicit opt-in (art. 6(1)(a)).
 */
export type OptInStatus = "opted_in" | "opted_out" | "unknown";

/** Service offered by the salon (the 3 from the site). */
export type ServiceKind =
  | "manichiura_semipermanenta"
  | "gel_constructie"
  | "nail_art";

/** A booked or requested appointment. */
export interface Appointment {
  id: string;
  /** E.164 without '+', matching site.ts (e.g. "40700000000"). */
  phoneE164: string;
  clientName: string;
  service: ServiceKind;
  /** ISO 8601 in Europe/Bucharest. */
  startsAt: string;
  status: "requested" | "confirmed" | "cancelled" | "completed" | "no_show";
  createdAt: string;
  /** Last appointment drives the 12-month retention clock. */
  lastInteractionAt: string;
  /** ISO timestamp the reminder was sent — set for idempotency (don't resend). */
  reminderSentAt?: string;
  /** ISO timestamp the confirmation was sent — set for idempotency. */
  confirmationSentAt?: string;
}

/** A lead captured from an ad / form before it becomes an appointment. */
export interface Lead {
  id: string;
  platform: Platform;
  phoneE164?: string;
  clientName?: string;
  message?: string;
  marketingOptIn: OptInStatus;
  createdAt: string;
}

/** An inbound message from a user (user-initiated — the only thing bots react to). */
export interface InboundMessage {
  platform: Platform;
  /** Platform-scoped sender id (phone id, IGSID, PSID). */
  fromId: string;
  text: string;
  /** Epoch ms; supplied by the platform event, never generated here. */
  timestampMs: number;
  /** True while inside the platform's 24h service window. */
  withinServiceWindow: boolean;
  /** Raw provider payload, for handlers that need more than `text`. */
  raw?: unknown;
}

/** A message the service wants to send back (inbound-reply only). */
export interface OutboundMessage {
  platform: Platform;
  toId: string;
  text: string;
  /**
   * "service" = free-form reply inside 24h window.
   * "template" = pre-approved utility/marketing template (required outside window).
   */
  kind: "service" | "template";
  /** Required when kind === "template". */
  templateName?: string;
  templateParams?: Record<string, string>;
}

/** A post queued for cross-publishing. */
export interface ScheduledPost {
  id: string;
  /** Path/handle to the video asset on the VPS. */
  assetRef: string;
  captionRo: string;
  targets: Platform[];
  /** ISO 8601 publish time. */
  publishAt: string;
  status: "queued" | "publishing" | "published" | "failed";
  /** Per-platform publish results, keyed by platform. */
  results?: Partial<Record<Platform, { ok: boolean; externalId?: string; error?: string }>>;
}

/** Objective for a prepared ad campaign (subset we use). */
export type CampaignObjective = "OUTCOME_ENGAGEMENT" | "OUTCOME_LEADS" | "OUTCOME_TRAFFIC";

/**
 * A campaign the bot PREPARES. It is always created PAUSED — a human flips it
 * live (owner decision; see COMPLIANCE.md money safety).
 */
export interface CampaignDraft {
  id: string;
  platform: "meta" | "tiktok";
  presetKey: string;
  objective: CampaignObjective;
  /** Always "PAUSED" when produced by this service. */
  status: "PAUSED";
  dailyBudgetMinor: number; // in bani / cents — integer
  currency: "RON";
  /** Free-form audience descriptor; real targeting params filled at impl time. */
  audience: { geoRadiusKm: number; city: string; minAge: number };
  creativeRef: string;
  copyRo: string;
  createdAt: string;
  /** Set once a human has reviewed; the service never sets this to live. */
  approvalState: "awaiting_review" | "approved_by_human" | "rejected";
}
