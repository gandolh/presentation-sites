/**
 * Shared test mocks + domain fixtures — Phase 2 · Agent E.
 *
 * Re-exports the frozen offline seams (`createMockSenders`, `createInMemoryDb`)
 * and adds factory functions for the core domain types so bots A–D don't each
 * reinvent sample data. Every fixture has RO-ish defaults (Târgu-Jiu, RON,
 * E.164 RO phone) and an `overrides` param.
 *
 * RULE: timestamps are FIXED ISO strings (no Date.now()) so tests stay
 * deterministic. Use the fake clock (./fake-clock.ts) when a test needs to
 * advance time.
 *
 * COMPLIANCE: fixtures carry only name / phone / appointment / opt-in (data
 * minimisation #12); no health or other sensitive data.
 */

import {
  createMockSenders,
  createInMemoryDb,
  type Appointment,
  type Lead,
  type ScheduledPost,
  type CampaignDraft,
  type InboundMessage,
  type OutboundMessage,
  type Platform,
} from "../../core/index.ts";

// Re-export the frozen offline seams so a test file needs a single import path.
export { createMockSenders, createInMemoryDb };

/**
 * A fixed reference instant for all fixtures: 2026-03-15T09:00:00 in
 * Europe/Bucharest (UTC+2 in winter/EET → 07:00Z). Kept as a constant so the
 * sample data and the fake clock can share one timeline.
 */
export const FIXED_NOW_ISO = "2026-03-15T07:00:00.000Z";
export const FIXED_NOW_MS = Date.parse(FIXED_NOW_ISO);

/** A second fixed instant, 1h after FIXED_NOW, for "createdAt < startsAt" cases. */
export const FIXED_LATER_ISO = "2026-03-15T08:00:00.000Z";

/** Sample RO phone in E.164-without-'+' form, matching the site's convention. */
export const SAMPLE_PHONE_E164 = "40755123456";

/** Generic `Partial` override helper kept readable at call sites. */
type Overrides<T> = Partial<T>;

/** A booked appointment. Defaults: confirmed, semipermanent manicure, RON. */
export function sampleAppointment(overrides: Overrides<Appointment> = {}): Appointment {
  return {
    id: "appt_0001",
    phoneE164: SAMPLE_PHONE_E164,
    clientName: "Maria Popescu",
    service: "manichiura_semipermanenta",
    startsAt: FIXED_LATER_ISO,
    status: "confirmed",
    createdAt: FIXED_NOW_ISO,
    lastInteractionAt: FIXED_NOW_ISO,
    ...overrides,
  };
}

/** A captured lead. Defaults: instagram, marketing opt-in unknown (no consent yet). */
export function sampleLead(overrides: Overrides<Lead> = {}): Lead {
  return {
    id: "lead_0001",
    platform: "instagram",
    phoneE164: SAMPLE_PHONE_E164,
    clientName: "Ioana Ionescu",
    message: "Bună! Vreau o programare pentru unghii.",
    marketingOptIn: "unknown",
    createdAt: FIXED_NOW_ISO,
    ...overrides,
  };
}

/** A queued cross-publish post. Defaults: queued for IG + FB, RO caption. */
export function sampleScheduledPost(overrides: Overrides<ScheduledPost> = {}): ScheduledPost {
  return {
    id: "post_0001",
    assetRef: "/srv/ana-saloon/assets/reel-001.mp4",
    captionRo: "Manichiură nouă la Ana Saloon, Târgu-Jiu. Programează-te pe WhatsApp!",
    targets: ["instagram", "facebook"],
    publishAt: FIXED_LATER_ISO,
    status: "queued",
    ...overrides,
  };
}

/** A PAUSED campaign draft awaiting human review. Defaults: Meta, leads, RON budget. */
export function sampleCampaignDraft(overrides: Overrides<CampaignDraft> = {}): CampaignDraft {
  return {
    id: "camp_0001",
    platform: "meta",
    presetKey: "local_leads_targu_jiu",
    objective: "OUTCOME_LEADS",
    status: "PAUSED",
    dailyBudgetMinor: 3000, // 30.00 RON, under the 50.00 default cap
    currency: "RON",
    audience: { geoRadiusKm: 15, city: "Târgu-Jiu", minAge: 18 },
    creativeRef: "/srv/ana-saloon/assets/ad-creative-001.jpg",
    copyRo: "Unghii impecabile la Ana Saloon. Programează-te azi!",
    createdAt: FIXED_NOW_ISO,
    approvalState: "awaiting_review",
    ...overrides,
  };
}

/**
 * A free-form (24h-window) outbound reply. Use for asserting what a bot tries
 * to send back. Defaults to a WhatsApp service reply.
 */
export function sampleOutboundMessage(overrides: Overrides<OutboundMessage> = {}): OutboundMessage {
  return {
    platform: "whatsapp",
    toId: SAMPLE_PHONE_E164,
    text: "Mulțumim! Te așteptăm la Ana Saloon.",
    kind: "service",
    ...overrides,
  };
}

/**
 * A minimal inbound message. Most tests want the per-platform builders in
 * ./fake-events.ts; this is the generic fallback for handler unit tests.
 */
export function sampleInboundMessage(overrides: Overrides<InboundMessage> = {}): InboundMessage {
  return {
    platform: "whatsapp",
    fromId: SAMPLE_PHONE_E164,
    text: "Programare",
    timestampMs: FIXED_NOW_MS,
    withinServiceWindow: true,
    ...overrides,
  };
}

/** All platforms, handy for table-driven tests. */
export const ALL_PLATFORMS: readonly Platform[] = [
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
];
