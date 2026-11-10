# Task 03: The house style and the quality harness, with Astro support

**Depends on:**

- In this repo: brief 02 (the exact pin). Nothing else.
- In the owner's skills library:
  - brief 27, *A house style, and a quality harness that enforces it*: the vendored `house-style` copy, its `check` and `check:fast` shape, the `Stop` and `PostToolUse` hooks;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: how the convention checkers are wired and when they run `--warn-only`.
- The owner's grilling of 2026-11-10: the technical calls Q6 (vendored), Q8 and Q51 (width 120), Q9, Q10, Q11, Q12, Q13, Q45, Q46, Q47, Q48 and Q50.

**Runs before:** 04 and 05-08. The reformat touches most `.astro` files, and the later briefs rewrite many of them. Format first, once.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

On 2026-11-09 the owner decided that the researched conventions are enforced in every repo they own. The skills library's brief 27 defines the harness: Prettier, stricter tsconfig flags, six typed ESLint rules, a `check` and a fast `check:fast`, `.claude/rules/`, and a short root `CLAUDE.md`.

The library's harness was measured on TypeScript apps. This repo is **Astro**: 150 of its 274 formattable files are `.astro` (see below). Prettier, the type checker and ESLint all need an Astro layer, and this brief adds it. Churchix has its own harness brief in its own corpus, and this one leaves `churchix/` out.

### What the repo has today (read 2026-11-10)

- **No formatter, no linter.** There is no Prettier or ESLint config at the root or under `sites/`. Prettier 3.9.6 sits in `node_modules/.bin` only as a hoisted transitive dependency. No `package.json` declares it, and `prettier-plugin-astro` is not installed.
- **No root `CLAUDE.md`.** The only `CLAUDE.md` is [corpus/CLAUDE.md](../../CLAUDE.md), which loads once an agent opens a file under `corpus/`. `churchix/CLAUDE.md` covers `churchix/` only. The root `.gitignore` has no `.claude` line, so `.claude/rules/` can be committed here (`git check-ignore -v .claude/rules/web.md` prints nothing). `churchix/.gitignore:49` does ignore `.claude/`, which is Churchix's brief.
- **Root scripts** (`package.json`): per-site `dev`, `build`, `preview`, `docs`, plus `build` (`npm run build --workspaces --if-present`). No `typecheck`, `lint`, `test`, `check` or `format`. No site defines `typecheck`; `@astrojs/check` 0.9.10 is a dependency of each site, but nothing runs it.
- **Workspaces:** `sites/*`, `sites/*/docs-site`, `packages/*`. `sites/saloon/marketing/bots` is outside the workspaces. It has its own lockfile, is reached through `saloon:bots` (`npm --prefix`), and checks itself with `check` (`tsc --noEmit` then `node --test`). Its `lint` script is `tsc --noEmit`, the same as `typecheck`.
- **tsconfig.** The four live sites and `design-study` extend `astro/tsconfigs/strict`: `strict`, `verbatimModuleSyntax`, `isolatedModules`, `skipLibCheck`, `moduleResolution: Bundler`. They do not set `erasableSyntaxOnly`, `noImplicitOverride` or `noUncheckedIndexedAccess`. `packages/site-kit/tsconfig.json` sets `strict`, `noUncheckedIndexedAccess` and `verbatimModuleSyntax`, and `tsc --noEmit -p packages/site-kit` passes. The bots package sets `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` and `exactOptionalPropertyTypes`.
- **Docs sites.** Each `sites/*/docs-site` is a Docusaurus site. Prettier and ESLint leave them alone.

### Measured on 2026-11-10

Taken on a scratch copy of the repo, with the repo's own `node_modules` linked in, and `prettier-plugin-astro` 1.1.2, `eslint` 10.14.0, `eslint-plugin-astro` 3.2.1 and `typescript-eslint` 8.72.2 installed beside it. Prettier was 3.9.6, TypeScript 6.0.3.

**Prettier churn.** `trailingComma: "all"`, `.astro` through the plugin, over the 274 `.astro`, `.ts`, `.tsx`, `.mjs` and `.css` files outside `churchix/`, `corpus/`, `docs/` and `docs-site/` (30,147 lines). Changed lines are the added-plus-removed diff lines divided by two:

| `printWidth` | Changed lines | Files changed |
|---|---|---|
| 100 | about 3,800 (12.6%) | 177 |
| **120** | **about 3,790 (12.6%)** | **188** |
| 130 | about 3,830 | 190 |
| 150 | about 3,930 | 195 |

Width barely matters here. The churn is the gap between the hand-written style and Prettier's, mostly in `.astro` files. At 120, by type: `.astro` 116 of 150 files change, `.ts` 45 of 84, `.tsx` 8 of 11, `.mjs` 5 of 10, `.css` 14 of 19. By site: auto-service 28 files, saloon 51, subcort 27, tractari 16, design-study 63, `packages/` 3. The plugin formatted every file with no parse error. `prettier --check .` over the same files takes 5.6 s.

**Type checking.** `npx astro check` in each site, 0 errors in all five:

| Site | Files | Time | Hints |
|---|---|---|---|
| saloon | 66 | 14.6 s | 6 |
| auto-service | 35 | 8.5 s | 0 |
| subcort | 30 | 9.9 s | 0 |
| tractari | 19 | 10.0 s | 0 |
| design-study | 106 | not timed | 0 |

The four live sites take about 43 s one after another. That is over Q10's 30 s ceiling, so `check:fast` checks only the sites with changed files.

**tsconfig flags**, added one set at a time to each live site's `tsconfig.json`, then `astro check`:

- `erasableSyntaxOnly` and `noImplicitOverride` together: 0 errors in all four.
- `noUncheckedIndexedAccess`: saloon 0, auto-service 0, subcort **86**, tractari **5**. Q50 defers it where it is off, and this brief follows that for subcort and tractari. Saloon and auto-service count 0, so they take it now.
- `exactOptionalPropertyTypes`: not measured. Q11 asks for a count first, so step 1 takes it.

**ESLint.** One flat config, `typescript-eslint` recommended, `eslint-plugin-astro` recommended, and the six typed rules with `no-non-null-assertion`, over `sites/` (without design-study) and `packages/`, which is 150 linted files:

- `astro-eslint-parser` does not support `projectService`. It warns and falls back to `project: true` for `.astro` files, so typed linting of the sites costs a full program per site. The run took **50 s** for the whole repo.
- Counts by rule:

| Rule | Findings | Where |
|---|---|---|
| `no-floating-promises` | 71 | 70 are `describe`/`it` calls in `sites/saloon/marketing/bots/src/**/*.test.ts` (`node:test`, Q12's `allowForKnownSafeCalls`); 1 is `sites/tractari/src/components/hero/HeroCanvas.tsx:36` |
| `no-non-null-assertion` | 12 | 6 in the bots tests (`campaigns.test.ts:157`, `whatsapp.test.ts:204, 205, 220, 221, 222`); `sites/subcort/src/components/ExplodedPlate.astro:31`; `HeroCanvas.tsx:40, 46`; `sites/tractari/src/components/hero/scene.ts:122` (two) and `:330` |
| `no-unnecessary-type-assertion` | 5 | `bots/src/core/db-sqlite.ts:164`, `sites/subcort/src/lib/draft.ts:214`, `scene.ts:122` (two), `sites/tractari/src/content/site.ts:106` |
| `consistent-type-imports` | 1 | `HeroCanvas.tsx:32` |
| `no-misused-promises`, `await-thenable`, `switch-exhaustiveness-check` | 0 | |
| `no-undef` | 15 | the `.mjs` scripts: they need Node globals in the config, not a code fix |
| `no-unused-vars` | 3 | |

**The house shapes**, counted with `grep` over the 150 `.astro`, `.ts`, `.tsx` and `.mjs` files that `git ls-files sites packages` lists (outside design-study and docs-site):

| Shape | Count | Where |
|---|---|---|
| `enum` | 0 | |
| `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` | 0 | |
| non-null `!` | 12 | the table above |
| `console` | 7 (5 + 2) | `sites/auto-service/scripts/gen-placeholders.mjs:136`, `sites/saloon/scripts/gen-placeholders.mjs:70, 74`, `sites/subcort/scripts/gen-og.mjs:101, 119` are CLIs; 2 more are in the bots |
| `TODO` markers | 8 | all in `sites/saloon/marketing/bots/src` (`presets.ts:11, 49`, `handler.ts:8, 96, 105`, `responses/index.ts:125, 142`, `jobs.ts:55`; three are prose mentions); the `07XX` phone placeholders are not TODOs |
| default exports | 12 | 4 `astro.config.mjs` files, and 8 React islands that Astro hydrates by default import: `MapConsent`, `MobileMenu` (four, one per site), `TentScale`, `CallDock`, `HeroCanvas` |
| parameter properties | 0 | |

`.astro` files cannot be counted for `enum` and the like with a TypeScript parser here. The ESLint run in step 1 re-counts them.

## Owner decisions

The owner's technical calls of 2026-11-10 (confirmed by the owner):

1. **`house-style` is vendored** into the repo with a version header, refreshed by `house-style:sync` (Q6).
2. **Prettier at width 120** (Q8, Q51), double quotes and semicolons (Q9), `trailingComma: "all"`. Markdown stays out of Prettier (Q45).
3. **`check:fast`** is a typecheck plus ESLint on the changed files, target 15 s, up to about 30 s accepted (Q10).
4. **Typed rules** are the six, with `no-floating-promises` naming `node:test`'s `describe`, `it` and `test` in `allowForKnownSafeCalls` (Q12). **Q47:** `!` is an error in source and a warning in tests. **Q48:** `considerDefaultExhaustiveForUnions: true`.
5. **House shapes as errors**, with `console` allowed in scripts and CLIs, and a default export allowed where a framework needs one: configs, and the React islands that Astro imports by default (Q13).
6. **`noUncheckedIndexedAccess` is deferred** where it is off (Q50). A short root `CLAUDE.md` with the commands (Q46).
7. The checkers read their roots from `conventions.json`, and config read at import time is allowed.

Defaults still open (the skills library's open questions, Q-numbers as in its list):

8. **Astro support is local.** The vendored `house-style` is written for TypeScript and React. This repo adds the Astro layer itself (`prettier-plugin-astro`, `eslint-plugin-astro`, `astro check`), and reports the shape back to the library. If the library later ships an Astro preset, this repo switches to it.
9. **Bots tests.** The `node:test` files in `sites/saloon/marketing/bots` are linted in the root config. If the typed rules cost too much there, the bots keep their own `check` and the root skips them. Step 1 decides.

## Files you OWN

- New: `.prettierrc` (or the vendored preset's), `.prettierignore`, `.git-blame-ignore-revs`, `eslint.config.js`, `conventions.json`, `CLAUDE.md`, `.claude/rules/sites.md`, and the vendored `house-style` copy under the path its sync script names.
- Root `package.json` (scripts, devDependencies) and `package-lock.json`.
- Each live site's `tsconfig.json` and `package.json`: the new flags and a `typecheck` script (`astro check`). `packages/site-kit/package.json`: a `typecheck` script (`tsc --noEmit`).
- The reformat: whitespace-only changes to every file Prettier covers.
- The fixes the new rules ask for: the 12 `!`, the 5 redundant assertions, `HeroCanvas.tsx:32` and `:36`.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- Behaviour. Apart from the fixes listed, every change is formatting or configuration.
- `churchix/`, `sites/*/docs-site/`, `sites/design-study/` (a study: no lint, no flag changes; it is formatted only if the owner asks), `dist/`, generated files.
- `sites/saloon/marketing/bots` source, except the lint fixes in step 4.
- The skills library and the `house-style` repo. A rule that seems wrong for Astro is reported back, not patched locally.

## What to do

One commit per step. Each step ends with `npm run build` and, once step 5 exists, `npm run check`.

1. **Measure first.** Record in the `log.md` entry: the `exactOptionalPropertyTypes` count per site; the typed-rule counts above with the final config (this brief's numbers are a starting point); `check:fast`'s time with one changed `.astro` file; the root lint time with and without the bots; whether `@vitest/eslint-plugin` is needed (it is not: no workspace uses vitest). A rule that finds more than about 20 real problems, or mostly false ones, goes back to the owner before it is turned on.
2. **Prettier, and the reformat.**
   1. Add `prettier` and `prettier-plugin-astro` as pinned devDependencies of the root. Config: `printWidth: 120`, `trailingComma: "all"`, the `astro` parser for `*.astro`.
   2. `.prettierignore`: `*.md`, `churchix/`, `sites/*/docs-site/`, `sites/saloon/marketing/bots/node_modules`, `package-lock.json`, `dist/`, `.astro/`, `public/`.
   3. Add `format` (`prettier --write .`) and `format:check`. Commit this alone.
   4. Run `npm run format`. Commit only that, as `style: format with Prettier`. Run it when no other brief has uncommitted work.
   5. Put that commit's full hash in `.git-blame-ignore-revs`, in its own commit. Hand the owner `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
3. **tsconfig and the type-check scripts.**
   - Add `erasableSyntaxOnly` and `noImplicitOverride` to the four live sites, and `noUncheckedIndexedAccess` to saloon and auto-service. Subcort and tractari stay off, with their counts (86 and 5) recorded for a later brief.
   - Add `"typecheck": "astro check"` to the five sites and `"typecheck": "tsc --noEmit"` to `packages/site-kit`. The root `typecheck` is `npm run typecheck --workspaces --if-present`, and `design-study` is included because it has 0 errors.
4. **ESLint.** Extend the vendored `house-style` config and add the Astro layer: `eslint-plugin-astro` recommended for `*.astro`, `project: true` there (the parser has no `projectService`), `projectService` for `.ts` and `.tsx`. Node globals for the `.mjs` scripts. Rules, against today (none):

   | Rule | After | Findings today |
   |---|---|---|
   | the six typed rules | error | 6 outside the bots tests: `HeroCanvas.tsx:32, 36`, five assertions; fix them |
   | `no-floating-promises` | error, with `node:test`'s `describe`, `it`, `test` allowed | 70 in the bots tests become 0 |
   | `@typescript-eslint/no-non-null-assertion` | error in source, warn in tests | 6 in source: fix; 6 in the bots tests: warn |
   | `no-restricted-syntax` on `TSEnumDeclaration` | error | 0 |
   | `no-warning-comments` (`todo`, `fixme`), pointing at `corpus/todos/` | error | 8 in the bots: move each to `corpus/todos/`, or reword the prose mentions |
   | `no-console` outside scripts and CLIs | error | 2 in the bots: use the bots' logger or list the file in `conventions.json` |
   | `no-default-export` outside `*.config.*` and `src/components/*.tsx` islands | error | 0 after the exceptions |
   | `better-tailwindcss` | absent | brief 04 adds it |

   Fix what the typed rules find, or list each finding left with its reason in the outcome note.
5. **The gate.** In the root `package.json`:
   - `check` runs `typecheck`, `lint`, `format:check`, `check:conventions`, and `saloon:bots` (the bots' `check`).
   - `check:conventions` runs the two convention checkers from the vendored library. `check-base-ui` runs `--warn-only` until brief 04 is done. `check-structure` is not used: the repo has no server.
   - `check:fast` runs `astro check` in the sites with changed files (against `HEAD`, plus untracked), then ESLint on the changed files. A small Node script in `scripts/` lists the changes. No shell-only syntax: the owner works on Windows under WSL.
   Time `check:fast` warm with one changed file, and `check` in full. Record both.
6. **`.claude/rules/sites.md`**, under about 40 lines, scoped by `paths: ["sites/*/src/**", "packages/site-kit/src/**"]`:
   - read the site's `PRODUCT.md` and `DESIGN.md`, and [wiki/site-patterns.md](../../wiki/site-patterns.md);
   - images by logical name through `src/content/images.ts` ([corpus/CLAUDE.md](../../CLAUDE.md), repo gotchas);
   - React only for islands, and Base UI only through the site's `ui/` wrappers (brief 04);
   - no analytics or third-party request before consent;
   - Romanian copy: do not run English prose skills over it;
   - the sites' public paths are sub-paths: URLs go through `@sites/kit`.
7. **`CLAUDE.md`** at the root, under about 60 lines: one line on what the repo is; "read [corpus/index.md](../../index.md) first"; the commands (`npm run <site>:dev`, `npm run check`, `npm run check:fast`, `npm run <site>:build`, the mock and real image modes); the places that mislead (the `dev` scripts set `PUBLIC_IMAGE_SOURCE=real`, `churchix/` is its own npm project, the bots live outside the workspaces); the Hard rules and brief-board sections moved out of [corpus/CLAUDE.md](../../CLAUDE.md).
8. **Corpus.** A [wiki/decisions.md](../../wiki/decisions.md) entry "The house style, formatted and checked, with Astro", a status line, a log entry. `bash corpus/lint.sh` until clean.

## Acceptance

- [ ] `npm run check` passes. Its run time and `check:fast`'s (warm, one changed file) are in the outcome note, and `check:fast` is under about 30 s.
- [ ] `npx prettier --check .` passes. The reformat is one commit, `git diff -w <hash>^ <hash>` shows nothing but formatting, and the hash is in `.git-blame-ignore-revs`.
- [ ] `grep -L erasableSyntaxOnly sites/{auto-service,saloon,subcort,tractari}/tsconfig.json` prints nothing, and `npm run typecheck` passes.
- [ ] `npx eslint .` reports 0 errors. The before and after counts per rule are in the outcome note, with each finding left and its reason.
- [ ] A deliberate `enum`, `!`, `console.log` in `sites/tractari/src/lib`, `// TODO` and a stray default export each fail `npm run lint`. Revert them after.
- [ ] `.claude/rules/sites.md` has `paths:` frontmatter. The root `CLAUDE.md` is under about 60 lines and names `npm run check`.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 04 adds `better-tailwindcss` and drops `check-base-ui`'s `--warn-only`.
- The reformat rewrites most `.astro` files. Briefs 05-08 start after it, so their diffs are formatted.
- Churchix's harness brief in `churchix/corpus` reuses this brief's Astro layer and measures its own counts.
