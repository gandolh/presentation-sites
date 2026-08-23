/**
 * WhatsApp bot — booking confirmations, reminders & inbound auto-reply.
 * Phase 2 · Agent A. Implements ONLY this folder, against the FROZEN core
 * contracts (../../core/index.ts). Mock senders only — no real Cloud API calls.
 *
 * Plan: ../../../whatsapp/todo.md   Rules: ../../../COMPLIANCE.md
 *
 * What it wires:
 *  - registerJobs: confirmation + reminder (UTILITY templates) + nightly purge.
 *  - registerWebhooks: inbound `whatsapp` handler — menu keywords, booking
 *    hand-off, STOP opt-out. Inbound-only, 24h-window aware.
 */

import type { CoreDeps, BotModule, Config } from "../../core/index.ts";
import { Cadence } from "../../core/index.ts";
import {
  makeReminderJob,
  makeConfirmationJob,
  makePurgeJob,
  jobDepsFrom,
  type Clock,
} from "./jobs.ts";
import { makeInboundHandler, handlerDepsFrom } from "./handler.ts";

/** Allow tests to inject a deterministic clock; defaults to real time. */
export interface WhatsAppBotOptions {
  now?: Clock;
}

export const createBot = (deps: CoreDeps, opts: WhatsAppBotOptions = {}): BotModule => {
  const log = deps.logger.child("whatsapp");
  const now: Clock = opts.now ?? (() => new Date());

  return {
    name: "whatsapp",
    enabled: (config: Config) => config.enabled.whatsapp,

    registerJobs(scheduler) {
      const jd = jobDepsFrom(deps, log, now);
      // Confirmations: send out any newly-confirmed slots (UTILITY template).
      scheduler.register("whatsapp:confirmations", Cadence.every15Min, makeConfirmationJob(jd));
      // Reminders: ~24h before the appointment (UTILITY template) — biggest
      // no-show reducer.
      scheduler.register("whatsapp:reminders", Cadence.hourly, makeReminderJob(jd));
      // Retention purge (COMPLIANCE #10): nightly, config-driven windows.
      scheduler.register(
        "whatsapp:purge",
        Cadence.daily,
        makePurgeJob({ ...jd, config: deps.config }),
      );
      log.debug("whatsapp jobs registered", {
        jobs: ["whatsapp:confirmations", "whatsapp:reminders", "whatsapp:purge"],
      });
    },

    registerWebhooks(router) {
      const handler = makeInboundHandler(handlerDepsFrom(deps, log));
      router.onMessage("whatsapp", handler);
      log.debug("whatsapp inbound handler registered");
    },
  };
};
