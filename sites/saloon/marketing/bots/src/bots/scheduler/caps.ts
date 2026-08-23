/**
 * Per-platform publish caps — Scheduler bot (Phase 2 · Agent C).
 *
 * COMPLIANCE (../../../COMPLIANCE.md #5 + scheduler/todo.md "Limits"):
 *   - Instagram: <=100 API-published posts / rolling 24h.
 *   - TikTok:    <=25 posts / rolling 24h (per account/day).
 *   - Facebook:  no hard documented per-day publish cap; we still bound it
 *                generously so a loop bug can never machine-gun the API.
 *
 * The caps are encoded as a rolling-window ledger that records the timestamp of
 * every successful publish per platform. `canPublish` is checked BEFORE every
 * publish, so even a buggy loop that tries to publish the same post forever can
 * never exceed the documented ceilings.
 *
 * Determinism: every method takes an explicit `nowMs` (epoch ms). Nothing here
 * reads the wall clock — the caller (the job) decides "now", and tests inject it.
 */

import type { Platform } from "../../core/index.ts";

/** Rolling-window publish ceiling for one platform. */
export interface PlatformCap {
  /** Max successful publishes allowed inside the window. */
  max: number;
  /** Window length in ms (24h for IG/TikTok). */
  windowMs: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Documented platform caps. We post 3-5/week, so these are never approached in
 * normal operation — they exist purely as a hard guard against a loop bug.
 * WhatsApp is not a publish target for this bot, so it is intentionally absent.
 */
export const PLATFORM_CAPS: Readonly<Partial<Record<Platform, PlatformCap>>> = {
  instagram: { max: 100, windowMs: DAY_MS },
  tiktok: { max: 25, windowMs: DAY_MS },
  // Facebook has no hard published-post/day cap in the Content Publishing API;
  // bound it well below any rate ceiling so the guard still applies.
  facebook: { max: 50, windowMs: DAY_MS },
} as const;

/**
 * Tracks successful publishes per platform within each platform's rolling
 * window. One ledger lives per bot instance (created in `createBot`), so its
 * counts persist across job runs — which is what makes the cap enforceable and
 * testable (enqueue cap+1 posts, run the job, assert the last one is blocked).
 */
export interface CapLedger {
  /**
   * True if another publish to `platform` is allowed at `nowMs`. A platform with
   * no configured cap (e.g. an unknown future platform) is always allowed.
   */
  canPublish(platform: Platform, nowMs: number): boolean;
  /** Record a successful publish to `platform` at `nowMs`. */
  record(platform: Platform, nowMs: number): void;
  /** Current count inside the window (diagnostics / tests). */
  countInWindow(platform: Platform, nowMs: number): number;
}

export function createCapLedger(
  caps: Readonly<Partial<Record<Platform, PlatformCap>>> = PLATFORM_CAPS,
): CapLedger {
  /** Epoch-ms timestamps of successful publishes, per platform. */
  const stamps = new Map<Platform, number[]>();

  /** Drop timestamps older than the window and return the survivors. */
  const fresh = (platform: Platform, nowMs: number): number[] => {
    const cap = caps[platform];
    const all = stamps.get(platform) ?? [];
    if (!cap) return all;
    const cutoff = nowMs - cap.windowMs;
    const kept = all.filter((t) => t > cutoff);
    stamps.set(platform, kept);
    return kept;
  };

  return {
    canPublish(platform, nowMs) {
      const cap = caps[platform];
      if (!cap) return true; // no documented cap => no guard to apply
      return fresh(platform, nowMs).length < cap.max;
    },
    record(platform, nowMs) {
      const kept = fresh(platform, nowMs);
      kept.push(nowMs);
      stamps.set(platform, kept);
    },
    countInWindow(platform, nowMs) {
      return fresh(platform, nowMs).length;
    },
  };
}
