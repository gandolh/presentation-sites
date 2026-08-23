# WhatsApp Bot — booking confirmations & reminders

**Priority: #2 (highest-ROI automation).** Booking already flows through
WhatsApp, so this bot cuts no-shows and gives instant replies with almost no
behavior change for Ana. It's the booking-specific slice of "automate
responses"; generic IG/FB auto-reply lives in `../responses/todo.md`. Read
`../COMPLIANCE.md` first.

## What it does (scope)

- [ ] **Instant reply** when someone messages the salon WhatsApp (from the site
  deep-link or a Click-to-WhatsApp ad): greet, list the 3 services, ask for
  preferred day/time → hand off to Ana. (Inside the free 24h service window.)
- [ ] **Booking confirmation** after Ana confirms a slot (utility template).
- [ ] **Reminder** 24h (and/or 2h) before the appointment (utility template) —
  the single biggest no-show reducer.
- [ ] **Post-visit follow-up** (opt-in only): thank-you + ask for a review +
  rebook nudge. Marketing category → needs the marketing opt-in consent.
- [ ] **Away message** outside hours pointing to the site + next open slot.
- [ ] **STOP/NU** opt-out handling.

## Which WhatsApp product?

Decision needed — two viable paths:

- [ ] **Option A — WhatsApp Business *App* (free, manual-ish).** Quick replies +
  greeting + away messages only. Zero code, zero cost, fine for ≤~20 msgs/day.
  *Good enough to start.* But no real automation (no scheduled reminders,
  no CRM, single device).
- [ ] **Option B — WhatsApp *Cloud API* (free tier, real automation).** Lets us
  send scheduled appointment confirmations/reminders as **utility templates**
  (free inside the 24h window, cheap outside; ~1,000 service convos/mo free).
  This is what unlocks reminders. Needs a Meta app + a small webhook service
  (lives in `../orchestrator`). **Recommended target** once we want reminders.

> Start on Option A for day-one coverage; build Option B for reminders.

## Build tasks (Option B — Cloud API)

- [ ] Create a **Meta app**, add WhatsApp product, get a phone number ID +
  permanent token. Set EU data residency if offered.
- [ ] Stand up a **webhook** (in the orchestrator service) to receive inbound
  messages and status callbacks.
- [ ] Submit **message templates** for approval (RO):
  - `confirmare_programare` (utility): „Bună, {nume}! Programarea ta la Ana
    Saloon pe {data} la {ora} e confirmată. 💅"
  - `reminder_programare` (utility): „Reminder: te aștept mâine la {ora}…"
  - `multumire_recenzie` (marketing, opt-in only): thank-you + review link.
- [ ] **Inbound flow**: keyword/ice-breaker style menu (Servicii / Prețuri /
  Programare / Locație) → for "Programare", collect day/time → notify Ana.
- [ ] **Scheduler** fires reminders off the appointment time (orchestrator cron).
- [ ] **Hand-off**: always let the user reach Ana; never trap them in a bot.
- [ ] **STOP** handling + suppression list.

## Data & legal

- [ ] Store only name + phone + appointment + opt-in flag. Purge per retention
  (12 mo / 30 days). See `../COMPLIANCE.md` #8–#11.
- [ ] Reminders/confirmations = art. 6(1)(b) (contract) — OK without marketing
  consent. Review/promo follow-ups = marketing → need the opt-in checkbox.
- [ ] Add WhatsApp/Meta as processor + "automated replies" note to
  `/confidentialitate` when this ships (likely already partly there).

## Definition of done

- [ ] Inbound auto-reply works inside 24h window.
- [ ] Confirmation + reminder templates approved and firing.
- [ ] STOP works; kill-switch env flag works.
- [ ] No secrets committed; retention purge job exists.

## Sources

- App vs API for micro-business:
  [Chati](https://chati.ai/blog/whatsapp-business-api-vs-whatsapp-business-app-which-one-does-your-business-actually-need-2026-guide),
  [Sanuker](https://sanuker.com/whatsapp-vs-business-app-vs-api-2026/)
- Cloud API pricing / free window / utility templates:
  [Chatarmin](https://chatarmin.com/en/blog/whats-app-api-pricing),
  [ChatMaxima](https://chatmaxima.com/whatsapp-api-pricing/),
  [respond.io](https://respond.io/blog/whatsapp-business-api-pricing)
