# packages/ — the shared core library

Reusable, church-agnostic code shared across every site and service. **Nothing here may contain per-church values** (no church names, colors, content). Branding enters only as design tokens consumed at runtime.

Planned packages:

| Package | Name | Purpose |
| --- | --- | --- |
| `ui/` | `@churchix/ui` | Astro components (static) + React islands (interactive), shared layouts, the design-token CSS, the donation widget. |
| `schemas/` | `@churchix/schemas` | Zod schemas for Astro Content Collections (Sermon, Event, Staff, Ministry, Page, Announcement, ServiceSchedule, site config) + shared API types. **One source of truth** imported by every church and the API. |
| `config/` | `@churchix/config` | Base `astro.config`, base `tsconfig`, shared lint/format config, the `mergeConfig` helper for per-site composition. |

Consumed from apps via `"@churchix/ui": "*"` (npm workspaces symlink).

**Key constraint:** keep `react` / `react-dom` as **peerDependencies** in `@churchix/ui` — duplicate React copies break island hydration and hooks. Each consuming app registers `@astrojs/react` itself (Astro integrations are per-app, not inherited).

See [../docs/wiki/architecture.md](../docs/wiki/architecture.md).
