# Task 02: Pin Base UI to 1.9.0 exactly in saloon

**Depends on:** nothing. This brief runs first.

**Runs before:** 03 and 04. Brief 04's checker reports rule 1 (pin exactly), and this brief makes it pass.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

On 2026-11-09 the owner decided that every web app uses Base UI at the latest stable version, **1.9.0**, pinned exactly with no `^`. The skills library's brief 02, *A Base UI skill, styled with Tailwind*, makes that its rule 1.

This repo is already on 1.9.0 everywhere. Only the range is wrong in one workspace. Nothing changes at runtime.

Read 2026-11-10, with `grep -n '"@base-ui/react"' sites/*/package.json packages/*/package.json` and `grep -n '"@base-ui/react": "' package-lock.json`:

| Workspace | Line | Spec |
|---|---|---|
| `sites/auto-service/package.json` | 21 | `1.9.0` |
| `sites/subcort/package.json` | 19 | `1.9.0` |
| `sites/tractari/package.json` | 17 | `1.9.0` |
| `sites/saloon/package.json` | 21 | **`^1.9.0`** |
| `sites/design-study`, `packages/site-kit` | | none (no Base UI) |

`package-lock.json` resolves `node_modules/@base-ui/react` to 1.9.0 (line 2320), and records saloon's range as `^1.9.0` at line 24819. The other three workspaces are recorded as `1.9.0` (lines 24709, 24873, 24928).

`churchix/` is a separate npm project with its own lockfile and its own corpus, so its pin is a brief there, not here.

Saloon's `package.json` has 16 caret ranges in all (`grep -c '"\^' sites/saloon/package.json`, read 2026-11-10); `sites/auto-service/package.json` has 2 (lines 23 and 29, a font and `animejs`), and the other sites have none. Pinning those is not part of this brief, because the owner's decision covers Base UI only. See decision 1.

## Owner decisions (defaults)

1. **Only Base UI is pinned.** Default: the other saloon dependencies keep their ranges. Subcort and tractari pin everything exactly, and auto-service all but two. *Repo question for the owner: pin all of saloon's 16 ranges, and auto-service's 2, the same way?* The lockfile already fixes the installed versions, so the change is free; it only stops a later `npm install` from moving them.

## Files you OWN

- `sites/saloon/package.json`: line 21 only.
- `package-lock.json`: the saloon range at line 24819, changed by npm.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `churchix/`, and every other `package.json`.
- Source files, and the installed version (1.9.0 stays).

## What to do

One commit.

1. **Pin.** In `sites/saloon/package.json` change `"@base-ui/react": "^1.9.0"` to `"@base-ui/react": "1.9.0"`.
2. **Lockfile.** From the repo root run `npm install --package-lock-only`. The diff must be the one saloon range line.
3. **Corpus.** Add the line to [wiki/status.md](../../wiki/status.md) and a [log.md](../../log.md) entry. Run `bash corpus/lint.sh` until it is clean.

## Acceptance

- [ ] `grep -rn '"@base-ui/react"' sites packages --include=package.json --exclude-dir=node_modules | grep -E '\^|~'` prints nothing.
- [ ] `grep -c '"@base-ui/react": "\^' package-lock.json` prints `0`.
- [ ] `git diff --stat HEAD~1` lists `sites/saloon/package.json` and `package-lock.json`, one changed line each, plus the corpus files.
- [ ] `npm ls @base-ui/react` shows only `1.9.0`, and `npm run saloon:build` passes.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 04's `check-base-ui` reports rule 1 as 0 findings once this is in.
- The Churchix corpus has its own pin brief for `packages/ui` (`@base-ui/react` `^1.9.0` at `churchix/packages/ui/package.json:25`).

## Outcome (2026-11-10)

Commit `chore(deps): pin @base-ui/react to 1.9.0 exactly in saloon`: `sites/saloon/package.json` and
`package-lock.json`, one changed line each. `npm ls @base-ui/react` shows only 1.9.0, the lockfile holds no
`^` range for it, and `npm run saloon:build` passes (4 pages). Nothing changes at runtime, so no deploy.
The owner question on pinning saloon's other ranges stays open.
