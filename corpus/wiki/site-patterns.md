---
summary: The as-built patterns several sites share, from the 2026-09-27 improvements audit fixes (2026-10-01/02) and later rounds. Social cards as screenshotted HTML, opening hours from one HOURS list, the phone menus on Base UI and how a link closes them, pausing a WebGL hero off-screen, design-study's carousel keys, the saloon bots webhook body cap, and the dependency hygiene rules (no dead Vite overrides, audit at the root and in churchix). Read before copying a fix from one site to another.
updated: 2026-11-12
---

# Patterns the sites share

Each site's own docs win for its own detail; this page records what was done
the same way in several of them, and why. The calls behind them are in
[decisions.md](decisions.md) and [decisions-ui.md](decisions-ui.md).

## Social cards

Each card is an HTML page screenshotted by headless Chrome at 1200×630 in the
site's own self-hosted faces (from the root `node_modules`) and stored as a
palette PNG at `public/images/og-image.png`, well under 300 KB. The source is
`sites/<site>/scripts/og-card.html`; subcort's is written by
`scripts/gen-og.mjs` (`npm run subcort:og`) from the same marquee drawing as
the site, and fails unless the result is 1200×630. `sharp` alone was ruled
out: librsvg would set the type in a fallback face, since the brand faces
aren't installed system-wide. Check ă â î ș ț in the brand face after a
change: on tractari the breve on "PLATFORMĂ" hit the line above until the
headline lines were spaced.

`og:image`, `twitter:image` and the JSON-LD `image` all point at
`absoluteUrl("/images/og-image.png")` (`packages/site-kit/src/url.ts`), never
through `img()`. A page's `path` defaults to `pagePath(Astro.url.pathname)`, so
each legal page is its own canonical, not the home page's.

## Opening hours

saloon and auto-service declare `HOURS: OpeningHours[]` once in
`src/content/site.ts` (`{ label, days, opens, closes }` or `closed: true`).
The contact table, auto-service's footer and readout ("L–V 08:00–18:00 · Sâ
09:00–14:00") and the JSON-LD `openingHoursSpecification` are derived from the
merged `site.hours`. `SiteOverridesOf` replaces arrays wholesale, so a local
override replaces the whole schedule. No `.astro` file holds a time.

## Phone menus

Since 2026-11-12 the four `MobileMenu.tsx` islands (saloon, auto-service,
subcort, tractari) are Base UI `Drawer`s through each site's own
`src/components/ui/Drawer.tsx` (four near-identical copies: shared tooling,
no shared UI). The wrapper holds the panel's motion; the island passes the
panel's look as classes. Base UI does the focus trap, Esc, scroll lock, focus
return and the swipe.

- The panel closes on a swipe up, a tap outside, its X or Esc. `swipeDirection`
  is `up` in all four: the panel hangs from the top edge. A mouse drag does
  not swipe, only touch does; test it with touch events through the protocol
  (`e2e/mobile-menu.spec.ts`).
- Motion is CSS on state attributes: the popup fades in and drifts down 12 px
  (`data-starting-style`), follows a swipe through `--drawer-swipe-movement-y`,
  and each link rises in turn through `group-data-starting-style:` with a
  delay from its `--i` index. All of it sits under `motion-safe:`. subcort's
  Motion choreography is gone from the menu; `motion` stays for `TentScale`.
- A nav link closes the menu through a `leftByLink` ref, so focus goes where
  the link went instead of back to the burger (saloon, auto-service,
  tractari).
- saloon, auto-service and tractari portal to `<body>`: the open menu is a
  full-screen panel, covering the whole page, demo banner and call dock
  included. There is no page outside it to tap.
- subcort portals into its header: the header's `backdrop-filter` makes it the
  containing block of a fixed child, and the header sits under the demo banner
  until the page scrolls, so the panel must be placed against the header, not
  the screen. Its viewport starts at `--nav-h` and is clipped so a swipe never
  paints over the header; a transparent `Drawer.Backdrop` below it catches the
  tap outside. The menu button is the X: while the drawer is open the page
  behind is inert, so a press on it is a press outside.
- The islands load `client:load`, about +30 kB gzip a site on every page
  ([decisions-ui.md](decisions-ui.md)).

## A WebGL hero off-screen

tractari's `HeroCanvas.tsx`: the IntersectionObserver cancels the pending frame
and zeroes it when the hero leaves view, and restarts only when it is back and
the tab is visible. The loop itself returns without rescheduling when not
visible or `document.hidden`, so a frame already in flight can't re-arm it.
Measured 2026-10-01: zero frames while scrolled away. With reduced motion the
scene chunk isn't even requested.

## design-study's arrow keys

`sites/design-study/src/components/carousel-keys.ts` gives every carousel the
tabs keyboard model once: a roving tabindex on the dots, ← → Home End, each
`preventDefault()`ed. It is its own module so the spatial carousel (no Embla)
doesn't pull Embla in. The theme switcher's arrow and bracket stepping skips
an event already `defaultPrevented` or aimed at a link, button, summary, tab or
carousel; that guard sits **below** the `G` handler so `G` still opens the
picker from a focused link.

## The saloon bots webhook

`sites/saloon/marketing/bots/src/core/webhook-http.ts` caps a body at 1 MiB
(`MAX_BODY_BYTES`). It answers 413 with `connection: close` before reading
when `content-length` is over, and as soon as the count passes otherwise;
chunks are decoded once so a split character survives. Headers time out at
10 s, the request at 15 s. Do this before any live wiring.

## Dependency hygiene

- Run `npm audit` at the root **and** in `churchix/`, which has its own
  lockfile.
- No per-site `"vite"` devDependency or override: Astro brings its own Vite,
  and an override breaks a site lifted out of the workspace.
- Root scripts select a site's workspace by package name (`ana-saloon`,
  `bavauto-gorj`, …), so the nested docs-site never matches too;
  `saloon:bots` alone keeps `--prefix` ([architecture.md](architecture.md)).
