# Real photos (git-ignored)

Drop the salon's **real** photos here. Everything in this folder is git-ignored
(except this README and `.gitkeep`), so real photos never reach GitHub — while
the SVG placeholders in `../` (`public/images/`) stay committed as a fallback.

Astro serves `public/` at the site root, so a file here is reachable at
`/images/real/<filename>`.

## How to switch a placeholder to a real photo

1. Save the photo here, e.g. `public/images/real/hero.webp`.
2. Point the reference at it:
   - **Gallery / before-after** — edit the `src` values in
     [`src/content/gallery.ts`](../../../src/content/gallery.ts), e.g.
     `/images/gallery-01.svg` → `/images/real/gallery-01.webp`.
   - **Hero** — `src="/images/hero.svg"` in
     [`src/components/Hero.astro`](../../../src/components/Hero.astro).
   - **Portrait** — `src="/images/ana-portrait.svg"` in
     [`src/components/About.astro`](../../../src/components/About.astro).
   - **OG / social preview** — `/images/og-image.svg` in
     [`src/layouts/Base.astro`](../../../src/layouts/Base.astro) (3 spots).

## Notes

- Prefer `.webp` (or `.avif`) for photos — smaller than JPG/PNG at equal quality.
- These images ARE published on the live site; git-ignoring only keeps them out
  of the repo, not off the deployed page.
- On a fresh clone (or CI without the photos) the site falls back to the
  committed SVG placeholders, so the build always succeeds.
