export type Testimonial = {
  quote: string;
  author: string;
  car: string; // e.g. "BMW Seria 3 (F30)"
  rating: number;
};

// Empty by design. We do NOT ship invented quotes — advertising fake proof
// reads worse than no proof, and it's a misleading commercial practice under RO
// consumer law. Fill this with REAL reviews (Google, Facebook — with first name
// + initial and the car model) and then un-comment <Testimonials /> in
// src/pages/index.astro. Until then the section stays hidden.
export const testimonials: Testimonial[] = [];
