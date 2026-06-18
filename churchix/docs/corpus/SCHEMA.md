# Corpus schema — how this wiki works

This `docs/corpus/` directory is an **LLM-maintained wiki** for Churchix, modeled on Karpathy's [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). It is the durable, interlinked knowledge layer between raw sources (code, research, design files) and anyone — human or agent — asking a question. This file is the **schema**: the conventions every page follows and the workflows for keeping the corpus healthy. Read it before editing the corpus.

## Three layers

1. **Raw sources** — immutable inputs we read but don't rewrite in place: the codebase (`packages/`, `apps/`), the design system (`docs/design/`), the ADRs (`docs/adr/`), and the original research ([research-brief.md](research-brief.md), kept verbatim as an archive).
2. **The corpus** — the markdown pages in this directory. We own these entirely; they are synthesized and kept current.
3. **The schema** — this file. Conventions + workflows.

## Page conventions

- **One concept per page.** Pages are atomic and focused. If a page grows two distinct concepts, split it and cross-link.
- **kebab-case filenames**, `.md`. The filename is the page's stable id (used in links and the index).
- **Frontmatter on every page:**
  ```yaml
  ---
  title: Human-readable title
  summary: One line — what this page answers. Reused verbatim in index.md.
  status: living | stable | archive   # living = changes often; stable = settled; archive = historical, don't edit
  updated: 2026-05-29                   # ISO date of last meaningful change
  related: [architecture, donations]    # filenames (no .md) of closely-related pages
  ---
  ```
- **Cross-link liberally** using relative markdown links: `[architecture](architecture.md)`. Every page should link to its `related` pages somewhere in the body. A link to a page that doesn't exist yet is a valid TODO — note it, then create the page.
- **Cite raw sources** with repo-relative paths: `[siteSchema](../../packages/schemas/src/index.ts)`, `[ADR-0002](../adr/0002-tailwind-material3-design-system.md)`. Prefer linking the source over duplicating it.
- **Convert relative dates to absolute** ("today" → `2026-05-29`).
- **Money** in any example follows the project rule: integer minor units + explicit currency.

## The index and the log

- **[index.md](index.md)** — the catalog. One entry per page: link + the page's `summary` + status, grouped by category. Keep it in sync whenever a page is added/removed/renamed.
- **[log.md](log.md)** — append-only chronological record. Entry format:
  ```
  ## [YYYY-MM-DD] operation | short title
  one or two lines on what changed and why; link affected pages
  ```
  `operation` ∈ `ingest | edit | split | merge | rename | archive | lint | decision`. Newest at the top.

## Workflows

**Ingest** (new source: a research note, a decision, a design change)
1. Read the source.
2. Update every page it touches (expect to touch several) — synthesize, don't just append.
3. Add new atomic pages for genuinely new concepts; cross-link them.
4. Update [index.md](index.md) and append a `log.md` entry.

**Query** (answering a question from the corpus)
1. Start at [index.md](index.md); follow links.
2. Answer with citations to corpus pages (and through them, raw sources).
3. If the question surfaced a durable, reusable answer not yet captured, file it as a new page and log it.

**Lint** (periodic health check)
- Contradictions between pages, stale claims (check `updated` + verify against current code), orphan pages (in the dir but not in `index.md`, or unlinked), missing cross-references, and broken source links (a cited file/symbol that no longer exists).
- Record findings + fixes as a `lint` entry in `log.md`.

## Relationship to the rest of `docs/`

- **`docs/adr/`** — Architecture Decision Records. The *decision record* is the ADR; the corpus *summarizes and links* it (see [design-system.md](design-system.md), [decisions.md](decisions.md)). Don't duplicate an ADR's content into the corpus — link it.
- **`docs/todo/`** — active implementation work items (currently: integrating the design system). The corpus describes the *state and intent*; `docs/todo/` tracks the *work*. When a TODO lands, ingest its outcome into the relevant corpus page and log it.
- **`docs/design/`** — raw design system source (Stitch output + `DESIGN.md`). [design-system.md](design-system.md) is the corpus page that interprets it.
