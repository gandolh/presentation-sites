/**
 * WhatsApp bot — scheduled jobs (confirmations + reminders + nightly purge).
 * Phase 2 · Agent A. Built against core interfaces + mock senders only.
 *
 * COMPLIANCE: confirmations/reminders are UTILITY templates on the contract
 * basis art. 6(1)(b) (todo "Data & legal"), so they don't need marketing
 * consent — but we still skip anyone who pressed STOP (isOptedOut). PII is
 * redacted in logs (#12). Retention purge registered (#10).
 */

import type { CoreDeps, Appointment, Logger, Db, Senders, Config } from "../../core/index.ts";
import { redact } from "../../core/index.ts";
import { TEMPLATES, SERVICE_LABELS } from "./messages.ts";

const PLATFORM = "whatsapp";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Injectable clock so the reminder window is deterministic in tests. */
export type Clock = () => Date;

/** Format an ISO timestamp to a RO date (dd.mm.yyyy) in Europe/Bucharest. */
export function formatRoDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Format an ISO timestamp to a RO time (HH:mm) in Europe/Bucharest. */
export function formatRoTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

interface JobDeps {
  db: Db;
  senders: Senders;
  log: Logger;
  now: Clock;
}

/**
 * Reminder job: finds appointments starting ~24h from now and sends the
 * `reminder_programare` UTILITY template. Skips cancelled/completed slots and
 * anyone opted out. Idempotency (don't double-send) is the real-impl's concern;
 * here we just leave a TODO where a "reminderSentAt" flag would be checked.
 */
export function makeReminderJob(deps: JobDeps): () => Promise<void> {
  const { db, senders, log, now } = deps;
  return async () => {
    const from = new Date(now().getTime() + 23 * HOUR_MS).toISOString();
    const to = new Date(now().getTime() + 25 * HOUR_MS).toISOString();
    const due = await db.listAppointmentsBetween(from, to);

    let sent = 0;
    for (const appt of due) {
      if (appt.status !== "confirmed") continue;
      // Idempotency: never send a second reminder for the same appointment.
      if (appt.reminderSentAt) {
        log.debug("reminder skipped (already sent)", { to: redact(appt.phoneE164) });
        continue;
      }
      if (await db.isOptedOut(PLATFORM, appt.phoneE164)) {
        log.debug("reminder skipped (opted out)", { to: redact(appt.phoneE164) });
        continue;
      }
      const res = await senders.whatsapp.sendTemplate(appt.phoneE164, TEMPLATES.reminder, {
        nume: appt.clientName,
        ora: formatRoTime(appt.startsAt),
      });
      if (res.ok) {
        sent++;
        // Persist the flag so a re-run (or overlapping window) won't resend.
        await db.upsertAppointment({ ...appt, reminderSentAt: now().toISOString() });
      } else {
        log.warn("reminder send failed", { to: redact(appt.phoneE164) });
      }
    }
    log.info("reminder job ran", { due: due.length, sent });
  };
}

/**
 * Confirmation job: sends `confirmare_programare` for appointments Ana just
 * flipped to "confirmed" but that haven't been told yet. The scaffold has no
 * "confirmation pending" column, so it scans the next 60 days of confirmed
 * slots; the real impl gates on a `confirmationSentAt` flag.
 */
export function makeConfirmationJob(deps: JobDeps): () => Promise<void> {
  const { db, senders, log, now } = deps;
  return async () => {
    const from = now().toISOString();
    const to = new Date(now().getTime() + 60 * DAY_MS).toISOString();
    const upcoming = await db.listAppointmentsBetween(from, to);

    let sent = 0;
    for (const appt of upcoming) {
      if (appt.status !== "confirmed") continue;
      // Idempotency: only send a confirmation once per appointment.
      if (appt.confirmationSentAt) continue;
      if (await db.isOptedOut(PLATFORM, appt.phoneE164)) continue;
      const res = await senders.whatsapp.sendTemplate(appt.phoneE164, TEMPLATES.confirmation, {
        nume: appt.clientName,
        serviciu: SERVICE_LABELS[appt.service],
        data: formatRoDate(appt.startsAt),
        ora: formatRoTime(appt.startsAt),
      });
      if (res.ok) {
        sent++;
        await db.upsertAppointment({ ...appt, confirmationSentAt: now().toISOString() });
      }
    }
    log.info("confirmation job ran", { scanned: upcoming.length, sent });
  };
}

/**
 * Send a single confirmation immediately (used when Ana confirms a slot, e.g.
 * from an inbound flow). Exposed so the webhook handler / future admin action
 * can confirm without waiting for the cron scan. Returns whether it sent.
 */
export async function sendConfirmation(
  appt: Appointment,
  senders: Senders,
  db: Db,
  log: Logger,
): Promise<boolean> {
  if (await db.isOptedOut(PLATFORM, appt.phoneE164)) {
    log.debug("confirmation skipped (opted out)", { to: redact(appt.phoneE164) });
    return false;
  }
  const res = await senders.whatsapp.sendTemplate(appt.phoneE164, TEMPLATES.confirmation, {
    nume: appt.clientName,
    serviciu: SERVICE_LABELS[appt.service],
    data: formatRoDate(appt.startsAt),
    ora: formatRoTime(appt.startsAt),
  });
  return res.ok;
}

/**
 * Nightly retention purge (COMPLIANCE #10): 12 mo after last appointment,
 * 30 days for non-converting enquiries. Uses config-driven windows.
 */
export function makePurgeJob(deps: JobDeps & { config: Config }): () => Promise<void> {
  const { db, log, now, config } = deps;
  return async () => {
    const removed = await db.purgeExpired({
      nowIso: now().toISOString(),
      appointmentDays: config.retention.appointmentDays,
      enquiryDays: config.retention.enquiryDays,
    });
    log.info("retention purge ran", removed);
  };
}

/** Bundle the job deps from CoreDeps + a clock. */
export function jobDepsFrom(deps: CoreDeps, log: Logger, now: Clock): JobDeps {
  return { db: deps.db, senders: deps.senders, log, now };
}
