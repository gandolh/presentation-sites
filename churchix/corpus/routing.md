# Routing: how work routes in churchix
<!-- Read by the orchestrate skill. Tune freely; keep it short. -->

**Implement skill:** plan-split-dispatch
**Review skill:** a general-purpose agent over the diff (no repo review command)
**PR skill:** propose git commands (no PR tooling wired; `gh` is available)
**Issue tracker:** none. Work is captured in `corpus/todos/` and specced in `corpus/briefs/`.
**Code host:** GitHub (`gh`), `github.com/gandolh/presentation-sites`. churchix is
the `churchix/` folder of that repo, not a repo of its own.

**Scope note:** this corpus covers `churchix/` only. The monorepo layer above it
has its own corpus at [`../../corpus/`](../../corpus/index.md). Read
[`../CLAUDE.md`](../CLAUDE.md) before touching code here.

## Intent routing
| Signal | Intent | Route to |
|--------|--------|----------|
| New idea/task to capture | capture | corpus-flow: add todo |
| Ready to build, 3 or more chunks | build | brief → plan-split-dispatch |
| Ready to build, 1 or 2 files | build (small) | brief → implement inline |
| A change to `@churchix/ui` | build | brief; honor [`wiki/conventions.md`](wiki/conventions.md); verify the app builds and re-skins by token swap |
| A new church | build | a new directory under `apps/`, never a central config change ([`wiki/independence-model.md`](wiki/independence-model.md)) |
| Giving, money or payments | build | read [`wiki/donations.md`](wiki/donations.md) first; card data never touches our code |
| Research a topic / compare options | research | inline web search (gated: surface options, never auto-build) |
| "what should we work on" / audit | audit | improve (gated: returns a ranked list) |
| Design or redesign a page / UI polish | design | impeccable (`../DESIGN.md` + `../PRODUCT.md` at the churchix root) |
| Accessibility / UI-compliance check | design (check) | web-design-guidelines |
| English docs need a style pass | docs | writing-guidelines (+ unslop if AI-drafted) |
| Romanian church-facing copy | docs | edit inline; do **not** run English prose skills over it |
| Need a diagram | docs | diagram-design; docs-site diagrams live in `../docs-site/diagrams/` |
| "what do we call this" / record a decision | domain | corpus-flow; decisions in [`wiki/decisions.md`](wiki/decisions.md), architecture records in `../docs/adr/` |
| "what does the wiki say about X" | query | corpus-flow: query wiki |

## Knowledge routing: which layer answers which question
| Question shape | Route to |
|---|---|
| "Why is it built this way?" / "what was decided?" | `corpus/wiki/` (start at `index.md`; budget: 3 pages at most), then the ADRs |
| "What state is the work in?" | [`wiki/status.md`](wiki/status.md) |
| "What does the design call for?" | `../docs/design/DESIGN.md` and the Stitch screens, via [`wiki/design-system.md`](wiki/design-system.md) |
| "Who calls X?" / "where does feature Y live?" | `grep`; no code graph is bootstrapped and the packages are small |
| **"Did I get _every_ usage?"** (rename/refactor/delete) | **`grep -rnw packages apps`** |
| "Does it still build?" | run it: `npm run typecheck -w apps/parohia-harlesti-bacau` and `npm run build -w apps/parohia-harlesti-bacau` |
| "Do the docs still build?" | `npm run docs -w docs-site` |

## READ / SKIP / SKILLS
| Task type | READ | SKIP | SKILLS |
|-----------|------|------|--------|
| Shared component change | the component, [`wiki/conventions.md`](wiki/conventions.md), `packages/ui/src/styles/tokens.css` + `theme.css` | `research-brief*` | impeccable for visual work |
| Church app page change | the page under `apps/<church>/src/pages/`, its content collection | other apps | none |
| Content schema change | `packages/schemas/src/index.ts`, [`wiki/content-model.md`](wiki/content-model.md) | components | none |
| Giving change | [`wiki/donations.md`](wiki/donations.md), `GivingChannels.astro`, `PomelnicForm.tsx` | [`wiki/optional-backend.md`](wiki/optional-backend.md) unless adding a backend | none |
| Docs-site change | `../docs-site/scripts/sync-corpus.mjs`, `../docs-site/astro.config.mjs` | the generated `src/content/docs/wiki/` | none |
