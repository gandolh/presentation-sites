/**
 * Scheduler bot — schedule & publish posts (IG / FB / TikTok).
 * Phase 2 · Agent C. Implements this folder ONLY; codes against the FROZEN
 * `../../core/index.ts` contracts. No real API calls / tokens / uploads.
 *
 * Plan:  ../../../scheduler/todo.md
 * Rules: ../../../COMPLIANCE.md
 *
 * What it does: a publish-runner job pulls posts that are due (db.listDuePosts),
 * flips each to "publishing", publishes to every target platform via the
 * ContentPublisher (the IG create->poll->publish dance is the publisher's
 * concern — see senders.ts), records a per-platform result, then marks the post
 * "published" (all targets ok) or "failed" (any target failed). Per-platform
 * caps (IG <=100/24h, TikTok <=25/24h) are enforced in code via a CapLedger so a
 * loop bug can never exceed the documented ceilings. Posts are published with a
 * human-spaced cadence — never machine-gun bursts (COMPLIANCE #5).
 */

import {
  Cadence,
  type CoreDeps,
  type BotModule,
  type Config,
  type Scheduler,
  type ScheduledPost,
  type Platform,
  type ContentPublisher,
  type Logger,
} from "../../core/index.ts";

import { createCapLedger, type CapLedger } from "./caps.ts";

/** The name the scheduler registers its job under (stable for ops/tests). */
export const PUBLISH_RUNNER_JOB = "scheduler.publish-runner";

/**
 * Human-spaced cadence: minimum gap between two publishes in the same run so we
 * never burst (COMPLIANCE #5). In production this is a real wait; in tests it is
 * set to 0 and `sleep` is a no-op, keeping the job deterministic and instant.
 */
const DEFAULT_MIN_SPACING_MS = 90_000; // 90s between publishes — gentle, human-like

/** Per-platform publish result, matching ScheduledPost.results' value shape. */
type PublishResult = { ok: boolean; externalId?: string; error?: string };

/** Knobs the runner needs; injected so the job stays deterministic in tests. */
export interface PublishRunnerOptions {
  publisher: ContentPublisher;
  db: Pick<CoreDeps["db"], "listDuePosts" | "updatePost">;
  logger: Logger;
  caps: CapLedger;
  /** Returns "now" as epoch ms. Defaults to Date.now (only called inside the job). */
  now?: () => number;
  /** Minimum spacing between publishes (ms). Tests pass 0. */
  minSpacingMs?: number;
  /** Sleeps `ms`. Tests pass a no-op so the job runs instantly. */
  sleep?: (ms: number) => Promise<void>;
}

const realSleep = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms));

/**
 * Build a per-platform result object honoring exactOptionalPropertyTypes:
 * optional keys are only present when they have a value (never `undefined`).
 */
function toResult(r: { ok: boolean; externalId?: string; error?: string }): PublishResult {
  const out: PublishResult = { ok: r.ok };
  if (r.externalId !== undefined) out.externalId = r.externalId;
  if (r.error !== undefined) out.error = r.error;
  return out;
}

/**
 * The publish-runner job body. Exported so tests drive it directly with an
 * injected clock + no-op sleep; `registerJobs` wires the production variant.
 *
 * Compute "now" once per run so all cap-window math for the run is consistent.
 */
export function makePublishRunner(opts: PublishRunnerOptions): () => Promise<void> {
  const {
    publisher,
    db,
    logger,
    caps,
    now = () => Date.now(),
    minSpacingMs = DEFAULT_MIN_SPACING_MS,
    sleep = realSleep,
  } = opts;

  return async function publishRunner(): Promise<void> {
    const startedMs = now();
    const nowIso = new Date(startedMs).toISOString();

    const due = await db.listDuePosts(nowIso);
    if (due.length === 0) {
      logger.debug("no due posts");
      return;
    }
    logger.info("publishing due posts", { count: due.length });

    let publishedSoFar = 0; // drives human-spaced cadence across this run

    for (const post of due) {
      // Snapshot to a fresh object; never mutate the array element in place.
      const results: NonNullable<ScheduledPost["results"]> = { ...(post.results ?? {}) };
      const publishing: ScheduledPost = { ...post, status: "publishing", results };
      await db.updatePost(publishing);

      let allOk = post.targets.length > 0;

      for (const target of post.targets) {
        // Human-spaced cadence: pause before every publish after the first.
        if (publishedSoFar > 0 && minSpacingMs > 0) {
          await sleep(minSpacingMs);
        }

        // Use a per-target "now" so spacing pushes timestamps forward in the
        // cap window the same way it would in production.
        const targetNowMs = now();

        // HARD CAP GUARD — checked BEFORE every publish. A loop bug cannot get
        // past this: if the platform is at its ceiling, we refuse to publish.
        if (!caps.canPublish(target, targetNowMs)) {
          const error = `cap reached for ${target}: refusing to publish (window ceiling hit)`;
          logger.warn("publish blocked by cap guard", {
            postId: post.id,
            target,
            countInWindow: caps.countInWindow(target, targetNowMs),
          });
          results[target] = { ok: false, error };
          allOk = false;
          continue;
        }

        let result: PublishResult;
        try {
          // TODO(impl): real ContentPublisher does the per-platform pipeline here:
          //   IG  — create media container (Reels 9:16, H.264) -> poll status
          //          until FINISHED -> publish; surface processing failures.
          //   FB  — create + publish via Content Publishing API on the Page.
          //   TikTok — Content Posting API (OAuth, MP4 <=1GB), poll publish status.
          // We only await the result; assets/tokens/HTTP belong to the impl.
          const r = await publisher.publish(post, target);
          result = toResult(r);
        } catch (err) {
          // Network/transport faults surface as a failed target, never a throw
          // that aborts the whole run. (redacted — no PII, no asset bytes)
          result = { ok: false, error: `publish threw: ${String(err)}` };
        }

        results[target] = result;
        publishedSoFar += 1;

        if (result.ok) {
          // Only successful publishes count against the cap.
          caps.record(target, targetNowMs);
        } else {
          allOk = false;
          // TODO(impl): alert a human on failure (Notifier) + schedule a retry.
          // Scaffold just logs; alerting/retry is a follow-up.
          logger.error("publish failed", {
            postId: post.id,
            target,
            error: result.error ?? "unknown",
          });
        }
      }

      const finished: ScheduledPost = {
        ...post,
        status: allOk ? "published" : "failed",
        results,
      };
      await db.updatePost(finished);

      logger.info("post processed", {
        postId: post.id,
        status: finished.status,
        targets: post.targets.length,
      });
    }
  };
}

export const createBot = (deps: CoreDeps): BotModule => {
  const log = deps.logger.child("scheduler");
  // One cap ledger per bot instance: its counts persist across job runs so the
  // rolling-window caps are actually enforced over time (not reset each tick).
  const caps = createCapLedger();

  const runner = makePublishRunner({
    publisher: deps.senders.publisher,
    db: deps.db,
    logger: log,
    caps,
    // Human-spaced cadence from config: 0 in mock mode (instant), 90s live.
    minSpacingMs: deps.config.publishSpacingMs,
  });

  return {
    name: "scheduler",
    enabled: (config: Config) => config.enabled.scheduler,
    registerJobs(scheduler: Scheduler) {
      // Tick frequently; the runner only acts on posts that are actually due
      // (publishAt <= now). We post 3-5/week, so most ticks are no-ops.
      scheduler.register(PUBLISH_RUNNER_JOB, Cadence.every15Min, runner);
      log.debug("scheduler.registerJobs", { job: PUBLISH_RUNNER_JOB });
    },
  };
};
