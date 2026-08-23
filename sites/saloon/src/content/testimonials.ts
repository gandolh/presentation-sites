export type Testimonial = {
  quote: string;
  author: string;
  rating: number;
};

// The Testimonials section is currently NOT rendered (commented out in
// src/pages/index.astro). It was hidden because it shipped invented quotes
// labelled "Exemplu" — advertising fake proof reads worse than no proof.
//
// To bring it back: replace the array below with REAL client reviews (e.g.
// Instagram DMs, Google reviews — with the client's first name + initial), then
// un-comment <Testimonials /> in index.astro. The component no longer adds any
// "example"/"illustrative" labelling, so only add entries that are genuine.
export const testimonials: Testimonial[] = [];
