// The house dependency-cruiser preset, from the vendored house-style copy: no cycles, no unresolvable
// imports, a feature used through its index only, no Fastify in lib/. It reads .ts, .tsx and .mjs files;
// it can't parse .astro, so imports made from .astro files are outside its graph.
module.exports = {
  extends: "./vendor/house-style/.dependency-cruiser.cjs",
  forbidden: [
    {
      // The house rule of the same name, which replaces it here: Astro's `astro:` modules (`astro:content`)
      // are made at build time, like a Vite `virtual:` id.
      name: "not-to-unresolvable",
      severity: "error",
      comment: "An import that cannot be resolved is an edge every other rule here misses.",
      from: {},
      to: { couldNotResolve: true, pathNot: "^(virtual|astro):" },
    },
  ],
};
