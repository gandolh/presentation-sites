---
title: The saloon bots' live wiring pass
created: 2026-11-11
status: open
blocked-by: the owner creates the salon's Meta Page, ad account and WhatsApp number
tags: [saloon, bots]
---

# The saloon bots' live wiring pass

The bots in `sites/saloon/marketing/bots` run end to end in mock mode. What is
left is the live wiring: the real Meta and WhatsApp calls, which can only be
tested once the owner has created the salon's ad, Page and WhatsApp accounts.
The saloon's own [STATUS.md](../../../sites/saloon/docs/STATUS.md) and
[MARKETING.md](../../../sites/saloon/docs/MARKETING.md) describe the pass.

Each place is marked in the code with a `// Live wiring:` comment. They were
`// TODO(impl):` comments until 2026-11-11, when the house style's lint rule
moved todos out of the code and into this file:

- `src/bots/campaigns/index.ts`: map a preset to the Marketing API's campaign,
  ad set and creative parameters; put an Ads Manager deep link in the approval
  message; resolve the live campaign ids of the lead presets before pausing
  them.
- `src/bots/campaigns/presets.ts`: real audience targeting and creative
  choice behind each preset.
- `src/core/senders-live.ts`: in `createPausedCampaign`, the ad set, creative
  and ad, all paused; in the notifier, delivery by the channel the owner picks
  (email or WhatsApp) instead of a log line.
- `src/bots/responses/index.ts`: the Messaging API reply and the ice-breaker
  set-up behind `senders.meta`.
- `src/bots/scheduler/index.ts`: the per-platform publishing pipeline, and an
  alert plus a retry when publishing fails.
- `src/bots/whatsapp/handler.ts`: the approved utility or away template outside
  the 24-hour window, and the "requested" appointment saved with a
  notification to Ana.
