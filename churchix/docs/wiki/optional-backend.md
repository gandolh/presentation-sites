---
title: Optional per-church backend
summary: The optional, single-tenant Fastify donations API a church can add later — never a shared service.
status: stable
updated: 2026-05-29
related: [donations, architecture, independence-model, research-brief]
---

# Optional per-church backend

v1 churches are **static and need no backend** ([donations](donations.md) is server-light). This page describes the **optional, per-church, single-tenant** Fastify API a church can deploy *later* if it needs live campaign totals, recurring giving, or webhooks. It is **not** a shared service and **not** required for v1. Because one deployment = one church, there is **no `tenant_id`** (drop it wherever the [research-brief](research-brief.md) shows it).

## Shape

- `buildApp()` (testable via `fastify.inject()`) + a separate `server.ts`.
- `@fastify/autoload`: **plugins** with `encapsulate:false` (wrapped in `fastify-plugin`); **routes** encapsulated (folder = URL prefix).
- JSON-Schema validation + response serialization via a TypeBox / `json-schema-to-ts` type provider → one schema yields runtime checks **and** types. Shared `$ref` for `Money {amountMinor:int, currency:enum}`.
- Auth via `@fastify/jwt` in an `onRequest` hook (+ `@fastify/auth`). Webhook routes live **outside** the JWT subtree (authenticated by provider signature).
- `pino` logging with `requestId`; `@fastify/under-pressure` for load shedding.

## Payment abstraction

All providers sit behind a `PaymentGateway` interface so a church can use Stripe, Netopia, or both:

```ts
interface PaymentGateway {
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>;   // hosted page or client_secret
  createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
  verifyWebhook(rawBody: Buffer, headers: Headers): WebhookEvent;        // signature/IPN verification
  refund(input: RefundInput): Promise<RefundResult>;
}
```

## Data model (single-tenant)

Money in minor units; webhooks are the source of truth; campaign progress is a transactional increment on `succeeded` (decrement on refund/chargeback), never recomputed at read time.

```
payment_accounts        (provider + provider_account_id + credentials_ref → secret manager)
donors                  (PII minimized, gdpr_consent + consent_at, erasable)
funds                   (restricted-giving designations)
campaigns               (goal, dates, status, denormalized raised_amount_minor + donor_count)
donations               (immutable ledger; UNIQUE(provider, provider_payment_id))
  └─ donation_allocations  (split one gift across funds)
subscriptions           (recurring; next_charge_at for self-managed gateways; mandate_ref)
pledges                 (promised vs fulfilled, per campaign)
payment_methods         (tokens/last4/brand/expiry — NO PAN)
receipts                (sequential receipt_number, pdf_ref)
processed_webhook_events (UNIQUE provider_event_id — idempotency)
refunds / disputes      (reverse campaign progress)
audit_log               (actor, action, before/after)
fundraisers/teams       (peer-to-peer, under a campaign)
```

Full annotated columns are in [research-brief §5](research-brief.md) (read with `tenant_id` dropped).

## Webhooks (mandatory if used)

- Verify against the **raw body** — raw-body parser scoped to the webhook subtree only; routes outside the JWT subtree.
- **Stripe:** `stripe.webhooks.constructEvent(rawBody, sig, secret)`; dedupe on `event.id` via a UNIQUE row in `processed_webhook_events`; write the idempotency record **and** the business mutation in the same transaction; offload receipts/CRM to BullMQ. Handle `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`, `charge.dispute.created`.
- **Netopia IPN / EuPlătesc / PayU / xMoney:** verify/decrypt per protocol (or recompute HMAC, compare with `crypto.timingSafeEqual`), ACK, idempotent.

## Hosting

EU-region Fastify + PostgreSQL (+ Redis/BullMQ for receipts), single-tenant, brought by the church. Provider keys in that church's secret manager, never in code. Consistent with the [independence-model](independence-model.md).
