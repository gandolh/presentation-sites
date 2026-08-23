/**
 * Responses bot — unit tests (Phase 2 · Agent B).
 *
 * Runs offline against the frozen core mocks: createMockSenders + createInMemoryDb.
 * No network, no real tokens. `node --test` per package.json.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createMockSenders,
  createInMemoryDb,
  createLogger,
  createWebhookRouter,
  type CoreDeps,
  type InboundMessage,
} from "../../core/index.ts";

import { createBot, handleInbound } from "./index.ts";
import { WHATSAPP_BOOKING_URL, detectIntent, isWithinBusinessHours, isStopKeyword } from "./replies.ts";

/** Quiet logger (error-level only) so tests don't spam stdout. */
const quietLogger = () => createLogger("error", "test");

/** A timestamp that is reliably WITHIN business hours: Wed 2024-06-12, 12:00 Bucharest. */
const OPEN_TS = Date.parse("2024-06-12T09:00:00Z"); // 12:00 EEST, a Wednesday
/** A timestamp reliably OUTSIDE hours: Sunday 2024-06-09, ~12:00 Bucharest (closed). */
const CLOSED_TS = Date.parse("2024-06-09T09:00:00Z");

function inbound(partial: Partial<InboundMessage> & Pick<InboundMessage, "text">): InboundMessage {
  return {
    platform: "instagram",
    fromId: "IGSID_123456789",
    timestampMs: OPEN_TS,
    withinServiceWindow: true,
    ...partial,
  };
}

function setup() {
  const { senders, log } = createMockSenders();
  const db = createInMemoryDb();
  const deps = { logger: quietLogger(), db, senders };
  return { senders, log, db, deps };
}

test("sanity: chosen fixtures land on the right side of business hours", () => {
  assert.equal(isWithinBusinessHours(OPEN_TS), true);
  assert.equal(isWithinBusinessHours(CLOSED_TS), false);
});

test("inbound IG message gets an auto-reply (first-touch greeting)", async () => {
  const { log, deps } = setup();
  await handleInbound(inbound({ text: "Salut!" }), deps);

  assert.equal(log.metaReplies.length, 1);
  const reply = log.metaReplies[0];
  assert.ok(reply);
  assert.equal(reply.platform, "instagram");
  assert.equal(reply.toId, "IGSID_123456789");
  assert.equal(reply.kind, "service"); // free-form, inside the 24h window
  assert.ok(reply.text.length > 0);
});

test("inbound FB message is also handled", async () => {
  const { log, deps } = setup();
  await handleInbound(inbound({ platform: "facebook", fromId: "PSID_42", text: "ce servicii aveti?" }), deps);

  assert.equal(log.metaReplies.length, 1);
  assert.equal(log.metaReplies[0]?.platform, "facebook");
});

test('"programare" reply contains the WhatsApp booking route', async () => {
  const { log, deps } = setup();
  await handleInbound(inbound({ text: "as vrea o programare" }), deps);

  assert.equal(detectIntent("as vrea o programare"), "programare");
  const reply = log.metaReplies[0];
  assert.ok(reply);
  assert.ok(
    reply.text.includes(WHATSAPP_BOOKING_URL),
    `expected reply to route to ${WHATSAPP_BOOKING_URL}, got: ${reply.text}`,
  );
});

test("every FAQ reply carries the WhatsApp CTA (single booking path)", async () => {
  for (const text of ["servicii", "preturi", "programare", "locatie", "program", "buna", "ceva random"]) {
    const { log, deps } = setup();
    await handleInbound(inbound({ text }), deps);
    const reply = log.metaReplies[0];
    assert.ok(reply, `no reply for "${text}"`);
    assert.ok(reply.text.includes(WHATSAPP_BOOKING_URL), `"${text}" reply missing WhatsApp CTA`);
  }
});

test("STOP opts the contact out and acknowledges once", async () => {
  const { log, db, deps } = setup();
  assert.equal(isStopKeyword("STOP"), true);

  await handleInbound(inbound({ text: "STOP" }), deps);

  assert.equal(await db.isOptedOut("instagram", "IGSID_123456789"), true);
  assert.equal(log.metaReplies.length, 1); // a single STOP acknowledgement
});

test("after STOP, further messages are suppressed (no replies)", async () => {
  const { log, db, deps } = setup();

  await handleInbound(inbound({ text: "STOP" }), deps);
  assert.equal(log.metaReplies.length, 1);

  // Same contact messages again — must be ignored entirely.
  await handleInbound(inbound({ text: "Salut, mai sunteti?" }), deps);
  assert.equal(log.metaReplies.length, 1, "opted-out contact must not receive further replies");
  assert.equal(await db.isOptedOut("instagram", "IGSID_123456789"), true);
});

test("opt-out is scoped per platform+contact", async () => {
  const { log, deps } = setup();

  await handleInbound(inbound({ platform: "instagram", fromId: "A", text: "STOP" }), deps);
  // A different contact on FB is unaffected.
  await handleInbound(inbound({ platform: "facebook", fromId: "B", text: "buna" }), deps);

  assert.equal(log.metaReplies.length, 2);
});

test("outside business hours sends the away message", async () => {
  const { log, deps } = setup();
  await handleInbound(inbound({ text: "buna ziua", timestampMs: CLOSED_TS }), deps);

  const reply = log.metaReplies[0];
  assert.ok(reply);
  assert.ok(/afara programului/i.test(reply.text), "expected away message text");
  assert.ok(reply.text.includes(WHATSAPP_BOOKING_URL));
});

test("a non-stop inbound captures a minimal, PII-safe lead", async () => {
  const { deps } = setup();
  // The in-memory db has no lead reader; assert via purge count instead.
  await handleInbound(inbound({ text: "preturi" }), deps);
  const purged = await deps.db.purgeExpired({
    nowIso: new Date(OPEN_TS + 1000 * 60 * 60 * 24 * 400).toISOString(),
    appointmentDays: 365,
    enquiryDays: 30,
  });
  assert.equal(purged.leads, 1, "exactly one lead should have been recorded");
});

test("registerWebhooks subscribes IG + FB and configures ice-breakers", async () => {
  const { log, deps } = setup();
  const bot = createBot(deps as CoreDeps);
  const router = createWebhookRouter();

  bot.registerWebhooks?.(router);

  // Ice-breaker menu configured on both surfaces (reply menu only).
  await Promise.resolve(); // let the fire-and-forget config settle
  await new Promise((r) => setImmediate(r));
  assert.equal(log.iceBreakers.length, 2);
  const platforms = log.iceBreakers.map((i) => i.platform).sort();
  assert.deepEqual(platforms, ["facebook", "instagram"]);

  // Dispatching an IG message through the router reaches our handler.
  await router.dispatch(inbound({ text: "programare" }));
  assert.equal(log.metaReplies.length, 1);
  assert.ok(log.metaReplies[0]?.text.includes(WHATSAPP_BOOKING_URL));
});

test("bot enabled() reads the responses kill-switch", () => {
  const { deps } = setup();
  const bot = createBot(deps as CoreDeps);
  assert.equal(bot.name, "responses");
  assert.equal(
    bot.enabled({ enabled: { responses: true, whatsapp: false, scheduler: false, campaigns: false } } as never),
    true,
  );
  assert.equal(
    bot.enabled({ enabled: { responses: false, whatsapp: false, scheduler: false, campaigns: false } } as never),
    false,
  );
});
