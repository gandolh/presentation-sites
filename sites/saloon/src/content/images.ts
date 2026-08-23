// This site's slice of the shared mock/real image pipeline.
//
// The logic lives in `@sites/kit`; what is site-specific is the data below —
// which logical names actually have a real photo. A name that is not listed
// falls back to its committed SVG mock even in a `real` build, so nothing 404s.
//
// Flip the source for a run with `PUBLIC_IMAGE_SOURCE=real` (see package.json).
// Real photos of Ana's work live in public/images/real/ (git-ignored).
// Add a logical name here once the matching file is dropped in.

import { createImages } from "@sites/kit";

export { IMAGE_SOURCE } from "@sites/kit";

export const img = createImages({
  hasReal: [
    "hero",
    "ana-portrait",
    "gallery-01",
    "gallery-02",
    "gallery-03",
    "gallery-04",
    "gallery-05",
    "gallery-06",
  ],
});
