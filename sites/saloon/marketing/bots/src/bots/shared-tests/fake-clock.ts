/**
 * Deterministic fake clock — Phase 2 · Agent E.
 *
 * The core scheduler and Db.purgeExpired take an injected `nowIso`/`nowMs`
 * instead of calling Date.now(), so scheduler + retention tests stay
 * reproducible. This helper produces a controllable instant a test can read and
 * advance, without touching real timers.
 *
 * Example:
 *   const clock = createFakeClock();              // starts at FIXED_NOW_ISO
 *   await db.purgeExpired({ nowIso: clock.nowIso(), appointmentDays, enquiryDays });
 *   clock.advanceDays(400);                        // jump past the retention window
 *   await db.purgeExpired({ nowIso: clock.nowIso(), appointmentDays, enquiryDays });
 */

import { FIXED_NOW_ISO } from "./mocks.ts";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export interface FakeClock {
  /** Current instant as epoch milliseconds. */
  nowMs(): number;
  /** Current instant as an ISO 8601 string (UTC, matches fixture timestamps). */
  nowIso(): string;
  /** Move the clock forward by an arbitrary number of milliseconds. */
  advanceMs(ms: number): void;
  advanceSeconds(seconds: number): void;
  advanceMinutes(minutes: number): void;
  advanceHours(hours: number): void;
  advanceDays(days: number): void;
  /** Jump the clock to a specific instant (ISO string or epoch ms). */
  setTo(instant: string | number): void;
  /** Reset back to the start instant the clock was created with. */
  reset(): void;
}

/**
 * Create a fake clock. Defaults to the shared `FIXED_NOW_ISO` so it lines up
 * with the fixtures in ./mocks.ts; pass a different start to anchor elsewhere.
 */
export function createFakeClock(startIso: string = FIXED_NOW_ISO): FakeClock {
  const startMs = Date.parse(startIso);
  if (!Number.isFinite(startMs)) {
    throw new Error(`createFakeClock: invalid start instant "${startIso}"`);
  }

  let currentMs = startMs;

  return {
    nowMs() {
      return currentMs;
    },
    nowIso() {
      return new Date(currentMs).toISOString();
    },
    advanceMs(ms) {
      currentMs += ms;
    },
    advanceSeconds(seconds) {
      currentMs += seconds * MS_PER_SECOND;
    },
    advanceMinutes(minutes) {
      currentMs += minutes * MS_PER_MINUTE;
    },
    advanceHours(hours) {
      currentMs += hours * MS_PER_HOUR;
    },
    advanceDays(days) {
      currentMs += days * MS_PER_DAY;
    },
    setTo(instant) {
      const ms = typeof instant === "number" ? instant : Date.parse(instant);
      if (!Number.isFinite(ms)) {
        throw new Error(`FakeClock.setTo: invalid instant "${String(instant)}"`);
      }
      currentMs = ms;
    },
    reset() {
      currentMs = startMs;
    },
  };
}
