# 01 — Add Tailwind to the monorepo + share the M3 config

**Tier:** A · **Depends on:** — · **Parallel with:** 03, 04

## Goal

Introduce Tailwind CSS as a **build-time** dependency across `@churchix/ui` and the church apps, with a single shared Tailwind config that encodes the Material-3 theme from [DESIGN.md](../design/DESIGN.md). The reference screens currently use `cdn.tailwindcss.com` — that is for prototyping only; **do not ship the CDN build**.

## Context

- Monorepo is **npm workspaces** (not pnpm/Yarn). Globs: `packages/*`, `apps/*`, `services/*`. Single root `package-lock.json`.
- Frontend is **Astro static-first + React islands**. Astro has a first-party Tailwind story via `@astrojs/tailwind` (or the newer Vite plugin `@tailwindcss/vite` for Tailwind v4). Pick one and document why in the ADR follow-up.
- `@churchix/ui` is consumed by each app; its components must use Tailwind classes that resolve against the **shared** config so every church renders identically (modulo brand tokens).

## Tasks

1. Decide Tailwind v3 (`@astrojs/tailwind` + `tailwind.config.cjs`) vs v4 (`@tailwindcss/vite` + CSS-first config). Default recommendation: **v4 with `@tailwindcss/vite`** for less config and native CSS-variable theming — but verify it composes with Astro + React islands. Record the choice in [wiki/log.md](../wiki/log.md).
2. Add the shared theme config. Put it in `packages/ui` (e.g. `packages/ui/tailwind.preset.cjs` for v3, or an exported CSS `@theme` block for v4) so apps extend it rather than redefine it. The theme must reproduce the `colors`, `borderRadius`, `spacing`, `fontFamily`, `fontSize` from [DESIGN.md](../design/DESIGN.md) and the reference screens' `tailwind.config` block.
3. Wire each app (`apps/parohia-berinta-maramures`, `apps/parohia-harlesti-bacau`) to use the shared preset and to scan `@churchix/ui` source for classes (content globs must include the package's `src/**`).
4. Ensure Tailwind's `content`/purge includes `node_modules/@churchix/ui/src/**/*.{astro,tsx}` (symlinked workspace) so classes used only in the library aren't purged.
5. Keep `packages/ui/src/styles/tokens.css` as the **base layer** that defines the CSS variables (see item 02) — Tailwind theme references those variables.

## Acceptance criteria

- [ ] `npm install` from root wires Tailwind into both apps and `@churchix/ui` with no duplicate React.
- [ ] A throwaway test component using `bg-primary text-on-primary rounded-lg px-gutter` renders correctly in a built app (not via CDN).
- [ ] Library classes are not purged in app builds.
- [ ] `npm run build --workspaces --if-present` passes for both apps.
- [ ] Choice (v3 vs v4) + content-glob setup documented in `docs/wiki/log.md`.

## Out of scope

- Defining the actual token *values* and per-church override mechanism — that's item 02.
- Restyling any component — later tiers.
