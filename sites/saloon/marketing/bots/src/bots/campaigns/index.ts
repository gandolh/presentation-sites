/**
 * Campaigns bot — prepare PAUSED ad drafts for human approval.
 * Phase 2 · Agent D implementation. Owns ONLY this folder.
 *
 * Plan: ../../../campaigns/todo.md   Rules: ../../../COMPLIANCE.md (money safety)
 *
 * WHAT THIS DOES
 *  - "prepare drafts" job: turn each config-defined preset into a PAUSED
 *    `CampaignDraft`, clamp its budget to `config.budget`, create it via the
 *    MarketingClient (PAUSED only), persist it for audit, and notify a human to
 *    review + flip it live in Ads Manager.
 *  - "auto-pause full calendar" job: when Ana's one chair is fully booked, pause
 *    lead campaigns. Pausing only STOPS spend, so it needs no human approval
 *    (COMPLIANCE #7). Resuming is left to a human.
 *
 * MONEY SAFETY (COMPLIANCE #6–#8), visible in code:
 *  - every draft is built with status "PAUSED" and re-checked by `assertPaused`;
 *  - `clampDailyBudget` refuses/clamps anything above the configured ceiling and
 *    logs the reason — nothing over-budget is ever sent silently;
 *  - `enabled()` honors the `adsSpendEnabled` kill-switch: if false the bot
 *    registers nothing and prepares nothing.
 *  - The bot NEVER creates an ACTIVE campaign. There is no such code path.
 *
 * NO real API calls / tokens / spend: everything goes through the mock
 * MarketingClient + Notifier from core. `// TODO(impl):` marks where real Meta
 * Marketing API params / Ads Manager deep links go.
 */

import { randomUUID } from "node:crypto";

import type {
  CoreDeps,
  BotModule,
  Config,
  Scheduler,
  Logger,
  Db,
  Senders,
  CampaignDraft,
} from "../../core/index.ts";
import { Cadence } from "../../core/index.ts";

import {
  PRESETS,
  SALON_CITY,
  SALON_GEO_RADIUS_KM,
  SALON_MIN_AGE,
  type CampaignPreset,
} from "./presets.ts";
import { assertPaused, clampDailyBudget } from "./budget.ts";

/** Job names — exported so tests / ops can trigger them deterministically. */
export const JOB_PREPARE_DRAFTS = "campaigns.prepare-drafts";
export const JOB_AUTOPAUSE_FULL = "campaigns.autopause-full-calendar";

/** Days of look-ahead for the capacity guardrail (one-chair salon). */
const CALENDAR_FULL_LOOKAHEAD_DAYS = 3;

/**
 * Build a PAUSED `CampaignDraft` from a preset, clamping the budget to the cap.
 * Returns the draft + whether the budget was clamped (for the notification).
 * NOTE: status is hard-coded "PAUSED" — there is no parameter to make it active.
 */
export function buildPausedDraft(
  preset: CampaignPreset,
  config: Config,
  log: Logger,
  now: Date = new Date(),
): { draft: CampaignDraft; clamped: boolean } {
  const decision = clampDailyBudget(preset.requestedDailyMinor, config.budget);
  if (decision.clamped) {
    // Visible refusal-to-overspend: logged, never silent.
    log.warn("budget clamped", { preset: preset.key, reason: decision.reason });
  }

  const draft: CampaignDraft = {
    id: randomUUID(),
    platform: preset.platform,
    presetKey: preset.key,
    objective: preset.objective,
    status: "PAUSED", // <-- money safety: ALWAYS paused; no other value is reachable.
    dailyBudgetMinor: decision.effectiveDailyMinor,
    currency: "RON",
    audience: {
      geoRadiusKm: SALON_GEO_RADIUS_KM,
      city: SALON_CITY,
      minAge: SALON_MIN_AGE,
    },
    creativeRef: preset.creativeRef,
    copyRo: preset.copyRo,
    createdAt: now.toISOString(),
    approvalState: "awaiting_review", // human flips this; the service never approves.
  };

  // TODO(impl): map preset -> real Meta Marketing API params here:
  //   POST /act_{adsAccountId}/campaigns { objective, status: "PAUSED",
  //     special_ad_categories: [] } -> ad set (geo radius around Târgu-Jiu, age,
  //     daily_budget = draft.dailyBudgetMinor, optimization_goal) -> creative
  //     (RO copy + resolved creativeRef) -> ad. Returns the platform draft id.
  return { draft, clamped: decision.clamped };
}

/** RON minor units -> "12,34 RON" for human-readable notifications. */
function formatRon(minor: number): string {
  return `${(minor / 100).toFixed(2).replace(".", ",")} RON`;
}

/** Compose the human-approval notification body for a prepared draft. */
function notificationBody(draft: CampaignDraft, clamped: boolean): string {
  const lines = [
    `Preset: ${draft.presetKey} (${draft.platform})`,
    `Obiectiv: ${draft.objective}`,
    `Status: ${draft.status} — necesită aprobare umană înainte de a cheltui.`,
    `Buget zilnic: ${formatRon(draft.dailyBudgetMinor)}${clamped ? " (redus la plafonul configurat)" : ""}`,
    `Public: ${draft.audience.city}, rază ${draft.audience.geoRadiusKm} km, vârstă ${draft.audience.minAge}+`,
    `Copy: ${draft.copyRo}`,
    // TODO(impl): include a deep link to review + publish in Ads Manager.
    `Pentru a porni campania, deschide Ads Manager și apasă „Publish”.`,
  ];
  return lines.join("\n");
}

/**
 * The "prepare drafts" job. For each preset: build a PAUSED draft (budget
 * clamped), create it PAUSED via the MarketingClient, persist for audit, and
 * notify a human. Honors the spend kill-switch: prepares NOTHING if it's off.
 */
export async function prepareDrafts(deps: {
  config: Config;
  log: Logger;
  db: Db;
  senders: Senders;
}): Promise<void> {
  const { config, log, db, senders } = deps;

  // Spend kill-switch (COMPLIANCE #8): off => prepare nothing live.
  if (!config.adsSpendEnabled) {
    log.warn("adsSpendEnabled is false — preparing no campaign drafts");
    return;
  }

  for (const preset of PRESETS) {
    const { draft, clamped } = buildPausedDraft(preset, config, log);

    // Last line of defense before anything leaves the bot.
    assertPaused(draft);

    const result = await senders.marketing.createPausedCampaign(draft);
    if (!result.ok) {
      // The mock MarketingClient refuses non-PAUSED; surface any refusal.
      log.error("createPausedCampaign refused", { preset: preset.key, error: result.error });
      continue;
    }

    // Audit: every draft logged with full parameters (COMPLIANCE money safety).
    await db.insertCampaignDraft(draft);
    log.info("campaign draft prepared (PAUSED)", {
      preset: preset.key,
      draftId: draft.id,
      platformDraftId: result.draftId,
      dailyBudgetMinor: draft.dailyBudgetMinor,
      clamped,
    });

    // Human-in-the-loop: notify a person to review + publish.
    await senders.notifier.notify(
      `Campanie pregătită (PAUSED) — ${preset.key}`,
      notificationBody(draft, clamped),
    );
  }
}

/**
 * The capacity guardrail job. If the calendar is full, PAUSE lead campaigns.
 * Pausing only stops spend, so it's safe without approval (COMPLIANCE #7).
 * Resuming is deliberately NOT automated — a human must do that.
 */
export async function autoPauseIfFull(deps: {
  log: Logger;
  db: Db;
  senders: Senders;
}): Promise<void> {
  const { log, db, senders } = deps;

  const full = await db.isCalendarFull(CALENDAR_FULL_LOOKAHEAD_DAYS);
  if (!full) {
    log.debug("calendar not full — lead campaigns left as-is");
    return;
  }

  // TODO(impl): resolve the live external campaign ids for active lead presets
  //   via the MarketingClient / stored mapping. The scaffold pauses by preset
  //   key so the safe behavior (stop spend on full calendar) is exercised.
  const leadPresetKeys = PRESETS.filter((p) => p.leadGen).map((p) => p.key);
  for (const key of leadPresetKeys) {
    const res = await senders.marketing.pauseCampaign(key);
    log.info("auto-paused lead campaign (calendar full)", { preset: key, ok: res.ok });
  }

  // Tell the human spend was stopped (informational — not an approval request).
  await senders.notifier.notify(
    "Campanii de lead-uri puse pe pauză — agendă plină",
    `Agenda este plină pentru următoarele ${CALENDAR_FULL_LOOKAHEAD_DAYS} zile, ` +
      `așa că am oprit cheltuiala pe campaniile de programări (${leadPresetKeys.join(", ")}). ` +
      `Repornirea o faci tu din Ads Manager când se eliberează locuri.`,
  );
}

export const createBot = (deps: CoreDeps): BotModule => {
  const log = deps.logger.child("campaigns");
  return {
    name: "campaigns",
    // Kill-switch: needs BOTH the per-bot flag AND the master spend switch.
    enabled: (config: Config) => config.enabled.campaigns && config.adsSpendEnabled,
    registerJobs(scheduler: Scheduler) {
      scheduler.register(JOB_PREPARE_DRAFTS, Cadence.daily, () =>
        prepareDrafts({ config: deps.config, log, db: deps.db, senders: deps.senders }),
      );
      scheduler.register(JOB_AUTOPAUSE_FULL, Cadence.hourly, () =>
        autoPauseIfFull({ log, db: deps.db, senders: deps.senders }),
      );
      log.debug("campaigns.registerJobs", {
        jobs: [JOB_PREPARE_DRAFTS, JOB_AUTOPAUSE_FULL],
      });
    },
  };
};
