# Task 09 — Absolute, correct URLs in every page head (canonical, Open Graph, JSON-LD)

## Context

Audit 2026-09-27 (see [log](../../log.md)). Each site assembles its absolute
URLs by hand from a hardcoded origin, and none of those origins is where the
sites are actually served. vps-deploy's `PresentationSiteStack` serves every
site at `https://gandolh.ro/<site>/`. This is the emitted head from sub-path
builds (`PUBLIC_BASE=/<site>`):

| Site | canonical / og:url | og:image, twitter:image | JSON-LD image |
|---|---|---|---|
| saloon | `https://anasaloon.ro/` | `/saloon/images/og-image.svg` | `https://anasaloon.ro/saloon/images/og-image.svg` |
| auto-service | `https://bavauto.ro/` | `/auto-service/images/og-image.png` | `https://bavauto.ro/images/og-image.png` |
| subcort | `https://subcort.ro/` | `/subcort/images/og-image.svg` | `https://subcort.ro/subcort/images/og-image.svg` |
| tractari | `https://axatractari.ro/` | — (none) | — |

That is three separate defects:

1. **`og:image` and `twitter:image` are root-relative.** X requires an absolute
   URL. Most other scrapers resolve a relative URL against `og:url`, which points
   at a different domain, so the image 404s. A shared link previews without an image.
2. **The JSON-LD image is wrong under both deployments.** saloon and subcort glue
   the real-domain origin onto the sub-path base; auto-service drops the base.
3. **`canonical` names a domain that does not serve the site.** For the two
   client sites this becomes correct only once their domains go live. For the
   two demos the brands are fictional, so `subcort.ro` and `axatractari.ro`
   point search engines at domains this repo does not control.

Sources:

- `sites/saloon/src/layouts/Base.astro:32-36, 46, 57-64, 77`
- `sites/auto-service/src/layouts/Base.astro:30-37, 64, 75-82, 95`
- `sites/subcort/src/layouts/Base.astro:31-35, 45, 56-63, 76`
- `sites/tractari/src/layouts/Base.astro:25-26, 36, 47`

## Decision needed first — ask the owner, record it in decisions.md

What should each site's canonical origin be *today*?

**Recommended:** canonical = where the site is served. Add
`site: process.env.PUBLIC_SITE ?? "https://gandolh.ro"` next to the existing
env-driven `base` in each `astro.config.mjs`. This extends the "sub-path
hosting via an env-driven base" decision in
[decisions.md](../../wiki/decisions.md). At launch, a client site moves to its
own domain by building with `PUBLIC_SITE=https://anasaloon.ro PUBLIC_BASE=/`.

## Files you OWN

- `packages/site-kit/src/url.ts`, `src/index.ts`, `README.md` — a new `absoluteUrl()`
- `sites/{saloon,auto-service,subcort,tractari}/astro.config.mjs` — the `site` option
- `sites/{saloon,auto-service,subcort,tractari}/src/layouts/Base.astro`
- `corpus/wiki/decisions.md` (the new entry), `corpus/log.md`

## Files you must NOT touch

- `sites/design-study/**`. It is deliberately `noindex`, with no canonical and no OG tags.
- The OG image assets. Those are Task 10.
- vps-deploy, which is a different repo. If the default origin matches the deploy, it needs no change.

## What to do

1. Add `absoluteUrl(path)` to `@sites/kit`:
   `new URL(withBase(path), import.meta.env.SITE).href`. Astro exposes the
   `site` config value as `import.meta.env.SITE`. If it is unset, throw a clear
   error, so a site that forgets `site` fails its build instead of shipping
   relative tags. The logic is identical across sites, so it meets the kit's bar.
2. In each `Base.astro`:
   - delete the hardcoded origin;
   - set `canonical = absoluteUrl(path)` and use it for `og:url`;
   - set `og:image` and `twitter:image` to `absoluteUrl(<card path>)`;
   - build the JSON-LD `url` and `image` with the same helper.
3. tractari has no card yet. Leave `og:image` out until Task 10 adds one, and use
   `twitter:card = summary` until then.

## Acceptance

- Build each site with `PUBLIC_BASE=/<site>`. In `dist/index.html` and one inner
  page per site, every `canonical`, `og:url`, `og:image`, `twitter:image` and
  JSON-LD `url`/`image` starts with `https://gandolh.ro/<site>/` (or whichever
  origin was chosen).
- Build with `PUBLIC_BASE=/ PUBLIC_SITE=https://example.test`: the same tags start
  with `https://example.test/` and contain no `/<site>/` segment.
- Removing `site` from one config makes that build fail with the helper's error.
- `npx astro check` → clean in the four sites.

## Outcome — 2026-10-02

**Decision:** canonical = where the site is served, as the brief recommended.
Each site's config has `site: process.env.PUBLIC_SITE ?? "https://gandolh.ro"`,
recorded in [decisions.md](../../wiki/decisions.md). The agent running the brief
made this call; the owner was not asked first.

`@sites/kit` gains `absoluteUrl(path)`, which is `new URL(withBase(path),
import.meta.env.SITE)` and throws a named error when `site` is unset. It also
gains `pagePath(pathname)`, the inverse of `withBase`. Each `Base.astro` dropped
its hardcoded origin. `canonical`/`og:url` = `absoluteUrl(path)`, and `og:image`,
`twitter:image` and the JSON-LD `image` share one absolute card URL. The JSON-LD
`url` is `absoluteUrl("/")`. tractari has no `og:image` and uses
`twitter:card = summary` until Task 10.

Beyond the brief: `path` now defaults to `pagePath(Astro.url.pathname)` instead
of `"/"`. Every legal page renders through `LegalLayout` with no path, so before
this each one declared the home page as its canonical. saloon's `Base` gains the
`path` prop it lacked.

Verified:
- `PUBLIC_BASE=/<site>`: home plus an inner page per site (saloon `/termeni/`,
  auto-service `/servicii/` and `/cookie-uri/`, subcort `/zona/`). Every
  canonical, og:url, og:image, twitter:image and JSON-LD url/image starts with
  `https://gandolh.ro/<site>/`.
- `PUBLIC_BASE=/ PUBLIC_SITE=https://example.test`: all four sites emit
  `https://example.test/…` with no `/<site>/` segment.
- tractari with `site` removed fails its build with the `absoluteUrl` error.
- `astro check`: 0 errors and 0 warnings in all four. saloon's 6 hints were
  already there.
