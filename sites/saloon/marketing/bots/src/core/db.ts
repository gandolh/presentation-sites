/**
 * State store interface + migrations + retention purge — FROZEN (Phase 1).
 *
 * The scaffold ships an in-memory implementation so the whole package runs and
 * tests with zero native deps. A SQLite-backed impl (node:sqlite or
 * better-sqlite3) is a later task; it must satisfy this same `Db` interface.
 *
 * COMPLIANCE: data minimisation (#12) + retention purge (#10).
 */

import type { Appointment, Lead, ScheduledPost, CampaignDraft, OptInStatus } from "./types.ts";

export interface OptOutRecord {
  platform: string;
  contactId: string;
  optedOutAt: string;
}

/**
 * Minimal persistence surface every bot uses. Kept intentionally small —
 * add a method only via the Phase 1/3 owner (frozen contract).
 */
export interface Db {
  // Appointments (whatsapp bot)
  upsertAppointment(a: Appointment): Promise<void>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  /** Appointments starting within [fromIso, toIso); used by the reminder job. */
  listAppointmentsBetween(fromIso: string, toIso: string): Promise<Appointment[]>;
  /** True if the calendar is full for the next `days` (capacity guardrail). */
  isCalendarFull(days: number): Promise<boolean>;

  // Leads (responses / campaigns)
  insertLead(l: Lead): Promise<void>;

  // Scheduled posts (scheduler bot)
  enqueuePost(p: ScheduledPost): Promise<void>;
  /** Posts due to publish at or before `nowIso`, still in "queued". */
  listDuePosts(nowIso: string): Promise<ScheduledPost[]>;
  updatePost(p: ScheduledPost): Promise<void>;

  // Campaign drafts (campaigns bot)
  insertCampaignDraft(c: CampaignDraft): Promise<void>;

  // Opt-out / suppression (all messaging bots)
  setOptIn(platform: string, contactId: string, status: OptInStatus): Promise<void>;
  isOptedOut(platform: string, contactId: string): Promise<boolean>;

  /**
   * Purge data past the retention windows. Returns count removed per table.
   * Run nightly by the scheduler. `nowIso` injected so tests use a fake clock.
   */
  purgeExpired(opts: { nowIso: string; appointmentDays: number; enquiryDays: number }): Promise<{
    appointments: number;
    leads: number;
  }>;

  close(): Promise<void>;
}

/**
 * In-memory Db for the scaffold + tests. Not for production — the SQLite impl
 * replaces it later behind the same interface.
 */
export function createInMemoryDb(): Db {
  const appointments = new Map<string, Appointment>();
  const leads: Lead[] = [];
  const posts = new Map<string, ScheduledPost>();
  const drafts: CampaignDraft[] = [];
  const optStatus = new Map<string, OptInStatus>(); // key: `${platform}:${contactId}`

  const key = (p: string, c: string) => `${p}:${c}`;

  return {
    async upsertAppointment(a) {
      appointments.set(a.id, a);
    },
    async getAppointment(id) {
      return appointments.get(id);
    },
    async listAppointmentsBetween(fromIso, toIso) {
      return [...appointments.values()].filter(
        (a) => a.startsAt >= fromIso && a.startsAt < toIso,
      );
    },
    async isCalendarFull(_days) {
      // Stub: scaffold has no real calendar. Real impl checks free slots.
      return false;
    },

    async insertLead(l) {
      leads.push(l);
    },

    async enqueuePost(p) {
      posts.set(p.id, p);
    },
    async listDuePosts(nowIso) {
      return [...posts.values()].filter((p) => p.status === "queued" && p.publishAt <= nowIso);
    },
    async updatePost(p) {
      posts.set(p.id, p);
    },

    async insertCampaignDraft(c) {
      drafts.push(c);
    },

    async setOptIn(platform, contactId, status) {
      optStatus.set(key(platform, contactId), status);
    },
    async isOptedOut(platform, contactId) {
      return optStatus.get(key(platform, contactId)) === "opted_out";
    },

    async purgeExpired({ nowIso, appointmentDays, enquiryDays }) {
      const now = Date.parse(nowIso);
      const cutoff = (days: number) => now - days * 24 * 60 * 60 * 1000;

      let removedAppts = 0;
      for (const [id, a] of appointments) {
        if (Date.parse(a.lastInteractionAt) < cutoff(appointmentDays)) {
          appointments.delete(id);
          removedAppts++;
        }
      }
      const before = leads.length;
      for (let i = leads.length - 1; i >= 0; i--) {
        const lead = leads[i];
        if (lead && Date.parse(lead.createdAt) < cutoff(enquiryDays)) leads.splice(i, 1);
      }
      return { appointments: removedAppts, leads: before - leads.length };
    },

    async close() {
      appointments.clear();
      posts.clear();
      optStatus.clear();
      leads.length = 0;
      drafts.length = 0;
    },
  };
}
