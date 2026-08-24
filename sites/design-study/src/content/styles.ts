// The canonical list of design styles this study covers.
//
// This is the single source of truth for routing: every page under
// `/[theme]/` is generated from this array, and `src/themes/registry.ts`
// must have an entry for each `slug` here or the build fails loudly.
//
// Order is deliberate — it walks from the most reductive to the most
// simulated, so the landing gallery reads as an argument rather than an
// alphabetical dump.
//
// The prose here is editorial (it appears on the landing gallery). The full
// analysis of each style lives in `docs/styles/<slug>.md`.

export type StyleSlug =
  | "minimalism"
  | "swiss"
  | "brutalism"
  | "neo-brutalism"
  | "maximalism"
  | "surrealism"
  | "bohemian"
  | "ethereal"
  | "skeuomorphism"
  | "neumorphism"
  | "claymorphism"
  | "glassmorphism"
  | "liquid-glass"
  | "spatial";

export type Style = {
  slug: StyleSlug;
  /** Display name, as written on the gallery card and the switcher. */
  name: string;
  /** When the style formed, or peaked. Shown as a small caption. */
  era: string;
  /** One line, for the gallery card. Present tense, no hedging. */
  blurb: string;
};

export const styles: Style[] = [
  {
    slug: "minimalism",
    name: "Minimalism",
    era: "1960s — ongoing",
    blurb:
      "Remove until only the argument is left. Space does the work that decoration would have done.",
  },
  {
    slug: "swiss",
    name: "Swiss Design",
    era: "1950s Basel & Zürich",
    blurb:
      "The grid is the design. Objective typography, flush-left, ranged on a baseline nobody is allowed to break.",
  },
  {
    slug: "brutalism",
    name: "Brutalism",
    era: "Web, c. 2014",
    blurb:
      "Unstyled HTML as a position. Default fonts, raw links, visible structure, zero comfort.",
  },
  {
    slug: "neo-brutalism",
    name: "NeoBrutalism",
    era: "c. 2020",
    blurb:
      "Brutalism after it got a colourist. Hard black outlines, flat offset shadows, primary blocks that shout.",
  },
  {
    slug: "maximalism",
    name: "Maximalism",
    era: "c. 2018 — ongoing",
    blurb:
      "More, deliberately. Clashing type, layered pattern, saturated collage — abundance treated as a design system.",
  },
  {
    slug: "surrealism",
    name: "Surrealism",
    era: "1924 — ongoing",
    blurb:
      "The layout dreams. Impossible scale, floating cutouts, elements that escape the frame they were given.",
  },
  {
    slug: "bohemian",
    name: "Bohemian",
    era: "c. 2015 — ongoing",
    blurb:
      "Handmade warmth. Terracotta and clay, arch shapes, paper grain, type that looks written rather than set.",
  },
  {
    slug: "ethereal",
    name: "Ethereal",
    era: "c. 2021",
    blurb:
      "Light with the edges taken off. Bloom, low contrast, thin serifs, everything one step from dissolving.",
  },
  {
    slug: "skeuomorphism",
    name: "Skeuomorphism",
    era: "2007 — 2013",
    blurb:
      "Pixels pretending to be objects. Stitched leather, bevels, gloss, and a drop shadow under everything.",
  },
  {
    slug: "neumorphism",
    name: "Neumorphism",
    era: "2019",
    blurb:
      "One surface, extruded. Twin light and dark shadows push controls out of the background — or press them in.",
  },
  {
    slug: "claymorphism",
    name: "Claymorphism",
    era: "2021",
    blurb:
      "Inflated and friendly. Huge radii, pastel fills, a puffy double shadow that reads as modelling clay.",
  },
  {
    slug: "glassmorphism",
    name: "Glassmorphism",
    era: "2020",
    blurb:
      "Frosted panes stacked in depth. Background blur and a hairline highlight stand in for hierarchy.",
  },
  {
    slug: "liquid-glass",
    name: "Liquid Glass",
    era: "Apple, 2025",
    blurb:
      "Glass that bends light. Real-time refraction, specular highlights that track motion, chrome that morphs.",
  },
  {
    slug: "spatial",
    name: "Spatial UI",
    era: "visionOS, 2023",
    blurb:
      "Flat surfaces given a z-axis. Panels float at measured depths, lit by an ambient room that is not there.",
  },
];

/** Fast lookup used by the routes and the theme switcher. */
export const styleBySlug = new Map<string, Style>(
  styles.map((s) => [s.slug, s]),
);

/**
 * The previous/next style in gallery order, wrapping at both ends so the
 * switcher never dead-ends.
 */
export function neighbours(slug: string): { prev: Style; next: Style } {
  const i = styles.findIndex((s) => s.slug === slug);
  if (i === -1) throw new Error(`Unknown style slug: ${slug}`);
  const prev = styles[(i - 1 + styles.length) % styles.length]!;
  const next = styles[(i + 1) % styles.length]!;
  return { prev, next };
}
