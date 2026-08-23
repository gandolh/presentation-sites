# apps/ — one Astro site per church

Each church (tenant) gets a directory here. A church app should be **thin**: branding tokens, content (Content Collections), site config, and a `content.config.ts` that imports the shared schemas from `@churchix/schemas`. All real UI comes from `@churchix/ui`.

Each app is **fully independent** — its own build, deploy, domain, env, and content. Apps share *code* (`@churchix/*`) but never depend on each other and never share a runtime or database. Adding a church = copy an existing app directory; removing one = delete it.

```
apps/
  parohia-harlesti-bacau/       Parohia „Sfinții Trei Ierarhi”, Hârlești (com. Filipești, jud. Bacău)
```

This is a **real Romanian Orthodox parish that currently has no website** — used as a realistic example. Contact details, IBANs, and amounts are clearly-marked placeholders for the parish to complete; the parish name, locality, hram, and history are factual (source: protoieriabacau.ro).

A typical church app contains roughly:

```
<church>/
  astro.config.ts            mergeConfig(base, { site, integrations: [react(), ...], adapter })
  content.config.ts          imports collections from @churchix/schemas
  src/
    content/                 markdown/MDX + data per collection (the church's content)
    theme.css                ~12 design-token overrides (CSS custom properties)
    pages/                   mostly re-exports of shared layouts/templates from @churchix/ui
  public/                    logo, favicon, og image, downloadable program PDF
  package.json               depends on @churchix/ui, @churchix/schemas, @churchix/config
```

What varies per church: **branding tokens, content, languages, enabled features, funds/campaigns, giving links**. What comes from `@churchix/ui`: layouts, components, and islands — but each church **owns its own page files**, so it can diverge freely (independence over DRY).

See [../docs/wiki/architecture.md](../docs/wiki/architecture.md) and [../docs/wiki/content-model.md](../docs/wiki/content-model.md).
