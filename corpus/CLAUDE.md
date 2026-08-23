# corpus/ — schema and conventions

This is an **LLM-maintained wiki** for the `presentation-sites` monorepo. The
human curates the sources and asks the questions; the LLM curates the synthesis
and tracks the work. It is the durable counterpart to the in-session `TodoWrite`
list.

**Read [`index.md`](index.md) first.**

## Layout

```
corpus/
  CLAUDE.md      this file
  index.md       generated catalog — `bash corpus/lint.sh --index`
  routing.md     how work routes (read by the orchestrate skill)
  lint.sh        health check; exits non-zero on failure
  log.md         chronological record of every meaningful change
  todos/         captured ideas as prose (pre-spec)
  briefs/        immutable task specs — todo/ done/ superseded/
  wiki/          the curated synthesis pages
```

## Retrieval budget (a rule, not advice)

1. Read `index.md`. Then read **at most 2–3 wiki pages**.
2. Needing more than three is a signal a page must split — not a licence to read
   more.
3. Never read `briefs/` or `todos/` wholesale. `wiki/status.md` holds the state.
4. Prefer a page's `summary:` line over opening the page.

## Page rules

- Every wiki page opens with exactly `summary:` and `updated:` frontmatter. The
  summary is written **for an agent deciding whether to open the page**.
- Standard relative markdown links, never `[[wikilinks]]`. From `wiki/`, code
  refs are `../../<site>/...`.
- Absolute dates (`2026-08-23`), never "yesterday".
- One concept per file; split past ~200 body lines.
- The wiki is **synthesis**, rewritten freely as understanding improves.
  Chronology belongs in `log.md`.

## Source-of-truth ordering

1. The **actual code** wins over any wiki claim.
2. A brief in `done/` wins over `wiki/` if the wiki hasn't caught up.
3. `decisions.md` wins over `status.md` for choices not formally revisited.
4. **A per-site doc wins over this corpus for that site's own detail** —
   `churchix/CLAUDE.md` governs `churchix/`, `saloon/corpus/` governs `saloon/`.
   This corpus owns the *monorepo* layer and links down; it must not duplicate
   per-site content.

Verify any path, function or command a page names before acting on it — pages
drift.

## Workflows

- **Capture** → `corpus/todos/<slug>.md`.
- **Promote** → `corpus/briefs/todo/<NN>-<slug>.md`. Numbers are stable; never
  renumber when a brief moves.
- **Complete** → move the brief verbatim to `briefs/done/`, append a `log.md`
  entry, fold durable findings into `wiki/`.
- **Lint** → `bash corpus/lint.sh`, then sweep by hand for contradictions and
  stale claims.
- **Never commit corpus changes unless the user asks.**

## Repo-specific gotchas

- Images resolve by **logical name** through `src/content/images.ts`. Grepping a
  filename will report a used image as unused. Check `gallery.ts` and the
  `gen-placeholders.mjs` generator too.
- Real business data (`src/content/site.local.ts`) and real photos
  (`public/images/real/*`) are **gitignored**. Never paste their contents into a
  corpus page.
- Most site content is **Romanian**. Don't run English prose/style skills over it.
