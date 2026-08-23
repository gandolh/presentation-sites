# Real photos (git-ignored)

This is a **demo / concept** site, so it ships the committed illustrative SVG
mockups in `public/images/` by default. There are no real photos.

If real photography ever becomes available, drop the files here using the same
logical base names referenced in `src/content/images.ts` (e.g. `hero.jpeg`,
`gallery-01.jpeg`), register each name in the `HAS_REAL` set, and build with:

    PUBLIC_IMAGE_SOURCE=real npm run build

Everything in this directory except `.gitkeep` and this README is git-ignored,
so real files never reach the repo — but note they WOULD be published in the
static output if you deploy a `real` build.
