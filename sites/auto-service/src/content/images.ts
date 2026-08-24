// This site's slice of the shared mock/real image pipeline — currently DORMANT.
//
// The "Bordcomputer" rebuild ships no photography (the owner confirmed none is
// coming), so nothing calls `img()` right now: the workshop is drawn in
// BayScene.astro, the gallery was removed rather than filled with stock, and
// the social card is a PNG built from scripts/og-card.html. This module stays
// as the seam: drop real photos in public/images/real/, list their logical
// names in `hasReal`, and call `img("name")` from a component.
//
// The logic lives in `@sites/kit`; what is site-specific is the data below —
// which logical names actually have a real photo. A name that is not listed
// falls back to its committed SVG mock even in a `real` build, so nothing 404s.
//
// Flip the source for a run with `PUBLIC_IMAGE_SOURCE=real` (see package.json).
// Real workshop photos live in public/images/real/ (git-ignored).
// Add a logical name here once the matching file is dropped in.

import { createImages } from "@sites/kit";

export { IMAGE_SOURCE } from "@sites/kit";

// The Bordcomputer rebuild ships NO photography: the owner confirmed none is
// coming, so the workshop is drawn (BayScene.astro) rather than faked with
// stock, and the photo gallery was removed instead of filled. Only the social
// card still resolves through here. If real photos ever arrive, add their
// logical names back to `hasReal` and the pipeline picks them up unchanged.
export const img = createImages({
  hasReal: [],
});
