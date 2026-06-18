# services/ — optional, per-church backend (NOT used in v1)

Churchix v1 has **no shared backend**. Each church is an independent static site (see [../docs/corpus/architecture.md](../docs/corpus/architecture.md) and [../docs/corpus/independence-model.md](../docs/corpus/independence-model.md)). This directory holds a **template** for a backend that an individual church can deploy **for itself** if it later needs server logic — it is **never** a shared, multi-tenant service. Full design: [../docs/corpus/optional-backend.md](../docs/corpus/optional-backend.md).

A church would only need this for:

- live campaign totals (a thermometer that updates as gifts arrive),
- recurring giving / subscriptions,
- payment webhooks as the source of truth,
- generated receipts / giving statements.

When that day comes, it's a **single-tenant** Fastify (TypeScript) deployment owned by that one church — so there is **no `tenant_id`, no RLS, no tenant resolution**. One deployment = one church.

Structure (planned, single-tenant):

```
api/
  src/
    app.ts        buildApp() — testable via fastify.inject()
    server.ts     listen()
    plugins/      autoloaded, encapsulate:false (db, env, cors, helmet, rate-limit, sensible, swagger, payments)
    routes/       autoloaded, encapsulated; folder = URL prefix (routes/v1/campaigns -> /v1/campaigns)
    domain/       donations, campaigns, subscriptions, payments (PaymentGateway adapters), receipts
    db/           migrations, repositories
```

Webhooks/IPN are the source of truth; card data never touches the server (PCI **SAQ A**); money is integer minor units.

See [../docs/corpus/donations.md](../docs/corpus/donations.md) and [../docs/corpus/optional-backend.md](../docs/corpus/optional-backend.md).
