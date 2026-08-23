# Routing — how work routes in this project
<!-- Read by the orchestrate skill. Tune freely; keep it short. -->

**Implement skill:** plan-split-dispatch
**Review skill:** a general-purpose agent over the diff (no repo review command)
**PR skill:** propose git commands (no PR tooling wired; `gh` is available)
**Issue tracker:** none — work is captured in `corpus/todos/` and per-site `todo/` dirs
**Code host:** GitHub (`gh`) — `github.com/gandolh/presentation-sites`

**Scope note:** this corpus covers the **monorepo layer**. Work inside a single
site is usually a 1–2 file change routed inline; work inside `churchix/` should
read [`churchix/CLAUDE.md`](../churchix/CLAUDE.md) first, which governs that
subtree.

## Intent routing
| Signal | Intent | Route to |
|--------|--------|----------|
| New idea/task to capture | capture | corpus-flow: add todo |
| Ready to build, ≥3 chunks | build | brief → plan-split-dispatch |
| Ready to build, 1–2 files | build (small) | brief → implement inline |
| A change to one site's copy, content or a single component | build (small) | implement inline — most work here is this |
| Anything under `churchix/` | build | read `churchix/CLAUDE.md`, then brief → plan-split-dispatch |
| New site added to the monorepo | build | brief; follow the "Adding a new site" checklist in the root README |
| Research a topic / compare options | research | inline web search (gated — surface options, never auto-build) |
| "what should we work on" / audit / find the debt | audit | improve (gated — returns a ranked list) |
| Design or redesign a site / UI polish | design | impeccable (each site already has `DESIGN.md` + `PRODUCT.md`; `auto-service` also has `.impeccable/design.json`) |
| Accessibility / UI-compliance check on code | design (check) | web-design-guidelines |
| Docs or prose need a style pass | docs | writing-guidelines (+ unslop if AI-drafted) |
| Romanian marketing/legal copy | docs | edit inline — do **not** run English prose skills over it |
| Need a diagram | docs | diagram-design |
| Branch ahead, ship intent | PR open | propose git commands |
| "what do we call this" / record a decision | domain | corpus-flow §9 |
| "what does the wiki say about X" | query | corpus-flow: query wiki |

## Knowledge routing — which layer answers which question
| Question shape | Route to |
|---|---|
| "Why is it built this way?" / "what was decided?" | `corpus/wiki/` (start at `index.md`; budget: ≤3 pages) |
| "What's the state of site X?" | that site's own `STATUS.md` / `PRODUCT.md`, linked from `wiki/status.md` |
| "How does churchix work?" | `churchix/CLAUDE.md`, then `churchix/docs/corpus/index.md` |
| "Who calls X?" / "where does feature Y live?" | `grep` — no code graph is bootstrapped, and the sites are small enough |
| **"Did I get _every_ usage?"** (rename/refactor/delete) | **`grep -rnw`**, scoped to the one site directory |
| "Is this image/asset actually used?" | `grep` the **logical name**, not the filename — images resolve through `src/content/images.ts` |
| "Does it still build at its sub-path?" | run it: `PUBLIC_BASE=/<site> npm run <site>:build` |

## READ / SKIP / SKILLS
| Task type | READ | SKIP | SKILLS |
|-----------|------|------|--------|
| Site content/copy change | the one site's `src/content/*.ts`, the target component | every other site, `corpus/wiki/` | — |
| Site design change | that site's `DESIGN.md` + `PRODUCT.md`, `src/styles/global.css` | other sites, `marketing/` | impeccable |
| Cross-site / monorepo change | `corpus/wiki/architecture.md`, `corpus/wiki/decisions.md`, root `package.json`, root `README.md` | site internals | — |
| Image / placeholder work | that site's `src/content/images.ts`, `gallery.ts`, `<site>/scripts/gen-*.mjs` (subcort: `src/lib/draft.ts`, no photos) | components | — |
| churchix work | `churchix/CLAUDE.md`, the relevant `churchix/docs/corpus/*.md` | every other site | — |
| saloon bots work | `sites/saloon/marketing/bots/README.md`, `COMPLIANCE.md`, `src/core/types.ts` | the Astro site | — |
