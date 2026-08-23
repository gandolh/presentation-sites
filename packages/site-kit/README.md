# @sites/kit

The helpers every presentation site under [`sites/`](../../sites/) needs, kept in
one place so a fix lands once.

It is deliberately small. Only genuinely identical logic lives here — anything a
site configures stays in that site.

## What's in it

### `withBase(path)`

Prefixes a root-relative path with Astro's configured `base`, so hand-written
links and `public/` asset references resolve when the site is served under a
sub-path (`/saloon`, `/tractari`, …) and stay correct at `/` in dev.

```ts
import { withBase } from "@sites/kit";

withBase("/termeni/");    // "/saloon/termeni/" in a sub-path build, "/termeni/" in dev
withBase("/favicon.svg"); // "/saloon/favicon.svg"
```

Astro prefixes bundled assets (imported CSS/JS) on its own — this is only for
paths written by hand or assembled as strings.

### `createImages({ hasReal, realExt, mockExt })`

Builds a site's `img()` resolver for the mock/real image pipeline. Committed SVG
placeholders live in `public/images/<name>.svg`; git-ignored real photos live in
`public/images/real/<name>.<ext>`. Content addresses images by *logical name*, so
swapping a source never edits a path.

The logic is shared; the data is not. Each site keeps a small
`src/content/images.ts`:

```ts
import { createImages } from "@sites/kit";

export const img = createImages({
  hasReal: ["hero", "gallery-01", "gallery-02"],
});
```

A name not listed in `hasReal` falls back to its SVG mock even in a `real`
build, so a missing photo never 404s.

## What is NOT in here, on purpose

**`site.local.ts` loading.** Each site loads its git-ignored overrides with
`import.meta.glob("./site.local.ts", { eager: true })`. That path resolves
relative to the file that *calls* it, so moving it into this package would glob
this package's directory instead of the site's. It has to stay per-site.

**Placeholder generators.** `scripts/gen-placeholders.mjs` draws different
artwork per site — shared code would just be a switch statement.

**Anything a site configures.** If it needs a per-site value, it belongs in the
site, not here.

## Using it

It is a workspace package consumed as TypeScript source — no build step, no
`dist/`. Vite compiles it as part of whichever site imports it, which is also why
`import.meta.env.BASE_URL` resolves to the *consuming* site's base.

Add it to a site with `"@sites/kit": "*"` in the site's `package.json`, and list
it in that site's `astro.config.mjs` under `vite.ssr.noExternal` so the static
build compiles the TypeScript instead of trying to require it.
