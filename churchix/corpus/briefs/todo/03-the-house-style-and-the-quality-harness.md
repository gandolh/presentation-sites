# Task 03: The house style and the quality harness for Churchix

**Depends on:**

- In Churchix: brief 02 (the exact pin).
- In the root corpus of this repo: its brief 03, *The house style and the quality harness, with Astro support*. That brief explains the Astro layer (`prettier-plugin-astro`, `astro check`, `eslint-plugin-astro`, the `project: true` fallback) and the shape of `check` and `check:fast`. This brief says only where Churchix differs and what it measured.
- In the owner's skills library: brief 27, *A house style, and a quality harness that enforces it*, and brief 15, *Enforce the base-ui and code-structure skills in every repo*.
- The owner's grilling of 2026-11-10: the technical calls Q6, Q8, Q9, Q10, Q11, Q12, Q13, Q45, Q46, Q47, Q48 and Q50.

**Runs before:** 04 and 05. The reformat touches 40 of the 42 formattable files.

**Before you start:** run `brief-board guide`, passing `--project churchix` to its commands ([corpus/CLAUDE.md](../../CLAUDE.md), "brief-board").

## Context

Churchix is its own npm project inside the `presentation-sites` repo: its own `package.json` (workspaces `packages/*`, `apps/*`, `services/*`, `docs-site`), its own lockfile, its own `CLAUDE.md`. The root corpus's harness brief leaves `churchix/` out on purpose, so Churchix needs its own. The root brief's Astro layer is copied here, and the vendored `house-style` copy is separate (Q6).

### What Churchix has today (read 2026-11-10)

- **A `format` script without a formatter.** `package.json:25` is `"format": "prettier --write ."`. No `package.json` in `churchix/` declares `prettier`, there is no Prettier config, and `prettier-plugin-astro` is not installed. `.editorconfig` sets two-space indent and LF.
- **No ESLint.** The only `lint` is `packages/ui/package.json`'s `node scripts/check-max-w.mjs`, a guard for bare `max-w-sm|md|lg|xl` classes. The root `lint` runs `npm run lint --workspaces --if-present`.
- **Type checking covers only the app.** `apps/parohia-harlesti-bacau` has `"typecheck": "astro check"`, which reports 0 errors in 12 files (14.5 s). `packages/ui` and `packages/schemas` have no `typecheck` script. Run alone, `tsc --noEmit -p packages/ui` reports **7 errors** (`MobileNav.tsx:3` imports a `.ts` path without `allowImportingTsExtensions`; `PomelnicForm.tsx:93, 285, 314` use `import.meta.env` without Vite's types; `:141, 152, 369` are icon-type mismatches), and `packages/schemas` reports **2** (`src/index.ts:107, 132`, a zod 4 `.default({})` overload). The app's `astro check` passes over the same sources, so the packages' own tsconfig is what is missing. Measured in a scratch copy; step 1 confirms.
- **No tests.** No workspace has a `test` script.
- **tsconfig.** `packages/config/tsconfig.json` has `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax` and `isolatedModules`. The app extends `astro/tsconfigs/strict` instead. Neither sets `erasableSyntaxOnly`.
- **`churchix/.gitignore:49` ignores `.claude/`.** `git check-ignore -v churchix/.claude/rules/web.md` names it. A `.claude/rules/` folder here is invisible to git until that line goes or a negation is added.
- **`CLAUDE.md` exists** (`churchix/CLAUDE.md`, "Common commands" and "Conventions"). It has no `npm run check`.
- **No server.** `services/` holds a README only. The optional per-church Fastify API is a future add-on (`CLAUDE.md`, "Tech decisions"), so there is no server brief.

### Measured on 2026-11-10

On a scratch copy with the repo's `node_modules` linked in. Prettier 3.9.6 with `prettier-plugin-astro` 1.1.2, `eslint` 10.14.0, `eslint-plugin-astro` 3.2.1, `typescript-eslint` 8.72.2, TypeScript 6.0.3.

**Prettier churn.** `trailingComma: "all"`, over the 42 `.astro`, `.ts`, `.tsx`, `.mjs` and `.css` files in `apps/` and `packages/` (4,924 lines). The source is single-quoted, so the quote change is most of it:

| `printWidth` | Changed lines | Files changed |
|---|---|---|
| 100 | about 1,170 (24%) | 40 |
| **120** | **about 1,190 (24%)** | **40** |
| 130 | about 1,190 | 40 |
| 150 | about 1,210 | 40 |

By type at 150: all 29 `.astro`, all 4 `.ts`, all 3 `.tsx`, both `.mjs`, 2 of 4 `.css` change. Width does not matter. Q9 moves the single quotes to double quotes in the one reformat commit.

**tsconfig flags**, added to the app's `tsconfig.json` and run through `astro check`: `erasableSyntaxOnly` with `noImplicitOverride` 0 errors; `noUncheckedIndexedAccess` 0 errors. For the packages, `erasableSyntaxOnly` adds none to the 7 and 2 above. `exactOptionalPropertyTypes`: not measured (Q11 asks for a count first).

**ESLint.** The root brief's config (`projectService` for `.ts` and `.tsx`, `project: true` for `.astro`, the six typed rules and `no-non-null-assertion`) over `apps/` and `packages/`: **22 s**.

| Rule | Findings | Where |
|---|---|---|
| `no-non-null-assertion` | 11 | one per page in `apps/parohia-harlesti-bacau/src/pages/`: `404.astro:6`, `anunturi/[slug].astro:15`, `anunturi/index.astro:8`, `contact.astro:10`, `despre.astro:8`, `donatii.astro:7`, `index.astro:11` and `:39`, `pomelnice.astro:10`, `program.astro:8`; and `packages/ui/src/islands/MobileNav.tsx:144` |
| `no-misused-promises` | 2 | `CopyIban.tsx:51`, `PomelnicForm.tsx:136` |
| `no-unnecessary-type-assertion` | 1 | `pages/index.astro:39` |
| `no-unused-vars` | 1 | `packages/ui/src/components/GivingChannels.astro:29` |
| `no-floating-promises`, `await-thenable`, `switch-exhaustiveness-check`, `consistent-type-imports` | 0 | |
| `no-undef` | 5 | the `.mjs` files need Node globals in the config |

**The house shapes**, over the 38 `.astro`, `.ts`, `.tsx` and `.mjs` files that `git ls-files apps packages` lists:

| Shape | Count | Where |
|---|---|---|
| `enum`, `any`, `@ts-*` directives, `TODO`/`FIXME`, parameter properties | 0 | |
| non-null `!` | 11 | the table above |
| `console` | 3 | `packages/ui/scripts/check-max-w.mjs:38, 39, 42`, a CLI |
| default exports | 4 | `apps/parohia-harlesti-bacau/astro.config.mjs:18`, and the islands `CopyIban.tsx:22`, `PomelnicForm.tsx:33`, `MobileNav.tsx:44`, which Astro imports by default |

## Owner decisions

The owner's technical calls of 2026-11-10 (confirmed): `house-style` is vendored (Q6); width 120 (Q8), double quotes and semicolons (Q9); `check:fast` target 15 s, up to about 30 s (Q10); the six typed rules with `!` as an error in source (Q12, Q47); house shapes as errors, with a default export allowed for config files and Astro islands (Q13); `noUncheckedIndexedAccess` deferred where off (Q50, and it counts 0 here, so it goes on in the packages and the app now); markdown stays out of Prettier (Q45); a short `CLAUDE.md` with the commands (Q46). Config read at import time is allowed, and the checkers read their roots from `conventions.json`.

Defaults:

1. **The packages' own typecheck.** Default: fix the two tsconfigs so `tsc --noEmit` passes in `packages/ui` and `packages/schemas` (add `allowImportingTsExtensions`, Vite's client types, and the icon type fix; the zod overload follows the installed zod 4), and give each a `typecheck` script. If a fix changes behaviour, the finding goes back to the owner.
2. **`.claude/` ignore.** Default: remove `churchix/.gitignore:49`'s `.claude/` line, or replace it with `.claude/settings.local.json`, so `.claude/rules/` is committed.

## Files you OWN

- New: the Prettier config, `.prettierignore`, `.git-blame-ignore-revs`, `eslint.config.js`, `conventions.json`, `.claude/rules/churchix.md`, and the vendored `house-style` copy.
- `package.json`, `package-lock.json`, and the packages' and the app's `package.json` scripts and `tsconfig.json`.
- `.gitignore`: the `.claude/` line.
- `CLAUDE.md`: the "Common commands" section gains `check` and `check:fast`.
- The reformat, and the 15 lint fixes (11 `!`, 2 promise handlers, the assertion, the unused variable).
- Corpus: [wiki/conventions.md](../../wiki/conventions.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Behaviour beyond the listed fixes, `docs-site/`, the church content under `apps/*/src/content/`, and the root corpus.

## What to do

One commit per step, each with `npm run build` green.

1. **Measure first.** Confirm the 7 and 2 `tsc` errors, take the `exactOptionalPropertyTypes` count, the typed-rule counts with the final config, and `check:fast`'s time on one changed `.astro` file. A rule with more than about 20 real findings, or mostly false ones, goes back to the owner.
2. **Prettier.** Add `prettier` and `prettier-plugin-astro` pinned. Config as the root brief: width 120, `trailingComma: "all"`, the `astro` parser. `.prettierignore`: `*.md`, `docs-site/`, `package-lock.json`, `dist/`, `.astro/`. Commit the config, then `npm run format` alone as `style: format with Prettier`, then the hash in `.git-blame-ignore-revs`. Hand the owner `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
3. **tsconfig and typecheck.** Add `erasableSyntaxOnly` and `noImplicitOverride` to `packages/config/tsconfig.json` and the app, and `noUncheckedIndexedAccess` to the app. Fix the packages' tsconfigs (decision 1) and add `typecheck` scripts, so the root `typecheck` covers all three.
4. **ESLint.** The root brief's config. Fix the 15 findings. `no-console` allows `scripts/`. `no-default-export` allows `*.config.*` and `packages/ui/src/islands/*.tsx`.
5. **The gate.** `check` runs `typecheck`, `lint` (ESLint plus `check-max-w.mjs`), `format:check`, `check:conventions` (`check-base-ui` `--warn-only` until brief 04 is done), and `build`. `check:fast` runs `astro check` in the app and `tsc` in a package only when its files changed, then ESLint on the changed files. Time both and record them.
6. **`.claude/rules/churchix.md`**, under about 40 lines, `paths: ["apps/**", "packages/**"]`: white-label (no per-church value in `@churchix/*`), tokens only, bare `max-w-*` forbidden, Romanian copy is not run through English prose skills, diacritics must survive, money in integer minor units, and the pointers to `CLAUDE.md` and [wiki/conventions.md](../../wiki/conventions.md).
7. **Corpus.** A [wiki/decisions.md](../../wiki/decisions.md) entry, a status line, a log entry. `bash corpus/lint.sh` until clean.

## Acceptance

- [ ] `npm run check` passes, and its time and `check:fast`'s are in the outcome note.
- [ ] `npx prettier --check .` passes. The reformat is one commit whose `git diff -w` shows only formatting, and the hash is in `.git-blame-ignore-revs`.
- [ ] `npm run typecheck` runs `astro check` and both packages' `tsc`, and passes.
- [ ] `npx eslint .` reports 0 errors. A deliberate `enum`, `!`, `console.log` in `packages/ui/src`, `// TODO` and a default export in a non-island each fail `npm run lint`.
- [ ] `git check-ignore -v churchix/.claude/rules/churchix.md` prints nothing.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 04 adds the Base UI audit and `better-tailwindcss`. Brief 05 starts after the reformat.
- The root harness brief and this one use the same vendored library and the same Astro layer. A change to one is made in the other.
