/**
 * Job registry / scheduler — FROZEN (Phase 1).
 *
 * Bots register cron-like jobs in `registerJobs(scheduler)`: WhatsApp reminders,
 * the post-publish runner, campaign-draft prep, nightly retention purge.
 *
 * The scaffold uses a manual-trigger scheduler with an injectable clock so tests
 * run deterministically (no real timers, no Date.now()). A real timer-driven
 * impl (systemd timer or node-cron) is a later task behind this same interface.
 */

export type Job = () => Promise<void>;

export interface Scheduler {
  /**
   * Register a job. `everyMs` is the desired cadence (documentation/real-impl
   * use); the scaffold's runner triggers jobs explicitly via `runJob`/`runDue`.
   */
  register(name: string, everyMs: number, job: Job): void;
}

export interface SchedulerControl extends Scheduler {
  /** Names of all registered jobs. */
  jobNames(): string[];
  /** Run a single named job now (tests / manual ops). */
  runJob(name: string): Promise<void>;
  /** Run every registered job once (smoke test). */
  runAll(): Promise<void>;
  /**
   * Start real timers (one per job at its registered cadence) for live mode.
   * Returns a stop() that clears them all. A job that throws is caught + logged
   * via `onError` so one bad run never kills the loop. No-op in tests (they
   * drive jobs explicitly via runJob/runAll instead).
   */
  start(onError?: (name: string, err: unknown) => void): () => void;
}

export function createScheduler(): SchedulerControl {
  const jobs = new Map<string, { everyMs: number; job: Job }>();
  return {
    register(name, everyMs, job) {
      if (jobs.has(name)) throw new Error(`Duplicate job name: ${name}`);
      jobs.set(name, { everyMs, job });
    },
    jobNames() {
      return [...jobs.keys()];
    },
    async runJob(name) {
      const entry = jobs.get(name);
      if (!entry) throw new Error(`No such job: ${name}`);
      await entry.job();
    },
    async runAll() {
      for (const { job } of jobs.values()) await job();
    },
    start(onError) {
      const timers: ReturnType<typeof setInterval>[] = [];
      for (const [name, { everyMs, job }] of jobs) {
        const tick = (): void => {
          void job().catch((err) => onError?.(name, err));
        };
        timers.push(setInterval(tick, everyMs));
      }
      return () => {
        for (const t of timers) clearInterval(t);
      };
    },
  };
}

/** Common cadences, in ms, for `register`. */
export const Cadence = {
  everyMinute: 60_000,
  every15Min: 15 * 60_000,
  hourly: 60 * 60_000,
  daily: 24 * 60 * 60_000,
} as const;
