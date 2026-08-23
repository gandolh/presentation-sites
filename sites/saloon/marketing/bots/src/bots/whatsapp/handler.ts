/**
 * WhatsApp bot — inbound message handler.
 * Phase 2 · Agent A. INBOUND-ONLY (COMPLIANCE #3): only ever reacts to a
 * user-initiated message; never starts a conversation.
 *
 * 24h window (COMPLIANCE #4): free-form `service` replies are used INSIDE the
 * window (msg.withinServiceWindow). Outside it we would need a template — the
 * scaffold sends nothing free-form there and leaves a TODO. STOP always wins.
 */

import type { CoreDeps, InboundMessage, OutboundMessage, Logger, Db, Senders } from "../../core/index.ts";
import { redact } from "../../core/index.ts";
import { detectIntent, type Intent } from "./keywords.ts";
import {
  greeting,
  servicesReply,
  pricesReply,
  bookingReply,
  locationReply,
  awayReply,
  handoffReply,
  fallbackReply,
  optOutReply,
} from "./messages.ts";

const PLATFORM = "whatsapp";

/** Pick the on-brand RO reply text for a non-STOP intent. */
function replyForIntent(intent: Intent): string {
  switch (intent) {
    case "services":
      return servicesReply();
    case "prices":
      return pricesReply();
    case "booking":
      return bookingReply();
    case "location":
      return locationReply();
    case "greeting":
      return greeting();
    case "start":
      // Re-subscribe handled before this; greet them back.
      return greeting();
    case "unknown":
    default:
      return fallbackReply();
  }
}

/** Build a free-form service-window reply message. */
function serviceMessage(toId: string, text: string): OutboundMessage {
  return { platform: PLATFORM, toId, text, kind: "service" };
}

interface HandlerDeps {
  db: Db;
  senders: Senders;
  log: Logger;
}

/**
 * The inbound handler registered on the webhook router for `whatsapp`.
 * Order of concerns: STOP/START opt-state first, then human hand-off for
 * booking, then the menu, all inside the 24h service window.
 */
export function makeInboundHandler(deps: HandlerDeps): (msg: InboundMessage) => Promise<void> {
  const { db, senders, log } = deps;

  return async (msg: InboundMessage) => {
    const to = redact(msg.fromId);
    const intent = detectIntent(msg.text);
    log.info("inbound", { from: to, intent, inWindow: msg.withinServiceWindow });

    // 1) STOP / opt-out — record suppression, send one warm acknowledgement.
    if (intent === "stop") {
      await db.setOptIn(PLATFORM, msg.fromId, "opted_out");
      await senders.whatsapp.sendMessage(serviceMessage(msg.fromId, optOutReply()));
      log.info("opted out", { from: to });
      return;
    }

    // 2) START / re-subscribe — clear suppression so future contact is allowed.
    if (intent === "start") {
      await db.setOptIn(PLATFORM, msg.fromId, "opted_in");
      log.info("opted in", { from: to });
    }

    // If a previously-opted-out user writes again (not STOP/START), we still
    // answer their inbound message inside the window — that's user-initiated
    // and contract-based — but we never proactively re-message them.

    // 3) Outside the 24h window we cannot send a free-form reply. Send nothing
    //    free-form here; an approved utility/away template is the real-impl path.
    if (!msg.withinServiceWindow) {
      log.info("outside 24h window — no free-form reply", { from: to });
      // TODO(impl): send an approved utility/away template (Cloud API) here.
      return;
    }

    // 4) Booking → answer with the booking prompt AND flag a human hand-off so
    //    Ana confirms the slot. Never trap the user in the bot (COMPLIANCE #14).
    if (intent === "booking") {
      await senders.whatsapp.sendMessage(serviceMessage(msg.fromId, bookingReply()));
      await senders.whatsapp.sendMessage(serviceMessage(msg.fromId, handoffReply()));
      // TODO(impl): persist a "requested" Appointment + notify Ana for confirmation.
      log.info("booking hand-off to human", { from: to });
      return;
    }

    // 5) Everything else: the menu reply for the detected intent.
    await senders.whatsapp.sendMessage(serviceMessage(msg.fromId, replyForIntent(intent)));
  };
}

/** Convenience for the away-hours message (kept here so handler owns all copy paths). */
export { awayReply };

/** Build handler deps from CoreDeps + a scoped logger. */
export function handlerDepsFrom(deps: CoreDeps, log: Logger): HandlerDeps {
  return { db: deps.db, senders: deps.senders, log };
}
