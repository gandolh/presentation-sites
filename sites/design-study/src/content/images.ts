// This site's slice of the shared mock/real image pipeline (`@sites/kit`).
//
// Every theme addresses images by logical name — "photo-07", never a path — so
// the fourteen themes provably render the *same* photograph and differ only in
// how they treat it.
//
// `hasReal` is empty on purpose: the study ships with generated placeholders
// (`npm run design-study:placeholders`). Drop real photography into
// `public/images/real/<name>.jpeg`, list the names here, and build with
// PUBLIC_IMAGE_SOURCE=real. Anything not listed falls back to its placeholder,
// so a partial photo set never 404s.

import { createImages } from "@sites/kit";

export const img = createImages({
  hasReal: [],
  realExt: "jpeg",
  mockExt: "svg",
});
