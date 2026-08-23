# Marketing & Automation — Ana Saloon

Plan-only. No code yet. This folder holds **(1)** the advertising strategy and
**(2)** the design for a set of *compliant* automation bots.

> Context: single-employee nail salon in Târgu-Jiu, Gorj. RO-only audience.
> Booking is a WhatsApp deep-link + Formspree backup (no booking SaaS).
> Free / cheap stack only. Owner (Ana) is non-technical; Cristian builds it.
> See `../docs/ADR.md`, `../docs/LEGAL.md` and the project memory.

## What the bots do — and don't

The bots do **exactly three jobs**, all via official platform APIs:

1. **Start / manage ad campaigns** — Meta Marketing API + TikTok Marketing API.
   The bot *prepares* a campaign (audience, budget, creative, copy) as a
   **draft/paused** and notifies a human to review + flip it live. Money is
   always human-gated.
2. **Automate responses** — reply to people who **message us first**
   (WhatsApp Cloud API, Messenger / Instagram Messaging API). Inbound-only.
3. **Schedule posts** — queue + publish Reels/clips via Content Publishing
   (IG/FB) + TikTok Content Posting API.

They do **NOT** do engagement: no auto-like, auto-follow, auto-comment, or
DMing strangers. Those are banned by Meta/TikTok (shadowban → account deletion
in 2026) **and** out of scope by the owner's decision. For a one-chair salon
whose Instagram *is* the shopfront, that risk isn't worth taking.

See `bots/COMPLIANCE.md` for the hard rules every bot must obey.

## Folder map

```
marketing/
├── README.md                ← you are here
├── ads/
│   └── todo.md              ← paid ad strategy (Meta + TikTok), budgets, funnel
└── bots/
    ├── COMPLIANCE.md        ← non-negotiable ToS/GDPR/money rules
    ├── campaigns/todo.md    ← prepare ad campaigns (Marketing API) → human approves
    ├── responses/todo.md    ← inbound auto-reply (WhatsApp + IG/FB Messaging)
    ├── scheduler/todo.md    ← schedule & publish posts (Content Publishing + TikTok)
    ├── whatsapp/todo.md      ← booking confirmations & reminders (Cloud API)
    └── orchestrator/todo.md  ← shared host: webhooks, cron, secrets, kill-switches
```

> `responses/` and `whatsapp/` overlap (both are WhatsApp messaging): `whatsapp/`
> is the booking-specific confirmation/reminder flow; `responses/` is the
> generic inbound auto-reply across all messaging surfaces. They'll share the
> orchestrator's WhatsApp sender. Kept separate so the booking logic stays clear.

## Phasing (do them in this order)

1. **Ad strategy + organic** (`ads/todo.md`) — drives bookings day one, zero code.
2. **WhatsApp bot** (`bots/whatsapp/todo.md`) — confirmations + reminders cut
   no-shows; booking already flows through WhatsApp. Highest-ROI automation.
3. **Orchestrator** (`bots/orchestrator/todo.md`) — the shared backend, built
   when the WhatsApp bot needs a home for its webhook + scheduler.
4. **Responses bot** (`bots/responses/todo.md`) — generic inbound auto-reply on
   IG/FB once ads start sending message-leads there.
5. **Scheduler** (`bots/scheduler/todo.md`) — post pipeline once the cross-post
   queue (IG+FB+TikTok) becomes a chore to do by hand.
6. **Campaign bot** (`bots/campaigns/todo.md`) — last; only worth automating once
   the manual ad workflow is well understood and repeatable.

## Costs

All bot APIs have a free tier large enough for one salon:
- **WhatsApp Cloud API**: inbound + in-window replies free; utility templates
  (confirmations/reminders) free in-window, cheap out. ~1,000 service convos/mo free.
- **Meta Marketing / Content Publishing / Messaging APIs**: free (you only pay
  the ad spend itself, which the bot gates behind human approval).
- **TikTok Marketing / Content Posting API**: free (≤25 posts/account/day).

Real cost is **hosting + dev time**, not API fees. The orchestrator runs on the
salon's existing VPS (the same box serving the static site).
