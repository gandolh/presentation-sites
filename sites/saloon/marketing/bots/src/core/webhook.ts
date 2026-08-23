/**
 * Webhook signature verification + inbound event router — FROZEN (Phase 1).
 *
 * COMPLIANCE: dispatches INBOUND `messages` events only (#3). There is
 * deliberately no `comments` / engagement dispatch — bots react only to
 * user-initiated messages.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { InboundMessage, Platform } from "./types.ts";

export type MessageHandler = (msg: InboundMessage) => Promise<void>;

/**
 * Registry bots use in `registerWebhooks(router)`. A bot subscribes a handler
 * for the platform(s) it owns. Multiple handlers per platform are allowed
 * (e.g. whatsapp booking + a generic responder), invoked in registration order.
 */
export interface WebhookRouter {
  onMessage(platform: Platform, handler: MessageHandler): void;
}

export function createWebhookRouter(): WebhookRouter & {
  dispatch(msg: InboundMessage): Promise<void>;
} {
  const handlers = new Map<Platform, MessageHandler[]>();
  return {
    onMessage(platform, handler) {
      const list = handlers.get(platform) ?? [];
      list.push(handler);
      handlers.set(platform, list);
    },
    async dispatch(msg) {
      for (const h of handlers.get(msg.platform) ?? []) {
        await h(msg);
      }
    },
  };
}

/**
 * Verify Meta's `X-Hub-Signature-256` header against the raw request body.
 * Returns false on any mismatch / missing input (never throws on bad input).
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(provided, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Verify the GET webhook subscription handshake (Meta hub.challenge).
 * Returns the challenge string to echo back, or null if the token is wrong.
 */
export function verifySubscription(
  query: { mode?: string; token?: string; challenge?: string },
  verifyToken: string,
): string | null {
  if (query.mode === "subscribe" && query.token === verifyToken) {
    return query.challenge ?? "";
  }
  return null;
}
