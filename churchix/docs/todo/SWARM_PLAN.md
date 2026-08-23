# Swarm execution plan — design-system integration

How to run the 15 work items in [README.md](README.md) across a **swarm of parallel agents** without them colliding. Read [_conventions.md](_conventions.md) first — every agent inherits those rules.

The plan is a **controller-driven, gated fan-out**: a small number of items must land *serially* to create the foundation, then the bulk fans out wide, then a serial verification tail. Parallelism is bounded by two things — the **dependency tiers** (A→E) and **file-write collisions** between items that touch the same shared files.

---

## The controller

One **orchestrator agent** (or a `Workflow` script — see the bottom) owns the run. It never writes code itself; it only:

1. Spawns worker agents for the items whose dependencies are all `done`.
2. Each worker runs in an **isolated git worktree** (`isolation: "worktree"`) off the integration branch, so concurrent workers never share a working tree.
3. When a worker reports success, the controller **integrates** its branch (merge/cherry-pick onto `feat/design-system`), runs the **gate check** (`npm install && npm run typecheck --workspaces && npm run build --workspaces`), and only then unlocks dependents.
4. On a failed gate, the controller bounces the item back to a worker with the failure log (a self-heal step), it does **not** proceed to dependents.

Branch model: integration branch `feat/design-system`; each worker branches `ds/<item-id>` from the current integration head it was given.

---

## Concurrency tiers (the schedule)

Tiers run in order. Items **within** a wave run in parallel. The number is the TODO file.

### Wave 0 — Foundation gate (serial-ish, 2 agents max)

These define the contracts everything else imports; they must be correct before anything fans out.

| Run | Items | Why grouped |
| --- | ----- | ----------- |
| 0a (parallel ×3) | **01** Tailwind setup · **03** schema brand tokens · **04** icons/fonts | No deps; touch disjoint files (build config / `schemas/src` / font assets + `<Icon>`). |
| 0b (after 01) | **02** token contract | Needs Tailwind theme (01) to wire CSS vars into; touches `tokens.css` + `BaseLayout` + `tailwind` theme. |

**Gate G0:** after 01–04 land, a throwaway component using `bg-primary text-on-primary rounded-lg` + an `<Icon>` builds in both apps. **Nothing in Wave 1+ starts until G0 is green.** This is the one true bottleneck — spend care here.

### Wave 1 — Primitives gate (serial, 1 agent)

| Run | Item |
| --- | ---- |
| 1 | **05** primitives (Button, Card, Badge, Field, Alert, EmptyState, Divider) |

Every Tier-C page composes from these. Run it solo so the prop APIs are coherent. **Gate G1:** primitives render all variants and re-skin by token.

### Wave 2 — Page fan-out (WIDE parallel, up to 8 agents)

This is the payoff wave. After G1, items **06–13** are independent *in intent* but **collide on shared files**. Resolve collisions with worktree isolation + the ownership table below.

| Item | Primary files it owns | Shared files it must touch |
| ---- | --------------------- | -------------------------- |
| 06 header/footer | `Header.astro`, `Footer.astro`, `MobileNav.tsx` | — |
| 07 home | `Hero.astro`, `apps/*/pages/index.astro` | reuses `AnnouncementList`, `ServiceSchedule` (read-only) |
| 08 schedule | `ServiceSchedule.astro`, `apps/*/pages/program.astro` | — |
| 09 announcements | `AnnouncementList.astro`, `apps/*/pages/anunturi/*` | — |
| 10 donate | `GivingChannels.astro`, `apps/*/pages/donatii.astro` | places the campaign card from 11 |
| 11 campaign | `CampaignCard.astro` | consumed by 10 |
| 12 pomelnic | `PomelnicForm.tsx`, `apps/*/pages/pomelnice.astro` | — |
| 13 error/empty | new `ErrorLayout`/`NotFound`, `apps/*/404.astro` | uses 05 `EmptyState` (read-only) |

**Collision-avoidance rules for Wave 2:**

- Each worker gets its **own worktree** → no shared working directory.
- **Component ownership is exclusive.** Only one item edits a given component file. The table above assigns owners; if two items both want a file, the controller serializes them or splits the file first.
- **App page files (`apps/*/pages/*.astro`) are partitioned by page** — 07 owns `index`, 08 owns `program`, etc. No two workers edit the same page file.
- **`11 → 10` is a soft dependency**: build 11 (CampaignCard) and 10 (donate page, which *places* a campaign card) so that 10 imports 11's component by its agreed prop API. Give both workers the **same one-paragraph interface contract** up front (props: `campaign`, `variant: 'card'|'project'`). They can then build concurrently against the contract; integrate 11 first.
- Integrate Wave-2 branches **one at a time**, gating after each. If two trivially conflict (e.g. both added an import to a barrel file), the controller resolves the conflict, not the worker.

**Gate G2:** after all of 06–13 integrate, both apps build and typecheck; every page renders with the new components.

### Wave 3 — Rollout (serial, 1 agent)

| Run | Item |
| --- | ---- |
| 3 | **14** reference-app rollout + `contact`/`despre` restyle + second-brand proof + visual QA |

Touches both apps broadly and removes legacy `cx-*` styles → must be solo and after everything is integrated. **Gate G3:** full workspace build/typecheck green; second app renders in a distinct brand.

### Wave 4 — Hardening (serial, 1 agent)

| Run | Item |
| --- | ---- |
| 4 | **15** a11y (WCAG AA) + i18n/diacritics + long-string pass |

Cross-cutting audit + fixes across the now-complete system. **Gate G4 (final):** axe/Lighthouse clean on key pages; diacritics + keyboard verified; findings logged.

---

## Critical path & expected wall-clock

```
01 ─┐
    ├─► 02 ─► 05 ─► (06‖07‖08‖09‖10‖11‖12‖13) ─► 14 ─► 15
03 ─┤                         Wave 2 (wide)
04 ─┘
G0          G1        G2                          G3     G4
```

- Critical path length = **6 sequential stages** (01→02→05→Wave2→14→15), regardless of how many workers Wave 2 uses.
- Max useful concurrency = **8** (Wave 2). Waves 0a is 3-wide; everything else is 1–2 wide.
- So a swarm bigger than ~8 active workers buys nothing — size the pool to **8** and let it drain.

---

## Per-worker contract (what the controller hands each agent)

Every worker prompt includes:

1. **The item file** (e.g. `docs/todo/07-home-hero-sections.md`) — its scope, tasks, acceptance criteria.
2. **[_conventions.md](_conventions.md)** — the binding rules (no raw hex, tokens only, money/i18n/a11y, white-label).
3. **The integration head** it branches from (so it has the foundation from earlier waves).
4. **Its exclusive file-ownership list** (from the Wave-2 table) — "you may only edit these files; treat others as read-only."
5. **Any interface contract** it shares with a sibling (e.g. 10↔11 CampaignCard props).
6. **Definition of done:** typecheck + build green in its worktree, no raw hex/hardcoded church values, re-skins under a second brand, and a one-line [wiki/log.md](../wiki/log.md) entry.

Workers return a structured report: branch name, files changed, gate status in-worktree, and anything they had to stub.

---

## Failure handling

- **Worker fails its own in-worktree gate** → it self-heals (the item's acceptance criteria are the spec) before reporting; if stuck, it reports BLOCKED with the error and what it tried.
- **Integration gate fails** → controller reverts that item's merge, hands the failure log back to a fresh worker on that item, does not unlock dependents.
- **Two integrated branches conflict** → controller resolves mechanical conflicts (imports, barrels); semantic conflicts go back to the owning worker.
- **A foundation item (01/02/05) is wrong** → everything downstream is suspect; stop the wave, fix, re-gate before resuming.

---

## Optional: run it as a `Workflow`

This plan maps directly onto a `Workflow` script (deterministic gated fan-out). Sketch:

```
phase('Foundation')
await parallel([ ()=>agent(item01), ()=>agent(item03), ()=>agent(item04) ])   // 0a
await agent(item02)                                                           // 0b
// gate G0 here (build/typecheck) — abort wave on failure
phase('Primitives'); await agent(item05)                                      // gate G1
phase('Pages')
await parallel([06,07,08,09,10,11,12,13].map(n => ()=>agent(itemN, {isolation:'worktree'})))
// integrate + gate G2 between/after as the controller step
phase('Rollout');    await agent(item14)   // G3
phase('Hardening');  await agent(item15)   // G4
```

Note: a `Workflow` agent can't merge git branches itself, so either (a) keep workers on one integration branch and accept that worktree isolation + exclusive ownership prevents collisions, or (b) have the controller (you, in the main loop) do the merge+gate between waves and re-invoke the next phase. The **hybrid** — Workflow for each wave's fan-out, you integrating + gating between waves — is the most robust. Requires explicit opt-in (say "run the swarm workflow") since it spawns many agents.
