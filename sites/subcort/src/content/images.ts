// This site's slice of the shared mock/real image pipeline.
//
// The logic lives in `@sites/kit`; what is site-specific is the data below —
// which logical names actually have a real photo. A name that is not listed
// falls back to its committed SVG mock even in a `real` build, so nothing 404s.
//
// Flip the source for a run with `PUBLIC_IMAGE_SOURCE=real` (see package.json).
// Subcort is a DEMO site and ships the illustrated SVG mockups.
// There are no real photos yet — add names here as they arrive.

import { createImages } from "@sites/kit";

export { IMAGE_SOURCE } from "@sites/kit";

export const img = createImages({
  hasReal: [],
});
