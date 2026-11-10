# Task 02: Pin Base UI to 1.9.0 exactly in `@churchix/ui`

**Depends on:** nothing. This brief runs first in Churchix.

**Runs before:** 03 and 04. Brief 04's checker reports rule 1 (pin exactly), and this brief makes it pass.

**Before you start:** run `brief-board guide`, passing `--project churchix` to its commands ([corpus/CLAUDE.md](../../CLAUDE.md), "brief-board").

## Context

On 2026-11-09 the owner decided that every web app uses Base UI at the latest stable version, **1.9.0**, pinned exactly with no `^`. The skills library's brief 02, *A Base UI skill, styled with Tailwind*, makes that its rule 1.

Churchix is already on 1.9.0. Only the range is wrong. Read 2026-11-10, with `grep -rn '"@base-ui/react"' --include=package.json apps packages services docs-site` and `grep -n '"@base-ui/react": "' package-lock.json`:

- `packages/ui/package.json:25` has `"@base-ui/react": "^1.9.0"`. It is the only declaration in Churchix.
- `package-lock.json:2362-2363` resolves `node_modules/@base-ui/react` to `1.9.0`, and `package-lock.json:24189` records the `^1.9.0` range for `packages/ui`.

Churchix is a separate npm project with its own lockfile. The root corpus's brief 02 (the same pin for the saloon site) does not touch it.

`packages/ui/package.json` has caret ranges on its other dependencies too (`@fontsource-variable/inter`, `@fontsource-variable/source-serif-4`, `@fontsource/cardo`, and the two `@churchix/*` entries use `*`). The owner's decision covers Base UI only.

## Owner decisions (defaults)

1. **Only Base UI is pinned.** Default: the fonts keep their ranges. *Repo question for the owner: pin them too?* The lockfile already fixes the installed versions.

## Files you OWN

- `packages/ui/package.json`: line 25 only.
- `package-lock.json` (in `churchix/`): the one range, changed by npm.
- Corpus: [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).

## Files you must NOT touch

- Any other `package.json`, the source, and the installed version.

## What to do

One commit.

1. In `packages/ui/package.json` change `"@base-ui/react": "^1.9.0"` to `"@base-ui/react": "1.9.0"`.
2. From `churchix/` run `npm install --package-lock-only`. The diff must be the one range line.
3. Add the line to [wiki/status.md](../../wiki/status.md) and a [log.md](../../log.md) entry. Run `bash corpus/lint.sh` until it is clean.

## Acceptance

- [ ] `grep -rn '"@base-ui/react"' apps packages services --include=package.json | grep -E '\^|~'` prints nothing.
- [ ] `grep -c '"@base-ui/react": "\^' package-lock.json` prints `0`.
- [ ] `git diff --stat HEAD~1` lists `packages/ui/package.json` and `package-lock.json`, one changed line each, plus the corpus files.
- [ ] `npm ls @base-ui/react` shows only `1.9.0`, and `npm run build` passes.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 04 reports rule 1 as 0 findings once this is in.

## Outcome (2026-11-10)

Commit `chore(deps): pin @base-ui/react to 1.9.0 exactly in @churchix/ui`: `packages/ui/package.json` and
`package-lock.json`, one changed line each. `npm ls @base-ui/react` shows only 1.9.0, the lockfile holds no `^`
range for it, and `npm run build` passes (10 pages). Nothing changes at runtime, so no deploy. The owner question
on pinning the fonts stays open.
