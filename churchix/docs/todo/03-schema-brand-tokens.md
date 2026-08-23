# 03 — Extend `@churchix/schemas` brand object for the M3 token set

**Tier:** A · **Depends on:** — · **Parallel with:** 01, 04

## Goal

Update the shared Zod `brand` object in `@churchix/schemas` so a church can express the **seed** Material-3 tokens (and keep logo/favicon/og as paths). Keep the surface small: churches set seeds, not the whole palette.

## Context

- Schema lives in [packages/schemas/src/index.ts](../../packages/schemas/src/index.ts). Today `brand` has `primary`, `accent`, `surface?`, `onPrimary?`, `fontHeading?`, `fontBody?`, `radius?`, `logo`, `favicon?`, `ogImage?`.
- ADR-0002 moves us to the M3 role naming. The legacy `accent` maps to **`secondary`** (the gold). `BaseLayout` (item 02) consumes these to emit CSS vars.
- This must stay **backward compatible enough** that both reference apps' `site.json` keep validating, or update those JSONs in the same change (coordinate with item 14).

## Tasks

1. Rename/extend `brand` to the M3 seed set. Suggested shape:
   - `primary: string` (required) — burgundy seed.
   - `secondary: string` (required; was `accent`) — gold seed.
   - `surface?: string` — cream page background.
   - `error?: string` — optional override; defaults to M3 `error`.
   - `onPrimary?: string`, `fontHeading?`, `fontBody?`, `radius?` — keep.
   - `logo: string`, `favicon?`, `ogImage?` — keep (paths, not tokens).
2. Decide migration for the existing `accent` field: either accept both (`accent` as deprecated alias of `secondary`) or do a clean rename and update both apps' `site.json`. Document the choice.
3. Keep the `emptyToUndefined` / optional-string preprocessing pattern already used in the file.
4. Export updated `SiteConfig` type; ensure `BaseLayout` (item 02) reads the new fields.

## Acceptance criteria

- [ ] `brand` validates a church providing only `primary`, `secondary`, `logo` (others optional/derived).
- [ ] Both reference apps' `site.json` validate against the new schema (update them if renaming).
- [ ] `npm run typecheck --workspaces --if-present` passes.
- [ ] Migration decision (alias vs rename) noted in `docs/wiki/log.md`.

## Out of scope

- Emitting the CSS vars / deriving roles — item 02.
