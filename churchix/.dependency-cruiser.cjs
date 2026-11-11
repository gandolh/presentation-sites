// The house dependency-cruiser preset, from the vendored house-style copy: no cycles, no unresolvable
// imports, a feature used through its index only, no Fastify in lib/. It reads .ts, .tsx and .mjs files;
// it can't parse .astro, so imports made from .astro files are outside its graph.
module.exports = {
  extends: "./vendor/house-style/.dependency-cruiser.cjs",
};
