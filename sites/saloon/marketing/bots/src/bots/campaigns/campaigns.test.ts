/**
 * Campaigns bot tests — Phase 2 · Agent D.
 *
 * Runs offline against `createMockSenders` + `createInMemoryDb` (frozen core).
 * Asserts the money-safety contract: drafts are PAUSED + within budget + a human
 * is notified; an over-budget preset is clamped (never silently sent at the
 * requested amount); nothing is prepared when the spend kill-switch is off.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  loadConfig,
  createLogger,
  createInMemoryDb,
  createMockSenders,
  type Config,
  type Db,
} from "../../core/index.ts";

import { createBot, prepareDrafts, autoPauseIfFull, buildPausedDraft } from "./index.ts";
import { clampDailyBudget } from "./budget.ts";
import { PRESETS, getPreset } from "./presets.ts";

/** A silent logger so test output stays clean. */
const quietLog = createLogger("error", "test");

/** Build a config with the campaign bot + spend switch ON, low daily cap. */
function liveConfig(overrides: Partial<Config["budget"]> = {}): Config {
  const base = loadConfig({
    BOT_CAMPAIGNS_ENABLED: "true",
    ADS_SPEND_ENABLED: "true",
  });
  return { ...base, budget: { ...base.budget, ...overrides } };
}

test("prepared drafts are PAUSED, within budget, and notify a human", async () => {
  const config = liveConfig();
  const db = createInMemoryDb();
  const { senders, log } = createMockSenders();

  await prepareDrafts({ config, log: quietLog, db, senders });

  // One draft per preset reached the MarketingClient.
  assert.equal(log.campaignDrafts.length, PRESETS.length);
  assert.ok(log.campaignDrafts.length > 0, "expected at least one preset");

  for (const draft of log.campaignDrafts) {
    // Money safety: never anything but PAUSED, never awaiting approval skipped.
    assert.equal(draft.status, "PAUSED");
    assert.equal(draft.approvalState, "awaiting_review");
    assert.equal(draft.currency, "RON");
    // Within the configured daily ceiling.
    assert.ok(
      draft.dailyBudgetMinor <= config.budget.dailyMinor,
      `daily ${draft.dailyBudgetMinor} must be <= cap ${config.budget.dailyMinor}`,
    );
    // RO copy present + local geo.
    assert.ok(draft.copyRo.length > 0);
    assert.equal(draft.audience.city, "Târgu-Jiu");
  }

  // A human got an approval notification per prepared draft.
  assert.equal(log.notifications.length, PRESETS.length);
  for (const n of log.notifications) {
    assert.match(n.subject, /PAUSED/);
    assert.match(n.body, /aprobare umană/); // human-in-the-loop wording
  }

  // Nothing went live: no campaigns were paused (auto-pause job not run here).
  assert.equal(log.pausedCampaigns.length, 0);
});

test("a preset above the daily cap is clamped, not silently sent at requested amount", async () => {
  // Pick the highest-budget preset and set the cap below it.
  const maxRequested = Math.max(...PRESETS.map((p) => p.requestedDailyMinor));
  const tinyCap = Math.floor(maxRequested / 2);
  const config = liveConfig({ dailyMinor: tinyCap });

  const db = createInMemoryDb();
  const { senders, log } = createMockSenders();

  await prepareDrafts({ config, log: quietLog, db, senders });

  // Every prepared draft respects the (now tiny) cap — none at the requested amount.
  assert.ok(log.campaignDrafts.length > 0);
  for (const draft of log.campaignDrafts) {
    assert.ok(
      draft.dailyBudgetMinor <= tinyCap,
      `draft ${draft.presetKey} budget ${draft.dailyBudgetMinor} exceeded cap ${tinyCap}`,
    );
  }

  // At least one preset was actually over-cap and got clamped down to the cap.
  const clampedToCap = log.campaignDrafts.filter((d) => d.dailyBudgetMinor === tinyCap);
  assert.ok(clampedToCap.length > 0, "expected at least one preset clamped to the cap");

  // The over-budget request was NOT sent as-is.
  const sentAtRequested = log.campaignDrafts.some((d) => d.dailyBudgetMinor === maxRequested);
  assert.equal(sentAtRequested, false, "an over-cap budget must never be sent at the requested amount");
});

test("nothing is prepared when adsSpendEnabled=false (spend kill-switch)", async () => {
  const base = loadConfig({ BOT_CAMPAIGNS_ENABLED: "true", ADS_SPEND_ENABLED: "false" });
  const db = createInMemoryDb();
  const { senders, log } = createMockSenders();

  await prepareDrafts({ config: base, log: quietLog, db, senders });

  assert.equal(log.campaignDrafts.length, 0, "kill-switch off => no drafts created");
  assert.equal(log.notifications.length, 0, "kill-switch off => no notifications");
});

test("enabled() requires BOTH the bot flag AND the spend kill-switch", () => {
  const db = createInMemoryDb();
  const { senders } = createMockSenders();
  const bot = createBot({ config: loadConfig(), logger: quietLog, db, senders });

  assert.equal(bot.name, "campaigns");
  assert.equal(bot.enabled(loadConfig({ BOT_CAMPAIGNS_ENABLED: "true", ADS_SPEND_ENABLED: "true" })), true);
  assert.equal(bot.enabled(loadConfig({ BOT_CAMPAIGNS_ENABLED: "true", ADS_SPEND_ENABLED: "false" })), false);
  assert.equal(bot.enabled(loadConfig({ BOT_CAMPAIGNS_ENABLED: "false", ADS_SPEND_ENABLED: "true" })), false);
});

test("registerJobs registers the prepare + auto-pause jobs", () => {
  const db = createInMemoryDb();
  const { senders } = createMockSenders();
  const bot = createBot({ config: liveConfig(), logger: quietLog, db, senders });

  const names: string[] = [];
  bot.registerJobs?.({ register: (name) => names.push(name) });

  assert.deepEqual(
    names.sort(),
    ["campaigns.autopause-full-calendar", "campaigns.prepare-drafts"],
  );
});

test("auto-pause pauses lead campaigns only when the calendar is full (no approval needed)", async () => {
  const { senders, log } = createMockSenders();

  // Calendar NOT full -> no pause.
  const notFull = createInMemoryDb();
  await autoPauseIfFull({ log: quietLog, db: notFull, senders });
  assert.equal(log.pausedCampaigns.length, 0);

  // Calendar full -> pause exactly the lead presets, and inform (not ask) a human.
  const fullDb: Db = { ...createInMemoryDb(), async isCalendarFull() { return true; } };
  await autoPauseIfFull({ log: quietLog, db: fullDb, senders });

  const leadKeys = PRESETS.filter((p) => p.leadGen).map((p) => p.key).sort();
  assert.deepEqual([...log.pausedCampaigns].sort(), leadKeys);
  // Pausing stops spend -> it's informational, never an approval request.
  assert.ok(leadKeys.length > 0, "expected at least one lead preset");
  assert.equal(log.notifications.length, 1);
  assert.match(log.notifications[0]!.subject, /pauză/);
});

test("clampDailyBudget clamps over-cap and passes within-cap unchanged", () => {
  const caps = { dailyMinor: 5000, lifetimeMinor: 150000 };

  const over = clampDailyBudget(9999, caps);
  assert.equal(over.effectiveDailyMinor, 5000);
  assert.equal(over.clamped, true);
  assert.match(over.reason, /exceeds cap/);

  const within = clampDailyBudget(3000, caps);
  assert.equal(within.effectiveDailyMinor, 3000);
  assert.equal(within.clamped, false);

  // Defensive: non-positive / non-finite => 0 (nothing to spend).
  assert.equal(clampDailyBudget(-1, caps).effectiveDailyMinor, 0);
  assert.equal(clampDailyBudget(Number.NaN, caps).effectiveDailyMinor, 0);
});

test("buildPausedDraft always produces status PAUSED for every preset", () => {
  const config = liveConfig();
  const fixed = new Date("2026-05-29T10:00:00.000Z");
  for (const preset of PRESETS) {
    const { draft } = buildPausedDraft(preset, config, quietLog, fixed);
    assert.equal(draft.status, "PAUSED");
    assert.equal(draft.presetKey, preset.key);
    assert.equal(draft.objective, preset.objective);
    assert.equal(draft.createdAt, fixed.toISOString());
  }
  // getPreset sanity (used by ops/tests).
  assert.equal(getPreset("click-to-whatsapp")?.objective, "OUTCOME_LEADS");
  assert.equal(getPreset("nope"), undefined);
});
