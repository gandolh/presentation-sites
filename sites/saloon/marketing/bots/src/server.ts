/**
 * Service entrypoint — FROZEN-ish (Phase 1; Phase 3 finalizes wiring).
 *
 * Boots config -> logger -> db -> senders, builds every bot via its
 * `createBot`, registers the ENABLED ones' webhooks + jobs. `buildApp` is
 * exported (no side effects) so the shared-tests harness can boot the whole
 * thing in mock mode.
 *
 * Scaffold ALWAYS runs in mock mode: no real HTTP server, no live API calls.
 */

import {
  loadConfig,
  createLogger,
  createInMemoryDb,
  createMockSenders,
  createWebhookRouter,
  createScheduler,
  assertSecretsForLive,
  createSqliteDb,
  createLiveSenders,
  startWebhookServer,
  type Db,
  type Senders,
  type CoreDeps,
  type BotModule,
  type Config,
  type SentLog,
} from "./core/index.ts";

import { createBot as createWhatsApp } from "./bots/whatsapp/index.ts";
import { createBot as createResponses } from "./bots/responses/index.ts";
import { createBot as createScheduling } from "./bots/scheduler/index.ts";
import { createBot as createCampaigns } from "./bots/campaigns/index.ts";

/** Factories for every bot. Phase 3 keeps this the single registration point. */
const BOT_FACTORIES = [createWhatsApp, createResponses, createScheduling, createCampaigns];

export interface App {
  config: Config;
  bots: BotModule[];
  router: ReturnType<typeof createWebhookRouter>;
  scheduler: ReturnType<typeof createScheduler>;
  /** Present only in mock mode — the recorded mock sends, for tests. */
  sentLog?: SentLog;
  deps: CoreDeps;
}

/**
 * Build the app graph without starting any server.
 *
 * In **mock mode** (the scaffold + all tests) it uses the in-memory db + mock
 * senders and exposes `sentLog`. Outside mock mode it uses the SQLite db + live
 * API senders (constructed only here, so the mock path never touches real I/O).
 */
export function buildApp(config: Config = loadConfig()): App {
  const logger = createLogger(config.logLevel, "bots");

  let db: Db;
  let senders: Senders;
  let sentLog: SentLog | undefined;

  if (config.mockMode) {
    db = createInMemoryDb();
    const mock = createMockSenders();
    senders = mock.senders;
    sentLog = mock.log;
  } else {
    assertSecretsForLive(config);
    db = createSqliteDb(config.dbPath);
    senders = createLiveSenders(config, logger);
  }

  const deps: CoreDeps = { config, logger, db, senders };

  const router = createWebhookRouter();
  const scheduler = createScheduler();

  const bots = BOT_FACTORIES.map((make) => make(deps));
  for (const bot of bots) {
    if (!bot.enabled(config)) {
      logger.info("bot disabled", { bot: bot.name });
      continue;
    }
    bot.registerWebhooks?.(router);
    bot.registerJobs?.(scheduler);
    logger.info("bot registered", { bot: bot.name });
  }

  // sentLog is present in mock mode, absent (undefined) in live mode. With
  // exactOptionalPropertyTypes we include the key only when it has a value.
  return sentLog
    ? { config, bots, router, scheduler, sentLog, deps }
    : { config, bots, router, scheduler, deps };
}

/**
 * Entrypoint.
 *  - mock mode: build the graph and report (no port, no timers, no I/O).
 *  - live mode: open the webhook server + start timer-driven jobs.
 */
async function main(): Promise<void> {
  const app = buildApp();
  const { logger } = app.deps;

  if (app.config.mockMode) {
    logger.info("ana-saloon-bots booted (mock scaffold)", {
      mockMode: true,
      enabledBots: app.bots.filter((b) => b.enabled(app.config)).map((b) => b.name),
      jobs: app.scheduler.jobNames(),
    });
    return;
  }

  // Live: webhook server (inbound messages) + timer-driven scheduler.
  const server = startWebhookServer(app.config, app.router, logger.child("webhook"));
  const stopScheduler = app.scheduler.start((name, err) =>
    logger.error("scheduled job failed", { job: name, err: String(err) }),
  );
  logger.info("ana-saloon-bots running (live)", {
    enabledBots: app.bots.filter((b) => b.enabled(app.config)).map((b) => b.name),
    jobs: app.scheduler.jobNames(),
  });

  // Graceful shutdown: stop timers, close the server + db.
  const shutdown = (): void => {
    logger.info("shutting down");
    stopScheduler();
    server.close();
    void app.deps.db.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Run only when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(JSON.stringify({ level: "error", msg: "boot failed", err: String(err) }));
    process.exit(1);
  });
}
