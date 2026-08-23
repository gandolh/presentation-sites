# Campaign Bot — prepare ad campaigns (human approves spend)

**Priority: #6 (build last).** Automates the *preparation* of paid campaigns on
Meta + TikTok so launching a new promo is one click instead of 20 minutes of
clicking. **Money is always human-gated** (owner decision). Read
`../COMPLIANCE.md` first. **Meta Marketing API + TikTok Marketing API only.**

## What it does (scope)

- [ ] **Prepare a campaign as DRAFT / PAUSED** from a preset: builds the
  campaign → ad set (audience, geo, budget, optimization) → ad (creative + RO
  copy), all in **PAUSED** status. New campaigns are created paused by design so
  nothing spends until a human flips it live.
- [ ] **Notify a human** (WhatsApp/email via orchestrator) with a summary +
  a deep link to review and publish in Meta/TikTok Ads Manager.
- [ ] **Recurring presets** the bot can prepare on a schedule/trigger:
  - *Boost best Reel* — weekly, pick the top-performing organic post → engagement/
    reach campaign draft.
  - *Click-to-WhatsApp leads* — the always-on booker campaign draft.
  - *Seasonal promo* — 8 Martie / Paște / nunți / Crăciun, prepared ~3 weeks ahead.
- [ ] **Pause/resume + budget edits** on existing campaigns via API (e.g.
  capacity guardrail: auto-pause lead ads when Ana is fully booked — this *stops*
  spend, so it's safe to do without approval; resuming asks a human).
- [ ] **Pull insights** (spend, cost-per-lead, results) → weekly report feeding
  `../../ads/todo.md` review.

## Money safety (mandatory)

- [ ] Bot **never** creates an ACTIVE campaign. Always PAUSED → human publishes.
- [ ] **Hard budget ceilings** in config (daily + lifetime); bot refuses to draft
  above them.
- [ ] **Spend kill-switch** env flag → pauses ALL active campaigns at once.
- [ ] All drafts logged with full parameters for audit.

## Build tasks

- [ ] **Meta**: Business Manager + ad account + a Meta app with `ads_management`.
  Marketing API: `POST /act_{id}/campaigns` (objective e.g. `OUTCOME_ENGAGEMENT`
  / `OUTCOME_LEADS`, `status=PAUSED`) → ad set (geo radius around Târgu-Jiu, age,
  budget, optimization=conversations/leads) → creative → ad.
  - Set `special_ad_categories=[]` (none apply — not credit/housing/employment).
- [ ] **TikTok**: TikTok for Business + Marketing API app; same prepare-paused
  pattern for Spark Ads boosting an organic clip. (Optional — only after TikTok
  organic shows traction; see ads/todo.md §4.)
- [ ] **Preset templates** as config (RO copy, audience, budget) the bot fills in.
- [ ] **Approval notification** + audit log via orchestrator.
- [ ] Token refresh + health alert (ad tokens expiring is a silent failure).

## Decision (resolved)

- ✅ **Prepare-then-human-approves.** The bot does not autonomously launch
  live, money-spending campaigns. (Owner decision — keeps a bug from burning
  budget on a one-chair salon.)

## Definition of done

- [ ] Can produce a complete PAUSED campaign from a preset on Meta.
- [ ] Human gets a review notification with publish link.
- [ ] Budget ceilings + spend kill-switch enforced; auto-pause works.
- [ ] Insights report generated; no secrets committed.

## Sources

- Marketing API campaign creation (paused-first, three-tier, special categories):
  [Meta docs — create campaign](https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation/create-an-ad-campaign/),
  [Meta docs — manage campaigns](https://developers.facebook.com/docs/marketing-api/get-started/manage-campaigns/),
  [AdStellar setup](https://www.adstellar.ai/blog/meta-ads-api-integration-guide)
