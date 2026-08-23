# Responses Bot — automate replies to inbound messages

**Priority: #4.** Auto-replies to people who **message us first** on Instagram
and the Facebook Page, so an ad-driven DM gets an instant, on-brand answer and a
booking path even when Ana is with a client. Read `../COMPLIANCE.md` first.
**Messenger / Instagram Messaging API only.** Inbound-only — **no engagement.**

> WhatsApp inbound replies live in `../whatsapp/todo.md` (booking-specific).
> This bot covers the IG + FB Messenger surfaces. All three share the
> orchestrator's messaging plumbing.

## What it does (scope — all user-initiated)

- [ ] **First-touch auto-reply** to an inbound IG DM or FB Page message: greet,
  show **quick replies / Ice Breakers** (Servicii / Prețuri / Programare /
  Locație).
- [ ] **FAQ keyword replies** inside the thread (RO): prices range, durată gel,
  produse, anulare, program.
- [ ] **Route "Programare"** to the WhatsApp booking link — one booking path.
- [ ] **Away message** outside hours → site + next open slot.
- [ ] **Hand-off to Ana** for anything the bot can't confidently answer.
- [ ] **STOP / opt-out** handling.

## Explicitly out of scope (engagement — banned + owner said no)

- ❌ Comment→DM funnels, auto-commenting, auto-likes/follows.
- ❌ DMing anyone who didn't message us first.
- ❌ Mass-DM, scraping, hashtag/growth tools, browser automation.

> Ice Breakers / quick replies here are configured **only** as a reply menu for
> people who already opened a chat — not as an outbound growth tactic.

## Build tasks

- [ ] IG = **Business/Creator** linked to the FB **Page** (required). Reuse the
  same Meta app + webhook as WhatsApp/campaigns/scheduler.
- [ ] Instagram Messaging + Messenger permissions on the Meta app.
- [ ] Subscribe to the **`messages`** webhook event (NOT `comments` — we're not
  doing comment automation).
- [ ] Configure Ice Breakers / persistent menu / greeting / away via API.
- [ ] Keyword → RO response map; every path ends with the WhatsApp CTA.
- [ ] Respect the **24h messaging window** (promos only inside it).
- [ ] Logging (redact PII) + per-bot kill-switch env flag.

## Decision: build vs no-code

- [ ] Option A — Meta-approved no-code tool: fastest v1, recurring fee + extra
  processor to disclose.
- [ ] Option B — **Self-built** on the orchestrator (reuses the shared webhook):
  no fee, full control, matches the self-host stack. **Recommended target.**

## Data & legal

- [ ] Minimal conversation state; purge per retention (12 mo / 30 days).
- [ ] Booking replies = art. 6(1)(b); any promo reply needs marketing opt-in.
- [ ] One Meta-as-processor disclosure in `/confidentialitate` covers IG + FB +
  WhatsApp.

## Definition of done

- [ ] Inbound IG/FB message gets an on-brand auto-reply + quick replies.
- [ ] "Programare" routes to WhatsApp; away message works off-hours.
- [ ] No `comments`/engagement code anywhere; STOP + kill-switch work.

## Sources

- Inbound DM automation IG + FB (Messaging API, user-initiated only):
  [replient.ai](https://replient.ai/en/guide/dm-automation-instagram-facebook/),
  [SleekFlow](https://sleekflow.io/blog/instagram-messenger-api),
  [inro.social](https://www.inro.social/blog/instagram-dm-automation-guide-2026)
- 2026 rules (what stays compliant):
  [CreatorFlow compliance](https://creatorflow.so/blog/instagram-dm-compliance-meta-rules/),
  [Spur](https://www.spurnow.com/en/blogs/instagram-automated-behaviour)
