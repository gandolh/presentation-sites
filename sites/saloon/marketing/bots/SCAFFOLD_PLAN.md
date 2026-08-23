# Scaffold Plan — multi-agent build of the bots service

How to split the **code scaffold** across several agents so they work in
parallel **without colliding**. Scope of this doc = scaffolding only: project
skeleton, shared contracts, per-bot stubs with typed interfaces, config, and
local dev — **not** full feature implementation, and **not** real API calls.
Each bot ships as a stubbed module that type-checks and has a clear TODO surface
for the real implementation later.

Read `COMPLIANCE.md` and each bot's `todo.md` first. Nothing here calls a live
API or spends money.

## The collision problem (why we can't just fan out 5 agents)

The bots are **not independent**. Every bot imports shared things from the
orchestrator: the config loader, the secret/env contract, the DB/state layer,
the logger, and — critically — the **typed sender interfaces** and **shared
domain types** (Appointment, Lead, ScheduledPost, CampaignDraft, etc.). If five
agents all invent these at once we get five incompatible versions and a merge
mess.

**Solution: one foundation agent freezes the contracts first; then bots fan out
against frozen interfaces; then one agent wires it together.** Three phases:

```
Phase 1 (1 agent, SEQUENTIAL)   →  Phase 2 (5 agents, PARALLEL)  →  Phase 3 (1 agent)
   Foundation & contracts            Per-bot stub modules            Integration & CI
```

## Tech baseline (matches the repo)

- **Separate package** from the Astro site. The site is static; the bots are a
  long-running Node server. Put it under `marketing/bots/` as its own
  `package.json` (npm workspace or standalone — Phase 1 decides). It must NOT be
  pulled into `astro build`.
- **Node ≥22** (repo uses 24), **ESM** (`"type": "module"`), **TypeScript 6
  strict** (extend the repo's strict posture).
- **SQLite** for state (zero infra, file on the VPS).
- Secrets in `.env` (already gitignored); ship a committed **`.env.example`**.
- Runs behind the existing nginx/Caddy on a subpath (e.g. `/bots`).

## Directory the scaffold produces

```
marketing/bots/
├── package.json            ← bots service (separate from site)
├── tsconfig.json           ← extends strict
├── .env.example            ← every secret/flag, documented, no real values
├── src/
│   ├── core/               ← [Phase 1] FROZEN shared contracts
│   │   ├── config.ts       ← env loader + per-bot kill-switches + budget caps
│   │   ├── logger.ts       ← structured log + PII redaction helper
│   │   ├── db.ts           ← SQLite open + migrations runner
│   │   ├── types.ts        ← domain types (Appointment, Lead, ScheduledPost, …)
│   │   ├── senders.ts      ← typed INTERFACES for each platform API (no impl)
│   │   ├── webhook.ts      ← Meta signature verify + event-router skeleton
│   │   └── scheduler.ts    ← cron/queue interface (register jobs)
│   ├── server.ts           ← [Phase 1] entrypoint: mount webhook + scheduler
│   └── bots/
│       ├── whatsapp/       ← [Phase 2 · Agent A] booking confirmations/reminders
│       ├── responses/      ← [Phase 2 · Agent B] IG/FB inbound auto-reply
│       ├── scheduler/      ← [Phase 2 · Agent C] post queue + publish runner
│       ├── campaigns/      ← [Phase 2 · Agent D] prepare PAUSED ad drafts
│       └── shared-tests/   ← [Phase 2 · Agent E] test harness + fixtures + mocks
└── README.md               ← run/dev instructions
```

Each `bots/<name>/` exposes ONE registration function with a fixed signature
(see the contract below) and keeps ALL its files inside its own folder. Agents
in Phase 2 only ever create/edit files under their own `bots/<name>/` dir →
**no two agents touch the same file.**

---

## Phase 1 — Foundation & contracts (1 agent, must finish first)

**Goal:** lock everything the bots share so Phase 2 can't diverge. Output is the
`core/` module + the empty bot folders + the registration contract. After this,
the interfaces are **frozen** for Phase 2.

Tasks:
- [ ] Scaffold the separate package: `package.json`, `tsconfig.json` (strict),
  scripts (`dev`, `build`, `typecheck`, `lint`, `test`), and confirm it's
  excluded from `astro build`.
- [ ] `core/config.ts` — typed env loader. Defines EVERY flag/secret name:
  per-bot `BOT_*_ENABLED`, `ADS_SPEND_ENABLED`, budget ceilings, EU region,
  retention windows. Throws on missing required secret. Mirror into `.env.example`.
- [ ] `core/types.ts` — domain types shared across bots. At minimum:
  `Appointment`, `Lead`, `InboundMessage`, `OutboundMessage`, `ScheduledPost`,
  `CampaignDraft`, `Platform` enum, `OptInStatus`.
- [ ] `core/senders.ts` — **interfaces only** (no real HTTP):
  `WhatsAppSender`, `MetaMessagingSender`, `ContentPublisher`, `MarketingClient`.
  Phase 2 agents code against these; real impls come later. Provide a
  `MockSenders` factory so bots are testable offline.
- [ ] `core/db.ts` — SQLite open + a migrations runner + a `purge()` hook for
  retention. Define the minimal tables (conversation state, appointments,
  scheduled_posts, opt_outs, campaign_drafts).
- [ ] `core/logger.ts` — structured logger + `redact(phone)` helper (never log
  message bodies / PII).
- [ ] `core/webhook.ts` — Meta `X-Hub-Signature-256` verify + an event router
  that dispatches **inbound `messages` events only** to registered handlers.
- [ ] `core/scheduler.ts` — a tiny job registry (`registerJob(name, cron, fn)`)
  the bots use for reminders / post queue / campaign-draft prep / nightly purge.
- [ ] **THE CONTRACT** — define and document the bot registration shape every
  Phase 2 bot must implement, e.g.:
  ```ts
  export interface BotModule {
    name: string;
    enabled(config: Config): boolean;          // reads its BOT_*_ENABLED flag
    registerWebhooks?(router: WebhookRouter): void;   // inbound handlers
    registerJobs?(scheduler: Scheduler): void;        // cron jobs
  }
  export function createBot(deps: CoreDeps): BotModule  // each bot exports this
  ```
- [ ] `server.ts` — boots config → db → logger → webhook → scheduler, imports
  each bot's `createBot`, registers the enabled ones. (Imports may reference
  not-yet-built bots as stubs that Phase 1 leaves as empty exports.)
- [ ] Create the **5 empty bot folders** each with a stub `index.ts` exporting a
  no-op `createBot` that satisfies `BotModule`, so the project type-checks
  before Phase 2 starts.
- [ ] Commit. **Tag the interfaces as frozen** in this doc / commit message.

**Definition of done (Phase 1):** `npm run typecheck` passes with all 5 stub
bots wired in; `.env.example` lists every secret/flag; nothing makes a live call.

---

## Phase 2 — Per-bot stubs (5 agents, fully parallel)

Each agent owns exactly one folder and codes against the **frozen** `core/`
contracts. They never edit `core/` or another bot's folder. Run them in parallel
(ideally each in its own git worktree to avoid even branch contention).

Shared rules for every Phase 2 agent:
- Implement `createBot(deps)` returning a `BotModule`.
- Use the `core/senders.ts` **interfaces** + `MockSenders` — **no real API
  calls**, no real tokens. Real HTTP wiring is a later, separate task.
- Honor `COMPLIANCE.md`: inbound-only handlers, kill-switch via `enabled()`,
  PII redaction, retention purge hook registered.
- Add unit tests against the mocks (or hand fixtures to Agent E).
- Leave clear `// TODO(impl):` markers where the real API call goes.
- Touch ONLY files under your own `bots/<name>/`.

- [ ] **Agent A — `bots/whatsapp/`**: register reminder + confirmation jobs
  (utility templates) against `WhatsAppSender`; inbound booking-keyword handler;
  STOP handling; retention-aware writes. Stub the template payloads.
- [ ] **Agent B — `bots/responses/`**: inbound `messages` handler for IG + FB via
  `MetaMessagingSender`; Ice-Breaker/quick-reply menu config; keyword→RO reply
  map; route "Programare" → WhatsApp link; away-message logic; STOP. NO
  `comments`/engagement.
- [ ] **Agent C — `bots/scheduler/`**: post-queue model + a publish runner job
  against `ContentPublisher` (incl. the IG create→poll→publish state machine as
  a stub); per-platform cap guards (IG ≤100/24h, TikTok ≤25/day). No real upload.
- [ ] **Agent D — `bots/campaigns/`**: preset → `CampaignDraft` builder that
  produces PAUSED drafts via `MarketingClient`; budget-ceiling guard; human-
  approval notification call (through a `Notifier` from core); audit-log write;
  auto-pause-on-full-calendar job. Never builds ACTIVE.
- [ ] **Agent E — `bots/shared-tests/`**: the test harness — `MockSenders`
  fixtures, a fake webhook-event generator, a fake clock for the scheduler, and
  a smoke test that boots `server.ts` with all bots in mock mode. Gives A–D a
  shared place for fixtures so they don't each reinvent mocks.

> Why a separate Agent E for tests: it depends only on `core/` (frozen), so it
> can run alongside A–D, and it gives the other four a ready mock surface. If
> you'd rather, fold tests into each bot and drop Agent E to 4 parallel agents.

**Definition of done (Phase 2, per agent):** the folder type-checks against
frozen `core/`, exports a valid `createBot`, has at least a smoke test passing
against mocks, and touches no file outside its folder.

---

## Phase 3 — Integration & CI (1 agent, after Phase 2 merges)

- [ ] Merge all five worktrees/branches. Conflicts should be near-zero (disjoint
  folders); resolve any `server.ts` import-list collisions (the one likely spot).
- [ ] Wire real bot imports into `server.ts`; confirm enabled-flag gating works.
- [ ] `npm run typecheck && npm run test` green for the whole package.
- [ ] Add a CI check (lint + typecheck + test) scoped to `marketing/bots/`.
- [ ] Flesh out `marketing/bots/README.md`: how to run locally (mock mode),
  env setup, deploy note (VPS subpath behind nginx/Caddy).
- [ ] Update `/confidentialitate` processor list if scaffolding surfaced new flows.
- [ ] Open the PR from `marketing/automation-plan` (or a child branch).

**Definition of done (Phase 3):** whole package type-checks + tests pass in
mock mode; CI green; README lets a new dev run it; still zero live calls / spend.

---

## Orchestration cheat-sheet (for whoever drives the agents)

1. **Run Phase 1 solo. Do not start Phase 2 until `core/` is committed & frozen.**
   This is the single most important rule — it's what prevents collisions.
2. Launch Phase 2 as **5 parallel agents, each in its own git worktree**
   (`isolation: worktree`), one folder each. They share only the frozen `core/`.
3. Each agent's prompt = its bullet above + "code only against `core/`
   interfaces, mocks only, touch only `bots/<name>/`, obey COMPLIANCE.md."
4. Merge, then **run Phase 3 solo**.
5. A `Workflow` can encode this exactly: phase('Foundation') → one agent;
   phase('Bots') → `parallel` of 5 worktree agents; phase('Integration') → one
   agent. (Only if the user opts into a workflow.)

## Hard guardrails for ALL scaffold agents

- No real API calls, no real tokens, no live campaigns, no posting. Mocks only.
- Never edit `core/` in Phase 2 (it's frozen). Need a change? Flag it for the
  Phase 1/3 owner — don't fork the contract.
- Stay inside your assigned folder.
- Keep the bots package out of the Astro build.
- `.env` never committed; only `.env.example` with placeholder values.
