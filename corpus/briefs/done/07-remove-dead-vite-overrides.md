# Task 07 — Remove the dead per-site `vite` overrides

## Context

Audit 2026-09-27 (see [log](../../log.md)). Four site manifests carry a
devDependency and an override that contradict each other:

```
sites/auto-service/package.json:37-41   "vite": "8.2.2"  …  "overrides": { "vite": "7.3.3" }
sites/subcort/package.json:37-41        (same)
sites/tractari/package.json:35-39       (same)
sites/design-study/package.json:43-47   (same)
```

npm honours `overrides` **only in the root manifest**, so inside the workspace
all four are ignored. The installed, hoisted Vite is 8.2.2, which is what
Astro 7.2.4 requires (`vite: ^8.0.13`). The overrides are leftovers from before
the 2026-08-23 Vite 7 → 8 upgrade.

**Failure:** [decisions.md](../../wiki/decisions.md) keeps "a site is still a
directory you can lift out" as a preserved property of the workspace layout.
If one of these four sites is lifted out, the way the gallery site was in July,
`npm install` there *does* honour the override. It forces Vite 7.3.3 under an
Astro that needs ^8, and the build breaks with an error that looks unrelated.
Until then, the overrides only mislead readers.

## Files you OWN

- the four `package.json` files listed above
- root `package-lock.json`

## Files you must NOT touch

- `sites/saloon/package.json` (it has neither entry), `churchix/**`, any `src/`.

## What to do

1. Delete the four `"overrides"` blocks.
2. Check whether anything in those sites imports Vite directly:
   `grep -rln "from ['\"]vite['\"]" sites/<site> --include=*.ts --include=*.mjs --include=*.astro`,
   ignoring `docs-site/` and `node_modules/`. If nothing does, delete the
   `"vite"` devDependency as well, because Astro brings its own. If something
   does, keep it and match Astro's range.
3. Run `npm install` at the root.

If Task 01 is also in flight, do this one after it. Both touch the same
manifests and the lockfile.

## Acceptance

- `grep -n '"overrides"' sites/*/package.json` → nothing.
- `npm ls vite` → a single 8.x version, deduped.
- All five sites build at their sub-path. `npx astro check` → clean in the four touched sites.

## Outcome — 2026-10-01

The four `"overrides"` blocks are deleted. `grep` for `from 'vite'` / `"vite"`
across the four sites (`.ts`, `.mts`, `.mjs`, `.js`, `.astro`; `docs-site/`,
`dist/` and `node_modules/` excluded) finds nothing, so the `"vite"`
devDependency went too: Astro brings its own. The manifests were edited as
JSON, so formatting is preserved.

- `grep -n '"overrides"' sites/*/package.json` → nothing.
- `npm ls vite` → a single `vite@8.2.2`, deduped everywhere. (A `4.3.3` in a
  naive match was `@tailwindcss/vite`, not Vite.)
- All five sites build at their sub-path with unchanged page counts (4, 7, 8,
  1, 183); `npx astro check` → 0 errors in the four touched sites;
  `npm audit` still 0.
