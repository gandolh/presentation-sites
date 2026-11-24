# tavi: Tavi Ceasornicaru

An interactive wristwatch movement on warm paper, for Tavi, who loves clocks and watches and mends wristwatches. The
visitor winds it, slows it down and takes it apart, one chapter at a time. English, light only, drawn rather than
photographed. [PRODUCT.md](PRODUCT.md) says who it is for, [DESIGN.md](DESIGN.md) holds the locked system, and the
approved sketch is the repo's `design/tavi/`.

Astro 7 · React 19 islands · Base UI · Tailwind 4 · three.js for the 3D movement in chapter 5 · served under `/tavi`.

**Work in progress.** Today it is the page's frame: the header with its chapter links, the Chapters menu, the global
Pause and the chapter heads. The drawing, the chapters and the 3D movement come in the briefs after it; brief 20
finishes this README with the first screen.

## Run it

This site is an npm workspace: install once at the repo root (`npm install`). From the root:

```bash
npm run tavi:dev       # the dev server
npm run tavi:build     # the static build into sites/tavi/dist/
npm run tavi:preview   # serve the build
```

Build it for the sub-path the VPS serves:

```bash
PUBLIC_BASE=/tavi npm run tavi:build
```

The canonical and `og:url` use `PUBLIC_SITE` as the origin. Without it they fall back to `https://example.com`.

## Checks

`npm run check` at the root covers this site (typecheck, lint, format, conventions).
`SITES=tavi npx playwright test -c e2e` runs the shared Floor checks, the phone menu's spec and `e2e/tavi.spec.ts`;
the contrast check reads the built site, so run `npm run tavi:build` first.
