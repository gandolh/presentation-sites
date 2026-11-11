---
paths:
  - "sites/*/src/**"
  - "packages/site-kit/src/**"
---

# The sites (`sites/*/src`, `packages/site-kit/src`)

- Before a change, read the site's `PRODUCT.md` and `DESIGN.md`, and
  [corpus/wiki/site-patterns.md](../../corpus/wiki/site-patterns.md) before
  copying a fix from one site to another.
- Images resolve by logical name through the site's `src/content/images.ts`
  and `img()` from `@sites/kit`. Grepping a file name reports a used image as
  unused; check `gallery.ts` and the site's `scripts/gen-*.mjs` too. Subcort
  ships no photography: its graphics come from `src/lib/draft.ts`.
- Real business details (`src/content/site.local.ts`) and real photos
  (`public/images/real/`) are gitignored. Never copy them into the repo.
- Astro first. React only for an island that needs interactivity, hydrated
  through its default export (the one place a default export is allowed).
- Base UI only through the site's `src/components/ui/` wrappers. The four
  phone menus still import `@base-ui/react/dialog` directly until brief 04,
  so `check-base-ui` runs `--warn-only` until then.
- No analytics, embed or other third-party request before the visitor
  consents: auto-service's `MapConsent.tsx` loads Google Maps only on a click.
- The sites are served under sub-paths (`/saloon/` and the like). Every URL
  goes through `withBase()`, `absoluteUrl()` or `pagePath()` from
  `@sites/kit`, never a bare `/path`.
- The copy is Romanian. Don't run English prose or style skills over it.
- `is:inline` scripts ship as written: keep them small, and lint still
  checks them.
- `npm run check:fast` typechecks the sites you changed and lints the changed
  files; `npm run check` runs every site.
