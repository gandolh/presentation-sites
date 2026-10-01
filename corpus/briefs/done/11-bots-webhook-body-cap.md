# Task 11 — Bots webhook: cap the request body before verifying the signature

## Context

Audit 2026-09-27 (see [log](../../log.md)).
`sites/saloon/marketing/bots/src/core/webhook-http.ts:26-33` reads the POST body
with no size limit: it appends chunks with `data += c` until `end`. The POST
handler (`:150-158`) reads the **whole** body before `verifyMetaSignature` runs.
Any client that can reach the port can make the process buffer a request of
any size.

**Failure (once live):** someone streams a multi-gigabyte POST at `/webhook`.
The string grows until the Node process runs out of memory, the bot dies, and
inbound WhatsApp and Instagram messages are lost until it restarts — all
without the attacker ever presenting a valid signature. Today the service runs
in mock mode only (no listener), so this is a **before-go-live** fix, not an
incident.

Meta's webhook payloads are a few kilobytes, and Meta escapes non-ASCII
characters as `\uXXXX`, so the body is ASCII.

## Files you OWN

- `sites/saloon/marketing/bots/src/core/webhook-http.ts`
- `sites/saloon/marketing/bots/src/core/webhook-http.test.ts`

## Files you must NOT touch

- `src/core/webhook.ts` and the other `core/` contracts. The bots README marks
  them "FROZEN". Change no exported signature: `startWebhookServer`,
  `parseMetaInbound` and `verifyMetaSignature` stay as they are.
- `COMPLIANCE.md` and its inbound-only rule. This change does not affect it; keep it that way.

## What to do

1. Change `readBody(req, limit)` to collect `Buffer` chunks and track the byte
   count. As soon as the count exceeds the limit (1 MiB is ample), stop reading,
   reply **413** and destroy the request. Otherwise return
   `Buffer.concat(chunks).toString("utf8")`.
2. Reject with 413 before reading anything when `content-length` exceeds the limit.
3. Set conservative timeouts on the returned server, e.g. `headersTimeout` 10 s
   and `requestTimeout` 15 s, so a slow-drip request cannot hold a socket for
   Node's 300 s default.
4. Add tests that start the server on port 0 with a stub dispatcher:
   - an oversized body gets 413 and never reaches `dispatch`;
   - a correctly signed small body still gets 200 and is dispatched;
   - a bad signature still gets 401.

## Acceptance

- `npm run saloon:bots` (typecheck + tests) passes: the existing 66 tests plus the new ones.
- No exported type or function signature in `src/core/` changes.

## Outcome — 2026-10-01

`readBody(req, limit)` collects `Buffer` chunks, counts bytes, and resolves
`null` the moment the count passes `MAX_BODY_BYTES` (1 MiB); reading stops
there. Otherwise it decodes `Buffer.concat(chunks)` once, so a character split
across chunks is not mangled. The POST handler answers **413** with
`connection: close` and destroys the request once the response is flushed. It
does this **before reading anything** when `content-length` already exceeds
the limit, and as soon as the limit is crossed otherwise. The signature check
and dispatch are untouched and run only for a body within the cap. The server
gets `headersTimeout` 10 s and `requestTimeout` 15 s.

No exported signature changed (`startWebhookServer`, `parseMetaInbound`,
`verifyMetaSignature`), and `webhook.ts`, the other `core/` contracts and
`COMPLIANCE.md` are untouched.

Tests start the real server on port 0 with a stub dispatcher:
- a correctly signed small body → 200, dispatched;
- a bad signature → 401, not dispatched;
- a declared 2 MiB body → 413, not dispatched;
- a streamed 4 MiB chunked body with no `content-length` → 413, not dispatched.

`npm run saloon:bots` (typecheck + tests) passes: **70 = 66 existing + 4 new**.
**Mutation:** with the cap set to `Infinity`, both oversized tests fail.
