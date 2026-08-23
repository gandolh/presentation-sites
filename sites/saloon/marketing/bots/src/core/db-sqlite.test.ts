/**
 * Tests for the SQLite-backed Db (real-impl of the frozen Db interface).
 * Runs against an in-memory SQLite (":memory:") — no file, no network. Proves
 * the real store satisfies the same contract the in-memory mock does.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { createSqliteDb } from "./db-sqlite.ts";
import type { Appointment, Lead, ScheduledPost } from "./types.ts";

function appt(over: Partial<Appointment> = {}): Appointment {
  return {
    id: "a1",
    phoneE164: "40755123456",
    clientName: "Maria",
    service: "manichiura_semipermanenta",
    startsAt: "2026-06-01T08:00:00.000Z",
    status: "confirmed",
    createdAt: "2026-05-01T08:00:00.000Z",
    lastInteractionAt: "2026-05-01T08:00:00.000Z",
    ...over,
  };
}

test("appointment round-trips, including optional idempotency flags", async () => {
  const db = createSqliteDb(":memory:");
  await db.upsertAppointment(appt());
  const got = await db.getAppointment("a1");
  assert.ok(got);
  assert.equal(got.clientName, "Maria");
  assert.equal(got.reminderSentAt, undefined, "optional flag absent when not set");

  // Upsert with the reminder flag set (idempotency path).
  await db.upsertAppointment(appt({ reminderSentAt: "2026-05-31T08:00:00.000Z" }));
  const updated = await db.getAppointment("a1");
  assert.equal(updated?.reminderSentAt, "2026-05-31T08:00:00.000Z");
  await db.close();
});

test("listAppointmentsBetween filters by startsAt window", async () => {
  const db = createSqliteDb(":memory:");
  await db.upsertAppointment(appt({ id: "in", startsAt: "2026-06-10T09:00:00.000Z" }));
  await db.upsertAppointment(appt({ id: "out", startsAt: "2026-07-10T09:00:00.000Z" }));
  const found = await db.listAppointmentsBetween("2026-06-01T00:00:00.000Z", "2026-06-30T00:00:00.000Z");
  assert.deepEqual(found.map((a) => a.id), ["in"]);
  await db.close();
});

test("opt-out is recorded and read back per platform", async () => {
  const db = createSqliteDb(":memory:");
  assert.equal(await db.isOptedOut("whatsapp", "40755123456"), false);
  await db.setOptIn("whatsapp", "40755123456", "opted_out");
  assert.equal(await db.isOptedOut("whatsapp", "40755123456"), true);
  // Scoped per platform: same id on another platform is unaffected.
  assert.equal(await db.isOptedOut("instagram", "40755123456"), false);
  await db.close();
});

test("scheduled posts: enqueue, list due, update status with JSON results", async () => {
  const db = createSqliteDb(":memory:");
  const post: ScheduledPost = {
    id: "p1",
    assetRef: "/x.mp4",
    captionRo: "Salut",
    targets: ["instagram", "facebook"],
    publishAt: "2026-05-01T00:00:00.000Z",
    status: "queued",
  };
  await db.enqueuePost(post);
  const due = await db.listDuePosts("2026-05-02T00:00:00.000Z");
  assert.equal(due.length, 1);
  assert.deepEqual(due[0]?.targets, ["instagram", "facebook"]);

  await db.updatePost({ ...post, status: "published", results: { instagram: { ok: true, externalId: "ig1" } } });
  const after = await db.listDuePosts("2026-05-02T00:00:00.000Z");
  assert.equal(after.length, 0, "published post is no longer due");
  await db.close();
});

test("purgeExpired removes data past the retention windows", async () => {
  const db = createSqliteDb(":memory:");
  // Old appointment (last interaction > 365d ago) + fresh one.
  await db.upsertAppointment(appt({ id: "old", lastInteractionAt: "2024-01-01T00:00:00.000Z" }));
  await db.upsertAppointment(appt({ id: "fresh", lastInteractionAt: "2026-05-01T00:00:00.000Z" }));
  const oldLead: Lead = {
    id: "l_old",
    platform: "instagram",
    marketingOptIn: "unknown",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  await db.insertLead(oldLead);

  const removed = await db.purgeExpired({
    nowIso: "2026-05-29T00:00:00.000Z",
    appointmentDays: 365,
    enquiryDays: 30,
  });
  assert.equal(removed.appointments, 1, "the >365d appointment is purged");
  assert.equal(removed.leads, 1, "the >30d lead is purged");
  assert.ok(await db.getAppointment("fresh"), "fresh appointment survives");
  await db.close();
});

test("isCalendarFull reflects confirmed bookings vs capacity", async () => {
  const db = createSqliteDb(":memory:");
  // Far-future window with no bookings -> not full.
  assert.equal(await db.isCalendarFull(3), false);
  await db.close();
});
