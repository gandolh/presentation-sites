# Orchestrator — shared service for all bots

**Priority: #3 (build once ≥2 bots need it).** The single small backend that
hosts webhooks, scheduling, the post queue, the campaign-approval flow, logging,
secrets and the kill-switches for every bot. Don't build it first — build it
when the WhatsApp bot needs a home for its webhook + reminder cron. Read
`../COMPLIANCE.md` first.

## Why one shared service

- Meta WhatsApp + Instagram + Facebook all hang off **one Meta app** and can
  share **one webhook endpoint** (route by event type). DRY + one place for
  secrets, retention purge, and the disclosure surface.
- Keeps the whole thing on the **salon's existing VPS** (same box serving the
  static site) — no new SaaS bill, matches the project's free/self-host rule.

## Responsibilities

- [ ] **Webhook receiver** — verify Meta/WhatsApp signatures; fan out inbound
  `messages` events to the response handlers (`whatsapp/`, `responses/` for IG+FB).
- [ ] **Scheduler / cron** — fire WhatsApp reminders; run the `scheduler/` post
  queue (IG/FB/TikTok publish times); prepare recurring `campaigns/` drafts;
  run nightly retention-purge job.
- [ ] **Post queue** — storage + publish runner for `scheduler/` (incl. the IG
  Reels create→poll→publish dance); enforce per-platform caps.
- [ ] **Campaign approval flow** — `campaigns/` builds PAUSED drafts; orchestrator
  sends the human review notification + keeps the audit log + budget ceilings +
  spend kill-switch.
- [ ] **Outbound senders** — thin wrappers over each official API (messaging,
  publishing, marketing) with built-in rate limiting + human-cadence spacing
  (never burst).
- [ ] **State store** — minimal DB (SQLite on the VPS is enough) for conversation
  state, appointment reminders, opt-out/suppression list. Encrypted at rest if
  feasible; EU only.
- [ ] **Secrets** — `.env` (gitignored): Meta app secret, WA token, IG/FB Page
  tokens, `ads_management` token, TikTok OAuth, Formspree, salon phone/ad-account
  IDs. Never committed.
- [ ] **Kill-switches** — per-bot env flags (`BOT_WHATSAPP_ENABLED=…`,
  `ADS_SPEND_ENABLED=…`) so any bot — and all ad spend — can be disabled
  instantly without a deploy.
- [ ] **Logging** — structured logs, but **never log message bodies / PII**
  beyond what's needed; redact phone numbers in logs.
- [ ] **Retention purge** — nightly job enforcing 12 mo / 30 day rules.
- [ ] **Health check + alert** — ping Ana/Cristian if a webhook or token breaks
  (expired tokens are the #1 silent failure).

## Suggested shape (decide at build time)

- [ ] Runtime: **Node.js** (matches the JS toolchain; or a tiny Python service).
- [ ] One process behind the existing **nginx/Caddy** on the VPS, on a subpath
  like `/bots/webhook`. TLS already there for the site.
- [ ] **SQLite** for state (zero infra). Cron via systemd timer.
- [ ] Config-driven: each bot = a folder of handlers + a templates file (RO).

## Build order

1. Webhook skeleton + signature verification + kill-switches + `.env`.
2. WhatsApp handlers (confirmations/reminders) — first real consumer.
3. Responses handlers — IG + FB inbound auto-reply (`messages` only).
4. Post queue/publish runner for `scheduler/` (IG/FB/TikTok).
5. Campaign-draft preparation + human-approval notification for `campaigns/`.
6. Retention purge + health alerts.

## Definition of done

- [ ] One service receives + verifies Meta/WhatsApp webhooks (inbound only).
- [ ] Scheduler fires reminders, runs the post queue, and runs purge nightly.
- [ ] Campaign drafts are prepared PAUSED with a human-approval notification.
- [ ] All secrets in `.env`; per-bot + spend kill-switches; PII redacted in logs.
- [ ] Runs on the existing VPS with no new paid service.
