/**
 * SQLite-backed `Db` — real-impl of the FROZEN `Db` interface (core/db.ts).
 *
 * Uses Node's built-in `node:sqlite` (zero external deps, matches the project's
 * dependency-light ethos). Swapped in for the in-memory store outside mock mode
 * (see server.ts). The in-memory impl remains the test/scaffold default.
 *
 * Same contract, same method shapes — so every bot and every test that runs
 * against `Db` works unchanged. COMPLIANCE: data minimisation (#12), retention
 * purge (#10), opt-out suppression (messaging bots).
 */

import { DatabaseSync } from "node:sqlite";

import type { Db, OptOutRecord } from "./db.ts";
import type {
  Appointment,
  Lead,
  ScheduledPost,
  CampaignDraft,
  OptInStatus,
} from "./types.ts";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS appointments (
  id                  TEXT PRIMARY KEY,
  phoneE164           TEXT NOT NULL,
  clientName          TEXT NOT NULL,
  service             TEXT NOT NULL,
  startsAt            TEXT NOT NULL,
  status              TEXT NOT NULL,
  createdAt           TEXT NOT NULL,
  lastInteractionAt   TEXT NOT NULL,
  reminderSentAt      TEXT,
  confirmationSentAt  TEXT
);
CREATE INDEX IF NOT EXISTS idx_appt_startsAt ON appointments(startsAt);

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
  platform        TEXT NOT NULL,
  phoneE164       TEXT,
  clientName      TEXT,
  message         TEXT,
  marketingOptIn  TEXT NOT NULL,
  createdAt       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id          TEXT PRIMARY KEY,
  assetRef    TEXT NOT NULL,
  captionRo   TEXT NOT NULL,
  targets     TEXT NOT NULL,   -- JSON array of Platform
  publishAt   TEXT NOT NULL,
  status      TEXT NOT NULL,
  results     TEXT             -- JSON object or NULL
);
CREATE INDEX IF NOT EXISTS idx_post_publishAt ON scheduled_posts(publishAt, status);

CREATE TABLE IF NOT EXISTS campaign_drafts (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL,
  presetKey     TEXT NOT NULL,
  objective     TEXT NOT NULL,
  status        TEXT NOT NULL,
  dailyBudgetMinor INTEGER NOT NULL,
  currency      TEXT NOT NULL,
  audience      TEXT NOT NULL,  -- JSON
  creativeRef   TEXT NOT NULL,
  copyRo        TEXT NOT NULL,
  createdAt     TEXT NOT NULL,
  approvalState TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opt_status (
  platform    TEXT NOT NULL,
  contactId   TEXT NOT NULL,
  status      TEXT NOT NULL,
  updatedAt   TEXT NOT NULL,
  PRIMARY KEY (platform, contactId)
);
`;

/** Map a DB row to an Appointment, dropping NULL optional columns. */
function rowToAppointment(r: Record<string, unknown>): Appointment {
  const a: Appointment = {
    id: String(r.id),
    phoneE164: String(r.phoneE164),
    clientName: String(r.clientName),
    service: r.service as Appointment["service"],
    startsAt: String(r.startsAt),
    status: r.status as Appointment["status"],
    createdAt: String(r.createdAt),
    lastInteractionAt: String(r.lastInteractionAt),
  };
  if (r.reminderSentAt != null) a.reminderSentAt = String(r.reminderSentAt);
  if (r.confirmationSentAt != null) a.confirmationSentAt = String(r.confirmationSentAt);
  return a;
}

function rowToLead(r: Record<string, unknown>): Lead {
  const l: Lead = {
    id: String(r.id),
    platform: r.platform as Lead["platform"],
    marketingOptIn: r.marketingOptIn as OptInStatus,
    createdAt: String(r.createdAt),
  };
  if (r.phoneE164 != null) l.phoneE164 = String(r.phoneE164);
  if (r.clientName != null) l.clientName = String(r.clientName);
  if (r.message != null) l.message = String(r.message);
  return l;
}

function rowToPost(r: Record<string, unknown>): ScheduledPost {
  const p: ScheduledPost = {
    id: String(r.id),
    assetRef: String(r.assetRef),
    captionRo: String(r.captionRo),
    targets: JSON.parse(String(r.targets)) as ScheduledPost["targets"],
    publishAt: String(r.publishAt),
    status: r.status as ScheduledPost["status"],
  };
  if (r.results != null) {
    const parsed = JSON.parse(String(r.results)) as ScheduledPost["results"];
    if (parsed !== undefined) p.results = parsed;
  }
  return p;
}

/**
 * Open a SQLite-backed Db at `path` (use ":memory:" for ephemeral). Creates the
 * schema if absent. Returns the same `Db` interface the rest of the app uses.
 */
export function createSqliteDb(path: string): Db {
  const sql = new DatabaseSync(path);
  sql.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  sql.exec(SCHEMA);

  return {
    async upsertAppointment(a: Appointment) {
      sql
        .prepare(
          `INSERT INTO appointments
             (id, phoneE164, clientName, service, startsAt, status, createdAt,
              lastInteractionAt, reminderSentAt, confirmationSentAt)
           VALUES (?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET
             phoneE164=excluded.phoneE164, clientName=excluded.clientName,
             service=excluded.service, startsAt=excluded.startsAt,
             status=excluded.status, createdAt=excluded.createdAt,
             lastInteractionAt=excluded.lastInteractionAt,
             reminderSentAt=excluded.reminderSentAt,
             confirmationSentAt=excluded.confirmationSentAt`,
        )
        .run(
          a.id, a.phoneE164, a.clientName, a.service, a.startsAt, a.status,
          a.createdAt, a.lastInteractionAt,
          a.reminderSentAt ?? null, a.confirmationSentAt ?? null,
        );
    },

    async getAppointment(id: string) {
      const row = sql.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
      return row ? rowToAppointment(row as Record<string, unknown>) : undefined;
    },

    async listAppointmentsBetween(fromIso: string, toIso: string) {
      const rows = sql
        .prepare("SELECT * FROM appointments WHERE startsAt >= ? AND startsAt < ? ORDER BY startsAt")
        .all(fromIso, toIso) as Record<string, unknown>[];
      return rows.map(rowToAppointment);
    },

    async isCalendarFull(days: number) {
      // Real capacity check for a one-chair salon: count CONFIRMED appointments
      // in the look-ahead window and compare to the number of working slots.
      const now = new Date();
      const toIso = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      const row = sql
        .prepare(
          `SELECT COUNT(*) AS n FROM appointments
            WHERE status = 'confirmed' AND startsAt >= ? AND startsAt < ?`,
        )
        .get(now.toISOString(), toIso) as { n: number };
      // One chair: assume up to SLOTS_PER_DAY bookable slots/day. "Full" = the
      // window's confirmed bookings reach that capacity. Conservative default.
      const SLOTS_PER_DAY = 6;
      return row.n >= days * SLOTS_PER_DAY;
    },

    async insertLead(l: Lead) {
      sql
        .prepare(
          `INSERT OR REPLACE INTO leads
             (id, platform, phoneE164, clientName, message, marketingOptIn, createdAt)
           VALUES (?,?,?,?,?,?,?)`,
        )
        .run(
          l.id, l.platform, l.phoneE164 ?? null, l.clientName ?? null,
          l.message ?? null, l.marketingOptIn, l.createdAt,
        );
    },

    async enqueuePost(p: ScheduledPost) {
      sql
        .prepare(
          `INSERT OR REPLACE INTO scheduled_posts
             (id, assetRef, captionRo, targets, publishAt, status, results)
           VALUES (?,?,?,?,?,?,?)`,
        )
        .run(
          p.id, p.assetRef, p.captionRo, JSON.stringify(p.targets),
          p.publishAt, p.status, p.results ? JSON.stringify(p.results) : null,
        );
    },

    async listDuePosts(nowIso: string) {
      const rows = sql
        .prepare("SELECT * FROM scheduled_posts WHERE status = 'queued' AND publishAt <= ?")
        .all(nowIso) as Record<string, unknown>[];
      return rows.map(rowToPost);
    },

    async updatePost(p: ScheduledPost) {
      sql
        .prepare(
          `UPDATE scheduled_posts SET assetRef=?, captionRo=?, targets=?, publishAt=?,
             status=?, results=? WHERE id=?`,
        )
        .run(
          p.assetRef, p.captionRo, JSON.stringify(p.targets), p.publishAt,
          p.status, p.results ? JSON.stringify(p.results) : null, p.id,
        );
    },

    async insertCampaignDraft(c: CampaignDraft) {
      sql
        .prepare(
          `INSERT OR REPLACE INTO campaign_drafts
             (id, platform, presetKey, objective, status, dailyBudgetMinor, currency,
              audience, creativeRef, copyRo, createdAt, approvalState)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          c.id, c.platform, c.presetKey, c.objective, c.status, c.dailyBudgetMinor,
          c.currency, JSON.stringify(c.audience), c.creativeRef, c.copyRo,
          c.createdAt, c.approvalState,
        );
    },

    async setOptIn(platform: string, contactId: string, status: OptInStatus) {
      sql
        .prepare(
          `INSERT INTO opt_status (platform, contactId, status, updatedAt)
           VALUES (?,?,?,?)
           ON CONFLICT(platform, contactId) DO UPDATE SET
             status=excluded.status, updatedAt=excluded.updatedAt`,
        )
        .run(platform, contactId, status, new Date().toISOString());
    },

    async isOptedOut(platform: string, contactId: string) {
      const row = sql
        .prepare("SELECT status FROM opt_status WHERE platform = ? AND contactId = ?")
        .get(platform, contactId) as { status: string } | undefined;
      return row?.status === "opted_out";
    },

    async purgeExpired({ nowIso, appointmentDays, enquiryDays }) {
      const now = Date.parse(nowIso);
      const apptCutoff = new Date(now - appointmentDays * 86_400_000).toISOString();
      const leadCutoff = new Date(now - enquiryDays * 86_400_000).toISOString();

      const a = sql
        .prepare("DELETE FROM appointments WHERE lastInteractionAt < ?")
        .run(apptCutoff);
      const l = sql.prepare("DELETE FROM leads WHERE createdAt < ?").run(leadCutoff);

      return { appointments: Number(a.changes), leads: Number(l.changes) };
    },

    async close() {
      sql.close();
    },
  };
}

// Keep the OptOutRecord type referenced so the import stays meaningful for
// downstream tooling/readers of this module.
export type { OptOutRecord };
