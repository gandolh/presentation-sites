# corpus/: schema and conventions

This is the **LLM-maintained wiki** and work tracker for Churchix, modeled on
Karpathy's [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
and the corpus-flow lifecycle. The human curates the sources and asks the
questions. The LLM curates the synthesis and tracks the work.

**Read [`index.md`](index.md) first.** The working brief for the code is
[`../CLAUDE.md`](../CLAUDE.md).

## Three layers

1. **Raw sources.** Read them, never rewrite them in place: the code
   (`../packages/`, `../apps/`), the design source
   ([`../docs/design/`](../docs/design/DESIGN.md)), the ADRs
   ([`../docs/adr/`](../docs/adr/)), and the original research brief, kept
   verbatim as an archive in two wiki pages
   ([part one](wiki/research-brief.md), [part two](wiki/research-brief-giving.md)).
2. **The wiki** (`wiki/`). Synthesis pages the LLM owns and rewrites freely.
3. **The rules.** This file and [`lint.sh`](lint.sh).

An ADR is the decision record. The wiki summarizes and links it and never
copies it. `docs/design/` and `docs/adr/` stay outside the corpus on purpose.

## Layout

```
corpus/
  CLAUDE.md      this file
  index.md       generated catalog: bash corpus/lint.sh --index
  routing.md     how work routes (read by the orchestrate skill)
  lint.sh        health check; exits non-zero on failure
  log.md         chronological record, newest last
  todos/         captured ideas as prose (pre-spec)
  briefs/        immutable task specs: todo/ done/ superseded/
  wiki/          the curated synthesis pages
```

## Retrieval budget (a rule, not advice)

1. Read `index.md`. Then read **at most 2 or 3 wiki pages**.
2. Needing more than three is a signal that a page must split or a summary is
   too vague. It is not a licence to read more.
3. Never read `briefs/` or `todos/` wholesale. `wiki/status.md` holds every
   brief's state in one line.
4. Prefer a page's `summary:` line over opening the page.

## Page rules

- Every wiki page opens with exactly `summary:` and `updated:` frontmatter. The
  summary is written **for an agent deciding whether to open the page**. Keep it
  to one line and avoid a colon followed by a space inside it.
- `updated:` is the date of the last meaningful change, as `YYYY-MM-DD`.
- kebab-case filenames. The filename is the page's id.
- Standard relative markdown links, never `[[wikilinks]]`. From `wiki/`, code is
  `../../packages/...` or `../../apps/...` and an ADR is `../../docs/adr/...`.
  Link a source rather than copying it.
- Absolute dates (`2026-05-29`), never "yesterday".
- One concept per file. Split past about 200 body lines and cross-link.
- Money in any example is integer minor units plus an explicit currency.
- The wiki is **synthesis**. Chronology belongs in `log.md`.

## Source-of-truth ordering

1. The **actual code** wins over any page.
2. An ADR wins over the wiki for the decision it records.
3. A brief in `done/` wins over the wiki if the wiki has not caught up.
4. `wiki/decisions.md` wins over `wiki/status.md` for choices not formally
   revisited.

Verify any path, function or command a page names before acting on it. Pages
drift.

## Briefs

- Named `NN-slug.md`. Numbers are stable and never reused. The next free number
  is in `wiki/status.md`.
- Every brief honors [`wiki/conventions.md`](wiki/conventions.md).
- A brief in `done/` or `superseded/` is **immutable**. Move it with `git mv`,
  keep its number, and never rewrite its body. At move time, append one
  paragraph: `## Outcome (YYYY-MM-DD)` naming the evidence (files, commits, the
  log entry, a build result), or `## Superseded (YYYY-MM-DD)` naming what
  replaced it.
- Briefs 01 to 17 were written in `docs/todo/` and moved here on 2026-10-07.
  Only their relative link targets were rebased so they resolve from the new
  folders; the text is as written.
- Their prose still names `docs/wiki/log.md`, which no longer exists. Read [`log.md`](log.md).

## Workflows

- **Capture** → `todos/<slug>.md`, prose, with `created:` and `status: open`.
- **Promote** → `briefs/todo/NN-slug.md` with Context, Files you OWN, Files you
  must NOT touch, What to do, and Acceptance. Add its line to `wiki/status.md`.
- **Complete** → `git mv` the brief to `briefs/done/`, append the outcome note,
  add a `log.md` entry, update its line in `wiki/status.md`, and fold durable
  findings into the wiki page they belong to.
- **Ingest** a source (research, a decision, a design change) → update every
  page it touches and synthesize rather than append. A new concept gets a new
  page. Then `bash corpus/lint.sh --index` and a `log.md` entry.
- **Query** → `index.md`, then at most three pages. Cite the pages. File a
  durable new answer as a page and log it.
- **Lint** → `bash corpus/lint.sh` (frontmatter, links, page size, abandoned
  paths, brief placement), then sweep by hand for contradictions and stale
  claims against the code. Log what you fixed as a `lint` entry.
- **Never commit corpus changes unless the user asks.**

## Churchix gotchas

- One app exists: `apps/parohia-harlesti-bacau`. Briefs and older log entries
  that name `parohia-berinta-maramures` predate its removal.
- Avoid bare `max-w-{sm,md,lg,xl}`. In this Tailwind theme they bind to the
  spacing scale and collapse layouts. The note is in
  `packages/ui/src/styles/theme.css`.
- Church-facing copy is Romanian. Do not run English prose skills over it.
- The docs site renders selected corpus pages. `../docs-site/scripts/sync-corpus.mjs`
  lists them by path, so a renamed or moved page must be updated there too.
