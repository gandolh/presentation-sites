/**
 * WhatsApp bot — unit tests (Phase 2 · Agent A).
 * Run: node --experimental-strip-types --test src/bots/whatsapp/whatsapp.test.ts
 *
 * Uses the FROZEN core mocks (createMockSenders + createInMemoryDb) — no network.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createMockSenders,
  createInMemoryDb,
  createLogger,
  createWebhookRouter,
  createScheduler,
  loadConfig,
  type CoreDeps,
  type Appointment,
  type InboundMessage,
} from "../../core/index.ts";

import { createBot } from "./index.ts";
import { TEMPLATES } from "./messages.ts";
import { detectIntent, normalize } from "./keywords.ts";

/** Fixed clock so the reminder window is deterministic. */
const NOW = new Date("2026-06-01T09:00:00.000Z");
const fixedClock = () => NOW;

function makeDeps(): {
  deps: CoreDeps;
  log: ReturnType<typeof createMockSenders>["log"];
  db: ReturnType<typeof createInMemoryDb>;
} {
  const { senders, log } = createMockSenders();
  const db = createInMemoryDb();
  const config = loadConfig({ BOT_WHATSAPP_ENABLED: "1" });
  const logger = createLogger("error", "test"); // quiet
  return { deps: { config, logger, db, senders }, log, db };
}

function appointment(over: Partial<Appointment> = {}): Appointment {
  return {
    id: over.id ?? "appt_1",
    phoneE164: over.phoneE164 ?? "40700000123",
    clientName: over.clientName ?? "Ioana",
    service: over.service ?? "manichiura_semipermanenta",
    startsAt: over.startsAt ?? "2026-06-02T12:00:00.000Z", // ~27h out by default
    status: over.status ?? "confirmed",
    createdAt: over.createdAt ?? NOW.toISOString(),
    lastInteractionAt: over.lastInteractionAt ?? NOW.toISOString(),
  };
}

function inbound(text: string, over: Partial<InboundMessage> = {}): InboundMessage {
  return {
    platform: "whatsapp",
    fromId: over.fromId ?? "40700000123",
    text,
    timestampMs: over.timestampMs ?? NOW.getTime(),
    withinServiceWindow: over.withinServiceWindow ?? true,
    ...(over.raw !== undefined ? { raw: over.raw } : {}),
  };
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

test("createBot returns a valid 'whatsapp' BotModule honoring the kill-switch", () => {
  const { deps } = makeDeps();
  const bot = createBot(deps);
  assert.equal(bot.name, "whatsapp");
  assert.equal(bot.enabled(loadConfig({ BOT_WHATSAPP_ENABLED: "1" })), true);
  assert.equal(bot.enabled(loadConfig({})), false); // defaults off
  assert.equal(typeof bot.registerJobs, "function");
  assert.equal(typeof bot.registerWebhooks, "function");
});

test("registerJobs registers confirmation, reminder and purge jobs", () => {
  const { deps } = makeDeps();
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);
  assert.deepEqual(scheduler.jobNames().sort(), [
    "whatsapp:confirmations",
    "whatsapp:purge",
    "whatsapp:reminders",
  ]);
});

// ---------------------------------------------------------------------------
// Reminder job (REQUIRED: sends the right template)
// ---------------------------------------------------------------------------

test("reminder job sends the reminder_programare template ~24h before a confirmed slot", async () => {
  const { deps, log, db } = makeDeps();
  await db.upsertAppointment(appointment({ startsAt: "2026-06-02T09:30:00.000Z" })); // ~24.5h out
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);

  await scheduler.runJob("whatsapp:reminders");

  assert.equal(log.whatsappTemplates.length, 1);
  const sent = log.whatsappTemplates[0];
  assert.ok(sent);
  assert.equal(sent.templateName, TEMPLATES.reminder);
  assert.equal(sent.toId, "40700000123");
  assert.equal(sent.params.nume, "Ioana");
  assert.ok(sent.params.ora, "reminder includes a time param");
  // Reminders go via templates, never free-form service messages.
  assert.equal(log.whatsappMessages.length, 0);
});

test("reminder job skips opted-out clients", async () => {
  const { deps, log, db } = makeDeps();
  await db.upsertAppointment(appointment({ startsAt: "2026-06-02T09:30:00.000Z" }));
  await db.setOptIn("whatsapp", "40700000123", "opted_out");
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);

  await scheduler.runJob("whatsapp:reminders");
  assert.equal(log.whatsappTemplates.length, 0);
});

test("reminder job ignores appointments outside the ~24h window and non-confirmed ones", async () => {
  const { deps, log, db } = makeDeps();
  await db.upsertAppointment(appointment({ id: "far", startsAt: "2026-06-10T09:00:00.000Z" }));
  await db.upsertAppointment(
    appointment({ id: "soon_unconfirmed", startsAt: "2026-06-02T09:30:00.000Z", status: "requested" }),
  );
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);

  await scheduler.runJob("whatsapp:reminders");
  assert.equal(log.whatsappTemplates.length, 0);
});

// ---------------------------------------------------------------------------
// Confirmation job
// ---------------------------------------------------------------------------

test("confirmation job sends confirmare_programare with date/time/service params", async () => {
  const { deps, log, db } = makeDeps();
  await db.upsertAppointment(appointment({ startsAt: "2026-06-05T14:00:00.000Z", service: "nail_art" }));
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);

  await scheduler.runJob("whatsapp:confirmations");

  const sent = log.whatsappTemplates.find((t) => t.templateName === TEMPLATES.confirmation);
  assert.ok(sent, "a confirmation template was sent");
  assert.equal(sent.params.nume, "Ioana");
  assert.equal(sent.params.serviciu, "Nail Art");
  assert.ok(sent.params.data && sent.params.ora);
});

// ---------------------------------------------------------------------------
// Inbound STOP (REQUIRED: opts the user out)
// ---------------------------------------------------------------------------

test("inbound STOP opts the user out and sends one warm acknowledgement", async () => {
  const { deps, log, db } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("STOP"));

  assert.equal(await db.isOptedOut("whatsapp", "40700000123"), true);
  assert.equal(log.whatsappMessages.length, 1);
  const reply = log.whatsappMessages[0];
  assert.ok(reply);
  assert.equal(reply.kind, "service");
  assert.match(reply.text, /nu îți mai trimitem mesaje/i);
  // STOP must never be sent as a template (it's an in-window service reply).
  assert.equal(log.whatsappTemplates.length, 0);
});

test("RO opt-out word 'NU' also opts out, but 'nuante' does not", async () => {
  const { deps, db } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("Nu", { fromId: "40711111111" }));
  assert.equal(await db.isOptedOut("whatsapp", "40711111111"), true);

  await router.dispatch(inbound("vreau nuante pastelate", { fromId: "40722222222" }));
  assert.equal(await db.isOptedOut("whatsapp", "40722222222"), false);
});

// ---------------------------------------------------------------------------
// Inbound booking keyword (REQUIRED: triggers a reply)
// ---------------------------------------------------------------------------

test("inbound 'Programare' triggers a booking reply + human hand-off (service messages)", async () => {
  const { deps, log } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("Aș vrea o programare"));

  assert.equal(log.whatsappMessages.length, 2); // booking prompt + hand-off
  for (const m of log.whatsappMessages) assert.equal(m.kind, "service");
  assert.match(log.whatsappMessages[0]!.text, /serviciu|program|disponibilitate/i);
  assert.match(log.whatsappMessages[1]!.text, /Ana|Anei/); // RO inflected form

  assert.equal(log.whatsappTemplates.length, 0);
});

test("menu keywords map to the right RO replies", async () => {
  const { deps, log } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("Servicii", { fromId: "40700000001" }));
  await router.dispatch(inbound("Prețuri", { fromId: "40700000002" }));
  await router.dispatch(inbound("Locație", { fromId: "40700000003" }));

  assert.equal(log.whatsappMessages.length, 3);
  assert.match(log.whatsappMessages[0]!.text, /Manichiură/);
  assert.match(log.whatsappMessages[1]!.text, /lei/);
  assert.match(log.whatsappMessages[2]!.text, /Târgu-Jiu/);
});

test("outside the 24h window the bot sends no free-form reply", async () => {
  const { deps, log } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("Servicii", { withinServiceWindow: false }));
  assert.equal(log.whatsappMessages.length, 0);
  assert.equal(log.whatsappTemplates.length, 0);
});

test("STOP works even outside the 24h window (opt-out always honored)", async () => {
  const { deps, db, log } = makeDeps();
  const router = createWebhookRouter();
  createBot(deps).registerWebhooks?.(router);

  await router.dispatch(inbound("STOP", { withinServiceWindow: false }));
  assert.equal(await db.isOptedOut("whatsapp", "40700000123"), true);
  assert.equal(log.whatsappMessages.length, 1); // the warm ack is allowed
});

// ---------------------------------------------------------------------------
// Keyword detection unit tests
// ---------------------------------------------------------------------------

test("normalize strips RO diacritics and case", () => {
  assert.equal(normalize("Programări"), "programari");
  assert.equal(normalize("PREȚURI"), "preturi");
  assert.equal(normalize("Locație"), "locatie");
});

test("detectIntent recognizes keywords and numeric menu choices", () => {
  assert.equal(detectIntent("stop"), "stop");
  assert.equal(detectIntent("Servicii"), "services");
  assert.equal(detectIntent("3"), "booking");
  assert.equal(detectIntent("preturi"), "prices");
  assert.equal(detectIntent("unde sunteti?"), "location");
  assert.equal(detectIntent("Bună!"), "greeting");
  assert.equal(detectIntent("blabla random"), "unknown");
});

// ---------------------------------------------------------------------------
// Retention purge job
// ---------------------------------------------------------------------------

test("purge job removes appointments past the retention window", async () => {
  const { deps, db } = makeDeps();
  // Old appointment: last interaction > 365 days before NOW.
  await db.upsertAppointment(
    appointment({ id: "old", lastInteractionAt: "2024-01-01T00:00:00.000Z" }),
  );
  await db.upsertAppointment(appointment({ id: "fresh" }));
  const scheduler = createScheduler();
  createBot(deps, { now: fixedClock }).registerJobs?.(scheduler);

  await scheduler.runJob("whatsapp:purge");

  assert.equal(await db.getAppointment("old"), undefined);
  assert.ok(await db.getAppointment("fresh"));
});
