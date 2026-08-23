# Bot Compliance Rules (non-negotiable)

These bots do exactly three things: **(1) prepare/manage ad campaigns,
(2) automate responses to inbound messages, (3) schedule posts.** They do **NOT**
do engagement (no auto-like / follow / comment / mass-DM). Every rule below
comes from Meta's & TikTok's 2026 platform terms and from Romanian/EU law.

## Platform ToS

1. **Official APIs only.** Meta Marketing API, Meta Content Publishing API,
   WhatsApp Cloud API, Messenger / Instagram Messaging API, TikTok Marketing API,
   TikTok Content Posting API. No browser automation, no scraping, no
   undocumented endpoints, no third-party "growth"/"engagement" panels.
2. **No engagement automation, period.** No auto-like, auto-follow/unfollow,
   auto-comment, or DMing people who didn't message us first. (Out of scope by
   the owner's decision *and* banned by ToS.)
3. **Responses are inbound-only.** A response bot may act only after the user
   messages us (DM, story reply, Page/WhatsApp message). It never initiates
   contact with someone who didn't write first.
4. **Respect the 24-hour messaging window.** Promotional replies only inside the
   24h window opened by a user message; outside it, only approved utility/
   template messages.
5. **Rate limits & human cadence.** Stay well under documented caps (Meta API
   limits, TikTok ≤25 posts/account/day). Space scheduled posts like a human —
   no machine-gun bursts even via the API.

## Money safety (ad-campaign bot)

6. **Human-in-the-loop on spend.** The campaign bot **prepares** campaigns as
   DRAFT / PAUSED and notifies a human to review + flip live. It does **not**
   publish live, money-spending campaigns autonomously. (Owner decision.)
7. **Hard budget guardrails.** Daily + lifetime caps enforced in code; the bot
   refuses to create a campaign above a configured ceiling. Capacity guardrail:
   don't run lead ads when the one chair is fully booked.
8. **Spend kill-switch.** A single env flag pauses ALL active campaigns instantly.

## GDPR / RO law (real salon, real client data)

9. **Lawful basis.** Booking-related messages = art. 6(1)(b) (contract).
   Marketing replies/broadcasts = require prior **opt-in consent** (art. 6(1)(a))
   via the unchecked-by-default marketing checkbox already in the booking form.
10. **Retention.** 12 months after last appointment; 30 days for enquiries that
    don't convert. Bot stores purge on this schedule. (See `../../docs/LEGAL.md`.)
11. **Disclose processors.** `/confidentialitate` must name WhatsApp/Meta/TikTok
    as processors and state replies may be automated. Update when a bot ships.
12. **Data minimisation & security.** Store only name / phone / appointment /
    opt-in. Secrets in `.env`, never committed. EU data region where offered.
    Never store health or other sensitive data.

## Brand / quality

13. **On-voice, RO-only.** Replies and ad copy read like Ana (warm, blush/cream/
    gold tone), not a chatbot. Always offer a route to a real human.
14. **Fail safe.** If unsure, hand off to a human and say so.

## Definition of done for ANY bot PR

- [ ] Uses only the official API listed in its `todo.md`.
- [ ] Responses trigger on inbound user events only; no engagement actions.
- [ ] Campaigns are prepared as draft/paused for human approval; budget caps + spend kill-switch enforced.
- [ ] STOP/opt-out handling on messaging; per-bot kill-switch env flag.
- [ ] Secrets in `.env`; no PII beyond necessity in logs; retention purge exists.
- [ ] Privacy policy updated if a new processor/data flow is introduced.
