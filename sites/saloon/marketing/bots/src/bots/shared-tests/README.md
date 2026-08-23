# shared-tests — Phase 2 · Agent E

Owned by Agent E (test harness). This folder holds the shared test surface that
bots A–D assert against:

- `mocks.ts` — re-export / extend `createMockSenders` + `createInMemoryDb` with
  any shared fixtures (sample `Appointment`, `Lead`, `ScheduledPost`, events).
- `fake-events.ts` — a generator for `InboundMessage` webhook events per platform.
- `fake-clock.ts` — a deterministic clock for scheduler/retention tests.
- `smoke.test.ts` — boots the whole app via `buildApp()` in mock mode with all
  bots registered, runs `scheduler.runAll()`, asserts no throw + no real I/O.

Agent E touches ONLY this folder. Everything it needs is in `../../core/`
(frozen) — `createMockSenders`, `createInMemoryDb`, `createScheduler`,
`createWebhookRouter`, and `buildApp` from `../../server.ts`.
