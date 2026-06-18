// The five live marketing sites — the subject of the gallery. Each renders as
// one row of `ls ./projects` output: an [NN] index, a screenshot plate, the
// name, a one-liner, code-styled stack tags, and a link to the live site.
//
// Screenshots are placeholders for now at /shots/<slug>.png. Drop a real
// capture in at the same path and it appears with zero code changes.

export interface Project {
  /** Two-digit listing index, e.g. "01". This is an honest `ls` ordinal. */
  index: string;
  /** Directory slug = the live sub-path on the VPS (without leading slash). */
  slug: string;
  /** Display name shown as the entry title. */
  name: string;
  /** One-line descriptor (stdout comment). */
  blurb: string;
  /** Stack tags, rendered like `[astro react tailwind]`. */
  stack: string[];
  /** Image dimensions drive the plate aspect ratio (avoids layout shift). */
  shotWidth: number;
  shotHeight: number;
}

export const projects: Project[] = [
  {
    index: "01",
    slug: "saloon",
    name: "Ana Saloon",
    blurb: "Boutique nail salon, Târgu-Jiu",
    stack: ["astro", "react", "tailwind"],
    shotWidth: 1600,
    shotHeight: 1000,
  },
  {
    index: "02",
    slug: "subcort",
    name: "Subcort",
    blurb: "Event-tent rental, Oltenia",
    stack: ["astro", "react", "tailwind"],
    shotWidth: 1600,
    shotHeight: 1000,
  },
  {
    index: "03",
    slug: "auto-service",
    name: "BavAuto Gorj",
    blurb: "BMW-specialist auto service",
    stack: ["astro", "tailwind"],
    shotWidth: 1600,
    shotHeight: 1000,
  },
  {
    index: "04",
    slug: "tractari",
    name: "AXA Tractări",
    blurb: "Car towing, Three.js night-road hero",
    stack: ["astro", "react", "three.js"],
    shotWidth: 1600,
    shotHeight: 1000,
  },
  {
    index: "05",
    slug: "churchix",
    name: "Churchix",
    blurb: "White-label giving sites for Orthodox churches",
    stack: ["astro", "react", "tailwind", "fastify"],
    shotWidth: 1600,
    shotHeight: 1000,
  },
];
