# Real photos (git-ignored)

Drop the workshop's **real** photos here. Everything in this folder is
git-ignored (except this README and `.gitkeep`), so real photos never reach
GitHub, while the SVG placeholders in `../` (`public/images/`) stay committed as
a fallback.

Astro serves `public/` at the site root, so a file here is reachable at
`/images/real/<filename>`.

## How it works

Components reference images by a **logical name** through `img()`
([`src/content/images.ts`](../../../src/content/images.ts)). When the build runs
with `PUBLIC_IMAGE_SOURCE=real` (the default for `npm run dev` / `build`
production), a logical name listed in `HAS_REAL` resolves to
`/images/real/<name>.jpeg`; anything not listed falls back to the committed SVG
mock, so nothing 404s.

## To add a real photo

1. Save it here with the logical name + `.jpeg`, e.g.
   `public/images/real/hero.jpeg`, `gallery-01.jpeg`, …
   (the default extension is set in `images.ts › EXT.real`).
2. Make sure the logical name is in the `HAS_REAL` set in `images.ts`
   (`hero`, `gallery-01`…`gallery-06` are already listed).

Recommended shots for a BMW service: a BMW up on the lift, the diagnosis laptop
plugged in, an open engine bay, a finished brake/timing job, and the team. One
strong, well-lit photo beats five mediocre ones.

## Current placeholders (Unsplash)

The files currently here are **temporary stand-ins from Unsplash** (free under the
Unsplash License) so the site has photographic mock-ups before the real workshop
photos exist. Replace them with your own shots (same file names) when ready. Credits:

| File | Photographer (Unsplash) |
| --- | --- |
| `hero.jpeg` | Petr Urbanek — BMW M4 in a service bay |
| `gallery-01.jpeg` | Hyundai Motor Group — car on a lift |
| `gallery-02.jpeg` | Mehmet Talha Onuk — OBD diagnosis laptop |
| `gallery-03.jpeg` | Hoyoun Lee — open BMW M engine bay |
| `gallery-04.jpeg` | Toby Hall — brake disc & caliper |
| `gallery-05.jpeg` | Nazariy Kovalov — turbo engine detail |
| `gallery-06.jpeg` | Bharat Vishawakarma — mechanics team |

They are downloaded and served from our own origin (not hot-linked) so no visitor
IP is sent to Unsplash's CDN — same privacy reasoning as self-hosting fonts.

## Notes

- Prefer `.webp`/`.avif` for photos (smaller); if you do, change `EXT.real` in
  `images.ts`.
- These images ARE published on the live site; git-ignoring only keeps them out
  of the repo, not off the deployed page.
- On a fresh clone (or CI without the photos) the site falls back to the
  committed SVG placeholders, so the build always succeeds.
