# Task 12 — churchix gets a corpus

## Context

From [open-questions.md](../../wiki/open-questions.md), answered by the owner on
2026-10-06: churchix adopts the corpus-flow lifecycle. The finished marketing
sites (saloon, auto-service) keep their plain `docs/` checklists.

churchix already works most of the way there:

- `churchix/docs/wiki/` is an LLM-maintained wiki with its own `SCHEMA.md`,
  `index.md`, `log.md` and `decisions.md`, plus nine topic pages.
- `churchix/docs/todo/` holds 17 numbered, self-contained work items
  (`01-tailwind-setup.md` … `17-audit-followups.md`), a `README.md` index with a
  dependency table, `_conventions.md` and `SWARM_PLAN.md`.
- `churchix/docs/adr/` holds ADRs (0002 supersedes 0001).

What it lacks: done/superseded folders (nothing records which items are built),
a lint, and the briefs-are-immutable rule.

## Files you OWN

- `churchix/corpus/` (new), and everything moved into it from `churchix/docs/wiki/`
  and `churchix/docs/todo/`
- `churchix/CLAUDE.md` (its pointer to the docs and the workflow)
- `churchix/docs-site/` only where it reads `docs/wiki/` or `docs/todo/` by path
- This repo's `corpus/wiki/status.md` row for churchix and
  `corpus/wiki/open-questions.md`

## Files you must NOT touch

- `churchix/docs/design/` (the Stitch reference screens and `DESIGN.md`) and
  `churchix/docs/adr/`. They stay where they are; the corpus links to them.
- Any app or package source.

## What to do

1. Run the corpus-flow bootstrap in `churchix/` (`corpus/` with `wiki/`,
   `briefs/{todo,done,superseded}/`, `todos/`, `log.md`, `index.md`,
   `routing.md`, `lint.sh`, `CLAUDE.md`). Use this repo's own `corpus/` as the
   model for conventions.
2. `git mv` `docs/wiki/*.md` into `corpus/wiki/`. Fold `SCHEMA.md` into
   `corpus/CLAUDE.md` rather than keeping two rule files; merge
   `docs/wiki/log.md` into `corpus/log.md`. Give every page `summary:` and
   `updated:` frontmatter.
3. For each of the 17 numbered items, check the code to see whether it is
   built. Move it with `git mv`, keeping its number, to `briefs/done/` (with a
   one-paragraph outcome note naming the evidence), `briefs/superseded/`, or
   `briefs/todo/`. Do not rewrite a brief's body.
4. `docs/todo/README.md`'s dependency table and `_conventions.md` become a wiki
   page (or fold into `corpus/CLAUDE.md`); `SWARM_PLAN.md` goes to `wiki/` if it
   is still a live plan, otherwise to `log.md` as history. Say which.
5. `ui-audit-2026-05-30.md` goes to `corpus/todos/` if its findings are not all
   covered by brief 17, otherwise to the log.
6. Fix every link the move breaks, in churchix and in this repo's corpus. Point
   `docs-site` at the new paths if it reads them.

## Acceptance

- `bash churchix/corpus/lint.sh` passes, and so does this repo's corpus lint.
- `churchix/docs/` holds only `design/` and `adr/`.
- Every one of the 17 items is in exactly one of todo/done/superseded, and each
  done one names its evidence.
- The churchix docs site builds, if it depends on the moved paths.

## Outcome (2026-10-07)

Done in `67ace22`. `churchix/corpus/` has this corpus's shape, and `bash churchix/corpus/lint.sh` passes; it adds a check that each brief sits in exactly one folder and carries its closing note. `churchix/docs/` holds only `design/` and `adr/`. Checked against the code (`astro check` 0 errors, 10 pages built), briefs 01 to 06 and 08 to 16 are done, 07 is superseded by the `70999ff` redesign, and 17 stays in todo; each moved brief names its evidence in a closing note. The judgment calls: the README's dependency table became the brief table in churchix's `wiki/status.md`, and `_conventions.md` became `wiki/conventions.md`. `SWARM_PLAN.md` and `ui-audit-2026-05-30.md` became churchix log entries, because the plan ran to the end on 2026-05-29 and brief 17 covers every finding the audit left open. Only the relative link targets in the moved brief bodies changed. `research-brief.md` had 229 body lines, so it split in two with its text unchanged. The docs site reads the new paths and builds 14 pages, one fewer than before because the UI audit now renders inside the change log. Left as they were, by this brief's rules: both ADRs still link `../wiki/` and `../todo/` (the docs site maps those links), and a comment in `apps/parohia-harlesti-bacau/src/pages/program.astro` names the old log path.
