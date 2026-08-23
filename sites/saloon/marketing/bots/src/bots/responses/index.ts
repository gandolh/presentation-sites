/**
 * Responses bot — inbound auto-reply on Instagram + Facebook.
 * Phase 2 · Agent B. Implements this folder ONLY (frozen core/ contracts).
 *
 * Plan: ../../../responses/todo.md   Rules: ../../../COMPLIANCE.md
 *
 * Scope (all user-initiated — COMPLIANCE #3, inbound-only):
 *  - First-touch auto-reply to an inbound IG DM or FB Page message.
 *  - FAQ keyword replies in RO (servicii / preturi / programare / locatie / program).
 *  - Route "Programare" -> the single WhatsApp booking link.
 *  - Away message outside business hours.
 *  - STOP / opt-out handling + honoring prior opt-outs (no further replies).
 *  - Ice-breaker / quick-reply MENU config (reply menu only, NOT outbound growth).
 *
 * Explicitly NOT here (banned + owner said no): comments, auto-like/follow,
 * comment->DM funnels, mass-DM, or DMing anyone who didn't message first.
 * There is no `comments`/engagement code anywhere in this module.
 */

import type {
  CoreDeps,
  BotModule,
  Config,
  Logger,
  Db,
  Senders,
  WebhookRouter,
  InboundMessage,
  OutboundMessage,
  Platform,
  Lead,
} from "../../core/index.ts";
import { redact } from "../../core/index.ts";

import {
  detectIntent,
  replyFor,
  isWithinBusinessHours,
  AWAY_MESSAGE,
  ICE_BREAKERS,
  WHATSAPP_BOOKING_URL,
  type ReplyIntent,
} from "./replies.ts";

/** Surfaces this bot owns. WhatsApp inbound lives in the whatsapp bot. */
const PLATFORMS: readonly Platform[] = ["instagram", "facebook"] as const;

/**
 * Build a free-form ("service") reply. Replies are only ever sent in response
 * to an inbound user message, so we are inside the 24h service window
 * (COMPLIANCE #4). We never send a template here — promos outside the window
 * are out of scope for this bot.
 */
function buildReply(platform: Platform, toId: string, text: string): OutboundMessage {
  return { platform, toId, text, kind: "service" };
}

/**
 * Core handler for one inbound message on IG or FB. Depends only on injected
 * deps so it's trivially testable.
 */
async function handleInbound(
  msg: InboundMessage,
  deps: { logger: Logger; db: Db; senders: Senders },
): Promise<void> {
  const { logger, db, senders } = deps;
  const intent: ReplyIntent = detectIntent(msg.text);

  logger.info("inbound message", {
    platform: msg.platform,
    from: redact(msg.fromId), // never log raw ids or message bodies (COMPLIANCE #12)
    intent,
  });

  // 1) Already opted out? Stay silent — no automated reply at all.
  if (await db.isOptedOut(msg.platform, msg.fromId)) {
    logger.debug("suppressed: contact opted out", {
      platform: msg.platform,
      from: redact(msg.fromId),
    });
    return;
  }

  // 2) STOP / opt-out request: record it, send one acknowledgement, go silent.
  if (intent === "stop") {
    await db.setOptIn(msg.platform, msg.fromId, "opted_out");
    await sendReply(senders, logger, buildReply(msg.platform, msg.fromId, replyFor("stop")));
    logger.info("opted out", { platform: msg.platform, from: redact(msg.fromId) });
    return;
  }

  // 3) Minimal lead capture (data minimisation #12): platform + intent only,
  //    no name/phone (we don't have them yet), opt-in unknown until the form.
  const lead: Lead = {
    id: `${msg.platform}:${msg.fromId}:${msg.timestampMs}`,
    platform: msg.platform,
    message: intent, // store the resolved intent, NOT the raw body (PII-safe)
    marketingOptIn: "unknown",
    createdAt: new Date(msg.timestampMs).toISOString(),
  };
  await db.insertLead(lead);

  // 4) Outside business hours -> away message (still routes to WhatsApp).
  if (!isWithinBusinessHours(msg.timestampMs)) {
    await sendReply(senders, logger, buildReply(msg.platform, msg.fromId, AWAY_MESSAGE));
    logger.debug("away reply sent", { platform: msg.platform });
    return;
  }

  // 5) On-brand FAQ / first-touch reply. "programare" path routes to WhatsApp;
  //    every reply already carries the WhatsApp CTA (single booking path).
  const text = replyFor(intent);
  await sendReply(senders, logger, buildReply(msg.platform, msg.fromId, text));

  if (intent === "programare") {
    logger.info("routed to whatsapp booking", {
      platform: msg.platform,
      route: WHATSAPP_BOOKING_URL,
    });
  }
}

/** Send via the Meta messaging sender, logging the (redacted) outcome. */
async function sendReply(senders: Senders, logger: Logger, msg: OutboundMessage): Promise<void> {
  // TODO(impl): real Meta Messaging API call lives behind senders.meta.sendReply
  //   (Instagram Messaging / Messenger Send API, inside the 24h window).
  const res = await senders.meta.sendReply(msg);
  if (!res.ok) {
    logger.warn("reply failed", { platform: msg.platform, to: redact(msg.toId) });
    return;
  }
  logger.debug("reply sent", { platform: msg.platform, to: redact(msg.toId) });
}

/**
 * Configure the Ice-Breaker / quick-reply MENU on both surfaces. This is a
 * reply menu only — for people who already opened a chat — NOT outbound growth
 * (todo.md note + COMPLIANCE #2/#3). Best-effort: a failure here must not crash
 * registration, so we catch + log.
 */
async function configureIceBreakers(senders: Senders, logger: Logger): Promise<void> {
  // TODO(impl): real Messaging Profile API call lives behind senders.meta.setIceBreakers
  //   (Messenger ice_breakers / IG persistent-menu equivalent).
  for (const platform of PLATFORMS) {
    try {
      await senders.meta.setIceBreakers(platform, ICE_BREAKERS);
      logger.debug("ice-breakers configured", { platform });
    } catch (err) {
      logger.warn("ice-breaker config failed", { platform, err: String(err) });
    }
  }
}

export const createBot = (deps: CoreDeps): BotModule => {
  const log = deps.logger.child("responses");

  return {
    name: "responses",
    enabled: (config: Config) => config.enabled.responses,

    registerWebhooks(router: WebhookRouter) {
      // Subscribe the SAME inbound handler for both IG and FB `messages`.
      // No `comments`/engagement subscription — inbound messages only.
      const handler = (msg: InboundMessage) =>
        handleInbound(msg, { logger: log, db: deps.db, senders: deps.senders });
      for (const platform of PLATFORMS) {
        router.onMessage(platform, handler);
      }

      // Configure the reply menu once at registration (fire-and-forget; errors
      // are caught inside). Real impl runs this against the Meta profile API.
      void configureIceBreakers(deps.senders, log);

      log.debug("responses.registerWebhooks", { platforms: [...PLATFORMS] });
    },
  };
};

// Exported for unit tests (kept internal to this folder).
export { handleInbound, configureIceBreakers };
