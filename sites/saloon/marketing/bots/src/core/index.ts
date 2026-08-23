/**
 * Core barrel + THE BOT CONTRACT — FROZEN (Phase 1).
 *
 * Phase 2 bots import everything they need from "../../core/index.ts" and each
 * export a `createBot(deps)` returning a `BotModule`. Do not change these
 * signatures in Phase 2 — flag changes for the Phase 1/3 owner.
 */

import type { Config } from "./config.ts";
import type { Logger } from "./logger.ts";
import type { Db } from "./db.ts";
import type { Senders } from "./senders.ts";
import type { WebhookRouter } from "./webhook.ts";
import type { Scheduler } from "./scheduler.ts";
import type { BotName } from "./types.ts";

/** Dependencies handed to every bot's `createBot`. */
export interface CoreDeps {
  config: Config;
  logger: Logger;
  db: Db;
  senders: Senders;
}

/**
 * A bot module. Each bot folder's index.ts exports `createBot(deps): BotModule`.
 *
 * - `enabled()` reads the bot's kill-switch from config; a disabled bot
 *   registers nothing.
 * - `registerWebhooks()` subscribes INBOUND message handlers (optional).
 * - `registerJobs()` registers scheduled jobs (optional).
 */
export interface BotModule {
  name: BotName;
  enabled(config: Config): boolean;
  registerWebhooks?(router: WebhookRouter): void;
  registerJobs?(scheduler: Scheduler): void;
}

/** The factory signature every bot folder must export. */
export type CreateBot = (deps: CoreDeps) => BotModule;

// Re-exports so bots have a single import path.
export * from "./types.ts";
export * from "./config.ts";
export * from "./logger.ts";
export * from "./db.ts";
export * from "./senders.ts";
export * from "./webhook.ts";
export * from "./scheduler.ts";

// Real-impl modules (constructed only outside mock mode by server.ts).
export { createSqliteDb } from "./db-sqlite.ts";
export { createLiveSenders } from "./senders-live.ts";
export { startWebhookServer, parseMetaInbound } from "./webhook-http.ts";
