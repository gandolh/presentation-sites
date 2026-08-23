/**
 * Integration smoke test — behavior through the ASSEMBLED app graph.
 *
 * The existing smoke.test.ts asserts the buildApp/BotModule *contract* and is
 * deliberately resilient to stubs (it does not assert that anything is actually
 * sent). This file is the complement: it drives the REAL wiring — the shared
 * webhook router and scheduler that `buildApp` assembles — and asserts the
 * compliance-critical behavior end-to-end against the mock `sentLog` + db.
 *
 * It exercises the seams no per-folder unit test can see:
 *   - an inbound event dispatched through the shared router reaches the right
 *     bot and produces a reply (and STOP persists an opt-out that silences the
 *     NEXT message — cross-call state through the live router + shared db);
 *   - a scheduler job, run by name through the assembled scheduler, drives the
 *     shared db + senders (campaign drafts, post publishing);
 *   - the money guards fire under integration: PAUSED-only + budget clamp;
 *   - the spend kill-switch removes the campaigns bot from the graph entirely.
 *
 * No real credentials, no network: everything runs on the in-memory db + mock
 * senders that buildApp wires in mock mode. Run:
 *   node --experimental-strip-types --test src/bots/shared-tests/integration.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildApp, type App } from "../../server.ts";
import { loadConfig, type SentLog } from "../../core/index.ts";

/** In mock mode sentLog is always present; narrow it for the assertions. */
function mustLog(app: App): SentLog {
  assert.ok(app.sentLog, "mock-mode app must expose sentLog");
  return app.sentLog;
}
import {
  JOB_PREPARE_DRAFTS,
  JOB_AUTOPAUSE_FULL,
} from "../campaigns/index.ts";
import { PUBLISH_RUNNER_JOB } from "../scheduler/index.ts";
import { fakeWhatsAppMessage, fakeInstagramMessage } from "./fake-events.ts";
import { sampleScheduledPost, FIXED_NOW_ISO } from "./mocks.ts";

/** Fully-enabled mock env, quiet logs. Mirrors how real env arrives (strings). */
function fullEnv(over: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    BOTS_MOCK_MODE: "true",
    BOT_WHATSAPP_ENABLED: "true",
    BOT_RESPONSES_ENABLED: "true",
    BOT_SCHEDULER_ENABLED: "true",
    BOT_CAMPAIGNS_ENABLED: "true",
    ADS_SPEND_ENABLED: "true",
    LOG_LEVEL: "error",
    ...over,
  };
}

// ---------------------------------------------------------------------------
// Inbound responses, through the shared router (not the handler in isolation).
// ---------------------------------------------------------------------------

test("inbound WhatsApp 'Programare' dispatched through the assembled router replies + hands off to a human", async () => {
  const app = buildApp(loadConfig(fullEnv()));

  const log = mustLog(app);
  await app.router.dispatch(fakeWhatsAppMessage({ text: "Programare", fromId: "40755000111" }));

  // The whatsapp booking flow intentionally sends TWO messages: the booking
  // prompt AND a human hand-off, so the user is never trapped in the bot
  // (COMPLIANCE #14 — always route to a real human). See whatsapp/handler.ts.
  assert.equal(log.whatsappMessages.length, 2, "booking prompt + human hand-off");
  for (const reply of log.whatsappMessages) {
    assert.equal(reply.platform, "whatsapp");
    assert.equal(reply.kind, "service", "in-window reply must be a free-form service message");
    assert.ok(reply.text.length > 0, "reply has on-brand RO text");
  }
});

test("WhatsApp STOP records an opt-out in the shared db and acknowledges exactly once", async () => {
  const app = buildApp(loadConfig(fullEnv()));
  const log = mustLog(app);
  const from = "40755000222";

  await app.router.dispatch(fakeWhatsAppMessage({ text: "STOP", fromId: from }));

  // Opt-out persisted to the SHARED db (not just the handler's local state).
  assert.equal(
    await app.deps.db.isOptedOut("whatsapp", from),
    true,
    "STOP recorded an opt-out in the shared db",
  );
  // Exactly one warm acknowledgement — never a burst.
  assert.equal(log.whatsappMessages.length, 1, "STOP sends exactly one acknowledgement");

  // NOTE on semantics (intentional, documented in whatsapp/handler.ts): the
  // WhatsApp bot still answers a LATER user-initiated message from an opted-out
  // contact inside the 24h window (that reply is contract-based and the user
  // chose to write). It only suppresses PROACTIVE re-messaging. So we do NOT
  // assert silence-on-next-message here — that is the responses-bot contract,
  // verified separately below.
});

test("responses bot: an opted-out IG contact is then fully silenced on the NEXT message", async () => {
  // This is the divergent contract from the WhatsApp bot, and it only holds if
  // the responses handler + the shared db are wired together via buildApp.
  const app = buildApp(loadConfig(fullEnv()));
  const log = mustLog(app);
  const from = "ig_user_777";

  // STOP -> one acknowledgement + opt-out recorded.
  await app.router.dispatch(fakeInstagramMessage({ text: "STOP", fromId: from }));
  assert.equal(await app.deps.db.isOptedOut("instagram", from), true, "opt-out recorded");
  const afterStop = log.metaReplies.length;
  assert.equal(afterStop, 1, "STOP acknowledged once");

  // A later message from the same opted-out contact gets NO reply at all.
  await app.router.dispatch(fakeInstagramMessage({ text: "Programare", fromId: from }));
  assert.equal(
    log.metaReplies.length,
    afterStop,
    "opted-out IG contact receives no further automated replies",
  );
});

// ---------------------------------------------------------------------------
// Campaigns job, run by name through the assembled scheduler.
// ---------------------------------------------------------------------------

test("campaigns prepare-drafts job (via scheduler) only ever produces PAUSED drafts + notifies a human", async () => {
  const app = buildApp(loadConfig(fullEnv()));

  assert.ok(
    app.scheduler.jobNames().includes(JOB_PREPARE_DRAFTS),
    "prepare-drafts job is registered in the assembled scheduler",
  );

  const log = mustLog(app);
  await app.scheduler.runJob(JOB_PREPARE_DRAFTS);

  const drafts = log.campaignDrafts;
  assert.ok(drafts.length >= 1, "at least one draft prepared");
  for (const d of drafts) {
    assert.equal(d.status, "PAUSED", `draft ${d.presetKey} must be PAUSED — never ACTIVE`);
    assert.equal(d.approvalState, "awaiting_review", "human must approve before spend");
  }
  // Every prepared draft pairs with a human-approval notification.
  assert.equal(
    log.notifications.length,
    drafts.length,
    "one approval notification per prepared draft",
  );
});

test("campaigns budget guard clamps an over-cap preset under integration (tiny cap)", async () => {
  // Set the daily cap BELOW the smallest preset ask (boost-best-reel = 3000 bani).
  const app = buildApp(loadConfig(fullEnv({ ADS_DAILY_CAP_MINOR: "1000" })));

  const log = mustLog(app);
  await app.scheduler.runJob(JOB_PREPARE_DRAFTS);

  const drafts = log.campaignDrafts;
  assert.ok(drafts.length >= 1, "drafts were prepared");
  for (const d of drafts) {
    assert.ok(
      d.dailyBudgetMinor <= 1000,
      `draft ${d.presetKey} daily budget ${d.dailyBudgetMinor} must be clamped to the 1000-bani cap`,
    );
    assert.equal(d.status, "PAUSED");
  }
});

test("spend kill-switch removes the campaigns bot from the assembled graph", () => {
  const app = buildApp(loadConfig(fullEnv({ ADS_SPEND_ENABLED: "false" })));

  // campaigns.enabled requires BOTH the bot flag AND adsSpendEnabled.
  const campaigns = app.bots.find((b) => b.name === "campaigns");
  assert.ok(campaigns, "campaigns factory still ran");
  assert.equal(campaigns.enabled(app.config), false, "campaigns disabled when spend is off");

  // Consequently NONE of the campaign jobs are registered.
  const jobs = app.scheduler.jobNames();
  assert.equal(jobs.includes(JOB_PREPARE_DRAFTS), false, "no prepare-drafts job");
  assert.equal(jobs.includes(JOB_AUTOPAUSE_FULL), false, "no auto-pause job");
});

// ---------------------------------------------------------------------------
// Scheduler publish-runner, driven by a due post in the shared db.
// ---------------------------------------------------------------------------

test("scheduler publish-runner (via scheduler) publishes a due post to all targets and marks it published", async () => {
  const app = buildApp(loadConfig(fullEnv()));
  const log = mustLog(app);

  assert.ok(
    app.scheduler.jobNames().includes(PUBLISH_RUNNER_JOB),
    "publish-runner job is registered",
  );

  // Enqueue a post whose publishAt is in the past relative to "now" so it's due.
  // FIXED_NOW_ISO (2026-03) is well in the past, so any real Date.now() makes it due.
  const post = sampleScheduledPost({
    id: "post_smoke_1",
    publishAt: FIXED_NOW_ISO,
    targets: ["instagram", "facebook", "tiktok"],
    status: "queued",
  });
  await app.deps.db.enqueuePost(post);

  await app.scheduler.runJob(PUBLISH_RUNNER_JOB);

  // The mock publisher recorded one publish per target.
  const targetsPublished = log.published
    .filter((p) => p.post.id === post.id)
    .map((p) => p.target)
    .sort();
  assert.deepEqual(
    targetsPublished,
    ["facebook", "instagram", "tiktok"],
    "published once to each target through the assembled publisher",
  );

  // The shared db row is now "published" with a per-target result.
  const due = await app.deps.db.listDuePosts(new Date().toISOString());
  assert.equal(
    due.some((p) => p.id === post.id),
    false,
    "the post is no longer 'queued'/due after a successful run",
  );
});

// ---------------------------------------------------------------------------
// Whole-graph job registry: every enabled bot's jobs coexist, names are unique.
// ---------------------------------------------------------------------------

test("all enabled bots' jobs coexist in one scheduler with unique names", () => {
  const app = buildApp(loadConfig(fullEnv()));
  const jobs = app.scheduler.jobNames();

  // The jobs we rely on are all present.
  for (const expected of [
    "whatsapp:confirmations",
    "whatsapp:reminders",
    "whatsapp:purge",
    PUBLISH_RUNNER_JOB,
    JOB_PREPARE_DRAFTS,
    JOB_AUTOPAUSE_FULL,
  ]) {
    assert.ok(jobs.includes(expected), `expected job '${expected}' registered`);
  }
  // No collisions across bots (the scheduler also throws on dup; this documents it).
  assert.equal(new Set(jobs).size, jobs.length, "job names are globally unique");
});
