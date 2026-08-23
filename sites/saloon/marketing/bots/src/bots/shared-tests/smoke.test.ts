/**
 * Smoke test — Phase 2 · Agent E.
 *
 * Boots the WHOLE app in mock mode with every bot enabled and asserts the
 * contract holds: buildApp doesn't throw, enabled bots register, the webhook
 * router + scheduler are wired, and scheduler.runAll() runs every job without
 * throwing. No real I/O, no tokens, no network.
 *
 * Resilient by design: it asserts the buildApp / BotModule CONTRACT, not any
 * single bot's internals, so it passes whether A–D are still stubs or fully
 * implemented. Run:
 *   node --experimental-strip-types --test src/bots/shared-tests/smoke.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../../server.ts";
import { loadConfig, type BotName } from "../../core/index.ts";
import { createFakeClock } from "./fake-clock.ts";
import {
  sampleAppointment,
  sampleScheduledPost,
  FIXED_NOW_ISO,
} from "./mocks.ts";
import {
  fakeWhatsAppMessage,
  fakeInstagramMessage,
  fakeFacebookMessage,
} from "./fake-events.ts";

/** Env with every bot + ads spend enabled, in mock mode. Strings, like real env. */
function fullyEnabledEnv(): NodeJS.ProcessEnv {
  return {
    BOTS_MOCK_MODE: "true",
    BOT_WHATSAPP_ENABLED: "true",
    BOT_RESPONSES_ENABLED: "true",
    BOT_SCHEDULER_ENABLED: "true",
    BOT_CAMPAIGNS_ENABLED: "true",
    ADS_SPEND_ENABLED: "true",
    LOG_LEVEL: "error", // keep test output quiet
  };
}

const ALL_BOT_NAMES: readonly BotName[] = ["whatsapp", "responses", "scheduler", "campaigns"];

test("buildApp boots in mock mode with all bots enabled without throwing", () => {
  const config = loadConfig(fullyEnabledEnv());
  const app = buildApp(config);

  assert.equal(app.config.mockMode, true, "scaffold must run in mock mode");
  assert.equal(app.config.adsSpendEnabled, true);
  assert.ok(app.router, "webhook router is wired");
  assert.ok(app.scheduler, "scheduler is wired");
  assert.ok(app.sentLog, "mock sent-log is exposed");
  assert.ok(app.deps, "core deps are exposed");
});

test("every bot factory produces a valid BotModule satisfying the contract", () => {
  const config = loadConfig(fullyEnabledEnv());
  const app = buildApp(config);

  // All four bot factories ran.
  assert.equal(app.bots.length, ALL_BOT_NAMES.length);

  const names = app.bots.map((b) => b.name).sort();
  assert.deepEqual(names, [...ALL_BOT_NAMES].sort());

  for (const bot of app.bots) {
    assert.equal(typeof bot.name, "string");
    assert.equal(typeof bot.enabled, "function");
    // Optional contract hooks must be functions when present.
    if (bot.registerWebhooks !== undefined) {
      assert.equal(typeof bot.registerWebhooks, "function");
    }
    if (bot.registerJobs !== undefined) {
      assert.equal(typeof bot.registerJobs, "function");
    }
    // With all flags on, every bot reports enabled.
    assert.equal(bot.enabled(config), true, `${bot.name} should be enabled`);
  }
});

test("disabled bots register nothing (kill-switch contract)", () => {
  // Default env: all BOT_*_ENABLED default to false.
  const config = loadConfig({ BOTS_MOCK_MODE: "true", LOG_LEVEL: "error" });
  const app = buildApp(config);

  // Factories still run, but none report enabled, and no jobs were registered.
  assert.equal(app.bots.length, ALL_BOT_NAMES.length);
  for (const bot of app.bots) {
    assert.equal(bot.enabled(config), false, `${bot.name} should be disabled by default`);
  }
  assert.deepEqual(app.scheduler.jobNames(), [], "no jobs when all bots disabled");
});

test("scheduler.runAll() runs every registered job without throwing", async () => {
  const config = loadConfig(fullyEnabledEnv());
  const app = buildApp(config);

  // jobNames is a list of unique strings (stubs may register zero — that's ok).
  const jobNames = app.scheduler.jobNames();
  assert.ok(Array.isArray(jobNames));
  assert.equal(new Set(jobNames).size, jobNames.length, "job names are unique");

  // Must not throw regardless of how many jobs the (stub or real) bots registered.
  await assert.doesNotReject(() => app.scheduler.runAll());

  // Re-running is idempotent at the harness level (no throw on a second pass).
  await assert.doesNotReject(() => app.scheduler.runAll());
});

test("webhook router dispatch is a no-throw no-op when no handler matches", async () => {
  const config = loadConfig(fullyEnabledEnv());
  const app = buildApp(config);

  // Feed one fake inbound event per messaging platform. Whether a bot handles
  // it or not, dispatch must resolve without throwing and without real I/O.
  await assert.doesNotReject(() => app.router.dispatch(fakeWhatsAppMessage()));
  await assert.doesNotReject(() => app.router.dispatch(fakeInstagramMessage()));
  await assert.doesNotReject(() => app.router.dispatch(fakeFacebookMessage()));
});

test("fixtures + fake clock are deterministic and wired to the in-memory db", async () => {
  const config = loadConfig(fullyEnabledEnv());
  const app = buildApp(config);
  const clock = createFakeClock();

  // Fixtures are stable across calls (no Date.now()).
  assert.equal(sampleAppointment().createdAt, FIXED_NOW_ISO);
  assert.equal(sampleAppointment().id, sampleAppointment().id);
  assert.equal(clock.nowIso(), FIXED_NOW_ISO);

  // The shared in-memory db (exposed via deps) accepts the fixtures.
  const appt = sampleAppointment();
  await app.deps.db.upsertAppointment(appt);
  assert.deepEqual(await app.deps.db.getAppointment(appt.id), appt);

  await app.deps.db.enqueuePost(sampleScheduledPost());

  // Retention purge uses the fake clock; advancing past the window purges.
  const before = await app.deps.db.purgeExpired({
    nowIso: clock.nowIso(),
    appointmentDays: config.retention.appointmentDays,
    enquiryDays: config.retention.enquiryDays,
  });
  assert.equal(before.appointments, 0, "fresh appointment is not purged");

  clock.advanceDays(config.retention.appointmentDays + 1);
  const after = await app.deps.db.purgeExpired({
    nowIso: clock.nowIso(),
    appointmentDays: config.retention.appointmentDays,
    enquiryDays: config.retention.enquiryDays,
  });
  assert.equal(after.appointments, 1, "appointment purged once past retention window");
});
