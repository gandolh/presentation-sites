# Scheduler Bot — schedule & publish posts

**Priority: #5.** One queue that cross-posts the same vertical nail clip to
Instagram, Facebook and TikTok on a schedule. Read `../COMPLIANCE.md` first.
**Content Publishing API (IG/FB) + TikTok Content Posting API only** — publishing,
not engagement.

## What it does (scope)

- [ ] **Post queue**: a clip + RO caption + target platforms + publish time.
- [ ] **Publish to Instagram** (Reels, 9:16) via Content Publishing API:
  create media container → poll until processed → publish.
- [ ] **Publish to Facebook Page** (same source clip) via Content Publishing API.
- [ ] **Publish to TikTok** via Content Posting API (OAuth, MP4 ≤1 GB).
- [ ] **Human-spaced cadence**: 3–5 posts/week, never bursts; respects limits.
- [ ] **Status + failure alerts** (a failed/processing video should notify, not
  silently drop).

## Decision (resolved)

- ✅ **Native API pipeline** (self-built on the VPS), not Meta Business Suite
  Planner. No recurring fee, full control, and it can drive TikTok too (which
  the Meta planner can't). More dev work — accepted. (Owner decision.)

## Limits to respect (build them in as guardrails)

- [ ] **Instagram**: ≤100 API-published posts / 24h (Reels+Stories share the
  bucket; carousel = 1). Practical baseline ~200 API requests/hour. Reels need a
  **polling step** (video processing isn't instant). 9:16, 5–90s, H.264/HEVC,
  Business account.
- [ ] **TikTok**: ≤25 posts/account/day. Music/trend sounds are restricted via
  API — pick trending audio natively when it matters; the bot handles the
  routine cross-post.
- [ ] We post 3–5/week, so we're far under all caps — but encode the caps so a
  loop bug can't spam.

## Build tasks

- [ ] **Storage**: clips + metadata in the orchestrator (filesystem on VPS +
  SQLite row per scheduled post).
- [ ] **IG/FB**: reuse the same Meta app/Page as the other bots; Content
  Publishing permissions.
- [ ] **TikTok**: TikTok for Developers app + Content Posting API access (approval).
- [ ] **Scheduler** = orchestrator cron: at publish time, run the platform
  publish flow (with IG's create→poll→publish dance).
- [ ] **Caption templates** (RO) + per-platform tweaks (hashtags, length).
- [ ] **Retry + alert** on processing failures; **kill-switch** env flag.

## Nice-to-have (later)

- [ ] Simple web/CLI form for Ana to drop a clip + caption into the queue.
- [ ] Pull post performance to feed the weekly review + the campaign bot's
  "boost best Reel" preset.

## Definition of done

- [ ] A queued clip publishes to IG + FB + TikTok at the scheduled time.
- [ ] IG Reels polling handled; all platform caps enforced in code.
- [ ] Failures alert a human; kill-switch works; no secrets committed.

## Sources

- IG/FB Content Publishing limits + Reels requirements + polling:
  [Meta docs — content publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/),
  [Postproxy Reels guide](https://postproxy.dev/blog/instagram-reels-api-publishing-guide/),
  [zernio IG API](https://zernio.com/blog/instagram-api)
- TikTok Content Posting API (OAuth, ≤25/day, ≤1 GB):
  [TikTok for Developers](https://developers.tiktok.com/products/content-posting-api/),
  [TokPortal guide](https://www.tokportal.com/learn/tiktok-content-posting-api-developer-guide)
