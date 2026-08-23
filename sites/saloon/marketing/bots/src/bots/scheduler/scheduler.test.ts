/**
 * Scheduler bot tests (Phase 2 · Agent C).
 *
 * Run via the package's test script (node:test + --experimental-strip-types):
 *   npm test            # runs all *.test.ts
 *
 * Uses ONLY the frozen seams: createMockSenders + createInMemoryDb from core.
 * No real I/O, no timers (sleep is a no-op), deterministic injected clock.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createMockSenders,
  createInMemoryDb,
  createScheduler,
  createLogger,
  type ScheduledPost,
  type Platform,
} from "../../core/index.ts";

import {
  createBot,
  makePublishRunner,
  PUBLISH_RUNNER_JOB,
} from "./index.ts";
import { createCapLedger, type PlatformCap } from "./caps.ts";

// Quiet logger so test output stays clean.
const silentLogger = createLogger("error", "test");

/** Fixed clock so cap-window math + ISO timestamps are deterministic. */
const T0 = Date.parse("2026-05-29T10:00:00.000Z");
const fixedNow = () => T0;

function duePost(over: Partial<ScheduledPost> = {}): ScheduledPost {
  return {
    id: over.id ?? "post_1",
    assetRef: "vps://clips/reel-01.mp4",
    captionRo: "Unghii noi, energie nouă. 💅",
    targets: over.targets ?? (["instagram", "facebook", "tiktok"] as Platform[]),
    // Due an hour before "now" so it qualifies as due.
    publishAt: over.publishAt ?? "2026-05-29T09:00:00.000Z",
    status: over.status ?? "queued",
    ...(over.results !== undefined ? { results: over.results } : {}),
  };
}

test("publishes a due post to every target and marks it published", async () => {
  const { senders, log } = createMockSenders();
  const db = createInMemoryDb();

  const post = duePost();
  await db.enqueuePost(post);

  // Spy on updatePost to capture the final stored post state.
  const updates: ScheduledPost[] = [];
  const spyDb = {
    listDuePosts: db.listDuePosts,
    updatePost: async (p: ScheduledPost) => {
      updates.push(p);
      await db.updatePost(p);
    },
  };

  const run = makePublishRunner({
    publisher: senders.publisher,
    db: spyDb,
    logger: silentLogger,
    caps: createCapLedger(),
    now: fixedNow,
    minSpacingMs: 0, // no human spacing in tests
    sleep: async () => {}, // no-op: instant + deterministic
  });

  await run();

  // Published to each target exactly once, via the ContentPublisher.
  assert.equal(log.published.length, post.targets.length);
  const publishedTargets = log.published.map((p) => p.target).sort();
  assert.deepEqual(publishedTargets, [...post.targets].sort());

  // Final stored state is "published".
  const final = updates.at(-1);
  assert.ok(final, "expected a final updatePost call");
  assert.equal(final.status, "published");

  // It is no longer due (status moved out of "queued").
  const due = await db.listDuePosts("2026-05-29T10:00:00.000Z");
  assert.equal(due.length, 0, "published post must no longer be 'queued'/due");

  // Running again must NOT re-publish an already-published post.
  await run();
  assert.equal(
    log.published.length,
    post.targets.length,
    "an already-published post must not be published again",
  );
});

test("records a per-platform result for each target", async () => {
  const { senders } = createMockSenders();
  const db = createInMemoryDb();

  // Capture the final post via a spy on updatePost.
  const updates: ScheduledPost[] = [];
  const spyDb = {
    listDuePosts: db.listDuePosts,
    updatePost: async (p: ScheduledPost) => {
      updates.push(p);
      await db.updatePost(p);
    },
  };

  await db.enqueuePost(duePost({ id: "post_results", targets: ["instagram", "tiktok"] }));

  const run = makePublishRunner({
    publisher: senders.publisher,
    db: spyDb,
    logger: silentLogger,
    caps: createCapLedger(),
    now: fixedNow,
    minSpacingMs: 0,
    sleep: async () => {},
  });

  await run();

  const final = updates.at(-1);
  assert.ok(final, "expected a final updatePost call");
  assert.equal(final.status, "published");
  assert.ok(final.results, "expected per-platform results");
  assert.equal(final.results.instagram?.ok, true);
  assert.equal(final.results.tiktok?.ok, true);
  assert.ok(final.results.instagram?.externalId, "expected an external id from publisher");
});

test("cap guard blocks the (cap+1)th publish to a platform", async () => {
  const { senders, log } = createMockSenders();
  const db = createInMemoryDb();

  // Tiny IG cap so cap+1 is fast to exercise. Window large enough to span the run.
  const CAP = 2;
  const tinyCaps: Partial<Record<Platform, PlatformCap>> = {
    instagram: { max: CAP, windowMs: 24 * 60 * 60 * 1000 },
  };
  const caps = createCapLedger(tinyCaps);

  // Enqueue CAP+1 due IG-only posts.
  for (let i = 0; i < CAP + 1; i++) {
    await db.enqueuePost(
      duePost({ id: `ig_${i}`, targets: ["instagram"], publishAt: "2026-05-29T09:00:00.000Z" }),
    );
  }

  const updates: ScheduledPost[] = [];
  const spyDb = {
    listDuePosts: db.listDuePosts,
    updatePost: async (p: ScheduledPost) => {
      updates.push(p);
      await db.updatePost(p);
    },
  };

  const run = makePublishRunner({
    publisher: senders.publisher,
    db: spyDb,
    logger: silentLogger,
    caps,
    now: fixedNow, // same instant => all within one window
    minSpacingMs: 0,
    sleep: async () => {},
  });

  await run();

  // Only CAP publishes actually hit the ContentPublisher; the (cap+1)th is blocked.
  assert.equal(
    log.published.length,
    CAP,
    `cap guard must stop publishes after ${CAP}; a loop bug cannot exceed the ceiling`,
  );

  // The cap-exceeding post is marked failed with a cap error and NOT published.
  const finals = updates.filter((u) => u.status === "published" || u.status === "failed");
  const failed = finals.filter((u) => u.status === "failed");
  assert.equal(failed.length, 1, "exactly the (cap+1)th post fails");
  const blocked = failed[0];
  assert.ok(blocked, "expected the blocked post");
  assert.equal(blocked.results?.instagram?.ok, false);
  assert.match(blocked.results?.instagram?.error ?? "", /cap reached/i);

  // Ledger reflects exactly CAP successful publishes in the window.
  assert.equal(caps.countInWindow("instagram", T0), CAP);
});

test("a failed target marks the whole post failed but still records each target", async () => {
  const db = createInMemoryDb();

  // Custom publisher: IG ok, TikTok fails.
  const publisher = {
    async publish(_post: ScheduledPost, target: Platform) {
      if (target === "tiktok") return { ok: false, error: "processing_failed" };
      return { ok: true, externalId: `ok_${target}` };
    },
  };

  const updates: ScheduledPost[] = [];
  const spyDb = {
    listDuePosts: db.listDuePosts,
    updatePost: async (p: ScheduledPost) => {
      updates.push(p);
      await db.updatePost(p);
    },
  };

  await db.enqueuePost(duePost({ id: "mixed", targets: ["instagram", "tiktok"] }));

  const run = makePublishRunner({
    publisher,
    db: spyDb,
    logger: silentLogger,
    caps: createCapLedger(),
    now: fixedNow,
    minSpacingMs: 0,
    sleep: async () => {},
  });

  await run();

  const final = updates.at(-1);
  assert.ok(final);
  assert.equal(final.status, "failed");
  assert.equal(final.results?.instagram?.ok, true);
  assert.equal(final.results?.tiktok?.ok, false);
  assert.equal(final.results?.tiktok?.error, "processing_failed");
});

test("createBot exposes the scheduler module and registers the publish-runner job", () => {
  const { senders } = createMockSenders();
  const db = createInMemoryDb();
  const deps = {
    config: {} as never,
    logger: silentLogger,
    db,
    senders,
  };

  const bot = createBot(deps);
  assert.equal(bot.name, "scheduler");

  // enabled() reads the kill-switch flag.
  assert.equal(bot.enabled({ enabled: { scheduler: true } } as never), true);
  assert.equal(bot.enabled({ enabled: { scheduler: false } } as never), false);

  // registerJobs registers exactly the publish-runner under its stable name.
  const scheduler = createScheduler();
  bot.registerJobs?.(scheduler);
  assert.deepEqual(scheduler.jobNames(), [PUBLISH_RUNNER_JOB]);
});

test("human-spaced cadence: sleeps between publishes (after the first)", async () => {
  const { senders } = createMockSenders();
  const db = createInMemoryDb();

  await db.enqueuePost(duePost({ id: "spaced", targets: ["instagram", "facebook", "tiktok"] }));

  const sleeps: number[] = [];
  const run = makePublishRunner({
    publisher: senders.publisher,
    db,
    logger: silentLogger,
    caps: createCapLedger(),
    now: fixedNow,
    minSpacingMs: 90_000,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  });

  await run();

  // 3 targets => 2 inter-publish pauses (none before the very first publish).
  assert.equal(sleeps.length, 2);
  assert.deepEqual(sleeps, [90_000, 90_000]);
});
