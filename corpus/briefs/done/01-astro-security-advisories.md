# Task 01 — Clear the Astro RCE advisory (and js-yaml, svgo) in both lockfiles

## Context

Audit 2026-09-27 (see [log](../../log.md)). `npm audit` at the repo root **and**
in `churchix/` now reports the same three advisories. All three were published
after the 2026-08-23 dependency pass that left both lockfiles at 0:

| Package | Installed | Advisory | Fixed in |
|---|---|---|---|
| `astro` | 7.2.4 | GHSA-26w7-cxv4-gfx2 — remote code execution through AVIF image optimization (**critical**) | 7.2.8 (audit proposes 7.3.5) |
| `js-yaml` | 4.3.1 | GHSA-2883-xcg3-v3hh — unbounded CPU on empty merge sources (high) | 4.3.2 |
| `svgo` | 4.0.2 | GHSA-w27v-7q3p-w38r, GHSA-4vpr-x523-8j87 — `removeScripts` bypasses (high) | 4.1.0 |

`js-yaml` arrives through Astro and Starlight (the docs-sites). `svgo` arrives
through Astro and through saloon's `astro-icon` → `@iconify/tools`.

Real exposure is low. Every site is static output, and the build only
optimizes committed images, so no attacker-controlled input reaches the image
pipeline. It is still a **Now** item: the fix is a non-major bump. Four sites
pin `astro` **exactly** at `7.2.4` (`auto-service`, `subcort`, `tractari`,
`design-study`), so `npm audit fix` cannot clear it by itself.

## Files you OWN

- `sites/{auto-service,subcort,tractari,design-study}/package.json` — the `astro` pin (and `@astrojs/react` only if its peer range demands it)
- `sites/saloon/package.json` — the `astro` caret
- `package-lock.json` (root)
- `churchix/package-lock.json` (churchix manifests only if a caret does not already admit the fix — it should)

## Files you must NOT touch

- Any `src/` file. If the bump breaks a build, stop and report. Do not patch around it here.
- `sites/*/src/content/site.local.ts` and `public/images/real/*` (gitignored real data — never read or paste them).
- The per-site `"overrides"` blocks. They are dead config and belong to Task 07.

## What to do

1. Keep each entry's pin style, as the 2026-08-23 deps pass did: exact pins stay
   exact, carets stay carets. Set `astro` to `7.3.5` in the four exact-pin sites
   and `^7.3.5` in saloon. The docs-sites' `^7.1.1` already admits it.
2. Run `npm install` at the root, then `npm audit`. If `js-yaml` or `svgo` is still
   flagged, run `npm audit fix` (never `--force`).
3. In `churchix/`, run `npm audit fix` (its carets admit all three).
4. Skim the Astro 7.3 release notes for anything touching `base`,
   `build.format: "directory"`, React islands or `astro:assets`.

## Acceptance

- `npm audit` → 0 vulnerabilities at the root and in `churchix/`.
- All five sites build at their sub-path. Run each build **from inside the site**,
  because the root `<site>:build` passthroughs exit 1 until Task 02 lands:
  `cd sites/<site> && PUBLIC_BASE=/<site> npm run build`. Page counts must be
  unchanged: saloon 4, auto-service 7, subcort 8, tractari 1, design-study 183.
- `npx astro check` in each site → 0 errors.
- `npm run churchix:build` → 10 pages. `npm --prefix churchix run typecheck` → 0 errors.
- `git diff --stat` shows only manifests and lockfiles.

## Outcome — 2026-10-01

`astro` is `7.3.5` in the four exact-pin sites and `^7.3.5` in saloon, with pin
styles kept. After `npm install`, a nested `astro@7.2.4` was still locked, and
`npm audit` meanwhile also reported newer `fast-uri` and `undici` advisories,
so `npm audit fix` (no `--force`) was run at the root. `js-yaml` and `svgo`
were already cleared by the install. `churchix/`: `npm audit fix`.

- `npm audit` → **0 vulnerabilities** at the root and in `churchix/`;
  `npm ls astro` → only `7.3.5` (13 entries).
- Built from inside each site with `PUBLIC_BASE=/<site>`, all exit 0 and the
  page counts are unchanged: saloon 4, auto-service 7, subcort 8, tractari 1,
  design-study 183.
- `npx astro check` → 0 errors in all five.
- `npm run churchix:build` → 10 pages; `npm --prefix churchix run typecheck` → 0
  errors.
- `git diff --stat`: five manifests and two lockfiles only.

Release notes 7.2.5–7.3.5 (read from the upstream CHANGELOG): nothing marked
breaking. They contain base-path segment-boundary and route-normalisation
fixes, image-pipeline memory and concurrency fixes, and a responsive-image
`object-position` fix. Nothing touches `build.format: "directory"` or React
islands.
