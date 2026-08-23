/**
 * Money-safety guards — Phase 2 · Agent D.
 *
 * This file is where COMPLIANCE.md "Money safety" (#6–#8) is made VISIBLE:
 *
 *  - `clampDailyBudget`  — refuse/clamp anything above `config.budget` ceilings
 *                          and return a logged reason (never silently send).
 *  - `assertPaused`      — hard guard that a draft is ALWAYS "PAUSED" before it
 *                          can reach the MarketingClient.
 *
 * No draft may be built without passing through both. There is no code path in
 * this bot that produces an ACTIVE campaign.
 *
 * Plan: ../../../campaigns/todo.md   Rules: ../../../COMPLIANCE.md (money safety)
 */

import type { BudgetCaps, CampaignDraft } from "../../core/index.ts";

/** Outcome of applying the daily-budget ceiling to a requested amount. */
export interface BudgetDecision {
  /** The budget that is safe to use (== requested, or clamped down to cap). */
  effectiveDailyMinor: number;
  /** True when the requested amount exceeded the cap and had to be clamped. */
  clamped: boolean;
  /** Human/audit-readable reason — logged whenever `clamped` is true. */
  reason: string;
}

/**
 * Enforce the daily ceiling. Rather than refusing outright (which would just
 * silently drop a preset), we CLAMP down to the cap and report it: a PAUSED
 * draft at the safe budget still needs a human to approve before any spend, so
 * clamping is the safe, transparent choice. Either way the over-budget request
 * is NEVER sent as-is.
 *
 * A non-positive or non-finite request is treated as 0 (nothing to spend).
 */
export function clampDailyBudget(requestedMinor: number, caps: BudgetCaps): BudgetDecision {
  const cap = caps.dailyMinor;
  const requested = Number.isFinite(requestedMinor) && requestedMinor > 0 ? Math.floor(requestedMinor) : 0;

  if (requested > cap) {
    return {
      effectiveDailyMinor: cap,
      clamped: true,
      reason: `requested daily budget ${requested} bani exceeds cap ${cap} bani — clamped to cap`,
    };
  }
  return {
    effectiveDailyMinor: requested,
    clamped: false,
    reason: `requested daily budget ${requested} bani within cap ${cap} bani`,
  };
}

/**
 * Guard: a lifetime budget must never exceed the configured lifetime ceiling.
 * Used as a sanity check when a preset (later) carries a lifetime budget. The
 * scaffold presets are daily-budgeted, but the ceiling is enforced here so the
 * contract holds when lifetime budgets are added.
 */
export function lifetimeWithinCap(lifetimeMinor: number, caps: BudgetCaps): boolean {
  return Number.isFinite(lifetimeMinor) && lifetimeMinor >= 0 && lifetimeMinor <= caps.lifetimeMinor;
}

/**
 * HARD guard invoked right before handing a draft to the MarketingClient.
 * `CampaignDraft.status` is the literal type "PAUSED", but a draft can arrive
 * via untyped paths (config, future callers) — so we check at runtime too and
 * throw rather than risk creating spend. This is the last line of defense.
 */
export function assertPaused(draft: CampaignDraft): void {
  if (draft.status !== "PAUSED") {
    throw new Error(
      `MONEY SAFETY VIOLATION: campaign draft ${draft.id} (${draft.presetKey}) ` +
        `had status "${String(draft.status)}" — this service only ever produces PAUSED drafts`,
    );
  }
}
