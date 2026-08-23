/**
 * Fake inbound webhook events — Phase 2 · Agent E.
 *
 * Factory functions that produce valid `InboundMessage` objects per platform,
 * so response/handler tests can feed the webhook router realistic input without
 * a real Meta/WhatsApp payload. Text and sender id are overridable; everything
 * else has sensible defaults.
 *
 * COMPLIANCE: this models INBOUND, user-initiated messages only (#3). The
 * service never fabricates an outbound-first contact — there is intentionally
 * no "fake outbound event" generator here.
 */

import type { InboundMessage, Platform } from "../../core/index.ts";
import { FIXED_NOW_MS, SAMPLE_PHONE_E164 } from "./mocks.ts";

/** Options shared by every fake-event builder. */
export interface FakeEventOptions {
  /** Message body. Defaults to a booking keyword ("Programare"). */
  text?: string;
  /** Platform-scoped sender id (phone id / IGSID / PSID). */
  fromId?: string;
  /** Epoch ms. Defaults to the shared FIXED_NOW_MS (deterministic). */
  timestampMs?: number;
  /** Whether the 24h service window is open. Defaults to true. */
  withinServiceWindow?: boolean;
  /** Optional raw provider payload passthrough. */
  raw?: unknown;
}

/** Plausible default sender ids per platform (fixed, non-PII synthetic values). */
const DEFAULT_FROM_ID: Record<Platform, string> = {
  whatsapp: SAMPLE_PHONE_E164,
  instagram: "ig_17841400000000001",
  facebook: "fb_psid_1000000000000001",
  tiktok: "tt_user_0000000001",
};

/**
 * Core builder. Assembles an `InboundMessage` for any platform, only including
 * the optional `raw` field when supplied (keeps it valid under
 * exactOptionalPropertyTypes).
 */
export function fakeInboundMessage(
  platform: Platform,
  opts: FakeEventOptions = {},
): InboundMessage {
  const base: InboundMessage = {
    platform,
    fromId: opts.fromId ?? DEFAULT_FROM_ID[platform],
    text: opts.text ?? "Programare",
    timestampMs: opts.timestampMs ?? FIXED_NOW_MS,
    withinServiceWindow: opts.withinServiceWindow ?? true,
  };
  return opts.raw === undefined ? base : { ...base, raw: opts.raw };
}

/** WhatsApp inbound message (e.g. a booking keyword from a phone). */
export function fakeWhatsAppMessage(opts: FakeEventOptions = {}): InboundMessage {
  return fakeInboundMessage("whatsapp", opts);
}

/** Instagram DM / story-reply inbound message (IGSID sender). */
export function fakeInstagramMessage(opts: FakeEventOptions = {}): InboundMessage {
  return fakeInboundMessage("instagram", opts);
}

/** Facebook Messenger inbound message (PSID sender). */
export function fakeFacebookMessage(opts: FakeEventOptions = {}): InboundMessage {
  return fakeInboundMessage("facebook", opts);
}

/** A STOP / opt-out inbound message — convenience for testing suppression flows. */
export function fakeStopMessage(
  platform: Platform,
  opts: FakeEventOptions = {},
): InboundMessage {
  return fakeInboundMessage(platform, { text: "STOP", ...opts });
}

/**
 * A message that arrives OUTSIDE the 24h service window — for testing the
 * template-only path (#4). Defaults to WhatsApp.
 */
export function fakeOutOfWindowMessage(
  platform: Platform = "whatsapp",
  opts: FakeEventOptions = {},
): InboundMessage {
  return fakeInboundMessage(platform, { withinServiceWindow: false, ...opts });
}
